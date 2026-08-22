'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Binary,
  Layers,
  Activity,
  ArrowLeft,
  Sparkles,
  Zap,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { DipIcPinout } from '@/components/digital/dip-ic-pinout';
import { LogicTimingAnalyzer } from '@/components/digital/logic-timing-analyzer';

interface LogicGateDef {
  id: string;
  name: string;
  icCode: string;
  inputs: number;
  fn: (inputs: boolean[]) => boolean;
  description: string;
}

const GATES: LogicGateDef[] = [
  { id: 'and', name: 'AND Gate', icCode: '7408', inputs: 2, fn: (i) => i[0] && i[1], description: 'Output is HIGH only when all inputs are HIGH.' },
  { id: 'or', name: 'OR Gate', icCode: '7432', inputs: 2, fn: (i) => i[0] || i[1], description: 'Output is HIGH when at least one input is HIGH.' },
  { id: 'nand', name: 'NAND Gate', icCode: '7400', inputs: 2, fn: (i) => !(i[0] && i[1]), description: 'Universal gate: Inverted AND output.' },
  { id: 'nor', name: 'NOR Gate', icCode: '7402', inputs: 2, fn: (i) => !(i[0] || i[1]), description: 'Universal gate: Inverted OR output.' },
  { id: 'xor', name: 'XOR Gate', icCode: '7486', inputs: 2, fn: (i) => Boolean((i[0] ? 1 : 0) ^ (i[1] ? 1 : 0)), description: 'Exclusive OR: HIGH when odd number of inputs are HIGH.' },
  { id: 'not', name: 'NOT Inverter', icCode: '7404', inputs: 1, fn: (i) => !i[0], description: 'Inverts the digital logic level.' }
];

export default function DigitalLogicLabPage() {
  const [selectedGate, setSelectedGate] = useState<LogicGateDef>(GATES[0]);
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);

  const currentOutput = selectedGate.inputs === 1 ? selectedGate.fn([inputA]) : selectedGate.fn([inputA, inputB]);

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
                <Binary className="h-6 w-6 text-purple-400" />
                Digital Logic & Hardware Synthesis Lab
              </h1>
              <p className="text-xs text-slate-400">
                74xx TTL Logic Series • DIP-14 Package Pinouts • 4-Channel Timing Analyzer • Dynamic Truth Tables
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Left Column: TTL IC Catalog & DIP Pinout */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-400">
                <Layers className="h-4 w-4" /> 74xx TTL Logic Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {GATES.map((gate) => (
                <div
                  key={gate.id}
                  onClick={() => setSelectedGate(gate)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedGate.id === gate.id
                      ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{gate.name}</span>
                    <Badge className="bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                      IC {gate.icCode}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{gate.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 14-Pin DIP IC Pinout */}
          <DipIcPinout
            icCode={selectedGate.icCode}
            name={selectedGate.name}
            activeInputA={inputA}
            activeInputB={inputB}
            activeOutput={currentOutput}
          />
        </div>

        {/* Right Column: Interactive Gate Workbench, Analyzer & Truth Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Gate Workbench */}
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-sm font-bold">
                  {selectedGate.name} (TTL 74{selectedGate.icCode.substring(2)}) Workbench
                </CardTitle>
              </div>
              <Badge className={currentOutput ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400'}>
                OUTPUT: {currentOutput ? 'LOGIC 1 (5.0V)' : 'LOGIC 0 (0.0V)'}
              </Badge>
            </CardHeader>

            <CardContent className="p-8 flex flex-col items-center justify-center">
              <div className="flex items-center gap-8 my-4 select-none">
                {/* Inputs Toggle Column */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-300">Input A:</span>
                    <Button
                      size="sm"
                      onClick={() => setInputA(!inputA)}
                      className={`font-mono text-xs w-20 font-bold ${
                        inputA ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_#10B981]' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {inputA ? '1 (HIGH)' : '0 (LOW)'}
                    </Button>
                  </div>

                  {selectedGate.inputs > 1 && (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-300">Input B:</span>
                      <Button
                        size="sm"
                        onClick={() => setInputB(!inputB)}
                        className={`font-mono text-xs w-20 font-bold ${
                          inputB ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_#10B981]' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {inputB ? '1 (HIGH)' : '0 (LOW)'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Gate Symbol Card */}
                <div className="p-6 bg-slate-950 rounded-2xl border-2 border-purple-500/50 shadow-2xl flex flex-col items-center justify-center min-w-[160px]">
                  <span className="text-3xl font-black text-purple-300 mb-1">{selectedGate.id.toUpperCase()}</span>
                  <span className="text-[10px] font-mono text-slate-400">74{selectedGate.icCode.substring(2)}</span>
                </div>

                {/* Output Indicator LED */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center font-mono font-black text-base ${
                      currentOutput
                        ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_35px_#10B981] scale-110'
                        : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-700'
                    }`}
                  >
                    {currentOutput ? '1' : '0'}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">Output LED (Y)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Channel Logic Timing Analyzer */}
          <LogicTimingAnalyzer
            inputA={inputA}
            inputB={inputB}
            outputY={currentOutput}
            gateName={selectedGate.name}
          />

          {/* Real-time Dynamic Truth Table */}
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800 bg-slate-950/60">
              <CardTitle className="text-xs font-bold font-mono text-slate-300">
                DYNAMIC TRUTH TABLE (IC {selectedGate.icCode})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <table className="w-full text-center font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 pb-1">
                    <th className="py-1">Input A</th>
                    {selectedGate.inputs > 1 && <th className="py-1">Input B</th>}
                    <th className="py-1 text-purple-400">Output Y ({selectedGate.name})</th>
                    <th className="py-1">State</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGate.inputs === 1
                    ? [false, true].map((a, idx) => {
                        const out = selectedGate.fn([a]);
                        const isActive = a === inputA;
                        return (
                          <tr key={idx} className={`border-b border-slate-900 ${isActive ? 'bg-purple-500/20 font-bold' : ''}`}>
                            <td className="py-1.5">{a ? '1' : '0'}</td>
                            <td className="py-1.5 text-emerald-400 font-bold">{out ? '1' : '0'}</td>
                            <td className="py-1.5">{isActive ? <Badge className="text-[9px] bg-purple-500/30 text-purple-200">ACTIVE</Badge> : '-'}</td>
                          </tr>
                        );
                      })
                    : [
                        [false, false],
                        [false, true],
                        [true, false],
                        [true, true]
                      ].map(([a, b], idx) => {
                        const out = selectedGate.fn([a, b]);
                        const isActive = a === inputA && b === inputB;
                        return (
                          <tr key={idx} className={`border-b border-slate-900 ${isActive ? 'bg-purple-500/20 font-bold' : ''}`}>
                            <td className="py-1.5">{a ? '1' : '0'}</td>
                            <td className="py-1.5">{b ? '1' : '0'}</td>
                            <td className="py-1.5 text-emerald-400 font-bold">{out ? '1' : '0'}</td>
                            <td className="py-1.5">{isActive ? <Badge className="text-[9px] bg-purple-500/30 text-purple-200">ACTIVE</Badge> : '-'}</td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
