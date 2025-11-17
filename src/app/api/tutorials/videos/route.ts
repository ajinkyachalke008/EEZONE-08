import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videoTutorials } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_CATEGORIES = [
  "Power Systems",
  "Code & Safety",
  "Motor Controls",
  "Electronics",
  "Instrumentation",
  "PLC & Automation",
  "Renewable Energy",
  "Residential Wiring"
];

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const DURATION_REGEX = /^(?:\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})$/;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(videoTutorials);

    const conditions = [];

    if (category) {
      conditions.push(eq(videoTutorials.category, category));
    }

    if (level) {
      conditions.push(eq(videoTutorials.level, level));
    }

    if (search) {
      const searchCondition = or(
        like(videoTutorials.title, `%${search}%`),
        like(videoTutorials.description, `%${search}%`),
        like(videoTutorials.tags, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(videoTutorials.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
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
      duration,
      category,
      level,
      thumbnailUrl,
      videoUrl,
      author,
      tags
    } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json(
        {
          error: 'Title is required',
          code: 'MISSING_TITLE'
        },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        {
          error: 'Description is required',
          code: 'MISSING_DESCRIPTION'
        },
        { status: 400 }
      );
    }

    if (!duration || duration.trim() === '') {
      return NextResponse.json(
        {
          error: 'Duration is required',
          code: 'MISSING_DURATION'
        },
        { status: 400 }
      );
    }

    if (!category || category.trim() === '') {
      return NextResponse.json(
        {
          error: 'Category is required',
          code: 'MISSING_CATEGORY'
        },
        { status: 400 }
      );
    }

    if (!level || level.trim() === '') {
      return NextResponse.json(
        {
          error: 'Level is required',
          code: 'MISSING_LEVEL'
        },
        { status: 400 }
      );
    }

    if (!thumbnailUrl || thumbnailUrl.trim() === '') {
      return NextResponse.json(
        {
          error: 'Thumbnail URL is required',
          code: 'MISSING_THUMBNAIL_URL'
        },
        { status: 400 }
      );
    }

    if (!videoUrl || videoUrl.trim() === '') {
      return NextResponse.json(
        {
          error: 'Video URL is required',
          code: 'MISSING_VIDEO_URL'
        },
        { status: 400 }
      );
    }

    if (!author || author.trim() === '') {
      return NextResponse.json(
        {
          error: 'Author is required',
          code: 'MISSING_AUTHOR'
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY'
        },
        { status: 400 }
      );
    }

    // Validate level
    if (!VALID_LEVELS.includes(level)) {
      return NextResponse.json(
        {
          error: `Level must be one of: ${VALID_LEVELS.join(', ')}`,
          code: 'INVALID_LEVEL'
        },
        { status: 400 }
      );
    }

    // Validate duration format
    if (!DURATION_REGEX.test(duration)) {
      return NextResponse.json(
        {
          error: 'Duration must be in MM:SS or HH:MM:SS format',
          code: 'INVALID_DURATION_FORMAT'
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newVideo = await db.insert(videoTutorials)
      .values({
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim(),
        category: category.trim(),
        level: level.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        videoUrl: videoUrl.trim(),
        author: author.trim(),
        tags: tags ? tags.trim() : '',
        views: 0,
        rating: 0.0,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newVideo[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}