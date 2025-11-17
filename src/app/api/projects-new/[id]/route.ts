import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectsNew, projectStepsNew, projectRatingsNew, projectCommentsNew } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid project ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    const project = await db
      .select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const steps = await db
      .select()
      .from(projectStepsNew)
      .where(eq(projectStepsNew.projectId, projectId))
      .orderBy(asc(projectStepsNew.stepNumber));

    const ratings = await db
      .select()
      .from(projectRatingsNew)
      .where(eq(projectRatingsNew.projectId, projectId));

    const comments = await db
      .select()
      .from(projectCommentsNew)
      .where(eq(projectCommentsNew.projectId, projectId))
      .orderBy(desc(projectCommentsNew.createdAt));

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    await db
      .update(projectsNew)
      .set({
        views: project[0].views + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(projectsNew.id, projectId));

    return NextResponse.json({
      project: {
        ...project[0],
        views: project[0].views + 1
      },
      steps,
      ratings,
      comments,
      averageRating: Math.round(averageRating * 10) / 10
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid project ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    const body = await request.json();
    const { title, description, category, difficulty, imageUrl, featured } = body;

    if (!title && !description && !category && !difficulty && imageUrl === undefined && featured === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const validCategories = ['Electronics', 'Woodworking', 'Programming', 'Crafts', 'Home Improvement', 'Other'];
    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];

    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}`, code: 'INVALID_CATEGORY' },
        { status: 400 }
      );
    }

    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`, code: 'INVALID_DIFFICULTY' },
        { status: 400 }
      );
    }

    if (featured !== undefined && featured !== 0 && featured !== 1) {
      return NextResponse.json(
        { error: 'Featured must be 0 or 1', code: 'INVALID_FEATURED_VALUE' },
        { status: 400 }
      );
    }

    const existingProject = await db
      .select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectId))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
    if (featured !== undefined) updates.featured = featured;

    const updatedProject = await db
      .update(projectsNew)
      .set(updates)
      .where(eq(projectsNew.id, projectId))
      .returning();

    if (updatedProject.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update project', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProject[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid project ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    const existingProject = await db
      .select()
      .from(projectsNew)
      .where(eq(projectsNew.id, projectId))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db
      .delete(projectStepsNew)
      .where(eq(projectStepsNew.projectId, projectId));

    await db
      .delete(projectRatingsNew)
      .where(eq(projectRatingsNew.projectId, projectId));

    await db
      .delete(projectCommentsNew)
      .where(eq(projectCommentsNew.projectId, projectId));

    await db
      .delete(projectsNew)
      .where(eq(projectsNew.id, projectId));

    return NextResponse.json(
      {
        message: 'Project deleted successfully',
        projectId: projectId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}