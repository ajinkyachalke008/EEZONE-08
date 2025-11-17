import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userBadges, badges } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId query parameter is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Query user badges with full badge details using join
    const earnedBadges = await db
      .select({
        // User badge fields
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        userBadgeCreatedAt: userBadges.createdAt,
        // Full badge details
        badgeName: badges.name,
        badgeDescription: badges.description,
        badgeIcon: badges.icon,
        badgeCategory: badges.category,
        badgeRequirementType: badges.requirementType,
        badgeRequirementValue: badges.requirementValue,
        badgeCreatedAt: badges.createdAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.badgeId))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));

    // Transform the results to a more user-friendly structure
    const formattedBadges = earnedBadges.map(badge => ({
      id: badge.id,
      userId: badge.userId,
      earnedAt: badge.earnedAt,
      createdAt: badge.userBadgeCreatedAt,
      badge: {
        badgeId: badge.badgeId,
        name: badge.badgeName,
        description: badge.badgeDescription,
        icon: badge.badgeIcon,
        category: badge.badgeCategory,
        requirementType: badge.badgeRequirementType,
        requirementValue: badge.badgeRequirementValue,
        createdAt: badge.badgeCreatedAt,
      }
    }));

    return NextResponse.json(formattedBadges, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}