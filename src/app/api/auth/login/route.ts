import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    // We expect urlencoded form data from the client apiService
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: response.status });
    }
    
    const data = await response.json();
    
    const cookieStore = await cookies();
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in || 86400,
      path: '/',
    });
    
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
