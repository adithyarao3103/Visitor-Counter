from flask import Flask, Response
from threading import Lock

app = Flask(__name__)

# Global counter with thread-safe lock
visitor_count = 0
counter_lock = Lock()

@app.route('/increment')
def increment():
    global visitor_count
    with counter_lock:
        visitor_count += 1
    return f"Counter incremented to {visitor_count}"

@app.route('/show')
def show():
    # Create an SVG that displays the current count
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
    <rect width="200" height="100" fill="#f0f0f0"/>
    <text x="100" y="50" font-family="Arial" font-size="24" text-anchor="middle" alignment-baseline="middle">
        Visitors: {visitor_count}
    </text>
</svg>'''
    
    return Response(svg, mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
