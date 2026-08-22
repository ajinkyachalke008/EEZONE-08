'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface LogicTimingAnalyzerProps {
  inputA: boolean;
  inputB: boolean;
  outputY: boolean;
  gateName: string;
}

export function LogicTimingAnalyzer({
  inputA,
  inputB,
  outputY,
  gateName
}: LogicTimingAnalyzerProps) {
  // Waveform steps (8 time intervals T0 to T7)
  const steps = [
    { a: false, b: false, y: false },
    { a: false, b: true, y: false },
    { a: true, b: false, y: false },
    { a: true, b: true, y: true },
    { a: false, b: true, y: false },
    { a: true, b: true, y: true },
    { a: false, b: false, y: false },
    { a: inputA, b: inputB, y: outputY }
  ];

  const renderDigitalWaveform = (signalName: string, values: boolean[], color: string) => {
    const stepWidth = 40;
    const height = 24;
    let path = '';

    values.forEach((val, idx) => {
      const x1 = idx * stepWidth;
      const x2 = (idx + 1) * stepWidth;
      const y = val ? 4 : height;

      if (idx === 0) {
        path += `M ${x1} ${y} L ${x2} ${y}`;
      } else {
        const prevVal = values[idx - 1];
        const prevY = prevVal ? 4 : height;
        if (prevY !== y) {
          path += ` L ${x1} ${y} L ${x2} ${y}`;
        } else {
          path += ` L ${x2} ${y}`;
        }
      }
    });

    return (
      <div className="flex items-center gap-3 py-1 font-mono text-xs">
        <span className="w-20 font-bold text-slate-300 text-right">{signalName}</span>
        <div className="flex-1 bg-slate-950 p-2 rounded-lg border border-slate-800 overflow-x-auto">
          <svg width={values.length * stepWidth} height={height + 6} className="overflow-visible">
            {/* Grid lines */}
            {values.map((_, i) => (
              <line
                key={i}
                x1={i * stepWidth}
                y1={0}
                x2={i * stepWidth}
                y2={height + 6}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            {/* Digital Trace */}
            <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-slate-950/90 border border-slate-800 text-white backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs font-black font-mono tracking-wider text-emerald-300">
            DIGITAL LOGIC TIMING ANALYZER (t_pd = 10ns)
          </CardTitle>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
          4-CHANNEL TRACE
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {renderDigitalWaveform('CLK (10MHz)', [false, true, false, true, false, true, false, true], '#94A3B8')}
        {renderDigitalWaveform('Input A', steps.map((s) => s.a), '#06B6D4')}
        {renderDigitalWaveform('Input B', steps.map((s) => s.b), '#A855F7')}
        {renderDigitalWaveform(`Output (${gateName})`, steps.map((s) => s.y), '#10B981')}

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
          <span>Time Scale: <strong>50 ns / div</strong></span>
          <span>Gate Delay: <strong className="text-emerald-400">t_PLH = 9.5ns • t_PHL = 10.2ns</strong></span>
          <span>Logic Family: <strong className="text-purple-400">High-Speed CMOS / TTL</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}
