'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  StepForward,
  RotateCcw,
  Cpu,
  Code2,
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { Intel8085, I8085State } from '@/lib/microprocessor/i8085-cpu';
import { RegisterBank } from '@/components/microprocessor/register-bank';
import { MemoryGrid } from '@/components/microprocessor/memory-grid';
import { TrainerKitPanel } from '@/components/microprocessor/trainer-kit-panel';
import { toast } from 'sonner';

interface ProgramPreset {
  id: string;
  name: string;
  code: string;
  startAddr: number;
}

const PRESET_PROGRAMS: ProgramPreset[] = [
  {
    id: 'add8',
    name: '1. 8-Bit Addition',
    startAddr: 0x0800,
    code: `; 8-Bit Addition of Two Numbers
; A = 25H + 37H
MVI A, 25H    ; Load 25H into Accumulator
MVI B, 37H    ; Load 37H into Register B
ADD B         ; Add B to A (Result = 5CH)
STA 0900H     ; Store sum at memory 0900H
HLT           ; Terminate execution`
  },
  {
    id: 'block_transfer',
    name: '2. Block Memory Transfer',
    startAddr: 0x0800,
    code: `; Block Data Transfer (5 bytes from 0900H to 0A00H)
LXI H, 0900H  ; Source pointer
LXI D, 0A00H  ; Destination pointer
MVI C, 05H    ; Counter = 5
LOOP:
MOV A, M      ; Get byte from source
STAX D        ; Write byte to destination
INX H         ; Next source address
INX D         ; Next dest address
DCR C         ; Decrement counter
JNZ 0806H     ; Loop if C != 0
HLT`
  },
  {
    id: 'counter',
    name: '3. Up-Counter (00H to 0AH)',
    startAddr: 0x0800,
    code: `; Decimal / Hex Up-Counter
MVI A, 00H    ; Initialize Accumulator to 0
MVI B, 0AH    ; Max count = 10 (0AH)
COUNT_LOOP:
INR A         ; Increment Accumulator
DCR B         ; Decrement counter
JNZ 0804H     ; Repeat until B == 0
HLT`
  }
];

