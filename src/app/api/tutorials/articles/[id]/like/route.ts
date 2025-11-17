import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const articleId = parseInt(id);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { action } = body;

    // Validate action
    if (!action || (action !== 'like' && action !== 'unlike')) {
      return NextResponse.json(
        { 
          error: 'Action must be either "like" or "unlike"',
          code: 'INVALID_ACTION'
        },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await db.select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { 
          error: 'Article not found',
          code: 'ARTICLE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const currentLikes = existingArticle[0].likes || 0;

    // Calculate new likes count
    let newLikes: number;
    if (action === 'like') {
      newLikes = currentLikes + 1;
    } else {
      // Ensure likes don't go negative
      newLikes = Math.max(0, currentLikes - 1);
    }

    // Update article with new likes count
    const updatedArticle = await db.update(articles)
      .set({
        likes: newLikes,
        updatedAt: new Date().toISOString()
      })
      .where(eq(articles.id, articleId))
      .returning();

    if (updatedArticle.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update article',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedArticle[0], { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}