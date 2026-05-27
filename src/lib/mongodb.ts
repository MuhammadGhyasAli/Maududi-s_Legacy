import { MongoClient, Db } from 'mongodb';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://syedali:yxUXgGk5LVUb36Cb@cluster0.ne39ibs.mongodb.net/?appName=Cluster0';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'maududi_legacy';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db | null> {
  if (cachedDb) return cachedDb;
  try {
    const client = new MongoClient(MONGODB_URL, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    await client.db().command({ ping: 1 });
    cachedClient = client;
    cachedDb = client.db(MONGODB_DB_NAME);
    return cachedDb;
  } catch {
    return null;
  }
}

export async function getNextId(db: Db, collectionName: string): Promise<number> {
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: collectionName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return counter?.seq ?? 1;
}
