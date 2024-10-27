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
            .success-box {
                padding: 20px;
                border: 1px solid #44ff44;
                background-color: #eeffee;
                border-radius: 4px;
                margin: 20px 0;
            }
            .auth-form {
                background: white;
                padding: 20px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
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
                margin-bottom: 10px;
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
            .nav-links {
                margin: 20px 0;
            }
            .nav-links a {
                color: #007bff;
                text-decoration: none;
                margin-right: 15px;
            }
            h1, h2 {
                color: #333;
            }
        </style>
    `;

    const renderLoginPage = (error = '', message = '') => `
        <html>
            <head>
                ${commonStyles}
            </head>
            <body>
                <div class="container">
                    <h1>Counter Dashboard Login</h1>
                    ${error ? `<div class="error-box">${error}</div>` : ''}
                    ${message ? `<div class="success-box">${message}</div>` : ''}
                    <div class="auth-form">
                        <form method="POST" action="/login">
                            <input type="text" name="username" placeholder="Username" class="input" required><br>
                            <input type="password" name="password" placeholder="Password" class="input" required><br>
                            <button type="submit" class="button">Login</button>
                        </form>
                    </div>
                    <div class="nav-links">
                        <a href="/register">New user? Register here</a>
                    </div>
                </div>
            </body>
        </html>
    `;

    const renderRegisterPage = (error = '') => `
        <html>
            <head>
                ${commonStyles}
            </head>
            <body>
                <div class="container">
                    <h1>Register New Account</h1>
                    ${error ? `<div class="error-box">${error}</div>` : ''}
                    <div class="auth-form">
                        <form method="POST" action="/register">
                            <input type="text" name="username" placeholder="Username" class="input" required><br>
                            <input type="password" name="password" placeholder="Password" class="input" required><br>
                            <input type="password" name="confirmPassword" placeholder="Confirm Password" class="input" required><br>
                            <button type="submit" class="button">Register</button>
                        </form>
                    </div>
                    <div class="nav-links">
                        <a href="/login">Already have an account? Login here</a>
                    </div>
                </div>
            </body>
        </html>
    `;

    const renderDashboard = async (username, sessionToken) => {
        // Get all counter keys for this user
        const keys = await kv.keys(`counter:${username}:*`);
        const counters = [];
        
        // Get values for all counters
        for (const key of keys) {
            const value = await kv.get(key);
            counters.push({
                name: key.replace(`counter:${username}:`, ''),
                value: value
            });
        }

        return `
            <html>
                <head>
                    ${commonStyles}
                    <script>
                        const sessionToken = '${sessionToken}';
                        const username = '${username}';

                        async function updateCounter(name) {
                            const value = document.getElementById('value-' + name).value;
                            const response = await fetch('/set?name=' + name + '&value=' + value + '&token=' + sessionToken, {
                                method: 'POST'
                            });
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                alert('Failed to update counter');
                            }
                        }

                        async function deleteCounter(name) {
                            if (!confirm('Are you sure you want to delete this counter?')) return;
                            const response = await fetch('/remove?name=' + name + '&token=' + sessionToken, {
                                method: 'POST'
                            });
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                alert('Failed to delete counter');
                            }
                        }

                        async function addCounter() {
                            const name = document.getElementById('new-counter-name').value;
                            const response = await fetch('/add?name=' + name + '&token=' + sessionToken, {
                                method: 'POST'
                            });
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                alert('Failed to create counter');
                            }
                        }

                        async function logout() {
                            const response = await fetch('/logout?token=' + sessionToken, {
                                method: 'POST'
                            });
                            window.location.href = '/login';
                        }
                    </script>
                </head>
                <body>
                    <div class="container">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h1>Welcome, ${username}</h1>
                            <button onclick="logout()" class="button delete-btn">Logout</button>
                        </div>
                        <div class="counter-list">
                            <h2>Your Counters</h2>
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

    // Helper function to hash passwords
    const hashPassword = (password) => {
        return crypto.createHash('sha256').update(password).digest('hex');
    };

    // Helper function to validate session
    const validateSession = async (token) => {
        if (!token) return null;
        const sessionData = await kv.get(`session:${token}`);
        if (!sessionData) return null;
        return sessionData.username;
    };

    try {
        const path = req.url.split('?')[0];

        if (path === '/register' && req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            return res.send(renderRegisterPage());
        }

        if (path === '/register' && req.method === 'POST') {
            const { username, password, confirmPassword } = req.body;

            if (!username || !password || !confirmPassword) {
                return res.send(renderRegisterPage('All fields are required'));
            }

            if (password !== confirmPassword) {
                return res.send(renderRegisterPage('Passwords do not match'));
            }

            // Check if username exists
            const existingUser = await kv.get(`user:${username}`);
            if (existingUser) {
                return res.send(renderRegisterPage('Username already exists'));
            }

            // Store user
            const hashedPassword = hashPassword(password);
            await kv.set(`user:${username}`, {
                username,
                password: hashedPassword
            });

            // Redirect to login with success message
            return res.send(renderLoginPage('', 'Registration successful! Please login.'));
        }

        if (path === '/login' && req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            return res.send(renderLoginPage());
        }

        if (path === '/login' && req.method === 'POST') {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.send(renderLoginPage('Username and password are required'));
            }

            // Get user
            const user = await kv.get(`user:${username}`);
            if (!user || user.password !== hashPassword(password)) {
                return res.send(renderLoginPage('Invalid username or password'));
            }

            // Create session
            const sessionToken = crypto.randomBytes(32).toString('hex');
            await kv.set(`session:${sessionToken}`, {
                username,
                created: Date.now()
            }, { ex: 3600 }); // 1 hour expiration

            // Show dashboard
            res.setHeader('Content-Type', 'text/html');
            return res.send(await renderDashboard(username, sessionToken));
        }

        // Handle logout
        if (path === '/logout' && req.method === 'POST') {
            const token = req.query.token;
            if (token) {
                await kv.del(`session:${token}`);
            }
            return res.redirect('/login');
        }

        // Protected routes
        const token = req.query.token;
        const username = await validateSession(token);

        if (!username) {
            return res.redirect('/login');
        }

        // Handle counter operations
        if (path === '/add' && req.method === 'POST') {
            const { name } = req.query;
            await kv.set(`counter:${username}:${name}`, 0);
            return res.status(200).json({ success: true });
        }

        if (path === '/remove' && req.method === 'POST') {
            const { name } = req.query;
            await kv.del(`counter:${username}:${name}`);
            return res.status(200).json({ success: true });
        }

        if (path === '/set' && req.method === 'POST') {
            const { name, value } = req.query;
            await kv.set(`counter:${username}:${name}`, parseInt(value));
            return res.status(200).json({ success: true });
        }

        if (path === '/show') {
            const { name } = req.query;
            const value = await kv.get(`counter:${username}:${name}`);
            return res.status(200).json({ value });
        }

        if (path === '/increment') {
            const { name } = req.query;
            const value = await kv.get(`counter:${username}:${name}`);
            await kv.set(`counter:${username}:${name}`, (value || 0) + 1);
            return res.status(200).json({ success: true });
        }

        // Default route shows dashboard for logged-in users
        if (username) {
            res.setHeader('Content-Type', 'text/html');
            return res.send(await renderDashboard(username, token));
        }

        // If not logged in, show login page
        res.setHeader('Content-Type', 'text/html');
        return res.send(renderLoginPage());

    } catch (error) {
        console.error('Dashboard error:', error);
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send(renderLoginPage('An error occurred. Please try again.'));
    }
}