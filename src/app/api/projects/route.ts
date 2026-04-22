import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const userId = searchParams.get('userId');

    const conditions = [];

    if (category) {
      conditions.push(eq(projects.category, category));
    }

    if (difficulty) {
      conditions.push(eq(projects.difficulty, difficulty));
    }

    if (userId) {
      conditions.push(eq(projects.authorId, userId));
    }

    if (search) {
      conditions.push(
        or(
          like(projects.title, `%${search}%`),
          like(projects.description, `%${search}%`)
        )
      );
    }

    let query = db.select().from(projects);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    // Return empty array when DB is unavailable (prevents page crash)
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      authorId,
      authorName,
      title,
      description,
      category,
      difficulty,
      estimatedTime,
      thumbnailUrl,
      tags,
      status = 'draft'
    } = body;

    if (!authorId || !authorId.trim()) {
      return NextResponse.json(
        { error: 'authorId is required', code: 'MISSING_AUTHOR_ID' },
        { status: 400 }
      );
    }

    if (!authorName || !authorName.trim()) {
      return NextResponse.json(
        { error: 'authorName is required', code: 'MISSING_AUTHOR_NAME' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (!difficulty || !difficulty.trim()) {
      return NextResponse.json(
        { error: 'Difficulty is required', code: 'MISSING_DIFFICULTY' },
        { status: 400 }
      );
    }

    if (!estimatedTime || !estimatedTime.trim()) {
      return NextResponse.json(
        { error: 'Estimated time is required', code: 'MISSING_ESTIMATED_TIME' },
        { status: 400 }
      );
    }

    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return NextResponse.json(
        {
          error: 'Difficulty must be one of: beginner, intermediate, advanced',
          code: 'INVALID_DIFFICULTY'
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newProject = await db
      .insert(projects)
      .values({
        authorId: authorId.trim(),
        authorName: authorName.trim(),
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty: difficulty.toLowerCase(),
        estimatedTime: estimatedTime.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        tags: tags || '',
        status: status || 'draft',
        viewsCount: 0,
        likesCount: 0,
        ratingAverage: 0.0,
        ratingCount: 0,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}