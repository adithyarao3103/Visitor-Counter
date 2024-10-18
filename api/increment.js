import { kv } from '@vercel/kv';

export default async function handler(req, res) {
try {
// Enable CORS
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

// Handle preflight
if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
}

// Increment counter
const count = await kv.incr('visitor_count');

// Return count as text
res.status(200).send(count.toString());
} catch (error) {
console.error('Error incrementing counter:', error);
res.status(500).json({ error: 'Failed to increment counter' });
}
}