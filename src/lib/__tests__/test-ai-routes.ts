import http from 'http';

interface TestResult {
  route: string;
  name: string;
  status: number;
  pass: boolean;
  responsePreview: string;
  errorBody?: string;
}

function makePostRequest(urlPath: string, payload: any): Promise<{ status: number; body: string }> {
  return new Promise((resolve) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode || 0, body: data });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, body: JSON.stringify({ error: err.message }) });
    });

    req.write(postData);
    req.end();
  });
}

// 1x1 transparent PNG as base64 for instrument test
const sampleImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testAllRoutes() {
  const tests = [
    {
      route: '/api/ai-circuit',
      name: 'AI Circuit Designer',
      payload: { prompt: '5V to 3.3V voltage regulator circuit with LM1117' }
    },
    {
      route: '/api/ai-troubleshoot',
      name: 'AI Troubleshooter',
      payload: { problemType: 'Power Supply', symptoms: '3.3V rail measures 0V and regulator runs hot' }
    },
    {
      route: '/api/ai-code',
      name: 'AI Code Assistant',
      payload: { platform: 'arduino', prompt: 'Blink an LED on pin 13 every 500ms', useOnlineAI: true }
    },
    {
      route: '/api/analyze-instrument',
      name: 'Instrument Scanner',
      payload: { image: sampleImageBase64 }
    },
    {
      route: '/api/solve-problem',
      name: 'Problem Solver',
      payload: { problem: 'Calculate the resonant frequency of an RLC circuit with R=10 ohm, L=100mH, and C=10uF.' }
    },
    {
      route: '/api/ai-assistant',
      name: 'AI Assistant Chat',
      payload: { message: 'Explain Ohm\'s Law and how to calculate power in a DC circuit.' }
    },
    {
      route: '/api/magic-cad/generate',
      name: 'Magic CAD AI Generate',
      payload: { prompt: 'Create a rectangular enclosure box 60mm by 40mm by 20mm with 2mm wall thickness' }
    }
  ];

  console.log('Testing all 7 AI routes with new OPENROUTER_API_KEY...');
  const results: TestResult[] = [];

  for (const t of tests) {
    console.log(`\nTesting [${t.name}] (${t.route})...`);
    const res = await makePostRequest(t.route, t.payload);
    let parsed: any;
    try {
      parsed = JSON.parse(res.body);
    } catch {
      parsed = { raw: res.body };
    }

    const isSuccess = res.status >= 200 && res.status < 300 && !parsed.error;
    let preview = '';
    if (isSuccess) {
      if (parsed.circuit) preview = `Circuit: "${parsed.circuit.title || parsed.circuit.description}" (${parsed.circuit.components?.length || 0} components)`;
      else if (parsed.diagnosis) preview = `Diagnosis: "${parsed.diagnosis.problem}" - Cause: "${parsed.diagnosis.likelyCause}"`;
      else if (parsed.code) preview = `Generated Code (${parsed.code.length} chars)`;
      else if (parsed.instrumentInfo) preview = `Instrument: "${parsed.instrumentInfo.name}" (${parsed.instrumentInfo.type})`;
      else if (parsed.solution) preview = `Solution Preview: "${parsed.solution.slice(0, 80)}..."`;
      else if (parsed.message) preview = `AI Message: "${parsed.message.slice(0, 80)}..."`;
      else if (parsed.scadCode) preview = `OpenSCAD Code (${parsed.scadCode.length} chars, ${parsed.parameters?.length || 0} params)`;
      else preview = JSON.stringify(parsed).slice(0, 100);
    }

    results.push({
      route: t.route,
      name: t.name,
      status: res.status,
      pass: isSuccess,
      responsePreview: preview,
      errorBody: !isSuccess ? res.body : undefined
    });

    console.log(`Status: ${res.status} | Result: ${isSuccess ? 'PASS' : 'FAIL'}`);
    if (isSuccess) {
      console.log(`Output: ${preview}`);
    } else {
      console.log(`Error Body: ${res.body}`);
    }
  }

  console.log('\n================ FINAL RESULTS SUMMARY ================');
  for (const r of results) {
    console.log(`${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.status} | ${r.name} (${r.route})`);
    if (r.pass) {
      console.log(`   Preview: ${r.responsePreview}`);
    } else {
      console.log(`   Error: ${r.errorBody}`);
    }
  }
}

testAllRoutes();
