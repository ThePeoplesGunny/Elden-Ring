#!/usr/bin/env node
// Tarnished's Companion — portable launcher (Node fallback).
// Zero external dependencies — uses Node's built-in http and fs modules.
//
// Usage:
//   node start.js              # serves on 127.0.0.1:8000
//   node start.js 9090         # custom port
//   node start.js --no-open    # don't auto-open browser

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HERE = __dirname;
const args = process.argv.slice(2);
const port = parseInt(args.find(a => /^\d+$/.test(a)) || '8000', 10);
const noOpen = args.includes('--no-open');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(HERE, urlPath);
  if (!filePath.startsWith(HERE)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}/`;
  console.log(`Tarnished's Companion serving at ${url}`);
  console.log('Press Ctrl+C to stop.');
  if (!noOpen) {
    const opener = process.platform === 'win32' ? 'start ""' :
                   process.platform === 'darwin' ? 'open' : 'xdg-open';
    try { execSync(`${opener} "${url}"`, { stdio: 'ignore' }); } catch {}
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${port} in use. Try: node start.js 9090`);
  } else {
    console.error('Server error:', e.message);
  }
  process.exit(1);
});
