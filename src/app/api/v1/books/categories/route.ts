import { NextResponse } from 'next/server';
import booksData from '@/data/books.json';

export async function GET() {
  return NextResponse.json(booksData.categories);
}
