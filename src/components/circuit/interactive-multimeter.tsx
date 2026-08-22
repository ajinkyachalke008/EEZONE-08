'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Gauge, Volume2, RefreshCw, Lock, Radio, Zap } from 'lucide-react';
import { MeasurementBus } from '@/lib/measurement-bus';
import type { SimulationResult } from '@/lib/simulation-engine';

export interface MultimeterProps {
  measurementBus: MeasurementBus;
  simulationResult: SimulationResult | null;
  isRunning: boolean;
}

export type DMMMode = 'DCV' | 'ACV' | 'DCA' | 'ACA' | 'RES' | 'CONT' | 'DIODE' | 'PWR';

export const InteractiveMultimeter: React.FC<MultimeterProps> = ({
  measurementBus,
  simulationResult,
  isRunning
}) => {
  const [mode, setMode] = useState<DMMMode>('DCV');
  const [probePos, setProbePos] = useState<string>('auto');
  const [probeCom, setProbeCom] = useState<string>('0');
  const [isHold, setIsHold] = useState(false);
  const [holdValue, setHoldValue] = useState<{ value: string; unit: string; secondary: string } | null>(null);
  const [relOffset, setRelOffset] = useState<number | null>(null);

  // Available probe nodes directly from MeasurementBus
  const availableNodes = useMemo(() => {
    const nodes = measurementBus?.getAvailableNodes ? measurementBus.getAvailableNodes() : [];
    if (nodes.length > 0) {
      return nodes.map(n => ({ id: n.id, label: `Node: ${n.label}` }));
    }
    return [
      { id: 'VCC', label: 'VCC (+)' },
      { id: '1', label: 'Node 1' },
      { id: '2', label: 'Node 2' },
      { id: '0', label: 'GND (0V)' }
    ];
  }, [measurementBus, simulationResult]);

  // Read strictly real electrical data from MeasurementBus
  const measurement = useMemo(() => {
    if (isHold && holdValue !== null) {
      return holdValue;
    }

    if (!measurementBus?.isAvailable || !measurementBus.isAvailable()) {
      return {
        value: '----',
        unit: mode === 'DCV' ? 'V DC' : mode === 'ACV' ? 'V AC' : mode === 'DCA' ? 'mA' : mode === 'RES' ? 'Ω' : 'V',
        secondary: 'NO SIMULATION DATA — RUN SPICE',
        isStale: false,
        raw: 0
      };
    }

    const activePos = probePos === 'auto' ? (availableNodes[0]?.id || '1') : probePos;
    const activeNeg = probeCom;

    switch (mode) {
      case 'DCV': {
        const meas = measurementBus.readDifferentialVoltage(activePos, activeNeg);
        let val = meas.value;
        if (relOffset !== null) val -= relOffset;

        return {
          value: meas.formatted,
          unit: `${meas.unit} DC`,
          secondary: meas.description || `V(${activePos}) - V(${activeNeg})`,
          isStale: meas.stale,
          raw: meas.value
        };
      }

      case 'ACV': {
        const wf = measurementBus.readWaveform(activePos, activeNeg);
        if (!wf.valid) {
          return { value: '0.000', unit: 'V AC', secondary: 'No AC signal', isStale: wf.stale, raw: 0 };
        }
        const rms = wf.metrics.vAcRms || (wf.metrics.vRms / Math.SQRT2);
        return {
          value: rms.toFixed(3),
          unit: 'V RMS',
          secondary: `Freq: ${wf.metrics.frequency > 0 ? wf.metrics.frequency.toFixed(1) + ' Hz' : '0 Hz (DC)'}`,
          isStale: wf.stale,
          raw: rms
        };
      }

      case 'DCA': {
        const meas = measurementBus.readCurrent('resistor');
        return {
          value: meas.formatted,
          unit: meas.unit,
          secondary: `Branch Current I(load)`,
          isStale: meas.stale,
          raw: meas.value
        };
      }

      case 'ACA': {
        const meas = measurementBus.readCurrent('resistor');
        const acI = Math.abs(meas.value) / Math.SQRT2;
        return {
          value: (acI * 1000).toFixed(2),
          unit: 'mA RMS',
          secondary: `AC Branch Current`,
          isStale: meas.stale,
          raw: acI
        };
      }

      case 'RES': {
        const meas = measurementBus.readResistance(activePos, activeNeg);
        return {
          value: meas.formatted,
          unit: meas.unit,
          secondary: meas.status === 'OL' ? 'OPEN CIRCUIT (OL)' : 'Equivalent Resistance',
          isStale: meas.stale,
          raw: isFinite(meas.value) ? meas.value : 0
        };
      }

      case 'CONT': {
        const cont = measurementBus.readContinuity(activePos, activeNeg);
        return {
          value: cont.isConducting ? `${cont.resistance.toFixed(1)}` : 'OL',
          unit: cont.isConducting ? 'Ω' : '',
          secondary: cont.isConducting ? '🔊 BEEP (CONTINUOUS PATH < 50Ω)' : 'OPEN CIRCUIT (NO CONTINUITY)',
          isStale: false,
          raw: cont.isConducting ? 1 : 0
        };
      }

      case 'DIODE': {
        const meas = measurementBus.readDifferentialVoltage(activePos, activeNeg);
        const vDrop = Math.abs(meas.value);
        const isForward = vDrop >= 0.3 && vDrop <= 3.5;
        return {
          value: vDrop.toFixed(3),
          unit: 'V Forward',
          secondary: isForward ? 'DIODE CONDUCTING' : 'OPEN / REVERSE BIASED',
          isStale: meas.stale,
          raw: vDrop
        };
      }

      case 'PWR': {
        const pwr = measurementBus.readPower('resistor');
        return {
          value: pwr.formatted,
          unit: '',
          secondary: `P = V_rms × I_rms`,
          isStale: pwr.stale,
          raw: pwr.realPower
        };
      }

      default:
        return { value: '0.000', unit: 'V', secondary: '', isStale: false, raw: 0 };
    }
  }, [mode, probePos, probeCom, isHold, holdValue, relOffset, measurementBus, simulationResult, availableNodes]);

  const toggleHold = () => {
    if (!isHold) {
      setHoldValue(measurement);
      setIsHold(true);
    } else {
      setIsHold(false);
      setHoldValue(null);
    }
  };

  const rawNum = typeof measurement === 'object' && 'raw' in measurement ? (measurement.raw as number) : 0;
  const barPercent = Math.min(Math.max((Math.abs(rawNum) / (mode === 'DCV' ? 12 : mode === 'DCA' ? 0.05 : 1000)) * 100, 5), 100);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Bench Digital Multimeter (DMM)</h4>
            <p className="text-[10px] text-slate-400">6000-Count True RMS Precision • Differential Measurement Bus</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`font-mono text-[10px] ${
            measurement.isStale
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
              : isRunning
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {measurement.isStale ? '⚠ STALE SIM' : isRunning ? '● LIVE SPICE' : '○ STANDBY'}
        </Badge>
      </div>

      {/* 7-Segment LCD Display */}
      <div className="relative bg-emerald-950/70 border-2 border-emerald-900/80 rounded-lg p-3.5 shadow-inner mb-3">
        {/* Annunciator top bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/80 mb-1 border-b border-emerald-900/50 pb-1">
          <span className="font-bold">{mode}</span>
          <div className="flex gap-2">
            {isHold && <span className="bg-amber-500/20 text-amber-300 px-1 rounded text-[9px] font-bold">HOLD</span>}
            {relOffset !== null && <span className="bg-cyan-500/20 text-cyan-300 px-1 rounded text-[9px] font-bold">REL Δ</span>}
            <span className="text-emerald-300 font-bold">AUTO</span>
            <span>6000 CNT</span>
          </div>
        </div>

        {/* Main large readout */}
        <div className="flex items-baseline justify-between my-1">
          <span className="font-mono text-3xl md:text-4xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
            {measurement.value}
          </span>
          <span className="font-mono text-sm md:text-base font-bold text-emerald-300 ml-2">
            {measurement.unit}
          </span>
        </div>

        {/* Analog Bargraph */}
        <div className="w-full bg-emerald-950 rounded-full h-1.5 mt-2 overflow-hidden border border-emerald-800/40">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${barPercent}%` }}
          />
        </div>

        {/* Secondary Info */}
        <div className="text-[10px] font-mono text-emerald-400/70 mt-1.5 flex justify-between">
          <span>{measurement.secondary}</span>
          <span>Probes: {probePos} → {probeCom}</span>
        </div>
      </div>

      {/* Function Selector Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { id: 'DCV', label: 'V⎓ DC' },
          { id: 'ACV', label: 'V~ AC' },
          { id: 'DCA', label: 'A⎓ mA' },
          { id: 'ACA', label: 'A~ AC' },
          { id: 'RES', label: 'Ω Ohm' },
          { id: 'CONT', label: '🔊 Continuity' },
          { id: 'DIODE', label: '―▷|― Diode' },
          { id: 'PWR', label: 'W Power' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => { setMode(f.id as DMMMode); setIsHold(false); }}
            className={`py-1.5 px-1 rounded text-[10px] font-bold transition-all flex flex-col items-center ${
              mode === f.id
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-[1.02]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Probe Point Selectors */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs mb-3">
        <div>
          <Label className="text-[10px] font-semibold text-red-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Red Probe (+)
          </Label>
          <Select value={probePos} onValueChange={setProbePos}>
            <SelectTrigger className="h-7 text-xs bg-slate-900 border-red-500/40 text-slate-200">
              <SelectValue placeholder="Select Node" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="auto">Auto (Circuit Output)</SelectItem>
              {availableNodes.map(n => (
                <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Black Probe (COM)
          </Label>
          <Select value={probeCom} onValueChange={setProbeCom}>
            <SelectTrigger className="h-7 text-xs bg-slate-900 border-slate-600 text-slate-200">
              <SelectValue placeholder="Select Node" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="0">GND (Ground 0V)</SelectItem>
              {availableNodes.map(n => (
                <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottom utility controls */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={toggleHold}
          className={`flex-1 h-7 text-xs font-bold border-slate-700 ${
            isHold ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Lock className="h-3 w-3 mr-1" /> {isHold ? 'RELEASE' : 'HOLD'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (relOffset === null) {
              setRelOffset(measurement.raw);
            } else {
              setRelOffset(null);
            }
          }}
          className={`flex-1 h-7 text-xs font-bold border-slate-700 ${
            relOffset !== null ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          REL Δ {relOffset !== null ? 'ON' : 'OFF'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setProbePos('auto');
            setProbeCom('0');
            setIsHold(false);
            setRelOffset(null);
          }}
          className="h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          title="Reset Probes"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
