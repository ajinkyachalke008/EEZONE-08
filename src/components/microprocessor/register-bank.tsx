'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Flag, Binary, Activity } from 'lucide-react';
import { I8085State } from '@/lib/microprocessor/i8085-cpu';

interface RegisterBankProps {
  state: I8085State;
}

export function RegisterBank({ state }: RegisterBankProps) {
  const toHex8 = (n: number) => (n & 0xFF).toString(16).toUpperCase().padStart(2, '0') + 'H';
  const toHex16 = (n: number) => (n & 0xFFFF).toString(16).toUpperCase().padStart(4, '0') + 'H';
  const toBin8 = (n: number) => (n & 0xFF).toString(2).padStart(8, '0');

  return (
    <Card className="bg-slate-950/80 border-cyan-500/30 text-white backdrop-blur-md shadow-2xl">
      <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <CardTitle className="text-xs font-bold font-mono tracking-wider text-cyan-300">
            INTEL 8085 CPU REGISTERS & PSW
          </CardTitle>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
          Cycles: {state.cycles}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 font-mono text-xs">
        {/* Main Accumulator A */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-500/40 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
              Accumulator (A)
            </span>
            <span className="text-xl font-black text-white">{toHex8(state.A)}</span>
            <span className="text-[10px] text-slate-400 ml-2 font-mono">({toBin8(state.A)}₂ • {state.A}₁₀)</span>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs px-2.5 py-1">
            8-Bit Primary ALU
          </Badge>
        </div>

        {/* General Purpose Registers B, C, D, E, H, L */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Pair BC */}
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="text-[10px] text-indigo-400 font-bold mb-1 flex justify-between">
              <span>BC REGISTER PAIR</span>
              <span>{toHex16((state.B << 8) | state.C)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex-1 bg-slate-950 p-1.5 rounded text-center border border-slate-800">
                <span className="text-[9px] text-slate-400 block">B</span>
                <span className="font-bold text-white text-sm">{toHex8(state.B)}</span>
              </div>
              <div className="flex-1 bg-slate-950 p-1.5 rounded text-center border border-slate-800">
                <span className="text-[9px] text-slate-400 block">C</span>
                <span className="font-bold text-white text-sm">{toHex8(state.C)}</span>
              </div>
            </div>
          </div>

          {/* Pair DE */}
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="text-[10px] text-emerald-400 font-bold mb-1 flex justify-between">
              <span>DE REGISTER PAIR</span>
              <span>{toHex16((state.D << 8) | state.E)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex-1 bg-slate-950 p-1.5 rounded text-center border border-slate-800">
                <span className="text-[9px] text-slate-400 block">D</span>
                <span className="font-bold text-white text-sm">{toHex8(state.D)}</span>
              </div>
              <div className="flex-1 bg-slate-950 p-1.5 rounded text-center border border-slate-800">
                <span className="text-[9px] text-slate-400 block">E</span>
                <span className="font-bold text-white text-sm">{toHex8(state.E)}</span>
              </div>
            </div>
          </div>

          {/* Pair HL (Memory Pointer M) */}
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 col-span-2">
            <div className="text-[10px] text-amber-400 font-bold mb-1 flex justify-between">
              <span>HL PAIR (MEMORY POINTER M)</span>
              <span>ADDR: {toHex16((state.H << 8) | state.L)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex-1 bg-slate-950 p-1.5 rounded text-center border border-slate-800">
                <span className="text-[9px] text-slate-400 block">H</span>
                <span className="font-bold text-white text-sm">{toHex8(state.H)}</span>
              </div>
              <div className="flex-1 bg-slate-950 p-1.5 rounded text-center border border-slate-800">
                <span className="text-[9px] text-slate-400 block">L</span>
                <span className="font-bold text-white text-sm">{toHex8(state.L)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 16-Bit Program Counter & Stack Pointer */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold">PROGRAM COUNTER (PC)</span>
            <span className="text-sm font-bold text-cyan-400">{toHex16(state.PC)}</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold">STACK POINTER (SP)</span>
            <span className="text-sm font-bold text-purple-400">{toHex16(state.SP)}</span>
          </div>
        </div>

        {/* Flag Register (PSW Flags) */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-300">
            <Flag className="h-3.5 w-3.5 text-amber-400" />
            <span>FLAG REGISTER (PSW)</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[
              { label: 'S (Sign)', active: state.flags.S },
              { label: 'Z (Zero)', active: state.flags.Z },
              { label: 'AC (Aux)', active: state.flags.AC },
              { label: 'P (Parity)', active: state.flags.P },
              { label: 'CY (Carry)', active: state.flags.CY }
            ].map((f) => (
              <div
                key={f.label}
                className={`p-1.5 rounded border transition-all ${
                  f.active
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[9px]">{f.label.split(' ')[0]}</div>
                <div className="text-xs font-bold">{f.active ? '1' : '0'}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
