import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userBadgesNew } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: "userId query parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const badges = await db.select()
      .from(userBadgesNew)
      .where(eq(userBadgesNew.userId, userId))
      .orderBy(asc(userBadgesNew.earnedAt));

    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      badgeId,
      badgeName,
      badgeDescription,
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

    if (!badgeName) {
      return NextResponse.json(
        {
          error: 'badgeName is required',
          code: 'MISSING_BADGE_NAME',
        },
        { status: 400 }
      );
    }

    if (!badgeDescription) {
      return NextResponse.json(
        {
          error: 'badgeDescription is required',
          code: 'MISSING_BADGE_DESCRIPTION',
        },
        { status: 400 }
      );
    }

    // Create new badge
    const newBadge = await db
      .insert(userBadgesNew)
      .values({
        userId: userId.trim(),
        badgeId: badgeId.trim(),
        badgeName: badgeName.trim(),
        badgeDescription: badgeDescription.trim(),
        earnedAt: new Date().toISOString(),
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