// Circuit Template System for EEzone Simulator

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'arduino' | 'digital' | 'analog' | 'power';
  difficulty: 1 | 2 | 3 | 4 | 5;
  components: {
    id: string;
    type: string;
    x: number;
    y: number;
    value?: number;
    unit?: string;
    rotation: number;
  }[];
  wires: {
    id: string;
    from: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
    to: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
    color: string;
    netLabel?: string;
  }[];
  learningObjectives: string[];
  tags: string[];
  thumbnail?: string;
}

export const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  // BEGINNER TEMPLATES
  {
    id: 'simple_led',
    name: 'Simple LED Circuit',
    description: 'Basic LED with current-limiting resistor powered by battery',
    category: 'beginner',
    difficulty: 1,
    components: [
      { id: 'bat-1', type: 'battery', x: 100, y: 150, value: 9, unit: 'V', rotation: 0 },
      { id: 'res-1', type: 'resistor', x: 250, y: 150, value: 330, unit: 'Ω', rotation: 0 },
      { id: 'led-1', type: 'led', x: 400, y: 150, value: 2, unit: 'V', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 100, y: 300, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'bat-1', terminal: 'right' }, to: { componentId: 'res-1', terminal: 'left' }, color: '#FF0000', netLabel: 'VCC' },
      { id: 'w2', from: { componentId: 'res-1', terminal: 'right' }, to: { componentId: 'led-1', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w3', from: { componentId: 'led-1', terminal: 'right' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w4', from: { componentId: 'bat-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Understand basic LED circuit',
      'Learn about current-limiting resistors',
      'Calculate resistor value using Ohm\'s law',
      'Identify LED polarity'
    ],
    tags: ['beginner', 'led', 'resistor', 'battery', 'ohms-law']
  },

  {
    id: 'voltage_divider',
    name: 'Voltage Divider',
    description: 'Two resistors creating a divided voltage output',
    category: 'beginner',
    difficulty: 2,
    components: [
      { id: 'v-1', type: 'voltage_dc', x: 100, y: 150, value: 12, unit: 'V', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 250, y: 150, value: 10000, unit: 'Ω', rotation: 0 },
      { id: 'r2', type: 'resistor', x: 250, y: 300, value: 10000, unit: 'Ω', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 100, y: 450, value: 0, unit: 'V', rotation: 0 },
      { id: 'probe-1', type: 'probe', x: 400, y: 225, value: 0, unit: '', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'top' }, color: '#FF0000', netLabel: 'VIN' },
      { id: 'w2', from: { componentId: 'r1', terminal: 'bottom' }, to: { componentId: 'r2', terminal: 'top' }, color: '#FF6B00', netLabel: 'VOUT' },
      { id: 'w3', from: { componentId: 'r2', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w4', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w5', from: { componentId: 'r1', terminal: 'bottom' }, to: { componentId: 'probe-1', terminal: 'top' }, color: '#00E5FF' }
    ],
    learningObjectives: [
      'Understand voltage division principle',
      'Calculate output voltage',
      'Measure with oscilloscope probe',
      'Apply voltage divider formula'
    ],
    tags: ['beginner', 'voltage-divider', 'resistor', 'measurement']
  },

  // ANALOG CIRCUITS
  {
    id: 'rc_lowpass',
    name: 'RC Low-Pass Filter',
    description: 'Simple passive low-pass filter using resistor and capacitor',
    category: 'analog',
    difficulty: 2,
    components: [
      { id: 'v-1', type: 'voltage_ac', x: 100, y: 200, value: 5, unit: 'V', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 250, y: 200, value: 1000, unit: 'Ω', rotation: 0 },
      { id: 'c1', type: 'capacitor', x: 400, y: 300, value: 0.1, unit: 'μF', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 100, y: 400, value: 0, unit: 'V', rotation: 0 },
      { id: 'probe-1', type: 'probe', x: 550, y: 250, value: 0, unit: '', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'left' }, color: '#FF0000', netLabel: 'VIN' },
      { id: 'w2', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'c1', terminal: 'top' }, color: '#FF6B00', netLabel: 'VOUT' },
      { id: 'w3', from: { componentId: 'c1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w4', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w5', from: { componentId: 'c1', terminal: 'top' }, to: { componentId: 'probe-1', terminal: 'top' }, color: '#00E5FF' }
    ],
    learningObjectives: [
      'Understand RC filter operation',
      'Calculate cutoff frequency',
      'Analyze frequency response',
      'Observe signal filtering in scope'
    ],
    tags: ['analog', 'filter', 'lowpass', 'rc', 'frequency']
  },

  {
    id: 'rlc_resonance',
    name: 'RLC Resonant Tank',
    description: 'Series RLC resonant circuit exhibiting Q-factor voltage magnification at f0 ≈ 5.03 kHz',
    category: 'analog',
    difficulty: 3,
    components: [
      { id: 'v-1', type: 'voltage_ac', x: 100, y: 150, value: 5, unit: 'V', rotation: 0, params: { frequency: 5033, offset: 0, waveformType: 0 } },
      { id: 'r1', type: 'resistor', x: 250, y: 150, value: 50, unit: 'Ω', rotation: 0 },
      { id: 'l1', type: 'inductor', x: 400, y: 150, value: 10, unit: 'mH', rotation: 0 },
      { id: 'c1', type: 'capacitor', x: 550, y: 250, value: 100, unit: 'nF', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 100, y: 350, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'left' }, color: '#FF0000', netLabel: 'VIN' },
      { id: 'w2', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'l1', terminal: 'left' }, color: '#FF6B00', netLabel: 'VR_OUT' },
      { id: 'w3', from: { componentId: 'l1', terminal: 'right' }, to: { componentId: 'c1', terminal: 'top' }, color: '#00E5FF', netLabel: 'VLC_TANK' },
      { id: 'w4', from: { componentId: 'c1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w5', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Understand Series RLC Resonance',
      'Observe Q-factor voltage magnification at f0',
      'Calculate resonant frequency f0 = 1 / (2*pi*sqrt(L*C))',
      'Analyze phase alignment of current and voltage'
    ],
    tags: ['analog', 'resonance', 'rlc', 'tank', 'inductor', 'capacitor', 'filter']
  },

  {
    id: '555_astable',
    name: '555 Timer (Astable Mode)',
    description: 'Flashing LED using 555 timer in astable configuration',
    category: 'analog',
    difficulty: 3,
    components: [
      { id: 'v-1', type: 'voltage_dc', x: 100, y: 100, value: 9, unit: 'V', rotation: 0 },
      { id: 'ic-1', type: '555_timer', x: 300, y: 250, value: 1, unit: 'Hz', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 200, y: 200, value: 10000, unit: 'Ω', rotation: 0 },
      { id: 'r2', type: 'resistor', x: 200, y: 300, value: 10000, unit: 'Ω', rotation: 0 },
      { id: 'c1', type: 'capacitor', x: 450, y: 350, value: 10, unit: 'μF', rotation: 0 },
      { id: 'led-1', type: 'led', x: 500, y: 250, value: 2, unit: 'V', rotation: 0 },
      { id: 'r3', type: 'resistor', x: 650, y: 250, value: 330, unit: 'Ω', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 300, y: 500, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'left' }, color: '#FF0000', netLabel: 'VCC' },
      { id: 'w2', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'r2', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w3', from: { componentId: 'r2', terminal: 'right' }, to: { componentId: 'c1', terminal: 'top' }, color: '#FF6B00' },
      { id: 'w4', from: { componentId: 'c1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w5', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w6', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'ic-1', terminal: 'left' }, color: '#9C4AFF' },
      { id: 'w7', from: { componentId: 'ic-1', terminal: 'right' }, to: { componentId: 'led-1', terminal: 'left' }, color: '#00FF88' },
      { id: 'w8', from: { componentId: 'led-1', terminal: 'right' }, to: { componentId: 'r3', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w9', from: { componentId: 'r3', terminal: 'right' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Understand 555 timer operation',
      'Configure astable multivibrator',
      'Calculate frequency and duty cycle',
      'Build LED flasher circuit'
    ],
    tags: ['analog', '555', 'timer', 'astable', 'led', 'oscillator']
  },

  // DIGITAL LOGIC
  {
    id: 'logic_and_gate',
    name: 'AND Gate Demo',
    description: 'Simple AND gate with LED output indicator',
    category: 'digital',
    difficulty: 2,
    components: [
      { id: 'v-1', type: 'voltage_dc', x: 100, y: 100, value: 5, unit: 'V', rotation: 0 },
      { id: 'and-1', type: 'logic_and', x: 300, y: 250, value: 0, unit: '', rotation: 0 },
      { id: 'led-1', type: 'led', x: 500, y: 250, value: 2, unit: 'V', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 650, y: 250, value: 330, unit: 'Ω', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 400, y: 450, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'and-1', terminal: 'left' }, color: '#FF0000', netLabel: 'IN_A' },
      { id: 'w2', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'and-1', terminal: 'top' }, color: '#FF0000', netLabel: 'IN_B' },
      { id: 'w3', from: { componentId: 'and-1', terminal: 'right' }, to: { componentId: 'led-1', terminal: 'left' }, color: '#00FF88', netLabel: 'OUT' },
      { id: 'w4', from: { componentId: 'led-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w5', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w6', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Understand AND gate logic',
      'Test truth table',
      'Visualize boolean operations',
      'Connect logic gates to LEDs'
    ],
    tags: ['digital', 'logic', 'and', 'gate', 'boolean']
  },

  {
    id: 'full_adder',
    name: 'Full Adder Circuit',
    description: '1-bit full adder using logic gates',
    category: 'digital',
    difficulty: 4,
    components: [
      { id: 'v-1', type: 'voltage_dc', x: 50, y: 50, value: 5, unit: 'V', rotation: 0 },
      { id: 'xor1', type: 'logic_xor', x: 200, y: 150, value: 0, unit: '', rotation: 0 },
      { id: 'xor2', type: 'logic_xor', x: 400, y: 200, value: 0, unit: '', rotation: 0 },
      { id: 'and1', type: 'logic_and', x: 200, y: 300, value: 0, unit: '', rotation: 0 },
      { id: 'and2', type: 'logic_and', x: 400, y: 350, value: 0, unit: '', rotation: 0 },
      { id: 'or1', type: 'logic_or', x: 600, y: 325, value: 0, unit: '', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 400, y: 500, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'xor1', terminal: 'left' }, color: '#FF0000', netLabel: 'A' },
      { id: 'w2', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'xor1', terminal: 'top' }, color: '#FF0000', netLabel: 'B' },
      { id: 'w3', from: { componentId: 'xor1', terminal: 'right' }, to: { componentId: 'xor2', terminal: 'left' }, color: '#00E5FF' },
      { id: 'w4', from: { componentId: 'xor1', terminal: 'right' }, to: { componentId: 'and2', terminal: 'left' }, color: '#00E5FF' },
      { id: 'w5', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'and1', terminal: 'left' }, color: '#FF0000' },
      { id: 'w6', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'and1', terminal: 'top' }, color: '#FF0000' },
      { id: 'w7', from: { componentId: 'and1', terminal: 'right' }, to: { componentId: 'or1', terminal: 'bottom' }, color: '#9C4AFF' },
      { id: 'w8', from: { componentId: 'and2', terminal: 'right' }, to: { componentId: 'or1', terminal: 'top' }, color: '#9C4AFF' },
      { id: 'w9', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Understand binary addition',
      'Build full adder from gates',
      'Analyze carry propagation',
      'Design combinational logic'
    ],
    tags: ['digital', 'adder', 'logic', 'arithmetic', 'advanced']
  },

  // ARDUINO CIRCUITS
  {
    id: 'arduino_blink',
    name: 'Arduino LED Blink',
    description: 'Classic Arduino blink sketch with external LED',
    category: 'arduino',
    difficulty: 1,
    components: [
      { id: 'arduino-1', type: 'arduino_uno', x: 200, y: 200, value: 0, unit: '', rotation: 0 },
      { id: 'led-1', type: 'led', x: 500, y: 250, value: 2, unit: 'V', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 650, y: 250, value: 220, unit: 'Ω', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 200, y: 450, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'arduino-1', terminal: 'right' }, to: { componentId: 'led-1', terminal: 'left' }, color: '#FF6B00', netLabel: 'D13' },
      { id: 'w2', from: { componentId: 'led-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w3', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w4', from: { componentId: 'arduino-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Setup Arduino environment',
      'Upload blink sketch',
      'Control digital output',
      'Understand digitalWrite()'
    ],
    tags: ['arduino', 'beginner', 'led', 'blink', 'microcontroller']
  },

  {
    id: 'arduino_ultrasonic',
    name: 'Arduino Ultrasonic Distance Sensor',
    description: 'Measure distance using HC-SR04 ultrasonic sensor',
    category: 'arduino',
    difficulty: 2,
    components: [
      { id: 'arduino-1', type: 'arduino_uno', x: 150, y: 200, value: 0, unit: '', rotation: 0 },
      { id: 'ultra-1', type: 'ultrasonic', x: 500, y: 200, value: 400, unit: 'cm', rotation: 0 },
      { id: 'lcd-1', type: 'lcd_display', x: 150, y: 450, value: 16, unit: 'char', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 150, y: 550, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'arduino-1', terminal: 'right' }, to: { componentId: 'ultra-1', terminal: 'left' }, color: '#FF6B00', netLabel: 'TRIG' },
      { id: 'w2', from: { componentId: 'ultra-1', terminal: 'right' }, to: { componentId: 'lcd-1', terminal: 'top' }, color: '#00E5FF', netLabel: 'DATA' },
      { id: 'w3', from: { componentId: 'arduino-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w4', from: { componentId: 'lcd-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Interface ultrasonic sensor',
      'Measure distance in code',
      'Display data on LCD',
      'Use pulseIn() function'
    ],
    tags: ['arduino', 'sensor', 'ultrasonic', 'lcd', 'distance']
  },

  {
    id: 'arduino_servo',
    name: 'Arduino Servo Control',
    description: 'Control servo motor angle with potentiometer',
    category: 'arduino',
    difficulty: 2,
    components: [
      { id: 'arduino-1', type: 'arduino_uno', x: 200, y: 200, value: 0, unit: '', rotation: 0 },
      { id: 'pot-1', type: 'potentiometer', x: 100, y: 350, value: 10000, unit: 'Ω', rotation: 0 },
      { id: 'servo-1', type: 'servo', x: 550, y: 250, value: 90, unit: '°', rotation: 0 },
      { id: 'v-1', type: 'voltage_dc', x: 550, y: 100, value: 5, unit: 'V', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 200, y: 500, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'pot-1', terminal: 'left' }, color: '#FF0000', netLabel: '5V' },
      { id: 'w2', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'servo-1', terminal: 'top' }, color: '#FF0000' },
      { id: 'w3', from: { componentId: 'pot-1', terminal: 'right' }, to: { componentId: 'arduino-1', terminal: 'left' }, color: '#FF6B00', netLabel: 'A0' },
      { id: 'w4', from: { componentId: 'arduino-1', terminal: 'right' }, to: { componentId: 'servo-1', terminal: 'left' }, color: '#00FF88', netLabel: 'PWM9' },
      { id: 'w5', from: { componentId: 'pot-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w6', from: { componentId: 'servo-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w7', from: { componentId: 'arduino-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w8', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Control servo motors',
      'Read analog input',
      'Map values between ranges',
      'Use Servo library'
    ],
    tags: ['arduino', 'servo', 'potentiometer', 'analog', 'motor']
  },

  // POWER ELECTRONICS
  {
    id: 'voltage_regulator',
    name: '5V Voltage Regulator',
    description: 'Step down 12V to regulated 5V using LM7805',
    category: 'power',
    difficulty: 3,
    components: [
      { id: 'v-1', type: 'voltage_dc', x: 100, y: 200, value: 12, unit: 'V', rotation: 0 },
      { id: 'c1', type: 'capacitor', x: 200, y: 300, value: 100, unit: 'μF', rotation: 0 },
      { id: 'reg-1', type: 'voltage_regulator', x: 350, y: 200, value: 5, unit: 'V', rotation: 0 },
      { id: 'c2', type: 'capacitor', x: 500, y: 300, value: 10, unit: 'μF', rotation: 0 },
      { id: 'led-1', type: 'led', x: 650, y: 200, value: 2, unit: 'V', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 800, y: 200, value: 330, unit: 'Ω', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 350, y: 450, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'c1', terminal: 'top' }, color: '#FF0000', netLabel: '12V_IN' },
      { id: 'w2', from: { componentId: 'c1', terminal: 'top' }, to: { componentId: 'reg-1', terminal: 'left' }, color: '#FF0000' },
      { id: 'w3', from: { componentId: 'c1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w4', from: { componentId: 'reg-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w5', from: { componentId: 'reg-1', terminal: 'right' }, to: { componentId: 'c2', terminal: 'top' }, color: '#00FF88', netLabel: '5V_OUT' },
      { id: 'w6', from: { componentId: 'c2', terminal: 'top' }, to: { componentId: 'r1', terminal: 'left' }, color: '#00FF88' },
      { id: 'w7', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'led-1', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w8', from: { componentId: 'led-1', terminal: 'right' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w9', from: { componentId: 'c2', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w10', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Understand voltage regulation',
      'Use LM7805 regulator',
      'Add input/output capacitors',
      'Calculate power dissipation'
    ],
    tags: ['power', 'regulator', 'lm7805', '5v', 'voltage']
  },

  {
    id: 'transistor_switch',
    name: 'Transistor as Switch',
    description: 'NPN transistor switching LED on/off',
    category: 'intermediate',
    difficulty: 2,
    components: [
      { id: 'v-1', type: 'voltage_dc', x: 100, y: 100, value: 9, unit: 'V', rotation: 0 },
      { id: 'r1', type: 'resistor', x: 250, y: 200, value: 10000, unit: 'Ω', rotation: 0 },
      { id: 'trans-1', type: 'transistor_npn', x: 400, y: 300, value: 0, unit: '', rotation: 0 },
      { id: 'led-1', type: 'led', x: 400, y: 150, value: 2, unit: 'V', rotation: 0 },
      { id: 'r2', type: 'resistor', x: 550, y: 150, value: 330, unit: 'Ω', rotation: 0 },
      { id: 'gnd-1', type: 'ground', x: 400, y: 500, value: 0, unit: 'V', rotation: 0 }
    ],
    wires: [
      { id: 'w1', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'r1', terminal: 'left' }, color: '#FF0000', netLabel: '9V' },
      { id: 'w2', from: { componentId: 'v-1', terminal: 'right' }, to: { componentId: 'r2', terminal: 'left' }, color: '#FF0000' },
      { id: 'w3', from: { componentId: 'r1', terminal: 'right' }, to: { componentId: 'trans-1', terminal: 'left' }, color: '#FF6B00', netLabel: 'BASE' },
      { id: 'w4', from: { componentId: 'r2', terminal: 'right' }, to: { componentId: 'led-1', terminal: 'left' }, color: '#FF6B00' },
      { id: 'w5', from: { componentId: 'led-1', terminal: 'right' }, to: { componentId: 'trans-1', terminal: 'top' }, color: '#00E5FF', netLabel: 'COLLECTOR' },
      { id: 'w6', from: { componentId: 'trans-1', terminal: 'bottom' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' },
      { id: 'w7', from: { componentId: 'v-1', terminal: 'left' }, to: { componentId: 'gnd-1', terminal: 'top' }, color: '#000000', netLabel: 'GND' }
    ],
    learningObjectives: [
      'Use transistor as switch',
      'Calculate base resistor',
      'Understand saturation mode',
      'Control high-power loads'
    ],
    tags: ['transistor', 'npn', 'switch', 'led', 'amplification']
  }
];

// Helper functions
export function getTemplatesByCategory(category: string): CircuitTemplate[] {
  return CIRCUIT_TEMPLATES.filter(t => t.category === category);
}

export function getTemplatesByDifficulty(difficulty: number): CircuitTemplate[] {
  return CIRCUIT_TEMPLATES.filter(t => t.difficulty === difficulty);
}

export function searchTemplates(query: string): CircuitTemplate[] {
  const lowerQuery = query.toLowerCase();
  return CIRCUIT_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.includes(lowerQuery))
  );
}

export function getTemplateById(id: string): CircuitTemplate | undefined {
  return CIRCUIT_TEMPLATES.find(t => t.id === id);
}
