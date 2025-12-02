import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { questions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const topicIdParam = searchParams.get('topic_id');
    const difficultyParam = searchParams.get('difficulty');
    const limitParam = searchParams.get('limit');

    // Validate topic_id if provided
    let topicId: number | null = null;
    if (topicIdParam) {
      topicId = parseInt(topicIdParam);
      if (isNaN(topicId)) {
        return NextResponse.json(
          { 
            error: 'Invalid topic_id parameter. Must be a valid integer.',
            code: 'INVALID_TOPIC_ID'
          },
          { status: 400 }
        );
      }
    }

    // Validate difficulty if provided
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (difficultyParam && !validDifficulties.includes(difficultyParam.toLowerCase())) {
      return NextResponse.json(
        { 
          error: `Invalid difficulty parameter. Must be one of: ${validDifficulties.join(', ')}`,
          code: 'INVALID_DIFFICULTY'
        },
        { status: 400 }
      );
    }
    const difficulty = difficultyParam?.toLowerCase();

    // Validate and set limit
    const limit = limitParam ? Math.min(parseInt(limitParam), 50) : 10;
    if (limitParam && isNaN(parseInt(limitParam))) {
      return NextResponse.json(
        { 
          error: 'Invalid limit parameter. Must be a valid integer.',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      );
    }

    // Build query with filters
    let query = db.select({
      id: questions.id,
      topicId: questions.topicId,
      difficulty: questions.difficulty,
      questionText: questions.questionText,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      explanation: questions.explanation,
      createdAt: questions.createdAt,
    }).from(questions);

    // Apply filters
    const conditions = [];
    if (topicId !== null) {
      conditions.push(eq(questions.topicId, topicId));
    }
    if (difficulty) {
      conditions.push(eq(questions.difficulty, difficulty));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Execute query to get all matching questions
    const allQuestions = await query;

    // Randomize the order using Fisher-Yates shuffle algorithm
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Apply limit after randomization
    const randomQuestions = shuffled.slice(0, limit);

    return NextResponse.json(randomQuestions, { status: 200 });

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