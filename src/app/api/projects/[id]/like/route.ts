import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
          code: 'INVALID_PROJECT_ID',
        },
        { status: 400 }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    const { userId } = requestBody;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        {
          error: 'userId is required',
          code: 'MISSING_USER_ID',
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        {
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Increment likes count and update timestamp
    const updatedProject = await db
      .update(projects)
      .set({
        likesCount: existingProject[0].likesCount + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, parseInt(projectId)))
      .returning();

    if (updatedProject.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update project',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProject[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}