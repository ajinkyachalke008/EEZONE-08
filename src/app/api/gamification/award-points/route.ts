import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats, achievements } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, points, activityType, metadata } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!points) {
      return NextResponse.json(
        { error: 'points is required', code: 'MISSING_POINTS' },
        { status: 400 }
      );
    }

    if (!activityType) {
      return NextResponse.json(
        { error: 'activityType is required', code: 'MISSING_ACTIVITY_TYPE' },
        { status: 400 }
      );
    }

    // Validate points is a positive integer
    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      return NextResponse.json(
        { error: 'points must be a positive integer', code: 'INVALID_POINTS' },
        { status: 400 }
      );
    }

    // Get or create user stats
    const existingStats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    let currentStats;
    const now = new Date().toISOString();

    if (existingStats.length === 0) {
      // Create new user stats
      const newStats = await db
        .insert(userStats)
        .values({
          userId,
          totalPoints: 0,
          level: 'Beginner',
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      currentStats = newStats[0];
    } else {
      currentStats = existingStats[0];
    }

    // Calculate new total points
    const newTotalPoints = currentStats.totalPoints + pointsValue;

    // Determine level based on total points
    let newLevel = 'Beginner';
    if (newTotalPoints >= 5000) {
      newLevel = 'Expert';
    } else if (newTotalPoints >= 2001) {
      newLevel = 'Advanced';
    } else if (newTotalPoints >= 501) {
      newLevel = 'Intermediate';
    }

    // Update user stats
    const updatedStats = await db
      .update(userStats)
      .set({
        totalPoints: newTotalPoints,
        level: newLevel,
        updatedAt: now,
      })
      .where(eq(userStats.userId, userId))
      .returning();

    // Create achievement record
    const achievementData = {
      userId,
      achievementType: activityType,
      pointsAwarded: pointsValue,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: now,
    };

    const newAchievement = await db
      .insert(achievements)
      .values(achievementData)
      .returning();

    // Return updated stats and achievement
    return NextResponse.json(
      {
        userStats: updatedStats[0],
        achievement: newAchievement[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}