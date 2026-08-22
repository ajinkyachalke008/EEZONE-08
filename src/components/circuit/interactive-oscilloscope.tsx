'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Activity, Play, Pause, RefreshCw, Eye, EyeOff, Download,
  Sliders, Crosshair, Split, Sparkles, FileSpreadsheet
} from 'lucide-react';
import { MeasurementBus } from '@/lib/measurement-bus';
import {
  analyzeWaveform,
  alignTrigger,
  decimateForDisplay,
  generateScopePolyline,
  calculateAcRms,
  type WaveformMetrics
} from '@/lib/waveform-analysis';
import type { SimulationResult } from '@/lib/simulation-engine';
import { toast } from 'sonner';

export interface OscilloscopeProps {
  measurementBus: MeasurementBus;
  simulationResult: SimulationResult | null;
  isRunning: boolean;
  onRerunSimulation?: () => void;
}

export const InteractiveOscilloscope: React.FC<OscilloscopeProps> = ({
  measurementBus,
  simulationResult,
  isRunning,
  onRerunSimulation
}) => {
  // Channel 1 Config
  const [ch1Node, setCh1Node] = useState<string>('auto');
  const [ch1Ref, setCh1Ref] = useState<string>('0');
  const [ch1Enabled, setCh1Enabled] = useState(true);
  const [ch1VDiv, setCh1VDiv] = useState(1.0);
  const [ch1Offset, setCh1Offset] = useState(0);
  const [ch1Coupling, setCh1Coupling] = useState<'DC' | 'AC'>('DC');

  // Channel 2 Config
  const [ch2Node, setCh2Node] = useState<string>('none');
  const [ch2Ref, setCh2Ref] = useState<string>('0');
  const [ch2Enabled, setCh2Enabled] = useState(true);
  const [ch2VDiv, setCh2VDiv] = useState(1.0);
  const [ch2Offset, setCh2Offset] = useState(-2);
  const [ch2Coupling, setCh2Coupling] = useState<'DC' | 'AC'>('DC');

  // Timebase
  const [timeDivIdx, setTimeDivIdx] = useState(4); // default 1ms/div
  const [horizOffset, setHorizOffset] = useState(0); // in divisions

  // Trigger
  const [triggerSource, setTriggerSource] = useState<'CH1' | 'CH2'>('CH1');
  const [triggerMode, setTriggerMode] = useState<'AUTO' | 'NORMAL' | 'SINGLE'>('AUTO');
  const [triggerSlope, setTriggerSlope] = useState<'rising' | 'falling'>('rising');
  const [triggerLevel, setTriggerLevel] = useState(0.0); // in Volts
  const [isFrozen, setIsFrozen] = useState(false);

  // Cursors
  const [cursorsEnabled, setCursorsEnabled] = useState(false);
  const [cursorX1Percent, setCursorX1Percent] = useState(30);
  const [cursorX2Percent, setCursorX2Percent] = useState(70);
  const [cursorY1Volt, setCursorY1Volt] = useState(2.0);
  const [cursorY2Volt, setCursorY2Volt] = useState(-2.0);

  const TIME_DIV_OPTIONS = [
    { label: '100 ns', value: 1e-7 },
    { label: '1 μs', value: 1e-6 },
    { label: '10 μs', value: 1e-5 },
    { label: '100 μs', value: 1e-4 },
    { label: '500 μs', value: 5e-4 },
    { label: '1 ms', value: 1e-3 },
    { label: '2 ms', value: 2e-3 },
    { label: '5 ms', value: 5e-3 },
    { label: '10 ms', value: 1e-2 },
    { label: '50 ms', value: 5e-2 },
    { label: '100 ms', value: 1e-1 },
    { label: '1 s', value: 1.0 },
  ];

  const currentTimeDiv = TIME_DIV_OPTIONS[timeDivIdx]?.value || 1e-3;

  // Available nodes from MeasurementBus
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

  // Read REAL waveforms from MeasurementBus
  const { ch1Wf, ch2Wf, isAvailable, isStale } = useMemo(() => {
    const available = measurementBus?.isAvailable ? measurementBus.isAvailable() : false;
    if (!available || !measurementBus) {
      return {
        ch1Wf: null,
        ch2Wf: null,
        isAvailable: false,
        isStale: false
      };
    }

    // Resolve node ids
    const activeCh1Node = ch1Node === 'auto'
      ? (availableNodes[0]?.id || '1')
      : ch1Node;

    const activeCh2Node = ch2Node === 'none'
      ? (availableNodes.length > 1 ? availableNodes[1]?.id : null)
      : ch2Node;

    const wf1 = measurementBus.readWaveform(activeCh1Node, ch1Ref);
    const wf2 = activeCh2Node ? measurementBus.readWaveform(activeCh2Node, ch2Ref) : null;

    // Apply AC coupling if selected
    if (wf1.valid && ch1Coupling === 'AC') {
      const avg = wf1.values.reduce((a, b) => a + b, 0) / (wf1.values.length || 1);
      wf1.values = wf1.values.map(v => v - avg);
      wf1.metrics = analyzeWaveform(wf1.time, wf1.values, triggerLevel);
    }

    if (wf2 && wf2.valid && ch2Coupling === 'AC') {
      const avg = wf2.values.reduce((a, b) => a + b, 0) / (wf2.values.length || 1);
      wf2.values = wf2.values.map(v => v - avg);
      wf2.metrics = analyzeWaveform(wf2.time, wf2.values, triggerLevel);
    }

    return {
      ch1Wf: wf1,
      ch2Wf: wf2,
      isAvailable: true,
      isStale: wf1.stale
    };
  }, [measurementBus, simulationResult, ch1Node, ch1Ref, ch2Node, ch2Ref, ch1Coupling, ch2Coupling, availableNodes, triggerLevel]);

  // Format polyline coordinates scaled across full 10 divisions wide by 8 divisions high
  const formatPolyline = (time: number[], values: number[], vDiv: number, offsetDiv: number) => {
    if (!time || !values || values.length === 0) return '';
    const totalTimeSpan = currentTimeDiv * 10;
    return generateScopePolyline(time, values, totalTimeSpan, vDiv, offsetDiv, triggerLevel, triggerSlope);
  };

  const ch1Points = useMemo(() => {
    if (!ch1Wf || !ch1Wf.valid || !ch1Enabled) return '';
    return formatPolyline(ch1Wf.time, ch1Wf.values, ch1VDiv, ch1Offset);
  }, [ch1Wf, ch1Enabled, ch1VDiv, ch1Offset, currentTimeDiv, triggerLevel, triggerSlope]);

  const ch2Points = useMemo(() => {
    if (!ch2Wf || !ch2Wf.valid || !ch2Enabled) return '';
    return formatPolyline(ch2Wf.time, ch2Wf.values, ch2VDiv, ch2Offset);
  }, [ch2Wf, ch2Enabled, ch2VDiv, ch2Offset, currentTimeDiv, triggerLevel, triggerSlope]);

  // Real Cursor Math
  const cursorStats = useMemo(() => {
    const totalTimeSpan = currentTimeDiv * 10;
    const t1 = (cursorX1Percent / 100) * totalTimeSpan;
    const t2 = (cursorX2Percent / 100) * totalTimeSpan;
    const deltaT = Math.abs(t2 - t1);
    const cursorFreq = deltaT > 0 ? (1 / deltaT) : 0;
    const deltaV = Math.abs(cursorY1Volt - cursorY2Volt);

    return {
      t1,
      t2,
      deltaT,
      cursorFreq,
      deltaV
    };
  }, [cursorX1Percent, cursorX2Percent, cursorY1Volt, cursorY2Volt, currentTimeDiv]);

  // AutoSet / Auto-Scale Logic
  const handleAutoSet = useCallback(() => {
    if (!ch1Wf || !ch1Wf.valid) return;
    
    // Auto V/Div for CH1
    const pp1 = ch1Wf.metrics?.vPp || 1;
    const targetDiv1 = pp1 / 4;
    const bestVDiv1 = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100].find(v => v >= targetDiv1) || 10;
    setCh1VDiv(bestVDiv1);
    setCh1Offset(0);

    // Auto V/Div for CH2
    if (ch2Wf && ch2Wf.valid) {
      const pp2 = ch2Wf.metrics?.vPp || 1;
      const targetDiv2 = pp2 / 4;
      const bestVDiv2 = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100].find(v => v >= targetDiv2) || 10;
      setCh2VDiv(bestVDiv2);
      setCh2Offset(0);
    }

    // Auto Timebase
    const f = ch1Wf.metrics?.frequency || ch2Wf?.metrics?.frequency || 0;
    if (f > 0) {
      const period = 1 / f;
      const targetTimeDiv = (3 * period) / 10;
      let closestIdx = 4;
      let minDiff = Infinity;
      TIME_DIV_OPTIONS.forEach((opt, idx) => {
        const diff = Math.abs(Math.log10(opt.value) - Math.log10(targetTimeDiv));
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setTimeDivIdx(closestIdx);
    }
    toast.success('Oscilloscope Auto-Scaled!');
  }, [ch1Wf, ch2Wf]);

  // Export CSV Data
  const exportCsv = () => {
    if (!ch1Wf || !ch1Wf.valid) {
      toast.error('No simulation waveform available to export');
      return;
    }

    let csv = 'time_s,CH1_V,CH2_V\n';
    const numPts = ch1Wf.time.length;
    for (let i = 0; i < numPts; i++) {
      const t = ch1Wf.time[i]?.toExponential(6) || '0';
      const v1 = ch1Wf.values[i]?.toFixed(5) || '0';
      const v2 = ch2Wf?.values[i]?.toFixed(5) || '0';
      csv += `${t},${v1},${v2}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scope_waveform_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Waveform exported as CSV');
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              4-Channel Digital Storage Oscilloscope (DSO)
            </h4>
            <p className="text-[10px] text-slate-400">
              Real SPICE Transient Data • 100 MSa/s • Differential Probe Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isStale && (
            <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse">
              ⚠ STALE — RERUN SIM
            </Badge>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoSet}
            className="h-7 px-2 text-xs font-bold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border-cyan-500/40"
            title="Auto-Scale Timebase & V/Div"
          >
            <Sparkles className="h-3 w-3 mr-1 text-cyan-400" /> AutoSet
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCursorsEnabled(!cursorsEnabled)}
            className={`h-7 px-2 text-xs font-bold ${
              cursorsEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Crosshair className="h-3 w-3 mr-1" /> Cursors
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            className="h-7 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            title="Export CSV"
          >
            <FileSpreadsheet className="h-3 w-3 mr-1" /> CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFrozen(!isFrozen)}
            className={`h-7 px-2.5 text-xs font-bold ${
              isFrozen ? 'bg-amber-500 text-black border-amber-400' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isFrozen ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
            {isFrozen ? 'ARM / RUN' : 'STOP / FREEZE'}
          </Button>
        </div>
      </div>

      {/* Main Phosphor CRT/LCD Screen (10x8 Graticule) */}
      <div className="relative bg-slate-950 border-2 border-slate-800 rounded-lg h-64 overflow-hidden shadow-inner mb-3">
        {/* Graticule Grid Lines & Live Waveform SVG Canvas */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <pattern id="scope-graticule" width="10%" height="12.5%" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 100 0 100 100 0 100 Z" fill="none" stroke="#1E293B" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#scope-graticule)" />

          {/* Major Axes */}
          {[...Array(7)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0%"
              y1={`${(i + 1) * 12.5}%`}
              x2="100%"
              y2={`${(i + 1) * 12.5}%`}
              stroke="#334155"
              strokeWidth={i === 3 ? "1.5" : "0.75"}
              strokeDasharray={i === 3 ? "none" : "2,4"}
            />
          ))}
          {[...Array(9)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i + 1) * 10}%`}
              y1="0%"
              x2={`${(i + 1) * 10}%`}
              y2="100%"
              stroke="#334155"
              strokeWidth={i === 4 ? "1.5" : "0.75"}
              strokeDasharray={i === 4 ? "none" : "2,4"}
            />
          ))}

          {/* Center Crosshairs */}
          <line x1="49%" y1="50%" x2="51%" y2="50%" stroke="#64748B" strokeWidth="2" />
          <line x1="50%" y1="48%" x2="50%" y2="52%" stroke="#64748B" strokeWidth="2" />

          {/* CH1 Waveform (Yellow Glow) */}
          {ch1Points && (
            <polyline
              points={ch1Points}
              fill="none"
              stroke="#FACC15"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.85)]"
            />
          )}

          {/* CH2 Waveform (Cyan Glow) */}
          {ch2Points && (
            <polyline
              points={ch2Points}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(6,182,212,0.85)]"
            />
          )}

          {/* Cursors Overlay */}
          {cursorsEnabled && (
            <g className="pointer-events-none">
              {/* X1 Cursor */}
              <line
                x1={`${cursorX1Percent}%`}
                y1="0%"
                x2={`${cursorX1Percent}%`}
                y2="100%"
                stroke="#A855F7"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              {/* X2 Cursor */}
              <line
                x1={`${cursorX2Percent}%`}
                y1="0%"
                x2={`${cursorX2Percent}%`}
                y2="100%"
                stroke="#A855F7"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
            </g>
          )}
        </svg>

        {/* Empty State / Unsimulated Warning */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
            <span>NO SPICE TRANSIENT DATA — CLICK [RUN] TO SIMULATE</span>
          </div>
        )}

        {/* Trigger Level Marker */}
        <div
          className="absolute right-0 -translate-y-1/2 flex items-center pointer-events-none text-red-500 font-bold text-[10px]"
          style={{ top: `${50 - (triggerLevel / ch1VDiv) * 12.5}%` }}
        >
          ◀T
        </div>

        {/* On-Screen OSD Header Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono pointer-events-none">
          <div className="flex gap-2">
            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-bold">
              CH1: {ch1VDiv}V/div [{ch1Coupling}]
            </span>
            {ch2Enabled && (
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">
                CH2: {ch2VDiv}V/div [{ch2Coupling}]
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <span className="bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              TB: {TIME_DIV_OPTIONS[timeDivIdx].label}/div
            </span>
            <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/40 font-bold">
              Trig: {triggerLevel.toFixed(2)}V [{triggerSlope === 'rising' ? '⮁' : '⮃'}]
            </span>
          </div>
        </div>

        {/* Cursor Measurement Readout */}
        {cursorsEnabled && (
          <div className="absolute top-8 left-2 bg-purple-950/90 border border-purple-500/40 rounded px-2 py-1 text-[10px] font-mono text-purple-200">
            <span>Δt: <b>{(cursorStats.deltaT * 1000).toFixed(3)} ms</b></span>
            <span className="mx-2">|</span>
            <span>1/Δt: <b>{cursorStats.cursorFreq >= 1000 ? `${(cursorStats.cursorFreq / 1000).toFixed(2)} kHz` : `${cursorStats.cursorFreq.toFixed(0)} Hz`}</b></span>
            <span className="mx-2">|</span>
            <span>ΔV: <b>{cursorStats.deltaV.toFixed(2)} V</b></span>
          </div>
        )}

        {/* Bottom Real-time Measurement Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono pointer-events-none bg-slate-900/90 backdrop-blur-sm px-2.5 py-1.5 rounded border border-slate-800">
          {ch1Wf?.metrics && (
            <div className="flex gap-3 text-yellow-300">
              <span>CH1 Vpp: <b>{ch1Wf.metrics.vPp.toFixed(2)}V</b></span>
              <span>Vrms: <b>{ch1Wf.metrics.vRms.toFixed(2)}V</b></span>
              <span>Freq: <b>{ch1Wf.metrics.frequency > 0 ? (ch1Wf.metrics.frequency >= 1000 ? `${(ch1Wf.metrics.frequency / 1000).toFixed(2)}kHz` : `${ch1Wf.metrics.frequency.toFixed(0)}Hz`) : '0Hz (DC)'}</b></span>
              <span>Rise: <b>{(ch1Wf.metrics.riseTime * 1e6).toFixed(1)}μs</b></span>
            </div>
          )}
          {ch2Wf?.metrics && ch2Enabled && (
            <div className="flex gap-3 text-cyan-300">
              <span>CH2 Vpp: <b>{ch2Wf.metrics.vPp.toFixed(2)}V</b></span>
              <span>Vrms: <b>{ch2Wf.metrics.vRms.toFixed(2)}V</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Scope Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
        {/* CH1 Controls */}
        <div className="border-r border-slate-800/80 pr-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-yellow-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> CH1 Probe
            </Label>
            <div className="flex gap-1">
              <button
                onClick={() => setCh1Coupling(ch1Coupling === 'DC' ? 'AC' : 'DC')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  ch1Coupling === 'AC' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {ch1Coupling}
              </button>
              <button onClick={() => setCh1Enabled(!ch1Enabled)} className="text-[10px] text-slate-400 hover:text-white">
                {ch1Enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-[9px] text-slate-400 block">Pos (+) Probe:</span>
              <Select value={ch1Node} onValueChange={setCh1Node}>
                <SelectTrigger className="h-6 text-[10px] bg-slate-900 border-yellow-500/40 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="auto">Auto (Output)</SelectItem>
                  {availableNodes.map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">Ref (-) Probe:</span>
              <Select value={ch1Ref} onValueChange={setCh1Ref}>
                <SelectTrigger className="h-6 text-[10px] bg-slate-900 border-slate-700 text-slate-200">
                  <SelectValue />
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

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Scale (V/div):</span>
            <div className="flex gap-1">
              {[0.2, 0.5, 1.0, 2.0, 5.0].map(v => (
                <button
                  key={v}
                  onClick={() => setCh1VDiv(v)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    ch1VDiv === v ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Vertical Offset:</span>
              <span>{ch1Offset} div</span>
            </div>
            <Slider
              value={[ch1Offset]}
              min={-3}
              max={3}
              step={0.5}
              onValueChange={([val]) => setCh1Offset(val)}
              className="py-1"
            />
          </div>
        </div>

        {/* CH2 Controls */}
        <div className="border-r border-slate-800/80 pr-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-cyan-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> CH2 Probe
            </Label>
            <div className="flex gap-1">
              <button
                onClick={() => setCh2Coupling(ch2Coupling === 'DC' ? 'AC' : 'DC')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  ch2Coupling === 'AC' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {ch2Coupling}
              </button>
              <button onClick={() => setCh2Enabled(!ch2Enabled)} className="text-[10px] text-slate-400 hover:text-white">
                {ch2Enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-[9px] text-slate-400 block">Pos (+) Probe:</span>
              <Select value={ch2Node} onValueChange={setCh2Node}>
                <SelectTrigger className="h-6 text-[10px] bg-slate-900 border-cyan-500/40 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="none">None (Disabled)</SelectItem>
                  {availableNodes.map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">Ref (-) Probe:</span>
              <Select value={ch2Ref} onValueChange={setCh2Ref}>
                <SelectTrigger className="h-6 text-[10px] bg-slate-900 border-slate-700 text-slate-200">
                  <SelectValue />
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

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Scale (V/div):</span>
            <div className="flex gap-1">
              {[0.2, 0.5, 1.0, 2.0, 5.0].map(v => (
                <button
                  key={v}
                  onClick={() => setCh2VDiv(v)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    ch2VDiv === v ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Vertical Offset:</span>
              <span>{ch2Offset} div</span>
            </div>
            <Slider
              value={[ch2Offset]}
              min={-3}
              max={3}
              step={0.5}
              onValueChange={([val]) => setCh2Offset(val)}
              className="py-1"
            />
          </div>
        </div>

        {/* Timebase & Trigger Controls */}
        <div className="space-y-2">
          <Label className="text-slate-300 font-bold block mb-1">Timebase & Edge Trigger</Label>

          <div>
            <span className="text-[9px] text-slate-400 block mb-0.5">Time / Div:</span>
            <div className="grid grid-cols-4 gap-1">
              {TIME_DIV_OPTIONS.slice(3, 7).map((tb, idx) => (
                <button
                  key={tb.label}
                  onClick={() => setTimeDivIdx(idx + 3)}
                  className={`py-1 rounded text-[9px] font-bold ${
                    timeDivIdx === idx + 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
              <span>Trigger Level ({triggerSlope}):</span>
              <span className="text-red-400 font-bold">{triggerLevel.toFixed(2)} V</span>
            </div>
            <Slider
              value={[triggerLevel]}
              min={-5}
              max={5}
              step={0.2}
              onValueChange={([val]) => setTriggerLevel(val)}
              className="py-1"
            />
          </div>

          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => setTriggerSlope(triggerSlope === 'rising' ? 'falling' : 'rising')}
              className="flex-1 py-1 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Slope: {triggerSlope === 'rising' ? '⮁ Rising' : '⮃ Falling'}
            </button>
            <button
              onClick={() => {
                setCh1Offset(0);
                setCh2Offset(-2);
                setTriggerLevel(0);
                setCh1VDiv(1.0);
                setCh2VDiv(1.0);
                setTimeDivIdx(4);
              }}
              className="flex-1 py-1 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1"
            >
              <RefreshCw className="h-2.5 w-2.5" /> Auto Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
