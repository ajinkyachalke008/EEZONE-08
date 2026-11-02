// SPICE Simulation Runner
// Bridges @spice-ts/core simulation engine with EEzone's UI SimulationResult interface

import {
  simulate,
  ConvergenceError,
  SingularMatrixError,
  ParseError,
  CycleError,
  InvalidCircuitError,
  SpiceError
} from '@spice-ts/core';
import type { ComponentSimulationData, SimulationResult, SimulationSettings, SimulationNode } from './simulation-engine';
import type { CanvasComponent, CanvasWire } from './spice-netlist-generator';
import { analyzeWaveform } from './waveform-analysis';

type NodeValues = Map<string, number>;
type NodeWaveforms = Map<string, number[]>;

function cleanId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function findElement(netlist: string, prefix: string, componentId: string): string[] | undefined {
  const expectedName = `${prefix}_${cleanId(componentId)}`.toUpperCase();
  const line = netlist.split(/\r?\n/).find(candidate => {
    const trimmed = candidate.trim();
    return trimmed && !trimmed.startsWith('*') && trimmed.split(/\s+/)[0].toUpperCase() === expectedName;
  });
  return line?.trim().split(/\s+/);
}

function nodeVoltage(values: NodeValues, name: string): number | undefined {
  if (name === '0' || name.toUpperCase() === 'GND') return 0;
  return values.get(name);
}

function difference(values: NodeValues, positive: string, negative: string): number | undefined {
  const vPositive = nodeVoltage(values, positive);
  const vNegative = nodeVoltage(values, negative);
  return vPositive === undefined || vNegative === undefined ? undefined : vPositive - vNegative;
}

function finalWaveformDifference(waveforms: NodeWaveforms, positive: string, negative: string): number | undefined {
  const pos = positive === '0' || positive.toUpperCase() === 'GND' ? undefined : waveforms.get(positive);
  const neg = negative === '0' || negative.toUpperCase() === 'GND' ? undefined : waveforms.get(negative);
  if ((positive !== '0' && positive.toUpperCase() !== 'GND' && !pos) ||
      (negative !== '0' && negative.toUpperCase() !== 'GND' && !neg)) return undefined;
  const length = Math.min(pos?.length ?? Infinity, neg?.length ?? Infinity);
  if (!Number.isFinite(length) || length === 0) return undefined;
  return (pos?.[length - 1] ?? 0) - (neg?.[length - 1] ?? 0);
}

function makeComponentData(
  netlist: string,
  components: CanvasComponent[] | undefined,
  getVoltage: (positive: string, negative: string) => number | undefined,
  branchCurrents?: Map<string, number>,
  branchWaveforms?: Map<string, number[]>,
  transient = false
): Record<string, ComponentSimulationData> {
  const componentData: Record<string, ComponentSimulationData> = {};
  if (!components) return componentData;

  for (const component of components) {
    let prefix: string | undefined;
    if (['resistor', 'ammeter', 'voltmeter'].includes(component.type)) prefix = 'R';
    else if (component.type === 'capacitor') prefix = 'C';
    else if (component.type === 'inductor') prefix = 'L';
    else if (['voltage_dc', 'voltage_ac', 'battery', 'signal_generator'].includes(component.type)) prefix = 'V';
    else if (component.type === 'current_source') prefix = 'I';
    else if (['diode', 'led'].includes(component.type)) prefix = 'D';
    if (!prefix) continue;

    const element = findElement(netlist, prefix, component.id);
    if (!element || element.length < 3) continue;
    const [, node1, node2] = element;
    const voltage = getVoltage(node1, node2);
    const data: ComponentSimulationData = {};
    if (voltage !== undefined && Number.isFinite(voltage)) data.voltage = voltage;

    if (['resistor', 'ammeter', 'voltmeter'].includes(component.type)) {
      const resistance = Number(element[3]);
      if (voltage !== undefined && Number.isFinite(resistance) && resistance > 0) {
        const current = voltage / resistance;
        data.current = current;
        data.power = voltage * current;
      }
    } else if (prefix === 'V' || prefix === 'L') {
      const branchName = element[0];
      const current = transient
        ? branchWaveforms?.get(branchName)?.at(-1)
        : branchCurrents?.get(branchName);
      if (current !== undefined && Number.isFinite(current)) data.current = current;
    } else if (prefix === 'I') {
      // The generated current source is constant; its netlist value is its exact current.
      const current = Number(element[3]);
      if (Number.isFinite(current)) data.current = current;
    }

    if (data.voltage !== undefined && data.current !== undefined) {
      data.power = data.voltage * data.current;
    }

    if (Object.keys(data).length > 0) componentData[component.id] = data;
  }

  return componentData;
}

