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
import type { SimulationResult, SimulationSettings, SimulationNode } from './simulation-engine';
import type { CanvasComponent, CanvasWire } from './spice-netlist-generator';

/**
 * Maps @spice-ts/core DC result to EEzone SimulationResult
 */
function mapDcResult(
  result: any,
  settings: SimulationSettings,
  components?: CanvasComponent[]
): SimulationResult {
  const dc = result.dc;
  const nodes: SimulationNode[] = [];
  const componentData: Record<string, { voltage: number; current: number; power: number }> = {};
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

  // Calculate component power and current
  if (components) {
    components.forEach(comp => {
      let vDrop = 0;
      let iComp = 0;

      // Find voltage of connected nodes
      if (dc?.voltages) {
        const vNodes = Array.from(dc.voltages.entries()) as [string, number][];
        if (vNodes.length > 0) {
          vDrop = Math.abs(vNodes[0][1]);
        }
      }

      if (comp.type === 'resistor') {
        const r = comp.value || 1000;
        iComp = r > 0 ? vDrop / r : 0;
      } else if (comp.type === 'voltage_dc' || comp.type === 'battery') {
        vDrop = comp.value || 0;
        iComp = 0.01; // typical load current
      } else if (comp.type === 'led' || comp.type === 'diode') {
        vDrop = Math.min(vDrop, 2.0);
        iComp = 0.02;
      }

      componentData[comp.id] = {
        voltage: vDrop,
        current: iComp,
        power: Math.abs(vDrop * iComp)
      };
    });
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
  components?: CanvasComponent[]
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
  const componentData: Record<string, { voltage: number; current: number; power: number }> = {};

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

      // Calculate RMS and peak
      if (voltArr.length > 0) {
        const sumSq = voltArr.reduce((acc, v) => acc + v * v, 0);
        const rms = Math.sqrt(sumSq / voltArr.length);
        const peak = Math.max(...voltArr.map(Math.abs));

        // Zero crossing frequency calculation
        let zeroCrossings = 0;
        for (let i = 1; i < voltArr.length; i++) {
          if (voltArr[i - 1] * voltArr[i] < 0) zeroCrossings++;
        }
        const tDuration = (time[time.length - 1] || 0.01) - (time[0] || 0);
        const freq = tDuration > 0 ? zeroCrossings / (2 * tDuration) : 0;

        measurements.rms[name] = rms;
        measurements.peak[name] = peak;
        measurements.frequency[name] = freq;
        measurements.phase[name] = 0;
      }
    });
  }

  // Component data estimation
  if (components) {
    components.forEach(comp => {
      const firstWaveform = Object.values(waveforms)[0];
      const avgV = firstWaveform?.voltage.length
        ? firstWaveform.voltage.reduce((a, b) => a + Math.abs(b), 0) / firstWaveform.voltage.length
        : (comp.value || 0);
      const r = comp.value || 1000;
      const i = r > 0 ? avgV / r : 0.01;

      componentData[comp.id] = {
        voltage: avgV,
        current: i,
        power: Math.abs(avgV * i)
      };
    });
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
  const componentData: Record<string, { voltage: number; current: number; power: number }> = {};

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
      return mapDcResult(rawResult, settings, components);
    } else if (settings.mode === 'transient' && rawResult.transient) {
      return mapTransientResult(rawResult, settings, components);
    } else if (settings.mode === 'ac' && rawResult.ac) {
      return mapAcResult(rawResult, settings, components);
    } else if (rawResult.dc) {
      // Fallback to DC if mode requested wasn't in raw result
      return mapDcResult(rawResult, settings, components);
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
