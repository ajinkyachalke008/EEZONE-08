// Real Measurement Bus Architecture for Virtual Electronics Laboratory
// Central measurement abstraction reading strictly from real SPICE solved electrical data

import type { SimulationResult, SimulationNode } from './simulation-engine';
import { analyzeWaveform, type WaveformMetrics } from './waveform-analysis';

export type CircuitNodeId = string;
export type BranchId = string;

export interface MeasurementValue {
  value: number;
  formatted: string;
  unit: string;
  valid: boolean;
  stale: boolean;
  status: 'VALID' | 'OPEN' | 'OL' | 'NO_DATA' | 'STALE' | 'ERR';
  positiveNode?: string;
  negativeNode?: string;
  branch?: string;
  description?: string;
}

export interface WaveformData {
  time: number[];
  values: number[];
  unit: string;
  label: string;
  valid: boolean;
  stale: boolean;
  positiveNode?: string;
  negativeNode?: string;
  source: {
    type: 'node-voltage' | 'differential-voltage' | 'branch-current';
    target: string;
  };
  metrics: WaveformMetrics;
}

export interface PowerMeasurement {
  realPower: number;
  apparentPower: number;
  voltageRms: number;
  currentRms: number;
  valid: boolean;
  stale: boolean;
  formatted: string;
}

export class MeasurementBus {
  private result: SimulationResult | null = null;
  private runId: string = '';
  private timestamp: number = 0;
  private isStale: boolean = false;
  private components: { id: string; type: string; value?: number; unit?: string }[] = [];

  constructor(
    result?: SimulationResult | null,
    runId: string = '',
    components: { id: string; type: string; value?: number; unit?: string }[] = []
  ) {
    if (result) {
      this.updateSimulation(result, runId, components);
    }
  }

  public updateSimulation(
    result: SimulationResult | null,
    runId: string,
    components: { id: string; type: string; value?: number; unit?: string }[] = []
  ): void {
    this.result = result;
    this.runId = runId;
    this.timestamp = Date.now();
    this.isStale = false;
    this.components = components;
  }

  public markStale(): void {
    this.isStale = true;
  }

  public getRunId(): string {
    return this.runId;
  }

  public isAvailable(): boolean {
    return !!this.result && this.result.success;
  }

  public getAvailableNodes(): { id: string; label: string; isGround: boolean }[] {
    if (!this.result?.nodes || this.result.nodes.length === 0) return [];
    return this.result.nodes.map(n => ({
      id: n.id,
      label: n.label || n.id,
      isGround: n.isGround || n.id === '0' || n.id.toUpperCase() === 'GND'
    }));
  }

  /** Prefer an explicitly named output for automatic instrument probes. */
  public getPreferredOutputNode(): string | undefined {
    const nodes = this.getAvailableNodes().filter(node => !node.isGround);
    const outputName = /(?:^|[^a-z0-9])(?:vout|output|out)(?:$|[^a-z0-9])/i;
    return nodes.find(node => outputName.test(node.id) || outputName.test(node.label))?.id ?? nodes[0]?.id;
  }

  /** Find the next non-ground node for a second automatic scope channel. */
  public getOtherNode(nodeId?: string): string | undefined {
    return this.getAvailableNodes().find(node => !node.isGround && node.id !== nodeId)?.id;
  }

  /**
   * Reads single-ended ground referenced voltage V(node)
   */
  public readVoltage(node: CircuitNodeId): MeasurementValue {
    return this.readDifferentialVoltage(node, '0');
  }

