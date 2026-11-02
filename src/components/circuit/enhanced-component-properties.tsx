'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap, RotateCw, Copy, Lock, Unlock, Trash2, Sliders,
  Activity, Gauge, Sparkles, Radio, Cpu, Lightbulb, Flame,
  Waves, Target
} from 'lucide-react';
import type { Component as CanvasComponent, Wire } from '@/app/tools/circuit-simulator/page';
import type { SimulationResult } from '@/lib/simulation-engine';
import { MeasurementBus } from '@/lib/measurement-bus';
import { getComponentSimulationSupport } from '@/lib/spice-netlist-generator';
import { getComponentReference } from '@/lib/component-reference';

interface EnhancedComponentPropertiesProps {
  component: CanvasComponent;
  wires: Wire[];
  simulationResult: SimulationResult | null;
  engineUsed?: 'spice-ts' | 'legacy-mna';
  measurementBus: MeasurementBus | null;
  liveEditMode: boolean;
  onUpdateValue: (id: string, value: number) => void;
  onUpdateParams?: (id: string, params: Record<string, any>) => void;
  onRotate: (id: string) => void;
  onDuplicate: (component: CanvasComponent) => void;
  onToggleLock: (id: string) => void;
  onRemove: (id: string) => void;
  onAttachProbe?: (channel: 'CH1' | 'CH2' | 'DMM', nodeId: string) => void;
}

// Standard E12 / E24 component values
const STANDARD_RESISTOR_VALUES = [10, 22, 47, 100, 220, 330, 470, 1000, 2200, 4700, 10000, 47000, 100000, 1000000];
const STANDARD_CAPACITOR_VALUES = [10e-12, 100e-12, 1e-9, 10e-9, 100e-9, 1e-6, 10e-6, 100e-6, 1000e-6];
const STANDARD_INDUCTOR_VALUES = [1e-6, 10e-6, 100e-6, 1e-3, 10e-3, 100e-3, 1.0];

