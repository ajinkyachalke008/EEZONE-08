'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Circle,
  ArrowLeft,
  Sparkles,
  Search,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  LineChart,
  Layers,
  Cpu,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Wrench,
  Mic
} from 'lucide-react';
import Link from 'next/link';
import { LAB_EXPERIMENTS, LabExperiment } from '@/lib/experiments/lab-curriculum';
import { toast } from 'sonner';
import { soundEngine } from '@/lib/audio/lab-sound-engine';
import { AIVivaExaminerDialog } from '@/components/viva/ai-viva-examiner-dialog';

export default function LabExperimentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExp, setSelectedExp] = useState<LabExperiment>(LAB_EXPERIMENTS[0]);
  const [observations, setObservations] = useState<{ [key: string]: number | string }[]>(
    LAB_EXPERIMENTS[0].defaultObservations
  );
  const [checkedApparatus, setCheckedApparatus] = useState<{ [key: string]: boolean }>({});
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});
  const [revealedViva, setRevealedViva] = useState<{ [key: number]: boolean }>({});
  const [studentName, setStudentName] = useState('Ajinkya Chalke');
  const [rollNo, setRollNo] = useState('22030101');
  const [batch, setBatch] = useState('B-1 (Electrical Engg)');
  const [isVivaOpen, setIsVivaOpen] = useState(false);

  const categories = ['All', 'Electrical Machines', 'Power Systems', 'Analog Circuits', 'Digital Electronics', 'Microprocessors', 'Power Electronics & Control'];

  const filteredExperiments = useMemo(() => {
    return LAB_EXPERIMENTS.filter((exp) => {
      const matchCat = selectedCategory === 'All' || exp.category === selectedCategory;
      const matchSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.aim.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectExp = (exp: LabExperiment) => {
    soundEngine.playKeyClick();
    setSelectedExp(exp);
    setObservations(exp.defaultObservations);
    setCheckedApparatus({});
    setCompletedSteps({});
    setRevealedViva({});
  };

  const handleAddObservation = () => {
    soundEngine.playKeyClick();
    const lastRow = observations[observations.length - 1] || {};
    const newRow: { [key: string]: number | string } = { ...lastRow };
    if ('obs' in newRow) {
      newRow.obs = observations.length + 1;
    }
    setObservations((prev) => [...prev, newRow]);
    toast.success('Observation row added');
  };

  const handleDeleteRow = (index: number) => {
    soundEngine.playKeyClick();
    if (observations.length <= 1) {
      toast.error('Cannot remove all observation rows');
      return;
    }
    setObservations((prev) => prev.filter((_, idx) => idx !== index));
    toast.info('Observation row removed');
  };

  const handleCellChange = (rowIndex: number, columnKey: string, value: string) => {
    const num = Number(value);
    const valToSave = !isNaN(num) && value.trim() !== '' ? num : value;
    setObservations((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [columnKey]: valToSave };
      return updated;
    });
  };

  const handleResetObservations = () => {
    soundEngine.playKeyClick();
    setObservations(selectedExp.defaultObservations);
    toast.success('Observation table reset to default lab values');
  };

  const handleExportCSV = () => {
    soundEngine.playKeyClick();
    const headers = selectedExp.columns.map((c) => `"${c.label} (${c.unit})"`).join(',');
    const rows = observations
      .map((row) => selectedExp.columns.map((c) => `"${row[c.key] ?? ''}"`).join(','))
      .join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedExp.code}_${selectedExp.id}_observations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Observations exported as CSV');
  };

  const handlePrintReport = () => {
    soundEngine.playKeyClick();
    window.print();
  };

  const toggleApparatus = (item: string) => {
    soundEngine.playKeyClick();
    setCheckedApparatus((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const toggleStep = (stepIdx: number) => {
    soundEngine.playKeyClick();
    setCompletedSteps((prev) => ({ ...prev, [stepIdx]: !prev[stepIdx] }));
  };

  const toggleViva = (vivaIdx: number) => {
    soundEngine.playKeyClick();
    setRevealedViva((prev) => ({ ...prev, [vivaIdx]: !prev[vivaIdx] }));
  };

  // SVG Graph Coordinate Calculation
  const graphData = useMemo(() => {
    if (!selectedExp.graphConfig) return null;
    const { xKey, yKey } = selectedExp.graphConfig;
    const points: { x: number; y: number }[] = [];
    observations.forEach((row) => {
      const xVal = typeof row[xKey] === 'number' ? row[xKey] : parseFloat(String(row[xKey]));
      const yVal = typeof row[yKey] === 'number' ? row[yKey] : parseFloat(String(row[yKey]));
      if (!isNaN(xVal) && !isNaN(yVal)) {
        points.push({ x: xVal, y: yVal });
      }
    });

    if (points.length < 2) return null;

    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = 560;
    const height = 240;
    const padding = 45;

    const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
    const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

    const pathD = points
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
      .join(' ');

    return {
      points,
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
      padding,
      scaleX,
      scaleY,
      pathD
    };
  }, [observations, selectedExp]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8">
      {/* Top Navigation Header */}
      <div className="max-w-7xl mx-auto mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/tools/lab-bench">
              <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Lab Bench
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <GraduationCap className="h-6 w-6 text-cyan-400" />
                University Virtual Lab Manuals & Engineering Practicals
              </h1>
              <p className="text-xs text-slate-400">
                AICTE / IEEE Standard Curriculum • 12 Interactive Practicals • Live Observation Graphing • Printable PDF Lab Reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-mono text-xs">
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button onClick={handlePrintReport} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
              <Printer className="h-4 w-4 mr-1.5" /> Print / Export Lab Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Experiments Sidebar + Active Lab Manual */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Left Column: Experiments Catalog */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-400">
                  <BookOpen className="h-4 w-4" /> Lab Curriculum
                </CardTitle>
                <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                  {filteredExperiments.length} Practicals
                </Badge>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search practicals (e.g., Transformer, 8085, Op-Amp)..."
                  className="pl-8 h-8 text-xs bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredExperiments.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handleSelectExp(exp)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
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

              {filteredExperiments.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No experiments found matching &quot;{searchQuery}&quot;.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Experiment Lab Manual & Observation Sheet */}
        <div className="lg:col-span-8 space-y-6 print:col-span-12">
          {/* Lab Manual Header Card */}
          <Card className="bg-slate-900/90 border-cyan-500/40 text-white backdrop-blur-xl shadow-2xl overflow-hidden print:border-slate-400">
            <CardHeader className="py-4 px-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase">
                    EXPERIMENT {selectedExp.code} • {selectedExp.category}
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    AICTE Lab Approved
                  </Badge>
                </div>
                <CardTitle className="text-lg font-black text-white mt-1">
                  {selectedExp.title}
                </CardTitle>
              </div>

              <div className="print:hidden">
                <Link href={selectedExp.toolLink}>
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Live Simulation Bench
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 text-sm">
              {/* Student Metadata for Lab Submission */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-slate-500 block text-[10px] uppercase">Student Name</label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="h-7 text-xs bg-slate-900 border-slate-700 text-white mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] uppercase">Roll / PRN Number</label>
                  <Input
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="h-7 text-xs bg-slate-900 border-slate-700 text-white mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] uppercase">Batch & Branch</label>
                  <Input
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="h-7 text-xs bg-slate-900 border-slate-700 text-white mt-0.5"
                  />
                </div>
              </div>

              {/* 1. Aim */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">1</span>
                  Aim of the Experiment
                </h4>
                <p className="text-slate-300 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedExp.aim}
                </p>
              </div>

              {/* 2. Apparatus Required with Interactive Checklist */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">2</span>
                  Apparatus & Equipment Required
                  <span className="text-[10px] text-slate-500 font-normal ml-auto">(Click to check off items)</span>
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedExp.apparatus.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleApparatus(item)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                        checkedApparatus[item]
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {checkedApparatus[item] ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Theory & Working Principle */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">3</span>
                  Theory & Working Principle
                </h4>
                <p className="text-slate-300 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedExp.theory}
                </p>
              </div>

              {/* 4. Governing Equations */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">4</span>
                  Governing Mathematical Formulations
                </h4>
                <div className="grid md:grid-cols-2 gap-2.5 font-mono text-xs">
                  {selectedExp.formulae.map((f, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400 font-bold">{f.label}:</span>
                      <span className="text-amber-300 font-black">{f.formula}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Step-by-Step Procedure */}
              <div>
                <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">5</span>
                  Step-by-Step Experimental Procedure
                </h4>
                <div className="space-y-2">
                  {selectedExp.procedure.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        completedSteps[idx]
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through opacity-80'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="flex-1 leading-relaxed">{step}</p>
                      {completedSteps[idx] && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Precautions Alert (if any) */}
              {selectedExp.precautions && selectedExp.precautions.length > 0 && (
                <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl">
                  <h5 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Crucial Safety Precautions
                  </h5>
                  <ul className="text-xs text-red-200/90 space-y-1.5">
                    {selectedExp.precautions.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400">⚠</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6. Dynamic Editable Observation Table */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">6</span>
                    Experimental Observation Table
                  </h4>
                  <div className="flex items-center gap-2 print:hidden">
                    <Button size="sm" onClick={handleResetObservations} variant="outline" className="h-7 text-xs border-slate-800 bg-slate-900 text-slate-400 hover:text-white">
                      <RotateCcw className="h-3 w-3 mr-1" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleAddObservation} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold">
                      <Plus className="h-3 w-3 mr-1" /> Add Reading Row
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-center font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                        {selectedExp.columns.map((col) => (
                          <th key={col.key} className="py-2.5 px-3">
                            {col.label} {col.unit && `(${col.unit})`}
                          </th>
                        ))}
                        <th className="py-2.5 px-2 print:hidden">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/40">
                          {selectedExp.columns.map((col) => (
                            <td key={col.key} className="py-1 px-2 text-slate-200">
                              <input
                                type="text"
                                value={row[col.key] ?? ''}
                                onChange={(e) => handleCellChange(idx, col.key, e.target.value)}
                                className="w-full text-center bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-200 font-mono py-1 rounded"
                              />
                            </td>
                          ))}
                          <td className="py-1 px-2 print:hidden">
                            <button
                              onClick={() => handleDeleteRow(idx)}
                              className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                              title="Delete row"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. Live Interactive Characteristic Curve / Graph */}
              {graphData && selectedExp.graphConfig && (
                <div>
                  <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">7</span>
                    Live Characteristic Curve Plot
                  </h4>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <LineChart className="h-4 w-4 text-amber-400" />
                        {selectedExp.graphConfig.title}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        X: {selectedExp.graphConfig.xLabel} • Y: {selectedExp.graphConfig.yLabel}
                      </span>
                    </div>

                    <div className="w-full overflow-x-auto flex justify-center">
                      <svg viewBox={`0 0 ${graphData.width} ${graphData.height}`} className="w-full max-w-[560px] h-auto select-none">
                        {/* Background Grid */}
                        <rect x={graphData.padding} y={graphData.padding} width={graphData.width - 2 * graphData.padding} height={graphData.height - 2 * graphData.padding} fill="#030712" stroke="#1e293b" strokeWidth="1" />

                        {/* Grid lines */}
                        {[0.25, 0.5, 0.75].map((pct) => {
                          const y = graphData.padding + pct * (graphData.height - 2 * graphData.padding);
                          const x = graphData.padding + pct * (graphData.width - 2 * graphData.padding);
                          return (
                            <g key={pct}>
                              <line x1={graphData.padding} y1={y} x2={graphData.width - graphData.padding} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                              <line x1={x} y1={graphData.padding} x2={x} y2={graphData.height - graphData.padding} stroke="#1e293b" strokeDasharray="3 3" />
                            </g>
                          );
                        })}

                        {/* Axis lines */}
                        <line x1={graphData.padding} y1={graphData.height - graphData.padding} x2={graphData.width - graphData.padding} y2={graphData.height - graphData.padding} stroke="#64748b" strokeWidth="1.5" />
                        <line x1={graphData.padding} y1={graphData.padding} x2={graphData.padding} y2={graphData.height - graphData.padding} stroke="#64748b" strokeWidth="1.5" />

                        {/* Plot curve */}
                        <path d={graphData.pathD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Data Points */}
                        {graphData.points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={graphData.scaleX(p.x)} cy={graphData.scaleY(p.y)} r="4.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
                            <text x={graphData.scaleX(p.x)} y={graphData.scaleY(p.y) - 8} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                              {p.y}
                            </text>
                          </g>
                        ))}

                        {/* Axis Labels */}
                        <text x={graphData.width / 2} y={graphData.height - 10} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                          {selectedExp.graphConfig.xLabel}
                        </text>
                        <text x={15} y={graphData.height / 2} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold" transform={`rotate(-90 15 ${graphData.height / 2})`}>
                          {selectedExp.graphConfig.yLabel}
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Viva Voce Q&A Accordion & AI Oral Examiner */}
              {selectedExp.vivaQuestions && selectedExp.vivaQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-mono text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">8</span>
                      Viva-Voce & Oral Examination Preparation
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        soundEngine.playKeyClick();
                        setIsVivaOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs font-mono shadow-lg shadow-purple-950/50 print:hidden"
                    >
                      <Mic className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                      Start Live AI Oral Exam (Speech & Chat) &rarr;
                    </Button>
                  </div>

                  {/* AI Viva Banner Highlight */}
                  <div className="p-4 bg-gradient-to-r from-purple-950/40 via-slate-950 to-cyan-950/40 rounded-xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-white flex items-center gap-2">
                          Interactive AI External Examiner Booth
                          <Badge className="bg-purple-500/20 text-purple-300 text-[9px] font-mono">
                            AICTE Rubrics
                          </Badge>
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          Practice oral exam with real-time speech recognition, voice feedback, key-term scoring, and grade sheets.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        soundEngine.playKeyClick();
                        setIsVivaOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono"
                    >
                      Begin Viva
                    </Button>
                  </div>

                  {/* Standard Static Viva Accordion */}
                  <div className="space-y-2.5">
                    {selectedExp.vivaQuestions.map((vq, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div
                          onClick={() => toggleViva(idx)}
                          className="flex items-center justify-between cursor-pointer text-xs font-medium text-white hover:text-cyan-300 transition-colors"
                        >
                          <span className="font-bold">Q{idx + 1}: {vq.question}</span>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-cyan-400 hover:text-cyan-300">
                            {revealedViva[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {revealedViva[idx] ? 'Hide Answer' : 'Show Answer'}
                          </Button>
                        </div>
                        {revealedViva[idx] && (
                          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-200 leading-relaxed font-mono">
                            {vq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Verification & Report Signature */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">STUDENT VERIFICATION</span>
                  <div className="text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Observations Recorded & Verified
                  </div>
                  <div className="text-slate-400 text-[10px] mt-1">
                    Student: {studentName} ({rollNo})
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FACULTY / LAB INSTRUCTOR SIGN-OFF</span>
                  <div className="text-slate-400 font-bold mt-1">
                    Grade: [ A+ / A / B / C ] • Marks: ___ / 25
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Date of Assessment: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Viva Voce Examiner Dialog Modal */}
      <AIVivaExaminerDialog
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
        topic={selectedExp.title}
        category={selectedExp.category}
        experimentCode={selectedExp.code}
        governingTheory={selectedExp.theory}
        initialQuestion={
          selectedExp.vivaQuestions?.[0]?.question ||
          'State the main aim of this experiment and describe its core operational principle.'
        }
        studentName={studentName}
        rollNo={rollNo}
      />
    </div>
  );
}
