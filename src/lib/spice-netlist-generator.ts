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
  from: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
  to: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
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

/**
 * Checks if a component can be simulated with SPICE
 */
export function getCategoryForType(type: string): string {
  const def = COMPONENT_LIBRARY.find(c => c.type === type);
  return def ? def.category : 'passive';
}

/**
 * Returns true if all components in the circuit are SPICE eligible
 */
export function isSpiceEligible(components: CanvasComponent[]): boolean {
  if (components.length === 0) return false;
  return components.every(c => SPICE_ELIGIBLE_CATEGORIES.includes(getCategoryForType(c.type)));
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
    getNodeForTerminal: (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right'): string | undefined => {
      return terminalToNode.get(`${componentId}:${terminal}`);
    },
    getResolvedNodes: (comp: CanvasComponent): { n1: string; n2: string; n3?: string; n4?: string } => {
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
      let n4: string | undefined;

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

      return { n1, n2, n3, n4 };
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
        lines.push(`V_${id} ${n1} ${n2} DC ${rawVal}`);
        break;
      }

      case 'voltage_ac':
      case 'signal_generator': {
        const freq = comp.params?.frequency ?? 1000;
        const amp = rawVal > 0 ? rawVal : 5.0;
        const offset = comp.params?.offset ?? 0;
        const wfType = comp.params?.waveformType ?? 0; // 0=SINE, 1=SQUARE, 2=TRIANGLE, 3=DC

        if (wfType === 1 || comp.params?.waveform === 1) {
          // SQUARE / PULSE
          const per = 1 / Math.max(freq, 1);
          const duty = (comp.params?.dutyCycle ?? 50) / 100;
          const pw = per * duty;
          const tr = Math.min(per * 0.01, 1e-6);
          lines.push(`V_${id} ${n1} ${n2} PULSE(${offset} ${offset + amp} 0 ${tr} ${tr} ${pw} ${per})`);
        } else if (wfType === 3) {
          // DC
          lines.push(`V_${id} ${n1} ${n2} DC ${offset || amp}`);
        } else if (settings.mode === 'ac') {
          lines.push(`V_${id} ${n1} ${n2} AC ${amp} 0`);
        } else {
          // SINE default for transient: SIN(VO VA FREQ)
          lines.push(`V_${id} ${n1} ${n2} SIN(${offset} ${amp} ${freq})`);
        }
        break;
      }

      case 'current_source': {
        lines.push(`I_${id} ${n1} ${n2} ${rawVal}`);
        break;
      }

      case 'ground': {
        // Ground is handled through node 0 mapping
        break;
      }

      case 'diode': {
        const modelName = `DMOD_${id}`;
        lines.push(`D_${id} ${n1} ${n2} ${modelName}`);
        models.add(`.model ${modelName} D(IS=1e-14 N=1)`);
        break;
      }

      case 'led': {
        const modelName = `LEDMOD_${id}`;
        lines.push(`D_${id} ${n1} ${n2} ${modelName}`);
        models.add(`.model ${modelName} D(IS=1e-20 N=1.8)`);
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
        models.add(`.model ${modelName} NPN(BF=100)`);
        break;
      }

      case 'transistor_pnp': {
        // Collector (top), Base (left), Emitter (bottom)
        const tCollector = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tBase = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tEmitter = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `PNPMOD_${id}`;
        lines.push(`Q_${id} ${tCollector} ${tBase} ${tEmitter} ${modelName}`);
        models.add(`.model ${modelName} PNP(BF=100)`);
        break;
      }

      case 'mosfet_n': {
        // Drain (top), Gate (left), Source (bottom)
        const tDrain = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tGate = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tSource = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `NMOSMOD_${id}`;
        lines.push(`M_${id} ${tDrain} ${tGate} ${tSource} ${tSource} ${modelName}`);
        models.add(`.model ${modelName} NMOS(VTO=1.0 KP=0.1)`);
        break;
      }

      case 'mosfet_p': {
        // Drain (top), Gate (left), Source (bottom)
        const tDrain = getNodeForTerminal(comp.id, 'top') ?? n1;
        const tGate = getNodeForTerminal(comp.id, 'left') ?? n2;
        const tSource = getNodeForTerminal(comp.id, 'bottom') ?? n3 ?? '0';
        const modelName = `PMOSMOD_${id}`;
        lines.push(`M_${id} ${tDrain} ${tGate} ${tSource} ${tSource} ${modelName}`);
        models.add(`.model ${modelName} PMOS(VTO=-1.0 KP=0.1)`);
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
        lines.push(`X_${id} ${tInPos} ${tInNeg} ${tOut} ${subcktName}`);
        subcircuits.add(
`.subckt ${subcktName} 1 2 3
* 1: in+, 2: in-, 3: out
E1 3 0 1 2 1e5
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
        lines.push(`E_${id} ${tOut} 0 ${tInPos} ${tInNeg} 1e6`);
        break;
      }

      case 'transformer': {
        // Primary (left, right), Secondary (top, bottom)
        const ratio = rawVal > 0 ? rawVal / 120 : 1;
        lines.push(`E_${id} ${n1} ${n2} ${n3 ?? '0'} 0 ${ratio}`);
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
        // Passives or unknown components default to resistor
        if (val > 0) {
          lines.push(`R_${id} ${n1} ${n2} ${val}`);
        }
        break;
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
