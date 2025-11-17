import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectUploads, projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Validate project ID
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID'
        },
        { status: 400 }
      );
    }

    // Get all uploads for the project
    const uploads = await db
      .select()
      .from(projectUploads)
      .where(eq(projectUploads.projectId, parseInt(projectId)))
      .orderBy(desc(projectUploads.createdAt));

    return NextResponse.json(uploads, { status: 200 });
  } catch (error) {
    console.error('GET project uploads error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Validate project ID
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, username, fileUrl, fileType, caption } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { 
          error: 'Username is required',
          code: 'MISSING_USERNAME'
        },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { 
          error: 'File URL is required',
          code: 'MISSING_FILE_URL'
        },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { 
          error: 'File type is required',
          code: 'MISSING_FILE_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate fileType
    const validFileTypes = ['image', 'video', 'document'];
    if (!validFileTypes.includes(fileType)) {
      return NextResponse.json(
        { 
          error: 'File type must be one of: image, video, document',
          code: 'INVALID_FILE_TYPE'
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Create new upload
    const newUpload = await db
      .insert(projectUploads)
      .values({
        projectId: parseInt(projectId),
        userId: userId.trim(),
        username: username.trim(),
        fileUrl: fileUrl.trim(),
        fileType: fileType.trim(),
        caption: caption ? caption.trim() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newUpload[0], { status: 201 });
  } catch (error) {
    console.error('POST project upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}