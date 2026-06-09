#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import json
import os

PORT = int(os.environ.get('PORT', 8765))
KIMI_API_KEY = os.environ.get('KIMI_API_KEY', 'sk-g0qCfVX5ekBDmzu1QsdLhW4Sn62CObY6EIBbl0eTWe4YnWLx')

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)

            req = urllib.request.Request(
                'https://api.moonshot.cn/v1/chat/completions',
                data=body,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {KIMI_API_KEY}'
                },
                method='POST'
            )

            try:
                with urllib.request.urlopen(req) as resp:
                    self.send_response(resp.status)
                    for header, value in resp.headers.items():
                        if header.lower() in ('content-type', 'cache-control', 'connection'):
                            self.send_header(header, value)
                    self.end_headers()
                    self.wfile.write(resp.read())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running on port {PORT}")
    httpd.serve_forever()
