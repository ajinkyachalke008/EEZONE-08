// SPICE Netlist Generator for EEzone Simulator
// Converts canvas state (components + wires) into standard SPICE netlists

import { COMPONENT_LIBRARY } from './circuit-components';
import { buildNetlist } from './circuit-validator';
import type { SimulationSettings } from './simulation-engine';

export interface CanvasComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: number;
  unit?: string;
  rotation: number;
  locked?: boolean;
  label?: string;
  params?: Record<string, number>;
}

export interface CanvasWire {
  id: string;
  from: { componentId: string; terminal: string };
  to: { componentId: string; terminal: string };
  color: string;
  netLabel?: string;
  path?: { x: number; y: number }[];
}

export const SPICE_ELIGIBLE_CATEGORIES = [
  'power',
  'passive',
  'semiconductor',
  'analog',
  'measurement'
];

const SPICE_MODELED_TYPES = new Set([
  'resistor', 'capacitor', 'inductor', 'voltage_dc', 'battery', 'current_source',
  'ground', 'diode', 'led', 'zener_diode', 'voltage_ac', 'signal_generator',
  'transistor_npn', 'transistor_pnp', 'mosfet_n', 'mosfet_p', 'potentiometer',
  'op_amp', 'comparator', 'voltage_regulator', 'ammeter', 'voltmeter',
  // A probe labels/measures a net but is not an electrical load in SPICE.
  'probe'
]);

const APPROXIMATE_SPICE_TYPES = new Set([
  'led', 'zener_diode', 'transistor_npn', 'transistor_pnp', 'mosfet_n', 'mosfet_p',
  'op_amp', 'comparator', 'voltage_regulator', 'ammeter', 'voltmeter'
]);

const DESIGN_ONLY_DETAILS: Record<string, string> = {
  logic_and: 'Digital logic state and propagation are not simulated.',
  logic_or: 'Digital logic state and propagation are not simulated.',
  logic_not: 'Digital logic state and propagation are not simulated.',
  logic_nand: 'Digital logic state and propagation are not simulated.',
  logic_nor: 'Digital logic state and propagation are not simulated.',
  logic_xor: 'Digital logic state and propagation are not simulated.',
  shift_register: 'Clocked register behavior is not simulated.',
  counter: 'Clocked counter behavior is not simulated.',
  arduino_uno: 'Firmware and board pin behavior are not simulated.',
  arduino_nano: 'Firmware and board pin behavior are not simulated.',
  esp32: 'Firmware, radio, and board pin behavior are not simulated.',
  esp8266: 'Firmware, radio, and board pin behavior are not simulated.',
  raspberry_pi_pico: 'Firmware and board pin behavior are not simulated.',
  ultrasonic: 'Distance-to-voltage sensor behavior is not simulated.',
  temp_sensor: 'Temperature-to-voltage sensor behavior is not simulated.',
  pir_sensor: 'Motion-triggered output behavior is not simulated.',
  servo: 'Servo mechanics and control response are not simulated.',
  stepper: 'Stepper coils, commutation, and motion are not simulated.',
  lcd_display: 'Display bus and pixel behavior are not simulated.',
  oled_display: 'Display bus and pixel behavior are not simulated.',
  seven_segment: 'Segment logic and display behavior are not simulated.',
  buzzer: 'Acoustic and piezo behavior are not simulated.',
  relay: 'Relay coil and switched contacts are not modeled.',
  transformer: 'The SPICE runtime does not support coupled inductors, so turns ratio and reflected load cannot be simulated.',
  '555_timer': 'The available symbol has no validated timer macromodel.'
};

