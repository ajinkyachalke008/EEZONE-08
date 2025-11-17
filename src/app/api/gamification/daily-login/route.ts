import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats, achievements } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Get user stats
    const existingStats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (existingStats.length === 0) {
      return NextResponse.json(
        { 
          error: 'User stats not found',
          code: 'USER_STATS_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const stats = existingStats[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    let newCurrentStreak = stats.currentStreak;
    let shouldAwardPoints = true;

    // Parse lastLoginDate if exists
    if (stats.lastLoginDate) {
      const lastLogin = new Date(stats.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Compare dates
      if (lastLogin.getTime() === today.getTime()) {
        // Already logged in today - do nothing
        shouldAwardPoints = false;
        return NextResponse.json({
          message: 'Already logged in today',
          stats: stats,
          pointsAwarded: 0
        });
      } else if (lastLogin.getTime() === yesterday.getTime()) {
        // Last login was yesterday - increment streak
        newCurrentStreak = stats.currentStreak + 1;
      } else if (lastLogin.getTime() < yesterday.getTime()) {
        // Last login was before yesterday - reset streak
        newCurrentStreak = 1;
      }
    } else {
      // No previous login - set streak to 1
      newCurrentStreak = 1;
    }

    // Calculate new longest streak
    const newLongestStreak = Math.max(newCurrentStreak, stats.longestStreak);

    // Award points for daily login
    const pointsToAward = 5;
    const newTotalPoints = stats.totalPoints + pointsToAward;

    // Calculate level based on points
    let newLevel = 'Beginner';
    if (newTotalPoints >= 1000) {
      newLevel = 'Expert';
    } else if (newTotalPoints >= 500) {
      newLevel = 'Advanced';
    } else if (newTotalPoints >= 100) {
      newLevel = 'Intermediate';
    }

    // Update user stats
    const updatedStats = await db.update(userStats)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastLoginDate: todayISO,
        totalPoints: newTotalPoints,
        level: newLevel,
        updatedAt: new Date().toISOString()
      })
      .where(eq(userStats.userId, userId))
      .returning();

    if (updatedStats.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update user stats',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Create achievement record
    await db.insert(achievements)
      .values({
        userId: userId,
        achievementType: 'daily_login',
        pointsAwarded: pointsToAward,
        metadata: JSON.stringify({
          streak: newCurrentStreak,
          loginDate: todayISO
        }),
        createdAt: new Date().toISOString()
      });

    return NextResponse.json({
      message: 'Daily login recorded successfully',
      stats: updatedStats[0],
      pointsAwarded: pointsToAward,
      streakInfo: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        isNewRecord: newCurrentStreak === newLongestStreak && newCurrentStreak > stats.longestStreak
      }
    }, { status: 201 });

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