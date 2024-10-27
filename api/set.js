import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
// Common styles and HTML template
const commonStyles = `
    <style>
        .error-box {
            font-family: Arial, sans-serif;
            padding: 20px;
            border: 1px solid #ff4444;
            background-color: #ff9a41;
            border-radius: 4px;
            margin: 20px;
            width: calc(100vw - 80px);
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
        }
        .result-box {
            font-family: Arial, sans-serif;
            padding: 20px;
            border: 1px solid #44aa44;
            background-color: #50cc50;
            border-radius: 4px;
            margin: 20px;
            width: calc(100vw - 80px);
            text-align: center;
        }
        .counter-name {
            font-size: 1.2em;
            font-weight: bold;
            color: black;
        }
        .counter-value {
            font-size: 1.2em;
            color: black;
            margin-top: 10px;
        }
    </style>
`;

const renderHtml = (content, isError = true) => `
    <html>
        <head>
            ${commonStyles}
        </head>
        <body>
            <div class="${isError ? 'error-box' : 'result-box'}">
                ${content}
            </div>
        </body>
    </html>
`;

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

    if (typeof name !== 'string') {
        res.setHeader('Content-Type', 'text/html');
        res.status(400).send(renderHtml('Invalid counter name'));
        return;
    }

    const newValue = parseInt(value);
    if (isNaN(newValue)) {
        res.setHeader('Content-Type', 'text/html');
        res.status(400).send(renderHtml('Invalid value provided. Must be a number.'));
        return;
    }

    if (newValue < 0) {
        res.setHeader('Content-Type', 'text/html');
        res.status(400).send(renderHtml('Value must be non-negative.'));
        return;
    }

    const counterKey = `counter:${name}`;

    const exists = await kv.exists(counterKey);
    if (!exists) {
        res.setHeader('Content-Type', 'text/html');
        res.status(404).send(renderHtml('Counter not found. Create it first using the /add endpoint.'));
        return;
    }

    await kv.set(counterKey, newValue);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(renderHtml(`
        <div class="counter-name">Counter: ${name}</div>
        <div class="counter-value">Value: ${newValue}</div>
    `, false));

} catch (error) {
    console.error('Error setting counter:', error);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(renderHtml('Failed to set counter'));
}
}