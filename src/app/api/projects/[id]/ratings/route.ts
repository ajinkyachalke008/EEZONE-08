import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectRatings, projects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Validate project ID
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { error: 'Valid project ID is required', code: 'INVALID_PROJECT_ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get all ratings for the project
    const ratings = await db
      .select()
      .from(projectRatings)
      .where(eq(projectRatings.projectId, parseInt(projectId)))
      .orderBy(desc(projectRatings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(ratings, { status: 200 });
  } catch (error) {
    console.error('GET ratings error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Validate project ID
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { error: 'Valid project ID is required', code: 'INVALID_PROJECT_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, username, rating, review } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required', code: 'MISSING_USERNAME' },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Rating is required', code: 'MISSING_RATING' },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    const ratingValue = parseInt(String(rating));
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    // Validate project exists
    const projectExists = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (projectExists.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user already rated this project
    const existingRating = await db
      .select()
      .from(projectRatings)
      .where(
        and(
          eq(projectRatings.projectId, parseInt(projectId)),
          eq(projectRatings.userId, userId.trim())
        )
      )
      .limit(1);

    let result;
    let isUpdate = false;

    if (existingRating.length > 0) {
      // Update existing rating
      isUpdate = true;
      result = await db
        .update(projectRatings)
        .set({
          username: username.trim(),
          rating: ratingValue,
          review: review ? review.trim() : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projectRatings.id, existingRating[0].id))
        .returning();
    } else {
      // Create new rating
      result = await db
        .insert(projectRatings)
        .values({
          projectId: parseInt(projectId),
          userId: userId.trim(),
          username: username.trim(),
          rating: ratingValue,
          review: review ? review.trim() : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
    }

    // Recalculate project's rating average and count
    const allRatings = await db
      .select()
      .from(projectRatings)
      .where(eq(projectRatings.projectId, parseInt(projectId)));

    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Update project with new rating statistics
    await db
      .update(projects)
      .set({
        ratingAverage: parseFloat(averageRating.toFixed(2)),
        ratingCount: totalRatings,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, parseInt(projectId)));

    return NextResponse.json(result[0], { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error('POST rating error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}