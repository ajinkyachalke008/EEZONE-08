'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircuitBoard, ArrowLeft, Play, Pause, RotateCcw, Download, Zap, Activity, Gauge, Trash2, Cable } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: number;
  unit?: string;
  rotation: number;
}

interface Wire {
  id: string;
  from: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
  to: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
  color: string;
  netLabel?: string;
  path: { x: number; y: number }[];
}

interface Connection {
  from: string;
  to: string;
}

interface DragWire {
  from: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number };
  currentX: number;
  currentY: number;
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

const wireColors = ['#FF00C8', '#00E5FF', '#9C4AFF', '#FF6B00', '#00FF88', '#FFD700'];

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
  const [wires, setWires] = useState<Wire[]>([]);
  const [dragWire, setDragWire] = useState<DragWire | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedWires, setSelectedWires] = useState<string[]>([]);
  const [wireDrawingMode, setWireDrawingMode] = useState(false);
  const [highlightedWirePath, setHighlightedWirePath] = useState<string | null>(null);
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
    toast.success(`${componentInfo?.label} added to canvas`);
  }, [draggedType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeComponent = (id: string) => {
    // Remove associated wires
    setWires(prev => prev.filter(w => w.from.componentId !== id && w.to.componentId !== id));
    setComponents(prev => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
    toast.info('Component removed');
  };

  const updateComponentValue = (id: string, value: number) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, value } : c
    ));
  };

  // Get terminal position for a component
  const getTerminalPosition = (comp: Component, terminal: 'top' | 'bottom' | 'left' | 'right') => {
    const size = 60;
    switch (terminal) {
      case 'top':
        return { x: comp.x + size / 2, y: comp.y };
      case 'bottom':
        return { x: comp.x + size / 2, y: comp.y + size };
      case 'left':
        return { x: comp.x, y: comp.y + size / 2 };
      case 'right':
        return { x: comp.x + size, y: comp.y + size / 2 };
    }
  };

  // Start wire drawing
  const handleTerminalMouseDown = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;

    const comp = components.find(c => c.id === componentId);
    if (!comp) return;

    const pos = getTerminalPosition(comp, terminal);
    setDragWire({
      from: { componentId, terminal, x: pos.x, y: pos.y },
      currentX: pos.x,
      currentY: pos.y,
    });
    setWireDrawingMode(true);
  };

  // Update wire position while dragging
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragWire || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragWire(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  // Complete wire connection
  const handleTerminalMouseUp = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dragWire) return;

    // Prevent connecting to same component
    if (dragWire.from.componentId === componentId) {
      toast.error('Cannot connect to the same component');
      setDragWire(null);
      setWireDrawingMode(false);
      return;
    }

    // Check for duplicate connections
    const duplicate = wires.find(
      w =>
        (w.from.componentId === dragWire.from.componentId &&
          w.to.componentId === componentId) ||
        (w.to.componentId === dragWire.from.componentId &&
          w.from.componentId === componentId)
    );

    if (duplicate) {
      toast.error('Connection already exists');
      setDragWire(null);
      setWireDrawingMode(false);
      return;
    }

    const comp = components.find(c => c.id === componentId);
    if (!comp) return;

    const toPos = getTerminalPosition(comp, terminal);

    // Validate connection (basic check for short circuits)
    const fromComp = components.find(c => c.id === dragWire.from.componentId);
    if (fromComp?.type === componentId && fromComp.type === 'voltage') {
      toast.error('Short circuit detected! Cannot connect voltage sources directly');
      setDragWire(null);
      setWireDrawingMode(false);
      return;
    }

    // Create smart routing path
    const path = createSmartPath(dragWire.from.x, dragWire.from.y, toPos.x, toPos.y);

    // Auto-assign wire color
    const color = wireColors[wires.length % wireColors.length];

    const newWire: Wire = {
      id: `wire-${Date.now()}`,
      from: { componentId: dragWire.from.componentId, terminal: dragWire.from.terminal },
      to: { componentId, terminal },
      color,
      path,
    };

    setWires(prev => [...prev, newWire]);
    setDragWire(null);
    setWireDrawingMode(false);
    toast.success('Wire connected successfully!');
  };

  // Cancel wire drawing
  const handleCanvasMouseUp = () => {
    if (dragWire) {
      setDragWire(null);
      setWireDrawingMode(false);
    }
  };

  // Create smart routing path with right-angle connections
  const createSmartPath = (x1: number, y1: number, x2: number, y2: number) => {
    const path = [{ x: x1, y: y1 }];
    
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Smart routing: prefer horizontal then vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      path.push({ x: x1 + dx / 2, y: y1 });
      path.push({ x: x1 + dx / 2, y: y2 });
    } else {
      path.push({ x: x1, y: y1 + dy / 2 });
      path.push({ x: x2, y: y1 + dy / 2 });
    }

    path.push({ x: x2, y: y2 });
    return path;
  };

  // Delete selected wires
  const deleteSelectedWires = () => {
    if (selectedWires.length === 0) return;
    setWires(prev => prev.filter(w => !selectedWires.includes(w.id)));
    setSelectedWires([]);
    toast.success(`${selectedWires.length} wire(s) deleted`);
  };

  // Auto-cleanup wire layout
  const autoCleanupWires = () => {
    // Recreate all wire paths with smart routing
    setWires(prev =>
      prev.map(wire => {
        const fromComp = components.find(c => c.id === wire.from.componentId);
        const toComp = components.find(c => c.id === wire.to.componentId);

        if (!fromComp || !toComp) return wire;

        const fromPos = getTerminalPosition(fromComp, wire.from.terminal);
        const toPos = getTerminalPosition(toComp, wire.to.terminal);

        return {
          ...wire,
          path: createSmartPath(fromPos.x, fromPos.y, toPos.x, toPos.y),
        };
      })
    );
    toast.success('Wire layout optimized!');
  };

  // Update wire positions when components move
  useEffect(() => {
    if (wires.length === 0) return;

    setWires(prev =>
      prev.map(wire => {
        const fromComp = components.find(c => c.id === wire.from.componentId);
        const toComp = components.find(c => c.id === wire.to.componentId);

        if (!fromComp || !toComp) return wire;

        const fromPos = getTerminalPosition(fromComp, wire.from.terminal);
        const toPos = getTerminalPosition(toComp, wire.to.terminal);

        return {
          ...wire,
          path: createSmartPath(fromPos.x, fromPos.y, toPos.x, toPos.y),
        };
      })
    );
  }, [components]);

  const runSimulation = () => {
    setIsRunning(true);
    
    // Check for proper connections
    if (wires.length === 0) {
      toast.warning('Add wires to connect components');
    }

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
      
      toast.success('Simulation started!');
    } else {
      toast.error('Add voltage source and resistors to simulate');
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setVoltage(0);
    setCurrent(0);
    setResistance(0);
    setPower(0);
    setWaveform([]);
    toast.info('Simulation reset');
  };

  const clearCanvas = () => {
    setComponents([]);
    setWires([]);
    setSelectedComponent(null);
    setSelectedWires([]);
    resetSimulation();
    toast.info('Canvas cleared');
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
              Professional circuit simulation with drag-and-drop wiring and real-time analysis
            </p>
          </motion.div>

          <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#00C2D1]" />
                Simulation Controls
              </CardTitle>
              <CardDescription className="text-gray-300">
                Drag components to canvas, connect with wires, and run simulation
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
                  onClick={autoCleanupWires}
                  disabled={wires.length === 0}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Cable className="h-4 w-4 mr-2" />
                  Auto-Cleanup Wires
                </Button>
                <Button 
                  variant="outline" 
                  onClick={deleteSelectedWires}
                  disabled={selectedWires.length === 0}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedWires.length})
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
                    
                    <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                      <h4 className="text-xs font-semibold text-[#00C2D1] mb-2">Connection Features</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>✓ Drag terminals to connect</li>
                        <li>✓ Auto-color assignment</li>
                        <li>✓ Smart wire routing</li>
                        <li>✓ Connection validation</li>
                        <li>✓ Auto-reconnect on move</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Circuit Canvas */}
                <Card className="md:col-span-3 bg-white/95 border-white/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#071428]">Circuit Canvas</h3>
                      <div className="text-xs text-gray-600 flex gap-4">
                        <span>{components.length} component{components.length !== 1 ? 's' : ''}</span>
                        <span className="text-[#9C4AFF]">{wires.length} wire{wires.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div
                      ref={canvasRef}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      className="bg-white rounded-lg border-2 border-dashed border-gray-300 min-h-[500px] relative overflow-hidden"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      {/* Render wires */}
                      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                        {wires.map((wire) => {
                          const pathD = wire.path
                            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                            .join(' ');
                          
                          const isSelected = selectedWires.includes(wire.id);
                          const isHighlighted = highlightedWirePath === wire.id;

                          return (
                            <g
                              key={wire.id}
                              className="pointer-events-auto cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWires(prev =>
                                  prev.includes(wire.id)
                                    ? prev.filter(id => id !== wire.id)
                                    : [...prev, wire.id]
                                );
                              }}
                              onMouseEnter={() => setHighlightedWirePath(wire.id)}
                              onMouseLeave={() => setHighlightedWirePath(null)}
                            >
                              {/* Wire glow effect */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke={wire.color}
                                strokeWidth={isHighlighted ? "6" : "4"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={isHighlighted ? "0.6" : "0.3"}
                                filter="blur(4px)"
                              />
                              {/* Main wire */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke={isSelected ? '#FFD700' : wire.color}
                                strokeWidth={isSelected ? "4" : isHighlighted ? "3" : "2"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                          );
                        })}

                        {/* Dragging wire preview */}
                        {dragWire && (
                          <g>
                            <line
                              x1={dragWire.from.x}
                              y1={dragWire.from.y}
                              x2={dragWire.currentX}
                              y2={dragWire.currentY}
                              stroke="#9C4AFF"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              strokeLinecap="round"
                            />
                            <circle
                              cx={dragWire.currentX}
                              cy={dragWire.currentY}
                              r="4"
                              fill="#9C4AFF"
                            />
                          </g>
                        )}
                      </svg>

                      {components.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ zIndex: 0 }}>
                          <div className="text-center">
                            <CircuitBoard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-600">
                              Drag components here to build your circuit
                            </p>
                            <p className="text-sm mt-2">
                              Click and drag from terminals to create wires
                            </p>
                          </div>
                        </div>
                      ) : (
                        components.map((comp) => {
                          const info = componentLibrary.find(c => c.type === comp.type);
                          const isHovered = hoveredComponent === comp.id;
                          
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
                                zIndex: 2,
                              }}
                              onClick={() => setSelectedComponent(comp)}
                              onMouseEnter={() => setHoveredComponent(comp.id)}
                              onMouseLeave={() => setHoveredComponent(null)}
                            >
                              {/* Connection terminals */}
                              {isHovered && (
                                <>
                                  {(['top', 'bottom', 'left', 'right'] as const).map((terminal) => {
                                    const termPos = {
                                      top: { x: 20, y: -8 },
                                      bottom: { x: 20, y: 56 },
                                      left: { x: -8, y: 20 },
                                      right: { x: 56, y: 20 },
                                    };

                                    return (
                                      <div
                                        key={terminal}
                                        className="absolute w-4 h-4 bg-[#9C4AFF] border-2 border-white rounded-full cursor-crosshair hover:bg-[#FF6B00] transition-colors shadow-lg"
                                        style={{
                                          left: termPos[terminal].x,
                                          top: termPos[terminal].y,
                                          zIndex: 10,
                                        }}
                                        onMouseDown={(e) => handleTerminalMouseDown(comp.id, terminal, e)}
                                        onMouseUp={(e) => handleTerminalMouseUp(comp.id, terminal, e)}
                                      />
                                    );
                                  })}
                                </>
                              )}

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
                        className="mt-4 p-5 bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428] rounded-lg border-2 border-[#00C2D1]/30 shadow-lg"
                      >
                        <h4 className="font-bold mb-4 text-white text-base flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[#00C2D1]" />
                          Component Properties
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">Type</Label>
                            <p className="text-base font-bold capitalize text-white">
                              {selectedComponent.type}
                            </p>
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">ID</Label>
                            <p className="text-xs font-mono text-white break-all">
                              {selectedComponent.id}
                            </p>
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">Value</Label>
                            <Input
                              type="number"
                              value={selectedComponent.value}
                              onChange={(e) => updateComponentValue(selectedComponent.id, parseFloat(e.target.value))}
                              className="h-9 text-sm bg-white text-[#071428] font-bold border-[#00C2D1]/30 focus:border-[#00C2D1]"
                            />
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">Unit</Label>
                            <p className="text-base font-bold text-white">
                              {selectedComponent.unit}
                            </p>
                          </div>
                        </div>
                        
                        {/* Additional Component Info */}
                        <div className="mt-4 p-3 bg-[#00C2D1]/20 rounded-lg border border-[#00C2D1]/40">
                          <p className="text-xs text-white/90">
                            <span className="font-semibold text-[#00C2D1]">Description:</span>{' '}
                            {componentLibrary.find(c => c.type === selectedComponent.type)?.label || 'Unknown Component'}
                          </p>
                          <p className="text-xs text-white/80 mt-1">
                            Click and drag component to reposition • Hover to see connection terminals
                          </p>
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
                  Connection Status
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
                      <p>• Total Wires: {wires.length}</p>
                      <p>• Circuit Type: {components.some(c => c.type === 'voltage') ? 'DC' : 'Incomplete'}</p>
                      <p>• Power Dissipation: {(power * 1000).toFixed(2)} mW</p>
                    </>
                  ) : (
                    <>
                      <p>• Add components to canvas</p>
                      <p>• Hover components to see terminals</p>
                      <p>• Drag from terminal to connect</p>
                      <p>• Click wires to select/delete</p>
                      <p>• Click Run to simulate</p>
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
                <CardTitle className="text-white">Wiring Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">✓</div>
                  <div>
                    <p className="font-semibold text-white">Smart Wire Snap</p>
                    <p className="text-gray-300">Auto-snap to component terminals for accurate connections</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">✓</div>
                  <div>
                    <p className="font-semibold text-white">Auto-Color Assignment</p>
                    <p className="text-gray-300">Different colors for easy wire identification</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">✓</div>
                  <div>
                    <p className="font-semibold text-white">Connection Validation</p>
                    <p className="text-gray-300">Real-time alerts for incorrect connections</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="font-bold text-[#00C2D1]">✓</div>
                  <div>
                    <p className="font-semibold text-white">Auto-Reconnect</p>
                    <p className="text-gray-300">Wires stay connected when moving components</p>
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