import express from 'express';
import { MongoClient, Db } from 'mongodb';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json({ limit: '15mb' }));

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-DSCPS:WwrZzoBT6LE8y6Jp@dscps.yuaxrn8.mongodb.net/?retryWrites=true&w=majority";

async function getDb(): Promise<Db> {
  if (!db) {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('dscps');
    console.log("Connected to MongoDB successfully");
  }
  return db;
}

// REST API Endpoints with MongoDB
// Bulk load all states in one dynamic roundtrip
app.get('/api/state', async (req, res) => {
  try {
    const dbInstance = await getDb();
    const col = dbInstance.collection<{ _id: string; data: any; updatedAt?: Date }>('app_state');
    const allDocs = await col.find({}).toArray();
    
    const stateMap: Record<string, any> = {};
    allDocs.forEach(doc => {
      if (doc && doc._id) {
        stateMap[doc._id.toString()] = doc.data;
      }
    });
    
    res.json({ success: true, states: stateMap });
  } catch (error: any) {
    console.error("Error fetching all states from MongoDB:", error);
    res.status(200).json({ success: false, error: error.message, states: {} });
  }
});

// Retrieve a specific key's dataset from MongoDB
app.get('/api/state/:key', async (req, res) => {
  try {
    const dbInstance = await getDb();
    const col = dbInstance.collection<{ _id: string; data: any; updatedAt?: Date }>('app_state');
    const doc = await col.findOne({ _id: req.params.key as any });
    if (doc) {
      return res.json({ success: true, data: doc.data });
    }
    res.json({ success: true, data: null });
  } catch (error: any) {
    console.error(`Error loading state for key ${req.params.key} from MongoDB:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update or create a specific key's dataset on MongoDB
app.post('/api/state/:key', async (req, res) => {
  try {
    const dbInstance = await getDb();
    const col = dbInstance.collection<{ _id: string; data: any; updatedAt?: Date }>('app_state');
    const { data } = req.body;
    
    await col.updateOne(
      { _id: req.params.key as any },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true }
    );
    
    res.json({ success: true });
  } catch (error: any) {
    console.error(`Error updating state for key ${req.params.key} in MongoDB:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
