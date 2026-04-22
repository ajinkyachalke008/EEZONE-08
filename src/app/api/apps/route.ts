import { NextResponse } from 'next/server';
import { db } from '@/db';
import { apps } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allApps = await db.select().from(apps).orderBy(desc(apps.rating));
    return NextResponse.json({ apps: allApps }, { status: 200 });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'purpose', 'necVersion', 'image'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const newApp = await db.insert(apps).values({
      name: body.name,
      description: body.description,
      category: body.category,
      purpose: body.purpose,
      necVersion: body.necVersion,
      image: body.image,
      rating: body.rating || 0.0,
      reviews: body.reviews || 0,
      isPro: body.isPro || false,
      href: body.href,
      targetRoles: body.targetRoles,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ app: newApp[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating app:', error);
    return NextResponse.json({ error: 'Failed to create app' }, { status: 500 });
  }
}
