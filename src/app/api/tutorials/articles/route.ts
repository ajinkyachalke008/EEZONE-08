import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { articles } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_CATEGORIES = ['Safety', 'Design', 'Troubleshooting', 'Installation', 'Maintenance', 'Theory', 'Standards'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select({
      id: articles.id,
      title: articles.title,
      excerpt: articles.excerpt,
      readTime: articles.readTime,
      category: articles.category,
      author: articles.author,
      authorAvatar: articles.authorAvatar,
      institution: articles.institution,
      views: articles.views,
      likes: articles.likes,
      thumbnailUrl: articles.thumbnailUrl,
      tags: articles.tags,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
    }).from(articles);

    const conditions = [];

    if (category) {
      conditions.push(eq(articles.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(articles.title, `%${search}%`),
          like(articles.excerpt, `%${search}%`),
          like(articles.content, `%${search}%`),
          like(articles.tags, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(articles.publishedAt))
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
      excerpt, 
      content, 
      readTime, 
      category, 
      author,
      authorAvatar,
      institution,
      thumbnailUrl,
      tags,
      publishedAt
    } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be non-empty', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!excerpt || typeof excerpt !== 'string' || excerpt.trim() === '') {
      return NextResponse.json(
        { error: 'Excerpt is required and must be non-empty', code: 'MISSING_EXCERPT' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and must be non-empty', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    if (!readTime || typeof readTime !== 'number' || readTime <= 0 || !Number.isInteger(readTime)) {
      return NextResponse.json(
        { error: 'Read time is required and must be a positive integer', code: 'INVALID_READ_TIME' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json(
        { error: 'Category is required and must be non-empty', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { 
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`, 
          code: 'INVALID_CATEGORY' 
        },
        { status: 400 }
      );
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      return NextResponse.json(
        { error: 'Author is required and must be non-empty', code: 'MISSING_AUTHOR' },
        { status: 400 }
      );
    }

    const currentTimestamp = new Date().toISOString();

    const newArticle = await db.insert(articles)
      .values({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        readTime,
        category: category.trim(),
        author: author.trim(),
        authorAvatar: authorAvatar ? authorAvatar.trim() : null,
        institution: institution ? institution.trim() : null,
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
        tags: tags ? tags.trim() : null,
        publishedAt: publishedAt || currentTimestamp,
        views: 0,
        likes: 0,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newArticle[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}