export function getComponentSimulationSupport(type: string): {
  kind: 'spice' | 'design-only';
  accuracy: 'modeled' | 'approximate' | 'marker' | 'none';
  detail: string;
} {
  if (!SPICE_MODELED_TYPES.has(type)) {
    return { kind: 'design-only', accuracy: 'none', detail: DESIGN_ONLY_DETAILS[type] ?? 'No electrical simulation model is available.' };
  }
  if (type === 'probe') return { kind: 'spice', accuracy: 'marker', detail: 'Measurement marker; it does not load the circuit.' };
  if (type === 'ammeter') return { kind: 'spice', accuracy: 'approximate', detail: 'Modeled with a 1 mΩ series shunt (1 mV burden per amp).' };
  if (type === 'voltmeter') return { kind: 'spice', accuracy: 'approximate', detail: 'Modeled with a 10 MΩ input resistance, so it slightly loads the circuit.' };
  if (type === 'transformer') return { kind: 'design-only', accuracy: 'none', detail: DESIGN_ONLY_DETAILS.transformer };
  if (APPROXIMATE_SPICE_TYPES.has(type)) {
    return { kind: 'spice', accuracy: 'approximate', detail: 'Uses a simplified generic SPICE model; real part limits and parasitics are not represented.' };
  }
  return { kind: 'spice', accuracy: 'modeled', detail: 'Simulated with the component’s SPICE primitive.' };
}

export function getUnsupportedSimulationComponents(components: CanvasComponent[]): CanvasComponent[] {
  return components.filter(component => getComponentSimulationSupport(component.type).kind !== 'spice');
}

/**
 * Checks if a component can be simulated with SPICE
 */
export function getCategoryForType(type: string): string {
  if (type === 'signal_generator') return 'power';
  const def = COMPONENT_LIBRARY.find(c => c.type === type);
  return def ? def.category : 'unsupported';
}

/**
 * Returns true if all components in the circuit are SPICE eligible
 */
export function isSpiceEligible(components: CanvasComponent[]): boolean {
  if (components.length === 0) return false;
  return components.every(c => getComponentSimulationSupport(c.type).kind === 'spice' && SPICE_ELIGIBLE_CATEGORIES.includes(getCategoryForType(c.type)));
}

/**
 * Formats component values with correct SPICE SI multipliers
 */
export function formatSpiceValue(value: number, unit?: string): number {
  if (value === undefined || isNaN(value)) return 0;
  if (!unit) return value;
  const u = unit.trim();
  if (u === 'μF' || u === 'uF') return value * 1e-6;
  if (u === 'nF') return value * 1e-9;
  if (u === 'pF') return value * 1e-12;
  if (u === 'mF') return value * 1e-3;
  if (u === 'mH') return value * 1e-3;
  if (u === 'μH' || u === 'uH') return value * 1e-6;
  if (u === 'nH') return value * 1e-9;
  if (u === 'kΩ' || u === 'k') return value * 1e3;
  if (u === 'MΩ' || u === 'Meg') return value * 1e6;
  if (u === 'mV') return value * 1e-3;
  if (u === 'kV') return value * 1e3;
  if (u === 'mA') return value * 1e-3;
  if (u === 'μA' || u === 'uA') return value * 1e-6;
  return value;
}

/**
 * Cleans a component ID into a valid SPICE alphanumeric identifier
 */
function cleanId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Builds node resolution functions from the validated netlist
 */
