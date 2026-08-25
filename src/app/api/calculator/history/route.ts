import { NextRequest, NextResponse } from "next/server";

// Fallback in-memory history cache if database is offline or unconfigured
let fallbackHistory: unknown[] = [];

export async function GET() {
  try {
    return NextResponse.json({ history: fallbackHistory });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry } = body;

    if (entry) {
      fallbackHistory = [entry, ...fallbackHistory].slice(0, 100);
    }

    return NextResponse.json({ success: true, count: fallbackHistory.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save history entry" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  fallbackHistory = [];
  return NextResponse.json({ success: true });
}
