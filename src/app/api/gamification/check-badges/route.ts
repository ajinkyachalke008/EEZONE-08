import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats, badges, userBadges, achievements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validate required field
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    // Get user stats
    const userStatsResult = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (userStatsResult.length === 0) {
      return NextResponse.json({ 
        error: "User stats not found",
        code: "USER_STATS_NOT_FOUND" 
      }, { status: 404 });
    }

    const stats = userStatsResult[0];

    // Get all available badges
    const allBadges = await db.select().from(badges);

    // Get badges already earned by user
    const earnedBadgesResult = await db.select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const earnedBadgeIds = new Set(earnedBadgesResult.map(ub => ub.badgeId));

    // Get perfect quiz achievements for this user
    const perfectQuizAchievements = await db.select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.achievementType, 'perfect_quiz')
        )
      );

    const perfectQuizCount = perfectQuizAchievements.length;

    // Check each badge requirement
    const newlyEarnedBadges = [];

    for (const badge of allBadges) {
      // Skip if user already earned this badge
      if (earnedBadgeIds.has(badge.badgeId)) {
        continue;
      }

      let qualifies = false;

      // Check requirement based on type
      switch (badge.requirementType) {
        case 'quiz_count':
          qualifies = stats.quizzesCompleted >= badge.requirementValue;
          break;
        case 'calculator_count':
          qualifies = stats.calculatorsUsed >= badge.requirementValue;
          break;
        case 'streak_days':
          qualifies = stats.longestStreak >= badge.requirementValue;
          break;
        case 'answers_accepted':
          qualifies = stats.answersAccepted >= badge.requirementValue;
          break;
        case 'perfect_quiz':
          qualifies = perfectQuizCount >= badge.requirementValue;
          break;
        default:
          // Unknown requirement type, skip
          continue;
      }

      // If user qualifies, award the badge
      if (qualifies) {
        const earnedAt = new Date().toISOString();
        const createdAt = new Date().toISOString();

        const newBadge = await db.insert(userBadges)
          .values({
            userId,
            badgeId: badge.badgeId,
            earnedAt,
            createdAt
          })
          .returning();

        // Add badge details to response
        newlyEarnedBadges.push({
          ...newBadge[0],
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category
        });
      }
    }

    return NextResponse.json(newlyEarnedBadges, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}