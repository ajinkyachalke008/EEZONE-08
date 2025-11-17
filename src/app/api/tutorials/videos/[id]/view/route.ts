import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videoTutorials } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID format
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const videoId = parseInt(id);

    // Check if video exists
    const existingVideo = await db
      .select()
      .from(videoTutorials)
      .where(eq(videoTutorials.id, videoId))
      .limit(1);

    if (existingVideo.length === 0) {
      return NextResponse.json(
        {
          error: 'Video not found',
          code: 'VIDEO_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const currentViews = existingVideo[0].views || 0;

    // Increment view count and update timestamp
    const updatedVideo = await db
      .update(videoTutorials)
      .set({
        views: currentViews + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(videoTutorials.id, videoId))
      .returning();

    return NextResponse.json(updatedVideo[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}