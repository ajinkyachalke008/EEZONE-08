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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert in electrical and electronic instruments. Analyze this image and identify the instrument shown. 

Provide a detailed response in the following JSON format:
{
  "name": "Full name of the instrument",
  "type": "Category (e.g., Multimeter, Oscilloscope, Power Supply, Function Generator, etc.)",
  "specifications": ["Key spec 1", "Key spec 2", "Key spec 3"],
  "applications": ["Application 1", "Application 2", "Application 3"],
  "tutorials": ["How to use for task 1", "How to use for task 2", "Common troubleshooting tips"],
  "safetyNotes": ["Safety note 1", "Safety note 2"]
}

If you cannot identify an electrical/electronic instrument in the image, return:
{
  "name": "Unknown Instrument",
  "type": "Not Identified",
  "specifications": ["Unable to identify instrument from image"],
  "applications": ["Please upload a clearer image of an electrical or electronic instrument"],
  "tutorials": ["Make sure the instrument is clearly visible", "Ensure good lighting conditions"],
  "safetyNotes": []
}

Be specific and technical in your descriptions. Focus on practical information that would be useful for electrical engineers, students, and technicians.`
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
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Provide specific error messages based on status code
      let errorMessage = 'Failed to analyze image with AI';
      if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.';
      } else if (response.status === 429) {
        errorMessage = errorData.error?.message || 'OpenAI API rate limit exceeded or quota reached. Please check your API usage and billing.';
      } else if (response.status === 400) {
        errorMessage = errorData.error?.message || 'Invalid request to OpenAI API.';
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
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse instrument information' },
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