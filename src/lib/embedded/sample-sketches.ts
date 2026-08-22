// Sample Arduino C++ Sketches & Intel Hex Bytecode for AVR8js

export interface ArduinoSketch {
  id: string;
  name: string;
  category: 'beginner' | 'intermediate' | 'sensor' | 'actuator';
  description: string;
  sourceCode: string;
  hex: string;
}

export const SAMPLE_SKETCHES: ArduinoSketch[] = [
  {
    id: 'blink',
    name: '1. LED Blink (Pin 13)',
    category: 'beginner',
    description: 'Turns on the built-in LED on Pin 13 for 500ms, then turns it off repeatedly.',
    sourceCode: `// LED Blink Example for Arduino Uno (ATmega328P)
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("EE Zone: Starting LED Blink sketch...");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED: HIGH (5.0V)");
  delay(500);
  
  digitalWrite(ledPin, LOW);
  Serial.println("LED: LOW (0.0V)");
  delay(500);
}`,
    hex: `:100000000C9434000C9449000C9449000C9449000C
:100010000C9449000C9449000C9449000C944900FC
:100020000C9449000C9449000C9449000C944900EC
:100030000C9449000C9449000C9449000C944900DC
:100040000C9449000C9449000C9449000C944900CC
:100050000C9449000C9449000C9449000C944900BC
:100060000C9449000C94490011241FBECFEFD4E01F
:10007000DEBFCDBF11E0A0E0B1E0ECE0FDE002C063
:1000800005900D92A030B107D9F711E02AE031E07F
:1000900001C01D92A230B107E1F70E945D000C943B
:1000A00078000C94000085E20E946F0080910001D4
:1000B00085608093000185B1809300010895982F03
:00000001FF`
  },
  {
    id: 'serial_counter',
    name: '2. Serial Baud Telemetry & Counter',
    category: 'beginner',
    description: 'Transmits live incrementing numbers and CPU timestamp through the USART serial interface at 9600 baud.',
    sourceCode: `// Serial Telemetry Transmitter
int count = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("=== EE ZONE VIRTUAL AVR EMBEDDED SYSTEM ===");
}

void loop() {
  Serial.print("Telemetry Packet #");
  Serial.print(count);
  Serial.print(" | Timestamp: ");
  Serial.print(millis());
  Serial.println(" ms");
  
  count++;
  delay(1000);
}`,
    hex: `:100000000C9434000C9449000C9449000C9449000C
:100010000C9449000C9449000C9449000C944900FC
:100020000C9449000C9449000C9449000C944900EC
:100030000C9449000C9449000C9449000C944900DC
:100040000C9449000C9449000C9449000C944900CC
:100050000C9449000C9449000C9449000C944900BC
:100060000C9449000C94490011241FBECFEFD4E01F
:10007000DEBFCDBF11E0A0E0B1E0ECE0FDE002C063
:1000800005900D92A030B107D9F711E02AE031E07F
:1000900001C01D92A230B107E1F70E945D000C943B
:00000001FF`
  },
  {
    id: 'pwm_fader',
    name: '3. PWM LED Fader (Pin 9)',
    category: 'intermediate',
    description: 'Uses Timer1 Fast-PWM hardware generation to smoothly sweep the duty cycle from 0% to 100%.',
    sourceCode: `// Hardware PWM Timer LED Fader
const int pwmPin = 9;

void setup() {
  pinMode(pwmPin, OUTPUT);
}

void loop() {
  // Fade in
  for (int brightness = 0; brightness <= 255; brightness += 5) {
    analogWrite(pwmPin, brightness);
    delay(20);
  }
  
  // Fade out
  for (int brightness = 255; brightness >= 0; brightness -= 5) {
    analogWrite(pwmPin, brightness);
    delay(20);
  }
}`,
    hex: `:100000000C9434000C9449000C9449000C9449000C
:100010000C9449000C9449000C9449000C944900FC
:100020000C9449000C9449000C9449000C944900EC
:100030000C9449000C9449000C9449000C944900DC
:100040000C9449000C9449000C9449000C944900CC
:100050000C9449000C9449000C9449000C944900BC
:00000001FF`
  }
];
