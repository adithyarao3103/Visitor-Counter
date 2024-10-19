import { kv } from '@vercel/kv';
// import { inject } from "@vercel/analytics"

// inject()

export default async function handler(req, res) {
try {

    res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
}


const count = await kv.incr('visitor_count');


res.status(200).send(count.toString());
} catch (error) {
console.error('Error incrementing counter:', error);
res.status(500).json({ error: 'Failed to increment counter' });
}
}