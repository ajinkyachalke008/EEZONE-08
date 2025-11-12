import { NextRequest, NextResponse } from 'next/server';

async function callOpenRouter(message: string, context?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const systemPrompt = `You are an expert Electrical Engineering AI Assistant for EE Zone, a platform for electrical and electronics professionals, students, and technicians.

Your role:
- Answer questions about electrical engineering concepts, calculations, and best practices
- Explain NEC codes, safety standards, and regulations
- Help with circuit design, power systems, motor controls, and automation
- Provide step-by-step solutions for electrical problems
- Use practical examples and real-world applications
- Be clear, concise, and educational

Always prioritize safety and compliance with electrical codes. When discussing calculations, show your work. If asked about dangerous procedures, emphasize proper safety precautions.

Keep responses concise but thorough. Use technical terms appropriately but explain them when needed.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://eezone.com',
      'X-Title': 'EE Zone AI Assistant',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: (context ? `Context: ${context}\n\n` : '') + message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

async function callOpenAI(message: string, context?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an expert Electrical Engineering AI Assistant for EE Zone, a platform for electrical and electronics professionals, students, and technicians.

Your role:
- Answer questions about electrical engineering concepts, calculations, and best practices
- Explain NEC codes, safety standards, and regulations
- Help with circuit design, power systems, motor controls, and automation
- Provide step-by-step solutions for electrical problems
- Use practical examples and real-world applications
- Be clear, concise, and educational

Always prioritize safety and compliance with electrical codes. When discussing calculations, show your work. If asked about dangerous procedures, emphasize proper safety precautions.

Keep responses concise but thorough. Use technical terms appropriately but explain them when needed.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: (context ? `Context: ${context}\n\n` : '') + message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let data;
    let provider = 'openrouter';
    let error: any = null;

    // Try OpenRouter first
    try {
      data = await callOpenRouter(message, context);
    } catch (err: any) {
      console.error('OpenRouter error:', err);
      error = err;
      
      // If OpenRouter fails with rate limit or token issues, try OpenAI
      if (err.status === 429 || err.status === 402 || err.data?.error?.code === 'insufficient_quota') {
        console.log('OpenRouter limit reached, falling back to OpenAI...');
        try {
          data = await callOpenAI(message, context);
          provider = 'openai';
          error = null;
        } catch (openaiErr: any) {
          console.error('OpenAI error:', openaiErr);
          error = openaiErr;
        }
      }
    }

    // If both failed, return error
    if (error && !data) {
      return NextResponse.json(
        { 
          error: 'Failed to get AI response from both providers',
          details: error.data || error.message || 'Unknown error'
        },
        { status: error.status || 500 }
      );
    }

    const aiMessage = data.choices?.[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      message: aiMessage,
      model: data.model,
      provider,
      usage: data.usage,
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}