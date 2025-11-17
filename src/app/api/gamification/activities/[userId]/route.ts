import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userActivities } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const activityTypeParam = searchParams.get('activity_type');

    // Validate and set limit (default: 50, max: 100)
    let limit = 50;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { 
            error: 'Limit must be a positive number',
            code: 'INVALID_LIMIT'
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100);
    }

    // Validate and set offset (default: 0)
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { 
            error: 'Offset must be a non-negative number',
            code: 'INVALID_OFFSET'
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Build query
    let query = db.select().from(userActivities);

    // Apply filters
    if (activityTypeParam && activityTypeParam.trim() !== '') {
      query = query.where(
        and(
          eq(userActivities.userId, userId),
          eq(userActivities.activityType, activityTypeParam.trim())
        )
      );
    } else {
      query = query.where(eq(userActivities.userId, userId));
    }

    // Apply sorting, limit, and offset
    const activities = await query
      .orderBy(desc(userActivities.createdAt))
      .limit(limit)
      .offset(offset);

    // Return results (empty array if no activities found)
    return NextResponse.json(activities, { status: 200 });

  } catch (error) {
    console.error('GET /api/gamification/activities/[userId] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}