function createNodeResolver(components: CanvasComponent[], wires: CanvasWire[]) {
  const nets = buildNetlist(components as any, wires as any);
  const terminalToNode = new Map<string, string>();
  let nextNodeNumber = 1;

  nets.forEach(net => {
    let nodeName = '0';
    if (!net.isGround && net.label.toUpperCase() !== 'GND') {
      const sanitized = net.label.replace(/[^a-zA-Z0-9_]/g, '_');
      if (sanitized && sanitized.toUpperCase() !== 'GND') {
        nodeName = sanitized;
      } else {
        nodeName = `N${nextNodeNumber++}`;
      }
    }
    net.components.forEach(nc => {
      terminalToNode.set(`${nc.componentId}:${nc.terminal}`, nodeName);
    });
  });

  return {
    getNodeForTerminal: (componentId: string, terminal: string): string | undefined => {
      return terminalToNode.get(`${componentId}:${terminal}`);
    },
    getResolvedNodes: (comp: CanvasComponent): { n1: string; n2: string; n3?: string } => {
      const tTop = terminalToNode.get(`${comp.id}:top`);
      const tBottom = terminalToNode.get(`${comp.id}:bottom`);
      const tLeft = terminalToNode.get(`${comp.id}:left`);
      const tRight = terminalToNode.get(`${comp.id}:right`);

      const connected = [
        { t: 'right', n: tRight },
        { t: 'left', n: tLeft },
        { t: 'top', n: tTop },
        { t: 'bottom', n: tBottom }
      ].filter((x): x is { t: string; n: string } => x.n !== undefined);

      let n1: string;
      let n2: string;
      let n3: string | undefined;

      if (comp.type === 'voltage_dc' || comp.type === 'voltage_ac' || comp.type === 'battery') {
        // Positive (+) is right or top; Negative (-) is left or bottom
        n1 = tRight ?? tTop ?? connected[0]?.n ?? `NC_${cleanId(comp.id)}_pos`;
        n2 = tLeft ?? tBottom ?? (connected.find(c => c.n !== n1)?.n ?? `NC_${cleanId(comp.id)}_neg`);
      } else if (comp.type === 'diode' || comp.type === 'led' || comp.type === 'zener_diode') {
        // Anode is left or top; Cathode is right or bottom
        n1 = tLeft ?? tTop ?? connected[0]?.n ?? `NC_${cleanId(comp.id)}_a`;
        n2 = tRight ?? tBottom ?? (connected.find(c => c.n !== n1)?.n ?? `NC_${cleanId(comp.id)}_k`);
      } else if (comp.type.includes('transistor') || comp.type.includes('mosfet')) {
        // Collector/Drain = top, Base/Gate = left, Emitter/Source = bottom
        n1 = tTop ?? connected[0]?.n ?? `NC_${cleanId(comp.id)}_1`;
        n2 = tLeft ?? (connected.find(c => c.n !== n1)?.n ?? `NC_${cleanId(comp.id)}_2`);
        n3 = tBottom ?? (connected.find(c => c.n !== n1 && c.n !== n2)?.n ?? '0');
      } else if (['current_source', 'ammeter', 'voltmeter'].includes(comp.type)) {
        n1 = tLeft ?? tTop ?? connected[0]?.n ?? `NC_${cleanId(comp.id)}_pos`;
        n2 = tRight ?? tBottom ?? (connected.find(c => c.n !== n1)?.n ?? `NC_${cleanId(comp.id)}_neg`);
      } else if (comp.type === 'potentiometer') {
        n1 = tLeft ?? connected[0]?.n ?? `NC_${cleanId(comp.id)}_1`;
        n2 = tRight ?? (connected.find(c => c.n !== n1)?.n ?? `NC_${cleanId(comp.id)}_2`);
        n3 = tTop ?? tBottom ?? (connected.find(c => c.n !== n1 && c.n !== n2)?.n ?? `NC_${cleanId(comp.id)}_w`);
      } else if (comp.type === 'op_amp' || comp.type === 'comparator') {
        n1 = tLeft ?? connected[0]?.n ?? `NC_${cleanId(comp.id)}_in_pos`;
        n2 = tBottom ?? (connected.find(c => c.n !== n1)?.n ?? `NC_${cleanId(comp.id)}_in_neg`);
        n3 = tRight ?? (connected.find(c => c.n !== n1 && c.n !== n2)?.n ?? `NC_${cleanId(comp.id)}_out`);
      } else {
        // Passives: Resistors, Capacitors, Inductors
        if (connected.length >= 2) {
          n1 = connected[0].n;
          n2 = connected[1].n;
        } else if (connected.length === 1) {
          n1 = connected[0].n;
          n2 = `NC_${cleanId(comp.id)}_2`;
        } else {
          n1 = `NC_${cleanId(comp.id)}_1`;
          n2 = `NC_${cleanId(comp.id)}_2`;
        }
      }

      return { n1, n2, n3 };
    },
    terminalToNode
  };
}

/**
 * Generates the SPICE analysis command based on SimulationSettings
 */
