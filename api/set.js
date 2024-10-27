import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
try {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
}

const { name = 'visitor_count', value, password } = req.query;

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

if (typeof name !== 'string') {
    res.status(400).json({ error: 'Invalid counter name' });
    return;
}

const newValue = parseInt(value);
if (isNaN(newValue)) {
    res.status(400).json({ error: 'Invalid value provided. Must be a number.' });
    return;
}

if (newValue < 0) {
    res.status(400).json({ error: 'Value must be non-negative.' });
    return;
}

const counterKey = `counter:${name}`;

const exists = await kv.exists(counterKey);
if (!exists) {
    res.status(404).json({ error: 'Counter not found. Create it first using the /add endpoint.' });
    return;
}

await kv.set(counterKey, newValue);

res.status(200).json({
    name: name,
    value: newValue
});

} catch (error) {
console.error('Error setting counter:', error);
res.status(500).json({ error: 'Failed to set counter' });
}
}