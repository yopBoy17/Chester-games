const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8081;
const HOST = '0.0.0.0';
const ROOT = __dirname;
const SAVE_FILE = path.join(ROOT, 'data', 'game-save.json');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === '/api/save') {
    if (request.method === 'GET') {
      let state = {};
      try {
        state = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
      } catch {
        // The first launch has no save yet.
      }
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(state));
      return;
    }

    if (request.method === 'PUT') {
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1_000_000) request.destroy();
      });
      request.on('end', () => {
        try {
          const state = JSON.parse(body);
          fs.mkdirSync(path.dirname(SAVE_FILE), { recursive: true });
          fs.writeFileSync(SAVE_FILE, JSON.stringify(state));
          response.writeHead(204);
          response.end();
        } catch {
          response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          response.end(JSON.stringify({ error: 'Invalid save data' }));
        }
      });
      return;
    }

    response.writeHead(405, { Allow: 'GET, PUT' });
    response.end();
    return;
  }

  const relativePath = requestUrl.pathname === '/' ? 'index.html' : decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relativePath);

  if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`Factory: http://localhost:${PORT}`);
});
