'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Printer,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  X
} from 'lucide-react';
import { AIVivaResponse, VivaExchange } from '@/app/api/ai-viva/route';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

interface VivaReportCardProps {
  topic: string;
  category: string;
  experimentCode?: string;
  studentName?: string;
  rollNo?: string;
  persona: 'strict' | 'supportive';
  finalResult: AIVivaResponse;
  history: VivaExchange[];
  onRestart: () => void;
}

export const VivaReportCard: React.FC<VivaReportCardProps> = ({
  topic,
  category,
  experimentCode = 'EE-LAB',
  studentName = 'Student Candidate',
  rollNo = '22030101',
  persona,
  finalResult,
  history,
  onRestart,
}) => {
  const finalEval = finalResult.finalEvaluation;
  const overallScore = finalEval?.overallScore ?? finalResult.score ?? 8.0;
  const marksOutOf25 = Math.round((overallScore / 10) * 25);
  const grade = finalEval?.grade ?? (overallScore >= 8.5 ? 'A' : 'B');

  const handlePrint = () => {
    soundEngine.playKeyClick();
    window.print();
  };

  const getGradeBadgeColor = (g: string) => {
    switch (g) {
      case 'A+':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'A':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'B':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'C':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      default:
        return 'bg-red-500/20 text-red-300 border-red-500/40';
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* University Exam Certificate Header Card */}
      <Card className="bg-slate-900/95 border-2 border-cyan-500/40 text-white shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {experimentCode} • {category}
              </Badge>
              <Badge className={`font-mono text-xs border ${getGradeBadgeColor(grade)}`}>
                GRADE {grade}
              </Badge>
            </div>
            <CardTitle className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
              University Lab Oral Examination Record
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-mono"
            >
              <Printer className="h-3.5 w-3.5 mr-1" /> Print Report
            </Button>
            <Button
              onClick={onRestart}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> New Examination
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Candidate Information & Overall Score Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">STUDENT NAME</span>
              <span className="font-bold text-white text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ROLL NUMBER</span>
              <span className="font-bold text-white text-sm">{rollNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PRACTICAL TOPIC</span>
              <span className="font-bold text-cyan-300 line-clamp-1">{topic}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">MARKS AWARDED</span>
              <span className="font-black text-amber-400 text-base">
                {marksOutOf25} / 25 <span className="text-xs text-slate-400 font-normal">({overallScore}/10)</span>
              </span>
            </div>
          </div>

          {/* 3-Tier Rubric Matrix */}
          <div>
            <h4 className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-cyan-400" />
              Comprehensive 3-Tier Oral Rubric Assessment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Technical Accuracy</span>
                  <span className="font-black text-cyan-300">
                    {finalResult.rubricBreakdown.technicalAccuracy} / 5.0
                  </span>
                </div>
                <Progress
                  value={(finalResult.rubricBreakdown.technicalAccuracy / 5.0) * 100}
                  className="h-1.5 bg-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Laws, equations, and circuit physics
                </span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Domain Terminology</span>
                  <span className="font-black text-purple-300">
                    {finalResult.rubricBreakdown.terminologyUsage} / 3.0
                  </span>
                </div>
                <Progress
                  value={(finalResult.rubricBreakdown.terminologyUsage / 3.0) * 100}
                  className="h-1.5 bg-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Standard IEEE/AICTE domain keywords
                </span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Conceptual Depth</span>
                  <span className="font-black text-emerald-300">
                    {finalResult.rubricBreakdown.conceptualReasoning} / 2.0
                  </span>
                </div>
                <Progress
                  value={(finalResult.rubricBreakdown.conceptualReasoning / 2.0) * 100}
                  className="h-1.5 bg-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Causality, failure modes, & reasoning
                </span>
              </div>
            </div>
          </div>

          {/* Strengths and Revision Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <h5 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Core Competencies Mastered
              </h5>
              <ul className="text-xs text-emerald-200/90 space-y-1.5 font-mono">
                {(finalEval?.strengths ?? ['Clear recall of primary operational formulations']).map(
                  (s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{s}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
              <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Recommended Revision Points
              </h5>
              <ul className="text-xs text-amber-200/90 space-y-1.5 font-mono">
                {(finalEval?.topicsToRevise ?? ['Review secondary failure mode calculations']).map(
                  (t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400">✦</span>
                      <span>{t}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Transcript Review */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              Transcript & Examiner Evaluation Breakdown
            </h4>
            <div className="space-y-3">
              {history.map((turn, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">Q{turn.round}: {turn.question}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                      Score: {turn.score} / 10
                    </Badge>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg text-slate-300 font-mono text-[11px] border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Candidate Response:</span>
                    {turn.studentAnswer}
                  </div>
                  <p className="text-slate-400 text-xs font-mono leading-relaxed">
                    <strong className="text-amber-400">Examiner Analysis:</strong> {turn.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Examiner Sign-Off Block */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">EXAMINER REMARKS</span>
              <p className="text-slate-300 italic text-xs mt-1">
                &ldquo;{finalEval?.examinerRemarks ?? 'Candidate verified for laboratory record submission.'}&rdquo;
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>EXAMINER: {persona === 'strict' ? 'Dr. R. K. Sharma' : 'Prof. Sarah Chen'}</span>
                <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Verified & Recorded
                </span>
                <span className="font-mono text-[10px] text-slate-500">[DIGITALLY ATTESTED]</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
