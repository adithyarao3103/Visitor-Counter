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
neon: {
labelBg: '#1A1A1A',  // Dark background
countBg: '#FF00FF',  // Bright magenta
textColor: '#00FF00', // Bright green
gradient: true,
style: 'sharp',
glowEffect: true     // New property for neon glow
},
glassmorphic: {
labelBg: '#ffffff40', // Semi-transparent white
countBg: '#ffffff20', // More transparent white
textColor: '#FFFFFF',
gradient: true,
style: 'rounded',
blur: true           // New property for glass effect
},
retro: {
labelBg: '#FFB74D',  // Warm orange
countBg: '#B0003A',  // Deep red
textColor: '#2B2B2B',
gradient: false,
style: 'pixel',      // New style for pixelated edges
pixelSize: 2         // New property for pixel effect
}
};

// Validate hex color code
function isValidHexColor(color) {
return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Ensure color has # prefix
function formatColor(color) {
if (!color) return null;
color = color.trim();
if (color.charAt(0) !== '#') {
color = '#' + color;
}
return isValidHexColor(color) ? color : null;
}

function generateSvg(labelText, countText, theme, customColors = {}) {
const labelWidth = labelText.length * 6.5 + 10;
const countWidth = countText.length * 7.5 + 10;
const totalWidth = labelWidth + countWidth;
const height = 20;

// Theme-specific styling
const style = THEMES[theme] || THEMES.default;
const radius = style.style === 'rounded' ? '10' : 
            style.style === 'pixel' ? '0' : 
            style.style === 'sharp' ? '0' : '3';

// Apply custom colors if provided, fallback to theme colors
const labelBg = customColors.labelBg || style.labelBg;
const countBg = customColors.countBg || style.countBg;
const labelTextColor = customColors.textFg || style.textColor;
const countTextColor = customColors.counterFg || style.textColor;

// Base SVG
let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
`;

// Add filters for special effects
if (style.glowEffect) {
svg += `
<defs>
    <filter id="glow">
    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
    <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
    </filter>
</defs>
`;
}

if (style.blur) {
svg += `
<defs>
    <filter id="blur">
    <feGaussianBlur stdDeviation="1.5" result="blur"/>
    </filter>
</defs>
`;
}

// Add gradient if theme uses it
if (style.gradient) {
if (theme === 'default') {
    svg += `
    <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    `;
} else {
    svg += `
    <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".2"/>
    <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    `;
}
}

// Add mask for rounded corners or pixel effect
if (style.style === 'pixel') {
// Create pixelated edges
const pixelSize = style.pixelSize || 2;
svg += `
<pattern id="pixel" width="${pixelSize}" height="${pixelSize}" patternUnits="userSpaceOnUse">
    <rect width="${pixelSize}" height="${pixelSize}" fill="currentColor"/>
</pattern>
`;
} else if (style.style !== 'sharp') {
svg += `
<mask id="a">
    <rect width="${totalWidth}" height="${height}" rx="${radius}" fill="#fff"/>
</mask>
`;
}

// Main shape group with special effects
const filterEffect = style.glowEffect ? 'filter="url(#glow)"' : 
                    style.blur ? 'filter="url(#blur)"' : '';

svg += `
<g ${style.style !== 'sharp' ? 'mask="url(#a)"' : ''} ${filterEffect}>
<path fill="${labelBg}" d="M0 0h${labelWidth}v${height}H0z"/>
<path fill="${countBg}" d="M${labelWidth} 0h${countWidth}v${height}H${labelWidth}z"/>
${style.gradient ? `<path fill="url(#b)" d="M0 0h${totalWidth}v${height}H0z"/>` : ''}
</g>
`;

// Text elements with custom colors
svg += `
<g text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
<text x="${labelWidth/2}" y="14" fill="${labelTextColor}">${labelText}</text>
<text x="${labelWidth + countWidth/2}" y="14" fill="${countTextColor}">${countText}</text>
</g>
`;

// Close SVG tag
svg += `</svg>`;

return svg;
}

export default async function handler(req, res) {
try {
const { 
    name = 'visitor_count',
    theme = 'default',
    text = 'Visitors',
    tb,    // text background color
    cb,    // count background color
    tf,    // text foreground color
    cf     // counter foreground color
} = req.query;

if (typeof name !== 'string') {
    throw new Error('Invalid counter name');
}

// Validate theme
if (!THEMES[theme]) {
    console.warn(`Invalid theme "${theme}" requested, falling back to default`);
}

// Process custom colors
const customColors = {
    labelBg: formatColor(tb),
    countBg: formatColor(cb),
    textFg: formatColor(tf),
    counterFg: formatColor(cf)
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