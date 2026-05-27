import { NextResponse } from 'next/server';
import booksData from '@/data/books.json';

export async function GET(_request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const id = parseInt(bookId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ detail: 'Invalid book ID' }, { status: 400 });
  }
  const book = booksData.books.find((b: any) => b.id === id);
  if (!book) {
    return NextResponse.json({ detail: `Book with id ${id} not found` }, { status: 404 });
  }
  return NextResponse.json(book);
}
