import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

const sampleImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const visionModels = [
  'google/gemma-3-27b-it',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'meta-llama/llama-3.2-90b-vision-instruct',
  'openai/gpt-4o-mini',
  'qwen/qwen-2.5-vl-72b-instruct'
];

async function testVision(model: string) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eezone.com',
        'X-Title': 'EE Zone Test'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe what you see in this image briefly.' },
              { type: 'image_url', image_url: { url: sampleImageBase64 } }
            ]
          }
        ],
        max_tokens: 50
      })
    });
    const body = await res.json();
    console.log(`[${res.status}] ${model}:`, res.ok ? body.choices?.[0]?.message?.content : JSON.stringify(body));
    return res.ok;
  } catch (err: any) {
    console.log(`[ERR] ${model}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('Testing vision models on OpenRouter...');
  for (const m of visionModels) {
    await testVision(m);
  }
}

run();
