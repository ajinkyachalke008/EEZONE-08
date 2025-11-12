import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Call OpenRouter Vision API
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
              {
                type: 'text',
                text: `You are an expert electrical and electronics engineer specializing in test equipment and instrumentation. Analyze this image carefully and identify any electrical or electronic instrument visible.

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

Be extremely detailed and technical. Assume the user is an electrical engineer or technician who needs comprehensive information.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2500,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Provide specific error messages based on status code
      let errorMessage = 'Failed to analyze image with AI';
      if (response.status === 401) {
        errorMessage = 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY environment variable.';
      } else if (response.status === 429) {
        errorMessage = errorData.error?.message || 'OpenRouter API rate limit exceeded. Please check your API usage.';
      } else if (response.status === 400) {
        errorMessage = errorData.error?.message || 'Invalid request to OpenRouter API.';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response from GPT-4
    let instrumentInfo;
    try {
      // Extract JSON from markdown code blocks if present
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

    return NextResponse.json({ instrumentInfo });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during analysis' },
      { status: 500 }
    );
  }
}