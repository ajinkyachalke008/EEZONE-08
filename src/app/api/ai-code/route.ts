import { NextRequest, NextResponse } from 'next/server';
import { generateCode } from '@/lib/code-generator';

export async function POST(req: NextRequest) {
  try {
    const { platform, prompt, useOnlineAI = true, apiKey } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const platformKey = (platform || 'arduino').toLowerCase();
    const isOnline = useOnlineAI !== false;

    if (isOnline) {
      const finalApiKey = (typeof apiKey === 'string' && apiKey.trim().length > 0)
        ? apiKey.trim()
        : process.env.OPENROUTER_API_KEY;

      if (!finalApiKey) {
        // If no API key configured anywhere, gracefully use the local code engine
        const fallbackResult = generateCode(platformKey, prompt);
        return NextResponse.json({
          code: fallbackResult.code,
          title: fallbackResult.title,
          description: fallbackResult.description,
          model: 'eezone-code-engine-v1',
          source: 'local-fallback',
        });
      }

      const systemPrompt = `You are an expert embedded systems, robotics, and industrial automation software engineer. Generate complete, production-ready, compilable code based on the user's requirements.

TARGET PLATFORM: ${platformKey.toUpperCase()}
- For Arduino: Output valid C++ Arduino sketch with proper pin definitions, setup(), and loop() functions.
- For ESP32: Output valid ESP32 C++ code with WiFi, BLE, FreeRTOS, or sensor drivers as appropriate.
- For PLC: Output clean IEC 61131-3 Structured Text (ST) or Ladder Logic text representation.

RULES:
1. Provide COMPLETE, fully-working, compilable code. Never use placeholders like "// implement here" or "...".
2. Include all necessary #includes, library dependencies, pin definitions, and comments explaining the logic.
3. Respond ONLY with the code enclosed inside markdown code fences (\`\`\`cpp or \`\`\`st).`;

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${finalApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://eezone.com',
            'X-Title': 'EE Zone Code Assistant',
          },
          body: JSON.stringify({
            model: 'google/gemma-3-27b-it',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Platform: ${platformKey.toUpperCase()}\n\nRequirement: ${prompt}` }
            ],
            temperature: 0.2,
            max_tokens: 3500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let code = data.choices?.[0]?.message?.content || '';

          // Clean markdown code blocks
          const codeMatch = code.match(/```(?:[a-zA-Z0-9_+\-]*\n)?([\s\S]*?)```/);
          if (codeMatch && codeMatch[1]) {
            code = codeMatch[1].trim();
          } else {
            code = code.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
          }

          return NextResponse.json({
            code,
            title: `${platformKey.toUpperCase()} Code (Online AI)`,
            description: `Generated via ${data.model || 'OpenRouter AI'}`,
            model: data.model,
            source: 'online',
          });
        }
      } catch (networkErr) {
        console.warn('OpenRouter online AI call failed, falling back to local engine:', networkErr);
      }

      // If online call failed or was rate limited, fall back to local generation
      const fallback = generateCode(platformKey, prompt);
      return NextResponse.json({
        code: fallback.code,
        title: fallback.title,
        description: fallback.description,
        model: 'eezone-code-engine-v1 (Fallback)',
        source: 'local-fallback',
      });
    }

    // Explicitly requested local engine
    const result = generateCode(platformKey, prompt);

    return NextResponse.json({
      code: result.code,
      title: result.title,
      description: result.description,
      model: 'eezone-code-engine-v1',
      source: 'local',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
