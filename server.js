import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1:3000'}`);
  const pathname = parsedUrl.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    const route = pathname.replace(/^\/api\//, '').replace(/\.js$/, '');
    const apiFile = path.resolve(process.cwd(), 'api', `${route}.js`);

    if (!fs.existsSync(apiFile)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: `API route /api/${route} not found` }));
    }

    try {
      let body = {};
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString();
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            body = raw;
          }
        }
      }

      req.query = Object.fromEntries(parsedUrl.searchParams.entries());
      req.body = body;

      const originalEnd = res.end.bind(res);
      res.status = function (code) {
        res.statusCode = code;
        return res;
      };
      res.json = function (data) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return originalEnd(JSON.stringify(data));
      };
      res.send = function (data) {
        if (typeof data === 'object' && !Buffer.isBuffer(data)) {
          return res.json(data);
        }
        return originalEnd(data);
      };

      const mod = await import(pathToFileURL(apiFile).href);
      const handler = mod.default || mod;
      return await handler(req, res);
    } catch (err) {
      console.error(`Error handling /api/${route}:`, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
  }

  // Handle static assets
  let filePath = path.join(DIST_DIR, pathname);

  // Check if file exists in dist
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', mime);
    return fs.createReadStream(filePath).pipe(res);
  }

  // SPA fallback to dist/index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
