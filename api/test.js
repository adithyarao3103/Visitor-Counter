// /api/test.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
try {
// Test write
await kv.set('test_key', 'test_value');
// Test read
const value = await kv.get('test_key');

res.status(200).json({
    status: 'success',
    connection: 'established',
    test_value: value,
    kv_initialized: !!kv
});
} catch (error) {
res.status(500).json({
    status: 'error',
    message: error.message,
    stack: error.stack,
    kv_initialized: !!kv
});
}
}