export default function Microprocessor8085Page() {
  const [cpu] = useState<Intel8085>(() => new Intel8085());
  const [selectedPreset, setSelectedPreset] = useState<ProgramPreset>(PRESET_PROGRAMS[0]);
  const [sourceCode, setSourceCode] = useState(PRESET_PROGRAMS[0].code);
  const [cpuState, setCpuState] = useState<I8085State>(() => cpu.getState());
  const [memoryVer, setMemoryVer] = useState(0);
  const [assembledListing, setAssembledListing] = useState<{ addr: number; bytes: number[]; line: string }[]>([]);
  const [assembleErrors, setAssembleErrors] = useState<string[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  const autoRunTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    handleAssemble();
    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    };
  }, []);

  const handleSelectPreset = (p: ProgramPreset) => {
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    setIsAutoRunning(false);
    setSelectedPreset(p);
    setSourceCode(p.code);
    cpu.reset();
    setCpuState(cpu.getState());
    setMemoryVer((v) => v + 1);

    setTimeout(() => {
      const res = cpu.assemble(p.code, p.startAddr);
      setAssembledListing(res.machineCode);
      setAssembleErrors(res.errors);
      setCpuState(cpu.getState());
    }, 50);
  };

  const handleAssemble = () => {
    cpu.reset();
    const res = cpu.assemble(sourceCode, selectedPreset.startAddr);
    setAssembledListing(res.machineCode);
    setAssembleErrors(res.errors);
    setCpuState(cpu.getState());
    setMemoryVer((v) => v + 1);

    if (res.errors.length === 0) {
      toast.success(`Assembled ${res.machineCode.length} instructions into memory starting at 0x0800`);
    } else {
      toast.error(`Assembly failed with ${res.errors.length} error(s)`);
    }
  };

  const handleStep = () => {
    if (cpu.isHalted) {
      toast.info('CPU is in HALT state. Reset or re-assemble to run again.');
      return;
    }

    const ok = cpu.step();
    setCpuState(cpu.getState());
    setMemoryVer((v) => v + 1);

    if (!ok) {
      toast.info('HLT Instruction Encountered: Execution Finished');
      if (autoRunTimerRef.current) {
        clearInterval(autoRunTimerRef.current);
        setIsAutoRunning(false);
      }
    }
  };

  const handleRunAll = () => {
    if (cpu.isHalted) {
      handleAssemble();
    }

    setIsAutoRunning(true);
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);

    autoRunTimerRef.current = setInterval(() => {
      if (cpu.isHalted) {
        if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
        setIsAutoRunning(false);
        setCpuState(cpu.getState());
        setMemoryVer((v) => v + 1);
        toast.success('Program execution complete (HLT)');
      } else {
        cpu.step();
        setCpuState(cpu.getState());
        setMemoryVer((v) => v + 1);
      }
    }, 100);
  };

  const handleStopAutoRun = () => {
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    setIsAutoRunning(false);
    toast.info('Execution paused');
  };

  const handleReset = () => {
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    setIsAutoRunning(false);
    cpu.reset();
    setCpuState(cpu.getState());
    setMemoryVer((v) => v + 1);
    toast.info('Intel 8085 CPU Reset');
  };

  const handleMemoryEdit = (addr: number, val: number) => {
    cpu.memory[addr] = val;
    setMemoryVer((v) => v + 1);
    toast.success(`Memory[0x${addr.toString(16).toUpperCase()}] = 0x${val.toString(16).toUpperCase()}`);
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
                <Cpu className="h-6 w-6 text-emerald-400" />
                Intel 8085 Microprocessor Virtual Laboratory
              </h1>
              <p className="text-xs text-slate-400">
                Cycle-Accurate 8-Bit Architecture • Assembly IDE • Live Register Bank & PSW • 64KB Hex Memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleAssemble} variant="secondary" className="font-bold">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-cyan-400" /> Assemble Code
            </Button>
            <Button onClick={handleStep} disabled={isAutoRunning} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              <StepForward className="h-4 w-4 mr-1.5" /> Step (Single Cycle)
            </Button>
            {!isAutoRunning ? (
              <Button onClick={handleRunAll} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/40">
                <Play className="h-4 w-4 mr-1.5 fill-current" /> Run Full Speed
              </Button>
            ) : (
              <Button onClick={handleStopAutoRun} variant="destructive" className="font-bold">
                Pause
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
        {/* Left Column: Monaco Assembly Editor & Presets */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm font-bold">8085 Assembly IDE</CardTitle>
              </div>
              <div className="flex gap-1.5">
                {PRESET_PROGRAMS.map((prog) => (
                  <Button
                    key={prog.id}
                    variant={selectedPreset.id === prog.id ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleSelectPreset(prog)}
                    className="text-[11px] h-7 px-2.5"
                  >
                    {prog.name.split('.')[1] || prog.name}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <Editor
                height="360px"
                defaultLanguage="ini"
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

          {/* Machine Code Disassembly Listing */}
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-xs font-bold font-mono">Disassembly & Machine Code Opcodes</CardTitle>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px]">
                {assembledListing.length} Instructions
              </Badge>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-40 font-mono text-xs text-cyan-300 bg-black/80 rounded-lg p-3 border border-slate-800">
                {assembledListing.map((item, idx) => {
                  const isCurrent = item.addr === cpuState.PC;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 py-0.5 px-2 rounded ${
                        isCurrent ? 'bg-cyan-500/30 text-white font-bold border-l-4 border-cyan-400' : 'hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-slate-500 w-16">
                        0x{item.addr.toString(16).toUpperCase().padStart(4, '0')}
                      </span>
                      <span className="text-amber-400 w-24">
                        {item.bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
                      </span>
                      <span className="text-slate-200">{item.line}</span>
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Hardware Trainer Kit Panel & Registers */}
        <div className="lg:col-span-6 space-y-6">
          {/* Classic 8085 Trainer Kit Panel */}
          <TrainerKitPanel
            state={cpuState}
            memory={cpu.memory}
            onStep={handleStep}
            onRun={handleRunAll}
            onReset={handleReset}
            onAddressChange={(addr) => {
              cpu.PC = addr;
              setCpuState(cpu.getState());
            }}
            onMemoryWrite={handleMemoryEdit}
            onInterrupt={(type) => {
              cpu.triggerInterrupt(type);
              setCpuState(cpu.getState());
              toast.warning(`Hardware Interrupt Triggered: ${type} -> PC Vector 0x${cpu.PC.toString(16).toUpperCase().padStart(4, '0')}`);
            }}
          />

          {/* Register Bank & Flags */}
          <RegisterBank state={cpuState} />

          {/* 64KB Memory Grid */}
          <MemoryGrid
            key={memoryVer}
            memory={cpu.memory}
            currentPC={cpuState.PC}
            hlAddress={cpu.getHLAddress()}
            onMemoryChange={handleMemoryEdit}
          />
        </div>
      </div>
    </div>
  );
}
