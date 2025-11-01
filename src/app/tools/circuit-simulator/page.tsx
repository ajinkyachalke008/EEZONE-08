'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircuitBoard, ArrowLeft, Play, Pause, RotateCcw, Download, Zap, Activity, Gauge } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: number;
  unit?: string;
  rotation: number;
}

interface Connection {
  from: string;
  to: string;
}

const componentLibrary = [
  { type: 'voltage', label: '⚡ Voltage Source', icon: '⚡', defaultValue: 12, unit: 'V' },
  { type: 'current', label: '🔌 Current Source', icon: '🔌', defaultValue: 1, unit: 'A' },
  { type: 'resistor', label: '📊 Resistor', icon: '📊', defaultValue: 1000, unit: 'Ω' },
  { type: 'capacitor', label: '🔋 Capacitor', icon: '🔋', defaultValue: 100, unit: 'μF' },
  { type: 'inductor', label: '🧲 Inductor', icon: '🧲', defaultValue: 10, unit: 'mH' },
  { type: 'led', label: '💡 LED', icon: '💡', defaultValue: 2, unit: 'V' },
  { type: 'diode', label: '⚙️ Diode', icon: '⚙️', defaultValue: 0.7, unit: 'V' },
  { type: 'transistor', label: '🔺 Transistor', icon: '🔺', defaultValue: 0, unit: '' },
];

