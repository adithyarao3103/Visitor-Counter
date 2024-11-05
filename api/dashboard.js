import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
    const commonStyles = `
        <style>
            /* Base styles */
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                background-color: #f5f5f5;
                padding: 10px;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 15px;
                width: 100%;
                box-sizing: border-box;
            }

            .error-box {
                padding: 15px;
                border: 1px solid #ff4444;
                background-color: #ffeeee;
                border-radius: 4px;
                margin: 15px 0;
                word-wrap: break-word;
            }

            .login-form {
                background: white;
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .counter-list {
                background: white;
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-top: 15px;
            }

            .counter-item {
                border: 1px solid #ddd;
                padding: 12px;
                margin: 8px 0;
                border-radius: 4px;
                background: #f9f9f9;
            }

            .input {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin: 5px 0;
                width: 100%;
                box-sizing: border-box;
                font-size: 16px; /* Prevents zoom on iOS */
                max-width: 100%;
            }

            .button {
                padding: 12px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                background: #007bff;
                color: white;
                margin: 5px 0;
                width: 100%;
                font-size: 16px;
                touch-action: manipulation;
            }

            .delete-btn {
                background: #dc3545;
            }

            .pause-btn {
                background: #80c904;
            }
            
            .dwnld-btn {
                background: #000000;
            }

            .dwnld-btn:hover, .dwnld-btn:active {
                background: #0000000;
            }
            
            .pause-btn:hover, .pause-btn:active {
                background: #80c904;
            }

            .delete-btn:hover, .delete-btn:active {
                background: #c82333;
            }

            .add-counter-form {
                margin-top: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 4px;
            }

            h1, h2 {
                color: #333;
                font-size: 24px;
                margin: 10px 0;
            }

            /* Custom Alert Styles */
            .custom-alert {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 90%;
                max-width: 500px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                box-sizing: border-box;
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
                margin-right: 12px;
                font-size: 14px;
            }

            .custom-alert-close {
                cursor: pointer;
                font-weight: bold;
                opacity: 0.7;
                padding: 8px;
                font-size: 18px;
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
                padding: 15px;
            }

            .confirm-dialog {
                background: white;
                padding: 20px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                width: 90%;
                max-width: 400px;
                margin: 0 auto;
                box-sizing: border-box;
            }

            .confirm-dialog-buttons {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                flex-wrap: wrap;
            }

            /* Media Queries */
            @media screen and (min-width: 768px) {
                body {
                    padding: 20px;
                }

                .button {
                    width: auto;
                    margin-right: 5px;
                }

                .input {
                    width: auto;
                    margin-right: 10px;
                }

                .confirm-dialog-buttons {
                    flex-wrap: nowrap;
                }

                h1, h2 {
                    font-size: 28px;
                }

                .custom-alert-content {
                    font-size: 16px;
                }
            }

            /* Touch-friendly improvements */
            @media (hover: none) {
                .button {
                    min-height: 44px; /* Minimum touch target size */
                }

                .custom-alert-close {
                    min-width: 44px;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }

            /* Safe area insets for notched devices */
            @supports (padding: max(0px)) {
                body {
                    padding-left: max(10px, env(safe-area-inset-left));
                    padding-right: max(10px, env(safe-area-inset-right));
                    padding-bottom: max(10px, env(safe-area-inset-bottom));
                }
            }
        </style>
    `;

    const renderLoginPage = (error = '') => `
        <html>
            <head>
                <title>Visitor Counter | Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta nam"author" content="Adithya A Rao"/>
                <meta name="description" content="Dashboard for the Visitor Counter App for static websites."/>
                <meta name="keywords" content="visitor counter, static websites, dashboard, password"/>
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
        const names = [];
        for (const key of keys) {
            names.push(key.split(':')[1]);
        }
        console.log(names);
        const counters = [];
        
        for (const name of names) {
            const value = await kv.get('counter:'+name);
            let pause;
            pause = await kv.get('pause:'+name);
            if (pause == null)
            {
                pause = false;
                await kv.set('pause:'+name, false);
            }
            counters.push({
                name: name,
                value: value,
                pause: pause
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
                        
                        async function togglePause(name, dtext) {
                            showConfirmDialog('Are you sure you want to ' + dtext + ' this counter?', async () => {
                                try {
                                    const response = await fetch('/pause?name=' + name + '&password=' + password, {
                                        method: 'POST'
                                    });
                                    if (response.ok) {
                                        showAlert('Counter '+ dtext + 'd successfully');
                                        window.location.reload();
                                    } else {
                                        showAlert('Failed to ' + dtext, 'error');
                                    }
                                } catch (error) {
                                    showAlert('An error occurred while toggling', 'error');
                                }
                            });
                        }

                        
                        async function downloadCSV(name){
                            const data = await fetch('/regions?name=' + name + '&password=' + password).then(response => response.json());
                            const regions = data.regions;
                            let csv = 'Country, Region\n';
                            for (r in regions){
                            csv += regions[r].country + ', ' + regions[r].region + '\n';
                            }
                            var element = document.createElement('a');
                            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
                            element.setAttribute('download', "regions_" + name + ".csv");
                            element.style.display = 'none';
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
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
                                    <button onclick="togglePause('${counter.name}', '${counter.pause ? "resume": "pause"}')" class="button pause-btn">${counter.pause ? "Resume": "Pause"}</button>
                                    <button onclick="downloadCSV('${counter.name}')" class="button dwnld-btn">Download Regions</button>
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