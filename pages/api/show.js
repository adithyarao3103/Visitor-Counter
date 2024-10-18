import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const createSvg = (count) => {
const countStr = count.toString();
const digitWidth = countStr.length * 10;
const labelWidth = 80;
const padding = 20;
const totalWidth = labelWidth + digitWidth + padding * 2;

const LABEL_BG_COLOR = "#007EC6";
const COUNT_BG_COLOR = "#0366D6";
const GITHUB_REPO_URL = "https://github.com/yourusername/yourrepo"; // Replace with your repo URL

return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28">
<linearGradient id="labelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:#0080CF"/>
    <stop offset="100%" style="stop-color:${LABEL_BG_COLOR}"/>
</linearGradient>
<linearGradient id="countGradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:#0474E5"/>
    <stop offset="100%" style="stop-color:${COUNT_BG_COLOR}"/>
</linearGradient>

<rect width="${labelWidth + padding}" height="28" fill="url(#labelGradient)"/>
<rect x="${labelWidth + padding}" width="${digitWidth + padding}" height="28" fill="url(#countGradient)"/>

<rect width="${totalWidth}" height="1" fill="#ffffff" opacity="0.1"/>

<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">
    <text x="${(labelWidth + padding) / 2}" y="19" fill="#000" opacity="0.3">VISITORS</text>
    <text x="${(labelWidth + padding) / 2}" y="18" fill="#fff">VISITORS</text>
    
    <text x="${labelWidth + padding + (digitWidth + padding) / 2}" y="19" fill="#000" opacity="0.3">${countStr}</text>
    <text x="${labelWidth + padding + (digitWidth + padding) / 2}" y="18" fill="#fff">${countStr}</text>
</g>

<a href="${GITHUB_REPO_URL}">
    <rect width="${totalWidth}" height="28" fill="transparent"/>
</a>
</svg>`;
};

export default async function handler(req, res) {
try {
const count = await redis.get('visitor_count') || '0';

res.setHeader('Content-Type', 'image/svg+xml');
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');

res.status(200).send(createSvg(parseInt(count)));
} catch (error) {
res.status(500).json({ error: 'Failed to get counter' });
}
}