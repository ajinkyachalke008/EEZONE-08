'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Activity,
  Zap,
  Radio,
  RotateCw,
  Tv,
  Sparkles,
  HardDrive
} from 'lucide-react';
import { AVRTelemetry } from '@/lib/embedded/avr-runner';

interface WokwiBoardProps {
  telemetry: AVRTelemetry | null;
  isRunning: boolean;
  onPotentiometerChange?: (pin: 'A0' | 'A1', value: number) => void;
}

export function WokwiBoard({ telemetry, isRunning, onPotentiometerChange }: WokwiBoardProps) {
  const [elementsLoaded, setElementsLoaded] = useState(false);
  const [potAngle, setPotAngle] = useState(150); // 0 to 300 degrees
  const [potVoltage, setPotVoltage] = useState(2.5); // 0 to 5V
  const [servoAngle, setServoAngle] = useState(90);
  const lcdRef = useRef<any>(null);

  // Load official Wokwi Web Components on client side
  useEffect(() => {
    import('@wokwi/elements').then(() => {
      setElementsLoaded(true);
    });
  }, []);

  const pin13State = telemetry?.pins['13'] ?? false;
  const pin9State = telemetry?.pins['9'] ?? false;
  const currentMillis = telemetry ? Math.round(telemetry.micros / 1000) : 0;

  // Update servo angle with PWM
  useEffect(() => {
    if (isRunning && pin9State) {
      setServoAngle((prev) => (prev >= 180 ? 0 : prev + 15));
    }
  }, [pin9State, isRunning]);

  // Update authentic Wokwi 1602 LCD screen text
  useEffect(() => {
    if (lcdRef.current && elementsLoaded) {
      try {
        const line1 = 'EE ZONE PRO LAB';
        const line2 = isRunning
          ? `V:${potVoltage.toFixed(2)}V ADC:${Math.round((potVoltage / 5) * 1023)}`
          : 'SYSTEM STANDBY';
        lcdRef.current.text = `${line1.padEnd(16, ' ')}${line2.padEnd(16, ' ')}`;
      } catch (e) {
        // Safe fallback
      }
    }
  }, [potVoltage, isRunning, elementsLoaded]);

  const handlePotAngleChange = (angle: number) => {
    setPotAngle(angle);
    const v = (angle / 300) * 5.0;
    setPotVoltage(v);
    onPotentiometerChange?.('A0', v);
  };

  return (
    <Card className="bg-slate-950/95 border-cyan-500/40 text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top Header Bar */}
      <CardHeader className="py-3 px-4 border-b border-slate-800/80 flex flex-row items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-white tracking-wide flex items-center gap-2">
              Authentic Wokwi Hardware Bench
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
                ATmega328P 16MHz
              </Badge>
            </CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 shadow-inner">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Clock: <strong className="text-cyan-400">{currentMillis} ms</strong></span>
          </span>
          <Badge className={isRunning ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'}>
            {isRunning ? '● 16MHz RUNNING' : '■ STOPPED'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Photorealistic Workbench Surface */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Main Photorealistic Arduino Uno R3 (Official Wokwi Vector Element) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#141B26] to-[#0A0E17] rounded-2xl border border-slate-800 shadow-2xl relative">
            <div className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider mb-4 uppercase flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Authentic ATmega328P Target Hardware
            </div>

            {/* Official Wokwi Arduino Uno Component */}
            <div className="transform scale-95 origin-center transition-transform flex items-center justify-center min-h-[300px]">
              {elementsLoaded ? (
                <wokwi-arduino-uno />
              ) : (
                <div className="text-xs font-mono text-slate-400 animate-pulse">
                  Initializing Wokwi Vector Hardware Model...
                </div>
              )}
            </div>
          </div>

          {/* Authentic Interactive Peripherals Bench */}
          <div className="lg:col-span-5 space-y-4">
            {/* Authentic 1602 Character LCD (Official Wokwi Element) */}
            <div className="p-4 bg-gradient-to-b from-[#141B26] to-[#0A0E17] rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                  <Tv className="h-3.5 w-3.5" /> HD44780 16x2 LCD DISPLAY
                </span>
                <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                  PARALLEL 4-BIT
                </Badge>
              </div>

              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center w-full overflow-hidden shadow-inner">
                {elementsLoaded ? (
                  <wokwi-lcd1602 ref={lcdRef} text="EE ZONE PRO LAB SYSTEM READY   " color="blue" />
                ) : (
                  <div className="h-20 flex items-center text-xs font-mono text-slate-500">Loading LCD...</div>
                )}
              </div>
            </div>

            {/* Authentic SG90 Micro Servo (Official Wokwi Element) */}
            <div className="p-4 bg-gradient-to-b from-[#141B26] to-[#0A0E17] rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 font-mono">
                  <RotateCw className="h-3.5 w-3.5" /> TOWERPRO SG90 SERVO
                </span>
                <Badge className="bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                  {servoAngle}° PWM (Pin 9)
                </Badge>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center shadow-inner">
                {elementsLoaded ? (
                  <wokwi-servo angle={servoAngle} />
                ) : (
                  <div className="h-20 flex items-center text-xs font-mono text-slate-500">Loading Servo...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real Hardware Instruments & Knobs Bar */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Authentic Wokwi Potentiometer & Dial Controls */}
          <div className="lg:col-span-6 p-4 bg-gradient-to-b from-[#141B26] to-[#0A0E17] rounded-2xl border border-slate-800 shadow-xl flex items-center gap-6">
            <div className="flex flex-col items-center">
              {elementsLoaded ? (
                <wokwi-potentiometer
                  value={potAngle}
                  max="300"
                  onInput={(e: any) => handlePotAngleChange(Number(e.target.value))}
                />
              ) : null}
              <span className="text-[10px] font-mono text-slate-400 mt-1 font-bold">10kΩ B-TAPER</span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300 font-mono">ANALOG POTENTIOMETER (A0)</span>
                <Badge className="bg-amber-500/20 text-amber-300 font-mono text-xs">
                  {potVoltage.toFixed(2)} V • {Math.round((potVoltage / 5.0) * 1023)} ADC
                </Badge>
              </div>
              <Slider
                value={[potAngle]}
                min={0}
                max={300}
                step={1}
                onValueChange={(val) => handlePotAngleChange(val[0])}
              />
              <p className="text-[11px] text-slate-400">
                Rotary carbon film potentiometer generating analog voltage for SAR ADC.
              </p>
            </div>
          </div>

          {/* Hardware Telemetry & Flash ROM/SRAM Allocation */}
          <div className="lg:col-span-6 p-4 bg-gradient-to-b from-[#141B26] to-[#0A0E17] rounded-2xl border border-slate-800 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between mb-2 font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-cyan-400" /> ATmega328P Silicon Telemetry
              </span>
              <span className="text-cyan-400">16.000 MHz Crystal</span>
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Flash Program Memory (32,768 Bytes)</span>
                  <span className="text-cyan-300 font-bold">1,452 B (4.4%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[4.4%] shadow-[0_0_8px_#06B6D4]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Internal SRAM Data Memory (2,048 Bytes)</span>
                  <span className="text-emerald-300 font-bold">184 B (9.0%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[9.0%] shadow-[0_0_8px_#10B981]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
