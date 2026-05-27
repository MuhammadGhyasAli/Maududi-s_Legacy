import { MongoClient, type Db } from 'mongodb';

const MONGODB_URL = process.env.MONGODB_URL || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'maududi_legacy';

let client: MongoClient | null = null;

export async function getDb(): Promise<Db | null> {
  if (client) return client.db(MONGODB_DB_NAME);
  try {
    const c = new MongoClient(MONGODB_URL, { serverSelectionTimeoutMS: 5000 });
    await c.connect();
    await c.db().command({ ping: 1 });
    client = c;
    return c.db(MONGODB_DB_NAME);
  } catch {
    return null;
  }
}

export async function getNextId(db: Db, collectionName: string): Promise<number> {
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: collectionName as any },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return counter?.seq ?? 1;
}
