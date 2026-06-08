import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const court = searchParams.get('court') || '';
    const cursor = searchParams.get('cursor') || '';
    const type = searchParams.get('type') || '';

    const url = new URL('https://www.courtlistener.com/api/rest/v4/search/');
    
    // Build query parameters for CourtListener v4 search
    if (q) url.searchParams.append('q', q);
    if (court) url.searchParams.append('court', court);
    if (cursor) url.searchParams.append('cursor', cursor);
    if (type) url.searchParams.append('type', type);

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    const apiKey = process.env.COURTLISTENER_API_KEY;
    if (apiKey) {
      headers['Authorization'] = `Token ${apiKey}`;
    }

    const response = await fetch(url.toString(), {
      headers,
      // We don't cache since searches can be highly dynamic and user-driven
      cache: 'no-store'
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: 'CourtListener API key is unauthorized or rate-limited. Please verify the COURTLISTENER_API_KEY in frontend/.env.local.' },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `CourtListener API Error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[CourtListener Proxy Error]:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
