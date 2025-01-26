import { kv } from '@vercel/kv';
import crypto from 'crypto';
import './data.js';
import { createCanvas } from 'canvas';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

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
    if (!password) {
        res.status(401).json({ error: 'Password needed.' });
        return;
    }
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

    let continent_colors = {
        'Europe': '#66B2FF',
        'Asia': '#FF9999', 
        'Africa': '#99FF99',
        'North America': '#FFCC99',
        'South America': '#FF99CC',
        'Oceania': '#99FFFF',
        'Antarctica': '#E0E0E0',
    };
    
    let continent_count = {
        'Europe': 0,
        'Asia': 0, 
        'Africa': 0,
        'North America': 0,
        'South America': 0,
        'Oceania': 0,
        'Antarctica': 0,
    };

    const regions_key =  `regions:${name}`;
    const regions = await kv.lrange(regions_key, 0, -1);
    let country_count = {};
    let colors = [];
    for (let r in regions){
        let country = countries[regions[r].country].country;
        let continent = countries[regions[r].country].continent;
        if (country_count[country]){
            country_count[country] += 1;
        }
        else{
            country_count[country] = 1;
        }
        colors.push(continent_colors[continent]);
        continent_count[continet] += 1;
    }

    const country_count_sorted = Object.entries(country_count).sort((a, b) => b[1] - a[1]);
    const continent_count_sorted = Object.entries(continent_count).sort((a, b) => b[1] - a[1]);

    const countryNames = Object.keys(country_count_sorted);
    const visitorCounts = Object.values(country_count_sorted);

    // Chart data configuration
    const chartConfig = {
        type: 'bar',
        data: {
            labels: countryNames,
            datasets: [
                {
                    label: 'Country Visitors',
                    data: visitorCounts,
                    backgroundColor: colors,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Frequency (Log Scale)',
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        generateLabels: () => {
                            return Object.keys(continent_colors).map((continent) => ({
                                text: `${continent} (${continent_count[continent] || 0})`,
                                fillStyle: continent_colors[continent],
                            }));
                        },
                    },
                },
                title: {
                    display: true,
                    text: 'Distribution of Countries of Visitors (Log Scale)',
                    padding: 20,
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
            },
        },
    };

    // Render chart to a PNG buffer
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);

    // Send the PNG response
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
}
catch (error) {
    console.error('Error getting details:', error);
    res.status(500).json({ error: 'An error occurred while getting details.' });
}
}
