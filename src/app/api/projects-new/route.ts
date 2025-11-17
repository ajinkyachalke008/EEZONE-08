import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectsNew } from '@/db/schema';
import { eq, desc, and, or } from 'drizzle-orm';

const VALID_CATEGORIES = ['motor_controller', 'solar_panel', 'home_automation', 'power_supply', 'other'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const VALID_SORT_OPTIONS = ['recent', 'popular', 'featured'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const sort = searchParams.get('sort') ?? 'recent';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('user_id');

    // Validate sort parameter
    if (!VALID_SORT_OPTIONS.includes(sort)) {
      return NextResponse.json({ 
        error: "Invalid sort option. Must be 'recent', 'popular', or 'featured'",
        code: "INVALID_SORT_OPTION"
      }, { status: 400 });
    }

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: "INVALID_CATEGORY"
      }, { status: 400 });
    }

    // Validate difficulty if provided
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ 
        error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        code: "INVALID_DIFFICULTY"
      }, { status: 400 });
    }

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: "Invalid limit parameter",
        code: "INVALID_LIMIT"
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: "Invalid offset parameter",
        code: "INVALID_OFFSET"
      }, { status: 400 });
    }

    // Build query with filters
    let query = db.select().from(projectsNew);

    // Build where conditions
    const conditions = [];
    
    if (category) {
      conditions.push(eq(projectsNew.category, category));
    }
    
    if (difficulty) {
      conditions.push(eq(projectsNew.difficulty, difficulty));
    }
    
    if (userId) {
      conditions.push(eq(projectsNew.userId, userId));
    }

    // Apply featured filter for featured sort
    if (sort === 'featured') {
      conditions.push(eq(projectsNew.featured, 1));
    }

    // Apply where conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sort === 'recent') {
      query = query.orderBy(desc(projectsNew.createdAt));
    } else if (sort === 'popular') {
      query = query.orderBy(desc(projectsNew.views));
    } else if (sort === 'featured') {
      query = query.orderBy(desc(projectsNew.createdAt));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, description, category, difficulty, image_url } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ 
        error: "user_id is required",
        code: "MISSING_USER_ID"
      }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ 
        error: "title is required",
        code: "MISSING_TITLE"
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ 
        error: "description is required",
        code: "MISSING_DESCRIPTION"
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: "category is required",
        code: "MISSING_CATEGORY"
      }, { status: 400 });
    }

    if (!difficulty) {
      return NextResponse.json({ 
        error: "difficulty is required",
        code: "MISSING_DIFFICULTY"
      }, { status: 400 });
    }

    // Validate that strings are non-empty after trimming
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedUserId = user_id.trim();

    if (trimmedTitle.length === 0) {
      return NextResponse.json({ 
        error: "title cannot be empty",
        code: "EMPTY_TITLE"
      }, { status: 400 });
    }

    if (trimmedDescription.length === 0) {
      return NextResponse.json({ 
        error: "description cannot be empty",
        code: "EMPTY_DESCRIPTION"
      }, { status: 400 });
    }

    if (trimmedUserId.length === 0) {
      return NextResponse.json({ 
        error: "user_id cannot be empty",
        code: "EMPTY_USER_ID"
      }, { status: 400 });
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: "INVALID_CATEGORY"
      }, { status: 400 });
    }

    // Validate difficulty
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ 
        error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        code: "INVALID_DIFFICULTY"
      }, { status: 400 });
    }

    // Sanitize optional fields
    const trimmedImageUrl = image_url ? image_url.trim() : null;

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      userId: trimmedUserId,
      title: trimmedTitle,
      description: trimmedDescription,
      category,
      difficulty,
      imageUrl: trimmedImageUrl,
      views: 0,
      featured: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into database
    const newProject = await db.insert(projectsNew)
      .values(insertData)
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}