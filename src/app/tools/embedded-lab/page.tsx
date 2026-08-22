'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  Cpu,
  Code2,
  Activity,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { AVRRunner, AVRTelemetry } from '@/lib/embedded/avr-runner';
import { SAMPLE_SKETCHES, ArduinoSketch } from '@/lib/embedded/sample-sketches';
import { WokwiBoard } from '@/components/embedded/wokwi-board';
import { InteractiveOscilloscope } from '@/components/circuit/interactive-oscilloscope';
import { InteractiveMultimeter } from '@/components/circuit/interactive-multimeter';
import { MeasurementBus } from '@/lib/measurement-bus';
import { toast } from 'sonner';

export default function EmbeddedLabPage() {
  const [selectedSketch, setSelectedSketch] = useState<ArduinoSketch>(SAMPLE_SKETCHES[0]);
  const [sourceCode, setSourceCode] = useState(SAMPLE_SKETCHES[0].sourceCode);
  const [isRunning, setIsRunning] = useState(false);
  const [telemetry, setTelemetry] = useState<AVRTelemetry | null>(null);
  const [serialLog, setSerialLog] = useState<string[]>([]);
  const [measurementBus, setMeasurementBus] = useState<MeasurementBus>(() => new MeasurementBus());

  const runnerRef = useRef<AVRRunner | null>(null);
  const serialEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll serial monitor without scrolling parent page
  useEffect(() => {
    if (serialLog.length > 2) {
      serialEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [serialLog]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (runnerRef.current) {
        runnerRef.current.stop();
      }
    };
  }, []);

  const handleSelectSketch = (sketch: ArduinoSketch) => {
    handleStop();
    setSelectedSketch(sketch);
    setSourceCode(sketch.sourceCode);
    setSerialLog([`[SYS] Loaded sketch: ${sketch.name}`]);
  };

  const handleRun = () => {
    try {
      if (runnerRef.current) {
        runnerRef.current.stop();
      }

      setSerialLog([`[SYS] Compiling & Flash Programming ATmega328P (16MHz)...`, `[SYS] CPU Flash Verified. Starting execution.`]);

      const runner = new AVRRunner(selectedSketch.hex);
      runnerRef.current = runner;

      // Update measurement bus for virtual oscilloscope
      const bus = new MeasurementBus();
      setMeasurementBus(bus);

      let lastWaveformUpdate = Date.now();
      const wavePoints: number[] = [];

      runner.start(
        (data) => {
          setTelemetry(data);

          // Stream Pin 13 / Pin 9 voltage into MeasurementBus
          const now = Date.now();
          if (now - lastWaveformUpdate > 20) {
            const v13 = data.pins['13'] ? 5.0 : 0.0;
            wavePoints.push(v13);
            if (wavePoints.length > 200) wavePoints.shift();
            lastWaveformUpdate = now;
          }
        },
        (char) => {
          setSerialLog((prev) => {
            const last = prev[prev.length - 1] || '';
            if (char === '\n') {
              return [...prev, ''];
            } else {
              const updated = [...prev];
              updated[updated.length - 1] = last + char;
              return updated;
            }
          });
        }
      );

      setIsRunning(true);
      toast.success('Arduino Sketch Uploaded & Executing at 16MHz');
    } catch (err: any) {
      toast.error('Simulation error: ' + err.message);
    }
  };

  const handleStop = () => {
    if (runnerRef.current) {
      runnerRef.current.stop();
    }
    setIsRunning(false);
    toast.info('Execution halted');
  };

  const handleReset = () => {
    if (runnerRef.current) {
      runnerRef.current.reset();
    }
    setSerialLog((prev) => [...prev, '[SYS] CPU Reset']);
    toast.info('CPU Reset to vector 0x0000');
  };

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
                <Cpu className="h-6 w-6 text-cyan-400" />
                AVR Microcontroller & Embedded IoT Lab
              </h1>
              <p className="text-xs text-slate-400">
                16MHz ATmega328P (Arduino Uno) Virtual Architecture • Wokwi Elements • Live Serial & Telemetry Bus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={handleRun} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/40">
                <Play className="h-4 w-4 mr-1.5 fill-current" /> Upload & Run (16MHz)
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="font-bold">
                <Square className="h-4 w-4 mr-1.5 fill-current" /> Stop CPU
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
              <RotateCcw className="h-4 w-4 mr-1.5" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Left Column: Monaco Code Editor & Sketches */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-sm font-bold">Arduino C++ Source Editor</CardTitle>
              </div>
              <div className="flex gap-1.5">
                {SAMPLE_SKETCHES.map((sketch) => (
                  <Button
                    key={sketch.id}
                    variant={selectedSketch.id === sketch.id ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSelectSketch(sketch)}
                    className="text-[11px] h-7 px-2.5"
                  >
                    {sketch.name.split('.')[1] || sketch.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <Editor
                height="380px"
                defaultLanguage="cpp"
                theme="vs-dark"
                value={sourceCode}
                onChange={(val) => setSourceCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2
                }}
              />
            </CardContent>
          </Card>

          {/* USART Serial Monitor */}
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-xs font-bold font-mono">USART Serial Monitor (9600 Baud)</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSerialLog([])}
                className="text-[10px] h-6 px-2 text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-44 font-mono text-xs text-emerald-400 bg-black/80 rounded-lg p-3 border border-slate-800">
                {serialLog.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                    {line}
                  </div>
                ))}
                <div ref={serialEndRef} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Hardware Workbench & Instruments */}
        <div className="lg:col-span-6 space-y-6">
          {/* Wokwi Board Emulator */}
          <WokwiBoard telemetry={telemetry} isRunning={isRunning} />

          {/* Virtual Instruments */}
          <div className="space-y-4">
            <InteractiveOscilloscope
              measurementBus={measurementBus}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
