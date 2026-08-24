'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  Cpu,
  Zap,
  Activity,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  RotateCw,
  Sparkles,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { InteractiveBreadboard } from '@/components/breadboard/interactive-breadboard';
import { WokwiBoard } from '@/components/embedded/wokwi-board';
import { InteractiveOscilloscope } from '@/components/circuit/interactive-oscilloscope';
import { MeasurementBus } from '@/lib/measurement-bus';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

type DMMMode = 'DCV' | 'ACV' | 'OHM' | 'DCI' | 'DIODE' | 'FREQ';

export default function UnifiedLabBenchPage() {
  const [activeTarget, setActiveTarget] = useState<'breadboard' | 'arduino'>('breadboard');
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.getIsMuted());
  const [measurementBus] = useState<MeasurementBus>(() => new MeasurementBus());
  const [dmmMode, setDmmMode] = useState<DMMMode>('DCV');
  const [dmmValue, setDmmValue] = useState('+05.0024');
  const [dmmUnit, setDmmUnit] = useState('VDC');
  const [dmmSubtitle, setDmmSubtitle] = useState('DC VOLTAGE AUTO RANGE');
  const [dmmRange, setDmmRange] = useState('10.000V Range');
  const [dmmImpedance, setDmmImpedance] = useState('10 GΩ Impedance');

  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundEngine.setMuted(next);
    soundEngine.playKeyClick();
  };

  const handleDmmMode = (mode: DMMMode) => {
    soundEngine.playKeyClick();
    setDmmMode(mode);
    switch (mode) {
      case 'DCV':
        setDmmValue('+05.0024');
        setDmmUnit('VDC');
        setDmmSubtitle('DC VOLTAGE AUTO RANGE');
        setDmmRange('10.000V Range');
        setDmmImpedance('10 GΩ Impedance');
        break;
      case 'ACV':
        setDmmValue('230.142');
        setDmmUnit('VAC');
        setDmmSubtitle('TRUE RMS AC VOLTAGE');
        setDmmRange('750.00V Range');
        setDmmImpedance('1 MΩ || 100pF');
        break;
      case 'OHM':
        setDmmValue('09.9842');
        setDmmUnit('kΩ');
        setDmmSubtitle('2-WIRE RESISTANCE');
        setDmmRange('100.00kΩ Range');
        setDmmImpedance('100µA Test Current');
        break;
      case 'DCI':
        setDmmValue('+01.2480');
        setDmmUnit('ADC');
        setDmmSubtitle('DC CURRENT');
        setDmmRange('3.0000A Range');
        setDmmImpedance('0.05Ω Shunt');
        break;
      case 'DIODE':
        setDmmValue('00.6521');
        setDmmUnit('V');
        setDmmSubtitle('DIODE CONTINUITY TEST');
        setDmmRange('1.0000V Range');
        setDmmImpedance('1mA Current Source');
        break;
      case 'FREQ':
        setDmmValue('050.002');
        setDmmUnit('Hz');
        setDmmSubtitle('FREQUENCY COUNTER');
        setDmmRange('100.000kHz Range');
        setDmmImpedance('AC Coupled');
        break;
    }
  };

  // Micro-fluctuation simulation for realistic 6.5-digit meter reading
  useEffect(() => {
    const interval = setInterval(() => {
      setDmmValue((prev) => {
        const num = parseFloat(prev);
        if (isNaN(num)) return prev;
        const jitter = (Math.random() - 0.5) * 0.0006;
        const updated = (num + jitter).toFixed(4);
        return num >= 0 && prev.startsWith('+') ? `+${updated.padStart(7, '0')}` : updated;
      });
    }, 750);
    return () => clearInterval(interval);
  }, [dmmMode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/tools/circuit-simulator">
              <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Circuit CAD
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <LayoutDashboard className="h-6 w-6 text-cyan-400" />
                Master Virtual Lab Bench & Multi-Instrument Studio
              </h1>
              <p className="text-xs text-slate-400">
                All-in-One Engineering Workstation • 830-Point Breadboard • DSO • DMM • Web Audio Physics Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className={`border-slate-700 font-mono text-xs ${
                isAudioMuted ? 'text-slate-500' : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
              }`}
            >
              {isAudioMuted ? <VolumeX className="h-4 w-4 mr-1.5" /> : <Volume2 className="h-4 w-4 mr-1.5" />}
              {isAudioMuted ? 'Acoustic Engine Muted' : 'Acoustic Engine Active'}
            </Button>
            <Link href="/tools/lab-experiments">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
                <GraduationCap className="h-4 w-4 mr-1.5" /> Open Lab Experiments Manuals
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workstation */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Target Hardware Canvas */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs value={activeTarget} onValueChange={(v: any) => setActiveTarget(v)} className="space-y-4">
            <TabsList className="bg-slate-900 border border-slate-800 p-1">
              <TabsTrigger value="breadboard" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-bold">
                🔌 830-Point Solderless Breadboard
              </TabsTrigger>
              <TabsTrigger value="arduino" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold">
                🤖 Wokwi Arduino Uno Bench
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breadboard" className="space-y-4">
              <InteractiveBreadboard />
            </TabsContent>

            <TabsContent value="arduino" className="space-y-4">
              <WokwiBoard telemetry={null} isRunning={true} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Stacked Benchtop Test Instruments */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4-Channel Digital Storage Oscilloscope (DSO) */}
          <InteractiveOscilloscope
            bus={measurementBus}
            nodes={['Node_A', 'Node_B', 'Output_Y']}
            triggerSim={() => {}}
          />

          {/* Precision 6.5-Digit True-RMS Benchtop Digital Multimeter */}
          <Card className="bg-gradient-to-b from-[#1C222D] to-[#0E1218] border-2 border-slate-700 text-white shadow-2xl rounded-2xl overflow-hidden select-none">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <span className="text-xs font-mono font-black text-amber-400 tracking-wider">
                KEYSIGHT 34461A 6.5-DIGIT TRUE-RMS DMM
              </span>
              <Badge className="bg-amber-500/20 text-amber-300 text-[9px] font-mono">
                1000V CAT II
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* High-Contrast Vacuum Fluorescent Style Display (VFD) */}
              <div className="p-4 bg-[#051A15] rounded-xl border-2 border-emerald-950 shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-emerald-500 font-bold block uppercase">
                    {dmmSubtitle}
                  </span>
                  <span className="font-mono text-3xl font-black text-emerald-400 tracking-wider shadow-[0_0_15px_#10B981]">
                    {dmmValue} <span className="text-sm font-normal text-emerald-300">{dmmUnit}</span>
                  </span>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  <div>{dmmRange}</div>
                  <div className="text-emerald-400 font-bold">{dmmImpedance}</div>
                </div>
              </div>

              {/* Function Buttons */}
              <div className="grid grid-cols-6 gap-1.5 font-mono text-xs font-bold">
                {[
                  { key: 'DCV', label: 'DCV' },
                  { key: 'ACV', label: 'ACV' },
                  { key: 'OHM', label: '2W Ω' },
                  { key: 'DCI', label: 'DCI' },
                  { key: 'DIODE', label: 'DIODE' },
                  { key: 'FREQ', label: 'FREQ' }
                ].map((item) => (
                  <Button
                    key={item.key}
                    size="sm"
                    onClick={() => handleDmmMode(item.key as DMMMode)}
                    variant={dmmMode === item.key ? 'default' : 'secondary'}
                    className={`h-8 text-[10px] ${
                      dmmMode === item.key
                        ? 'bg-amber-500 text-black hover:bg-amber-400 font-black shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
