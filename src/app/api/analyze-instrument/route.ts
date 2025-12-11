import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert electrical and electronics engineer specializing in test equipment and instrumentation. Analyze this image carefully and identify any electrical or electronic instrument visible.

IMPORTANT: Provide COMPREHENSIVE and DETAILED information. Do not leave any arrays empty unless truly no information exists.

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "name": "Full specific name and model if visible (e.g., 'Fluke 87V Digital Multimeter' or 'Generic Digital Multimeter')",
  "type": "Specific category (Multimeter, Oscilloscope, Power Supply, Function Generator, Spectrum Analyzer, LCR Meter, etc.)",
  "specifications": [
    "At least 5-8 detailed technical specifications",
    "Include voltage/current ranges if applicable",
    "Display type and resolution",
    "Measurement accuracy",
    "Special features (True RMS, Auto-ranging, etc.)",
    "Input impedance",
    "Sampling rate or bandwidth",
    "Power requirements"
  ],
  "applications": [
    "At least 5-7 practical real-world applications",
    "Circuit troubleshooting and debugging",
    "Component testing procedures",
    "Industrial maintenance uses",
    "Educational/laboratory applications",
    "Quality control and testing",
    "Field service applications",
    "Research and development uses"
  ],
  "tutorials": [
    "At least 5-7 step-by-step usage instructions",
    "How to perform basic measurements",
    "How to select appropriate measurement mode",
    "How to connect test leads properly",
    "How to interpret display readings",
    "Common measurement techniques",
    "Calibration and maintenance tips",
    "Troubleshooting common issues"
  ],
  "safetyNotes": [
    "At least 3-5 critical safety warnings",
    "Voltage/current limitations and warnings",
    "Proper connection procedures",
    "Isolation and grounding requirements",
    "What NOT to do with this instrument",
    "Personal protective equipment needed"
  ]
}

If the instrument is partially visible or generic:
- Still provide detailed specifications for that TYPE of instrument
- Give comprehensive applications and tutorials for the category
- Always include safety information

If NO electrical/electronic instrument is visible:
{
  "name": "No Electrical Instrument Detected",
  "type": "Not Identified",
  "specifications": ["No electrical or electronic instrument found in the image", "Please capture or upload an image showing a clear view of the instrument"],
  "applications": ["Ensure the entire instrument is visible in the frame", "Use good lighting conditions", "Hold the camera steady for a clear shot"],
  "tutorials": ["Position the instrument on a flat surface", "Ensure all labels and display screens are visible", "Take the photo from directly above or in front of the instrument"],
  "safetyNotes": []
}

Be extremely detailed and technical. Assume the user is an electrical engineer or technician who needs comprehensive information.`;

async function callOpenRouter(image: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'EE Zone - Instrument Scanner'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: image, detail: 'high' } }
          ]
        }
      ],
      max_tokens: 2500,
      temperature: 0.5
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

async function callOpenAI(image: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: image, detail: 'high' } }
          ]
        }
      ],
      max_tokens: 2500,
      temperature: 0.5
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
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    let data;
    let provider = 'openrouter';
    let error: any = null;

    // Try OpenRouter first
    try {
      data = await callOpenRouter(image);
    } catch (err: any) {
      error = err;
      
      // If OpenRouter fails with rate limit or token issues, try OpenAI
      if (err.status === 429 || err.status === 402 || err.data?.error?.code === 'insufficient_quota') {
        try {
          data = await callOpenAI(image);
          provider = 'openai';
          error = null;
        } catch (openaiErr: any) {
          error = openaiErr;
        }
      }
    }

    // If both failed, return error
    if (error && !data) {
      let errorMessage = 'Failed to analyze image with AI';
      if (error.status === 401) {
        errorMessage = 'Invalid API key. Please check your configuration.';
      } else if (error.status === 429 || error.status === 402) {
        errorMessage = 'API rate limit exceeded for both providers. Please try again later.';
      } else if (error.data?.error?.message) {
        errorMessage = error.data.error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: error.status || 500 }
      );
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let instrumentInfo;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      instrumentInfo = JSON.parse(jsonString.trim());
      
      // Ensure all required fields exist with defaults
      instrumentInfo = {
        name: instrumentInfo.name || 'Unknown Instrument',
        type: instrumentInfo.type || 'Not Identified',
        specifications: Array.isArray(instrumentInfo.specifications) ? instrumentInfo.specifications : [],
        applications: Array.isArray(instrumentInfo.applications) ? instrumentInfo.applications : [],
        tutorials: Array.isArray(instrumentInfo.tutorials) ? instrumentInfo.tutorials : [],
        safetyNotes: Array.isArray(instrumentInfo.safetyNotes) ? instrumentInfo.safetyNotes : []
      };
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse instrument information. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ instrumentInfo, provider });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred during analysis' },
      { status: 500 }
    );
  }
}