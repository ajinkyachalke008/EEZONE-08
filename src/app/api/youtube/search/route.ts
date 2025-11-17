import { NextRequest, NextResponse } from 'next/server';

// YouTube API response types
interface YouTubeSearchResult {
  kind: string;
  etag: string;
  items: Array<{
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId: string;
    };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
      liveBroadcastContent: string;
    };
  }>;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface ParsedVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

// Cache in-memory (use Redis in production)
const searchCache = new Map<string, { data: ParsedVideo[]; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

async function youtubeSearch(
  query: string,
  maxResults: number = 10
): Promise<ParsedVideo[]> {
  const cacheKey = `${query}:${maxResults}`;
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not configured');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    maxResults: String(maxResults),
    type: 'video',
    key: apiKey,
    relevanceLanguage: 'en',
    safeSearch: 'moderate',
    videoEmbeddable: 'true',
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    
    // Handle quota exceeded
    if (response.status === 403 && error.error?.code === 'quotaExceeded') {
      throw new Error('YouTube API quota exceeded. Try again tomorrow.');
    }
    
    throw new Error(
      `YouTube API error: ${response.status} - ${error.error?.message || 'Unknown'}`
    );
  }

  const data: YouTubeSearchResult = await response.json();

  const videos: ParsedVideo[] = data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));

  // Cache result
  searchCache.set(cacheKey, { data: videos, timestamp: Date.now() });

  return videos;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const maxResults = searchParams.get('maxResults') || '12';

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter: q' },
        { status: 400 }
      );
    }

    const videos = await youtubeSearch(query, parseInt(maxResults, 10));

    return NextResponse.json({ videos }, { 
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && error.message.includes('quota') ? 429 : 500 }
    );
  }
}
