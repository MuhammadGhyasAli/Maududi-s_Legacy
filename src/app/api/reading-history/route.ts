import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key_here_change_in_production';

function getUserId(request: NextRequest): number | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { sub: string };
    return parseInt(payload.sub, 10);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { bookId, title, slug, imageUrl, category } = await request.json();
    if (!bookId || !title) {
      return NextResponse.json({ detail: 'bookId and title are required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    await db.collection('reading_history').updateOne(
      { user_id: userId, book_id: bookId },
      {
        $set: {
          user_id: userId,
          book_id: bookId,
          title,
          slug: slug || '',
          image_url: imageUrl || '',
          category: category || '',
          opened_at: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const history = await db.collection('reading_history')
      .find({ user_id: userId })
      .sort({ opened_at: -1 })
      .limit(10)
      .project({ _id: 0, user_id: 0 })
      .toArray();

    return NextResponse.json(history);
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
