'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Trophy,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { FAULT_EXAM_SCENARIOS, FaultExamScenario, TestPoint } from '@/lib/fault-engine';
import { toast } from 'sonner';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

export default function TroubleshootingExamPage() {
  const [selectedScenario, setSelectedScenario] = useState<FaultExamScenario>(FAULT_EXAM_SCENARIOS[0]);
  const [activeTestPoint, setActiveTestPoint] = useState<TestPoint>(FAULT_EXAM_SCENARIOS[0].testPoints[0]);
  const [dmmMode, setDmmMode] = useState<'VOLTAGE' | 'RESISTANCE'>('VOLTAGE');

  // Student Diagnosis Form State
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [selectedFaultType, setSelectedFaultType] = useState<'OPEN' | 'SHORT' | 'LEAKY' | 'DEGRADED'>('SHORT');
  const [diagnosisResult, setDiagnosisResult] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    score: number;
    explanation: string;
  } | null>(null);

  const handleSelectScenario = (sc: FaultExamScenario) => {
    soundEngine.playKeyClick();
    setSelectedScenario(sc);
    setActiveTestPoint(sc.testPoints[0]);
    setSelectedComponentId('');
    setDiagnosisResult(null);
  };

  const handleProbeTestPoint = (tp: TestPoint) => {
    soundEngine.playRelaySnap();
    setActiveTestPoint(tp);
    toast.info(`DMM Probe moved to ${tp.name}`);
  };

  const handleSubmitDiagnosis = () => {
    soundEngine.playKeyClick();
    if (!selectedComponentId) {
      toast.error('Please select the suspected defective component first');
      return;
    }

    const isComponentCorrect = selectedComponentId === selectedScenario.hiddenDefect.componentId;
    const isFaultCorrect = selectedFaultType === selectedScenario.hiddenDefect.faultType;
    const isCorrect = isComponentCorrect && isFaultCorrect;
    const score = isCorrect ? 100 : isComponentCorrect ? 50 : 0;

    if (isCorrect) {
      soundEngine.playArduinoTone(880, 300);
      toast.success('Outstanding! Correct Fault Diagnosis!');
    } else {
      soundEngine.playOverloadTrip();
      toast.error('Incorrect Diagnosis. Review test point telemetry and retry.');
    }

    setDiagnosisResult({
      submitted: true,
      isCorrect,
      score,
      explanation: selectedScenario.hiddenDefect.explanation
    });
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
                <ShieldAlert className="h-6 w-6 text-rose-500" />
                "Find-the-Fault" Virtual Troubleshooting Lab Exam
              </h1>
              <p className="text-xs text-slate-400">
                Practical Hardware Fault Diagnosis • Virtual DMM Probing • Oscilloscope Test Points • Automated Grading
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-mono">
              EXAM MODE: LIVE HARDWARE FAULT INJECTED
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid: Exam Scenarios + Interactive Bench + Diagnostic Submission */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Exam Scenarios & Circuit Info */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-400">
                <Search className="h-4 w-4" /> Diagnostic Exam Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {FAULT_EXAM_SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScenario.id === sc.id
                      ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-rose-500/20 text-rose-300 font-mono text-[9px]">
                      {sc.difficulty}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-2">{sc.title}</h4>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Circuit Details & Reported Symptom */}
          <Card className="bg-slate-900/90 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-950">
              <CardTitle className="text-xs font-mono font-bold text-amber-400 uppercase">
                Circuit Description & Symptom
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-300 block mb-1">Reported Failure:</span>
                <p className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-200 text-[11px] leading-relaxed">
                  ⚠️ {selectedScenario.symptom}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-300 block mb-1">Circuit Schematic Summary:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {selectedScenario.circuitDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Virtual DMM Probe Station & Diagnosis Submission */}
        <div className="lg:col-span-8 space-y-6">
          {/* Virtual Instrument Probing Bench */}
          <Card className="bg-slate-900/90 border-cyan-500/40 text-white backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="py-3 px-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-white font-mono">
                  TEST POINT (TP) MULTIMETER PROBING STATION
                </CardTitle>
                <span className="text-[10px] font-mono text-cyan-400">SELECT A TEST POINT TO ATTACH DMM PROBE</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={dmmMode === 'VOLTAGE' ? 'default' : 'secondary'}
                  onClick={() => setDmmMode('VOLTAGE')}
                  className={`h-7 text-xs font-mono font-bold ${
                    dmmMode === 'VOLTAGE' ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  DC/AC Volts
                </Button>
                <Button
                  size="sm"
                  variant={dmmMode === 'RESISTANCE' ? 'default' : 'secondary'}
                  onClick={() => setDmmMode('RESISTANCE')}
                  className={`h-7 text-xs font-mono font-bold ${
                    dmmMode === 'RESISTANCE' ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Ohmmeter (Ω)
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Test Point Probing Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedScenario.testPoints.map((tp) => (
                  <Button
                    key={tp.id}
                    onClick={() => handleProbeTestPoint(tp)}
                    className={`h-12 flex flex-col items-center justify-center font-mono border transition-all ${
                      activeTestPoint.id === tp.id
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_#06B6D4] scale-105 font-black'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xs">{tp.id}</span>
                    <span className="text-[9px] opacity-75">{tp.name.split('(')[1]?.replace(')', '') || 'Node'}</span>
                  </Button>
                ))}
              </div>

              {/* DMM Digital Readout Screen & Scope Waveform */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* DMM Screen */}
                <div className="p-4 bg-[#051A15] rounded-2xl border-2 border-emerald-950 shadow-inner flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">
                    6.5-DIGIT DMM READING AT {activeTestPoint.id}
                  </span>
                  <div className="my-3 font-mono text-2xl font-black text-emerald-400 shadow-[0_0_15px_#10B981]">
                    {dmmMode === 'VOLTAGE' ? activeTestPoint.faultVoltage : activeTestPoint.faultResistanceToGnd}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Nominal Expected: <strong className="text-slate-300">{dmmMode === 'VOLTAGE' ? activeTestPoint.nominalVoltage : activeTestPoint.nominalResistanceToGnd}</strong>
                  </span>
                </div>

                {/* Scope Signal Description */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Oscilloscope Trace at {activeTestPoint.id}
                  </span>
                  <p className="text-xs text-slate-300 font-mono my-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    {activeTestPoint.waveformDesc}
                  </p>
                  <span className="text-[9px] font-mono text-slate-500">Channel 1 • 100 MSa/s 1MΩ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Diagnosis & Exam Submission Card */}
          <Card className="bg-slate-900/90 border-amber-500/40 text-white backdrop-blur-xl shadow-2xl">
            <CardHeader className="py-3 px-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <CardTitle className="text-sm font-black text-amber-300 font-mono flex items-center gap-2">
                <Trophy className="h-4 w-4" /> SUBMIT FAULT DIAGNOSIS & REASONING
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
                    1. Suspected Defective Component:
                  </label>
                  <select
                    value={selectedComponentId}
                    onChange={(e) => setSelectedComponentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose Component --</option>
                    {selectedScenario.components.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id}: {c.name} ({c.nominalValue})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
                    2. Identified Fault Mode:
                  </label>
                  <select
                    value={selectedFaultType}
                    onChange={(e: any) => setSelectedFaultType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="SHORT">SHORT CIRCUIT (Internal Breakdown 0Ω)</option>
                    <option value="OPEN">OPEN CIRCUIT (Burnout / Disconnected)</option>
                    <option value="LEAKY">LEAKY / EXCESSIVE REVERSE CURRENT</option>
                    <option value="DEGRADED">DEGRADED / OUT OF TOLERANCE</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleSubmitDiagnosis}
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black font-mono text-sm tracking-wider shadow-lg"
              >
                SUBMIT FINAL DIAGNOSIS FOR EVALUATION
              </Button>

              {/* Diagnosis Score & Explanation */}
              {diagnosisResult && (
                <div
                  className={`p-4 rounded-xl border mt-4 ${
                    diagnosisResult.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold font-mono text-sm flex items-center gap-2">
                      {diagnosisResult.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-400" />
                      )}
                      Score: {diagnosisResult.score} / 100
                    </span>
                    <Badge className={diagnosisResult.isCorrect ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}>
                      {diagnosisResult.isCorrect ? 'PASSED' : 'RETRY NEEDED'}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono leading-relaxed">{diagnosisResult.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
