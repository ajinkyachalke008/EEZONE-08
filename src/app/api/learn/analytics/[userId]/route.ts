import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizAttempts, questionAttempts, questions, topics, userTopicsProgress } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

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
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // 1. Overall Stats - Get all quiz attempts for user
    const userQuizAttempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));

    const totalQuizzes = userQuizAttempts.length;

    // Get all question attempts for this user's quiz attempts
    const attemptIds = userQuizAttempts.map(attempt => attempt.id);
    
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalScore = 0;

    if (attemptIds.length > 0) {
      const userQuestionAttempts = await db
        .select()
        .from(questionAttempts)
        .where(sql`${questionAttempts.attemptId} IN ${attemptIds}`);

      totalQuestions = userQuestionAttempts.length;
      correctAnswers = userQuestionAttempts.filter(qa => qa.isCorrect).length;
      totalScore = userQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    }

    const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageScore = totalQuizzes > 0 ? (totalScore / totalQuizzes) : 0;

    // 2. Performance by Difficulty
    const performanceByDifficulty = {
      easy: { total: 0, correct: 0, accuracy: 0 },
      medium: { total: 0, correct: 0, accuracy: 0 },
      hard: { total: 0, correct: 0, accuracy: 0 }
    };

    if (attemptIds.length > 0) {
      const questionAttemptsWithDetails = await db
        .select({
          questionAttempt: questionAttempts,
          question: questions
        })
        .from(questionAttempts)
        .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
        .where(sql`${questionAttempts.attemptId} IN ${attemptIds}`);

      for (const { questionAttempt, question } of questionAttemptsWithDetails) {
        const difficulty = question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
        if (difficulty in performanceByDifficulty) {
          performanceByDifficulty[difficulty].total++;
          if (questionAttempt.isCorrect) {
            performanceByDifficulty[difficulty].correct++;
          }
        }
      }

      // Calculate accuracy percentages
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        if (performanceByDifficulty[difficulty].total > 0) {
          performanceByDifficulty[difficulty].accuracy = 
            (performanceByDifficulty[difficulty].correct / performanceByDifficulty[difficulty].total) * 100;
        }
      }
    }

    // 3. Performance by Topic
    const performanceByTopic: Array<{
      topicId: number;
      topicTitle: string;
      topicSlug: string;
      topicIcon: string;
      questionsAttempted: number;
      correctAnswers: number;
      accuracy: number;
    }> = [];

    if (attemptIds.length > 0) {
      const topicPerformanceData = await db
        .select({
          questionAttempt: questionAttempts,
          question: questions,
          topic: topics
        })
        .from(questionAttempts)
        .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
        .innerJoin(topics, eq(questions.topicId, topics.id))
        .where(sql`${questionAttempts.attemptId} IN ${attemptIds}`);

      const topicMap = new Map<number, {
        topicTitle: string;
        topicSlug: string;
        topicIcon: string;
        total: number;
        correct: number;
      }>();

      for (const { questionAttempt, question, topic } of topicPerformanceData) {
        if (!topicMap.has(topic.id)) {
          topicMap.set(topic.id, {
            topicTitle: topic.title,
            topicSlug: topic.slug,
            topicIcon: topic.icon,
            total: 0,
            correct: 0
          });
        }
        
        const topicData = topicMap.get(topic.id)!;
        topicData.total++;
        if (questionAttempt.isCorrect) {
          topicData.correct++;
        }
      }

      for (const [topicId, data] of topicMap) {
        performanceByTopic.push({
          topicId,
          topicTitle: data.topicTitle,
          topicSlug: data.topicSlug,
          topicIcon: data.topicIcon,
          questionsAttempted: data.total,
          correctAnswers: data.correct,
          accuracy: (data.correct / data.total) * 100
        });
      }
    }

    // 4. Weak Areas (accuracy < 60%)
    const weakAreas: Array<{ type: 'topic' | 'difficulty'; name: string; accuracy: number }> = [];

    // Add weak difficulties
    for (const [difficulty, data] of Object.entries(performanceByDifficulty)) {
      if (data.total > 0 && data.accuracy < 60) {
        weakAreas.push({
          type: 'difficulty',
          name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          accuracy: Math.round(data.accuracy * 100) / 100
        });
      }
    }

    // Add weak topics
    for (const topic of performanceByTopic) {
      if (topic.accuracy < 60) {
        weakAreas.push({
          type: 'topic',
          name: topic.topicTitle,
          accuracy: Math.round(topic.accuracy * 100) / 100
        });
      }
    }

    // 5. Strong Areas (accuracy >= 80%)
    const strongAreas: Array<{ type: 'topic' | 'difficulty'; name: string; accuracy: number }> = [];

    // Add strong difficulties
    for (const [difficulty, data] of Object.entries(performanceByDifficulty)) {
      if (data.total > 0 && data.accuracy >= 80) {
        strongAreas.push({
          type: 'difficulty',
          name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          accuracy: Math.round(data.accuracy * 100) / 100
        });
      }
    }

    // Add strong topics
    for (const topic of performanceByTopic) {
      if (topic.accuracy >= 80) {
        strongAreas.push({
          type: 'topic',
          name: topic.topicTitle,
          accuracy: Math.round(topic.accuracy * 100) / 100
        });
      }
    }

    // 6. Recent Activity (last 5 quiz attempts)
    const recentAttempts = await db
      .select({
        attempt: quizAttempts,
        topic: topics
      })
      .from(quizAttempts)
      .leftJoin(topics, eq(quizAttempts.topicId, topics.id))
      .where(and(
        eq(quizAttempts.userId, userId),
        sql`${quizAttempts.finishedAt} IS NOT NULL`
      ))
      .orderBy(desc(quizAttempts.finishedAt))
      .limit(5);

    const recentActivity = recentAttempts.map(({ attempt, topic }) => ({
      attemptId: attempt.id,
      topicTitle: topic?.title || 'Unknown Topic',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.totalQuestions > 0 
        ? Math.round((attempt.score / attempt.totalQuestions) * 100) 
        : 0,
      finishedAt: attempt.finishedAt
    }));

    // 7. Progress Summary (topics in progress)
    const progressData = await db
      .select({
        progress: userTopicsProgress,
        topic: topics
      })
      .from(userTopicsProgress)
      .innerJoin(topics, eq(userTopicsProgress.topicId, topics.id))
      .where(eq(userTopicsProgress.userId, userId))
      .orderBy(desc(userTopicsProgress.lastVisitedAt));

    const progressSummary = progressData.map(({ progress, topic }) => ({
      topicId: topic.id,
      topicTitle: topic.title,
      topicSlug: topic.slug,
      completionPercent: progress.completionPercent,
      lastVisitedAt: progress.lastVisitedAt
    }));

    // Construct final response
    const analytics = {
      overallStats: {
        totalQuizzes,
        totalQuestions,
        correctAnswers,
        overallAccuracy: Math.round(overallAccuracy * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100
      },
      performanceByDifficulty: {
        easy: {
          total: performanceByDifficulty.easy.total,
          correct: performanceByDifficulty.easy.correct,
          accuracy: Math.round(performanceByDifficulty.easy.accuracy * 100) / 100
        },
        medium: {
          total: performanceByDifficulty.medium.total,
          correct: performanceByDifficulty.medium.correct,
          accuracy: Math.round(performanceByDifficulty.medium.accuracy * 100) / 100
        },
        hard: {
          total: performanceByDifficulty.hard.total,
          correct: performanceByDifficulty.hard.correct,
          accuracy: Math.round(performanceByDifficulty.hard.accuracy * 100) / 100
        }
      },
      performanceByTopic: performanceByTopic.map(topic => ({
        ...topic,
        accuracy: Math.round(topic.accuracy * 100) / 100
      })),
      weakAreas,
      strongAreas,
      recentActivity,
      progressSummary
    };

    return NextResponse.json(analytics, { status: 200 });

  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}