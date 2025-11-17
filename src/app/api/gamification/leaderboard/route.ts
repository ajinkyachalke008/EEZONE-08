import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats } from '@/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

type Period = 'daily' | 'weekly' | 'monthly' | 'all_time';

function calculateDateRange(period: Period): { start: string | null; end: string } {
  const now = new Date();
  const end = now.toISOString();
  
  switch (period) {
    case 'daily':
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: startOfDay.toISOString(), end };
    
    case 'weekly':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: weekAgo.toISOString(), end };
    
    case 'monthly':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: monthAgo.toISOString(), end };
    
    case 'all_time':
      return { start: null, end };
    
    default:
      return { start: null, end };
  }
}

function isValidPeriod(period: string): period is Period {
  return ['daily', 'weekly', 'monthly', 'all_time'].includes(period);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'all_time') as string;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    if (!isValidPeriod(period)) {
      return NextResponse.json(
        { 
          error: 'Invalid period. Must be one of: daily, weekly, monthly, all_time',
          code: 'INVALID_PERIOD'
        },
        { status: 400 }
      );
    }

    const { start, end } = calculateDateRange(period);

    // Query userStats table
    let statsQuery = db.select({
      userId: userStats.userId,
      totalPoints: userStats.totalPoints,
      level: userStats.level,
      createdAt: userStats.createdAt,
    }).from(userStats);

    // Apply date filter for non-all_time periods
    if (start) {
      statsQuery = statsQuery.where(gte(userStats.createdAt, start)) as any;
    }

    const stats = await statsQuery.orderBy(desc(userStats.totalPoints));

    // Calculate ranks and format response
    const leaderboard = stats.map((stat, index) => ({
      userId: stat.userId,
      username: `User_${stat.userId.substring(0, 8)}`, // Placeholder username
      totalPoints: stat.totalPoints,
      level: stat.level,
      rank: index + 1,
    }));

    return NextResponse.json(leaderboard.slice(0, limit));
  } catch (error) {
    console.error('GET leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}