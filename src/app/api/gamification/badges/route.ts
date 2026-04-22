import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userBadges } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      // If no userId, return demo available badges catalog
      return NextResponse.json([
        { id: '1', name: 'First Login', description: 'Logged in for the first time', badgeIcon: '👋' },
        { id: '2', name: 'Quiz Master', description: 'Scored 100% on a quiz', badgeIcon: '🧠' }
      ], { status: 200 });
    }

    try {
      const userBadgesList = await db.select()
        .from(userBadges)
        .where(eq(userBadges.userId, userId))
        .orderBy(asc(userBadges.earnedAt));

      return NextResponse.json(userBadgesList, { status: 200 });
    } catch (dbError) {
      // Fallback if DB is down
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      badgeId,
    } = body;

    // Validate all required fields
    if (!userId) {
      return NextResponse.json(
        {
          error: 'userId is required',
          code: 'MISSING_USER_ID',
        },
        { status: 400 }
      );
    }

    if (!badgeId) {
      return NextResponse.json(
        {
          error: 'badgeId is required',
          code: 'MISSING_BADGE_ID',
        },
        { status: 400 }
      );
    }

    // Create new badge
    const newBadge = await db
      .insert(userBadges)
      .values({
        userId: userId.trim(),
        badgeId: badgeId.trim(),
        earnedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newBadge[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}