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
    const status = searchParams.get('status') ?? 'published';
    const authorId = searchParams.get('authorId');

    const conditions = [];

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    if (category) {
      conditions.push(eq(projects.category, category));
    }

    if (difficulty) {
      conditions.push(eq(projects.difficulty, difficulty));
    }

    if (authorId) {
      conditions.push(eq(projects.authorId, authorId));
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
      title,
      description,
      category,
      difficulty,
      estimatedTime,
      authorId,
      authorName,
      tags,
      thumbnailUrl,
      status = 'draft'
    } = body;

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

    if (!authorId || !authorId.trim()) {
      return NextResponse.json(
        { error: 'Author ID is required', code: 'MISSING_AUTHOR_ID' },
        { status: 400 }
      );
    }

    if (!authorName || !authorName.trim()) {
      return NextResponse.json(
        { error: 'Author name is required', code: 'MISSING_AUTHOR_NAME' },
        { status: 400 }
      );
    }

    if (!tags) {
      return NextResponse.json(
        { error: 'Tags are required', code: 'MISSING_TAGS' },
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

    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          error: 'Status must be one of: draft, published, archived',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newProject = await db
      .insert(projects)
      .values({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty: difficulty.toLowerCase(),
        estimatedTime: estimatedTime.trim(),
        authorId: authorId.trim(),
        authorName: authorName.trim(),
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        status: status.toLowerCase(),
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