import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // System prompt for electrical engineering assistant
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
        model: 'google/gemini-flash-1.5',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context ? [{ role: 'user', content: `Context: ${context}` }] : []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI response', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      message: aiMessage,
      model: data.model,
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