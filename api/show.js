import { kv } from '@vercel/kv';

export default async function handler(req, res) {
try {

const { name = 'visitor_count' } = req.query;

if (typeof name !== 'string') {
    throw new Error('Invalid counter name');
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
const labelWidth = labelText.length * 6.5 + 10;
const countWidth = countText.length * 7.5 + 10;
const totalWidth = labelWidth + countWidth;

const darkBlue = '#007EC6';
const greyBlue = '#444D56';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
    <path fill="${greyBlue}" d="M0 0h${labelWidth}v20H0z"/>
    <path fill="${darkBlue}" d="M${labelWidth} 0h${countWidth}v20H${labelWidth}z"/>
    <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth/2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth/2}" y="14">${labelText}</text>
    <text x="${labelWidth + countWidth/2}" y="15" fill="#010101" fill-opacity=".3">${countText}</text>
    <text x="${labelWidth + countWidth/2}" y="14">${countText}</text>
    </g>
</svg>
`;

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
    <text x="45" y="14" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11" fill="white" text-anchor="middle">error</text>
</svg>
`;
res.setHeader('Content-Type', 'image/svg+xml');
res.status(200).send(errorSvg);
}
}