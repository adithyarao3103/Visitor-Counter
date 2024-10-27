import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {

    const commonStyles = `
    <style>
        .error-box {
            font-family: Arial, sans-serif;
            padding: 20px;
            border: 1px solid #ff4444;
            background-color: #ff9a41;
            border-radius: 4px;
            margin: 20px;
            width: calc(100vw - 85px);
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
            width: calc(100vw - 85px);
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

    const counterKey = `counter:${name}`;
    const exists = await kv.exists(counterKey);

    if (exists) {
        res.setHeader('Content-Type', 'text/html');
        res.status(409).send(renderHtml('Counter with this name already exists'));
        return;
    }

    await kv.set(counterKey, 0);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(renderHtml(`
        <div class="message">Counter created successfully</div>
        <div class="counter-name">Counter: ${name}</div>
        <div class="counter-value">Initial Value: 0</div>
    `, false));

} catch (error) {
    console.error('Error creating counter:', error);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(renderHtml('Failed to create counter'));
}
}