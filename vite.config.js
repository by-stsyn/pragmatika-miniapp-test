import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiPlugin() {
  const handler = async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) {
      return next();
    }

    const endpoint = url.pathname
      .replace(/^\/api\//, '')
      .replace(/\.(js|php)$/, '')
      .replace(/\/$/, '');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const routeMap = {
      'fetch-hot-feed': () => import('./api/fetch-hot-feed.js'),
      'fetch-feed-all': () => import('./api/fetch-feed-all.js'),
      'fetch-feed-used': () => import('./api/fetch-feed-used.js'),
      'fetch-news': () => import('./api/fetch-news.js'),
      'fetch-offers': () => import('./api/fetch-offers.js'),
      'send-booking': () => import('./api/send-booking.js'),
      'calltouch': () => import('./api/calltouch.js'),
      'debug-ip': () => import('./api/debug-ip.js'),
      'render': () => import('./api/render.js'),
    };

    if (!routeMap[endpoint]) {
      return next();
    }

    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data) {
      if (!this.getHeader('Content-Type')) {
        this.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      this.end(JSON.stringify(data));
      return this;
    };
    res.send = function (data) {
      this.end(data);
      return this;
    };

    const query = {};
    for (const [key, value] of url.searchParams.entries()) {
      query[key] = value;
    }
    req.query = query;

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        req.body = rawBody;
      }
    } else {
      req.body = {};
    }

    try {
      const mod = await routeMap[endpoint]();
      await mod.default(req, res);
    } catch (err) {
      console.error(`API Error on ${req.url}:`, err);
      if (!res.writableEnded) {
        res.status(500).json({ error: err.message });
      }
    }
  };

  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    cors: true,
  },
});
