import { kv } from '@vercel/kv';

export default async function handler(req, res) {
try {

    res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
}

const { name = 'visitor_count' } = req.query;

if (typeof name !== 'string') {
    res.status(400).json({ error: 'Invalid counter name' });
    return;
}

const counterKey = `counter:${name}`;

const exists = await kv.exists(counterKey);
if (!exists) {
    res.status(404).json({ error: 'Counter not found. Create it first using the /add endpoint.' });
    return;
}

const count = await kv.incr(counterKey);

res.status(200).json({
    name: name,
    value: count
});

} catch (error) {
console.error('Error incrementing counter:', error);
res.status(500).json({ error: 'Failed to increment counter' });
}
}