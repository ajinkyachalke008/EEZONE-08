'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DipIcPinoutProps {
  icCode: string;
  name: string;
  activeInputA: boolean;
  activeInputB: boolean;
  activeOutput: boolean;
}

export function DipIcPinout({
  icCode,
  name,
  activeInputA,
  activeInputB,
  activeOutput
}: DipIcPinoutProps) {
  return (
    <Card className="bg-slate-950/90 border border-purple-500/40 text-white backdrop-blur-xl shadow-2xl overflow-hidden select-none">
      <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
        <CardTitle className="text-xs font-black font-mono tracking-wider text-purple-300">
          TTL 74{icCode.substring(2)} DUAL-IN-LINE (DIP-14) PINOUT
        </CardTitle>
        <Badge className="bg-purple-500/20 text-purple-300 text-[9px] font-mono">
          PDIP-14 PACKAGE
        </Badge>
      </CardHeader>

      <CardContent className="p-6 flex flex-col items-center">
        {/* SVG Photorealistic 14-Pin IC */}
        <svg viewBox="0 0 260 170" className="w-64 h-44 overflow-visible">
          {/* Main Epoxy IC Body */}
          <rect x="50" y="20" width="160" height="130" rx="8" fill="#111827" stroke="#374151" strokeWidth="2" />

          {/* Orientation Notch at Top */}
          <path d="M 120 20 A 10 10 0 0 1 140 20" fill="#1F2937" stroke="#374151" strokeWidth="1.5" />
          <circle cx="65" cy="35" r="3" fill="#4B5563" />

          {/* IC Label Silkscreen */}
          <text x="130" y="78" fill="#E5E7EB" fontSize="13" fontFamily="monospace" fontWeight="900" textAnchor="middle" letterSpacing="2">
            SN74{icCode.substring(2)}N
          </text>
          <text x="130" y="96" fill="#9CA3AF" fontSize="8" fontFamily="monospace" textAnchor="middle">
            {name.toUpperCase()}
          </text>

          {/* Left Pins (1 to 7) */}
          {[
            { pin: 1, label: '1A', active: activeInputA },
            { pin: 2, label: '1B', active: activeInputB },
            { pin: 3, label: '1Y', active: activeOutput },
            { pin: 4, label: '2A', active: false },
            { pin: 5, label: '2B', active: false },
            { pin: 6, label: '2Y', active: false },
            { pin: 7, label: 'GND', active: false }
          ].map((p, idx) => {
            const y = 30 + idx * 17;
            return (
              <g key={p.pin}>
                {/* Metallic Pin Lead */}
                <rect x="25" y={y} width="25" height="7" rx="1.5" fill={p.active ? '#F59E0B' : '#94A3B8'} stroke="#000" strokeWidth="0.5" />
                <text x="18" y={y + 6} fill="#CBD5E1" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                  {p.pin}
                </text>
                <text x="56" y={y + 6} fill={p.active ? '#F59E0B' : '#9CA3AF'} fontSize="7" fontFamily="monospace" fontWeight="bold">
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Right Pins (14 to 8) */}
          {[
            { pin: 14, label: 'VCC', active: true },
            { pin: 13, label: '4B', active: false },
            { pin: 12, label: '4A', active: false },
            { pin: 11, label: '4Y', active: false },
            { pin: 10, label: '3B', active: false },
            { pin: 9, label: '3A', active: false },
            { pin: 8, label: '3Y', active: false }
          ].map((p, idx) => {
            const y = 30 + idx * 17;
            return (
              <g key={p.pin}>
                {/* Metallic Pin Lead */}
                <rect x="210" y={y} width="25" height="7" rx="1.5" fill={p.pin === 14 ? '#EF4444' : '#94A3B8'} stroke="#000" strokeWidth="0.5" />
                <text x="242" y={y + 6} fill="#CBD5E1" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="start">
                  {p.pin}
                </text>
                <text x="204" y={y + 6} fill={p.pin === 14 ? '#EF4444' : '#9CA3AF'} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex gap-4 text-[10px] font-mono text-slate-400 mt-2">
          <span>Pin 14: <strong className="text-rose-400">+5V VCC</strong></span>
          <span>Pin 7: <strong className="text-slate-200">GND (0V)</strong></span>
          <span>Active Gate: <strong className="text-amber-400">Gate 1 (Pins 1, 2, 3)</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}
