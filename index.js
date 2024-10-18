const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Visitor counter file path
const counterFilePath = path.resolve(__dirname, 'counter.json');

// Get the current visitor counter value
function getCounter() {
    if (!fs.existsSync(counterFilePath)) {
        fs.writeFileSync(counterFilePath, JSON.stringify({ count: 0 }));
    }
    const data = fs.readFileSync(counterFilePath, 'utf-8');
    return JSON.parse(data).count;
}

// Increment the visitor counter
function incrementCounter() {
    let count = getCounter();
    count += 1;
    fs.writeFileSync(counterFilePath, JSON.stringify({ count }));
    return count;
}

// Routes
app.get('/increment', (req, res) => {
    const count = incrementCounter();
    res.send(`Visitor count incremented to: ${count}`);
});

app.get('/show', (req, res) => {
    const count = getCounter();
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="20">
        <rect width="100%" height="100%" fill="#555"/>
        <rect x="70" width="80" height="20" fill="#4c1"/>
        <text x="10" y="15" fill="#fff" font-family="Verdana" font-size="12">Visitors</text>
        <text x="80" y="15" fill="#fff" font-family="Verdana" font-size="12">${count}</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
});

// Listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