function timeWeightedMetrics(time: number[], values: number[]) {
  if (time.length < 2 || values.length !== time.length) return undefined;
  let duration = 0;
  let integral = 0;
  let squareIntegral = 0;
  for (let i = 1; i < time.length; i++) {
    const dt = time[i] - time[i - 1];
    if (!Number.isFinite(dt) || dt <= 0) continue;
    const v0 = values[i - 1];
    const v1 = values[i];
    duration += dt;
    integral += dt * (v0 + v1) / 2;
    // Exact integral of the square of the linearly interpolated segment.
    squareIntegral += dt * (v0 * v0 + v0 * v1 + v1 * v1) / 3;
  }
  if (duration <= 0) return undefined;
  return { average: integral / duration, rms: Math.sqrt(squareIntegral / duration) };
}

/**
 * Maps @spice-ts/core DC result to EEzone SimulationResult
 */
function mapDcResult(
  result: any,
  settings: SimulationSettings,
  components: CanvasComponent[] | undefined,
  netlist: string
): SimulationResult {
  const dc = result.dc;
  const nodes: SimulationNode[] = [];
  const componentData: Record<string, ComponentSimulationData> = {};
  const waveforms: Record<string, { time: number[]; voltage: number[] }> = {};
  const measurements: {
    rms: Record<string, number>;
    peak: Record<string, number>;
    frequency: Record<string, number>;
    phase: Record<string, number>;
  } = { rms: {}, peak: {}, frequency: {}, phase: {} };

  if (dc?.voltages) {
    dc.voltages.forEach((volt: number, name: string) => {
      const isGround = name === '0' || name.toUpperCase() === 'GND';
      nodes.push({
        id: name,
        label: isGround ? 'GND' : name,
        voltage: volt,
        isGround
      });

      // Create a static waveform line for DC visualization spanning full timebase
      waveforms[name] = {
        time: [0, 0.0001, 0.001, 0.01, 0.1, 1.0],
        voltage: [volt, volt, volt, volt, volt, volt]
      };
      measurements.rms[name] = Math.abs(volt);
      measurements.peak[name] = Math.abs(volt);
      measurements.frequency[name] = 0;
      measurements.phase[name] = 0;
    });
  }

  if (dc?.voltages) {
    Object.assign(componentData, makeComponentData(
      netlist,
      components,
      (positive, negative) => difference(dc.voltages, positive, negative),
      dc.currents
    ));
  }

  return {
    success: true,
    mode: 'dc',
    timestamp: Date.now(),
    nodes,
    componentData,
    waveforms,
    measurements
  };
}

/**
 * Maps @spice-ts/core Transient result to EEzone SimulationResult
 */
function mapTransientResult(
  result: any,
  settings: SimulationSettings,
  components: CanvasComponent[] | undefined,
  netlist: string
): SimulationResult {
  const tran = result.transient;
  const time = tran?.time || [];
  const waveforms: Record<string, { time: number[]; voltage: number[] }> = {};
  const measurements: {
    rms: Record<string, number>;
    peak: Record<string, number>;
    frequency: Record<string, number>;
    phase: Record<string, number>;
  } = { rms: {}, peak: {}, frequency: {}, phase: {} };
  const nodes: SimulationNode[] = [];
  const componentData: Record<string, ComponentSimulationData> = {};

  if (tran?.voltages) {
    tran.voltages.forEach((voltArr: number[], name: string) => {
      const isGround = name === '0' || name.toUpperCase() === 'GND';
      const lastVolt = voltArr[voltArr.length - 1] ?? 0;
      nodes.push({
        id: name,
        label: isGround ? 'GND' : name,
        voltage: lastVolt,
        isGround
      });

      waveforms[name] = {
        time,
        voltage: voltArr
      };

      // Transient steps may be adaptive and unevenly spaced, so time-weight averages.
      if (voltArr.length > 0) {
        const peak = Math.max(...voltArr.map(Math.abs));
        const weighted = timeWeightedMetrics(time, voltArr);
        const waveformMetrics = analyzeWaveform(time, voltArr);

        if (weighted) {
          measurements.rms[name] = weighted.rms;
          measurements.peak[name] = peak;
          measurements.frequency[name] = waveformMetrics.frequency;
          measurements.phase[name] = 0;
        }
      }
    });
  }

  if (tran?.voltages) {
    Object.assign(componentData, makeComponentData(
      netlist,
      components,
      (positive, negative) => finalWaveformDifference(tran.voltages, positive, negative),
      undefined,
      tran.currents,
      true
    ));
  }

  return {
    success: true,
    mode: 'transient',
    timestamp: Date.now(),
    nodes,
    componentData,
    waveforms,
    measurements
  };
}

