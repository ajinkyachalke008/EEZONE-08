import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectSteps, projects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const { id, stepId } = params;

    // Validate project ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID',
        },
        { status: 400 }
      );
    }

    // Validate step ID
    if (!stepId || isNaN(parseInt(stepId))) {
      return NextResponse.json(
        {
          error: 'Valid step ID is required',
          code: 'INVALID_STEP_ID',
        },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);
    const stepIdNum = parseInt(stepId);

    // Parse request body
    const body = await request.json();

    // Validate that body is not empty
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          error: 'Request body cannot be empty',
          code: 'EMPTY_BODY',
        },
        { status: 400 }
      );
    }

    // Security check: reject if id or projectId provided in body
    if ('id' in body || 'projectId' in body) {
      return NextResponse.json(
        {
          error: 'Cannot modify id or projectId fields',
          code: 'PROTECTED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        {
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Check if step exists and belongs to the project
    const existingStep = await db
      .select()
      .from(projectSteps)
      .where(
        and(
          eq(projectSteps.id, stepIdNum),
          eq(projectSteps.projectId, projectId)
        )
      )
      .limit(1);

    if (existingStep.length === 0) {
      return NextResponse.json(
        {
          error: 'Step not found or does not belong to this project',
          code: 'STEP_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Prepare update data with sanitization
    const updateData: Record<string, any> = {};

    // Sanitize and validate allowed fields
    if (body.stepNumber !== undefined) {
      const stepNumber = parseInt(body.stepNumber);
      if (isNaN(stepNumber) || stepNumber < 1) {
        return NextResponse.json(
          {
            error: 'Step number must be a positive integer',
            code: 'INVALID_STEP_NUMBER',
          },
          { status: 400 }
        );
      }
      updateData.stepNumber = stepNumber;
    }

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          {
            error: 'Title cannot be empty',
            code: 'EMPTY_TITLE',
          },
          { status: 400 }
        );
      }
      updateData.title = title;
    }

    if (body.description !== undefined) {
      const description = body.description.trim();
      if (!description) {
        return NextResponse.json(
          {
            error: 'Description cannot be empty',
            code: 'EMPTY_DESCRIPTION',
          },
          { status: 400 }
        );
      }
      updateData.description = description;
    }

    if (body.instructions !== undefined) {
      const instructions = body.instructions.trim();
      if (!instructions) {
        return NextResponse.json(
          {
            error: 'Instructions cannot be empty',
            code: 'EMPTY_INSTRUCTIONS',
          },
          { status: 400 }
        );
      }
      updateData.instructions = instructions;
    }

    if (body.calculatorIds !== undefined) {
      updateData.calculatorIds = body.calculatorIds ? body.calculatorIds.trim() : null;
    }

    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    }

    if (body.videoUrl !== undefined) {
      updateData.videoUrl = body.videoUrl ? body.videoUrl.trim() : null;
    }

    if (body.estimatedDuration !== undefined) {
      updateData.estimatedDuration = body.estimatedDuration ? body.estimatedDuration.trim() : null;
    }

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update the step
    const updatedStep = await db
      .update(projectSteps)
      .set(updateData)
      .where(
        and(
          eq(projectSteps.id, stepIdNum),
          eq(projectSteps.projectId, projectId)
        )
      )
      .returning();

    if (updatedStep.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update step',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedStep[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}