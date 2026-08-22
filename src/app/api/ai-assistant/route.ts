import { NextRequest, NextResponse } from 'next/server';

async function callOpenRouter(message: string, context?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const systemPrompt = `You are an expert Electrical Engineering AI Assistant for EE Zone, a platform for electrical and electronics professionals, students, and technicians.

Your role:
- Answer questions about electrical engineering concepts, calculations, and best practices
- Explain NEC codes, safety standards, and regulations
- Help with circuit design, power systems, motor controls, and automation
- Provide step-by-step solutions for electrical problems
- Use practical examples and real-world applications
- Be clear, concise, and educational
- Generate circuits, suggest components, diagnose issues, and calculate values

Always prioritize safety and compliance with electrical codes. When discussing calculations, show your work. If asked about dangerous procedures, emphasize proper safety precautions.

Keep responses concise but thorough. Use technical terms appropriately but explain them when needed.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://eezone.com',
      'X-Title': 'EE Zone AI Assistant',
    },
    body: JSON.stringify({
      model: 'google/gemma-3-27b-it',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: (context ? `Context: ${context}\n\n` : '') + message }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

async function callOpenAI(message: string, context?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an expert Electrical Engineering AI Assistant for EE Zone, a platform for electrical and electronics professionals, students, and technicians.

Your role:
- Answer questions about electrical engineering concepts, calculations, and best practices
- Explain NEC codes, safety standards, and regulations
- Help with circuit design, power systems, motor controls, and automation
- Provide step-by-step solutions for electrical problems
- Use practical examples and real-world applications
- Be clear, concise, and educational
- Generate circuits, suggest components, diagnose issues, and calculate values

Always prioritize safety and compliance with electrical codes. When discussing calculations, show your work. If asked about dangerous procedures, emphasize proper safety precautions.

Keep responses concise but thorough. Use technical terms appropriately but explain them when needed.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: (context ? `Context: ${context}\n\n` : '') + message }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context, action, prompt, components, wires, errors } = body;

    // Handle circuit-specific actions
    if (action) {
      return handleCircuitAction(action, { prompt, components, wires, errors });
    }

    // Original chat functionality
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let data;
    let provider = 'openrouter';
    let error: any = null;

    // Try OpenRouter first
    try {
      data = await callOpenRouter(message, context);
    } catch (err: any) {
      error = err;
      
      // If OpenRouter fails with rate limit or token issues, try OpenAI
      if (err.status === 429 || err.status === 402 || err.data?.error?.code === 'insufficient_quota') {
        try {
          data = await callOpenAI(message, context);
          provider = 'openai';
          error = null;
        } catch (openaiErr: any) {
          error = openaiErr;
        }
      }
    }

    // If both failed, return error
    if (error && !data) {
      return NextResponse.json(
        { 
          error: 'Failed to get AI response from both providers',
          details: error.data || error.message || 'Unknown error'
        },
        { status: error.status || 500 }
      );
    }

    const aiMessage = data.choices?.[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      message: aiMessage,
      model: data.model,
      provider,
      usage: data.usage,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleCircuitAction(
  action: string,
  data: { prompt?: string; components?: any[]; wires?: any[]; errors?: any[] }
) {
  switch (action) {
    case 'generate-circuit':
      return generateCircuitFromText(data.prompt || '');
    
    case 'suggest-components':
      return suggestComponents(data.components || [], data.wires || []);
    
    case 'diagnose-circuit':
      return diagnoseCircuit(data.components || [], data.wires || [], data.errors || []);
    
    case 'calculate-values':
      return calculateValues(data.prompt || '', data.components || []);
    
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

async function generateCircuitFromText(prompt: string) {
  // Parse the prompt and generate a basic circuit structure
  // This is a simplified implementation - production would use more sophisticated AI
  
  const components: any[] = [];
  const connections: any[] = [];
  let explanation = '';

  // Simple pattern matching for common circuits
  if (prompt.toLowerCase().includes('555') && prompt.toLowerCase().includes('blink')) {
    // 555 timer blink circuit
    components.push(
      { type: 'battery-9v', value: 9, unit: 'V', x: 100, y: 200 },
      { type: 'ic-555', value: 1, unit: '', x: 300, y: 200 },
      { type: 'resistor', value: 10, unit: 'kΩ', x: 200, y: 100 },
      { type: 'resistor', value: 10, unit: 'kΩ', x: 400, y: 100 },
      { type: 'capacitor', value: 10, unit: 'µF', x: 500, y: 200 },
      { type: 'led', value: 1, unit: '', x: 600, y: 200 },
      { type: 'resistor', value: 330, unit: 'Ω', x: 700, y: 200 },
    );
    explanation = '555 timer configured in astable mode for LED blinking. R1 and R2 control frequency, C1 sets timing.';
  } else if (prompt.toLowerCase().includes('led') && (prompt.toLowerCase().includes('resistor') || prompt.toLowerCase().includes('battery'))) {
    // Simple LED circuit
    components.push(
      { type: 'battery-9v', value: 9, unit: 'V', x: 100, y: 200 },
      { type: 'resistor', value: 330, unit: 'Ω', x: 300, y: 200 },
      { type: 'led', value: 1, unit: '', x: 500, y: 200 },
    );
    explanation = 'Basic LED circuit with current-limiting resistor. Resistor prevents LED burnout.';
  } else if (prompt.toLowerCase().includes('arduino')) {
    // Arduino circuit
    components.push(
      { type: 'arduino-uno', value: 1, unit: '', x: 200, y: 200 },
      { type: 'led', value: 1, unit: '', x: 500, y: 200 },
      { type: 'resistor', value: 220, unit: 'Ω', x: 400, y: 200 },
    );
    explanation = 'Arduino-based circuit. Connect LED to digital pin through resistor for current limiting.';
  } else {
    // Generic response
    explanation = 'Could not parse circuit description. Try being more specific (e.g., \"LED circuit with 555 timer\" or \"Arduino with sensor\").';
  }

  // Add IDs to components
  const componentsWithIds = components.map((comp, idx) => ({ 
    ...comp, 
    id: `${comp.type}-${Date.now()}-${idx}`,
    rotation: 0,
  }));

  return NextResponse.json({ 
    success: components.length > 0,
    components: componentsWithIds,
    connections,
    explanation,
    suggestions: [
      'Add a ground connection',
      'Consider adding decoupling capacitors',
      'Use proper wire gauges for current ratings',
    ],
  });
}

async function suggestComponents(components: any[], wires: any[]) {
  const suggestions: string[] = [];
  const hasArduino = components.some(c => c.type.includes('arduino'));
  const hasLED = components.some(c => c.type === 'led');
  const hasPower = components.some(c => c.type.includes('battery') || c.type.includes('power'));

  if (hasArduino) {
    suggestions.push('💡 Add an ultrasonic sensor (HC-SR04) for distance measurement');
    suggestions.push('💡 Add an OLED display (I2C) to show data');
    suggestions.push('💡 Add a servo motor for motion control');
    suggestions.push('💡 Add a temperature sensor (DHT11/DHT22)');
    suggestions.push('💡 Add push buttons for user input');
  }

  if (hasLED && !components.some(c => c.type === 'resistor')) {
    suggestions.push('⚠️ Add current-limiting resistors (220Ω-1kΩ) for LEDs to prevent burnout');
  }

  if (!hasPower && components.length > 0) {
    suggestions.push('⚠️ Add a power source (battery or DC power supply)');
  }

  if (components.some(c => c.type.includes('ic')) || components.some(c => c.type.includes('arduino'))) {
    suggestions.push('💡 Add decoupling capacitors (0.1µF) near IC power pins');
  }

  if (wires.length > 0 && !wires.some(w => w.netLabel?.toLowerCase().includes('gnd'))) {
    suggestions.push('⚠️ Establish a common ground reference point');
  }

  if (suggestions.length === 0) {
    suggestions.push('✓ Circuit looks complete! Consider adding test points for debugging.');
  }

  return NextResponse.json({ 
    success: true,
    suggestions,
    explanation: `Analyzed ${components.length} components and ${wires.length} connections.`,
  });
}

async function diagnoseCircuit(components: any[], wires: any[], errors: any[]) {
  const issues: any[] = [];
  const fixes: any[] = [];

  // Check for basic issues
  const hasGround = wires.some(w => w.netLabel?.toLowerCase().includes('gnd'));
  const hasPower = components.some(c => c.type.includes('battery') || c.type.includes('power'));
  const leds = components.filter(c => c.type === 'led');
  const resistors = components.filter(c => c.type === 'resistor');

  if (!hasPower && components.length > 0) {
    issues.push({ 
      title: 'Missing Power Source',
      description: 'Circuit has no power supply. Add a battery or DC source.',
      severity: 'error',
      fix: 'Add a 9V battery or 5V DC power supply to the circuit',
    });
  }

  if (!hasGround && wires.length > 2) {
    issues.push({ 
      title: 'No Ground Reference',
      description: 'Circuit lacks a common ground connection.',
      severity: 'warning',
      fix: 'Add ground symbols and connect all ground points together',
    });
  }

  if (leds.length > 0 && resistors.length === 0) {
    issues.push({ 
      title: 'LEDs Without Resistors',
      description: 'LEDs connected without current-limiting resistors will burn out.',
      severity: 'error',
      fix: 'Add 220Ω-330Ω resistors in series with each LED',
    });
  }

  // Include validation errors
  errors.forEach(err => {
    issues.push({ 
      title: err.message,
      description: err.description,
      severity: err.type,
      fix: err.fix || 'Review circuit connections',
    });
  });

  if (issues.length === 0) {
    issues.push({ 
      title: 'Circuit Looks Good',
      description: 'No major issues detected. Circuit appears properly designed.',
      severity: 'success',
      fix: null,
    });
  }

  return NextResponse.json({ 
    success: true,
    issues,
    fixes,
    explanation: `Diagnosed circuit with ${components.length} components and ${wires.length} connections.`,
  });
}

async function calculateValues(prompt: string, components: any[]) {
  const values: any = {};
  let explanation = '';

  // LED resistor calculation
  if (prompt.toLowerCase().includes('led') && prompt.toLowerCase().includes('resistor')) {
    const match = prompt.match(/(\d+\.?\d*)\s*ma/i);
    const current = match ? parseFloat(match[1]) / 1000 : 0.02; // Default 20mA
    
    const voltageMatch = prompt.match(/(\d+\.?\d*)\s*v/i);
    const supplyVoltage = voltageMatch ? parseFloat(voltageMatch[1]) : 5;
    
    const ledVoltage = 2; // Typical LED forward voltage
    const resistor = (supplyVoltage - ledVoltage) / current;
    
    values.resistor = `${resistor.toFixed(0)} Ω`;
    values.current = `${(current * 1000).toFixed(1)} mA`;
    values.power = `${((supplyVoltage - ledVoltage) * current).toFixed(3)} W`;
    
    explanation = `For LED circuit:
• Supply: ${supplyVoltage}V
• LED forward voltage: ${ledVoltage}V
• Target current: ${(current * 1000).toFixed(1)}mA
• R = (Vs - Vled) / I = (${supplyVoltage} - ${ledVoltage}) / ${current} = ${resistor.toFixed(0)}Ω
• Use standard value: ${Math.ceil(resistor / 10) * 10}Ω
• Power dissipation: ${((supplyVoltage - ledVoltage) * current).toFixed(3)}W (use 1/4W resistor)`;
  }
  // RC filter calculation
  else if (prompt.toLowerCase().includes('rc') && prompt.toLowerCase().includes('filter')) {
    const freqMatch = prompt.match(/(\d+\.?\d*)\s*hz/i) || prompt.match(/(\d+\.?\d*)\s*khz/i);
    let frequency = freqMatch ? parseFloat(freqMatch[1]) : 1000;
    if (prompt.toLowerCase().includes('khz')) frequency *= 1000;
    
    const r = 10000; // 10kΩ default
    const c = 1 / (2 * Math.PI * r * frequency);
    
    values.resistor = `${(r / 1000).toFixed(1)} kΩ`;
    values.capacitor = `${(c * 1e9).toFixed(1)} nF`;
    values.cutoff_frequency = `${frequency.toFixed(0)} Hz`;
    
    explanation = `For RC Low-Pass Filter:
• Cutoff frequency: ${frequency}Hz
• R = 10kΩ (chosen)
• C = 1/(2πRf) = 1/(2π × 10000 × ${frequency}) = ${(c * 1e9).toFixed(1)}nF
• Use standard value: ${Math.ceil(c * 1e9 / 10) * 10}nF or ${(c * 1e6).toFixed(2)}µF`;
  }
  // 555 timer frequency
  else if (prompt.toLowerCase().includes('555')) {
    const r1 = 10000; // 10kΩ
    const r2 = 10000; // 10kΩ
    const c = 10e-6; // 10µF
    
    const frequency = 1.44 / ((r1 + 2 * r2) * c);
    const dutyCycle = (r1 + r2) / (r1 + 2 * r2) * 100;
    
    values.frequency = `${frequency.toFixed(2)} Hz`;
    values.duty_cycle = `${dutyCycle.toFixed(1)} %`;
    values.period = `${(1/frequency).toFixed(3)} s`;
    
    explanation = `For 555 Timer (Astable):
• R1 = ${(r1/1000).toFixed(0)}kΩ, R2 = ${(r2/1000).toFixed(0)}kΩ, C = ${(c*1e6).toFixed(0)}µF
• f = 1.44/((R1+2×R2)×C) = ${frequency.toFixed(2)}Hz
• Duty cycle = (R1+R2)/(R1+2×R2) = ${dutyCycle.toFixed(1)}%
• Period = ${(1/frequency * 1000).toFixed(1)}ms`;
  }
  // Voltage divider
  else if (prompt.toLowerCase().includes('voltage divider') || prompt.toLowerCase().includes('divider')) {
    const vinMatch = prompt.match(/(\d+\.?\d*)\s*v/i);
    const vin = vinMatch ? parseFloat(vinMatch[1]) : 5;
    const voutMatch = prompt.match(/to\s+(\d+\.?\d*)\s*v/i) || prompt.match(/get\s+(\d+\.?\d*)\s*v/i);
    const vout = voutMatch ? parseFloat(voutMatch[1]) : 3.3;
    
    const r1 = 10000; // 10kΩ
    const r2 = (vout * r1) / (vin - vout);
    
    values.r1 = `${(r1 / 1000).toFixed(1)} kΩ`;
    values.r2 = `${(r2 / 1000).toFixed(1)} kΩ`;
    values.output_voltage = `${vout.toFixed(2)} V`;
    
    explanation = `Voltage Divider:
• Input: ${vin}V, Output: ${vout}V
• R1 = ${(r1/1000).toFixed(0)}kΩ (chosen)
• R2 = (Vout × R1)/(Vin - Vout) = ${(r2/1000).toFixed(1)}kΩ
• Use standard value: ${Math.ceil(r2 / 1000)}kΩ`;
  }
  else {
    explanation = 'Calculation not recognized. Try: \"LED resistor\", \"RC filter\", \"555 timer\", or \"voltage divider\"';
  }

  return NextResponse.json({ 
    success: true,
    data: { values },
    explanation,
  });
}