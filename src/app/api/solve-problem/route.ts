import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert electrical and electronics engineering tutor. When given a numerical problem, provide a detailed, step-by-step solution including:
1. Problem Understanding: Briefly restate what's being asked
2. Given Information: List all known values and units
3. Required Formula/Theory: State the relevant formulas or concepts
4. Step-by-Step Solution: Show each calculation step clearly with units
5. Final Answer: Present the final result with proper units and significant figures
6. Additional Notes: Any important considerations, assumptions, or practical insights

Format your response in a clear, educational manner suitable for students and professionals.`;

async function callOpenRouter(problem?: string, image?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const messages: any[] = [{ role: 'system', content: SYSTEM_PROMPT }];

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
          image_url: { url: image, detail: 'high' }
        }
      ]
    });
  } else {
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
      model: 'google/gemma-3-27b-it:free',
      messages,
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

async function callOpenAI(problem?: string, image?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const messages: any[] = [{ role: 'system', content: SYSTEM_PROMPT }];

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
          image_url: { url: image, detail: 'high' }
        }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: `Please solve this electrical/electronics numerical problem:\n\n${problem}`
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { problem, image } = await request.json();

    if (!problem && !image) {
      return NextResponse.json(
        { error: 'Please provide either a problem text or an image' },
        { status: 400 }
      );
    }

    let data;
    let provider = 'openrouter';
    let error: any = null;

    // Try OpenRouter first
    try {
      data = await callOpenRouter(problem, image);
    } catch (err: any) {
      error = err;
      
      // If OpenRouter fails with rate limit or token issues, try OpenAI
      if (err.status === 429 || err.status === 402 || err.data?.error?.code === 'insufficient_quota') {
        try {
          data = await callOpenAI(problem, image);
          provider = 'openai';
          error = null;
        } catch (openaiErr: any) {
          error = openaiErr;
        }
      }
    }

    // If both failed, return error
    if (error && !data) {
      return NextResponse.json(
        { 
          error: 'Failed to get solution from both AI providers',
          details: error.data?.error?.message || error.message || 'Unknown error'
        },
        { status: error.status || 500 }
      );
    }

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
      model: data.model,
      provider
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to process your request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}