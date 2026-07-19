import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'jamaatpk.b-cdn.net',
  'jamaatwomen.org',
  'archive.org',
  'ia6007.us.archive.org',
  'ia8007.us.archive.org',
  'ia601200.us.archive.org',
  'ia601408.us.archive.org',
  'ia800700.us.archive.org',
  'ia801408.us.archive.org',
  'ia904500.us.archive.org',
  'ia906000.us.archive.org',
]);

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB
const FETCH_TIMEOUT_MS = 15000;

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTS.has(hostname)) return true;
  for (const allowed of ALLOWED_HOSTS) {
    if (hostname.endsWith('.' + allowed)) return true;
  }
  return false;
}

function validateUrl(url: string): { ok: true; parsed: URL } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: 'Only HTTP(S) URLs are allowed' };
  }

  if (!isAllowedHost(parsed.hostname)) {
    return { ok: false, error: `Host '${parsed.hostname}' is not in the allowlist` };
  }

  return { ok: true, parsed };
}

function pdfResponse(buffer: Buffer, statusHeaders: Record<string, string> = {}): NextResponse {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
      ...statusHeaders,
    },
  });
}

async function fetchPdf(url: string, method: 'GET' | 'HEAD' = 'GET'): Promise<{ response?: Response; error?: string }> {
  const validation = validateUrl(url);
  if (!validation.ok) {
    return { error: validation.error };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(validation.parsed.toString(), {
      method,
      headers: {
        'User-Agent': 'MaududiLegacy/1.0 (PDF Proxy)',
        'Accept': 'application/pdf',
      },
      redirect: 'manual',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const redirectValidation = validateUrl(location);
        if (!redirectValidation.ok) {
          return { error: 'Redirect target is not allowed' };
        }
      }
      return { error: `Unexpected redirect (${response.status})` };
    }

    if (!response.ok) {
      return { error: `Upstream error: ${response.status} ${response.statusText}` };
    }

    const contentType = response.headers.get('content-type') || '';
    if (method === 'GET' && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      console.warn('PDF proxy: unexpected content-type:', contentType);
    }

    return { response };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { error: 'Request timed out' };
    }
    return { error: 'Failed to connect to upstream' };
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ detail: 'Missing url parameter' }, { status: 400 });
  }

  const { response, error } = await fetchPdf(url, 'GET');
  if (error) {
    return NextResponse.json({ detail: error }, { status: 400 });
  }

  const arrayBuffer = await response!.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PDF_SIZE) {
    return NextResponse.json({ detail: 'PDF exceeds 50 MB limit' }, { status: 413 });
  }

  return pdfResponse(Buffer.from(arrayBuffer));
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
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

  const { response, error } = await fetchPdf(url, 'HEAD');
  if (error) {
    return NextResponse.json({ detail: error }, { status: 400 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': response!.headers.get('content-length') || '0',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}