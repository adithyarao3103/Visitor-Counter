import Redis from 'ioredis';

let redis;

try {
redis = new Redis(process.env.REDIS_URL);
} catch (error) {
console.error('Failed to create Redis instance:', error);
}

const createSvg = (count) => {
const countStr = count.toString();
const digitWidth = countStr.length * 10;
const labelWidth = 80;
const padding = 20;
const totalWidth = labelWidth + digitWidth + padding * 2;

return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28">
<linearGradient id="labelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:#0080CF"/>
    <stop offset="100%" style="stop-color:#007EC6"/>
</linearGradient>
<linearGradient id="countGradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:#0474E5"/>
    <stop offset="100%" style="stop-color:#0366D6"/>
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
</svg>`;
};

export default async function handler(req, res) {
if (req.method !== 'GET') {
return res.status(405).json({ error: 'Method not allowed' });
}

try {
let count = '0';
if (redis) {
    count = await redis.get('visitor_count') || '0';
}

res.setHeader('Content-Type', 'image/svg+xml');
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');

res.status(200).send(createSvg(parseInt(count)));
} catch (error) {
console.error('Error getting counter:', error);
res.status(500).json({ error: 'Failed to get counter' });
}
}