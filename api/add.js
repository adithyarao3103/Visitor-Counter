import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
try {
// Set CORS headers
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
}

const { name, password } = req.query;

if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Valid counter name is required' });
    return;
}

if (!password) {
    res.status(401).json({ error: 'Password is required' });
    return;
}

const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

const correctPasswordHash = process.env.ADMIN_PASSWORD_HASH;

if (!correctPasswordHash || hashedPassword !== correctPasswordHash) {
    res.status(401).json({ error: 'Invalid password' });
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