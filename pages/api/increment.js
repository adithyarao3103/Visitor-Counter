import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
try {
const count = await redis.incr('visitor_count');
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.status(200).json({ count });
} catch (error) {
res.status(500).json({ error: 'Failed to increment counter' });
}
}