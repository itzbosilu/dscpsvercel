import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json({ limit: '15mb' }));

// Health check resource
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', datetime: new Date().toISOString() });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback route
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
