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

function generateSvg(labelText, countText, theme) {
const labelWidth = labelText.length * 6.5 + 10;
const countWidth = countText.length * 7.5 + 10;
const totalWidth = labelWidth + countWidth;
const height = 20;

// Theme-specific styling
const style = THEMES[theme] || THEMES.default;
const radius = style.style === 'rounded' ? '10' : style.style === 'sharp' ? '0' : '3';

// Base SVG
let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
`;

// Add gradient if theme uses it
if (style.gradient) {
svg += `
    <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
`;
}

// Add mask for rounded corners
if (style.style !== 'sharp') {
svg += `
    <mask id="a">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
    </mask>
`;
}

// Main shape group
svg += `
<g ${style.style !== 'sharp' ? 'mask="url(#a)"' : ''}>
    <path fill="${style.labelBg}" d="M0 0h${labelWidth}v${height}H0z"/>
    <path fill="${style.countBg}" d="M${labelWidth} 0h${countWidth}v${height}H${labelWidth}z"/>
    ${style.gradient ? `<path fill="url(#b)" d="M0 0h${totalWidth}v${height}H0z"/>` : ''}
</g>
`;

// Add plastic effect for plastic theme
if (style.style === 'plastic') {
svg += `
    <g fill="#fff" opacity="0.2">
    <path d="M0 ${height/2}h${totalWidth}v1H0z"/>
    </g>
`;
}

// Text elements
svg += `
<g fill="${style.textColor}" text-anchor="middle" 
    font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    ${style.style === 'plastic' ? `
    <text x="${labelWidth/2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    ` : ''}
    <text x="${labelWidth/2}" y="14">${labelText}</text>
    ${style.style === 'plastic' ? `
    <text x="${labelWidth + countWidth/2}" y="15" fill="#010101" fill-opacity=".3">${countText}</text>
    ` : ''}
    <text x="${labelWidth + countWidth/2}" y="14">${countText}</text>
</g>
`;

// Close SVG tag
svg += `</svg>`;

return svg;
}

export default async function handler(req, res) {
try {
const { name = 'visitor_count', theme = 'default' } = req.query;

if (typeof name !== 'string') {
    throw new Error('Invalid counter name');
}

// Validate theme
if (!THEMES[theme]) {
    console.warn(`Invalid theme "${theme}" requested, falling back to default`);
}

const counterKey = `counter:${name}`;
const exists = await kv.exists(counterKey);
if (!exists) {
    res.status(404).json({ error: 'Counter not found. Create it first using the /add endpoint.' });
    return;
}

const count = await kv.get(counterKey) || 0;
const labelText = 'Visitors';
const countText = count.toLocaleString();

const svg = generateSvg(labelText, countText, theme);

res.setHeader('Content-Type', 'image/svg+xml');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');

res.status(200).send(svg);
} catch (error) {
console.error('Error getting counter:', error);

// Simple error badge
const errorSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="20">
    <rect width="90" height="20" rx="3" fill="#E5534B"/>
    <text x="45" y="14" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" 
            font-size="11" fill="white" text-anchor="middle">error</text>
    </svg>
`;

res.setHeader('Content-Type', 'image/svg+xml');
res.status(200).send(errorSvg);
}
}