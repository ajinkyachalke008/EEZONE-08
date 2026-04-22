import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { platform, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert embedded systems and industrial automation code generator. Generate complete, production-ready code based on user requirements.

PLATFORMS:
- PLC: Generate IEC 61131-3 Structured Text or Ladder Logic (text representation)
- Arduino: Generate Arduino C++ code with proper setup() and loop()
- ESP32: Generate ESP32 Arduino code with WiFi, BLE, and ESP-IDF features

REQUIREMENTS:
1. Generate COMPLETE, COMPILABLE code - no placeholders or "TODO" comments
2. Include all necessary #includes and library imports
3. Add proper pin definitions and constants
4. Include error handling and safety checks
5. Add brief inline comments for complex logic
6. Use industry best practices and patterns
7. For motor/relay control, include safety interlocks
8. For sensor reading, include filtering/debouncing

OUTPUT FORMAT:
Respond with ONLY the code block, no explanations before or after. Start directly with the code.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eezone.com',
        'X-Title': 'EE Zone Code Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Platform: ${platform.toUpperCase()}\n\nRequirement: ${prompt}` }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to generate code', details: error }, { status: response.status });
    }

    const data = await response.json();
    const code = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      code,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
