import { NextRequest, NextResponse } from 'next/server';
import booksData from '@/data/books.json';

const { books, categories } = booksData;

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category');
  if (category && !categories.includes(category as any)) {
    return NextResponse.json({ detail: 'Invalid category' }, { status: 400 });
  }
  if (category && category !== 'All') {
    return NextResponse.json(books.filter((b: any) => b.category === category));
  }
  return NextResponse.json(books);
}
