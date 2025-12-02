import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizAttempts, questionAttempts, questions, topics } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { attemptId } = params;

    // Validate attemptId
    if (!attemptId || isNaN(parseInt(attemptId))) {
      return NextResponse.json(
        { 
          error: 'Valid attempt ID is required',
          code: 'INVALID_ATTEMPT_ID' 
        },
        { status: 400 }
      );
    }

    const attemptIdNum = parseInt(attemptId);

    // Query quiz attempt
    const attempt = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, attemptIdNum))
      .limit(1);

    if (attempt.length === 0) {
      return NextResponse.json(
        { 
          error: 'Quiz attempt not found',
          code: 'ATTEMPT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const attemptData = attempt[0];

    // Query all question attempts for this attempt
    const questionAttemptsList = await db
      .select()
      .from(questionAttempts)
      .where(eq(questionAttempts.attemptId, attemptIdNum));

    // Query full question details for each question attempt
    const questionResults = await Promise.all(
      questionAttemptsList.map(async (qa) => {
        const questionData = await db
          .select()
          .from(questions)
          .where(eq(questions.id, qa.questionId))
          .limit(1);

        if (questionData.length === 0) {
          return null;
        }

        const question = questionData[0];

        return {
          questionId: question.id,
          questionText: question.questionText,
          difficulty: question.difficulty,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctOption: question.correctOption,
          selectedOption: qa.selectedOption,
          isCorrect: qa.isCorrect,
          explanation: question.explanation,
        };
      })
    );

    // Filter out null values (questions that couldn't be found)
    const validQuestionResults = questionResults.filter((qr) => qr !== null);

    // Query topic details if topicId exists
    let topicData = null;
    if (attemptData.topicId) {
      const topic = await db
        .select({
          id: topics.id,
          slug: topics.slug,
          title: topics.title,
          icon: topics.icon,
        })
        .from(topics)
        .where(eq(topics.id, attemptData.topicId))
        .limit(1);

      if (topic.length > 0) {
        topicData = topic[0];
      }
    }

    // Calculate analytics
    const percentage = attemptData.totalQuestions > 0
      ? Math.round((attemptData.score / attemptData.totalQuestions) * 100)
      : 0;

    // Calculate time taken in minutes
    let timeTaken = 0;
    if (attemptData.startedAt && attemptData.finishedAt) {
      const startTime = new Date(attemptData.startedAt).getTime();
      const endTime = new Date(attemptData.finishedAt).getTime();
      timeTaken = Math.round((endTime - startTime) / 1000 / 60);
    }

    // Calculate performance by difficulty
    const difficultyStats = {
      easy: { correct: 0, total: 0, percentage: 0 },
      medium: { correct: 0, total: 0, percentage: 0 },
      hard: { correct: 0, total: 0, percentage: 0 },
    };

    validQuestionResults.forEach((qr) => {
      const difficulty = qr.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
      
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total += 1;
        if (qr.isCorrect) {
          difficultyStats[difficulty].correct += 1;
        }
      }
    });

    // Calculate percentages for each difficulty
    Object.keys(difficultyStats).forEach((difficulty) => {
      const diff = difficulty as 'easy' | 'medium' | 'hard';
      const stats = difficultyStats[diff];
      if (stats.total > 0) {
        stats.percentage = Math.round((stats.correct / stats.total) * 100);
      }
    });

    // Build response
    const response = {
      attempt: {
        id: attemptData.id,
        userId: attemptData.userId,
        topicId: attemptData.topicId,
        score: attemptData.score,
        totalQuestions: attemptData.totalQuestions,
        startedAt: attemptData.startedAt,
        finishedAt: attemptData.finishedAt,
      },
      topic: topicData,
      percentage,
      timeTaken,
      questionResults: validQuestionResults,
      analytics: {
        byDifficulty: difficultyStats,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET quiz results error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}