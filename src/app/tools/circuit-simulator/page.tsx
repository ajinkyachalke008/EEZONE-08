'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CircuitBoard, ArrowLeft, Play, Pause, RotateCcw, Download, Zap, Activity, 
  Gauge, Trash2, Cable, Link2, AlertTriangle, CheckCircle, Info, FileCode,
  Search, Filter, BookOpen, Save, Upload, Sparkles, Bug
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  COMPONENT_LIBRARY, 
  COMPONENT_CATEGORIES, 
  getComponentsByCategory, 
  searchComponents,
  type ComponentDefinition 
} from '@/lib/circuit-components';
import { 
  CIRCUIT_TEMPLATES, 
  getTemplatesByCategory, 
  getTemplateById,
  type CircuitTemplate 
} from '@/lib/circuit-templates';
import { 
  validateCircuit, 
  autoLabelNets, 
  buildNetlist,
  type ValidationError 
} from '@/lib/circuit-validator';

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

const wireColors = ['#FF00C8', '#00E5FF', '#9C4AFF', '#FF6B00', '#00FF88', '#FFD700'];

export default function CircuitSimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [power, setPower] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [dragWire, setDragWire] = useState<DragWire | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [hoveredTerminal, setHoveredTerminal] = useState<{ componentId: string; terminal: string } | null>(null);
  const [selectedWires, setSelectedWires] = useState<string[]>([]);
  const [wireDrawingMode, setWireDrawingMode] = useState(false);
  const [highlightedWirePath, setHighlightedWirePath] = useState<string | null>(null);
  const [showAllTerminals, setShowAllTerminals] = useState(false);
  
  // New states
  const [selectedCategory, setSelectedCategory] = useState<string>('power');
  const [componentSearch, setComponentSearch] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CircuitTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'dc' | 'ac' | 'transient'>('dc');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get filtered components
  const filteredComponents = componentSearch 
    ? searchComponents(componentSearch)
    : getComponentsByCategory(selectedCategory);

  // Load template
  const loadTemplate = (template: CircuitTemplate) => {
    setComponents(template.components);
    setWires(template.wires.map(w => ({
      ...w,
      path: createSmartPath(
        template.components.find(c => c.id === w.from.componentId)!.x,
        template.components.find(c => c.id === w.from.componentId)!.y,
        template.components.find(c => c.id === w.to.componentId)!.x,
        template.components.find(c => c.id === w.to.componentId)!.y
      )
    })));
    setSelectedTemplate(template);
    setShowTemplates(false);
    toast.success(`Loaded template: ${template.name}`);
  };

  // Run validation
  const runValidation = () => {
    const errors = validateCircuit(components, wires);
    setValidationErrors(errors);
    setShowValidation(true);
    
    if (errors.length === 0) {
      toast.success('✓ No issues found! Circuit looks good.');
    } else {
      const errorCount = errors.filter(e => e.type === 'error').length;
      const warningCount = errors.filter(e => e.type === 'warning').length;
      toast.warning(`Found ${errorCount} error(s) and ${warningCount} warning(s)`);
    }
  };

  // Auto-label nets
  const autoLabel = () => {
    const labeledWires = autoLabelNets(wires, components);
    setWires(labeledWires);
    toast.success('✓ Net labels updated automatically');
  };

  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const componentInfo = COMPONENT_LIBRARY.find(c => c.type === draggedType);
    
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
    const removedWireCount = wires.filter(w => w.from.componentId === id || w.to.componentId === id).length;
    setWires(prev => prev.filter(w => w.from.componentId !== id && w.to.componentId !== id));
    setComponents(prev => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
    toast.info(`Component removed${removedWireCount > 0 ? ` (${removedWireCount} wire${removedWireCount !== 1 ? 's' : ''} disconnected)` : ''}`);
  };

  const updateComponentValue = (id: string, value: number) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, value } : c
    ));
  };

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
    toast.info('Drag to connect...', { duration: 1000 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragWire || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragWire(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  const handleTerminalMouseUp = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dragWire) return;

    if (dragWire.from.componentId === componentId) {
      toast.error('Cannot connect component to itself');
      setDragWire(null);
      setWireDrawingMode(false);
      return;
    }

    const duplicate = wires.find(
      w =>
        (w.from.componentId === dragWire.from.componentId &&
          w.from.terminal === dragWire.from.terminal &&
          w.to.componentId === componentId &&
          w.to.terminal === terminal) ||
        (w.to.componentId === dragWire.from.componentId &&
          w.to.terminal === dragWire.from.terminal &&
          w.from.componentId === componentId &&
          w.from.terminal === terminal)
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
    const path = createSmartPath(dragWire.from.x, dragWire.from.y, toPos.x, toPos.y);
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
    toast.success('✓ Wire connected successfully!');
  };

  const handleCanvasMouseUp = () => {
    if (dragWire) {
      setDragWire(null);
      setWireDrawingMode(false);
      toast.info('Wire connection cancelled');
    }
  };

  const createSmartPath = (x1: number, y1: number, x2: number, y2: number) => {
    const path = [{ x: x1, y: y1 }];
    
    const dx = x2 - x1;
    const dy = y2 - y1;

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

  const deleteSelectedWires = () => {
    if (selectedWires.length === 0) return;
    const count = selectedWires.length;
    setWires(prev => prev.filter(w => !selectedWires.includes(w.id)));
    setSelectedWires([]);
    toast.success(`${count} wire${count !== 1 ? 's' : ''} deleted`);
  };

  const deleteAllWires = () => {
    const count = wires.length;
    if (count === 0) {
      toast.info('No wires to delete');
      return;
    }
    setWires([]);
    setSelectedWires([]);
    toast.success(`All ${count} wires deleted`);
  };

  const autoCleanupWires = () => {
    if (wires.length === 0) {
      toast.info('No wires to optimize');
      return;
    }

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
    toast.success('✓ Wire layout optimized!');
  };

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
    
    if (wires.length === 0) {
      toast.warning('Add wires to connect components');
    }

    const voltageSource = components.find(c => c.type === 'voltage_dc' || c.type === 'battery');
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
      
      const wave = Array.from({ length: 100 }, (_, i) => 
        Math.sin((i / 100) * Math.PI * 4) * v
      );
      setWaveform(wave);
      
      toast.success(`${simulationMode.toUpperCase()} simulation started!`);
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
    setSelectedTemplate(null);
    resetSimulation();
    toast.info('Canvas cleared');
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
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
        <div className="container mx-auto max-w-[1920px]">
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <CircuitBoard className="h-10 w-10 text-[#00C2D1]" />
                  </motion.div>
                  <h1 className="text-4xl font-bold text-white">Professional Circuit Simulator</h1>
                  {selectedTemplate && (
                    <Badge className="bg-[#9C4AFF] text-white">
                      Template: {selectedTemplate.name}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-300 text-lg">
                  Full-featured electronics simulation with {COMPONENT_LIBRARY.length}+ components, validation, and templates
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="bg-[#9C4AFF] text-white hover:bg-[#9C4AFF]/90"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button
                  onClick={runValidation}
                  className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Validate Circuit
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Template Selector */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Circuit Templates</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplates(false)}
                        className="text-white"
                      >
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="beginner" className="w-full">
                      <TabsList className="bg-white/10">
                        <TabsTrigger value="beginner">Beginner</TabsTrigger>
                        <TabsTrigger value="analog">Analog</TabsTrigger>
                        <TabsTrigger value="digital">Digital</TabsTrigger>
                        <TabsTrigger value="arduino">Arduino</TabsTrigger>
                        <TabsTrigger value="power">Power</TabsTrigger>
                      </TabsList>
                      {['beginner', 'analog', 'digital', 'arduino', 'power'].map(category => (
                        <TabsContent key={category} value={category}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getTemplatesByCategory(category as any).map(template => (
                              <Card 
                                key={template.id}
                                className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                                onClick={() => loadTemplate(template)}
                              >
                                <CardHeader>
                                  <CardTitle className="text-white text-sm flex items-center justify-between">
                                    {template.name}
                                    <Badge variant="outline" className="text-xs">
                                      {'⭐'.repeat(template.difficulty)}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription className="text-gray-300 text-xs">
                                    {template.description}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-xs text-gray-400">
                                    {template.components.length} components • {template.wires.length} connections
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Panel */}
          <AnimatePresence>
            {showValidation && validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#FF6B00]" />
                        Circuit Validation Results
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowValidation(false)}
                        className="text-white"
                      >
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {validationErrors.map(error => (
                        <div
                          key={error.id}
                          className={`p-3 rounded-lg border ${
                            error.type === 'error'
                              ? 'bg-red-500/10 border-red-500/30'
                              : error.type === 'warning'
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-blue-500/10 border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {error.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                              {error.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                              {error.type === 'info' && <Info className="h-4 w-4 text-blue-400" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white text-sm">{error.message}</p>
                              <p className="text-gray-300 text-xs mt-1">{error.description}</p>
                              {error.fix && (
                                <p className="text-[#00E5FF] text-xs mt-2">💡 Fix: {error.fix}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

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
                <Select value={simulationMode} onValueChange={(v: any) => setSimulationMode(v)}>
                  <SelectTrigger className="w-32 bg-white/10 text-white border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dc">DC Analysis</SelectItem>
                    <SelectItem value="ac">AC Analysis</SelectItem>
                    <SelectItem value="transient">Transient</SelectItem>
                  </SelectContent>
                </Select>
                
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
                  onClick={() => setShowAllTerminals(!showAllTerminals)}
                  className={`border-white/20 text-white hover:bg-white/20 ${showAllTerminals ? 'bg-[#9C4AFF]/30' : 'bg-white/10'}`}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  {showAllTerminals ? 'Hide' : 'Show'} Terminals
                </Button>
                <Button 
                  variant="outline" 
                  onClick={autoLabel}
                  disabled={wires.length === 0}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Label Nets
                </Button>
                <Button 
                  variant="outline" 
                  onClick={autoCleanupWires}
                  disabled={wires.length === 0}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Cable className="h-4 w-4 mr-2" />
                  Auto-Cleanup
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
                  onClick={deleteAllWires}
                  disabled={wires.length === 0}
                  className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Wires
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

              <div className="grid lg:grid-cols-4 gap-4">
                {/* Component Library */}
                <Card className="bg-[#071428] border-white/20 lg:col-span-1">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 text-[#00C2D1] flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Component Library
                    </h3>
                    
                    {/* Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={componentSearch}
                          onChange={(e) => setComponentSearch(e.target.value)}
                          placeholder="Search components..."
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    
                    {/* Category Tabs */}
                    {!componentSearch && (
                      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
                        <TabsList className="bg-white/10 w-full flex-wrap h-auto gap-1 p-1">
                          {Object.entries(COMPONENT_CATEGORIES).map(([key, cat]) => (
                            <TabsTrigger 
                              key={key} 
                              value={key}
                              className="text-xs px-2 py-1 data-[state=active]:bg-[#9C4AFF]"
                            >
                              {cat.icon}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    )}
                    
                    <div className="space-y-2 text-sm max-h-[600px] overflow-y-auto pr-2">
                      {filteredComponents.map((comp) => (
                        <div
                          key={comp.type}
                          draggable
                          onDragStart={() => handleDragStart(comp.type)}
                          className="p-3 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors backdrop-blur-sm group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{comp.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-medium truncate">{comp.label}</p>
                              <p className="text-gray-400 text-[10px] truncate">{comp.description}</p>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              {comp.category}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              {comp.pins} pins
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                      <h4 className="text-xs font-semibold text-[#00C2D1] mb-2">Quick Tips</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>✓ Drag components to canvas</li>
                        <li>✓ Hover to see terminals</li>
                        <li>✓ Click & drag terminals</li>
                        <li>✓ Use validation to check</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Circuit Canvas */}
                <Card className="lg:col-span-3 bg-white/95 border-white/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#071428]">Circuit Canvas</h3>
                      <div className="text-xs text-gray-600 flex gap-4">
                        <span>{components.length} component{components.length !== 1 ? 's' : ''}</span>
                        <span className="text-[#9C4AFF] font-semibold">{wires.length} wire{wires.length !== 1 ? 's' : ''}</span>
                        {wireDrawingMode && <span className="text-[#FF6B00] font-bold animate-pulse">Drawing wire...</span>}
                      </div>
                    </div>
                    <div
                      ref={canvasRef}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      className={`bg-white rounded-lg border-2 ${wireDrawingMode ? 'border-[#9C4AFF] border-solid' : 'border-dashed border-gray-300'} min-h-[600px] relative overflow-hidden transition-all`}
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
                                strokeWidth={isHighlighted ? "8" : "6"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={isHighlighted ? "0.5" : "0.3"}
                                filter="blur(4px)"
                              />
                              {/* Main wire */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke={isSelected ? '#FFD700' : wire.color}
                                strokeWidth={isSelected ? "5" : isHighlighted ? "4" : "3"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {/* Connection dots at terminals */}
                              <circle
                                cx={wire.path[0].x}
                                cy={wire.path[0].y}
                                r="4"
                                fill={wire.color}
                                stroke="white"
                                strokeWidth="1"
                              />
                              <circle
                                cx={wire.path[wire.path.length - 1].x}
                                cy={wire.path[wire.path.length - 1].y}
                                r="4"
                                fill={wire.color}
                                stroke="white"
                                strokeWidth="1"
                              />
                              {wire.netLabel && (
                                <text
                                  x={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2}
                                  y={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 - 10}
                                  fontSize="10"
                                  fill="#9C4AFF"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  className="pointer-events-none"
                                >
                                  {wire.netLabel}
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* Dragging wire preview */}
                        {dragWire && (
                          <g>
                            {/* Animated dashed line */}
                            <line
                              x1={dragWire.from.x}
                              y1={dragWire.from.y}
                              x2={dragWire.currentX}
                              y2={dragWire.currentY}
                              stroke="#9C4AFF"
                              strokeWidth="4"
                              strokeDasharray="10,5"
                              strokeLinecap="round"
                              opacity="0.8"
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                from="0"
                                to="15"
                                dur="0.5s"
                                repeatCount="indefinite"
                              />
                            </line>
                            {/* Glow effect */}
                            <line
                              x1={dragWire.from.x}
                              y1={dragWire.from.y}
                              x2={dragWire.currentX}
                              y2={dragWire.currentY}
                              stroke="#9C4AFF"
                              strokeWidth="8"
                              strokeLinecap="round"
                              opacity="0.3"
                              filter="blur(4px)"
                            />
                            {/* Starting point */}
                            <circle
                              cx={dragWire.from.x}
                              cy={dragWire.from.y}
                              r="6"
                              fill="#9C4AFF"
                              stroke="white"
                              strokeWidth="2"
                            />
                            {/* Cursor point */}
                            <circle
                              cx={dragWire.currentX}
                              cy={dragWire.currentY}
                              r="5"
                              fill="#FF6B00"
                              className="animate-pulse"
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
                              Or load a template to get started quickly
                            </p>
                          </div>
                        </div>
                      ) : (
                        components.map((comp) => {
                          const info = COMPONENT_LIBRARY.find(c => c.type === comp.type);
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
                              {(isHovered || showAllTerminals || wireDrawingMode) && (
                                <>
                                  {(['top', 'bottom', 'left', 'right'] as const).map((terminal) => {
                                    const termPos = {
                                      top: { x: 20, y: -8 },
                                      bottom: { x: 20, y: 56 },
                                      left: { x: -8, y: 20 },
                                      right: { x: 56, y: 20 },
                                    };

                                    const isTerminalHovered = hoveredTerminal?.componentId === comp.id && hoveredTerminal?.terminal === terminal;

                                    return (
                                      <div
                                        key={terminal}
                                        className={`absolute w-4 h-4 border-2 border-white rounded-full cursor-crosshair transition-all shadow-lg ${
                                          isTerminalHovered 
                                            ? 'bg-[#FF6B00] scale-125' 
                                            : 'bg-[#9C4AFF] hover:bg-[#FF6B00] hover:scale-110'
                                        }`}
                                        style={{
                                          left: termPos[terminal].x,
                                          top: termPos[terminal].y,
                                          zIndex: 10,
                                        }}
                                        onMouseDown={(e) => handleTerminalMouseDown(comp.id, terminal, e)}
                                        onMouseUp={(e) => handleTerminalMouseUp(comp.id, terminal, e)}
                                        onMouseEnter={() => setHoveredTerminal({ componentId: comp.id, terminal })}
                                        onMouseLeave={() => setHoveredTerminal(null)}
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
                        
                        <div className="mt-4 p-3 bg-[#00C2D1]/20 rounded-lg border border-[#00C2D1]/40">
                          <p className="text-xs text-white/90">
                            <span className="font-semibold text-[#00C2D1]">Description:</span>{' '}
                            {COMPONENT_LIBRARY.find(c => c.type === selectedComponent.type)?.description || 'Unknown Component'}
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
                  Circuit Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  {isRunning ? (
                    <>
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        {simulationMode.toUpperCase()} simulation running
                      </p>
                      <p>• Components: {components.length}</p>
                      <p>• Wires: {wires.length}</p>
                      <p>• Nets: {buildNetlist(components, wires).length}</p>
                      <p>• Power: {(power * 1000).toFixed(2)} mW</p>
                    </>
                  ) : (
                    <>
                      <p>• {components.length} components on canvas</p>
                      <p>• {wires.length} wire connections</p>
                      <p>• {COMPONENT_LIBRARY.length}+ components available</p>
                      <p>• {CIRCUIT_TEMPLATES.length} templates ready</p>
                      <Button
                        size="sm"
                        onClick={runValidation}
                        className="w-full mt-2 bg-[#FF6B00]"
                      >
                        <Bug className="h-3 w-3 mr-2" />
                        Check Circuit
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}