import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectComments, projects } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Validate projectId is a valid integer
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { 
          error: "Valid project ID is required",
          code: "INVALID_PROJECT_ID" 
        },
        { status: 400 }
      );
    }

    const parsedProjectId = parseInt(projectId);

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query comments for this project
    const comments = await db.select()
      .from(projectComments)
      .where(eq(projectComments.projectId, parsedProjectId))
      .orderBy(desc(projectComments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(comments, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
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

    // Validate projectId is a valid integer
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { 
          error: "Valid project ID is required",
          code: "INVALID_PROJECT_ID" 
        },
        { status: 400 }
      );
    }

    const parsedProjectId = parseInt(projectId);

    // Parse request body
    const body = await request.json();
    const { userId, username, comment, parentCommentId } = body;

    // Validate required fields
    if (!userId || !username || !comment) {
      return NextResponse.json(
        { 
          error: "Missing required fields: userId, username, and comment are required",
          code: "MISSING_REQUIRED_FIELDS" 
        },
        { status: 400 }
      );
    }

    // Validate userId is a string
    if (typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: "userId must be a non-empty string",
          code: "INVALID_USER_ID" 
        },
        { status: 400 }
      );
    }

    // Validate username is a string
    if (typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json(
        { 
          error: "username must be a non-empty string",
          code: "INVALID_USERNAME" 
        },
        { status: 400 }
      );
    }

    // Validate comment is a string
    if (typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json(
        { 
          error: "comment must be a non-empty string",
          code: "INVALID_COMMENT" 
        },
        { status: 400 }
      );
    }

    // Validate parentCommentId if provided
    if (parentCommentId !== undefined && parentCommentId !== null) {
      if (isNaN(parseInt(parentCommentId))) {
        return NextResponse.json(
          { 
            error: "parentCommentId must be a valid integer",
            code: "INVALID_PARENT_COMMENT_ID" 
          },
          { status: 400 }
        );
      }
    }

    // Validate project exists
    const existingProject = await db.select()
      .from(projects)
      .where(eq(projects.id, parsedProjectId))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { 
          error: "Project not found",
          code: "PROJECT_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Create comment object
    const now = new Date().toISOString();
    const commentData: any = {
      projectId: parsedProjectId,
      userId: userId.trim(),
      username: username.trim(),
      comment: comment.trim(),
      likesCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Add parentCommentId if provided
    if (parentCommentId !== undefined && parentCommentId !== null) {
      commentData.parentCommentId = parseInt(parentCommentId);
    }

    // Insert comment
    const newComment = await db.insert(projectComments)
      .values(commentData)
      .returning();

    return NextResponse.json(newComment[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}