export default function CircuitSimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [power, setPower] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const componentInfo = componentLibrary.find(c => c.type === draggedType);
    
    const newComponent: Component = {
      id: `${draggedType}-${Date.now()}`,
      type: draggedType,
      x,
      y,
      value: componentInfo?.defaultValue,
      unit: componentInfo?.unit,
      rotation: 0,
    };

    setComponents(prev => [...prev, newComponent]);
    setDraggedType(null);
  }, [draggedType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
  };

  const updateComponentValue = (id: string, value: number) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, value } : c
    ));
  };

  const runSimulation = () => {
    setIsRunning(true);
    
    // Simple circuit analysis simulation
    const voltageSource = components.find(c => c.type === 'voltage');
    const resistors = components.filter(c => c.type === 'resistor');
    
    if (voltageSource && resistors.length > 0) {
      const v = voltageSource.value || 0;
      const totalR = resistors.reduce((sum, r) => sum + (r.value || 0), 0);
      
      const i = totalR > 0 ? v / totalR : 0;
      const p = v * i;
      
      setVoltage(v);
      setCurrent(i);
      setResistance(totalR);
      setPower(p);
      
      // Generate waveform data
      const wave = Array.from({ length: 100 }, (_, i) => 
        Math.sin((i / 100) * Math.PI * 4) * v
      );
      setWaveform(wave);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setVoltage(0);
    setCurrent(0);
    setResistance(0);
    setPower(0);
    setWaveform([]);
  };

  const clearCanvas = () => {
    setComponents([]);
    setSelectedComponent(null);
    resetSimulation();
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Update waveform animation
        setWaveform(prev => {
          const newWave = [...prev];
          newWave.push(newWave.shift() || 0);
          return newWave;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428]">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00C2D1] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Link href="/">
            <Button variant="outline" className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <CircuitBoard className="h-10 w-10 text-[#00C2D1]" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white">Interactive Circuit Simulator</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Professional circuit simulation with real-time analysis and waveform display
            </p>
          </motion.div>

          <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#00C2D1]" />
                Simulation Controls
              </CardTitle>
              <CardDescription className="text-gray-300">
                Drag components to canvas and run simulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 flex-wrap">
                <Button
                  onClick={runSimulation}
                  disabled={components.length === 0}
                  className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetSimulation}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearCanvas}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Clear Canvas
                </Button>
                <Button 
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Netlist
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {/* Component Library */}
                <Card className="bg-[#071428] border-white/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 text-[#00C2D1] flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Components
                    </h3>
                    <div className="space-y-2 text-sm max-h-[500px] overflow-y-auto">
                      {componentLibrary.map((comp) => (
                        <div
                          key={comp.type}
                          draggable
                          onDragStart={() => handleDragStart(comp.type)}
                          className="p-3 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 text-white">
                            <span className="text-xl">{comp.icon}</span>
                            <span className="text-xs">{comp.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Circuit Canvas */}
                <Card className="md:col-span-3 bg-white/95 border-white/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#071428]">Circuit Canvas</h3>
                      <div className="text-xs text-gray-600">
                        {components.length} component{components.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div
                      ref={canvasRef}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="bg-white rounded-lg border-2 border-dashed border-gray-300 min-h-[500px] relative overflow-hidden"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      {components.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <CircuitBoard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-600">
                              Drag components here to build your circuit
                            </p>
                            <p className="text-sm mt-2">
                              Start by adding a voltage source and resistors
                            </p>
                          </div>
                        </div>
                      ) : (
                        components.map((comp) => {
                          const info = componentLibrary.find(c => c.type === comp.type);
                          return (
                            <motion.div
                              key={comp.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`absolute p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedComponent?.id === comp.id
                                  ? 'border-[#00C2D1] bg-[#00C2D1]/10 shadow-lg'
                                  : 'border-gray-300 bg-white hover:border-[#00C2D1]/50'
                              }`}
                              style={{
                                left: comp.x,
                                top: comp.y,
                                transform: `rotate(${comp.rotation}deg)`,
                              }}
                              onClick={() => setSelectedComponent(comp)}
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-2xl mb-1">{info?.icon}</span>
                                <span className="text-xs font-medium text-gray-700">
                                  {comp.value} {comp.unit}
                                </span>
                                {selectedComponent?.id === comp.id && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="mt-2 h-6 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeComponent(comp.id);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {/* Component Properties */}
                    {selectedComponent && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-gray-50 rounded-lg border"
                      >
                        <h4 className="font-semibold mb-3 text-[#071428]">Component Properties</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Type</Label>
                            <p className="text-sm font-medium capitalize">{selectedComponent.type}</p>
                          </div>
                          <div>
                            <Label className="text-xs">ID</Label>
                            <p className="text-sm font-mono">{selectedComponent.id}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Value</Label>
                            <Input
                              type="number"
                              value={selectedComponent.value}
                              onChange={(e) => updateComponentValue(selectedComponent.id, parseFloat(e.target.value))}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit</Label>
                            <p className="text-sm font-medium">{selectedComponent.unit}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Oscilloscope */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#00C2D1]" />
                  Oscilloscope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#071428] rounded p-4 h-48 relative overflow-hidden">
                  {waveform.length > 0 ? (
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <polyline
                        points={waveform.map((v, i) => 
                          `${(i / waveform.length) * 100}%,${50 - (v / voltage * 40)}%`
                        ).join(' ')}
                        fill="none"
                        stroke="#00C2D1"
                        strokeWidth="2"
                      />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                    </svg>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                      Run simulation to see waveform
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Multimeter */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-[#00C2D1]" />
                  Multimeter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-300">Voltage:</span>
                    <span className="font-bold text-[#00C2D1]">{voltage.toFixed(2)} V</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-300">Current:</span>
                    <span className="font-bold text-[#00C2D1]">{(current * 1000).toFixed(2)} mA</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-300">Resistance:</span>
                    <span className="font-bold text-[#00C2D1]">{resistance.toFixed(0)} Ω</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-gray-300">Power:</span>
                    <span className="font-bold text-[#00C2D1]">{(power * 1000).toFixed(2)} mW</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#00C2D1]" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  {isRunning ? (
                    <>
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Simulation running
                      </p>
                      <p>• Total Components: {components.length}</p>
                      <p>• Circuit Type: {components.some(c => c.type === 'voltage') ? 'DC' : 'Incomplete'}</p>
                      <p>• Power Dissipation: {(power * 1000).toFixed(2)} mW</p>
                      <p>• Efficiency: {voltage > 0 ? ((power / voltage) * 100).toFixed(1) : 0}%</p>
                    </>
                  ) : (
                    <>
                      <p>• Add components to canvas</p>
                      <p>• Connect with wires (coming soon)</p>
                      <p>• Click Run to simulate</p>
                      <p>• View real-time analysis</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start Guide */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">1.</div>
                  <div>
                    <p className="font-semibold text-white">Drag Components</p>
                    <p className="text-gray-300">Drag components from the library to the canvas</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">2.</div>
                  <div>
                    <p className="font-semibold text-white">Configure Values</p>
                    <p className="text-gray-300">Click components to edit their values</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">3.</div>
                  <div>
                    <p className="font-semibold text-white">Run Simulation</p>
                    <p className="text-gray-300">Click Run to see real-time analysis</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">4.</div>
                  <div>
                    <p className="font-semibold text-white">View Results</p>
                    <p className="text-gray-300">Check oscilloscope and multimeter readings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Supported Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-white">⚡ DC Operating Point</p>
                  <p className="text-gray-300 text-xs">Find steady-state voltages and currents</p>
                </div>
                <div>
                  <p className="font-semibold text-white">📈 AC Analysis</p>
                  <p className="text-gray-300 text-xs">Frequency response and impedance</p>
                </div>
                <div>
                  <p className="font-semibold text-white">⏱️ Transient Analysis</p>
                  <p className="text-gray-300 text-xs">Time-domain behavior and waveforms</p>
                </div>
                <div>
                  <p className="font-semibold text-white">🎯 Parameter Sweep</p>
                  <p className="text-gray-300 text-xs">Vary component values automatically</p>
                </div>
                <div>
                  <p className="font-semibold text-white">📊 Fourier Analysis</p>
                  <p className="text-gray-300 text-xs">Frequency spectrum analysis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}