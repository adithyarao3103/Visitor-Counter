import Redis from 'ioredis';

let redis;

try {
redis = new Redis(process.env.REDIS_URL);
} catch (error) {
console.error('Failed to create Redis instance:', error);
}

export default async function handler(req, res) {
if (req.method !== 'GET') {
return res.status(405).json({ error: 'Method not allowed' });
}

try {
let count;
if (redis) {
    count = await redis.incr('visitor_count');
} else {
    count = 0;
}

res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.status(200).json({ count });
} catch (error) {
console.error('Error incrementing counter:', error);
res.status(500).json({ error: 'Failed to increment counter' });
}
}