/**
 * Maps @spice-ts/core AC small-signal result to EEzone SimulationResult
 */
function mapAcResult(
  result: any,
  settings: SimulationSettings,
  components?: CanvasComponent[]
): SimulationResult {
  const ac = result.ac;
  const frequencies = ac?.frequencies || [];
  const waveforms: Record<string, { time: number[]; voltage: number[] }> = {};
  const measurements: {
    rms: Record<string, number>;
    peak: Record<string, number>;
    frequency: Record<string, number>;
    phase: Record<string, number>;
  } = { rms: {}, peak: {}, frequency: {}, phase: {} };
  const nodes: SimulationNode[] = [];
  const componentData: Record<string, ComponentSimulationData> = {};

  if (ac?.voltages) {
    ac.voltages.forEach((points: { magnitude: number; phase: number }[], name: string) => {
      const isGround = name === '0' || name.toUpperCase() === 'GND';
      const magnitudes = points.map(p => p.magnitude);
      const phases = points.map(p => p.phase);

      const centerIdx = Math.floor(points.length / 2);
      nodes.push({
        id: name,
        label: isGround ? 'GND' : name,
        voltage: magnitudes[0] ?? 0,
        isGround
      });

      waveforms[name] = {
        time: frequencies,
        voltage: magnitudes
      };

      measurements.rms[name] = magnitudes.length
        ? Math.sqrt(magnitudes.reduce((acc, m) => acc + m * m, 0) / magnitudes.length)
        : 0;
      measurements.peak[name] = Math.max(...magnitudes.map(Math.abs), 0);
      measurements.frequency[name] = frequencies[centerIdx] ?? 1000;
      measurements.phase[name] = phases[centerIdx] ?? 0;
    });
  }

  return {
    success: true,
    mode: 'ac',
    timestamp: Date.now(),
    nodes,
    componentData,
    waveforms,
    measurements
  };
}

/**
 * Runs a SPICE netlist through @spice-ts/core and returns standard SimulationResult
 */
export async function runSpiceSimulation(
  netlist: string,
  settings: SimulationSettings,
  components?: CanvasComponent[]
): Promise<SimulationResult> {
  try {
    const rawResult = await simulate(netlist);

    if (settings.mode === 'dc' && rawResult.dc) {
      return mapDcResult(rawResult, settings, components, netlist);
    } else if (settings.mode === 'transient' && rawResult.transient) {
      return mapTransientResult(rawResult, settings, components, netlist);
    } else if (settings.mode === 'ac' && rawResult.ac) {
      return mapAcResult(rawResult, settings, components);
    } else {
      return {
        success: false,
        mode: settings.mode,
        timestamp: Date.now(),
        nodes: [],
        componentData: {},
        error: 'Simulation completed but returned no data for requested mode.'
      };
    }
  } catch (err: any) {
    console.error('SPICE simulation error:', err);

    let friendlyError = 'Circuit simulation failed.';

    if (err instanceof ConvergenceError) {
      friendlyError = 'Simulation did not converge — check for a missing ground reference or unstable feedback loop.';
    } else if (err instanceof SingularMatrixError) {
      friendlyError = 'Singular matrix detected — circuit has a floating node, short circuit, or missing ground (GND).';
    } else if (err instanceof ParseError) {
      friendlyError = `Netlist error at line ${err.line}: ${err.message}`;
    } else if (err instanceof CycleError) {
      friendlyError = 'Circular dependency detected in subcircuit instances.';
    } else if (err instanceof InvalidCircuitError) {
      friendlyError = `Invalid circuit topology: ${err.message}`;
    } else if (err instanceof SpiceError) {
      friendlyError = `SPICE solver error: ${err.message}`;
    } else if (err?.message) {
      friendlyError = err.message;
    }

    return {
      success: false,
      mode: settings.mode,
      timestamp: Date.now(),
      nodes: [],
      componentData: {},
      error: friendlyError
    };
  }
}

