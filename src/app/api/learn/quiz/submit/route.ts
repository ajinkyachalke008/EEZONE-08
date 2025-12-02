import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizAttempts, questionAttempts, questions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface Answer {
  question_id: number;
  selected_option: string;
}

interface RequestBody {
  attempt_id: number;
  answers: Answer[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { attempt_id, answers } = body;

    // Validate attempt_id
    if (!attempt_id || isNaN(parseInt(String(attempt_id)))) {
      return NextResponse.json({ 
        error: "Valid attempt_id is required",
        code: "INVALID_ATTEMPT_ID" 
      }, { status: 400 });
    }

    // Validate answers array
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ 
        error: "answers must be a non-empty array",
        code: "INVALID_ANSWERS" 
      }, { status: 400 });
    }

    // Validate each answer object
    const validOptions = ['A', 'B', 'C', 'D'];
    for (const answer of answers) {
      if (!answer.question_id || isNaN(parseInt(String(answer.question_id)))) {
        return NextResponse.json({ 
          error: "Each answer must have a valid question_id",
          code: "INVALID_QUESTION_ID" 
        }, { status: 400 });
      }

      if (!answer.selected_option || !validOptions.includes(answer.selected_option.toUpperCase())) {
        return NextResponse.json({ 
          error: "selected_option must be one of: A, B, C, D",
          code: "INVALID_SELECTED_OPTION" 
        }, { status: 400 });
      }
    }

    // Verify quiz_attempts record exists
    const existingAttempt = await db.select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, attempt_id))
      .limit(1);

    if (existingAttempt.length === 0) {
      return NextResponse.json({ 
        error: 'Quiz attempt not found',
        code: "ATTEMPT_NOT_FOUND" 
      }, { status: 404 });
    }

    let correctCount = 0;

    // Process each answer
    for (const answer of answers) {
      const questionId = parseInt(String(answer.question_id));
      const selectedOption = answer.selected_option.toUpperCase();

      // Fetch the question to get correct answer
      const questionRecord = await db.select()
        .from(questions)
        .where(eq(questions.id, questionId))
        .limit(1);

      if (questionRecord.length === 0) {
        return NextResponse.json({ 
          error: `Question with id ${questionId} not found`,
          code: "QUESTION_NOT_FOUND" 
        }, { status: 404 });
      }

      const question = questionRecord[0];
      const isCorrect = selectedOption === question.correctOption.toUpperCase();

      if (isCorrect) {
        correctCount++;
      }

      // Insert question attempt record
      await db.insert(questionAttempts).values({
        attemptId: attempt_id,
        questionId: questionId,
        selectedOption: selectedOption,
        isCorrect: isCorrect,
      });
    }

    // Calculate results
    const totalQuestions = answers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100 * 100) / 100;
    const finishedAt = new Date().toISOString();

    // Update quiz_attempts record
    const updatedAttempt = await db.update(quizAttempts)
      .set({
        score: correctCount,
        finishedAt: finishedAt,
      })
      .where(eq(quizAttempts.id, attempt_id))
      .returning();

    // Return results
    return NextResponse.json({
      attempt_id: attempt_id,
      score: correctCount,
      total_questions: totalQuestions,
      percentage: percentage,
      finished_at: finishedAt,
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}