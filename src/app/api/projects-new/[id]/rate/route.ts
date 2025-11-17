import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectRatingsNew, projectsNew } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate project ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID' 
        },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { user_id, rating } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { 
          error: 'Rating is required',
          code: 'MISSING_RATING' 
        },
        { status: 400 }
      );
    }

    // Validate rating value
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { 
          error: 'Rating must be an integer between 1 and 5',
          code: 'INVALID_RATING_VALUE' 
        },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db
      .select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Check if user already rated this project
    const existingRating = await db
      .select()
      .from(projectRatingsNew)
      .where(
        and(
          eq(projectRatingsNew.projectId, projectId),
          eq(projectRatingsNew.userId, user_id)
        )
      )
      .limit(1);

    // If existing rating found, update it
    if (existingRating.length > 0) {
      const updatedRating = await db
        .update(projectRatingsNew)
        .set({
          rating: ratingValue
        })
        .where(
          and(
            eq(projectRatingsNew.projectId, projectId),
            eq(projectRatingsNew.userId, user_id)
          )
        )
        .returning();

      return NextResponse.json(
        {
          ...updatedRating[0],
          message: 'Rating updated'
        },
        { status: 200 }
      );
    }

    // No existing rating, create new one
    const newRating = await db
      .insert(projectRatingsNew)
      .values({
        projectId,
        userId: user_id,
        rating: ratingValue,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRating[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/projects-new/[id]/rate error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}