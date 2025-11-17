import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, projectSteps, projectComments, projectRatings } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    const projectId = parseInt(id);

    // Get project by ID
    const project = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all project steps for this project (sorted by stepNumber)
    const steps = await db.select()
      .from(projectSteps)
      .where(eq(projectSteps.projectId, projectId))
      .orderBy(asc(projectSteps.stepNumber));

    // Return object with project details and steps array
    return NextResponse.json({
      project: project[0],
      steps: steps
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    const projectId = parseInt(id);

    // Parse request body
    const body = await request.json();

    // Remove id from update fields if present
    const { id: _, ...updateFields } = body;

    // Validate at least one field is provided
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { 
          error: 'At least one field must be provided for update',
          code: 'NO_UPDATE_FIELDS'
        },
        { status: 400 }
      );
    }

    // Check project exists
    const existingProject = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project with provided fields and auto-update updatedAt
    const updated = await db.update(projects)
      .set({
        ...updateFields,
        updatedAt: new Date().toISOString()
      })
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    const projectId = parseInt(id);

    // Check project exists
    const existingProject = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete all related records in order
    // Delete project ratings
    await db.delete(projectRatings)
      .where(eq(projectRatings.projectId, projectId));

    // Delete project comments
    await db.delete(projectComments)
      .where(eq(projectComments.projectId, projectId));

    // Delete project steps
    await db.delete(projectSteps)
      .where(eq(projectSteps.projectId, projectId));

    // Delete the project
    const deleted = await db.delete(projects)
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json({
      message: 'Project and all related records deleted successfully',
      project: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}