// Virtual Laboratory Instruments Data Models & Configuration Interfaces

export type InstrumentType =
  | 'oscilloscope'
  | 'multimeter'
  | 'signal_generator'
  | 'frequency_counter'
  | 'power_meter'
  | 'logic_analyzer';

export interface ProbeConnection {
  instrumentId: string;
  terminalId: string;
  connectedNodeId: string;
  referenceNodeId?: string;
  color: string;
  label?: string;
}

export interface OscilloscopeChannelConfig {
  id: string; // 'CH1' | 'CH2' | 'CH3' | 'CH4'
  name: string;
  color: string; // Hex color code
  enabled: boolean;
  positiveNode: string;
  negativeNode: string; // Defaults to '0' / GND
  scaleVoltsPerDivision: number; // e.g. 1.0 V/div
  verticalOffset: number; // in divisions (-4 to +4)
  coupling: 'DC' | 'AC';
  invert: boolean;
}

export interface OscilloscopeTriggerConfig {
  sourceChannel: string; // 'CH1' | 'CH2'
  mode: 'AUTO' | 'NORMAL' | 'SINGLE';
  slope: 'rising' | 'falling';
  level: number; // in Volts
  positionPercent: number; // Horizontal position % (default 50%)
}

export interface OscilloscopeCursorConfig {
  enabled: boolean;
  type: 'TIME' | 'VOLTAGE' | 'BOTH';
  x1Time: number;
  x2Time: number;
  y1Volt: number;
  y2Volt: number;
}

export interface OscilloscopeConfig {
  channels: OscilloscopeChannelConfig[];
  timePerDivision: number; // in seconds (e.g. 1e-3 for 1ms/div)
  horizontalOffset: number; // in seconds
  trigger: OscilloscopeTriggerConfig;
  cursors: OscilloscopeCursorConfig;
  isRun: boolean; // RUN vs STOP freeze
}

export interface MultimeterConfig {
  mode: 'DCV' | 'ACV' | 'DCA' | 'ACA' | 'RES' | 'CONT' | 'DIODE' | 'PWR';
  positiveProbeNode: string;
  negativeProbeNode: string;
  range: 'AUTO' | 'mV' | 'V' | 'mA' | 'A' | 'Ohm' | 'kOhm';
  isHold: boolean;
  relativeOffset: number;
}

export interface SignalGeneratorConfig {
  enabled: boolean;
  waveform: 'SINE' | 'SQUARE' | 'TRIANGLE' | 'SAWTOOTH' | 'DC';
  frequency: number; // in Hz (e.g. 1000)
  amplitude: number; // in Vpp or Vpeak (e.g. 5.0)
  offset: number; // in Volts (e.g. 0.0)
  dutyCycle: number; // in % (e.g. 50)
  outputNode: string;
  referenceNode: string;
}

export interface VirtualInstrumentState {
  id: string;
  type: InstrumentType;
  enabled: boolean;
  position: { x: number; y: number };
  config: OscilloscopeConfig | MultimeterConfig | SignalGeneratorConfig;
}
