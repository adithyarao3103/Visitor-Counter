import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
const commonStyles = `
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .error-box {
            padding: 20px;
            border: 1px solid #ff4444;
            background-color: #ffeeee;
            border-radius: 4px;
            margin: 20px 0;
        }
        .login-form {
            background: white;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .counter-list {
            background: white;
            padding: 20px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .counter-item {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            background: #f9f9f9;
        }
        .input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
        }
        .button {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: #007bff;
            color: white;
            margin-right: 5px;
        }
        .button:hover {
            background: #0056b3;
        }
        .delete-btn {
            background: #dc3545;
        }
        .delete-btn:hover {
            background: #c82333;
        }
        .add-counter-form {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        h1, h2 {
            color: #333;
        }
    </style>
`;

const renderLoginPage = (error = '') => `
    <html>
        <head>
            ${commonStyles}
        </head>
        <body>
            <div class="container">
                <h1>Counter Dashboard Login</h1>
                ${error ? `<div class="error-box">${error}</div>` : ''}
                <div class="login-form">
                    <form method="GET">
                        <input type="password" name="password" placeholder="Enter password" class="input" required>
                        <button type="submit" class="button">Login</button>
                    </form>
                </div>
            </div>
        </body>
    </html>
`;

const renderDashboard = async () => {
    // Get all counter keys
    const keys = await kv.keys('counter:*');
    const counters = [];
    
    // Get values for all counters
    for (const key of keys) {
        const value = await kv.get(key);
        counters.push({
            name: key.replace('counter:', ''),
            value: value
        });
    }

    return `
        <html>
            <head>
                ${commonStyles}
                <script>
                    async function updateCounter(name) {
                        const value = document.getElementById('value-' + name).value;
                        const password = '${req.query.password}';
                        const response = await fetch('/api/set?name=' + name + '&value=' + value + '&password=' + password);
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            alert('Failed to update counter');
                        }
                    }

                    async function deleteCounter(name) {
                        if (!confirm('Are you sure you want to delete this counter?')) return;
                        const password = '${req.query.password}';
                        const response = await fetch('/api/delete?name=' + name + '&password=' + password);
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            alert('Failed to delete counter');
                        }
                    }

                    async function addCounter() {
                        const name = document.getElementById('new-counter-name').value;
                        const password = '${req.query.password}';
                        const response = await fetch('/api/add?name=' + name + '&password=' + password);
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            alert('Failed to create counter');
                        }
                    }
                </script>
            </head>
            <body>
                <div class="container">
                    <h1>Counter Dashboard</h1>
                    <div class="counter-list">
                        <h2>Current Counters</h2>
                        ${counters.map(counter => `
                            <div class="counter-item">
                                <strong>${counter.name}</strong>: 
                                <input type="number" id="value-${counter.name}" value="${counter.value}" class="input">
                                <button onclick="updateCounter('${counter.name}')" class="button">Update</button>
                                <button onclick="deleteCounter('${counter.name}')" class="button delete-btn">Delete</button>
                            </div>
                        `).join('')}
                        
                        <div class="add-counter-form">
                            <h2>Add New Counter</h2>
                            <input type="text" id="new-counter-name" placeholder="Counter name" class="input">
                            <button onclick="addCounter()" class="button">Add Counter</button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
};

try {
    const { password } = req.query;

    if (!password) {
        res.setHeader('Content-Type', 'text/html');
        return res.send(renderLoginPage());
    }

    const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

    const correctPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!correctPasswordHash || hashedPassword !== correctPasswordHash) {
        res.setHeader('Content-Type', 'text/html');
        return res.send(renderLoginPage('Invalid password'));
    }

    // If password is correct, show dashboard
    res.setHeader('Content-Type', 'text/html');
    res.send(await renderDashboard());

} catch (error) {
    console.error('Dashboard error:', error);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(renderLoginPage('An error occurred. Please try again.'));
}
}