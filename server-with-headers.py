#!/usr/bin/env python3
"""HTTP server with SharedArrayBuffer-supporting headers for IMG.LY integration."""

import http.server
import socketserver
import os

PORT = 8082

class ReuseAddrServer(socketserver.TCPServer):
    allow_reuse_address = True

class SharedArrayBufferHandler(http.server.SimpleHTTPRequestHandler):
    """Handler that adds COOP and COEP headers for SharedArrayBuffer support."""
    
    def end_headers(self):
        # Critical headers for SharedArrayBuffer and IMG.LY WASM
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        # Allow IMG.LY CDN to load
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with ReuseAddrServer(("", PORT), SharedArrayBufferHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Headers set:")
        print("  Cross-Origin-Opener-Policy: same-origin")
        print("  Cross-Origin-Embedder-Policy: require-corp")
        print("  Access-Control-Allow-Origin: *")
        print()
        print(f"Navigate to: http://localhost:{PORT}")
        httpd.serve_forever()