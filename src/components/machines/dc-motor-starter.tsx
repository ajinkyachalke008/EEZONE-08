'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Zap, RotateCw, Magnet } from 'lucide-react';

interface DCMotorStarterProps {
  starterStep: number; // 0 (OFF) to 4 (RUN)
  onStarterStepChange: (step: number) => void;
  speedRPM: number;
  armatureCurrent: number;
  isOverloaded: boolean;
}

export function DCMotorStarter({
  starterStep,
  onStarterStepChange,
  speedRPM,
  armatureCurrent,
  isOverloaded
}: DCMotorStarterProps) {
  const studAngles = [-40, -20, 0, 20, 40]; // Stud positions in degrees
  const currentAngle = studAngles[starterStep] || -40;
  const isRunning = starterStep > 0;

  return (
    <Card className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="py-2.5 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-xs font-black font-mono tracking-wider text-amber-300">
            4-POINT DC MOTOR STARTER & ROTOR CUTAWAY
          </CardTitle>
        </div>
        <Badge className={isOverloaded ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}>
          {isOverloaded ? '⚠️ OVERLOAD TRIP' : isRunning ? '● NVC ENERGIZED' : 'OFF'}
        </Badge>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* 4-Point Starter Panel Graphic */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-inner">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">
              4-Point Resistance Stud Arm
            </span>

            {/* SVG Starter Panel */}
            <svg viewBox="0 0 220 180" className="w-56 h-44 overflow-visible">
              {/* Slate Base Panel */}
              <rect x="10" y="10" width="200" height="160" rx="12" fill="#0F172A" stroke="#334155" strokeWidth="2" />

              {/* No-Volt Coil (NVC) Magnet */}
              <rect x="155" y="30" width="30" height="30" rx="4" fill="#78350F" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="170" y="48" fill="#FDE68A" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                NVC
              </text>

              {/* Overload Release (OLR) Coil */}
              <rect x="25" y="125" width="25" height="25" rx="4" fill="#881337" stroke="#F43F5E" strokeWidth="1.5" />
              <text x="37" y="140" fill="#FECDD3" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                OLR
              </text>

              {/* 5 Resistance Stud Contacts */}
              {studAngles.map((angle, idx) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const sx = 110 + 65 * Math.cos(rad);
                const sy = 130 + 65 * Math.sin(rad);
                const isActive = idx <= starterStep && isRunning;

                return (
                  <g key={idx} className="cursor-pointer" onClick={() => onStarterStepChange(idx)}>
                    <circle
                      cx={sx}
                      cy={sy}
                      r="7"
                      fill={isActive ? '#F59E0B' : '#475569'}
                      stroke="#0F172A"
                      strokeWidth="2"
                      className="hover:scale-125 transition-transform"
                    />
                    <text x={sx} y={sy + 3} fill="#000" fontSize="7" fontFamily="monospace" fontWeight="black" textAnchor="middle">
                      {idx === 0 ? 'OFF' : idx === 4 ? 'RUN' : idx}
                    </text>
                  </g>
                );
              })}

              {/* Movable Starter Handle Arm */}
              <g
                style={{
                  transform: `rotate(${currentAngle}deg)`,
                  transformOrigin: '110px 130px',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Copper Arm */}
                <line x1="110" y1="130" x2="110" y2="55" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
                {/* Insulated Handle Knob */}
                <circle cx="110" cy="50" r="9" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                {/* Center Pivot */}
                <circle cx="110" cy="130" r="10" fill="#78350F" stroke="#F59E0B" strokeWidth="2" />
              </g>
            </svg>

            {/* Step Controls */}
            <div className="flex gap-1.5 mt-3">
              {['OFF', 'Stud 1', 'Stud 2', 'Stud 3', 'RUN'].map((label, idx) => (
                <Button
                  key={label}
                  size="sm"
                  variant={starterStep === idx ? 'default' : 'secondary'}
                  onClick={() => onStarterStepChange(idx)}
                  className={`text-[10px] h-6 px-2 font-mono font-bold ${
                    starterStep === idx ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Motor Cutaway & Commutator Visualizer */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden shadow-inner select-none">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
              DC Machine Armature & Commutator Cutaway
            </span>

            {/* Rotating Rotor Cutaway */}
            <div className="relative flex items-center justify-center p-6">
              {/* North & South Stator Poles */}
              <div className="absolute -left-4 w-10 h-28 bg-gradient-to-r from-rose-700 to-rose-600 rounded-r-2xl border border-rose-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
                N
              </div>
              <div className="absolute -right-4 w-10 h-28 bg-gradient-to-l from-blue-700 to-blue-600 rounded-l-2xl border border-blue-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
                S
              </div>

              {/* Spinning Armature Core */}
              <div
                className="w-28 h-28 rounded-full border-4 border-dashed border-amber-400/80 bg-slate-900 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center relative"
                style={{
                  animation: speedRPM > 0 ? `spin ${Math.max(0.1, 60 / speedRPM)}s linear infinite` : 'none'
                }}
              >
                {/* Armature Copper Coils (Slots) */}
                <div className="w-20 h-20 rounded-full border-2 border-amber-600/60 bg-gradient-to-tr from-amber-950 to-slate-900 flex items-center justify-center">
                  {/* Commutator Segment Core */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-black font-black text-[9px] shadow">
                    ROTOR
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-300 mt-2 text-center">
              Speed: <strong className="text-amber-400">{speedRPM} RPM</strong> • Armature Current: <strong className="text-cyan-400">{armatureCurrent.toFixed(1)} A</strong>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
