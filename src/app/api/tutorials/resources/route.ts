import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { downloadableResources } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_FILE_TYPES = ['PDF', 'XLSX', 'DOC', 'DOCX', 'CSV', 'ZIP'];
const VALID_CATEGORIES = ['Reference', 'Templates', 'Calculations', 'Design'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const fileType = searchParams.get('file_type');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(downloadableResources);

    const conditions = [];

    if (category) {
      conditions.push(eq(downloadableResources.category, category));
    }

    if (fileType) {
      conditions.push(eq(downloadableResources.fileType, fileType));
    }

    if (search) {
      conditions.push(
        or(
          like(downloadableResources.title, `%${search}%`),
          like(downloadableResources.description, `%${search}%`),
          like(downloadableResources.tags, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(downloadableResources.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, fileType, fileSize, fileUrl, category, tags } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!fileType || !fileType.trim()) {
      return NextResponse.json(
        { error: 'File type is required', code: 'MISSING_FILE_TYPE' },
        { status: 400 }
      );
    }

    if (!fileSize || !fileSize.trim()) {
      return NextResponse.json(
        { error: 'File size is required', code: 'MISSING_FILE_SIZE' },
        { status: 400 }
      );
    }

    if (!fileUrl || !fileUrl.trim()) {
      return NextResponse.json(
        { error: 'File URL is required', code: 'MISSING_FILE_URL' },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    // Validate fileType
    if (!VALID_FILE_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          error: `File type must be one of: ${VALID_FILE_TYPES.join(', ')}`,
          code: 'INVALID_FILE_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY',
        },
        { status: 400 }
      );
    }

    // Validate fileSize format (e.g., "2.4 MB", "512 KB")
    const fileSizeRegex = /^\d+(\.\d+)?\s*(KB|MB|GB)$/i;
    if (!fileSizeRegex.test(fileSize)) {
      return NextResponse.json(
        {
          error: 'File size must be in format like "2.4 MB" or "512 KB"',
          code: 'INVALID_FILE_SIZE_FORMAT',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newResource = await db
      .insert(downloadableResources)
      .values({
        title: title.trim(),
        description: description.trim(),
        fileType: fileType.trim(),
        fileSize: fileSize.trim(),
        fileUrl: fileUrl.trim(),
        category: category.trim(),
        tags: tags ? tags.trim() : '',
        downloads: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newResource[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}