export function analysisCommandFor(settings: SimulationSettings): string {
  switch (settings.mode) {
    case 'dc':
      return '.op';
    case 'ac': {
      const points = settings.acPointsPerDecade ?? 10;
      const start = settings.acStartFreq ?? 1;
      const stop = settings.acStopFreq ?? 1e6;
      return `.ac dec ${points} ${start} ${stop}`;
    }
    case 'transient': {
      const step = settings.transientTimeStep ?? 1e-5;
      const stop = settings.transientStopTime ?? 0.01;
      const start = settings.transientStartTime ?? 0;
      return `.tran ${step} ${stop} ${start}`;
    }
    default:
      return '.op';
  }
}

/**
 * Converts canvas components and wires into a complete ngspice-compatible netlist string
 */
export function generateSpiceNetlist(
  components: CanvasComponent[],
  wires: CanvasWire[],
  settings: SimulationSettings
): string {
  const unsupported = getUnsupportedSimulationComponents(components);
  if (unsupported.length > 0) {
    const types = [...new Set(unsupported.map(component => component.type))].join(', ');
    throw new Error(`No supported SPICE model for: ${types}.`);
  }
  const { getNodeForTerminal, getResolvedNodes } = createNodeResolver(components, wires);
  const lines: string[] = ['* EE Zone Circuit SPICE Netlist'];
  const models = new Set<string>();
  const subcircuits = new Set<string>();

  for (const comp of components) {
    const id = cleanId(comp.id);
    const rawVal = comp.value ?? 0;
    const val = formatSpiceValue(rawVal, comp.unit);
    const { n1, n2, n3 } = getResolvedNodes(comp);

    switch (comp.type) {
      case 'resistor': {
        const safeR = Math.max(val, 1e-6);
        lines.push(`R_${id} ${n1} ${n2} ${safeR}`);
        break;
      }

      case 'capacitor': {
        const safeC = Math.max(val, 1e-15);
        lines.push(`C_${id} ${n1} ${n2} ${safeC}`);
        break;
      }

      case 'inductor': {
        const safeL = Math.max(val, 1e-12);
        lines.push(`L_${id} ${n1} ${n2} ${safeL}`);
        break;
      }

      case 'voltage_dc':
      case 'battery': {
        // Positive terminal = n1, Negative terminal = n2
        lines.push(`V_${id} ${n1} ${n2} DC ${val}`);
        break;
      }

      case 'voltage_ac':
      case 'signal_generator': {
        const freq = comp.params?.frequency ?? 1000;
        const amp = val > 0 ? val : 5.0;
        const offset = comp.params?.offset ?? 0;
        const wfType = comp.params?.waveformType ?? 0; // 0=SINE, 1=SQUARE, 2=TRIANGLE, 3=SAW, 4=DC
        const per = 1 / Math.max(freq, 1);

        if (settings.mode === 'ac') {
          lines.push(`V_${id} ${n1} ${n2} AC ${amp} 0`);
        } else if (wfType === 1 || comp.params?.waveform === 1) {
          // SQUARE / PULSE
          const duty = (comp.params?.dutyCycle ?? 50) / 100;
          const pw = per * duty;
          const tr = Math.min(per * 0.01, 1e-6);
          lines.push(`V_${id} ${n1} ${n2} PULSE(${offset} ${offset + amp} 0 ${tr} ${tr} ${pw} ${per})`);
        } else if (wfType === 2) {
          const ramp = per / 2;
          lines.push(`V_${id} ${n1} ${n2} PULSE(${offset} ${offset + amp} 0 ${ramp} ${ramp} 0 ${per})`);
        } else if (wfType === 3) {
          const rise = Math.min(per * 1e-4, 1e-9);
          const fall = Math.max(per - rise, 1e-12);
          lines.push(`V_${id} ${n1} ${n2} PULSE(${offset} ${offset + amp} 0 ${rise} ${fall} 0 ${per})`);
        } else if (wfType === 4) {
          lines.push(`V_${id} ${n1} ${n2} DC ${offset || amp}`);
        } else {
          // SINE default for transient: SIN(VO VA FREQ)
          lines.push(`V_${id} ${n1} ${n2} SIN(${offset} ${amp} ${freq})`);
        }
        break;
      }

      case 'current_source': {
        lines.push(`I_${id} ${n1} ${n2} ${val}`);
        break;
      }

      case 'ground': {
        // Ground is handled through node 0 mapping
        break;
      }

      case 'probe': {
        // Measurement markers do not contribute an electrical element.
        break;
      }

      case 'diode': {
        const vf = Math.min(Math.max(rawVal || 0.7, 0.1), 1.5);
        const saturationCurrent = 0.001 / (Math.exp(vf / 0.02585) - 1);
        const modelName = `DMOD_${id}`;
        lines.push(`D_${id} ${n1} ${n2} ${modelName}`);
        models.add(`.model ${modelName} D(IS=${saturationCurrent.toExponential(8)} N=1)`);
        break;
      }

      case 'led': {
        const vf = Math.min(Math.max(rawVal || 2, 0.5), 4);
        const ideality = 1.8;
        const targetCurrent = comp.params?.forwardCurrent ?? 0.02;
        const saturationCurrent = targetCurrent / (Math.exp(vf / (ideality * 0.02585)) - 1);
        const modelName = `LEDMOD_${id}`;
        lines.push(`D_${id} ${n1} ${n2} ${modelName}`);
        models.add(`.model ${modelName} D(IS=${saturationCurrent.toExponential(8)} N=${ideality})`);
        break;
      }

      case 'zener_diode': {
        // Two-diode subcircuit for accurate reverse Zener breakdown
        const vz = rawVal > 0 ? rawVal : 5.1;
        const subcktName = `ZENER_${id}`;
        lines.push(`X_${id} ${n1} ${n2} ${subcktName}`);
        subcircuits.add(
`.subckt ${subcktName} 1 2
* 1=Anode, 2=Cathode
Dfwd 1 2 DMOD_${id}
Drev 3 1 DMOD_${id}
Vz 2 3 DC ${Math.max(vz - 0.7, 0.1)}
.model DMOD_${id} D(IS=1e-14 N=1)
.ends ${subcktName}`
        );
        break;
      }

      case 'transistor_npn': {
        // Collector (top), Base (left), Emitter (bottom)
        const tCollector = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tBase = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tEmitter = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `NPNMOD_${id}`;
        lines.push(`Q_${id} ${tCollector} ${tBase} ${tEmitter} ${modelName}`);
        const beta = Math.min(Math.max(comp.params?.beta ?? 100, 1), 1000);
        models.add(`.model ${modelName} NPN(BF=${beta})`);
        break;
      }

      case 'transistor_pnp': {
        // Collector (top), Base (left), Emitter (bottom)
        const tCollector = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tBase = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tEmitter = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `PNPMOD_${id}`;
        lines.push(`Q_${id} ${tCollector} ${tBase} ${tEmitter} ${modelName}`);
        const beta = Math.min(Math.max(comp.params?.beta ?? 100, 1), 1000);
        models.add(`.model ${modelName} PNP(BF=${beta})`);
        break;
      }

      case 'mosfet_n': {
        // Drain (top), Gate (left), Source (bottom)
        const tDrain = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tGate = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tSource = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `NMOSMOD_${id}`;
        lines.push(`M_${id} ${tDrain} ${tGate} ${tSource} ${tSource} ${modelName}`);
        const threshold = Math.max(comp.params?.thresholdVoltage ?? 1, 0.1);
        const transconductance = Math.max(comp.params?.transconductance ?? 0.1, 1e-5);
        models.add(`.model ${modelName} NMOS(VTO=${threshold} KP=${transconductance})`);
        break;
      }

      case 'mosfet_p': {
        // Drain (top), Gate (left), Source (bottom)
        const tDrain = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tGate = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tSource = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `PMOSMOD_${id}`;
        lines.push(`M_${id} ${tDrain} ${tGate} ${tSource} ${tSource} ${modelName}`);
        const threshold = -Math.max(comp.params?.thresholdVoltage ?? 1, 0.1);
        const transconductance = Math.max(comp.params?.transconductance ?? 0.1, 1e-5);
        models.add(`.model ${modelName} PMOS(VTO=${threshold} KP=${transconductance})`);
        break;
      }

      case 'potentiometer': {
        const ratio = Math.min(Math.max(comp.params?.wiperRatio ?? 0.5, 0.01), 0.99);
        const tWiper = getNodeForTerminal(comp.id, 'top') ?? getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? `NC_${id}_w`;
        const rTotal = Math.max(val, 10);
        const rA = Math.max(rTotal * ratio, 1e-3);
        const rB = Math.max(rTotal * (1 - ratio), 1e-3);
        lines.push(`R_${id}_a ${n1} ${tWiper} ${rA}`);
        lines.push(`R_${id}_b ${tWiper} ${n2} ${rB}`);
        break;
      }

      case 'op_amp': {
        // Non-inverting in+ (top/left), Inverting in- (bottom/left), Output (right)
        const tInPos = getNodeForTerminal(comp.id, 'left') ?? n1;
        const tInNeg = getNodeForTerminal(comp.id, 'bottom') ?? n2;
        const tOut = getNodeForTerminal(comp.id, 'right') ?? n3 ?? `NC_${id}_out`;
        const subcktName = `OPAMP_${id}`;
        const gain = Math.max(comp.params?.gain ?? 100000, 1);
        lines.push(`X_${id} ${tInPos} ${tInNeg} ${tOut} ${subcktName}`);
        subcircuits.add(
`.subckt ${subcktName} 1 2 3
* 1: in+, 2: in-, 3: out
E1 3 0 1 2 ${gain}
Rin 1 2 10Meg
Rout 3 0 50
.ends ${subcktName}`
        );
        break;
      }

      case 'comparator': {
        const tInPos = getNodeForTerminal(comp.id, 'left') ?? n1;
        const tInNeg = getNodeForTerminal(comp.id, 'bottom') ?? n2;
        const tOut = getNodeForTerminal(comp.id, 'right') ?? n3 ?? `NC_${id}_out`;
        const gain = Math.max(comp.params?.gain ?? 1000000, 1);
        lines.push(`E_${id} ${tOut} 0 ${tInPos} ${tInNeg} ${gain}`);
        break;
      }

      case 'ammeter': {
        const burden = Math.max(comp.params?.burdenResistance ?? 0.001, 1e-6);
        lines.push(`R_${id} ${n1} ${n2} ${burden}`);
        break;
      }

      case 'voltmeter': {
        const inputResistance = Math.max(comp.params?.inputResistance ?? 10000000, 1e3);
        lines.push(`R_${id} ${n1} ${n2} ${inputResistance}`);
        break;
      }

      case 'voltage_regulator': {
        // LM7805: fixed 5V regulator (IN: left, GND: bottom, OUT: right)
        const tIn = getNodeForTerminal(comp.id, 'left') ?? n1;
        const tGnd = getNodeForTerminal(comp.id, 'bottom') ?? '0';
        const tOut = getNodeForTerminal(comp.id, 'right') ?? n2;
        const vOut = rawVal > 0 ? rawVal : 5;
        lines.push(`Vreg_${id} ${tOut} ${tGnd} DC ${vOut}`);
        lines.push(`Rreg_${id} ${tIn} ${tOut} 100k`);
        break;
      }

      case '555_timer': {
        // Standard NE555 macro model
        const subcktName = `NE555_${id}`;
        lines.push(`X_${id} ${n1} ${n2} ${subcktName}`);
        subcircuits.add(
`.subckt ${subcktName} 1 2
* Simplified NE555 astable/monostable model
R1 1 3 5k
R2 3 4 5k
R3 4 2 5k
.ends ${subcktName}`
        );
        break;
      }

      default:
        throw new Error(`No SPICE model is defined for component type "${comp.type}" (${comp.id}).`);
    }
  }

  // Append subcircuit definitions
  if (subcircuits.size > 0) {
    lines.push('');
    subcircuits.forEach(sc => lines.push(sc));
  }

  // Append model cards
  if (models.size > 0) {
    lines.push('');
    models.forEach(m => lines.push(m));
  }

  // Append analysis command and end
  lines.push('');
  lines.push(analysisCommandFor(settings));
  lines.push('.end');

  return lines.join('\n');
}

/**
 * Utility to download the generated netlist as a .cir/.sp file
 */
export function downloadNetlist(netlist: string, filename = 'eezone-circuit.cir'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([netlist], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

