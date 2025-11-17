import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const article = await db.select()
      .from(articles)
      .where(eq(articles.id, parseInt(id)))
      .limit(1);

    if (article.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingArticle = await db.select()
      .from(articles)
      .where(eq(articles.id, parseInt(id)))
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
          { 
            error: 'Title must be a non-empty string',
            code: 'INVALID_TITLE'
          },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (excerpt !== undefined) {
      if (typeof excerpt !== 'string') {
        return NextResponse.json(
          { 
            error: 'Excerpt must be a string',
            code: 'INVALID_EXCERPT'
          },
          { status: 400 }
        );
      }
      updates.excerpt = excerpt.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string') {
        return NextResponse.json(
          { 
            error: 'Content must be a string',
            code: 'INVALID_CONTENT'
          },
          { status: 400 }
        );
      }
      updates.content = content.trim();
    }

    if (readTime !== undefined) {
      if (typeof readTime !== 'string') {
        return NextResponse.json(
          { 
            error: 'Read time must be a string',
            code: 'INVALID_READ_TIME'
          },
          { status: 400 }
        );
      }
      updates.readTime = readTime.trim();
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'Category must be a non-empty string',
            code: 'INVALID_CATEGORY'
          },
          { status: 400 }
        );
      }
      updates.category = category.trim();
    }

    if (author !== undefined) {
      if (typeof author !== 'string' || author.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'Author must be a non-empty string',
            code: 'INVALID_AUTHOR'
          },
          { status: 400 }
        );
      }
      updates.author = author.trim();
    }

    if (authorAvatar !== undefined) {
      if (typeof authorAvatar !== 'string') {
        return NextResponse.json(
          { 
            error: 'Author avatar must be a string',
            code: 'INVALID_AUTHOR_AVATAR'
          },
          { status: 400 }
        );
      }
      updates.authorAvatar = authorAvatar.trim();
    }

    if (thumbnailUrl !== undefined) {
      if (typeof thumbnailUrl !== 'string') {
        return NextResponse.json(
          { 
            error: 'Thumbnail URL must be a string',
            code: 'INVALID_THUMBNAIL_URL'
          },
          { status: 400 }
        );
      }
      updates.thumbnailUrl = thumbnailUrl.trim();
    }

    if (tags !== undefined) {
      if (typeof tags !== 'string') {
        return NextResponse.json(
          { 
            error: 'Tags must be a string',
            code: 'INVALID_TAGS'
          },
          { status: 400 }
        );
      }
      updates.tags = tags.trim();
    }

    if (publishedAt !== undefined) {
      if (typeof publishedAt !== 'string') {
        return NextResponse.json(
          { 
            error: 'Published at must be a string',
            code: 'INVALID_PUBLISHED_AT'
          },
          { status: 400 }
        );
      }
      updates.publishedAt = publishedAt.trim();
    }

    const updatedArticle = await db.update(articles)
      .set(updates)
      .where(eq(articles.id, parseInt(id)))
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingArticle = await db.select()
      .from(articles)
      .where(eq(articles.id, parseInt(id)))
      .limit(1);

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const deletedArticle = await db.delete(articles)
      .where(eq(articles.id, parseInt(id)))
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