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

    // Validate ID is a valid integer
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        {
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID',
        },
        { status: 400 }
      );
    }

    const id = parseInt(projectId);

    // Check if project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
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

    const currentViewsCount = existingProject[0].viewsCount;

    // Increment view count and update timestamp
    const updatedProject = await db
      .update(projects)
      .set({
        viewsCount: currentViewsCount + 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (updatedProject.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update project views',
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
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}