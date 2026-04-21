#!/usr/bin/env python3
"""Tarnished's Companion — portable launcher.

Starts a minimal static HTTP server rooted at this folder. No external deps.
Cross-platform: runs on Python 3.7+. Falls back to Node if Python missing
(see start.sh / start.bat).

Usage:
    python start.py              # serves on 127.0.0.1:8000
    python start.py 9090         # custom port
    python start.py --no-open    # don't auto-open browser
"""
from __future__ import annotations
import argparse
import http.server
import os
import socketserver
import sys
import webbrowser
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_PORT = 8000


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("port", nargs="?", type=int, default=DEFAULT_PORT, help="port to bind (default %(default)s)")
    ap.add_argument("--no-open", action="store_true", help="don't auto-open browser")
    args = ap.parse_args()

    os.chdir(HERE)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, fmt, *a):
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % a))

    try:
        with socketserver.TCPServer(("127.0.0.1", args.port), Handler) as httpd:
            url = f"http://127.0.0.1:{args.port}/"
            print(f"Tarnished's Companion serving at {url}")
            print("Press Ctrl+C to stop.")
            if not args.no_open:
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        return 0
    except OSError as e:
        print(f"Error binding to port {args.port}: {e}", file=sys.stderr)
        print("Try a different port: python start.py 9090", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
