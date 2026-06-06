import { NextRequest, NextResponse } from 'next/server';
import booksData from '@/data/books.json';
import { slugify } from '@/utils/slugify';

const { books, categories } = booksData;
const slugMap = Object.fromEntries(
  categories.map((c: string) => [slugify(c), c]),
);

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('category');
  const category = slug ? slugMap[slug] : null;
  if (slug && !category) {
    return NextResponse.json({ detail: 'Invalid category' }, { status: 400 });
  }
  if (category && category !== 'All') {
    return NextResponse.json(books.filter((b: any) => b.category === category));
  }
  return NextResponse.json(books);
}
