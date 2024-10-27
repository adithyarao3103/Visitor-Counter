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

const { name } = req.query;

if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Valid counter name is required' });
    return;
}

const counterKey = `counter:${name}`;
const exists = await kv.exists(counterKey);

if (exists) {
    res.status(409).json({ error: 'Counter with this name already exists' });
    return;
}

await kv.set(counterKey, 0);

res.status(200).json({ 
    message: 'Counter created successfully',
    name: name,
    value: 0 
});

} catch (error) {
console.error('Error creating counter:', error);
res.status(500).json({ error: 'Failed to create counter' });
}
}