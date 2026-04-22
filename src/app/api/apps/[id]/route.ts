import { NextResponse } from 'next/server';
import { db } from '@/db';
import { apps } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 });
    }

    const appList = await db.select().from(apps).where(eq(apps.id, id));
    
    if (appList.length === 0) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app: appList[0] }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching app ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch app' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 });
    }

    const body = await req.json();
    
    const updatedApp = await db.update(apps)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, id))
      .returning();

    if (updatedApp.length === 0) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app: updatedApp[0] }, { status: 200 });
  } catch (error) {
    console.error(`Error updating app ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 });
    }

    const deletedApp = await db.delete(apps).where(eq(apps.id, id)).returning();

    if (deletedApp.length === 0) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'App deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting app ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
  }
}
