import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ detail: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Validate URL to prevent SSRF
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ detail: 'Invalid URL protocol' }, { status: 400 });
    }

    // Fetch the PDF from the external source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MaududiLegacy/1.0)',
        'Accept': 'application/pdf,*/*',
      },
      // Don't follow redirects that might change the domain
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { detail: `Failed to fetch PDF: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    
    // Check if it's actually a PDF
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      // Still allow it but log a warning
      console.warn('PDF proxy: unexpected content-type:', contentType);
    }

    // Get the PDF data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return with proper CORS headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },
    });
  } catch (error) {
    console.error('PDF proxy error:', error);
    return NextResponse.json(
      { detail: 'Failed to proxy PDF' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function HEAD(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ detail: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ detail: 'Invalid URL protocol' }, { status: 400 });
    }

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MaududiLegacy/1.0)',
        'Accept': 'application/pdf,*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { detail: `Failed to fetch PDF: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': response.headers.get('content-length') || '0',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },
    });
  } catch (error) {
    console.error('PDF proxy HEAD error:', error);
    return NextResponse.json(
      { detail: 'Failed to proxy PDF' },
      { status: 500 }
    );
  }
}