'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  RotateCw,
  Activity,
  Gauge,
  Compass,
  ArrowLeft,
  Flame,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { AnalogMeter } from '@/components/machines/analog-meter';
import { DCMotorStarter } from '@/components/machines/dc-motor-starter';
import { soundEngine } from '@/lib/audio/lab-sound-engine';

export default function ElectricalMachinesLabPage() {
  // 1. DC Motor State
  const [supplyVoltage, setSupplyVoltage] = useState(220); // V
  const [fieldRheostat, setFieldRheostat] = useState(200); // Ohms (Rf)
  const [armatureRheostat, setArmatureRheostat] = useState(0); // Ohms (Ra ext)
  const [motorLoadTorque, setMotorLoadTorque] = useState(5.0); // N-m
  const [starterStep, setStarterStep] = useState(4); // 0 (OFF) to 4 (RUN)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // 2. Transformer State
  const [transformerRating] = useState(5); // 5 kVA
  const [loadPercentage, setLoadPercentage] = useState(80); // 0 to 120%
  const [powerFactor, setPowerFactor] = useState(0.85); // lagging

  // 3. Two-Wattmeter 3-Phase State
  const [lineVoltage, setLineVoltage] = useState(415); // V RMS
  const [lineCurrent, setLineCurrent] = useState(10); // A RMS
  const [phaseAngleDeg, setPhaseAngleDeg] = useState(30); // degrees

  // 4. 3-Phase Induction Motor State
  const [imRotorSpeed, setImRotorSpeed] = useState(1440); // RPM
  const [imRotorRext, setImRotorRext] = useState(0.0); // Ohms external rotor resistance

  // === DC Motor Equations ===
  const starterResistances = [Infinity, 15.0, 8.0, 3.0, 0.0];
  const RaStarter = starterResistances[starterStep] || 0.0;
  const isStarterRunning = starterStep > 0;

  const Ra = 0.5 + armatureRheostat + (isStarterRunning ? RaStarter : 9999);
  const If = isStarterRunning ? supplyVoltage / fieldRheostat : 0;
  const flux = isStarterRunning ? Math.max(0.1, If * 0.8) : 0;
  const Ia = isStarterRunning ? Math.min(50, Math.max(1, motorLoadTorque / (0.15 * Math.max(0.1, flux)))) : 0;
  const Eb = isStarterRunning ? Math.max(0, supplyVoltage - Ia * Ra) : 0;
  const speedRPM = isStarterRunning ? Math.round(Eb / (0.12 * Math.max(0.1, flux))) : 0;
  const motorPowerOut = isStarterRunning ? (motorLoadTorque * (2 * Math.PI * speedRPM / 60)).toFixed(0) : '0';

  // === Transformer Calculations ===
  const P_core = 85; // Watts iron loss
  const P_cu_full = 160; // Watts full load copper loss
  const loadFraction = loadPercentage / 100;
  const P_cu_actual = P_cu_full * Math.pow(loadFraction, 2);
  const P_out = transformerRating * 1000 * loadFraction * powerFactor;
  const totalLoss = P_core + P_cu_actual;
  const efficiency = ((P_out / (P_out + totalLoss)) * 100).toFixed(2);
  const regulation = (((loadFraction * (0.02 * powerFactor + 0.04 * Math.sin(Math.acos(powerFactor))))) * 100).toFixed(2);

  // === Two-Wattmeter Calculations ===
  const phiRad = (phaseAngleDeg * Math.PI) / 180;
  const W1 = lineVoltage * lineCurrent * Math.cos((30 * Math.PI / 180) - phiRad);
  const W2 = lineVoltage * lineCurrent * Math.cos((30 * Math.PI / 180) + phiRad);
  const total3PhasePower = (W1 + W2) / 1000; // kW
  const calculatedPF = Math.cos(phiRad).toFixed(3);

  // === 3-Phase Induction Motor Calculations (Steinmetz Equivalent) ===
  const imNs = 1500; // Synchronous speed RPM
  const imSlip = Math.max(0.005, (imNs - imRotorSpeed) / imNs);
  const imR2Tot = 0.332 + imRotorRext;
  const imVph = 415 / Math.sqrt(3); // 239.6 V phase
  const imWs = (2 * Math.PI * imNs) / 60; // 157.08 rad/s
  const imVth = imVph * (26.3 / (1.106 + 26.3));
  const imRth = 0.641 * Math.pow(26.3 / (1.106 + 26.3), 2);
  const imXth = 1.106;
  const imX2 = 0.464;
  const imTorque = (3 / imWs) * (Math.pow(imVth, 2) * (imR2Tot / imSlip)) / (Math.pow(imRth + imR2Tot / imSlip, 2) + Math.pow(imXth + imX2, 2));
  const imPmech = (imTorque * ((2 * Math.PI * imRotorSpeed) / 60)) / 1000;
  const imStatorCurrent = imVph / Math.sqrt(Math.pow(0.641 + imR2Tot / imSlip, 2) + Math.pow(1.106 + imX2, 2));

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
                <RotateCw className="h-6 w-6 text-amber-400 animate-spin-slow" />
                Electrical Machines & Power Systems Lab
              </h1>
              <p className="text-xs text-slate-400">
                IIT Roorkee Virtual Labs & Bhilai EE Ecosystem • Analog Dial Gauges • 4-Point Starter • Rotating Phasor Vectors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Laboratory Workbench */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="dc_motor" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="dc_motor" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold">
              ⚡ 1. DC Motor Speed Control & 4-Point Starter
            </TabsTrigger>
            <TabsTrigger value="transformer" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-bold">
              🔄 2. Single-Phase Transformer OC / SC Test
            </TabsTrigger>
            <TabsTrigger value="three_phase" className="text-xs data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold">
              📐 3. Two-Wattmeter 3-Phase Power & Phasor
            </TabsTrigger>
            <TabsTrigger value="induction_motor" className="text-xs data-[state=active]:bg-emerald-500 data-[state=active]:text-black font-bold">
              🌀 4. 3-Phase Induction Motor & Torque-Speed Curve
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DC MOTOR SPEED CONTROL */}
          <TabsContent value="dc_motor" className="space-y-6">
            {/* Analog Panel Meters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnalogMeter label="DC Supply Voltmeter" unit="V" value={supplyVoltage} min={0} max={300} type="voltage" />
              <AnalogMeter label="Armature Ammeter" unit="A" value={Ia} min={0} max={50} type="current" />
              <AnalogMeter label="Field Ammeter" unit="A" value={If} min={0} max={3} type="current" />
              <AnalogMeter label="Tachometer Speed" unit="RPM" value={speedRPM} min={0} max={3000} type="speed" />
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Rheostat Controls */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-400">
                      <Gauge className="h-4 w-4" /> Machine Rheostats & Torque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Field Rheostat (Rf):</span>
                        <span className="text-amber-400 font-mono font-bold">{fieldRheostat} Ω (If = {If.toFixed(2)} A)</span>
                      </div>
                      <Slider value={[fieldRheostat]} min={100} max={500} step={10} onValueChange={(v) => setFieldRheostat(v[0])} />
                      <p className="text-[10px] text-slate-400 mt-1">Field weakening control (N &gt; Base Speed).</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Armature Rheostat (Ra Ext):</span>
                        <span className="text-cyan-400 font-mono font-bold">{armatureRheostat} Ω (Total Ra = {Ra.toFixed(1)} Ω)</span>
                      </div>
                      <Slider value={[armatureRheostat]} min={0} max={10} step={0.5} onValueChange={(v) => setArmatureRheostat(v[0])} />
                      <p className="text-[10px] text-slate-400 mt-1">Armature resistance voltage drop control (N &lt; Base Speed).</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Mechanical Load Torque:</span>
                        <span className="text-purple-400 font-mono font-bold">{motorLoadTorque.toFixed(1)} N-m</span>
                      </div>
                      <Slider value={[motorLoadTorque]} min={0.5} max={15} step={0.5} onValueChange={(v) => setMotorLoadTorque(v[0])} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: 4-Point Starter & Machine Cutaway */}
              <div className="lg:col-span-7">
                <DCMotorStarter
                  starterStep={starterStep}
                  onStarterStepChange={setStarterStep}
                  speedRPM={speedRPM}
                  armatureCurrent={Ia}
                  isOverloaded={Ia > 40}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TRANSFORMER TEST */}
          <TabsContent value="transformer" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnalogMeter label="Primary Voltmeter (V1)" unit="V" value={230} min={0} max={300} type="voltage" />
              <AnalogMeter label="Secondary Ammeter (I2)" unit="A" value={(transformerRating * 1000 * loadFraction) / 230} min={0} max={30} type="current" />
              <AnalogMeter label="Wattmeter (Pin)" unit="kW" value={(P_out + totalLoss) / 1000} min={0} max={8} type="power" />
              <AnalogMeter label="Efficiency Gauge" unit="%" value={parseFloat(efficiency)} min={50} max={100} type="speed" />
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-cyan-400">Loading & Power Factor Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Transformer Load:</span>
                        <span className="text-cyan-400 font-mono font-bold">{loadPercentage}% ({((transformerRating * loadPercentage) / 100).toFixed(1)} kVA)</span>
                      </div>
                      <Slider value={[loadPercentage]} min={10} max={125} step={5} onValueChange={(v) => setLoadPercentage(v[0])} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Load Power Factor (cos φ):</span>
                        <span className="text-purple-400 font-mono font-bold">{powerFactor.toFixed(2)} Lagging</span>
                      </div>
                      <Slider value={[powerFactor]} min={0.5} max={1.0} step={0.02} onValueChange={(v) => setPowerFactor(v[0])} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-cyan-300">5 kVA Transformer Performance & Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono mb-6">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Efficiency (η)</span>
                        <span className="text-xl font-bold text-emerald-400">{efficiency}%</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">% Voltage Regulation</span>
                        <span className="text-xl font-bold text-amber-400">{regulation}%</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Iron Loss (Pi)</span>
                        <span className="text-lg font-bold text-slate-300">{P_core} W</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Copper Loss (Pcu)</span>
                        <span className="text-lg font-bold text-rose-400">{P_cu_actual.toFixed(1)} W</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: TWO-WATTMETER 3-PHASE & PHASOR DIAGRAM */}
          <TabsContent value="three_phase" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnalogMeter label="Wattmeter 1 (W1)" unit="kW" value={W1 / 1000} min={-2} max={10} type="power" />
              <AnalogMeter label="Wattmeter 2 (W2)" unit="kW" value={W2 / 1000} min={-2} max={10} type="power" />
              <AnalogMeter label="Line Voltage (VL)" unit="V" value={lineVoltage} min={0} max={500} type="voltage" />
              <AnalogMeter label="Line Current (IL)" unit="A" value={lineCurrent} min={0} max={30} type="current" />
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-purple-400">3-Phase System Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Line Voltage (VL):</span>
                        <span className="text-purple-400 font-mono font-bold">{lineVoltage} V RMS</span>
                      </div>
                      <Slider value={[lineVoltage]} min={200} max={440} step={5} onValueChange={(v) => setLineVoltage(v[0])} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Line Current (IL):</span>
                        <span className="text-cyan-400 font-mono font-bold">{lineCurrent} A RMS</span>
                      </div>
                      <Slider value={[lineCurrent]} min={1} max={30} step={1} onValueChange={(v) => setLineCurrent(v[0])} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Phase Angle (φ):</span>
                        <span className="text-amber-400 font-mono font-bold">{phaseAngleDeg}° (PF = {calculatedPF})</span>
                      </div>
                      <Slider value={[phaseAngleDeg]} min={0} max={85} step={1} onValueChange={(v) => setPhaseAngleDeg(v[0])} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800 flex justify-between items-center">
                    <CardTitle className="text-sm font-bold text-purple-300">Two-Wattmeter Method & Balanced Phasor</CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs font-mono">
                      P_total: {total3PhasePower.toFixed(2)} kW
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center">
                    {/* SVG Rotating Phasor Diagram */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-sm">
                      <svg width="240" height="240" viewBox="-120 -120 240 240" className="overflow-visible select-none">
                        <circle cx="0" cy="0" r="90" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                        
                        {/* VR Phase (Red) */}
                        <line x1="0" y1="0" x2="90" y2="0" stroke="#EF4444" strokeWidth="3" />
                        <text x="96" y="4" fill="#EF4444" fontSize="11" fontWeight="bold">VR (0°)</text>

                        {/* VY Phase (Yellow) */}
                        <line x1="0" y1="0" x2="-45" y2="77.9" stroke="#EAB308" strokeWidth="3" />
                        <text x="-58" y="90" fill="#EAB308" fontSize="11" fontWeight="bold">VY (-120°)</text>

                        {/* VB Phase (Blue) */}
                        <line x1="0" y1="0" x2="-45" y2="-77.9" stroke="#3B82F6" strokeWidth="3" />
                        <text x="-58" y="-85" fill="#3B82F6" fontSize="11" fontWeight="bold">VB (-240°)</text>

                        {/* IR Current vector */}
                        <line
                          x1="0"
                          y1="0"
                          x2={65 * Math.cos(-phiRad)}
                          y2={65 * Math.sin(phiRad)}
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeDasharray="4,2"
                        />
                        <text
                          x={70 * Math.cos(-phiRad)}
                          y={70 * Math.sin(phiRad) + 4}
                          fill="#10B981"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          IR ({phaseAngleDeg}°)
                        </text>
                      </svg>
                      <span className="text-[10px] font-mono text-slate-400 mt-4">
                        3-Phase Balanced Vector Diagram (R-Y-B Sequence)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: 3-PHASE INDUCTION MOTOR & TORQUE-SPEED CURVE */}
          <TabsContent value="induction_motor" className="space-y-6">
            {/* Analog Panel Meters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnalogMeter label="Stator Current (I1)" unit="A" value={imStatorCurrent} min={0} max={60} type="current" />
              <AnalogMeter label="Electromagnetic Torque" unit="N-m" value={imTorque} min={0} max={120} type="power" />
              <AnalogMeter label="Rotor Speed (N)" unit="RPM" value={imRotorSpeed} min={0} max={1500} type="speed" />
              <AnalogMeter label="Mechanical Power" unit="kW" value={imPmech} min={0} max={15} type="power" />
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Motor Speed & Rotor Resistance Controls */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-emerald-400">
                      Induction Motor Operating Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Rotor Speed (N):</span>
                        <span className="text-emerald-400 font-mono font-bold">{imRotorSpeed} RPM (Slip s = {imSlip.toFixed(3)})</span>
                      </div>
                      <Slider value={[imRotorSpeed]} min={0} max={1495} step={5} onValueChange={(v) => setImRotorSpeed(v[0])} />
                      <p className="text-[10px] text-slate-400 mt-1">Synchronous speed Ns = 1500 RPM (50Hz, 4-Pole).</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-bold">Slip-Ring External Rotor Res (R_ext):</span>
                        <span className="text-amber-400 font-mono font-bold">{imRotorRext.toFixed(2)} Ω (Total R2 = {imR2Tot.toFixed(3)} Ω)</span>
                      </div>
                      <Slider value={[imRotorRext]} min={0} max={2.0} step={0.05} onValueChange={(v) => setImRotorRext(v[0])} />
                      <p className="text-[10px] text-slate-400 mt-1">Adding rotor resistance increases starting torque and shifts peak torque to higher slip.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Live Dynamic Torque-Speed Curve Canvas */}
              <div className="lg:col-span-7">
                <Card className="bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-2xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <CardTitle className="text-sm font-bold text-emerald-300">
                      Steinmetz Torque vs Speed Characteristic Curve
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-mono">
                      Torque: {imTorque.toFixed(1)} N-m @ {imRotorSpeed} RPM
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center">
                    {/* SVG Dynamic Torque-Speed Graph */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 w-full overflow-hidden shadow-inner">
                      <svg viewBox="0 0 400 200" className="w-full h-auto overflow-visible select-none">
                        {/* Axes */}
                        <line x1="40" y1="170" x2="380" y2="170" stroke="#475569" strokeWidth="1.5" />
                        <line x1="40" y1="20" x2="40" y2="170" stroke="#475569" strokeWidth="1.5" />
                        
                        {/* Axis Labels */}
                        <text x="380" y="185" fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="end">Speed N (RPM)</text>
                        <text x="25" y="25" fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 25 25)">Torque (N-m)</text>

                        {/* Grid Ticks */}
                        <text x="40" y="185" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="middle">0 (s=1)</text>
                        <text x="150" y="185" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="middle">500</text>
                        <text x="260" y="185" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="middle">1000</text>
                        <text x="370" y="185" fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="middle">1500 (Ns)</text>

                        {/* Full Theoretical Torque-Speed Curve Path */}
                        {(() => {
                          const points: string[] = [];
                          for (let n = 0; n <= 1495; n += 25) {
                            const s = Math.max(0.005, (1500 - n) / 1500);
                            const tq = (3 / imWs) * (Math.pow(imVth, 2) * (imR2Tot / s)) / (Math.pow(imRth + imR2Tot / s, 2) + Math.pow(imXth + imX2, 2));
                            const gx = 40 + (n / 1500) * 330;
                            const gy = 170 - (tq / 120) * 140;
                            points.push(`${gx.toFixed(1)},${gy.toFixed(1)}`);
                          }
                          return (
                            <polyline
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="3"
                              points={points.join(' ')}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          );
                        })()}

                        {/* Operating Point Indicator Marker */}
                        {(() => {
                          const gx = 40 + (imRotorSpeed / 1500) * 330;
                          const gy = 170 - (imTorque / 120) * 140;
                          return (
                            <g>
                              <line x1={gx} y1="170" x2={gx} y2={gy} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,3" />
                              <circle cx={gx} cy={gy} r="6" fill="#F59E0B" stroke="#FFF" strokeWidth="2" className="shadow-[0_0_12px_#F59E0B]" />
                            </g>
                          );
                        })()}
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
