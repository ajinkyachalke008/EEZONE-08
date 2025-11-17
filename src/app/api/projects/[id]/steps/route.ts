import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectSteps, projects } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Validate ID is valid integer
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(projectId);

    // Query project_steps table where projectId = id, sorted by stepNumber ascending
    const steps = await db
      .select()
      .from(projectSteps)
      .where(eq(projectSteps.projectId, id))
      .orderBy(asc(projectSteps.stepNumber));

    // Return array of step objects (empty array if no steps found)
    return NextResponse.json(steps, { status: 200 });

  } catch (error) {
    console.error('GET project steps error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
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

    // Validate ID is valid integer
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_PROJECT_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(projectId);

    // Parse request body
    const body = await request.json();
    const { 
      stepNumber, 
      title, 
      description, 
      instructions,
      calculatorIds,
      imageUrl,
      videoUrl,
      estimatedDuration
    } = body;

    // Validate required fields
    if (!stepNumber && stepNumber !== 0) {
      return NextResponse.json(
        { 
          error: 'Step number is required',
          code: 'MISSING_STEP_NUMBER'
        },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Title is required',
          code: 'MISSING_TITLE'
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Description is required',
          code: 'MISSING_DESCRIPTION'
        },
        { status: 400 }
      );
    }

    if (!instructions || typeof instructions !== 'string' || instructions.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Instructions are required',
          code: 'MISSING_INSTRUCTIONS'
        },
        { status: 400 }
      );
    }

    // Validate stepNumber is a valid integer
    if (isNaN(parseInt(String(stepNumber)))) {
      return NextResponse.json(
        { 
          error: 'Step number must be a valid integer',
          code: 'INVALID_STEP_NUMBER'
        },
        { status: 400 }
      );
    }

    // Validate project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
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

    // Prepare step data with timestamps
    const now = new Date().toISOString();
    const stepData = {
      projectId: id,
      stepNumber: parseInt(String(stepNumber)),
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      calculatorIds: calculatorIds || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      estimatedDuration: estimatedDuration || null,
      createdAt: now,
      updatedAt: now,
    };

    // Insert new step
    const newStep = await db
      .insert(projectSteps)
      .values(stepData)
      .returning();

    // Return created step with 201 status
    return NextResponse.json(newStep[0], { status: 201 });

  } catch (error) {
    console.error('POST project step error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}