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

    // Validate ID is a valid integer
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

    // Check if article exists
    const existingArticle = await db
      .select()
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

    const currentViews = existingArticle[0].views || 0;

    // Increment view count and update timestamp
    const updatedArticle = await db
      .update(articles)
      .set({
        views: currentViews + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(articles.id, articleId))
      .returning();

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