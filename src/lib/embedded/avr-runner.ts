// AVR8js ATmega328P Real-time Simulation Engine & Telemetry Bridge
import {
  CPU,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  PinState,
  AVRTimer,
  timer0Config,
  timer1Config,
  timer2Config,
  AVRUSART,
  usart0Config
} from 'avr8js';

export interface AVRTelemetry {
  cycles: number;
  micros: number;
  pins: { [pinName: string]: boolean };
  analogVoltages: { [pinName: string]: number };
  serialOutput: string;
}

export class AVRRunner {
  readonly program: Uint16Array;
  readonly cpu: CPU;
  readonly portB: AVRIOPort;
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;
  readonly timer0: AVRTimer;
  readonly timer1: AVRTimer;
  readonly timer2: AVRTimer;
  readonly usart: AVRUSART;

  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private onTelemetryCallback?: (telemetry: AVRTelemetry) => void;
  private onSerialCharCallback?: (char: string) => void;
  private serialBuffer: string = '';

  // Pin state tracking
  private pinStates: { [pinName: string]: boolean } = {
    '13': false, // Port B5 (Built-in LED)
    '12': false,
    '11': false,
    '10': false,
    '9': false,
    '8': false,
    '7': false,
    '6': false,
    '5': false,
    '4': false,
    '3': false,
    '2': false,
    'A0': false,
    'A1': false,
    'A2': false,
    'A3': false,
    'A4': false,
    'A5': false
  };

  constructor(hex: string) {
    // 32KB flash for ATmega328P = 16384 16-bit words
    this.program = new Uint16Array(16384);
    this.loadHex(hex);

    this.cpu = new CPU(this.program);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.usart = new AVRUSART(this.cpu, usart0Config, 16_000_000);

    this.setupListeners();
  }

  private loadHex(hex: string) {
    const lines = hex.split('\n');
    for (const line of lines) {
      if (line.startsWith(':')) {
        const bytes = parseInt(line.substring(1, 3), 16);
        const addr = parseInt(line.substring(3, 7), 16);
        const type = parseInt(line.substring(7, 9), 16);
        if (type === 0) { // Data record
          for (let i = 0; i < bytes; i += 2) {
            const low = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
            const high = i + 1 < bytes ? parseInt(line.substring(11 + i * 2, 13 + i * 2), 16) : 0;
            const word = low | (high << 8);
            this.program[(addr + i) >> 1] = word;
          }
        }
      }
    }
  }

  private setupListeners() {
    // Port B (Digital pins 8-13)
    this.portB.addListener(() => {
      this.pinStates['8'] = this.portB.pinState(0) === PinState.High;
      this.pinStates['9'] = this.portB.pinState(1) === PinState.High;
      this.pinStates['10'] = this.portB.pinState(2) === PinState.High;
      this.pinStates['11'] = this.portB.pinState(3) === PinState.High;
      this.pinStates['12'] = this.portB.pinState(4) === PinState.High;
      this.pinStates['13'] = this.portB.pinState(5) === PinState.High; // LED
    });

    // Port D (Digital pins 0-7)
    this.portD.addListener(() => {
      for (let i = 0; i <= 7; i++) {
        this.pinStates[i.toString()] = this.portD.pinState(i) === PinState.High;
      }
    });

    // USART Serial output
    this.usart.onByteTransmit = (byte: number) => {
      const char = String.fromCharCode(byte);
      this.serialBuffer += char;
      if (this.onSerialCharCallback) {
        this.onSerialCharCallback(char);
      }
    };
  }

  public setAnalogInput(pin: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5', voltage: number) {
    // Voltage 0.0 to 5.0V converted to 10-bit ADC 0-1023
    const pinIndex = parseInt(pin.substring(1), 10);
    const adcVal = Math.min(1023, Math.max(0, Math.round((voltage / 5.0) * 1023)));
    // Feed to ADC if needed
  }

  public start(onTelemetry?: (telemetry: AVRTelemetry) => void, onSerial?: (char: string) => void) {
    this.isRunning = true;
    this.onTelemetryCallback = onTelemetry;
    this.onSerialCharCallback = onSerial;

    const clockSpeed = 16_000_000; // 16 MHz
    const cyclesPerFrame = clockSpeed / 60; // 60 FPS target

    const loop = () => {
      if (!this.isRunning) return;

      const targetCycles = this.cpu.cycles + cyclesPerFrame;
      while (this.cpu.cycles < targetCycles) {
        this.cpu.step();
        this.timer0.tick();
        this.timer1.tick();
        this.timer2.tick();
        this.usart.tick();
      }

      if (this.onTelemetryCallback) {
        const analogVoltages: { [key: string]: number } = {};
        for (const [p, active] of Object.entries(this.pinStates)) {
          analogVoltages[p] = active ? 5.0 : 0.0;
        }
        this.onTelemetryCallback({
          cycles: this.cpu.cycles,
          micros: Math.round(this.cpu.cycles / 16),
          pins: { ...this.pinStates },
          analogVoltages,
          serialOutput: this.serialBuffer
        });
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public reset() {
    this.stop();
    this.cpu.reset();
    this.serialBuffer = '';
  }
}
