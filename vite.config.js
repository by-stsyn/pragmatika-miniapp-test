import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function apiDevPlugin() {
  return {
    name: 'api-dev-handlers',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1:3000'}`);
        const route = parsedUrl.pathname.replace(/^\/api\//, '').replace(/\.js$/, '');
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
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});