export interface TestPoint {
  id: string;
  name: string;
  nominalVoltage: string;
  nominalResistanceToGnd: string;
  faultVoltage: string;
  faultResistanceToGnd: string;
  waveformDesc: string;
}

export interface FaultExamScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  circuitDescription: string;
  symptom: string;
  components: { id: string; name: string; type: string; nominalValue: string }[];
  testPoints: TestPoint[];
  hiddenDefect: {
    componentId: string;
    faultType: 'OPEN' | 'SHORT' | 'LEAKY' | 'DEGRADED';
    explanation: string;
  };
}

export const FAULT_EXAM_SCENARIOS: FaultExamScenario[] = [
  {
    id: 'exam-1',
    title: '5V Regulated Power Supply - Zero Output Voltage Fault',
    difficulty: 'Intermediate',
    circuitDescription: 'A standard AC-DC linear power supply consisting of Step-down Transformer (230V to 12V RMS), 1N4007 Bridge Rectifier, 1000uF Electrolytic Filter Capacitor, LM7805 3-Terminal Positive Voltage Regulator, and 1kΩ Load Resistor.',
    symptom: 'The circuit is connected to 230V AC mains, but the output terminal reads 0.0V DC. The transformer runs slightly warm.',
    components: [
      { id: 'T1', name: 'Step-Down Transformer', type: 'Transformer', nominalValue: '230V:12V 500mA' },
      { id: 'BR1', name: 'Bridge Rectifier (1N4007 x4)', type: 'Diode Bridge', nominalValue: '1000V 1A' },
      { id: 'C1', name: 'Electrolytic Filter Capacitor', type: 'Capacitor', nominalValue: '1000uF 25V' },
      { id: 'U1', name: 'LM7805 Linear Regulator', type: 'IC Voltage Regulator', nominalValue: '+5.0V 1A' },
      { id: 'R1', name: 'Bleeder / Load Resistor', type: 'Resistor', nominalValue: '1kΩ 0.5W' }
    ],
    testPoints: [
      {
        id: 'TP1',
        name: 'TP1 (Transformer Secondary AC)',
        nominalVoltage: '12.0 V RMS (AC)',
        nominalResistanceToGnd: '15 Ω',
        faultVoltage: '12.1 V RMS (AC)',
        faultResistanceToGnd: '15 Ω',
        waveformDesc: 'Clean 50Hz 17V peak sinusoidal AC waveform.'
      },
      {
        id: 'TP2',
        name: 'TP2 (Bridge Rectifier Output)',
        nominalVoltage: '+15.5 V DC',
        nominalResistanceToGnd: '> 10 kΩ',
        faultVoltage: '0.12 V DC (Near Zero)',
        faultResistanceToGnd: '0.2 Ω (Dead Short to Ground)',
        waveformDesc: 'Flat DC line at 0V with 50Hz ripple spikes.'
      },
      {
        id: 'TP3',
        name: 'TP3 (LM7805 Input Pin)',
        nominalVoltage: '+15.5 V DC',
        nominalResistanceToGnd: '> 10 kΩ',
        faultVoltage: '0.12 V DC',
        faultResistanceToGnd: '0.2 Ω',
        waveformDesc: '0V DC line.'
      },
      {
        id: 'TP4',
        name: 'TP4 (LM7805 Output Pin)',
        nominalVoltage: '+5.00 V DC',
        nominalResistanceToGnd: '1000 Ω',
        faultVoltage: '0.00 V DC',
        faultResistanceToGnd: '1000 Ω',
        waveformDesc: '0V Flat Line.'
      }
    ],
    hiddenDefect: {
      componentId: 'C1',
      faultType: 'SHORT',
      explanation: 'Filter Capacitor C1 has experienced dielectric breakdown and is internally SHORTED to ground (0.2Ω). This drags the rectified DC voltage to 0V and starves the LM7805 regulator of input voltage.'
    }
  },
  {
    id: 'exam-2',
    title: 'Common-Emitter BJT Audio Amplifier - Low Gain & Distortion',
    difficulty: 'Advanced',
    circuitDescription: 'A single-stage NPN transistor voltage amplifier (2N2222) with voltage divider biasing (R1=47kΩ, R2=10kΩ), Collector resistor RC=2.2kΩ, Emitter resistor RE=470Ω, and Emitter bypass capacitor CE=100uF.',
    symptom: 'The amplifier produces very low audio volume (gain drops from 45x to only 4.5x) with noticeable clipping.',
    components: [
      { id: 'Q1', name: '2N2222 NPN Transistor', type: 'BJT', nominalValue: 'hFE = 150' },
      { id: 'R1', name: 'Upper Bias Resistor', type: 'Resistor', nominalValue: '47kΩ' },
      { id: 'R2', name: 'Lower Bias Resistor', type: 'Resistor', nominalValue: '10kΩ' },
      { id: 'RC', name: 'Collector Load Resistor', type: 'Resistor', nominalValue: '2.2kΩ' },
      { id: 'RE', name: 'Emitter Bias Resistor', type: 'Resistor', nominalValue: '470Ω' },
      { id: 'CE', name: 'Emitter Bypass Capacitor', type: 'Capacitor', nominalValue: '100uF 16V' }
    ],
    testPoints: [
      {
        id: 'TP1',
        name: 'TP1 (Base DC Bias Voltage)',
        nominalVoltage: '+1.75 V DC',
        nominalResistanceToGnd: '8.2 kΩ',
        faultVoltage: '+1.75 V DC',
        faultResistanceToGnd: '8.2 kΩ',
        waveformDesc: '1kHz 10mV AC input sine wave riding on 1.75V DC offset.'
      },
      {
        id: 'TP2',
        name: 'TP2 (Emitter DC & AC Voltage)',
        nominalVoltage: '+1.10 V DC (0V AC)',
        nominalResistanceToGnd: '470 Ω',
        faultVoltage: '+1.10 V DC (10mV AC Ripple)',
        faultResistanceToGnd: '470 Ω',
        waveformDesc: 'Noticeable 1kHz AC feedback signal present on Emitter pin!'
      },
      {
        id: 'TP3',
        name: 'TP3 (Collector AC Output)',
        nominalVoltage: '+6.20 V DC (450mV AC)',
        nominalResistanceToGnd: '2.2 kΩ',
        faultVoltage: '+6.20 V DC (45mV AC)',
        faultResistanceToGnd: '2.2 kΩ',
        waveformDesc: 'Output signal is only 45mV AC (Gain = 4.5x instead of 45x).'
      }
    ],
    hiddenDefect: {
      componentId: 'CE',
      faultType: 'OPEN',
      explanation: 'Emitter Bypass Capacitor CE is OPEN (dry electrolyte). Without CE bypassing AC signals to ground, AC negative feedback across RE reduces stage gain from (RC / re) = 45 to (RC / RE) = 4.7.'
    }
  }
];
