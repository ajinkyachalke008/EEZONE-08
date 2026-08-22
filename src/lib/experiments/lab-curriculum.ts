export interface LabExperiment {
  id: string;
  code: string;
  title: string;
  category: 'Electrical Machines' | 'Power Systems' | 'Microprocessors' | 'Digital Electronics' | 'Embedded IoT' | 'Analog Circuits';
  aim: string;
  theory: string;
  apparatus: string[];
  procedure: string[];
  formulae: { label: string; formula: string }[];
  defaultObservations: { [key: string]: number | string }[];
  columns: { key: string; label: string; unit: string }[];
  toolLink: string;
}

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp-1',
    code: 'EE-301',
    title: 'Speed Control of DC Shunt Motor by Armature & Field Resistance Methods',
    category: 'Electrical Machines',
    aim: 'To determine the speed-armature current and speed-field current characteristics of a DC Shunt Motor.',
    theory: 'The speed equation of a DC motor is given by N = (V - Ia * Ra) / (k * Phi). Speed can be varied below rated speed by adding resistance in series with armature, and above rated speed by weakening field flux.',
    apparatus: ['DC Shunt Motor (220V, 5HP)', 'Field Rheostat (0-500Ω, 2A)', 'Armature Rheostat (0-10Ω, 20A)', '4-Point Starter', 'DC Ammeters & Voltmeters', 'Digital Tachometer'],
    procedure: [
      'Connect the circuit as per schematic with 4-point starter.',
      'Start motor using starter arm and bring to rated speed.',
      'Keep field current constant and vary armature rheostat to observe speed variation below base speed.',
      'Keep armature voltage constant and vary field rheostat to observe speed variation above base speed.'
    ],
    formulae: [
      { label: 'Back EMF (Eb)', formula: 'Eb = V - Ia * Ra' },
      { label: 'Speed Relation', formula: 'N proportional to Eb / Phi' }
    ],
    columns: [
      { key: 'obs', label: 'Obs #', unit: '' },
      { key: 'if', label: 'Field Current (If)', unit: 'A' },
      { key: 'ra', label: 'Armature Res (Ra)', unit: 'Ω' },
      { key: 'v', label: 'Armature Voltage (V)', unit: 'V' },
      { key: 'ia', label: 'Armature Current (Ia)', unit: 'A' },
      { key: 'speed', label: 'Motor Speed (N)', unit: 'RPM' }
    ],
    defaultObservations: [
      { obs: 1, if: 1.10, ra: 0.5, v: 220, ia: 5.2, speed: 1500 },
      { obs: 2, if: 0.95, ra: 0.5, v: 220, ia: 5.4, speed: 1650 },
      { obs: 3, if: 0.80, ra: 0.5, v: 220, ia: 5.8, speed: 1820 },
      { obs: 4, if: 1.10, ra: 2.0, v: 210, ia: 5.1, speed: 1380 },
      { obs: 5, if: 1.10, ra: 4.5, v: 195, ia: 4.9, speed: 1210 }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-2',
    code: 'EE-302',
    title: 'Open-Circuit & Short-Circuit Tests on Single-Phase Transformer',
    category: 'Electrical Machines',
    aim: 'To conduct OC and SC tests on a 1-phase transformer to pre-determine its efficiency and voltage regulation.',
    theory: 'The Open Circuit (OC) test determines core/iron losses (Pi) and no-load parameters (R0, X0). The Short Circuit (SC) test determines full-load copper loss (Psc) and equivalent winding impedance (Req, Xeq).',
    apparatus: ['Single Phase Transformer (5 kVA, 230V/115V)', 'Variac / Auto-transformer (0-270V)', 'AC Voltmeters & Ammeters', 'Low Power Factor (LPF) Wattmeter', 'Unity Power Factor (UPF) Wattmeter'],
    procedure: [
      'For OC test: Apply rated voltage on LV side keeping HV open. Record V0, I0, W0.',
      'For SC test: Short LV terminals through ammeter. Apply reduced voltage on HV until rated current flows. Record Vsc, Isc, Wsc.',
      'Compute equivalent resistance, reactance, efficiency at various loads, and % voltage regulation.'
    ],
    formulae: [
      { label: 'Core Loss (Pi)', formula: 'Pi = W0' },
      { label: 'Full-Load Copper Loss', formula: 'Pcu = Wsc * (Load_Fraction)^2' },
      { label: 'Efficiency (eta)', formula: 'eta = (V2*I2*cosPhi) / (V2*I2*cosPhi + Pi + Pcu) * 100' }
    ],
    columns: [
      { key: 'load', label: 'Load %', unit: '%' },
      { key: 'pf', label: 'Power Factor', unit: '' },
      { key: 'pout', label: 'Output Power (Pout)', unit: 'kW' },
      { key: 'loss', label: 'Total Losses', unit: 'W' },
      { key: 'eta', label: 'Efficiency (eta)', unit: '%' },
      { key: 'reg', label: 'Regulation', unit: '%' }
    ],
    defaultObservations: [
      { load: '25%', pf: 0.85, pout: 1.06, loss: 95, eta: 91.8, reg: 1.2 },
      { load: '50%', pf: 0.85, pout: 2.12, loss: 125, eta: 94.4, reg: 2.1 },
      { load: '75%', pf: 0.85, pout: 3.19, loss: 175, eta: 94.8, reg: 3.0 },
      { load: '100%', pf: 0.85, pout: 4.25, loss: 245, eta: 94.5, reg: 3.9 }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-3',
    code: 'EE-303',
    title: 'Measurement of 3-Phase Power by Two-Wattmeter Method',
    category: 'Power Systems',
    aim: 'To measure active power and power factor in a 3-phase balanced load using two wattmeters.',
    theory: 'In a 3-phase 3-wire system, total active power P = W1 + W2. The power factor is calculated from tan(phi) = sqrt(3)*(W1 - W2)/(W1 + W2).',
    apparatus: ['3-Phase 415V AC Supply', 'Two 1-Phase Wattmeters', '3-Phase Balanced R-L Load', '3-Phase Voltmeter & Ammeter'],
    procedure: [
      'Connect Current Coils (CC) of W1 and W2 in R and B lines respectively.',
      'Connect Pressure Coils (PC) common terminal to Y line.',
      'Vary the load and record W1, W2, line voltage VL, and line current IL.'
    ],
    formulae: [
      { label: 'Total Power (P)', formula: 'P = W1 + W2' },
      { label: 'Phase Angle (phi)', formula: 'phi = atan(sqrt(3)*(W1-W2)/(W1+W2))' },
      { label: 'Power Factor', formula: 'cos(phi)' }
    ],
    columns: [
      { key: 'vl', label: 'Line Voltage (VL)', unit: 'V' },
      { key: 'il', label: 'Line Current (IL)', unit: 'A' },
      { key: 'w1', label: 'Wattmeter 1 (W1)', unit: 'kW' },
      { key: 'w2', label: 'Wattmeter 2 (W2)', unit: 'kW' },
      { key: 'ptot', label: 'Total Power (P)', unit: 'kW' },
      { key: 'pf', label: 'Power Factor', unit: '' }
    ],
    defaultObservations: [
      { vl: 415, il: 5.0, w1: 2.15, w2: 1.05, ptot: 3.20, pf: 0.89 },
      { vl: 415, il: 10.0, w1: 4.30, w2: 2.10, ptot: 6.40, pf: 0.89 },
      { vl: 415, il: 15.0, w1: 6.45, w2: 3.15, ptot: 9.60, pf: 0.89 }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-4',
    code: 'EC-401',
    title: 'Verification of Truth Tables of 74xx TTL Logic Gates',
    category: 'Digital Electronics',
    aim: 'To verify the operation and truth tables of 7408 (AND), 7432 (OR), 7400 (NAND), 7402 (NOR), and 7486 (XOR) ICs.',
    theory: 'Digital logic gates are elementary building blocks of integrated digital circuits. Universal gates (NAND, NOR) can realize all boolean functions.',
    apparatus: ['Digital Logic Trainer Kit', '7408, 7432, 7400, 7402, 7486, 7404 ICs', '+5V DC Regulated Power Supply', 'Logic Indicator LEDs'],
    procedure: [
      'Insert IC into trainer socket. Connect Pin 14 to +5V and Pin 7 to GND.',
      'Connect logic input switches to gate inputs.',
      'Connect gate output to logic LED indicator and record output for all input combinations (00, 01, 10, 11).'
    ],
    formulae: [
      { label: 'AND Gate', formula: 'Y = A . B' },
      { label: 'NAND Gate', formula: 'Y = (A . B)\'' },
      { label: 'XOR Gate', formula: 'Y = A (XOR) B' }
    ],
    columns: [
      { key: 'gate', label: 'Gate Type', unit: '' },
      { key: 'a', label: 'Input A', unit: '' },
      { key: 'b', label: 'Input B', unit: '' },
      { key: 'theo', label: 'Theoretical Output', unit: '' },
      { key: 'pract', label: 'Practical Output', unit: '' },
      { key: 'status', label: 'Verification', unit: '' }
    ],
    defaultObservations: [
      { gate: 'AND (7408)', a: 0, b: 0, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'AND (7408)', a: 0, b: 1, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'AND (7408)', a: 1, b: 0, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'AND (7408)', a: 1, b: 1, theo: 1, pract: 1, status: 'VERIFIED' }
    ],
    toolLink: '/tools/digital-logic'
  }
];
