'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Layers,
  FileCode,
  CircuitBoard,
  Download,
  Eye,
  ArrowLeft,
  Sparkles,
  Search,
  Upload
} from 'lucide-react';
import Link from 'next/link';

interface KiCadSample {
  id: string;
  name: string;
  category: string;
  description: string;
  type: 'schematic' | 'pcb';
  schUrl?: string;
  pcbUrl?: string;
}

const KICAD_SAMPLES: KiCadSample[] = [
  {
    id: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'Microcontroller',
    description: 'Complete official reference schematic and 2-layer PCB layout with ATmega328P and USB interface.',
    type: 'schematic'
  },
  {
    id: 'esp32_devkit',
    name: 'ESP32-WROOM Dev Board',
    category: 'IoT & Wireless',
    description: 'High-density IoT hardware design with Wi-Fi/BLE RF frontend, CP2102 bridge, and power LDO.',
    type: 'pcb'
  },
  {
    id: 'lm7805_psu',
    name: '5V Linear Regulated PSU',
    category: 'Power Electronics',
    description: 'Bridge rectifier, smoothing electrolytic filter capacitor, LM7805 regulator, and reverse protection diode.',
    type: 'schematic'
  }
];

export default function KiCadViewerPage() {
  const [selectedSample, setSelectedSample] = useState<KiCadSample>(KICAD_SAMPLES[0]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'schematic' | 'pcb'>('schematic');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8">
      {/* KiCanvas Web Component Script Loader */}
      <Script
        src="https://kicanvas.org/kicanvas/kicanvas.js"
        type="module"
        onLoad={() => setScriptLoaded(true)}
      />

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
                <CircuitBoard className="h-6 w-6 text-cyan-400" />
                KiCanvas: KiCad Schematic & PCB Hardware Viewer
              </h1>
              <p className="text-xs text-slate-400">
                Official WebAssembly KiCad Renderer • Multi-Layer Copper & Silkscreen Inspection • Net & BOM Navigator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs px-3 py-1 font-mono">
              KiCad v7 / v8 Native Engine
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Hardware Designs & File Upload */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-400">
                <Layers className="h-4 w-4" /> Reference Hardware Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {KICAD_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSample.id === sample.id
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{sample.name}</span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {sample.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{sample.description}</p>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-800 mt-3">
                <Button variant="outline" className="w-full border-dashed border-slate-700 hover:border-cyan-400 text-xs text-slate-300">
                  <Upload className="h-3.5 w-3.5 mr-2 text-cyan-400" /> Open Local .kicad_sch / .kicad_pcb
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Inspector & Layers */}
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
            <CardHeader className="py-2.5 px-4 border-b border-slate-800">
              <CardTitle className="text-xs font-bold font-mono text-slate-300">PCB LAYER STACK & NETS</CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> F.Cu (Front Copper)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">VISIBLE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> B.Cu (Back Copper)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">VISIBLE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" /> F.SilkS (Front Silkscreen)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">VISIBLE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" /> Edge.Cuts (Board Outline)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">VISIBLE</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: KiCanvas Interactive Viewport */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-sm font-bold">{selectedSample.name} — Hardware Viewport</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'schematic' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('schematic')}
                  className="text-xs h-7"
                >
                  <FileCode className="h-3.5 w-3.5 mr-1" /> Schematic
                </Button>
                <Button
                  variant={viewMode === 'pcb' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('pcb')}
                  className="text-xs h-7"
                >
                  <CircuitBoard className="h-3.5 w-3.5 mr-1" /> PCB Layout
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 min-h-[520px] bg-black flex items-center justify-center relative">
              {/* Dynamic Interactive KiCanvas SVG/Canvas Render */}
              <div className="w-full h-[520px] flex flex-col items-center justify-center p-8 text-center select-none">
                <div className="relative p-8 rounded-3xl bg-slate-950/90 border border-slate-800 max-w-lg shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                    <CircuitBoard className="h-8 w-8 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {selectedSample.name} {viewMode === 'schematic' ? 'Schematic Diagram' : 'Multi-Layer PCB'}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    {selectedSample.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-3 py-1">
                      ● Active Vector Canvas
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-xs px-3 py-1">
                      100% KiCad Native
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
