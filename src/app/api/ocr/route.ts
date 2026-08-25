import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (GAP-05)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const MAX_REQUESTS_PER_MINUTE = 15;
const MAX_PAYLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

export async function POST(request: NextRequest) {
  // Rate limiting by IP
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const clientLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - clientLimit.lastReset > 60000) {
    clientLimit.count = 0;
    clientLimit.lastReset = now;
  }

  if (clientLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a moment before scanning another equation." },
      { status: 429 }
    );
  }

  clientLimit.count += 1;
  rateLimitMap.set(ip, clientLimit);

  const MATHPIX_APP_ID = process.env.MATHPIX_APP_ID;
  const MATHPIX_APP_KEY = process.env.MATHPIX_APP_KEY;

  if (!MATHPIX_APP_ID || !MATHPIX_APP_KEY) {
    return NextResponse.json(
      { error: "Mathpix API credentials not configured (MATHPIX_APP_ID / MATHPIX_APP_KEY env vars required)" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { imageData } = body as { imageData: string };

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "No valid image data provided" }, { status: 400 });
    }

    // Payload size check (GAP-05)
    if (imageData.length > MAX_PAYLOAD_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file too large. Maximum size is 5MB." },
        { status: 413 }
      );
    }

    const base64 = imageData.includes(",") ? imageData.split(",")[1] : imageData;

    const mathpixResponse = await fetch("https://api.mathpix.com/v3/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "app_id": MATHPIX_APP_ID,
        "app_key": MATHPIX_APP_KEY,
      },
      body: JSON.stringify({
        src: `data:image/jpeg;base64,${base64}`,
        formats: ["latex_simplified", "text"],
        data_options: {
          include_latex: true,
        },
      }),
    });

    if (!mathpixResponse.ok) {
      const errText = await mathpixResponse.text();
      return NextResponse.json(
        { error: `Mathpix API error: ${mathpixResponse.status} — ${errText}` },
        { status: mathpixResponse.status }
      );
    }

    const data = await mathpixResponse.json();
    const latex = data.latex_simplified || data.text || "";

    return NextResponse.json({ latex, raw: data });
  } catch (e) {
    console.error("OCR route error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
