import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');

    let query = db.select().from(badges);

    if (category) {
      query = query.where(eq(badges.category, category));
    }

    const results = await query
      .orderBy(asc(badges.category), asc(badges.name))
      .limit(limit)
      .offset(offset);

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
      badgeId,
      name,
      description,
      icon,
      category,
      requirementType,
      requirementValue,
    } = body;

    // Validate all required fields
    if (!badgeId) {
      return NextResponse.json(
        {
          error: 'badgeId is required',
          code: 'MISSING_BADGE_ID',
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error: 'name is required',
          code: 'MISSING_NAME',
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error: 'description is required',
          code: 'MISSING_DESCRIPTION',
        },
        { status: 400 }
      );
    }

    if (!icon) {
      return NextResponse.json(
        {
          error: 'icon is required',
          code: 'MISSING_ICON',
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error: 'category is required',
          code: 'MISSING_CATEGORY',
        },
        { status: 400 }
      );
    }

    if (!requirementType) {
      return NextResponse.json(
        {
          error: 'requirementType is required',
          code: 'MISSING_REQUIREMENT_TYPE',
        },
        { status: 400 }
      );
    }

    if (requirementValue === undefined || requirementValue === null) {
      return NextResponse.json(
        {
          error: 'requirementValue is required',
          code: 'MISSING_REQUIREMENT_VALUE',
        },
        { status: 400 }
      );
    }

    // Validate requirementValue is a valid integer
    if (isNaN(parseInt(String(requirementValue)))) {
      return NextResponse.json(
        {
          error: 'requirementValue must be a valid integer',
          code: 'INVALID_REQUIREMENT_VALUE',
        },
        { status: 400 }
      );
    }

    // Check if badgeId already exists
    const existingBadge = await db
      .select()
      .from(badges)
      .where(eq(badges.badgeId, badgeId.trim()))
      .limit(1);

    if (existingBadge.length > 0) {
      return NextResponse.json(
        {
          error: 'Badge with this badgeId already exists',
          code: 'DUPLICATE_BADGE_ID',
        },
        { status: 400 }
      );
    }

    // Create new badge
    const newBadge = await db
      .insert(badges)
      .values({
        badgeId: badgeId.trim(),
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim(),
        category: category.trim(),
        requirementType: requirementType.trim(),
        requirementValue: parseInt(String(requirementValue)),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newBadge[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}