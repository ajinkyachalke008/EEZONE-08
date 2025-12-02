import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid slug is required',
          code: 'INVALID_SLUG' 
        },
        { status: 400 }
      );
    }

    // Query single topic by slug
    const topic = await db.select()
      .from(topics)
      .where(eq(topics.slug, slug))
      .limit(1);

    // Return 404 if topic not found
    if (topic.length === 0) {
      return NextResponse.json(
        { 
          error: 'Topic not found',
          code: 'TOPIC_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Return the topic object
    return NextResponse.json(topic[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}