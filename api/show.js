import { kv } from '@vercel/kv';

export default async function handler(req, res) {
try {
// Get current count
const count = await kv.get('visitor_count') || 0;

// Create SVG
const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="30">
    <rect width="150" height="30" fill="#555"/>
    <text x="10" y="20" font-family="Arial" font-size="14" fill="white">
        Visitors: ${count}
    </text>
    </svg>
`;

// Set content type to SVG
res.setHeader('Content-Type', 'image/svg+xml');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

// Send SVG
res.status(200).send(svg);
} catch (error) {
console.error('Error getting counter:', error);
res.status(500).json({ error: 'Failed to get counter' });
}
}