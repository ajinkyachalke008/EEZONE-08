'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface AnalogMeterProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  warningThreshold?: number;
  type?: 'voltage' | 'current' | 'power' | 'speed';
}

export function AnalogMeter({
  label,
  unit,
  value,
  min,
  max,
  warningThreshold,
  type = 'voltage'
}: AnalogMeterProps) {
  const clampedVal = Math.min(max, Math.max(min, value));
  const fraction = (clampedVal - min) / (max - min);
  const needleAngle = -55 + fraction * 110; // 110 degrees total sweep

  // Major ticks (5 segments) and minor ticks (25 segments)
  const majorTickCount = 5;
  const minorTickCount = 20;

  const majorTicks = Array.from({ length: majorTickCount + 1 }).map((_, i) => {
    const val = min + (i / majorTickCount) * (max - min);
    const angle = -55 + (i / majorTickCount) * 110;
    const rad = (angle * Math.PI) / 180;
    const x1 = 110 + 72 * Math.sin(rad);
    const y1 = 110 - 72 * Math.cos(rad);
    const x2 = 110 + 85 * Math.sin(rad);
    const y2 = 110 - 85 * Math.cos(rad);
    const tx = 110 + 58 * Math.sin(rad);
    const ty = 110 - 58 * Math.cos(rad) + 4;
    return { val, x1, y1, x2, y2, tx, ty };
  });

  const minorTicks = Array.from({ length: minorTickCount + 1 }).map((_, i) => {
    const angle = -55 + (i / minorTickCount) * 110;
    const rad = (angle * Math.PI) / 180;
    const x1 = 110 + 78 * Math.sin(rad);
    const y1 = 110 - 78 * Math.cos(rad);
    const x2 = 110 + 85 * Math.sin(rad);
    const y2 = 110 - 85 * Math.cos(rad);
    return { x1, y1, x2, y2 };
  });

  return (
    <div className="bg-gradient-to-b from-[#2A2F38] via-[#1E222A] to-[#12151B] p-3 rounded-2xl border-2 border-slate-700 shadow-[0_15px_35px_rgba(0,0,0,0.7)] text-center select-none relative">
      {/* 4 Corner Mounting Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-600 shadow" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-600 shadow" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-600 shadow" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-600 shadow" />

      {/* Meter Header Label */}
      <div className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
        {label}
      </div>

      {/* High-Fidelity Ivory Dial Glass Face */}
      <div className="relative w-48 h-32 mx-auto bg-[#F1F5F9] rounded-xl border-4 border-slate-800 shadow-[inset_0_3px_15px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 220 130" className="w-full h-full overflow-visible">
          {/* Outer Scale Arc */}
          <path
            d="M 39.5 68.7 A 85 85 0 0 1 180.5 68.7"
            fill="none"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Red Overload Zone Arc (Last 20%) */}
          <path
            d="M 152.3 40.5 A 85 85 0 0 1 180.5 68.7"
            fill="none"
            stroke="#EF4444"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Mirror Band Arc for Parallax Correction */}
          <path
            d="M 52.5 76.5 A 70 70 0 0 1 167.5 76.5"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="3,3"
          />

          {/* Minor Ticks */}
          {minorTicks.map((t, idx) => (
            <line key={idx} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#475569" strokeWidth="1" />
          ))}

          {/* Major Ticks & Calibrated Numerical Markings */}
          {majorTicks.map((t, idx) => (
            <g key={idx}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <text
                x={t.tx}
                y={t.ty}
                fill="#0F172A"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="900"
                textAnchor="middle"
              >
                {Math.round(t.val)}
              </text>
            </g>
          ))}

          {/* Laboratory Grade Dagger Pointer Needle */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: '110px 110px',
              transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.4, 1)'
            }}
          >
            {/* Counterweight Tail */}
            <line x1="110" y1="110" x2="110" y2="122" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            {/* Knife Edge Dagger Needle (Red) */}
            <line x1="110" y1="110" x2="110" y2="24" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
            {/* Pivot Cap */}
            <circle cx="110" cy="110" r="7" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="110" cy="110" r="2.5" fill="#DC2626" />
          </g>

          {/* Manufacturer & Class Marks */}
          <text x="110" y="86" fill="#64748B" fontSize="7" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            CLASS 0.5 • MOVING IRON
          </text>
          <text x="110" y="96" fill="#0F172A" fontSize="8" fontFamily="monospace" fontWeight="900" textAnchor="middle">
            {unit}
          </text>
        </svg>
      </div>

      {/* Bottom Bezel: Zero-Adjust Screw & High-Contrast Digital Display */}
      <div className="mt-2.5 flex items-center justify-between px-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
        {/* Mechanical Zero Adjust Screw */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-600 flex items-center justify-center shadow">
            <div className="w-2 h-0.5 bg-slate-800" />
          </div>
          <span className="text-[8px] font-mono text-slate-500 font-bold">ZERO ADJ</span>
        </div>

        {/* Digital Readout */}
        <div className="font-mono text-xs font-black text-amber-400">
          {value.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
        </div>
      </div>
    </div>
  );
}
