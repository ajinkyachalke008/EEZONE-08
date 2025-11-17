import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectRatingsNew, projectsNew } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid project ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    // Verify project exists
    const project = await db
      .select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectId))
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

    // Query all ratings for this project
    const ratings = await db
      .select()
      .from(projectRatingsNew)
      .where(eq(projectRatingsNew.projectId, projectId));

    // Calculate average rating
    if (ratings.length === 0) {
      return NextResponse.json(
        {
          averageRating: 0,
          totalRatings: 0
        },
        { status: 200 }
      );
    }

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = Math.round((sumRatings / totalRatings) * 100) / 100;

    return NextResponse.json(
      {
        averageRating,
        totalRatings
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET average rating error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}