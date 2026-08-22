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

interface EnhancedComponentPropertiesProps {
  component: CanvasComponent;
  wires: Wire[];
  simulationResult: SimulationResult | null;
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
  // Find connected wires and node names
  const connectedWires = useMemo(() => {
    return wires.filter(w => w.from.componentId === component.id || w.to.componentId === component.id);
  }, [wires, component.id]);

  // Read telemetry metrics from MeasurementBus / SimulationResult
  const telemetry = useMemo(() => {
    if (!simulationResult || !simulationResult.success) {
      return { vDrop: 0, current: 0, power: 0, state: 'Idle' };
    }

    // Try finding componentData
    const cData = simulationResult.componentData?.[component.id];
    if (cData) {
      return {
        vDrop: Math.abs(cData.voltage || 0),
        current: Math.abs(cData.current || 0),
        power: Math.abs(cData.power || 0),
        state: cData.power > 0.5 ? 'High Power' : 'Active'
      };
    }

    // Calculate from terminal voltages if available
    let n1Volt = 0;
    let n2Volt = 0;
    if (simulationResult.nodes && simulationResult.nodes.length > 0) {
      const n1Wire = connectedWires[0];
      const n2Wire = connectedWires[1];
      const n1Node = simulationResult.nodes.find(n => n.id === n1Wire?.netLabel || n.id === `Node_${n1Wire?.id}`);
      const n2Node = simulationResult.nodes.find(n => n.id === n2Wire?.netLabel || n.id === `Node_${n2Wire?.id}`);
      n1Volt = n1Node?.voltage || 0;
      n2Volt = n2Node?.voltage || 0;
    }

    const vDrop = Math.abs(n1Volt - n2Volt);
    const rVal = component.type === 'resistor' ? component.value : 1000;
    const current = rVal > 0 ? vDrop / rVal : 0;
    const power = vDrop * current;

    return {
      vDrop,
      current,
      power,
      state: power > 0.25 ? 'Hot' : 'Normal'
    };
  }, [simulationResult, component, connectedWires]);

  // Handle Frequency & AC Params
  const acFreq = component.params?.frequency ?? 1000;
  const acWfType = component.params?.waveformType ?? 0;

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
                  <Sparkles className="h-3 w-3 mr-1" /> Live SPICE Synced
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {connectedWires.length} Wires Connected • Real-time SPICE MNA parameters
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
                {component.value} {component.unit}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Input
                type="number"
                value={component.value}
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
                value={[component.value]}
                min={Math.max(component.value * 0.1, 0.01)}
                max={Math.max(component.value * 5, 100)}
                step={component.value > 100 ? 10 : 0.5}
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
                onClick={() => onUpdateValue(component.id, Math.round(component.value * 0.5 * 100) / 100)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                0.5×
              </button>
              <button
                onClick={() => onUpdateValue(component.id, Math.round(component.value * 2 * 100) / 100)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                2.0×
              </button>
              <button
                onClick={() => onUpdateValue(component.id, component.value * 10)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                10×
              </button>
              <button
                onClick={() => onUpdateValue(component.id, component.value / 10)}
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
                    <span className="font-mono text-cyan-300 font-bold">{component.type === 'led' ? '2.0 V' : '0.7 V'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Max Forward Current:</span>
                    <span className="font-mono text-cyan-300 font-bold">20 mA</span>
                  </div>
                </div>
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
                ● Live SPICE
              </Badge>
            </div>

            <div className="space-y-2 mb-3">
              {/* Voltage Drop */}
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Terminal Voltage (ΔV)</span>
                <span className="text-sm font-mono font-bold text-cyan-300">
                  {telemetry.vDrop.toFixed(3)} V
                </span>
              </div>

              {/* Branch Current */}
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Branch Current (I)</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {telemetry.current >= 1 ? `${telemetry.current.toFixed(3)} A` : `${(telemetry.current * 1000).toFixed(2)} mA`}
                </span>
              </div>

              {/* Power Dissipation */}
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Power Dissipation (P)</span>
                <span className="text-sm font-mono font-bold text-emerald-300">
                  {telemetry.power >= 1 ? `${telemetry.power.toFixed(3)} W` : `${(telemetry.power * 1000).toFixed(2)} mW`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Operating State: <strong className="text-slate-200">{telemetry.state}</strong></span>
            <span>MNA Linearized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
