import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for draw.io AI Generate API
 * Forwards requests to https://www.draw.io/generate/v3
 * This bypasses the CORS restriction that blocks localhost
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch('https://www.draw.io/generate/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://app.diagrams.net',
        'Referer': 'https://app.diagrams.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Upstream error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Draw.io Generate proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
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
