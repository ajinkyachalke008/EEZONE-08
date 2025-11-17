import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: "userId query parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      return NextResponse.json({ 
        error: "User stats not found",
        code: "USER_STATS_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(stats[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const existingStats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (existingStats.length === 0) {
      const newStats = await db.insert(userStats)
        .values({
          userId,
          totalPoints: updates.totalPoints ?? 0,
          level: updates.level ?? 'Beginner',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      return NextResponse.json(newStats[0], { status: 201 });
    } else {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (updates.totalPoints !== undefined) updateData.totalPoints = updates.totalPoints;
      if (updates.level !== undefined) updateData.level = updates.level;

      const updatedStats = await db.update(userStats)
        .set(updateData)
        .where(eq(userStats.userId, userId))
        .returning();

      return NextResponse.json(updatedStats[0], { status: 200 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}