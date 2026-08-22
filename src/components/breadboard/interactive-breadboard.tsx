'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Trash2, Plus, Zap, Cpu } from 'lucide-react';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

export interface BreadboardWire {
  id: string;
  from: { col: number; row: string };
  to: { col: number; row: string };
  color: string;
}

export interface PlacedComponent {
  id: string;
  type: 'resistor' | 'led' | 'dip14' | 'capacitor';
  startCol: number;
  endCol: number;
  label: string;
  value?: string;
}

export function InteractiveBreadboard() {
  const [wireColor, setWireColor] = useState('#EF4444'); // Red default
  const [wires, setWires] = useState<BreadboardWire[]>([
    { id: 'w1', from: { col: 5, row: 'top_vcc' }, to: { col: 5, row: 'A' }, color: '#EF4444' },
    { id: 'w2', from: { col: 12, row: 'E' }, to: { col: 12, row: 'F' }, color: '#3B82F6' },
    { id: 'w3', from: { col: 20, row: 'J' }, to: { col: 20, row: 'bot_gnd' }, color: '#0F172A' }
  ]);
  const [components, setComponents] = useState<PlacedComponent[]>([
    { id: 'c1', type: 'resistor', startCol: 5, endCol: 10, label: 'R1 (330Ω)', value: '330Ω' },
    { id: 'c2', type: 'led', startCol: 10, endCol: 12, label: 'LED1 (5mm Red)', value: 'RED' },
    { id: 'c3', type: 'dip14', startCol: 15, endCol: 21, label: '7408 (AND Gate)', value: '7408' }
  ]);
  const [selectedWireStart, setSelectedWireStart] = useState<{ col: number; row: string } | null>(null);

  const columns = Array.from({ length: 30 }, (_, i) => i + 1); // 30 columns in view
  const topRows = ['A', 'B', 'C', 'D', 'E'];
  const botRows = ['F', 'G', 'H', 'I', 'J'];

  const handleHoleClick = (col: number, row: string) => {
    soundEngine.playKeyClick();
    if (!selectedWireStart) {
      setSelectedWireStart({ col, row });
    } else {
      if (selectedWireStart.col !== col || selectedWireStart.row !== row) {
        const newWire: BreadboardWire = {
          id: `w_${Date.now()}`,
          from: selectedWireStart,
          to: { col, row },
          color: wireColor
        };
        setWires((prev) => [...prev, newWire]);
      }
      setSelectedWireStart(null);
    }
  };

  const calculateHoleCoord = (col: number, row: string) => {
    const startX = 60;
    const colSpacing = 24;
    const x = startX + (col - 1) * colSpacing;
    let y = 100;

    if (row === 'top_vcc') y = 30;
    else if (row === 'top_gnd') y = 46;
    else if (row === 'A') y = 78;
    else if (row === 'B') y = 92;
    else if (row === 'C') y = 106;
    else if (row === 'D') y = 120;
    else if (row === 'E') y = 134;
    else if (row === 'F') y = 176;
    else if (row === 'G') y = 190;
    else if (row === 'H') y = 204;
    else if (row === 'I') y = 218;
    else if (row === 'J') y = 232;
    else if (row === 'bot_vcc') y = 264;
    else if (row === 'bot_gnd') y = 280;

    return { x, y };
  };

  return (
    <Card className="bg-[#121820] border border-cyan-500/40 text-white backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top Header */}
      <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-white tracking-wide font-mono">
              830-TIE-POINT SOLDERLESS BREADBOARD STUDIO
            </CardTitle>
            <span className="text-[10px] font-mono text-cyan-400">INTERACTIVE BEZIER JUMPER WIRING</span>
          </div>
        </div>

        {/* Wire Color Selection Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">WIRE:</span>
          {[
            { color: '#EF4444', label: '+5V (Red)' },
            { color: '#0F172A', label: 'GND (Black)' },
            { color: '#3B82F6', label: 'Signal (Blue)' },
            { color: '#EAB308', label: 'Clock (Yellow)' },
            { color: '#10B981', label: 'Analog (Green)' }
          ].map((c) => (
            <button
              key={c.color}
              onClick={() => setWireColor(c.color)}
              title={c.label}
              className={`w-5 h-5 rounded-full border transition-all ${
                wireColor === c.color ? 'scale-125 border-white shadow-[0_0_8px_#fff]' : 'border-slate-700'
              }`}
              style={{ backgroundColor: c.color }}
            />
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWires([])}
            className="h-7 text-xs border-rose-900 text-rose-400 hover:bg-rose-950 ml-2"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 overflow-x-auto select-none">
        {/* Photorealistic Solderless Breadboard Canvas */}
        <div className="min-w-[800px] p-4 bg-[#EDE8DC] rounded-3xl border-4 border-[#D5CEBF] shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative">
          <svg viewBox="0 0 800 310" className="w-full h-auto overflow-visible">
            {/* Top Power Rails Red & Blue Stripes */}
            <line x1="40" y1="22" x2="760" y2="22" stroke="#DC2626" strokeWidth="2" strokeDasharray="18,4" />
            <line x1="40" y1="54" x2="760" y2="54" stroke="#2563EB" strokeWidth="2" strokeDasharray="18,4" />
            {/* Bottom Power Rails Red & Blue Stripes */}
            <line x1="40" y1="256" x2="760" y2="256" stroke="#DC2626" strokeWidth="2" strokeDasharray="18,4" />
            <line x1="40" y1="288" x2="760" y2="288" stroke="#2563EB" strokeWidth="2" strokeDasharray="18,4" />

            {/* Central DIP IC Isolation Notch Channel */}
            <rect x="40" y="148" width="720" height="14" fill="#D5CEBF" rx="3" />

            {/* Render Power Holes */}
            {columns.map((col) => {
              const pVcc = calculateHoleCoord(col, 'top_vcc');
              const pGnd = calculateHoleCoord(col, 'top_gnd');
              const bVcc = calculateHoleCoord(col, 'bot_vcc');
              const bGnd = calculateHoleCoord(col, 'bot_gnd');

              return (
                <g key={col}>
                  <circle cx={pVcc.x} cy={pVcc.y} r="3.5" fill="#1C1917" stroke="#78716C" strokeWidth="1" className="cursor-pointer hover:fill-rose-500" onClick={() => handleHoleClick(col, 'top_vcc')} />
                  <circle cx={pGnd.x} cy={pGnd.y} r="3.5" fill="#1C1917" stroke="#78716C" strokeWidth="1" className="cursor-pointer hover:fill-blue-500" onClick={() => handleHoleClick(col, 'top_gnd')} />
                  <circle cx={bVcc.x} cy={bVcc.y} r="3.5" fill="#1C1917" stroke="#78716C" strokeWidth="1" className="cursor-pointer hover:fill-rose-500" onClick={() => handleHoleClick(col, 'bot_vcc')} />
                  <circle cx={bGnd.x} cy={bGnd.y} r="3.5" fill="#1C1917" stroke="#78716C" strokeWidth="1" className="cursor-pointer hover:fill-blue-500" onClick={() => handleHoleClick(col, 'bot_gnd')} />
                </g>
              );
            })}

            {/* Column Numbers */}
            {columns.map((col) => {
              const x = 60 + (col - 1) * 24;
              return (
                <g key={`col_${col}`}>
                  <text x={x} y="68" fill="#78716C" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {col}
                  </text>
                  <text x={x} y="248" fill="#78716C" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {col}
                  </text>
                </g>
              );
            })}

            {/* Render 5-Point Terminal Tie Holes (Rows A-E and F-J) */}
            {columns.map((col) => (
              <g key={`tie_${col}`}>
                {topRows.map((r) => {
                  const { x, y } = calculateHoleCoord(col, r);
                  const isSelected = selectedWireStart?.col === col && selectedWireStart?.row === r;
                  return (
                    <circle
                      key={r}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill={isSelected ? '#F59E0B' : '#1C1917'}
                      stroke="#78716C"
                      strokeWidth="1"
                      className="cursor-pointer hover:fill-amber-400 hover:scale-125 transition-transform"
                      onClick={() => handleHoleClick(col, r)}
                    />
                  );
                })}
                {botRows.map((r) => {
                  const { x, y } = calculateHoleCoord(col, r);
                  const isSelected = selectedWireStart?.col === col && selectedWireStart?.row === r;
                  return (
                    <circle
                      key={r}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill={isSelected ? '#F59E0B' : '#1C1917'}
                      stroke="#78716C"
                      strokeWidth="1"
                      className="cursor-pointer hover:fill-amber-400 hover:scale-125 transition-transform"
                      onClick={() => handleHoleClick(col, r)}
                    />
                  );
                })}
              </g>
            ))}

            {/* Render Placed Hardware Components */}
            {components.map((c) => {
              if (c.type === 'resistor') {
                const p1 = calculateHoleCoord(c.startCol, 'A');
                const p2 = calculateHoleCoord(c.endCol, 'A');
                const midX = (p1.x + p2.x) / 2;
                return (
                  <g key={c.id}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94A3B8" strokeWidth="2.5" />
                    <rect x={midX - 16} y={p1.y - 6} width="32" height="12" rx="4" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
                    {/* Color Bands (Orange Orange Brown Gold = 330 Ohm) */}
                    <line x1={midX - 8} y1={p1.y - 6} x2={midX - 8} y2={p1.y + 6} stroke="#EA580C" strokeWidth="2" />
                    <line x1={midX - 3} y1={p1.y - 6} x2={midX - 3} y2={p1.y + 6} stroke="#EA580C" strokeWidth="2" />
                    <line x1={midX + 2} y1={p1.y - 6} x2={midX + 2} y2={p1.y + 6} stroke="#78350F" strokeWidth="2" />
                    <line x1={midX + 8} y1={p1.y - 6} x2={midX + 8} y2={p1.y + 6} stroke="#CA8A04" strokeWidth="2" />
                  </g>
                );
              } else if (c.type === 'led') {
                const p1 = calculateHoleCoord(c.startCol, 'A');
                const p2 = calculateHoleCoord(c.endCol, 'A');
                const cx = (p1.x + p2.x) / 2;
                const cy = p1.y - 8;
                const isPowered = wires.length >= 2; // Continuity from +5V and GND
                return (
                  <g key={c.id}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94A3B8" strokeWidth="2" />
                    {isPowered && (
                      <circle cx={cx} cy={cy} r="18" fill="rgba(239, 68, 68, 0.35)" className="filter blur-md animate-pulse" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="8"
                      fill={isPowered ? '#EF4444' : '#7F1D1D'}
                      stroke={isPowered ? '#FCA5A5' : '#450A0A'}
                      strokeWidth="2"
                      className={isPowered ? 'shadow-[0_0_20px_#EF4444]' : ''}
                    />
                    {isPowered && (
                      <circle cx={cx - 2} cy={cy - 2} r="2.5" fill="#FFF" opacity="0.8" />
                    )}
                  </g>
                );
              } else if (c.type === 'dip14') {
                const pStart = calculateHoleCoord(c.startCol, 'E');
                const width = (c.endCol - c.startCol) * 24 + 18;
                return (
                  <g key={c.id}>
                    <rect x={pStart.x - 9} y={142} width={width} height="26" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
                    <circle cx={pStart.x - 3} cy={155} r="2" fill="#64748B" />
                    <text x={pStart.x + width / 2 - 9} y={158} fill="#E2E8F0" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {c.value}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Render Bezier Jumper Wires */}
            {wires.map((w) => {
              const p1 = calculateHoleCoord(w.from.col, w.from.row);
              const p2 = calculateHoleCoord(w.to.col, w.to.row);
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const sag = Math.max(30, Math.hypot(dx, dy) * 0.25);
              const cp1x = p1.x + dx * 0.25;
              const cp1y = p1.y - sag;
              const cp2x = p1.x + dx * 0.75;
              const cp2y = p2.y - sag;

              return (
                <g key={w.id}>
                  {/* Drop Shadow */}
                  <path
                    d={`M ${p1.x} ${p1.y} C ${cp1x} ${cp1y + 10} ${cp2x} ${cp2y + 10} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Main Insulated Wire */}
                  <path
                    d={`M ${p1.x} ${p1.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke={w.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Metallic Pin Terminals */}
                  <circle cx={p1.x} cy={p1.y} r="3" fill="#E2E8F0" stroke="#000" strokeWidth="0.5" />
                  <circle cx={p2.x} cy={p2.y} r="3" fill="#E2E8F0" stroke="#000" strokeWidth="0.5" />
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
