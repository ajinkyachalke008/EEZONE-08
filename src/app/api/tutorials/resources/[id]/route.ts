import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { downloadableResources } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const resource = await db.select()
      .from(downloadableResources)
      .where(eq(downloadableResources.id, parseInt(id)))
      .limit(1);

    if (resource.length === 0) {
      return NextResponse.json({ 
        error: 'Resource not found',
        code: "RESOURCE_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(resource[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, fileType, fileSize, fileUrl, category, tags } = body;

    // Check if resource exists
    const existingResource = await db.select()
      .from(downloadableResources)
      .where(eq(downloadableResources.id, parseInt(id)))
      .limit(1);

    if (existingResource.length === 0) {
      return NextResponse.json({ 
        error: 'Resource not found',
        code: "RESOURCE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ 
          error: "Title must be a non-empty string",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return NextResponse.json({ 
          error: "Description must be a string",
          code: "INVALID_DESCRIPTION" 
        }, { status: 400 });
      }
      updates.description = description.trim();
    }

    if (fileType !== undefined) {
      if (typeof fileType !== 'string' || fileType.trim().length === 0) {
        return NextResponse.json({ 
          error: "File type must be a non-empty string",
          code: "INVALID_FILE_TYPE" 
        }, { status: 400 });
      }
      updates.fileType = fileType.trim();
    }

    if (fileSize !== undefined) {
      if (typeof fileSize !== 'string' || fileSize.trim().length === 0) {
        return NextResponse.json({ 
          error: "File size must be a non-empty string",
          code: "INVALID_FILE_SIZE" 
        }, { status: 400 });
      }
      updates.fileSize = fileSize.trim();
    }

    if (fileUrl !== undefined) {
      if (typeof fileUrl !== 'string' || fileUrl.trim().length === 0) {
        return NextResponse.json({ 
          error: "File URL must be a non-empty string",
          code: "INVALID_FILE_URL" 
        }, { status: 400 });
      }
      updates.fileUrl = fileUrl.trim();
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return NextResponse.json({ 
          error: "Category must be a non-empty string",
          code: "INVALID_CATEGORY" 
        }, { status: 400 });
      }
      updates.category = category.trim();
    }

    if (tags !== undefined) {
      if (typeof tags !== 'string') {
        return NextResponse.json({ 
          error: "Tags must be a string",
          code: "INVALID_TAGS" 
        }, { status: 400 });
      }
      updates.tags = tags.trim();
    }

    const updated = await db.update(downloadableResources)
      .set(updates)
      .where(eq(downloadableResources.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update resource',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if resource exists
    const existingResource = await db.select()
      .from(downloadableResources)
      .where(eq(downloadableResources.id, parseInt(id)))
      .limit(1);

    if (existingResource.length === 0) {
      return NextResponse.json({ 
        error: 'Resource not found',
        code: "RESOURCE_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(downloadableResources)
      .where(eq(downloadableResources.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete resource',
        code: "DELETE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Resource deleted successfully',
      resource: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}