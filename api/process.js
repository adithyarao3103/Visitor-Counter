import { kv } from '@vercel/kv';
import crypto from 'crypto';
import './data.js';
import { createCanvas } from 'canvas';

export default async function handler(req, res) {
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
        res.status(401).json({ error: 'Password needed.' });
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

    const continent_colors = {
        'Europe': '#66B2FF',
        'Asia': '#FF9999', 
        'Africa': '#99FF99',
        'North America': '#FFCC99',
        'South America': '#FF99CC',
        'Oceania': '#99FFFF',
        'Antarctica': '#E0E0E0',
    };
    
    const continent_count = {
        'Europe': 0,
        'Asia': 0, 
        'Africa': 0,
        'North America': 0,
        'South America': 0,
        'Oceania': 0,
        'Antarctica': 0,
    };

    const regions_key = `regions:${name}`;
    const regions = await kv.lrange(regions_key, 0, -1);
    const country_count = {};
    const colors = [];

    regions.forEach(r => {
        const country = countries[r.country].country;
        const continent = countries[r.country].continent;
        
        country_count[country] = (country_count[country] || 0) + 1;
        colors.push(continent_colors[continent]);
        continent_count[continent] += 1;
    });

    const country_count_sorted = Object.entries(country_count)
        .sort((a, b) => b[1] - a[1]);
    const continent_count_sorted = Object.entries(continent_count)
        .sort((a, b) => b[1] - a[1]);

    // Create visualization
    const canvas = createCanvas(1400, 1400);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1400, 1400);

    // Prepare data for horizontal bar chart
    const maxVisitors = Math.max(...country_count_sorted.map(([_, count]) => count));
    const logMaxVisitors = Math.log10(maxVisitors);

    // Draw bars
    country_count_sorted.forEach((([country, count], index) => {
        const logCount = Math.log10(count);
        const barHeight = 40;
        const y = 100 + index * (barHeight + 10);
        
        // Get continent color
        const continent = countries[Object.keys(countries).find(k => countries[k].country === country)].continent;
        ctx.fillStyle = continent_colors[continent];
        
        // Draw bar
        const barWidth = (logCount / logMaxVisitors) * 1000;
        ctx.fillRect(200, y, barWidth, barHeight);
        
        // Add country name
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(country, 190, y + barHeight / 2 + 5);
        
        // Add count
        ctx.textAlign = 'left';
        ctx.fillText(count.toLocaleString(), 210 + barWidth, y + barHeight / 2 + 5);
    }));

    // Add title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distribution of Countries of Visitors (Log Scale)', 700, 50);

    // Add legend
    ctx.font = '12px Arial';
    continent_count_sorted.forEach(([continent, count], index) => {
        ctx.fillStyle = continent_colors[continent];
        ctx.fillRect(1200, 100 + index * 30, 20, 20);
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.fillText(`${continent} (${count.toLocaleString()})`, 1225, 115 + index * 30);
    });

    // Convert to PNG
    const buffer = canvas.toBuffer('image/png');

    // Send PNG response
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
}
catch (error) {
    console.error('Error getting details:', error);
    res.status(500).json({ error: 'An error occurred while getting details.' });
}
}

// Render HTML for error messages (placeholder function)
function renderHtml(message) {
    return `<html><body><h1>${message}</h1></body></html>`;
}