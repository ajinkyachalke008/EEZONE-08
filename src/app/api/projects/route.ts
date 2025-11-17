import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectsNew } from '@/db/schema';
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
      conditions.push(eq(projectsNew.category, category));
    }

    if (difficulty) {
      conditions.push(eq(projectsNew.difficulty, difficulty));
    }

    if (userId) {
      conditions.push(eq(projectsNew.userId, userId));
    }

    if (search) {
      conditions.push(
        or(
          like(projectsNew.title, `%${search}%`),
          like(projectsNew.description, `%${search}%`)
        )
      );
    }

    let query = db.select().from(projectsNew);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(projectsNew.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      category,
      difficulty,
      imageUrl,
      featured = 0
    } = body;

    if (!userId || !userId.trim()) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
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
      .insert(projectsNew)
      .values({
        userId: userId.trim(),
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty: difficulty.toLowerCase(),
        imageUrl: imageUrl?.trim() || null,
        views: 0,
        featured: featured ? 1 : 0,
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