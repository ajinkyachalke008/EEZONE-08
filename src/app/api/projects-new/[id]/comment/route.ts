import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectCommentsNew, projectsNew } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate project ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID' 
        },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { user_id, comment } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { 
          error: 'Comment is required',
          code: 'MISSING_COMMENT' 
        },
        { status: 400 }
      );
    }

    // Sanitize and validate comment
    const sanitizedComment = comment.trim();
    
    if (sanitizedComment.length === 0) {
      return NextResponse.json(
        { 
          error: 'Comment cannot be empty',
          code: 'EMPTY_COMMENT' 
        },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db.select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectId))
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

    // Create comment
    const newComment = await db.insert(projectCommentsNew)
      .values({
        projectId,
        userId: user_id,
        comment: sanitizedComment,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newComment[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/projects-new/[id]/comment error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}