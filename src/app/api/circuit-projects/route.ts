import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { circuitProjects } from '@/db/schema';
import { eq, and, or, like } from 'drizzle-orm';

const VALID_CATEGORIES = ['beginner', 'analog', 'digital', 'arduino', 'power'];

function validateJSON(value: any, fieldName: string): void {
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
    } catch {
      throw new Error(`${fieldName} must be valid JSON`);
    }
  } else if (typeof value !== 'object' || value === null) {
    throw new Error(`${fieldName} must be a valid JSON object or array`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const category = searchParams.get('category');
    const isTemplate = searchParams.get('is_template');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(circuitProjects);
    const conditions = [];

    if (userId) {
      conditions.push(eq(circuitProjects.userId, userId));
    }

    if (category) {
      if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
        return NextResponse.json(
          { 
            error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
            code: 'INVALID_CATEGORY'
          },
          { status: 400 }
        );
      }
      conditions.push(eq(circuitProjects.category, category.toLowerCase()));
    }

    if (isTemplate !== null && isTemplate !== undefined) {
      const isTemplateValue = isTemplate === 'true' || isTemplate === '1';
      conditions.push(eq(circuitProjects.isTemplate, isTemplateValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      name, 
      description, 
      thumbnail, 
      components, 
      wires, 
      simulationSettings, 
      category, 
      isTemplate 
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Name is required and must be a non-empty string',
          code: 'INVALID_NAME'
        },
        { status: 400 }
      );
    }

    if (!components) {
      return NextResponse.json(
        { 
          error: 'Components field is required',
          code: 'MISSING_COMPONENTS'
        },
        { status: 400 }
      );
    }

    if (!wires) {
      return NextResponse.json(
        { 
          error: 'Wires field is required',
          code: 'MISSING_WIRES'
        },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { 
          error: 'Category is required',
          code: 'MISSING_CATEGORY'
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
      return NextResponse.json(
        { 
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY'
        },
        { status: 400 }
      );
    }

    // Validate JSON fields
    try {
      validateJSON(components, 'Components');
      validateJSON(wires, 'Wires');
      if (simulationSettings !== undefined && simulationSettings !== null) {
        validateJSON(simulationSettings, 'Simulation settings');
      }
    } catch (error) {
      return NextResponse.json(
        { 
          error: (error as Error).message,
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // Validate isTemplate if provided
    if (isTemplate !== undefined && isTemplate !== null) {
      if (typeof isTemplate !== 'boolean' && isTemplate !== 0 && isTemplate !== 1) {
        return NextResponse.json(
          { 
            error: 'isTemplate must be a boolean or 0/1',
            code: 'INVALID_IS_TEMPLATE'
          },
          { status: 400 }
        );
      }
    }

    // Prepare data for insertion
    const now = new Date();
    const insertData: any = {
      name: name.trim(),
      category: category.toLowerCase(),
      components: typeof components === 'string' ? components : JSON.stringify(components),
      wires: typeof wires === 'string' ? wires : JSON.stringify(wires),
      createdAt: now,
      updatedAt: now,
    };

    if (userId !== undefined && userId !== null) {
      insertData.userId = userId;
    }

    if (description !== undefined && description !== null) {
      insertData.description = typeof description === 'string' ? description.trim() : description;
    }

    if (thumbnail !== undefined && thumbnail !== null) {
      insertData.thumbnail = thumbnail;
    }

    if (simulationSettings !== undefined && simulationSettings !== null) {
      insertData.simulationSettings = typeof simulationSettings === 'string' 
        ? simulationSettings 
        : JSON.stringify(simulationSettings);
    }

    if (isTemplate !== undefined && isTemplate !== null) {
      insertData.isTemplate = Boolean(isTemplate);
    } else {
      insertData.isTemplate = false;
    }

    const newProject = await db.insert(circuitProjects)
      .values(insertData)
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}