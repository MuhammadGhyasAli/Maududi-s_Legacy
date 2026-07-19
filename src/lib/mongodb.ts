import { MongoClient, type Db } from 'mongodb';

const MONGODB_URL = process.env.MONGODB_URL || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'maududi_legacy';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

let client: MongoClient | null = null;
let lastConnectionAttempt = 0;
let connectionFailed = false;

function isServerless(): boolean {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

function createClient(): MongoClient {
  return new MongoClient(MONGODB_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    maxPoolSize: isServerless() ? 1 : 10,
  });
}

async function connectWithRetry(): Promise<MongoClient | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const c = createClient();
      await c.connect();
      await c.db().command({ ping: 1 });

      c.on('close', () => {
        client = null;
        connectionFailed = false;
      });

      client = c;
      connectionFailed = false;
      return c;
    } catch {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
      }
    }
  }
  return null;
}

export async function getDb(): Promise<Db | null> {
  if (MONGODB_URL) {
    if (client) {
      try {
        await client.db().command({ ping: 1 });
        return client.db(MONGODB_DB_NAME);
      } catch {
        client = null;
      }
    }

    if (isServerless()) {
      const c = createClient();
      try {
        await c.connect();
        await c.db().command({ ping: 1 });
        client = c;
        return c.db(MONGODB_DB_NAME);
      } catch {
        c.close().catch(() => {});
        return null;
      }
    }

    if (connectionFailed) {
      const now = Date.now();
      if (now - lastConnectionAttempt < 60_000) return null;
      lastConnectionAttempt = now;
      connectionFailed = false;
    }

    const c = await connectWithRetry();
    if (!c) {
      connectionFailed = true;
      lastConnectionAttempt = Date.now();
      return null;
    }
    return c.db(MONGODB_DB_NAME);
  }

  return null;
}

export async function getNextId(db: Db, collectionName: string): Promise<number> {
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: collectionName as any },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return counter?.seq ?? 1;
}
