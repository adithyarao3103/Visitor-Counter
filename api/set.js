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

const { value } = req.query;

const newValue = parseInt(value);
if (isNaN(newValue)) {
    res.status(400).json({ error: 'Invalid value provided. Must be a number.' });
    return;
}

if (newValue < 0) {
    res.status(400).json({ error: 'Value must be non-negative.' });
    return;
}

await kv.set('visitor_count', newValue);

res.status(200).send(newValue.toString());
} catch (error) {
console.error('Error setting counter:', error);
res.status(500).json({ error: 'Failed to set counter' });
}
}