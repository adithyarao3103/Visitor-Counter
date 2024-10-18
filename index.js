const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the JSON file where the counter is stored
const counterFilePath = path.join(__dirname, 'counter.json');

// Function to read the counter from the file
function getCounter() {
    if (!fs.existsSync(counterFilePath)) {
        // Initialize the counter file if it doesn't exist
        fs.writeFileSync(counterFilePath, JSON.stringify({ count: 0 }));
    }
    const data = fs.readFileSync(counterFilePath, 'utf-8');
    return JSON.parse(data).count;
}

// Function to increment and save the counter to the file
function incrementCounter() {
    let count = getCounter();
    count += 1;
    fs.writeFileSync(counterFilePath, JSON.stringify({ count }));
    return count;
}

// Route to increment the counter
app.get('/increment', (req, res) => {
    const count = incrementCounter();
    res.send(`Visitor count incremented to: ${count}`);
});

// Route to display the counter as an SVG badge
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
