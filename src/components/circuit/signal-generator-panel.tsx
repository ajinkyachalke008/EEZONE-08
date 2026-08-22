'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Radio, Activity, Zap, Play, RefreshCw, Sliders } from 'lucide-react';
import type { SignalGeneratorConfig } from '@/lib/instrument-types';

export interface SignalGeneratorProps {
  config: SignalGeneratorConfig;
  onChange: (newConfig: SignalGeneratorConfig) => void;
  isRunning: boolean;
}

export const SignalGeneratorPanel: React.FC<SignalGeneratorProps> = ({
  config,
  onChange,
  isRunning
}) => {
  const updateField = <K extends keyof SignalGeneratorConfig>(field: K, value: SignalGeneratorConfig[K]) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Arbitrary Function / Signal Generator</h4>
            <p className="text-[10px] text-slate-400">Directly drives SPICE AC/Transient voltage excitation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] font-mono font-bold ${
              config.enabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {config.enabled ? '● OUTPUT ON' : '○ OUTPUT OFF'}
          </Badge>
          <Switch
            checked={config.enabled}
            onCheckedChange={(val) => updateField('enabled', val)}
          />
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Waveform Selector */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <Label className="text-[11px] font-bold text-slate-300 block mb-1">Waveform Function</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'SINE', label: '∿ Sine' },
              { id: 'SQUARE', label: '⎍ Square' },
              { id: 'TRIANGLE', label: '⩓ Triangle' },
              { id: 'SAWTOOTH', label: '⩘ Saw' },
              { id: 'DC', label: '― DC Level' },
            ].map((wf) => (
              <button
                key={wf.id}
                onClick={() => updateField('waveform', wf.id as any)}
                className={`py-1.5 px-2 rounded text-[10px] font-bold transition-all text-left ${
                  config.waveform === wf.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {wf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Control */}
        <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center">
            <Label className="text-[11px] font-bold text-slate-300">Frequency (f)</Label>
            <span className="font-mono text-indigo-300 font-bold">
              {config.frequency >= 1000 ? `${(config.frequency / 1000).toFixed(2)} kHz` : `${config.frequency} Hz`}
            </span>
          </div>

          <div className="flex gap-1">
            {[100, 1000, 5000, 10000].map(f => (
              <button
                key={f}
                onClick={() => updateField('frequency', f)}
                className={`flex-1 py-1 rounded text-[9px] font-bold ${
                  config.frequency === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {f >= 1000 ? `${f / 1000}k` : f}
              </button>
            ))}
          </div>

          <Slider
            value={[Math.log10(Math.max(config.frequency, 1))]}
            min={1}
            max={5}
            step={0.05}
            onValueChange={([logVal]) => updateField('frequency', Math.round(Math.pow(10, logVal)))}
          />
        </div>

        {/* Amplitude Control */}
        <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center">
            <Label className="text-[11px] font-bold text-slate-300">Amplitude (Vpp)</Label>
            <span className="font-mono text-indigo-300 font-bold">{config.amplitude.toFixed(1)} Vpp</span>
          </div>

          <div className="flex gap-1">
            {[1.0, 2.0, 5.0, 10.0].map(a => (
              <button
                key={a}
                onClick={() => updateField('amplitude', a)}
                className={`flex-1 py-1 rounded text-[9px] font-bold ${
                  config.amplitude === a ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {a}V
              </button>
            ))}
          </div>

          <Slider
            value={[config.amplitude]}
            min={0.1}
            max={24}
            step={0.1}
            onValueChange={([val]) => updateField('amplitude', val)}
          />
        </div>

        {/* Offset & Duty Cycle */}
        <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center">
            <Label className="text-[11px] font-bold text-slate-300">DC Offset (Vdc)</Label>
            <span className="font-mono text-indigo-300 font-bold">{config.offset.toFixed(1)} V</span>
          </div>

          <Slider
            value={[config.offset]}
            min={-10}
            max={10}
            step={0.5}
            onValueChange={([val]) => updateField('offset', val)}
          />

          {config.waveform === 'SQUARE' && (
            <div className="pt-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                <span>Duty Cycle:</span>
                <span className="text-indigo-300 font-bold">{config.dutyCycle}%</span>
              </div>
              <Slider
                value={[config.dutyCycle]}
                min={10}
                max={90}
                step={5}
                onValueChange={([val]) => updateField('dutyCycle', val)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
