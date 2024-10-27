import { kv } from '@vercel/kv';

// Theme configurations
const THEMES = {
default: {
labelBg: '#444D56',
countBg: '#007EC6',
textColor: '#fff',
gradient: true,
style: 'flat'
},
flat: {
labelBg: '#555555',
countBg: '#4C1',
textColor: '#fff',
gradient: false,
style: 'flat'
},
plastic: {
labelBg: '#555555',
countBg: '#007EC6',
textColor: '#fff',
gradient: true,
style: 'plastic'
},
social: {
labelBg: '#555555',
countBg: '#4C71B8',
textColor: '#fff',
gradient: false,
style: 'rounded'
},
forthebridge: {
labelBg: '#2F3437',
countBg: '#66C4DB',
textColor: '#fff',
gradient: false,
style: 'sharp'
}
};

// Configuration for SVG dimensions
const SVG_CONFIG = {
height: 28,                     // Increased height
fontSize: 14,                   // Increased font size
textY: 19,                      // Adjusted text Y position
shadowY: 20,                    // Adjusted shadow Y position
charWidth: 8.5,                 // Increased character width
paddingX: 12,                   // Increased horizontal padding
plasticLineY: 14               // Adjusted plastic effect line position
};

function isValidHexColor(color) {
return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function formatColor(color) {
if (!color) return null;
color = color.trim();
if (color.charAt(0) !== '#') {
color = '#' + color;
}
return isValidHexColor(color) ? color : null;
}

function generateSvg(labelText, countText, theme, customColors = {}) {
const labelWidth = labelText.length * SVG_CONFIG.charWidth + SVG_CONFIG.paddingX * 2;
const countWidth = countText.length * SVG_CONFIG.charWidth + SVG_CONFIG.paddingX * 2;
const totalWidth = labelWidth + countWidth;
const height = SVG_CONFIG.height;

const style = THEMES[theme] || THEMES.default;
const radius = style.style === 'rounded' ? '14' : style.style === 'sharp' ? '0' : '4';

const labelBg = customColors.labelBg || style.labelBg;
const countBg = customColors.countBg || style.countBg;

let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
`;

if (style.gradient) {
svg += `
    <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
`;
}

if (style.style !== 'sharp') {
svg += `
    <mask id="a">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
    </mask>
`;
}

svg += `
<g ${style.style !== 'sharp' ? 'mask="url(#a)"' : ''}>
    <path fill="${labelBg}" d="M0 0h${labelWidth}v${height}H0z"/>
    <path fill="${countBg}" d="M${labelWidth} 0h${countWidth}v${height}H${labelWidth}z"/>
    ${style.gradient ? `<path fill="url(#b)" d="M0 0h${totalWidth}v${height}H0z"/>` : ''}
</g>
`;

if (style.style === 'plastic') {
svg += `
    <g fill="#fff" opacity="0.2">
    <path d="M0 ${SVG_CONFIG.plasticLineY}h${totalWidth}v1.5H0z"/>
    </g>
`;
}

svg += `
<g fill="${style.textColor}" text-anchor="middle" 
    font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="${SVG_CONFIG.fontSize}">
    ${style.style === 'plastic' ? `
    <text x="${labelWidth/2}" y="${SVG_CONFIG.shadowY}" fill="#010101" fill-opacity=".3">${labelText}</text>
    ` : ''}
    <text x="${labelWidth/2}" y="${SVG_CONFIG.textY}">${labelText}</text>
    ${style.style === 'plastic' ? `
    <text x="${labelWidth + countWidth/2}" y="${SVG_CONFIG.shadowY}" fill="#010101" fill-opacity=".3">${countText}</text>
    ` : ''}
    <text x="${labelWidth + countWidth/2}" y="${SVG_CONFIG.textY}">${countText}</text>
</g>
`;

svg += `</svg>`;

return svg;
}

export default async function handler(req, res) {
try {
const { 
    name = 'visitor_count',
    theme = 'default',
    text = 'Visitors',
    tb,
    cb
} = req.query;

if (typeof name !== 'string') {
    throw new Error('Invalid counter name');
}

if (!THEMES[theme]) {
    console.warn(`Invalid theme "${theme}" requested, falling back to default`);
}

const customColors = {
    labelBg: formatColor(tb),
    countBg: formatColor(cb)
};

const counterKey = `counter:${name}`;
const exists = await kv.exists(counterKey);
if (!exists) {
    res.status(404).json({ error: 'Counter not found. Create it first using the /add endpoint.' });
    return;
}

const count = await kv.get(counterKey) || 0;
const countText = count.toLocaleString();
const labelText = text || 'Visitors';

const svg = generateSvg(labelText, countText, theme, customColors);

res.setHeader('Content-Type', 'image/svg+xml');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');

res.status(200).send(svg);
} catch (error) {
console.error('Error getting counter:', error);

const errorSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="${SVG_CONFIG.height}">
    <rect width="120" height="${SVG_CONFIG.height}" rx="4" fill="#E5534B"/>
    <text x="60" y="${SVG_CONFIG.textY}" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" 
            font-size="${SVG_CONFIG.fontSize}" fill="white" text-anchor="middle">error</text>
    </svg>
`;

res.setHeader('Content-Type', 'image/svg+xml');
res.status(200).send(errorSvg);
}
}