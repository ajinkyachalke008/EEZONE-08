import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { problem, image } = await request.json();

    if (!problem && !image) {
      return NextResponse.json(
        { error: 'Please provide either a problem text or an image' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Build the messages array
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert electrical and electronics engineering tutor. When given a numerical problem, provide a detailed, step-by-step solution including:
1. Problem Understanding: Briefly restate what's being asked
2. Given Information: List all known values and units
3. Required Formula/Theory: State the relevant formulas or concepts
4. Step-by-Step Solution: Show each calculation step clearly with units
5. Final Answer: Present the final result with proper units and significant figures
6. Additional Notes: Any important considerations, assumptions, or practical insights

Format your response in a clear, educational manner suitable for students and professionals.`
      }
    ];

    // If image is provided, use vision capabilities
    if (image) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please solve this electrical/electronics numerical problem shown in the image. Provide a detailed step-by-step solution.'
          },
          {
            type: 'image_url',
            image_url: {
              url: image,
              detail: 'high'
            }
          }
        ]
      });
    } else {
      // Text-only problem
      messages.push({
        role: 'user',
        content: `Please solve this electrical/electronics numerical problem:\n\n${problem}`
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'EE Zone Problem Solver'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages,
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API Error:', errorData);
      return NextResponse.json(
        { 
          error: `OpenRouter API error: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content;

    if (!solution) {
      return NextResponse.json(
        { error: 'No solution generated. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      solution,
      model: data.model
    });

  } catch (error) {
    console.error('Error in solve-problem API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process your request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
