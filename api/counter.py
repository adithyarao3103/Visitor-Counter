from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json
import os
from redis import Redis
from urllib.parse import urlparse

# Initialize Redis connection using Vercel KV
def get_redis():
    redis_url = os.environ.get('REDIS_URL')
    if not redis_url:
        raise Exception("REDIS_URL environment variable not set")
    
    url = urlparse(redis_url)
    return Redis(
        host=url.hostname,
        port=url.port,
        username=url.username,
        password=url.password,
        ssl=True,
        ssl_cert_reqs=None
    )

def get_count():
    try:
        redis = get_redis()
        count = redis.get('visitor_count')
        return int(count) if count else 0
    except Exception as e:
        print(f"Error getting count: {e}")
        return 0

def increment_count():
    try:
        redis = get_redis()
        return redis.incr('visitor_count')
    except Exception as e:
        print(f"Error incrementing count: {e}")
        return get_count() + 1

def create_svg(count):
    count_str = str(count)
    digit_width = len(count_str) * 10
    label_width = 80
    padding = 20
    total_width = label_width + digit_width + padding * 2

    LABEL_BG_COLOR = "#007EC6"
    COUNT_BG_COLOR = "#0366D6"
    GITHUB_REPO_URL = "https://github.com/adithyarao3103"  

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{total_width}" height="28">
    <linearGradient id="labelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0080CF"/>
        <stop offset="100%" style="stop-color:{LABEL_BG_COLOR}"/>
    </linearGradient>
    <linearGradient id="countGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0474E5"/>
        <stop offset="100%" style="stop-color:{COUNT_BG_COLOR}"/>
    </linearGradient>

    <rect width="{label_width + padding}" height="28" fill="url(#labelGradient)"/>
    <rect x="{label_width + padding}" width="{digit_width + padding}" height="28" fill="url(#countGradient)"/>
    
    <rect width="{total_width}" height="1" fill="#ffffff" opacity="0.1"/>
    
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">
        <text x="{(label_width + padding) / 2}" y="19" fill="#000" opacity="0.3">VISITORS</text>
        <text x="{(label_width + padding) / 2}" y="18" fill="#fff">VISITORS</text>
        
        <text x="{label_width + padding + (digit_width + padding) / 2}" y="19" fill="#000" opacity="0.3">{count_str}</text>
        <text x="{label_width + padding + (digit_width + padding) / 2}" y="18" fill="#fff">{count_str}</text>
    </g>
    
    <a href="{GITHUB_REPO_URL}">
        <rect width="{total_width}" height="28" fill="transparent"/>
    </a>
</svg>'''

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        if path == '/api/increment':
            count = increment_count()
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Counter incremented to {count}".encode())
            
        elif path == '/api/show':
            self.send_header('Content-type', 'image/svg+xml')
            self.end_headers()
            count = get_count()
            self.wfile.write(create_svg(count).encode())
            
        else:  # Root path
            self.send_header('Location', 'https://github.com/adithyarao3103')  
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write("Redirecting to GitHub...".encode())