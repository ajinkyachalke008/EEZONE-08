'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Terminal, Radio, Play, StepForward, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { I8085State } from '@/lib/microprocessor/i8085-cpu';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

interface TrainerKitPanelProps {
  state: I8085State;
  memory: Uint8Array;
  onStep: () => void;
  onRun: () => void;
  onReset: () => void;
  onAddressChange: (addr: number) => void;
  onMemoryWrite: (addr: number, val: number) => void;
  onInterrupt?: (type: 'TRAP' | 'RST75' | 'RST65' | 'RST55' | 'INTR') => void;
}

export function TrainerKitPanel({
  state,
  memory,
  onStep,
  onRun,
  onReset,
  onAddressChange,
  onMemoryWrite
}: TrainerKitPanelProps) {
  const [currentAddress, setCurrentAddress] = useState(0x0800);
  const [inputBuffer, setInputBuffer] = useState('');
  const [mode, setMode] = useState<'ADDRESS' | 'DATA'>('ADDRESS');
  const [wokwiLoaded, setWokwiLoaded] = useState(false);

  useEffect(() => {
    import('@wokwi/elements').then(() => {
      setWokwiLoaded(true);
    });
  }, []);

  const toHex4 = (n: number) => (n & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  const toHex2 = (n: number) => (n & 0xFF).toString(16).toUpperCase().padStart(2, '0');
  const toBin16 = (n: number) => (n & 0xFFFF).toString(2).padStart(16, '0');
  const toBin8 = (n: number) => (n & 0xFF).toString(2).padStart(8, '0');

  const currentData = memory[currentAddress] || 0;
  const addrHex = toHex4(currentAddress);
  const dataHex = toHex2(currentData);

  const handleKeypadPress = (key: string) => {
    soundEngine.playKeyClick();
    if (key >= '0' && key <= 'F') {
      const newBuf = (inputBuffer + key).slice(-4);
      setInputBuffer(newBuf);
      const parsed = parseInt(newBuf, 16);
      if (!isNaN(parsed)) {
        if (mode === 'ADDRESS') {
          setCurrentAddress(parsed);
          onAddressChange(parsed);
        } else {
          onMemoryWrite(currentAddress, parsed & 0xFF);
        }
      }
    } else if (key === 'NEXT') {
      const next = (currentAddress + 1) & 0xFFFF;
      setCurrentAddress(next);
      setInputBuffer('');
      onAddressChange(next);
    } else if (key === 'PREV') {
      const prev = (currentAddress - 1) & 0xFFFF;
      setCurrentAddress(prev);
      setInputBuffer('');
      onAddressChange(prev);
    } else if (key === 'MEM') {
      setMode('DATA');
      setInputBuffer('');
    } else if (key === 'ADDR') {
      setMode('ADDRESS');
      setInputBuffer('');
    }
  };

  return (
    <Card className="bg-[#121A15] border-2 border-emerald-800/80 text-white backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* Phenolic Green Hardware Faceplate Header */}
      <CardHeader className="py-3 px-4 border-b border-emerald-900/80 flex flex-row items-center justify-between bg-gradient-to-r from-[#0E1712] via-[#14231B] to-[#0E1712]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-emerald-300 font-mono tracking-widest uppercase">
              DYNA-85 HARDWARE TRAINER CONSOLE
            </CardTitle>
            <span className="text-[10px] font-mono text-emerald-500/80">INTEL 8085AH-2 (3.072 MHz CLK)</span>
          </div>
        </div>

        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono text-[10px]">
          REAL HARDWARE BUS
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Genuine 6-Digit 7-Segment LED Display Unit (Wokwi 7-Segment Elements) */}
        <div className="p-6 bg-[#080B09] rounded-2xl border-4 border-emerald-950 shadow-[inset_0_5px_30px_rgba(0,0,0,0.95)] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 4-Digit Address Display */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-rose-500 font-bold tracking-widest uppercase mb-2">
              ADDRESS BUS (A15 - A0)
            </span>
            <div className="flex gap-2 p-2 bg-black/80 rounded-xl border border-rose-950/60 shadow-inner">
              {wokwiLoaded ? (
                <>
                  <wokwi-7segment value={parseInt(addrHex[0], 16)} color="red" />
                  <wokwi-7segment value={parseInt(addrHex[1], 16)} color="red" />
                  <wokwi-7segment value={parseInt(addrHex[2], 16)} color="red" />
                  <wokwi-7segment value={parseInt(addrHex[3], 16)} color="red" />
                </>
              ) : (
                <span className="font-mono text-3xl text-rose-500 font-black tracking-widest px-4">{addrHex}</span>
              )}
            </div>
          </div>

          {/* Mode Annunciator */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-500">EXAMINE</span>
            <Badge className={mode === 'ADDRESS' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono' : 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono'}>
              {mode === 'ADDRESS' ? 'ADDR [16-BIT]' : 'DATA [8-BIT]'}
            </Badge>
          </div>

          {/* 2-Digit Data Display */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-rose-500 font-bold tracking-widest uppercase mb-2">
              DATA BUS (D7 - D0)
            </span>
            <div className="flex gap-2 p-2 bg-black/80 rounded-xl border border-rose-950/60 shadow-inner">
              {wokwiLoaded ? (
                <>
                  <wokwi-7segment value={parseInt(dataHex[0], 16)} color="red" />
                  <wokwi-7segment value={parseInt(dataHex[1], 16)} color="red" />
                </>
              ) : (
                <span className="font-mono text-3xl text-rose-500 font-black tracking-widest px-4">{dataHex}</span>
              )}
            </div>
          </div>
        </div>

        {/* Binary Bus LED Activity Monitor */}
        <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
          {/* 16-bit Address Bus LEDs */}
          <div className="p-3.5 bg-black/60 rounded-xl border border-emerald-900/60 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                16-Bit Demultiplexed Address Bus (A15-A0)
              </span>
              <span className="text-[10px] text-slate-500">0x{addrHex}</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {toBin16(currentAddress).split('').map((bit, idx) => (
                <div
                  key={idx}
                  className={`h-5 rounded flex items-center justify-center text-[9px] font-black transition-all ${
                    bit === '1'
                      ? 'bg-cyan-400 text-black shadow-[0_0_10px_#06B6D4] scale-105'
                      : 'bg-slate-950 text-slate-700 border border-slate-900'
                  }`}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>

          {/* 8-bit Data Bus LEDs */}
          <div className="p-3.5 bg-black/60 rounded-xl border border-emerald-900/60 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                8-Bit Bidirectional Data Bus (D7-D0)
              </span>
              <span className="text-[10px] text-slate-500">0x{dataHex}</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {toBin8(currentData).split('').map((bit, idx) => (
                <div
                  key={idx}
                  className={`h-5 rounded flex items-center justify-center text-[9px] font-black transition-all ${
                    bit === '1'
                      ? 'bg-emerald-400 text-black shadow-[0_0_10px_#10B981] scale-105'
                      : 'bg-slate-950 text-slate-700 border border-slate-900'
                  }`}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hardware Interrupt Pins (TRAP, RST 7.5, RST 6.5, RST 5.5, INTR) */}
        <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-900/60 flex items-center justify-between font-mono text-xs">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            HARDWARE INTERRUPT PINS:
          </span>
          <div className="flex gap-1.5">
            {[
              { id: 'TRAP', label: 'TRAP (0024H)', color: 'bg-rose-600 hover:bg-rose-500' },
              { id: 'RST75', label: 'RST 7.5 (003CH)', color: 'bg-amber-600 hover:bg-amber-500' },
              { id: 'RST65', label: 'RST 6.5 (0034H)', color: 'bg-indigo-600 hover:bg-indigo-500' },
              { id: 'RST55', label: 'RST 5.5 (002CH)', color: 'bg-teal-600 hover:bg-teal-500' }
            ].map((intPin) => (
              <Button
                key={intPin.id}
                size="sm"
                onClick={() => {
                  soundEngine.playRelaySnap();
                  onInterrupt?.(intPin.id as any);
                }}
                className={`h-7 px-2 text-[10px] font-black text-white ${intPin.color} border border-white/20 active:scale-95 shadow`}
              >
                {intPin.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Authentic Tactile Microswitch Keypad Panel */}
        <div className="p-5 bg-gradient-to-b from-[#0A100C] to-[#050806] rounded-2xl border-2 border-emerald-950 shadow-2xl">
          <div className="text-[10px] font-mono text-emerald-400 font-bold mb-3 uppercase tracking-widest flex justify-between">
            <span>TACTILE HEXADECIMAL INPUT MATRIX</span>
            <span className="text-amber-400">28 GOLD PLATED KEYS</span>
          </div>

          <div className="grid grid-cols-6 gap-2.5 font-mono text-sm font-black">
            {/* Row 1: C D E F ADDR MEM */}
            {['C', 'D', 'E', 'F', 'ADDR', 'MEM'].map((k) => (
              <Button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className="h-11 bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-amber-300 border border-slate-700 active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              >
                {k}
              </Button>
            ))}

            {/* Row 2: 8 9 A B NEXT PREV */}
            {['8', '9', 'A', 'B', 'NEXT', 'PREV'].map((k) => (
              <Button
                key={k}
                onClick={() => handleKeypadPress(k)}
                className="h-11 bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white border border-slate-700 active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              >
                {k}
              </Button>
            ))}

            {/* Row 3: 4 5 6 7 STEP GO */}
            {['4', '5', '6', '7', 'STEP', 'GO'].map((k) => (
              <Button
                key={k}
                onClick={() => {
                  if (k === 'STEP') onStep();
                  else if (k === 'GO') onRun();
                  else handleKeypadPress(k);
                }}
                className={`h-11 border active:scale-95 font-black shadow-[0_4px_10px_rgba(0,0,0,0.6)] ${
                  k === 'STEP'
                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white border-indigo-400'
                    : k === 'GO'
                    ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white border-emerald-400'
                    : 'bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white border-slate-700'
                }`}
              >
                {k}
              </Button>
            ))}

            {/* Row 4: 0 1 2 3 RST REG */}
            {['0', '1', '2', '3', 'RST', 'REG'].map((k) => (
              <Button
                key={k}
                onClick={() => {
                  if (k === 'RST') onReset();
                  else handleKeypadPress(k);
                }}
                className={`h-11 border active:scale-95 font-black shadow-[0_4px_10px_rgba(0,0,0,0.6)] ${
                  k === 'RST'
                    ? 'bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white border-rose-400'
                    : 'bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white border-slate-700'
                }`}
              >
                {k}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
