import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videoTutorials } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const videoId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { rating, userId } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: "User ID is required",
          code: "MISSING_USER_ID" 
        },
        { status: 400 }
      );
    }

    // Validate rating is provided
    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { 
          error: "Rating is required",
          code: "MISSING_RATING" 
        },
        { status: 400 }
      );
    }

    // Validate rating is a number
    if (typeof rating !== 'number' || isNaN(rating)) {
      return NextResponse.json(
        { 
          error: "Rating must be a valid number",
          code: "INVALID_RATING_TYPE" 
        },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { 
          error: "Rating must be between 1 and 5",
          code: "INVALID_RATING_VALUE" 
        },
        { status: 400 }
      );
    }

    // Check if video exists
    const existingVideo = await db.select()
      .from(videoTutorials)
      .where(eq(videoTutorials.id, videoId))
      .limit(1);

    if (existingVideo.length === 0) {
      return NextResponse.json(
        { 
          error: "Video not found",
          code: "VIDEO_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    const video = existingVideo[0];
    const currentRating = video.rating || 0;

    // Calculate new rating
    let newRating: number;
    if (currentRating > 0) {
      newRating = (currentRating + rating) / 2;
    } else {
      newRating = rating;
    }

    // Round to 1 decimal place
    newRating = Math.round(newRating * 10) / 10;

    // Update video with new rating
    const updatedVideo = await db.update(videoTutorials)
      .set({
        rating: newRating,
        updatedAt: new Date().toISOString()
      })
      .where(eq(videoTutorials.id, videoId))
      .returning();

    return NextResponse.json(updatedVideo[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}