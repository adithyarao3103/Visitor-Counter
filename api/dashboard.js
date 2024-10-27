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
            /* Custom Alert Styles */
            .custom-alert {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 15px 25px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            .custom-alert.success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            .custom-alert.error {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            .custom-alert.warning {
                background-color: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
            }
            .custom-alert-content {
                flex-grow: 1;
                margin-right: 15px;
            }
            .custom-alert-close {
                cursor: pointer;
                font-weight: bold;
                opacity: 0.7;
            }
            .custom-alert-close:hover {
                opacity: 1;
            }
            /* Confirmation Dialog Styles */
            .confirm-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .confirm-dialog {
                background: white;
                padding: 20px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
            }
            .confirm-dialog-buttons {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
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
                        <form method="POST">
                            <input type="password" name="password" placeholder="Enter password" class="input" required>
                            <button type="submit" class="button">Login</button>
                        </form>
                    </div>
                </div>
            </body>
        </html>
    `;

    const renderDashboard = async (password) => {
        const keys = await kv.keys('counter:*');
        const counters = [];
        
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
                        const password = '${password}';

                        function showAlert(message, type = 'success') {
                            const alertDiv = document.createElement('div');
                            alertDiv.className = \`custom-alert \${type}\`;
                            alertDiv.innerHTML = \`
                                <div class="custom-alert-content">\${message}</div>
                                <span class="custom-alert-close" onclick="this.parentElement.remove()">×</span>
                            \`;
                            document.body.appendChild(alertDiv);
                            
                            // Trigger reflow to enable transition
                            alertDiv.offsetHeight;
                            alertDiv.style.opacity = '1';

                            // Auto-remove after 3 seconds
                            setTimeout(() => {
                                alertDiv.style.opacity = '0';
                                setTimeout(() => alertDiv.remove(), 300);
                            }, 3000);
                        }

                        function showConfirmDialog(message, onConfirm) {
                            const overlay = document.createElement('div');
                            overlay.className = 'confirm-dialog-overlay';
                            overlay.innerHTML = \`
                                <div class="confirm-dialog">
                                    <div>\${message}</div>
                                    <div class="confirm-dialog-buttons">
                                        <button class="button" onclick="this.closest('.confirm-dialog-overlay').remove()">Cancel</button>
                                        <button class="button delete-btn" onclick="confirmAction(this)">Confirm</button>
                                    </div>
                                </div>
                            \`;
                            document.body.appendChild(overlay);
                            overlay.style.display = 'flex';

                            // Store the callback
                            overlay.querySelector('.delete-btn').onclick = () => {
                                onConfirm();
                                overlay.remove();
                            };
                        }

                        async function updateCounter(name) {
                            const value = document.getElementById('value-' + name).value;
                            try {
                                const response = await fetch('/set?name=' + name + '&value=' + value + '&password=' + password, {
                                    method: 'POST'
                                });
                                if (response.ok) {
                                    showAlert('Counter updated successfully');
                                    window.location.reload();
                                } else {
                                    showAlert('Failed to update counter', 'error');
                                }
                            } catch (error) {
                                showAlert('An error occurred while updating the counter', 'error');
                            }
                        }

                        async function deleteCounter(name) {
                            showConfirmDialog('Are you sure you want to delete this counter?', async () => {
                                try {
                                    const response = await fetch('/remove?name=' + name + '&password=' + password, {
                                        method: 'POST'
                                    });
                                    if (response.ok) {
                                        showAlert('Counter deleted successfully');
                                        window.location.reload();
                                    } else {
                                        showAlert('Failed to delete counter', 'error');
                                    }
                                } catch (error) {
                                    showAlert('An error occurred while deleting the counter', 'error');
                                }
                            });
                        }

                        async function addCounter() {
                            const name = document.getElementById('new-counter-name').value;
                            if (!name.trim()) {
                                showAlert('Please enter a counter name', 'warning');
                                return;
                            }
                            try {
                                const response = await fetch('/add?name=' + name + '&password=' + password, {
                                    method: 'POST'
                                });
                                if (response.ok) {
                                    showAlert('Counter created successfully');
                                    window.location.reload();
                                } else {
                                    showAlert('Failed to create counter', 'error');
                                }
                            } catch (error) {
                                showAlert('An error occurred while creating the counter', 'error');
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
        if (req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            return res.send(renderLoginPage());
        }
        
        if (req.method === 'POST') {
            const { password } = req.body;

            if (!password) {
                res.setHeader('Content-Type', 'text/html');
                return res.send(renderLoginPage('Password is required'));
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

            res.setHeader('Content-Type', 'text/html');
            res.send(await renderDashboard(password));
        }

    } catch (error) {
        console.error('Dashboard error:', error);
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send(renderLoginPage('An error occurred. Please try again.'));
    }
}