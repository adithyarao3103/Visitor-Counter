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

    const { name = 'visitor_count', password } = req.query;

    if (!password) {
        res.status(401).json({ error: 'Password needed.' });

        return;
    }

    const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

    const correctPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!correctPasswordHash || hashedPassword !== correctPasswordHash) {
        res.status(401).json({ error: 'Wrong password'});

        return;
    }

    if (typeof name !== 'string') {
        res.status(404).json({ error: 'Provide valid counter name' });

        return;
    }

    const pauseKey = `pause:${name}`;

    exists =  await kv.exists(pauseKey);
    if (!exists) {
        res.status(404).json({ error: 'Counter not found. Create it first using the /add endpoint.' });
        return;
    }

    pause = await kv.get(pauseKey);
    await kv.set(pauseKey, !pause);

    
    res.status(200).json({ message: 'Counter pause set to ' + !pause });
    ;

} catch (error) {
    console.error('Error setting counter:', error);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(renderHtml('Failed to set counter'));
}
}