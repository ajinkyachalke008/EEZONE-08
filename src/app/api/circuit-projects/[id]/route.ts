import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { circuitProjects } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = ['beginner', 'analog', 'digital', 'arduino', 'power'];

function validateJSON(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (value === undefined || value === null) {
    return { valid: true };
  }

  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return { valid: true };
    } catch {
      return { valid: false, error: `${fieldName} must be valid JSON` };
    }
  }

  if (typeof value === 'object') {
    return { valid: true };
  }

  return { valid: false, error: `${fieldName} must be valid JSON` };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const project = await db
      .select()
      .from(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(project[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingProject = await db
      .select()
      .from(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      thumbnail,
      components,
      wires,
      simulationSettings,
      category,
      isTemplate,
    } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY',
        },
        { status: 400 }
      );
    }

    if (components !== undefined) {
      const validation = validateJSON(components, 'components');
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, code: 'INVALID_COMPONENTS_JSON' },
          { status: 400 }
        );
      }
    }

    if (wires !== undefined) {
      const validation = validateJSON(wires, 'wires');
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, code: 'INVALID_WIRES_JSON' },
          { status: 400 }
        );
      }
    }

    if (simulationSettings !== undefined) {
      const validation = validateJSON(simulationSettings, 'simulationSettings');
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, code: 'INVALID_SIMULATION_SETTINGS_JSON' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (components !== undefined) updateData.components = components;
    if (wires !== undefined) updateData.wires = wires;
    if (simulationSettings !== undefined) updateData.simulationSettings = simulationSettings;
    if (category !== undefined) updateData.category = category;
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;

    const updated = await db
      .update(circuitProjects)
      .set(updateData)
      .where(eq(circuitProjects.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingProject = await db
      .select()
      .from(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Project deleted successfully',
        projectId: deleted[0].id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}