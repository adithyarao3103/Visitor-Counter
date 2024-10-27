import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Get authorization token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization required' });
        }

        const sessionToken = authHeader.split(' ')[1];
        const sessionHash = await kv.get(`session:${sessionToken}`);
        
        if (!sessionHash) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const { name, value } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Valid counter name is required' });
        }

        const newValue = parseInt(value);
        if (isNaN(newValue)) {
            return res.status(400).json({ error: 'Invalid value provided. Must be a number.' });
        }

        if (newValue < 0) {
            return res.status(400).json({ error: 'Value must be non-negative.' });
        }

        const counterKey = `counter:${name}`;
        const exists = await kv.exists(counterKey);

        if (!exists) {
            return res.status(404).json({ error: 'Counter not found' });
        }

        await kv.set(counterKey, newValue);

        return res.status(200).json({ 
            message: 'Counter updated successfully',
            name: name,
            value: newValue 
        });

    } catch (error) {
        console.error('Error setting counter:', error);
        return res.status(500).json({ error: 'Failed to set counter' });
    }
}