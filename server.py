from flask import Flask, Response, redirect
from threading import Lock

app = Flask(__name__)

# Global counter with thread-safe lock
visitor_count = 0
counter_lock = Lock()

GITHUB_REPO_URL = "https://adithyarao3103.github.io"

LABEL_BG_COLOR = "#007EC6"   # GitHub-style blue
COUNT_BG_COLOR = "#0366D6"   # Darker GitHub blue

@app.route('/')
def root():
    return redirect(GITHUB_REPO_URL)

@app.route('/increment')
def increment():
    global visitor_count
    with counter_lock:
        visitor_count += 1
    return f"Counter incremented to {visitor_count}"

@app.route('/show')
def show():
    # Calculate width based on the number of digits in visitor count
    count_str = str(visitor_count)
    digit_width = len(count_str) * 10
    label_width = 80
    padding = 20
    total_width = label_width + digit_width + padding * 2

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{total_width}" height="28">
    <!-- Background -->
    <linearGradient id="labelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0080CF"/>
        <stop offset="100%" style="stop-color:{LABEL_BG_COLOR}"/>
    </linearGradient>
    <linearGradient id="countGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0474E5"/>
        <stop offset="100%" style="stop-color:{COUNT_BG_COLOR}"/>
    </linearGradient>

    <!-- Background rectangles with gradients -->
    <rect width="{label_width + padding}" height="28" fill="url(#labelGradient)"/>
    <rect x="{label_width + padding}" width="{digit_width + padding}" height="28" fill="url(#countGradient)"/>
    
    <!-- Subtle inner shadow -->
    <rect width="{total_width}" height="1" fill="#ffffff" opacity="0.1"/>
    
    <!-- Text -->
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">
        <!-- Text shadow for better readability -->
        <text x="{(label_width + padding) / 2}" y="19" fill="#000" opacity="0.3">VISITORS</text>
        <text x="{(label_width + padding) / 2}" y="18" fill="#fff">VISITORS</text>
        
        <text x="{label_width + padding + (digit_width + padding) / 2}" y="19" fill="#000" opacity="0.3">{count_str}</text>
        <text x="{label_width + padding + (digit_width + padding) / 2}" y="18" fill="#fff">{count_str}</text>
    </g>
    
    <!-- Add clickable link -->
    <a href="{GITHUB_REPO_URL}">
        <rect width="{total_width}" height="28" fill="transparent"/>
    </a>
</svg>'''
    
    headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
    
    return Response(svg, mimetype='image/svg+xml', headers=headers)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)