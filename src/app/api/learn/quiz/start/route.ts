import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizAttempts } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, topic_id, total_questions } = body;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'user_id is required and must be a non-empty string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate total_questions
    if (!total_questions || typeof total_questions !== 'number' || !Number.isInteger(total_questions) || total_questions <= 0) {
      return NextResponse.json(
        { 
          error: 'total_questions is required and must be a positive integer',
          code: 'INVALID_TOTAL_QUESTIONS'
        },
        { status: 400 }
      );
    }

    // Validate topic_id if provided
    if (topic_id !== undefined && topic_id !== null) {
      if (typeof topic_id !== 'number' || !Number.isInteger(topic_id)) {
        return NextResponse.json(
          { 
            error: 'topic_id must be a valid integer',
            code: 'INVALID_TOPIC_ID'
          },
          { status: 400 }
        );
      }
    }

    // Create new quiz attempt
    const newAttempt = await db.insert(quizAttempts)
      .values({
        userId: user_id.trim(),
        topicId: topic_id !== undefined && topic_id !== null ? topic_id : null,
        score: 0,
        totalQuestions: total_questions,
        startedAt: new Date().toISOString(),
        finishedAt: null,
      })
      .returning();

    return NextResponse.json(newAttempt[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}