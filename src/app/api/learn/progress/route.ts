import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userTopicsProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, topic_id, section_completed, completion_percent } = body;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid user_id is required',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate topic_id
    if (!topic_id || isNaN(parseInt(topic_id.toString()))) {
      return NextResponse.json(
        { 
          error: 'Valid topic_id is required',
          code: 'INVALID_TOPIC_ID'
        },
        { status: 400 }
      );
    }

    const topicIdInt = parseInt(topic_id.toString());

    // Validate completion_percent if provided
    if (completion_percent !== undefined) {
      const percentInt = parseInt(completion_percent.toString());
      if (isNaN(percentInt) || percentInt < 0 || percentInt > 100) {
        return NextResponse.json(
          { 
            error: 'completion_percent must be between 0 and 100',
            code: 'INVALID_COMPLETION_PERCENT'
          },
          { status: 400 }
        );
      }
    }

    // Check if progress record already exists
    const existingProgress = await db
      .select()
      .from(userTopicsProgress)
      .where(
        and(
          eq(userTopicsProgress.userId, user_id.trim()),
          eq(userTopicsProgress.topicId, topicIdInt)
        )
      )
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingProgress.length > 0) {
      // Update existing record
      const existing = existingProgress[0];
      
      // Parse existing sectionsCompleted
      let sectionsArray: string[] = [];
      try {
        sectionsArray = JSON.parse(existing.sectionsCompleted);
        if (!Array.isArray(sectionsArray)) {
          sectionsArray = [];
        }
      } catch (e) {
        sectionsArray = [];
      }

      // Add new section if provided and not already present
      if (section_completed && typeof section_completed === 'string' && section_completed.trim() !== '') {
        const sectionTrimmed = section_completed.trim();
        if (!sectionsArray.includes(sectionTrimmed)) {
          sectionsArray.push(sectionTrimmed);
        }
      }

      // Prepare update data
      const updateData: {
        sectionsCompleted: string;
        lastVisitedAt: string;
        completionPercent?: number;
      } = {
        sectionsCompleted: JSON.stringify(sectionsArray),
        lastVisitedAt: currentTimestamp,
      };

      // Update completionPercent if provided
      if (completion_percent !== undefined) {
        updateData.completionPercent = parseInt(completion_percent.toString());
      }

      const updated = await db
        .update(userTopicsProgress)
        .set(updateData)
        .where(
          and(
            eq(userTopicsProgress.userId, user_id.trim()),
            eq(userTopicsProgress.topicId, topicIdInt)
          )
        )
        .returning();

      if (updated.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update progress record' },
          { status: 500 }
        );
      }

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // Create new progress record
      let sectionsArray: string[] = [];
      
      if (section_completed && typeof section_completed === 'string' && section_completed.trim() !== '') {
        sectionsArray.push(section_completed.trim());
      }

      const newProgress = await db
        .insert(userTopicsProgress)
        .values({
          userId: user_id.trim(),
          topicId: topicIdInt,
          completionPercent: completion_percent !== undefined ? parseInt(completion_percent.toString()) : 0,
          sectionsCompleted: JSON.stringify(sectionsArray),
          lastVisitedAt: currentTimestamp,
          createdAt: currentTimestamp,
        })
        .returning();

      if (newProgress.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create progress record' },
          { status: 500 }
        );
      }

      return NextResponse.json(newProgress[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}