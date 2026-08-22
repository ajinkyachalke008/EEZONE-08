'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Printer,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { LAB_EXPERIMENTS, LabExperiment } from '@/lib/experiments/lab-curriculum';
import { toast } from 'sonner';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

export default function LabExperimentsPage() {
  const [selectedExp, setSelectedExp] = useState<LabExperiment>(LAB_EXPERIMENTS[0]);
  const [observations, setObservations] = useState<{ [key: string]: number | string }[]>(
    LAB_EXPERIMENTS[0].defaultObservations
  );
  const [studentName, setStudentName] = useState('Ajinkya Chalke');
  const [rollNo, setRollNo] = useState('22030101');

  const handleSelectExp = (exp: LabExperiment) => {
    soundEngine.playKeyClick();
    setSelectedExp(exp);
    setObservations(exp.defaultObservations);
  };

  const handleAddObservation = () => {
    soundEngine.playKeyClick();
    const newRow = { ...observations[observations.length - 1], obs: observations.length + 1 };
    setObservations((prev) => [...prev, newRow]);
    toast.success('Observation row recorded successfully');
  };

  const handlePrintReport = () => {
    soundEngine.playKeyClick();
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8">
      {/* Top Navigation Header */}
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
                <GraduationCap className="h-6 w-6 text-cyan-400" />
                University Virtual Lab Manuals & Experiments
              </h1>
              <p className="text-xs text-slate-400">
                AICTE / IEEE Standard Engineering Curriculum • Auto-Observation Tables • Printable PDF Lab Reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handlePrintReport} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
              <Printer className="h-4 w-4 mr-1.5" /> Print / Export Lab Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Experiments Sidebar + Active Lab Manual */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Left Column: Experiments Catalog */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-400">
                <BookOpen className="h-4 w-4" /> Lab Curriculum (AICTE Syllabus)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {LAB_EXPERIMENTS.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handleSelectExp(exp)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedExp.id === exp.id
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                      {exp.code}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">{exp.category}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-2">{exp.title}</h4>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Experiment Lab Manual & Observation Sheet */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lab Manual Header Card */}
          <Card className="bg-slate-900/90 border-cyan-500/40 text-white backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-row items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase">
                  EXPERIMENT {selectedExp.code} • {selectedExp.category}
                </span>
                <CardTitle className="text-lg font-black text-white mt-1">
                  {selectedExp.title}
                </CardTitle>
              </div>

              <Link href={selectedExp.toolLink}>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-black">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Simulation Bench
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-6 space-y-6 text-sm">
              {/* Aim */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-1">
                  1. Aim of the Experiment
                </h4>
                <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedExp.aim}
                </p>
              </div>

              {/* Theory */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-1">
                  2. Theory & Working Principle
                </h4>
                <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedExp.theory}
                </p>
              </div>

              {/* Governing Equations */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-2">
                  3. Governing Mathematical Formulations
                </h4>
                <div className="grid md:grid-cols-2 gap-3 font-mono text-xs">
                  {selectedExp.formulae.map((f, i) => (
                    <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                      <span className="text-slate-400 font-bold">{f.label}:</span>
                      <span className="text-amber-300 font-black">{f.formula}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Observation Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider">
                    4. Experimental Observation Table
                  </h4>
                  <Button size="sm" onClick={handleAddObservation} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold">
                    <Plus className="h-3 w-3 mr-1" /> Record Reading
                  </Button>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-center font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                        {selectedExp.columns.map((col) => (
                          <th key={col.key} className="py-2 px-3">
                            {col.label} {col.unit && `(${col.unit})`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/40">
                          {selectedExp.columns.map((col) => (
                            <td key={col.key} className="py-2 px-3 text-slate-200">
                              {row[col.key] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Student Verification & Report Signature */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Student: <strong>{studentName}</strong></span>
                  <span>• Roll No: <strong>{rollNo}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Lab Experiment Verified & Ready for Submission
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