  /**
   * Reads real differential voltage: V(pos) - V(neg)
   */
  public readDifferentialVoltage(positive: CircuitNodeId, negative: CircuitNodeId): MeasurementValue {
    if (!this.result || !this.result.success) {
      return {
        value: 0,
        formatted: '----',
        unit: 'V',
        valid: false,
        stale: this.isStale,
        status: 'NO_DATA',
        positiveNode: positive,
        negativeNode: negative,
        description: 'No simulation data available'
      };
    }

    if (!positive || positive === 'none' || positive === 'OPEN') {
      return {
        value: 0,
        formatted: 'OPEN',
        unit: 'V',
        valid: false,
        stale: this.isStale,
        status: 'OPEN',
        positiveNode: positive,
        negativeNode: negative,
        description: 'Probe disconnected'
      };
    }

    if (this.result.mode === 'ac') {
      return { value: 0, formatted: '----', unit: 'V', valid: false, stale: this.isStale, status: 'NO_DATA', positiveNode: positive, negativeNode: negative, description: 'AC analysis returns a frequency sweep. Read its waveform instead of a single voltage value.' };
    }

    const isGround = (id?: string) => !id || id === '0' || id === 'GND' || id.toUpperCase() === 'GROUND';

    // Extract positive node voltage
    let vPos = 0;
    if (!isGround(positive)) {
      const nodeObj = this.result.nodes.find(n => n.id === positive || n.label === positive);
      if (nodeObj !== undefined) {
        vPos = nodeObj.voltage;
      } else if (this.result.waveforms?.[positive]?.voltage?.length) {
        const arr = this.result.waveforms[positive].voltage;
        vPos = arr[arr.length - 1];
      } else {
        return {
          value: 0,
          formatted: 'ERR',
          unit: 'V',
          valid: false,
          stale: this.isStale,
          status: 'ERR',
          positiveNode: positive,
          negativeNode: negative,
          description: `Node ${positive} not found in circuit netlist`
        };
      }
    }

    // Extract negative node voltage
    let vNeg = 0;
    if (!isGround(negative)) {
      const nodeObj = this.result.nodes.find(n => n.id === negative || n.label === negative);
      if (nodeObj !== undefined) {
        vNeg = nodeObj.voltage;
      } else if (this.result.waveforms?.[negative]?.voltage?.length) {
        const arr = this.result.waveforms[negative].voltage;
        vNeg = arr[arr.length - 1];
      } else {
        return {
          value: 0,
          formatted: 'ERR',
          unit: 'V',
          valid: false,
          stale: this.isStale,
          status: 'ERR',
          positiveNode: positive,
          negativeNode: negative,
          description: `Node ${negative} not found in circuit netlist`
        };
      }
    }

    const diff = vPos - vNeg;
    const absVal = Math.abs(diff);

    let formatted = '';
    let unit = 'V';

    if (absVal >= 1000) {
      formatted = (diff / 1000).toFixed(3);
      unit = 'kV';
    } else if (absVal >= 1.0) {
      formatted = diff.toFixed(3);
      unit = 'V';
    } else if (absVal >= 1e-3) {
      formatted = (diff * 1000).toFixed(2);
      unit = 'mV';
    } else if (absVal > 0) {
      formatted = (diff * 1e6).toFixed(1);
      unit = 'μV';
    } else {
      formatted = '0.000';
      unit = 'V';
    }

    return {
      value: diff,
      formatted,
      unit,
      valid: true,
      stale: this.isStale,
      status: this.isStale ? 'STALE' : 'VALID',
      positiveNode: positive,
      negativeNode: negative,
      description: `Differential voltage V(${positive}) - V(${negative})`
    };
  }

  /**
   * Reads real branch current from SPICE solve
   */
  public readCurrent(branchOrComponentId: BranchId): MeasurementValue {
    if (!this.result || !this.result.success) {
      return {
        value: 0,
        formatted: '----',
        unit: 'A',
        valid: false,
        stale: this.isStale,
        status: 'NO_DATA',
        branch: branchOrComponentId
      };
    }

    const iVal = this.result.componentData?.[branchOrComponentId]?.current;
    if (iVal === undefined || !Number.isFinite(iVal)) {
      return { value: 0, formatted: '----', unit: 'A', valid: false, stale: this.isStale, status: 'NO_DATA', branch: branchOrComponentId, description: 'Current is unavailable for this component.' };
    }

    const absI = Math.abs(iVal);
    let formatted = '';
    let unit = 'A';

    if (absI >= 1.0) {
      formatted = iVal.toFixed(3);
      unit = 'A';
    } else if (absI >= 1e-3) {
      formatted = (iVal * 1000).toFixed(2);
      unit = 'mA';
    } else if (absI > 0) {
      formatted = (iVal * 1e6).toFixed(1);
      unit = 'μA';
    } else {
      formatted = '0.00';
      unit = 'mA';
    }

    return {
      value: iVal,
      formatted,
      unit,
      valid: true,
      stale: this.isStale,
      status: this.isStale ? 'STALE' : 'VALID',
      branch: branchOrComponentId
    };
  }

