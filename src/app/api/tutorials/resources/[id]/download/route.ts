import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { downloadableResources } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const resourceId = parseInt(id);

    // Check if resource exists
    const existingResource = await db
      .select()
      .from(downloadableResources)
      .where(eq(downloadableResources.id, resourceId))
      .limit(1);

    if (existingResource.length === 0) {
      return NextResponse.json(
        { 
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const resource = existingResource[0];

    // Increment downloads count
    const updatedResource = await db
      .update(downloadableResources)
      .set({
        downloads: resource.downloads + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(downloadableResources.id, resourceId))
      .returning();

    if (updatedResource.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update download count',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Return download information
    return NextResponse.json(
      {
        downloadUrl: updatedResource[0].fileUrl,
        fileName: updatedResource[0].title,
        fileType: updatedResource[0].fileType,
        downloads: updatedResource[0].downloads
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}