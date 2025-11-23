import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('GET article error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const existingArticle = await db.select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

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

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (excerpt !== undefined) {
      if (typeof excerpt !== 'string') {
        return NextResponse.json(
          { error: 'Excerpt must be a string', code: 'INVALID_EXCERPT' },
          { status: 400 }
        );
      }
      updates.excerpt = excerpt.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string') {
        return NextResponse.json(
          { error: 'Content must be a string', code: 'INVALID_CONTENT' },
          { status: 400 }
        );
      }
      updates.content = content.trim();
    }

    if (readTime !== undefined) {
      if (typeof readTime !== 'number') {
        return NextResponse.json(
          { error: 'Read time must be a number', code: 'INVALID_READ_TIME' },
          { status: 400 }
        );
      }
      updates.readTime = readTime;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return NextResponse.json(
          { error: 'Category must be a non-empty string', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updates.category = category.trim();
    }

    if (author !== undefined) {
      if (typeof author !== 'string' || author.trim().length === 0) {
        return NextResponse.json(
          { error: 'Author must be a non-empty string', code: 'INVALID_AUTHOR' },
          { status: 400 }
        );
      }
      updates.author = author.trim();
    }

    if (authorAvatar !== undefined) {
      updates.authorAvatar = authorAvatar ? authorAvatar.trim() : null;
    }

    if (institution !== undefined) {
      updates.institution = institution ? institution.trim() : null;
    }

    if (thumbnailUrl !== undefined) {
      updates.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
    }

    if (tags !== undefined) {
      updates.tags = tags ? tags.trim() : null;
    }

    if (publishedAt !== undefined) {
      if (typeof publishedAt !== 'string') {
        return NextResponse.json(
          { error: 'Published at must be a string', code: 'INVALID_PUBLISHED_AT' },
          { status: 400 }
        );
      }
      updates.publishedAt = publishedAt.trim();
    }

    const updatedArticle = await db.update(articles)
      .set(updates)
      .where(eq(articles.id, articleId))
      .returning();

    return NextResponse.json(updatedArticle[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const existingArticle = await db.select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const deletedArticle = await db.delete(articles)
      .where(eq(articles.id, articleId))
      .returning();

    return NextResponse.json(
      { 
        message: 'Article deleted successfully',
        article: deletedArticle[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}