  /**
   * Reads real time-domain waveform Float64Array/number[] for oscilloscope
   */
  public readWaveform(
    positiveNode: CircuitNodeId,
    negativeNode: CircuitNodeId = '0'
  ): WaveformData {
    const isGround = (id?: string) => !id || id === '0' || id === 'GND' || id.toUpperCase() === 'GROUND';

    if (this.result?.success && this.result.mode === 'ac') {
      return {
        time: [], values: [], unit: 'V', label: 'AC frequency sweep is not a time-domain waveform',
        valid: false, stale: this.isStale, positiveNode, negativeNode,
        source: { type: 'node-voltage', target: positiveNode }, metrics: analyzeWaveform([], [])
      };
    }

    if (!this.result || !this.result.success || !this.result.waveforms) {
      return {
        time: [],
        values: [],
        unit: 'V',
        label: `${positiveNode}`,
        valid: false,
        stale: this.isStale,
        positiveNode,
        negativeNode,
        source: { type: 'node-voltage', target: positiveNode },
        metrics: analyzeWaveform([], [])
      };
    }

    // Find positive waveform
    const posWf = this.result.waveforms[positiveNode];
    if (!posWf || !posWf.time || !posWf.voltage || posWf.voltage.length === 0) {
      return {
        time: [],
        values: [],
        unit: 'V',
        label: `${positiveNode}`,
        valid: false,
        stale: this.isStale,
        positiveNode,
        negativeNode,
        source: { type: 'node-voltage', target: positiveNode },
        metrics: analyzeWaveform([], [])
      };
    }

    const time = posWf.time;
    let values: number[] = [];

    if (isGround(negativeNode)) {
      // Single-ended ground referenced
      values = [...posWf.voltage];
    } else {
      // Differential waveform: V_pos(t) - V_neg(t)
      const negWf = this.result.waveforms[negativeNode];
      if (negWf && negWf.voltage && negWf.voltage.length === posWf.voltage.length) {
        values = posWf.voltage.map((v, idx) => v - (negWf.voltage[idx] ?? 0));
      } else {
        return {
          time: [], values: [], unit: 'V', label: `Node ${negativeNode} unavailable`, valid: false,
          stale: this.isStale, positiveNode, negativeNode,
          source: { type: 'differential-voltage', target: `${positiveNode}-${negativeNode}` },
          metrics: analyzeWaveform([], [])
        };
      }
    }

    const metrics = analyzeWaveform(time, values);

    return {
      time,
      values,
      unit: 'V',
      label: isGround(negativeNode) ? `V(${positiveNode})` : `V(${positiveNode}) - V(${negativeNode})`,
      valid: true,
      stale: this.isStale,
      positiveNode,
      negativeNode,
      source: {
        type: isGround(negativeNode) ? 'node-voltage' : 'differential-voltage',
        target: isGround(negativeNode) ? positiveNode : `${positiveNode}-${negativeNode}`
      },
      metrics
    };
  }

  /**
   * Measures equivalent circuit resistance between two nodes
   */
  public readResistance(positiveNode: CircuitNodeId, negativeNode: CircuitNodeId = '0'): MeasurementValue {
    if (!this.result || !this.result.success) {
      return {
        value: 0,
        formatted: '----',
        unit: 'Ω',
        valid: false,
        stale: this.isStale,
        status: 'NO_DATA'
      };
    }

    return { value: 0, formatted: '----', unit: 'Ω', valid: false, stale: this.isStale, status: 'NO_DATA', description: 'Resistance test mode is not simulated yet.' };
  }

  /**
   * Tests circuit continuity (< 50 Ohms threshold)
   */
  public readContinuity(
    positiveNode: CircuitNodeId,
    negativeNode: CircuitNodeId = '0',
    thresholdOhms: number = 50
  ): { isConducting: boolean; resistance: number; formatted: string; isBeep: boolean; valid: boolean } {
    const resMeas = this.readResistance(positiveNode, negativeNode);
    if (!resMeas.valid) {
      return { isConducting: false, resistance: 0, formatted: '----', isBeep: false, valid: false };
    }
    const r = resMeas.value;
    const isConducting = isFinite(r) && r >= 0 && r <= thresholdOhms;

    return {
      isConducting,
      resistance: r,
      formatted: isConducting ? `${r.toFixed(1)} Ω` : 'OPEN (OL)',
      isBeep: isConducting,
      valid: true
    };
  }

  /**
   * Reads real component power P = V * I
   */
  public readPower(componentId: string): PowerMeasurement {
    if (!this.result || !this.result.success) {
      return {
        realPower: 0,
        apparentPower: 0,
        voltageRms: 0,
        currentRms: 0,
        valid: false,
        stale: this.isStale,
        formatted: '----'
      };
    }

    if (this.result.mode !== 'dc') {
      return { realPower: 0, apparentPower: 0, voltageRms: 0, currentRms: 0, valid: false, stale: this.isStale, formatted: '----' };
    }

    const data = this.result.componentData?.[componentId];
    const p = data?.power;
    const v = data?.voltage;
    const i = data?.current;
    if (p === undefined || v === undefined || i === undefined || ![p, v, i].every(Number.isFinite)) {
      return { realPower: 0, apparentPower: 0, voltageRms: 0, currentRms: 0, valid: false, stale: this.isStale, formatted: '----' };
    }

    let formatted = '';
    if (p >= 1.0) {
      formatted = `${p.toFixed(3)} W`;
    } else if (p >= 1e-3) {
      formatted = `${(p * 1000).toFixed(2)} mW`;
    } else {
      formatted = `${(p * 1e6).toFixed(1)} μW`;
    }

    return {
      realPower: p,
      apparentPower: p,
      voltageRms: v,
      currentRms: i,
      valid: true,
      stale: this.isStale,
      formatted
    };
  }
}

