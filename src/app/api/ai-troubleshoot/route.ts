import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { problemType, symptoms } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms description is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert electrical troubleshooting technician with decades of field experience. Analyze electrical problems and provide systematic diagnostic procedures.

OUTPUT FORMAT (JSON):
{
  "problem": "Identified problem name",
  "likelyCause": "Most probable cause",
  "severity": "low|medium|high|critical",
  "diagnosticSteps": [
    {
      "step": 1,
      "title": "Step title",
      "action": "Detailed action to perform",
      "expectedResult": "What to expect if working correctly",
      "tools": "Tools needed for this step"
    }
  ],
  "solution": "Recommended solution based on diagnosis",
  "preventiveMeasures": ["Future prevention tips"],
  "safetyWarnings": ["Critical safety warnings"],
  "estimatedTime": "Approximate repair time",
  "partsNeeded": ["Potential replacement parts"]
}

REQUIREMENTS:
1. Always prioritize safety first
2. Start with non-invasive tests before disassembly
3. Include multimeter/megger readings where applicable
4. Consider common failure modes for the system type
5. Provide clear pass/fail criteria for each step
6. Include warnings about electrical hazards
7. Suggest when to call a licensed electrician

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eezone.com',
        'X-Title': 'EE Zone Troubleshooting',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Problem Category: ${problemType}\n\nSymptoms: ${symptoms}` }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to diagnose problem', details: error }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    let diagnosis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      diagnosis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      diagnosis = {
        problem: 'Analysis Result',
        likelyCause: 'See description',
        severity: 'medium',
        diagnosticSteps: [{ step: 1, title: 'Review', action: content, expectedResult: 'N/A' }],
        solution: content,
        preventiveMeasures: [],
        safetyWarnings: ['Always disconnect power before working on electrical systems']
      };
    }

    return NextResponse.json({
      diagnosis,
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
