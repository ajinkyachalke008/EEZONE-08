import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userBadgesNew } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Validate userId parameter
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    // Query user badges ordered by most recent first
    const badges = await db
      .select()
      .from(userBadgesNew)
      .where(eq(userBadgesNew.userId, userId))
      .orderBy(desc(userBadgesNew.earnedAt));

    // Return empty array if no badges found (not 404)
    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    console.error('GET badges error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}