import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videoTutorials } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const video = await db.select()
      .from(videoTutorials)
      .where(eq(videoTutorials.id, parseInt(id)))
      .limit(1);

    if (video.length === 0) {
      return NextResponse.json(
        { 
          error: 'Video tutorial not found',
          code: 'VIDEO_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(video[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      'title',
      'description',
      'duration',
      'category',
      'level',
      'thumbnailUrl',
      'videoUrl',
      'author',
      'tags'
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (updates.title !== undefined && typeof updates.title !== 'string') {
      return NextResponse.json(
        { 
          error: 'Title must be a string',
          code: 'INVALID_TITLE'
        },
        { status: 400 }
      );
    }

    if (updates.description !== undefined && typeof updates.description !== 'string') {
      return NextResponse.json(
        { 
          error: 'Description must be a string',
          code: 'INVALID_DESCRIPTION'
        },
        { status: 400 }
      );
    }

    if (updates.duration !== undefined && typeof updates.duration !== 'string') {
      return NextResponse.json(
        { 
          error: 'Duration must be a string',
          code: 'INVALID_DURATION'
        },
        { status: 400 }
      );
    }

    if (updates.category !== undefined) {
      const validCategories = ['math', 'science', 'engineering', 'architecture', 'other'];
      if (!validCategories.includes(updates.category)) {
        return NextResponse.json(
          { 
            error: `Category must be one of: ${validCategories.join(', ')}`,
            code: 'INVALID_CATEGORY'
          },
          { status: 400 }
        );
      }
    }

    if (updates.level !== undefined) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(updates.level)) {
        return NextResponse.json(
          { 
            error: `Level must be one of: ${validLevels.join(', ')}`,
            code: 'INVALID_LEVEL'
          },
          { status: 400 }
        );
      }
    }

    if (updates.thumbnailUrl !== undefined && typeof updates.thumbnailUrl !== 'string') {
      return NextResponse.json(
        { 
          error: 'Thumbnail URL must be a string',
          code: 'INVALID_THUMBNAIL_URL'
        },
        { status: 400 }
      );
    }

    if (updates.videoUrl !== undefined && typeof updates.videoUrl !== 'string') {
      return NextResponse.json(
        { 
          error: 'Video URL must be a string',
          code: 'INVALID_VIDEO_URL'
        },
        { status: 400 }
      );
    }

    if (updates.author !== undefined && typeof updates.author !== 'string') {
      return NextResponse.json(
        { 
          error: 'Author must be a string',
          code: 'INVALID_AUTHOR'
        },
        { status: 400 }
      );
    }

    if (updates.tags !== undefined && typeof updates.tags !== 'string') {
      return NextResponse.json(
        { 
          error: 'Tags must be a string',
          code: 'INVALID_TAGS'
        },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields to update',
          code: 'NO_FIELDS_TO_UPDATE'
        },
        { status: 400 }
      );
    }

    const existingVideo = await db.select()
      .from(videoTutorials)
      .where(eq(videoTutorials.id, parseInt(id)))
      .limit(1);

    if (existingVideo.length === 0) {
      return NextResponse.json(
        { 
          error: 'Video tutorial not found',
          code: 'VIDEO_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(videoTutorials)
      .set(updates)
      .where(eq(videoTutorials.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update video tutorial',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const existingVideo = await db.select()
      .from(videoTutorials)
      .where(eq(videoTutorials.id, parseInt(id)))
      .limit(1);

    if (existingVideo.length === 0) {
      return NextResponse.json(
        { 
          error: 'Video tutorial not found',
          code: 'VIDEO_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const deleted = await db.delete(videoTutorials)
      .where(eq(videoTutorials.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to delete video tutorial',
          code: 'DELETE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Video tutorial deleted successfully',
        id: parseInt(id),
        deleted: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}