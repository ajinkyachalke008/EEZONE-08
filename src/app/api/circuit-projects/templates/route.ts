import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { circuitProjects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_CATEGORIES = ['beginner', 'analog', 'digital', 'arduino', 'power'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { 
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY'
        },
        { status: 400 }
      );
    }

    // Parse and validate limit
    const limit = limitParam ? parseInt(limitParam) : 20;
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { 
          error: 'Limit must be a positive integer',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      );
    }
    if (limit > 100) {
      return NextResponse.json(
        { 
          error: 'Limit cannot exceed 100',
          code: 'LIMIT_EXCEEDED'
        },
        { status: 400 }
      );
    }

    // Parse and validate offset
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { 
          error: 'Offset must be a non-negative integer',
          code: 'INVALID_OFFSET'
        },
        { status: 400 }
      );
    }

    // Build query with filters
    let query = db.select().from(circuitProjects);

    // Always filter by isTemplate = true
    if (category) {
      query = query.where(
        and(
          eq(circuitProjects.isTemplate, true),
          eq(circuitProjects.category, category)
        )
      );
    } else {
      query = query.where(eq(circuitProjects.isTemplate, true));
    }

    // Apply sorting and pagination
    const templates = await query
      .orderBy(desc(circuitProjects.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(templates, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}