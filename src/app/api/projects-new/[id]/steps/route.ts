import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectStepsNew, projectsNew } from '@/db/schema';
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
          code: 'INVALID_PROJECT_ID' 
        },
        { status: 400 }
      );
    }

    const projectIdInt = parseInt(projectId);

    // Verify project exists
    const project = await db
      .select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectIdInt))
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

    // Parse request body
    const body = await request.json();
    const { step_number, title, description, image_url, calculator_link } = body;

    // Validate required fields
    if (step_number === undefined || step_number === null) {
      return NextResponse.json(
        { 
          error: 'step_number is required',
          code: 'MISSING_STEP_NUMBER' 
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { 
          error: 'title is required',
          code: 'MISSING_TITLE' 
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { 
          error: 'description is required',
          code: 'MISSING_DESCRIPTION' 
        },
        { status: 400 }
      );
    }

    // Validate step_number is a positive integer
    const stepNumberInt = parseInt(step_number);
    if (isNaN(stepNumberInt) || stepNumberInt <= 0) {
      return NextResponse.json(
        { 
          error: 'step_number must be a positive integer',
          code: 'INVALID_STEP_NUMBER' 
        },
        { status: 400 }
      );
    }

    // Validate title and description are non-empty strings
    const trimmedTitle = String(title).trim();
    const trimmedDescription = String(description).trim();

    if (trimmedTitle.length === 0) {
      return NextResponse.json(
        { 
          error: 'title cannot be empty',
          code: 'EMPTY_TITLE' 
        },
        { status: 400 }
      );
    }

    if (trimmedDescription.length === 0) {
      return NextResponse.json(
        { 
          error: 'description cannot be empty',
          code: 'EMPTY_DESCRIPTION' 
        },
        { status: 400 }
      );
    }

    // Sanitize optional fields
    const trimmedImageUrl = image_url ? String(image_url).trim() : null;
    const trimmedCalculatorLink = calculator_link ? String(calculator_link).trim() : null;

    // Prepare insert data
    const insertData: {
      projectId: number;
      stepNumber: number;
      title: string;
      description: string;
      imageUrl: string | null;
      calculatorLink: string | null;
      createdAt: string;
    } = {
      projectId: projectIdInt,
      stepNumber: stepNumberInt,
      title: trimmedTitle,
      description: trimmedDescription,
      imageUrl: trimmedImageUrl,
      calculatorLink: trimmedCalculatorLink,
      createdAt: new Date().toISOString(),
    };

    // Insert step
    const newStep = await db
      .insert(projectStepsNew)
      .values(insertData)
      .returning();

    return NextResponse.json(newStep[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/projects-new/[id]/steps error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}