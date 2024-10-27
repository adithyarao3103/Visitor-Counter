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

if (name === 'visitor_count') {
    res.status(403).json({ error: 'Cannot remove default visitor counter' });
    return;
}

const counterKey = `counter:${name}`;

const exists = await kv.exists(counterKey);
if (!exists) {
    res.status(404).json({ error: 'Counter not found' });
    return;
}

await kv.del(counterKey);

res.status(200).json({ 
    message: 'Counter removed successfully',
    name: name
});

} catch (error) {
console.error('Error removing counter:', error);
res.status(500).json({ error: 'Failed to remove counter' });
}
}