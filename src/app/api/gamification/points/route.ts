import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userPoints, userActivities } from '@/db/schema';
import { eq } from 'drizzle-orm';

function calculateLevel(totalPoints: number): string {
  if (totalPoints >= 1000) return 'Expert';
  if (totalPoints >= 500) return 'Advanced';
  if (totalPoints >= 100) return 'Intermediate';
  return 'Beginner';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, activity_type, points, metadata } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ 
        error: "user_id is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!activity_type) {
      return NextResponse.json({ 
        error: "activity_type is required",
        code: "MISSING_ACTIVITY_TYPE" 
      }, { status: 400 });
    }

    if (points === undefined || points === null) {
      return NextResponse.json({ 
        error: "points is required",
        code: "MISSING_POINTS" 
      }, { status: 400 });
    }

    // Validate points is a positive integer
    if (!Number.isInteger(points) || points <= 0) {
      return NextResponse.json({ 
        error: "points must be a positive integer",
        code: "INVALID_POINTS" 
      }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    // Check if user exists in userPoints table
    const existingUser = await db.select()
      .from(userPoints)
      .where(eq(userPoints.userId, user_id))
      .limit(1);

    let userPointsRecord;
    let statusCode = 200;

    if (existingUser.length === 0) {
      // Create new user with points
      const newTotalPoints = points;
      const newLevel = calculateLevel(newTotalPoints);

      userPointsRecord = await db.insert(userPoints)
        .values({
          userId: user_id,
          totalPoints: newTotalPoints,
          level: newLevel,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .returning();

      statusCode = 201;
    } else {
      // Add points to existing user
      const currentTotalPoints = existingUser[0].totalPoints;
      const newTotalPoints = currentTotalPoints + points;
      const newLevel = calculateLevel(newTotalPoints);

      userPointsRecord = await db.update(userPoints)
        .set({
          totalPoints: newTotalPoints,
          level: newLevel,
          updatedAt: timestamp,
        })
        .where(eq(userPoints.userId, user_id))
        .returning();
    }

    // Insert activity record
    await db.insert(userActivities)
      .values({
        userId: user_id,
        activityType: activity_type,
        pointsEarned: points,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: timestamp,
      });

    return NextResponse.json(userPointsRecord[0], { status: statusCode });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId is required
    if (!userId) {
      return NextResponse.json({ 
        error: "userId query parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    // Get user points record
    const userPointsRecord = await db.select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .limit(1);

    if (userPointsRecord.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(userPointsRecord[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}