export const EnhancedComponentProperties: React.FC<EnhancedComponentPropertiesProps> = ({
  component,
  wires,
  simulationResult,
  engineUsed = 'spice-ts',
  measurementBus,
  liveEditMode,
  onUpdateValue,
  onUpdateParams,
  onRotate,
  onDuplicate,
  onToggleLock,
  onRemove,
  onAttachProbe
}) => {
  const componentValue = component.value ?? 0;
  const simulationSupport = getComponentSimulationSupport(component.type);
  const componentReference = getComponentReference(component.type);
  const connectedWires = useMemo(() => wires.filter(w => w.from.componentId === component.id || w.to.componentId === component.id), [wires, component.id]);

  // Read telemetry metrics from MeasurementBus / SimulationResult
  const telemetry = useMemo(() => {
    if (!simulationResult || !simulationResult.success) {
      return { vDrop: undefined, current: undefined, power: undefined, state: 'No simulation data' };
    }

    // Try finding componentData
    const cData = simulationResult.componentData?.[component.id];
    if (cData) {
      return {
        vDrop: cData.voltage === undefined ? undefined : Math.abs(cData.voltage),
        current: cData.current === undefined ? undefined : Math.abs(cData.current),
        power: cData.power === undefined ? undefined : Math.abs(cData.power),
        state: cData.power === undefined ? 'Partial solver data' : cData.power > 0.5 ? 'High Power' : 'Active'
      };
    }
    return { vDrop: undefined, current: undefined, power: undefined, state: 'Unavailable for this component' };
  }, [simulationResult, component.id]);

  // Handle Frequency & AC Params
  const acFreq = component.params?.frequency ?? 1000;
  const acWfType = component.params?.waveformType ?? 0;
  const potWiperRatio = component.params?.wiperRatio ?? 0.5;
  const transistorBeta = component.params?.beta ?? 100;
  const mosfetThreshold = component.params?.thresholdVoltage ?? 1;
  const mosfetTransconductance = component.params?.transconductance ?? 0.1;
  const meterInputResistance = component.params?.inputResistance ?? 10000000;
  const meterBurdenResistance = component.params?.burdenResistance ?? 0.001;
  const amplifierGain = component.params?.gain ?? (component.type === 'comparator' ? 1000000 : 100000);

  const handleFrequencyChange = (newFreq: number) => {
    if (onUpdateParams) {
      onUpdateParams(component.id, { ...component.params, frequency: newFreq });
    }
  };

  const handleWfTypeChange = (newType: number) => {
    if (onUpdateParams) {
      onUpdateParams(component.id, { ...component.params, waveformType: newType });
    }
  };

  return (
    <div className="mt-4 p-5 bg-slate-900/90 backdrop-blur-md rounded-xl border-2 border-cyan-500/40 shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white capitalize">
                {component.type.replace(/_/g, ' ')} Inspector
              </h3>
              <Badge className="text-[10px] bg-slate-800 text-cyan-300 border border-cyan-500/30">
                ID: {component.id.slice(0, 14)}
              </Badge>
              {liveEditMode && (
                <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="h-3 w-3 mr-1" /> Simulation Synced
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
      {connectedWires.length} Wires Connected • {simulationSupport.detail}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRotate(component.id)}
            className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            title="Rotate 90°"
          >
            <RotateCw className="h-4 w-4 mr-1.5 text-indigo-400" /> Rotate
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicate(component)}
            className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            title="Duplicate Component"
          >
            <Copy className="h-4 w-4 mr-1.5 text-cyan-400" /> Clone
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleLock(component.id)}
            className={`h-8 px-2.5 border-slate-700 ${
              component.locked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}
            title={component.locked ? 'Unlock Position' : 'Lock Position'}
          >
            {component.locked ? <Lock className="h-4 w-4 mr-1.5 text-amber-400" /> : <Unlock className="h-4 w-4 mr-1.5 text-slate-400" />}
            {component.locked ? 'Locked' : 'Lock'}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemove(component.id)}
            className="h-8 px-2.5 bg-red-600/80 hover:bg-red-600 text-white"
            title="Delete Component"
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Grid: Parameters, Presets, and Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Value Editor & Quick Slider */}
        <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" /> Primary Value
              </Label>
              <span className="text-xs font-mono font-bold text-slate-300">
                {componentValue} {component.unit}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Input
                type="number"
                value={componentValue}
                onChange={(e) => onUpdateValue(component.id, parseFloat(e.target.value))}
                className="h-9 font-mono text-base font-bold bg-slate-900 text-cyan-300 border-slate-700 focus:border-cyan-500"
                step="any"
              />
              <span className="px-3 py-1.5 bg-slate-800 rounded-md font-mono text-sm font-bold text-slate-200 border border-slate-700 min-w-[50px] text-center">
                {component.unit || '—'}
              </span>
            </div>

            {/* Live Smooth Slider */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.1×</span>
                <span>Live Tuning Slider</span>
                <span>10×</span>
              </div>
              <Slider
                value={[componentValue]}
                min={Math.max(componentValue * 0.1, 0.01)}
                max={Math.max(componentValue * 5, 100)}
                step={componentValue > 100 ? 10 : 0.5}
                onValueChange={(vals) => onUpdateValue(component.id, vals[0])}
                className="py-1 cursor-ew-resize"
              />
            </div>
          </div>

          {/* Quick Multipliers */}
          <div>
            <Label className="text-[10px] font-semibold text-slate-400 mb-1.5 block">Quick Multipliers</Label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => onUpdateValue(component.id, Math.round(componentValue * 0.5 * 100) / 100)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                0.5×
              </button>
              <button
                onClick={() => onUpdateValue(component.id, Math.round(componentValue * 2 * 100) / 100)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                2.0×
              </button>
              <button
                onClick={() => onUpdateValue(component.id, componentValue * 10)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                10×
              </button>
              <button
                onClick={() => onUpdateValue(component.id, componentValue / 10)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                0.1×
              </button>
            </div>
          </div>
        </div>

        {/* 2. Specialized Properties & Standard E-Series Values */}
        <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <Label className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Component Characteristics
            </Label>
            <div className={`mb-3 rounded border px-2 py-1.5 text-[10px] ${simulationSupport.kind === 'spice' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200' : 'border-amber-500/30 bg-amber-500/5 text-amber-200'}`}>
              {simulationSupport.kind === 'spice'
                ? `Simulation model: ${simulationSupport.accuracy}`
                : 'Design symbol only: no electrical model'}
              <span className="ml-1 text-slate-400">{simulationSupport.detail}</span>
            </div>

            {/* If AC Source or Signal Gen */}
            {(component.type === 'voltage_ac' || component.type === 'signal_generator') && (
              <div className="space-y-3 mb-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>AC Frequency:</span>
                    <span className="font-mono font-bold text-cyan-300">{acFreq} Hz</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[50, 1000, 5033, 10000].map(f => (
                      <button
                        key={f}
                        onClick={() => handleFrequencyChange(f)}
                        className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                          acFreq === f ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {f >= 1000 ? `${(f / 1000).toFixed(1)}k` : `${f}Hz`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-slate-400 block mb-1">Waveform Shape</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {['Sine', 'Square', 'Triangle', 'Saw'].map((wName, idx) => (
                      <button
                        key={wName}
                        onClick={() => handleWfTypeChange(idx)}
                        className={`px-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                          acWfType === idx ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {wName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If Resistor / Capacitor / Inductor */}
            {component.type === 'resistor' && (
              <div>
                <Label className="text-[10px] text-slate-400 block mb-1.5">Standard E12 Resistor Values</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 47, 100, 220, 470, 1000, 4700, 10000].map(val => (
                    <button
                      key={val}
                      onClick={() => onUpdateValue(component.id, val)}
                      className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                        component.value === val ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val >= 1000 ? `${val / 1000}kΩ` : `${val}Ω`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {component.type === 'capacitor' && (
              <div>
                <Label className="text-[10px] text-slate-400 block mb-1.5">Standard Capacitor Values</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0.01, 0.1, 1.0, 10, 47, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => onUpdateValue(component.id, val)}
                      className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                        component.value === val ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val} {component.unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {component.type === 'inductor' && (
              <div>
                <Label className="text-[10px] text-slate-400 block mb-1.5">Standard Inductor Values</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 10, 47, 100, 220, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => onUpdateValue(component.id, val)}
                      className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                        component.value === val ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {val} {component.unit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Diode / LED */}
            {(component.type === 'led' || component.type === 'diode') && (
              <div>
                <Label className="text-[10px] text-slate-400 block mb-1.5">Forward Characteristics</Label>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Forward Drop (Vf):</span>
                    <span className="font-mono text-cyan-300 font-bold">{componentValue.toFixed(2)} V</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Calibration current:</span>
                    <span className="font-mono text-cyan-300 font-bold">{component.type === 'led' ? `${((component.params?.forwardCurrent ?? 0.02) * 1000).toFixed(1)} mA` : '1 mA'}</span>
                  </div>
                </div>
                {component.type === 'led' && (
                  <div className="mt-2">
                    <Label className="text-[10px] text-slate-400">Current at the selected forward voltage (A)</Label>
                    <Input type="number" min={0.0001} step={0.001} value={component.params?.forwardCurrent ?? 0.02} onChange={e => onUpdateParams?.(component.id, { ...component.params, forwardCurrent: Number(e.target.value) })} className="h-8 mt-1 bg-slate-900 text-cyan-300 border-slate-700" />
                  </div>
                )}
              </div>
            )}

            {component.type === 'potentiometer' && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Wiper position</span><span className="font-mono text-cyan-300">{Math.round(potWiperRatio * 100)}%</span>
                </div>
                <Slider value={[potWiperRatio]} min={0.01} max={0.99} step={0.01} onValueChange={([wiperRatio]) => onUpdateParams?.(component.id, { ...component.params, wiperRatio })} />
                <p className="text-[10px] text-slate-500">Sets the split between the two simulated resistor sections.</p>
              </div>
            )}

            {(component.type === 'transistor_npn' || component.type === 'transistor_pnp') && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400">Generic transistor beta (BF)</Label>
                <Input type="number" min={1} max={1000} value={transistorBeta} onChange={e => onUpdateParams?.(component.id, { ...component.params, beta: Number(e.target.value) })} className="h-8 bg-slate-900 text-cyan-300 border-slate-700" />
                <p className="text-[10px] text-slate-500">Generic model parameter; real transistor gain varies with current and temperature.</p>
              </div>
            )}

            {(component.type === 'mosfet_n' || component.type === 'mosfet_p') && (
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px] text-slate-400">|VTO| (V)</Label><Input type="number" min={0.1} step={0.1} value={mosfetThreshold} onChange={e => onUpdateParams?.(component.id, { ...component.params, thresholdVoltage: Number(e.target.value) })} className="h-8 bg-slate-900 text-cyan-300 border-slate-700" /></div>
                <div><Label className="text-[10px] text-slate-400">KP (A/V²)</Label><Input type="number" min={0.00001} step={0.01} value={mosfetTransconductance} onChange={e => onUpdateParams?.(component.id, { ...component.params, transconductance: Number(e.target.value) })} className="h-8 bg-slate-900 text-cyan-300 border-slate-700" /></div>
                <p className="col-span-2 text-[10px] text-slate-500">Generic MOSFET model parameters; no part-specific switching or thermal limits.</p>
              </div>
            )}

            {component.type === 'voltmeter' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400">Input resistance (Ω)</Label>
                <Input type="number" min={1000} value={meterInputResistance} onChange={e => onUpdateParams?.(component.id, { ...component.params, inputResistance: Number(e.target.value) })} className="h-8 bg-slate-900 text-cyan-300 border-slate-700" />
              </div>
            )}

            {component.type === 'ammeter' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400">Shunt resistance (Ω)</Label>
                <Input type="number" min={0.000001} step={0.001} value={meterBurdenResistance} onChange={e => onUpdateParams?.(component.id, { ...component.params, burdenResistance: Number(e.target.value) })} className="h-8 bg-slate-900 text-cyan-300 border-slate-700" />
              </div>
            )}

            {(component.type === 'op_amp' || component.type === 'comparator') && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400">Open-loop gain (V/V)</Label>
                <Input type="number" min={1} value={amplifierGain} onChange={e => onUpdateParams?.(component.id, { ...component.params, gain: Number(e.target.value) })} className="h-8 bg-slate-900 text-cyan-300 border-slate-700" />
                <p className="text-[10px] text-slate-500">Ideal three-terminal model; supply rails and output saturation are omitted.</p>
              </div>
            )}
          </div>

          {/* Quick Probe Attachment Button */}
          {onAttachProbe && (
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold">1-Click Probe:</span>
              <button
                onClick={() => onAttachProbe('CH1', component.id)}
                className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30"
              >
                Scope CH1
              </button>
              <button
                onClick={() => onAttachProbe('CH2', component.id)}
                className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/30"
              >
                Scope CH2
              </button>
              <button
                onClick={() => onAttachProbe('DMM', component.id)}
                className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded hover:bg-emerald-500/30"
              >
                DMM Probe
              </button>
            </div>
          )}
        </div>

        {/* 3. Live Operating Telemetry Monitor */}
        <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" /> In-Circuit Telemetry
              </Label>
              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ● {engineUsed === 'spice-ts' ? 'SPICE Solver' : 'Legacy MNA estimate'}
              </Badge>
            </div>

            <div className="space-y-2 mb-3">
              {/* Voltage Drop */}
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Terminal Voltage (ΔV)</span>
                <span className="text-sm font-mono font-bold text-cyan-300">
                  {telemetry.vDrop === undefined ? '—' : `${telemetry.vDrop.toFixed(3)} V`}
                </span>
              </div>

              {/* Branch Current */}
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Branch Current (I)</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {telemetry.current === undefined ? '—' : telemetry.current >= 1 ? `${telemetry.current.toFixed(3)} A` : `${(telemetry.current * 1000).toFixed(2)} mA`}
                </span>
              </div>

              {/* Power Dissipation */}
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Power Dissipation (P)</span>
                <span className="text-sm font-mono font-bold text-emerald-300">
                  {telemetry.power === undefined ? '—' : telemetry.power >= 1 ? `${telemetry.power.toFixed(3)} W` : `${(telemetry.power * 1000).toFixed(2)} mW`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Operating State: <strong className="text-slate-200">{telemetry.state}</strong></span>
            <span>{engineUsed !== 'spice-ts' ? 'Simplified MNA output' : simulationResult?.mode === 'transient' ? 'SPICE final time sample' : simulationResult?.mode === 'ac' ? 'AC frequency sweep' : 'SPICE DC operating point'}</span>
          </div>
        </div>
      </div>

      {componentReference && (
        <section className="mt-4 rounded-lg border border-indigo-500/25 bg-slate-950/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-200">Structure, working & pin reference</h4>
            <span className="text-[10px] text-slate-500">Generic family guide · check the selected part datasheet for ratings</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-3">
              <div><p className="text-[10px] font-semibold text-slate-400">Internal structure</p><p className="mt-1 text-xs leading-relaxed text-slate-200">{componentReference.structure}</p></div>
              <div><p className="text-[10px] font-semibold text-slate-400">How it works</p><p className="mt-1 text-xs leading-relaxed text-slate-200">{componentReference.workingPrinciple}</p></div>
              <div><p className="text-[10px] font-semibold text-slate-400">Common uses</p><p className="mt-1 text-xs leading-relaxed text-slate-300">{componentReference.commonUses}</p></div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold text-slate-400">Pin functions</p>
              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {componentReference.pins.map(pin => (
                  <div key={`${pin.terminal}-${pin.name}`} className="grid grid-cols-[minmax(70px,auto)_1fr] gap-2 rounded bg-slate-900 px-2 py-1.5 text-[10px]">
                    <span className="font-mono font-bold text-cyan-200">{pin.name} <span className="font-sans font-normal capitalize text-slate-500">{pin.direction}</span></span>
                    <span className="text-slate-300">{pin.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-3 border-t border-slate-800 pt-3 sm:grid-cols-2">
            <div><p className="mb-1 text-[10px] font-semibold text-slate-400">Characteristics</p><ul className="space-y-1 text-[10px] leading-relaxed text-slate-300">{componentReference.characteristics.map(item => <li key={item}>• {item}</li>)}</ul></div>
            <div><p className="mb-1 text-[10px] font-semibold text-slate-400">Design notes</p><p className="text-[10px] leading-relaxed text-slate-300">{componentReference.designNotes}</p></div>
          </div>
        </section>
      )}
    </div>
  );
};

