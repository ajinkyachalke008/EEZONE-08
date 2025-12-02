import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const ALLOWED_CONTENT_TYPES = ['topic', 'tool', 'project'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, content_type, content_id } = body;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
      return NextResponse.json(
        { 
          error: 'user_id is required and must be a non-empty string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate content_type
    if (!content_type || !ALLOWED_CONTENT_TYPES.includes(content_type)) {
      return NextResponse.json(
        { 
          error: `content_type must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
          code: 'INVALID_CONTENT_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate content_id
    if (!content_id || isNaN(parseInt(content_id.toString()))) {
      return NextResponse.json(
        { 
          error: 'content_id is required and must be a valid integer',
          code: 'INVALID_CONTENT_ID'
        },
        { status: 400 }
      );
    }

    const contentIdInt = parseInt(content_id.toString());

    // Check if bookmark already exists
    const existingBookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user_id.trim()),
          eq(bookmarks.contentType, content_type),
          eq(bookmarks.contentId, contentIdInt)
        )
      )
      .limit(1);

    if (existingBookmark.length > 0) {
      return NextResponse.json(
        { 
          error: 'Bookmark already exists',
          code: 'BOOKMARK_EXISTS'
        },
        { status: 409 }
      );
    }

    // Create new bookmark
    const newBookmark = await db
      .insert(bookmarks)
      .values({
        userId: user_id.trim(),
        contentType: content_type,
        contentId: contentIdInt,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newBookmark[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
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

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid id is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const bookmarkId = parseInt(id);

    // Check if bookmark exists
    const existingBookmark = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .limit(1);

    if (existingBookmark.length === 0) {
      return NextResponse.json(
        { 
          error: 'Bookmark not found',
          code: 'BOOKMARK_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete the bookmark
    await db
      .delete(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))
      .returning();

    return NextResponse.json(
      {
        message: 'Bookmark deleted successfully',
        id: bookmarkId
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