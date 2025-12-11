import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert circuit design engineer. Analyze circuit requirements and provide detailed component lists and connection instructions.

OUTPUT FORMAT (JSON):
{
  "title": "Circuit name",
  "description": "Brief circuit description",
  "components": [
    { "id": "1", "type": "Component type (e.g., Resistor, Capacitor, IC)", "label": "Reference (e.g., R1, C1, U1)", "value": "Value with unit (e.g., 10kΩ, 100µF)" }
  ],
  "schematicDescription": "Step-by-step connection instructions",
  "calculations": "Any relevant formulas and calculations",
  "notes": ["Important design considerations", "Safety warnings"]
}

REQUIREMENTS:
1. Always include power supply components
2. Calculate all component values based on requirements
3. Include current-limiting resistors for LEDs
4. Add decoupling capacitors for ICs
5. Consider thermal management for power circuits
6. Include protection components (fuses, TVS diodes) where needed
7. Provide realistic, purchasable component values

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eezone.com',
        'X-Title': 'EE Zone Circuit Designer',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Design a circuit for: ${prompt}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to design circuit', details: error }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    let circuit;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      circuit = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      circuit = {
        title: 'Circuit Design',
        description: prompt,
        components: [],
        schematicDescription: content,
        notes: []
      };
    }

    return NextResponse.json({
      circuit,
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
