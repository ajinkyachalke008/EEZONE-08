import http from 'http';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const keyMatch = envContent.match(/OPENROUTER_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

const models = [
  'google/gemma-3-27b-it',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'deepseek/deepseek-chat',
  'google/gemini-flash-1.5',
  'qwen/qwen-2.5-72b-instruct'
];

async function testModel(modelName: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://eezone.com',
      'X-Title': 'EE Zone',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: 'Say hello in one word' }],
      max_tokens: 10,
    }),
  });

  const body = await response.json();
  console.log(`[${response.status}] ${modelName}:`, response.ok ? body.choices?.[0]?.message?.content : JSON.stringify(body));
  return response.ok;
}

async function run() {
  console.log('Testing models with API Key:', apiKey.slice(0, 15) + '...');
  for (const m of models) {
    await testModel(m);
  }
}

run();
