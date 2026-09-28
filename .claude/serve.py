"""Static file server for previewing the site locally.

Python's own `python -m http.server` would do the job, except that it lets the
browser cache aggressively: edits to css/style.css or js/script.js often keep
showing the old file until a hard reload, which is a confusing way to lose an
afternoon. This is the same server with caching turned off.

Needs nothing beyond the standard library.

    python .claude/serve.py          # http://localhost:8765
    python .claude/serve.py 9000     # another port

Serves the directory it is run from, so run it from the repository root.
"""

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DEFAULT_PORT = 8765


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    server = ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    print("Serving this folder at http://localhost:%d — Ctrl+C to stop" % port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
