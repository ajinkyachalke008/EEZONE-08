import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for draw.io Export API (PNG/PDF/SVG generation)
 * Forwards requests to https://convert.diagrams.net/node/export
 * This bypasses the CORS restriction that blocks localhost
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;

    // The export endpoint accepts both JSON and form-encoded data
    if (contentType.includes('application/json')) {
      body = await request.text();
    } else {
      body = await request.text();
    }

    const response = await fetch('https://convert.diagrams.net/node/export', {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'application/x-www-form-urlencoded',
        'Origin': 'https://app.diagrams.net',
        'Referer': 'https://app.diagrams.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }

    // The export endpoint returns binary data (PNG/PDF)
    const responseContentType = response.headers.get('content-type') || 'application/octet-stream';
    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': responseContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Draw.io Export proxy error:', error);
    return NextResponse.json(
      { error: 'Export proxy error', message: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
