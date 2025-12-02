import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userTopicsProgress, topics } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query user progress with joined topic details
    const progressRecords = await db
      .select({
        id: userTopicsProgress.id,
        userId: userTopicsProgress.userId,
        topicId: userTopicsProgress.topicId,
        completionPercent: userTopicsProgress.completionPercent,
        sectionsCompleted: userTopicsProgress.sectionsCompleted,
        lastVisitedAt: userTopicsProgress.lastVisitedAt,
        createdAt: userTopicsProgress.createdAt,
        topic: {
          id: topics.id,
          slug: topics.slug,
          title: topics.title,
          description: topics.description,
          icon: topics.icon,
          orderIndex: topics.orderIndex,
          createdAt: topics.createdAt,
        }
      })
      .from(userTopicsProgress)
      .leftJoin(topics, eq(userTopicsProgress.topicId, topics.id))
      .where(eq(userTopicsProgress.userId, userId))
      .orderBy(topics.orderIndex);

    // Transform the results to match the expected response structure
    const formattedProgress = progressRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      topicId: record.topicId,
      completionPercent: record.completionPercent,
      sectionsCompleted: JSON.parse(record.sectionsCompleted || '[]'),
      lastVisitedAt: record.lastVisitedAt,
      createdAt: record.createdAt,
      topic: record.topic ? {
        id: record.topic.id,
        slug: record.topic.slug,
        title: record.topic.title,
        icon: record.topic.icon,
        orderIndex: record.topic.orderIndex
      } : null
    }));

    return NextResponse.json(formattedProgress, { status: 200 });

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