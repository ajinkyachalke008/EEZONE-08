// Comprehensive Circuit Component Library for EEzone Simulator

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: 'power' | 'passive' | 'semiconductor' | 'digital' | 'microcontroller' | 'module' | 'analog' | 'measurement';
  defaultValue: number;
  unit: string;
  description: string;
  pins: number;
  tags: string[];
}

export const COMPONENT_CATEGORIES = {
  power: { name: 'Power Sources', icon: '⚡', color: '#FF6B00' },
  passive: { name: 'Passive Components', icon: '📊', color: '#00E5FF' },
  semiconductor: { name: 'Semiconductors', icon: '💡', color: '#9C4AFF' },
  digital: { name: 'Digital Logic', icon: '🔢', color: '#FF00C8' },
  microcontroller: { name: 'Microcontrollers', icon: '🖥️', color: '#00FF88' },
  module: { name: 'Modules & Sensors', icon: '📡', color: '#FFD700' },
  analog: { name: 'Analog ICs', icon: '🎛️', color: '#FF6B00' },
  measurement: { name: 'Measurement', icon: '📏', color: '#00E5FF' }
};

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // POWER SOURCES
  {
    type: 'voltage_dc',
    label: 'DC Voltage Source',
    icon: '⚡',
    category: 'power',
    defaultValue: 12,
    unit: 'V',
    description: 'Constant DC voltage source',
    pins: 2,
    tags: ['power', 'dc', 'source']
  },
  {
    type: 'voltage_ac',
    label: 'AC Voltage Source',
    icon: '〰️',
    category: 'power',
    defaultValue: 120,
    unit: 'V',
    description: 'Alternating current voltage source',
    pins: 2,
    tags: ['power', 'ac', 'source']
  },
  {
    type: 'current_source',
    label: 'Current Source',
    icon: '🔌',
    category: 'power',
    defaultValue: 1,
    unit: 'A',
    description: 'Constant current source',
    pins: 2,
    tags: ['power', 'current', 'source']
  },
  {
    type: 'battery',
    label: 'Battery',
    icon: '🔋',
    category: 'power',
    defaultValue: 9,
    unit: 'V',
    description: 'Battery cell or pack',
    pins: 2,
    tags: ['power', 'battery', 'portable']
  },
  {
    type: 'ground',
    label: 'Ground',
    icon: '⏚',
    category: 'power',
    defaultValue: 0,
    unit: 'V',
    description: 'Circuit ground reference',
    pins: 1,
    tags: ['power', 'ground', 'reference']
  },

  // PASSIVE COMPONENTS
  {
    type: 'resistor',
    label: 'Resistor',
    icon: '📊',
    category: 'passive',
    defaultValue: 1000,
    unit: 'Ω',
    description: 'Fixed value resistor',
    pins: 2,
    tags: ['passive', 'resistor']
  },
  {
    type: 'potentiometer',
    label: 'Potentiometer',
    icon: '🎚️',
    category: 'passive',
    defaultValue: 10000,
    unit: 'Ω',
    description: 'Variable resistor',
    pins: 3,
    tags: ['passive', 'variable', 'pot']
  },
  {
    type: 'capacitor',
    label: 'Capacitor',
    icon: '🔋',
    category: 'passive',
    defaultValue: 100,
    unit: 'μF',
    description: 'Fixed value capacitor',
    pins: 2,
    tags: ['passive', 'capacitor']
  },
  {
    type: 'inductor',
    label: 'Inductor',
    icon: '🧲',
    category: 'passive',
    defaultValue: 10,
    unit: 'mH',
    description: 'Fixed value inductor',
    pins: 2,
    tags: ['passive', 'inductor', 'coil']
  },
  {
    type: 'transformer',
    label: 'Transformer',
    icon: '⚡',
    category: 'passive',
    defaultValue: 120,
    unit: 'V',
    description: 'AC transformer',
    pins: 4,
    tags: ['passive', 'transformer', 'ac']
  },

  // SEMICONDUCTORS
  {
    type: 'led',
    label: 'LED',
    icon: '💡',
    category: 'semiconductor',
    defaultValue: 2,
    unit: 'V',
    description: 'Light emitting diode',
    pins: 2,
    tags: ['semiconductor', 'led', 'light']
  },
  {
    type: 'diode',
    label: 'Diode',
    icon: '⚙️',
    category: 'semiconductor',
    defaultValue: 0.7,
    unit: 'V',
    description: 'Standard silicon diode',
    pins: 2,
    tags: ['semiconductor', 'diode']
  },
  {
    type: 'zener_diode',
    label: 'Zener Diode',
    icon: '⚡',
    category: 'semiconductor',
    defaultValue: 5.1,
    unit: 'V',
    description: 'Voltage regulator diode',
    pins: 2,
    tags: ['semiconductor', 'zener', 'regulator']
  },
  {
    type: 'transistor_npn',
    label: 'NPN Transistor',
    icon: '🔺',
    category: 'semiconductor',
    defaultValue: 0,
    unit: '',
    description: 'NPN bipolar junction transistor',
    pins: 3,
    tags: ['semiconductor', 'transistor', 'npn', 'bjt']
  },
  {
    type: 'transistor_pnp',
    label: 'PNP Transistor',
    icon: '🔻',
    category: 'semiconductor',
    defaultValue: 0,
    unit: '',
    description: 'PNP bipolar junction transistor',
    pins: 3,
    tags: ['semiconductor', 'transistor', 'pnp', 'bjt']
  },
  {
    type: 'mosfet_n',
    label: 'N-Channel MOSFET',
    icon: '🔲',
    category: 'semiconductor',
    defaultValue: 0,
    unit: '',
    description: 'N-channel metal-oxide-semiconductor FET',
    pins: 3,
    tags: ['semiconductor', 'mosfet', 'n-channel']
  },
  {
    type: 'mosfet_p',
    label: 'P-Channel MOSFET',
    icon: '🔳',
    category: 'semiconductor',
    defaultValue: 0,
    unit: '',
    description: 'P-channel metal-oxide-semiconductor FET',
    pins: 3,
    tags: ['semiconductor', 'mosfet', 'p-channel']
  },

  // DIGITAL LOGIC
  {
    type: 'logic_and',
    label: 'AND Gate',
    icon: '&',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: '2-input AND logic gate',
    pins: 3,
    tags: ['digital', 'logic', 'and', 'gate']
  },
  {
    type: 'logic_or',
    label: 'OR Gate',
    icon: '≥1',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: '2-input OR logic gate',
    pins: 3,
    tags: ['digital', 'logic', 'or', 'gate']
  },
  {
    type: 'logic_not',
    label: 'NOT Gate',
    icon: '¬',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: 'NOT logic gate (inverter)',
    pins: 2,
    tags: ['digital', 'logic', 'not', 'inverter']
  },
  {
    type: 'logic_nand',
    label: 'NAND Gate',
    icon: '⊼',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: '2-input NAND logic gate',
    pins: 3,
    tags: ['digital', 'logic', 'nand', 'gate']
  },
  {
    type: 'logic_nor',
    label: 'NOR Gate',
    icon: '⊽',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: '2-input NOR logic gate',
    pins: 3,
    tags: ['digital', 'logic', 'nor', 'gate']
  },
  {
    type: 'logic_xor',
    label: 'XOR Gate',
    icon: '⊕',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: '2-input XOR logic gate',
    pins: 3,
    tags: ['digital', 'logic', 'xor', 'gate']
  },
  {
    type: 'shift_register',
    label: 'Shift Register',
    icon: '↔️',
    category: 'digital',
    defaultValue: 8,
    unit: 'bit',
    description: '8-bit shift register',
    pins: 8,
    tags: ['digital', 'shift', 'register']
  },
  {
    type: 'counter',
    label: 'Counter IC',
    icon: '🔢',
    category: 'digital',
    defaultValue: 0,
    unit: '',
    description: 'Binary counter',
    pins: 8,
    tags: ['digital', 'counter']
  },

  // MICROCONTROLLERS
  {
    type: 'arduino_uno',
    label: 'Arduino Uno',
    icon: '🖥️',
    category: 'microcontroller',
    defaultValue: 0,
    unit: '',
    description: 'Arduino Uno R3 board',
    pins: 20,
    tags: ['microcontroller', 'arduino', 'uno', 'atmega328']
  },
  {
    type: 'arduino_nano',
    label: 'Arduino Nano',
    icon: '📟',
    category: 'microcontroller',
    defaultValue: 0,
    unit: '',
    description: 'Arduino Nano board',
    pins: 20,
    tags: ['microcontroller', 'arduino', 'nano']
  },
  {
    type: 'esp32',
    label: 'ESP32',
    icon: '📡',
    category: 'microcontroller',
    defaultValue: 0,
    unit: '',
    description: 'ESP32 WiFi/Bluetooth MCU',
    pins: 30,
    tags: ['microcontroller', 'esp32', 'wifi', 'bluetooth']
  },
  {
    type: 'esp8266',
    label: 'ESP8266',
    icon: '📶',
    category: 'microcontroller',
    defaultValue: 0,
    unit: '',
    description: 'ESP8266 WiFi MCU',
    pins: 17,
    tags: ['microcontroller', 'esp8266', 'wifi']
  },
  {
    type: 'raspberry_pi_pico',
    label: 'Raspberry Pi Pico',
    icon: '🥧',
    category: 'microcontroller',
    defaultValue: 0,
    unit: '',
    description: 'Raspberry Pi Pico (RP2040)',
    pins: 26,
    tags: ['microcontroller', 'raspberry', 'pico', 'rp2040']
  },

  // MODULES & SENSORS
  {
    type: 'ultrasonic',
    label: 'Ultrasonic Sensor',
    icon: '📡',
    category: 'module',
    defaultValue: 400,
    unit: 'cm',
    description: 'HC-SR04 ultrasonic distance sensor',
    pins: 4,
    tags: ['module', 'sensor', 'ultrasonic', 'distance']
  },
  {
    type: 'temp_sensor',
    label: 'Temperature Sensor',
    icon: '🌡️',
    category: 'module',
    defaultValue: 25,
    unit: '°C',
    description: 'DHT11/DHT22 temperature sensor',
    pins: 3,
    tags: ['module', 'sensor', 'temperature']
  },
  {
    type: 'pir_sensor',
    label: 'PIR Motion Sensor',
    icon: '👁️',
    category: 'module',
    defaultValue: 0,
    unit: '',
    description: 'Passive infrared motion sensor',
    pins: 3,
    tags: ['module', 'sensor', 'pir', 'motion']
  },
  {
    type: 'servo',
    label: 'Servo Motor',
    icon: '⚙️',
    category: 'module',
    defaultValue: 90,
    unit: '°',
    description: 'SG90 servo motor',
    pins: 3,
    tags: ['module', 'motor', 'servo']
  },
  {
    type: 'stepper',
    label: 'Stepper Motor',
    icon: '🔄',
    category: 'module',
    defaultValue: 200,
    unit: 'steps',
    description: '28BYJ-48 stepper motor',
    pins: 4,
    tags: ['module', 'motor', 'stepper']
  },
  {
    type: 'lcd_display',
    label: 'LCD Display',
    icon: '📺',
    category: 'module',
    defaultValue: 16,
    unit: 'char',
    description: '16x2 LCD character display',
    pins: 16,
    tags: ['module', 'display', 'lcd']
  },
  {
    type: 'oled_display',
    label: 'OLED Display',
    icon: '🖥️',
    category: 'module',
    defaultValue: 128,
    unit: 'px',
    description: '128x64 OLED display (I2C)',
    pins: 4,
    tags: ['module', 'display', 'oled', 'i2c']
  },
  {
    type: 'seven_segment',
    label: '7-Segment Display',
    icon: '8️⃣',
    category: 'module',
    defaultValue: 0,
    unit: '',
    description: 'Single digit 7-segment display',
    pins: 10,
    tags: ['module', 'display', 'seven-segment']
  },
  {
    type: 'buzzer',
    label: 'Buzzer',
    icon: '🔊',
    category: 'module',
    defaultValue: 0,
    unit: '',
    description: 'Piezo buzzer',
    pins: 2,
    tags: ['module', 'sound', 'buzzer']
  },
  {
    type: 'relay',
    label: 'Relay',
    icon: '🔌',
    category: 'module',
    defaultValue: 5,
    unit: 'V',
    description: 'Electromechanical relay',
    pins: 5,
    tags: ['module', 'relay', 'switch']
  },

  // ANALOG ICs
  {
    type: 'op_amp',
    label: 'Op-Amp (LM741)',
    icon: '△',
    category: 'analog',
    defaultValue: 0,
    unit: '',
    description: 'LM741 operational amplifier',
    pins: 8,
    tags: ['analog', 'opamp', 'amplifier', 'lm741']
  },
  {
    type: 'comparator',
    label: 'Comparator',
    icon: '⋚',
    category: 'analog',
    defaultValue: 0,
    unit: '',
    description: 'Voltage comparator',
    pins: 8,
    tags: ['analog', 'comparator']
  },
  {
    type: '555_timer',
    label: '555 Timer',
    icon: '⏱️',
    category: 'analog',
    defaultValue: 1,
    unit: 'Hz',
    description: 'NE555 timer IC',
    pins: 8,
    tags: ['analog', '555', 'timer']
  },
  {
    type: 'voltage_regulator',
    label: 'Voltage Regulator',
    icon: '⚡',
    category: 'analog',
    defaultValue: 5,
    unit: 'V',
    description: 'LM7805 voltage regulator',
    pins: 3,
    tags: ['analog', 'regulator', 'lm7805']
  },

  // MEASUREMENT
  {
    type: 'ammeter',
    label: 'Ammeter',
    icon: '🔌',
    category: 'measurement',
    defaultValue: 0,
    unit: 'A',
    description: 'Current measurement',
    pins: 2,
    tags: ['measurement', 'current', 'ammeter']
  },
  {
    type: 'voltmeter',
    label: 'Voltmeter',
    icon: '⚡',
    category: 'measurement',
    defaultValue: 0,
    unit: 'V',
    description: 'Voltage measurement',
    pins: 2,
    tags: ['measurement', 'voltage', 'voltmeter']
  },
  {
    type: 'probe',
    label: 'Oscilloscope Probe',
    icon: '📊',
    category: 'measurement',
    defaultValue: 0,
    unit: '',
    description: 'Waveform measurement probe',
    pins: 1,
    tags: ['measurement', 'probe', 'oscilloscope']
  }
];

// Helper functions
export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return COMPONENT_LIBRARY.filter(comp => comp.category === category);
}

export function searchComponents(query: string): ComponentDefinition[] {
  const lowerQuery = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(comp =>
    comp.label.toLowerCase().includes(lowerQuery) ||
    comp.description.toLowerCase().includes(lowerQuery) ||
    comp.tags.some(tag => tag.includes(lowerQuery))
  );
}

export function getComponentByType(type: string): ComponentDefinition | undefined {
  return COMPONENT_LIBRARY.find(comp => comp.type === type);
}
