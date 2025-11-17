import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leaderboardEntries, userStats } from '@/db/schema';
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
    const category = searchParams.get('category') || 'overall';
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

    // Query leaderboard_entries table
    let query = db.select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.period, period),
          eq(leaderboardEntries.category, category)
        )
      )
      .orderBy(leaderboardEntries.rank)
      .limit(limit);

    const entries = await query;

    // If no entries exist for this period/category, generate from user_stats
    if (entries.length === 0) {
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
    }

    // Format existing entries
    const leaderboard = entries.map(entry => ({
      userId: entry.userId,
      username: entry.username,
      totalPoints: entry.totalPoints,
      level: entry.level,
      rank: entry.rank,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('GET leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, category = 'overall' } = body;

    if (!period) {
      return NextResponse.json(
        { 
          error: 'Period is required',
          code: 'MISSING_PERIOD'
        },
        { status: 400 }
      );
    }

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

    // Query user_stats and calculate ranks
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

    // Calculate ranks
    const rankedStats = stats.map((stat, index) => ({
      userId: stat.userId,
      username: `User_${stat.userId.substring(0, 8)}`, // Placeholder username
      totalPoints: stat.totalPoints,
      level: stat.level,
      rank: index + 1,
      period,
      category,
      periodStart: start || new Date(0).toISOString(),
      periodEnd: end,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Delete existing leaderboard_entries for this period/category
    await db.delete(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.period, period),
          eq(leaderboardEntries.category, category)
        )
      );

    // Insert new leaderboard entries
    if (rankedStats.length > 0) {
      await db.insert(leaderboardEntries).values(rankedStats);
    }

    return NextResponse.json(
      {
        message: 'Leaderboard updated successfully',
        period,
        category,
        entriesCreated: rankedStats.length,
        periodStart: start || 'beginning',
        periodEnd: end,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}