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
    if (!password) {
        res.status(401).json({ error: 'Password needed.' });
        return;
    }
    if (!name || typeof name !== 'string') {
        res.setHeader('Content-Type', 'text/html');
        res.status(400).send(renderHtml('Valid counter name is required'));
        return;
    }

    if (!password) {
        res.setHeader('Content-Type', 'text/html');
        res.status(401).send(renderHtml('Password is required'));
        return;
    }

    const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

    const correctPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!correctPasswordHash || hashedPassword !== correctPasswordHash) {
        res.setHeader('Content-Type', 'text/html');
        res.status(401).send(renderHtml('Invalid password'));
        return;
    }

    const regions_key =  `regions:${name}`;
    const regions_data = await kv.lrange(regions_key, 0, -1);
    res.status(200).json({ regions: regions_data });
}
catch (error) {
    console.error('Error getting details:', error);
    res.status(500).json({ error: 'An error occurred while getting details.' });
}
}
