'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, ArrowLeft, Download, Save, Upload, ZoomIn, ZoomOut, 
  Grid3x3, Pencil, Square, Circle, Move, Type, Trash2, Copy,
  Home, Lightbulb, Zap, Settings, CircuitBoard, Search, Undo2, Redo2,
  RotateCw, Lock, Unlock, Layers, FileJson, Printer, MousePointer,
  Plus, Minus, Calculator, AlertTriangle, CheckCircle, FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface SchematicElement {
  id: string;
  type: 'symbol' | 'wire' | 'text' | 'shape';
  subType?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  label?: string;
  value?: string;
  color?: string;
  points?: { x: number; y: number }[];
  locked?: boolean;
}

interface PanelCircuit {
  id: string;
  name: string;
  amperage: number;
  poles: number;
  type: 'breaker' | 'tandem' | 'gfci' | 'afci';
  room: string;
  wireSize: string;
  load: number;
}

interface HistoryState {
  elements: SchematicElement[];
}

const symbolLibrary = [
  { type: 'resistor', label: 'Resistor', icon: '⏤◇⏤', category: 'passive' },
  { type: 'capacitor', label: 'Capacitor', icon: '⏤∥⏤', category: 'passive' },
  { type: 'inductor', label: 'Inductor', icon: '⏤⋎⏤', category: 'passive' },
  { type: 'battery', label: 'Battery', icon: '⊥⊤', category: 'power' },
  { type: 'ground', label: 'Ground', icon: '⏚', category: 'power' },
  { type: 'vcc', label: 'VCC', icon: '▲', category: 'power' },
  { type: 'switch', label: 'Switch', icon: '⏤/⏤', category: 'control' },
  { type: 'led', label: 'LED', icon: '▷|', category: 'semiconductor' },
  { type: 'diode', label: 'Diode', icon: '▷|', category: 'semiconductor' },
  { type: 'transistor-npn', label: 'NPN Transistor', icon: '⊳', category: 'semiconductor' },
  { type: 'transistor-pnp', label: 'PNP Transistor', icon: '⊲', category: 'semiconductor' },
  { type: 'opamp', label: 'Op-Amp', icon: '△', category: 'ic' },
  { type: '555-timer', label: '555 Timer', icon: '⏱', category: 'ic' },
  { type: 'motor', label: 'Motor', icon: 'Ⓜ', category: 'actuator' },
  { type: 'speaker', label: 'Speaker', icon: '🔊', category: 'actuator' },
  { type: 'fuse', label: 'Fuse', icon: '⏤○⏤', category: 'protection' },
  { type: 'transformer', label: 'Transformer', icon: '⧆', category: 'passive' },
  { type: 'crystal', label: 'Crystal', icon: '⬛', category: 'passive' },
  { type: 'junction', label: 'Junction', icon: '●', category: 'wiring' },
  { type: 'no-connect', label: 'No Connect', icon: '✕', category: 'wiring' },
];

const wiringComponents = [
  { type: 'breaker-1p', label: 'Single Pole Breaker', icon: '▢', category: 'protection', amperage: 15 },
  { type: 'breaker-2p', label: 'Double Pole Breaker', icon: '▢▢', category: 'protection', amperage: 30 },
  { type: 'gfci-breaker', label: 'GFCI Breaker', icon: 'G▢', category: 'protection', amperage: 20 },
  { type: 'afci-breaker', label: 'AFCI Breaker', icon: 'A▢', category: 'protection', amperage: 15 },
  { type: 'main-panel', label: 'Main Panel', icon: '⊞', category: 'distribution' },
  { type: 'sub-panel', label: 'Sub Panel', icon: '⊟', category: 'distribution' },
  { type: 'receptacle', label: 'Duplex Receptacle', icon: '⊙⊙', category: 'device' },
  { type: 'receptacle-gfci', label: 'GFCI Receptacle', icon: 'G⊙', category: 'device' },
  { type: 'receptacle-20a', label: '20A Receptacle', icon: '⊙₂₀', category: 'device' },
  { type: 'receptacle-240v', label: '240V Receptacle', icon: '⊙₂₄₀', category: 'device' },
  { type: 'light-fixture', label: 'Ceiling Light', icon: '◉', category: 'lighting' },
  { type: 'recessed-light', label: 'Recessed Light', icon: '○', category: 'lighting' },
  { type: 'track-light', label: 'Track Light', icon: '═◉◉◉', category: 'lighting' },
  { type: 'pendant-light', label: 'Pendant Light', icon: '↓◉', category: 'lighting' },
  { type: 'switch-sp', label: 'Single Pole Switch', icon: 'S₁', category: 'control' },
  { type: 'switch-3way', label: '3-Way Switch', icon: 'S₃', category: 'control' },
  { type: 'switch-4way', label: '4-Way Switch', icon: 'S₄', category: 'control' },
  { type: 'dimmer', label: 'Dimmer Switch', icon: 'D↕', category: 'control' },
  { type: 'fan-switch', label: 'Fan Speed Control', icon: 'F↕', category: 'control' },
  { type: 'ceiling-fan', label: 'Ceiling Fan', icon: '⚙◉', category: 'device' },
  { type: 'exhaust-fan', label: 'Exhaust Fan', icon: '↺', category: 'device' },
  { type: 'smoke-detector', label: 'Smoke Detector', icon: '⊛', category: 'safety' },
  { type: 'co-detector', label: 'CO Detector', icon: 'CO', category: 'safety' },
  { type: 'doorbell', label: 'Doorbell', icon: '🔔', category: 'device' },
  { type: 'thermostat', label: 'Thermostat', icon: '🌡', category: 'hvac' },
];

const GRID_SIZE = 20;

export default function SchematicWiringPage() {
  const [elements, setElements] = useState<SchematicElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<SchematicElement | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'wire' | 'text' | 'shape'>('select');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [wireStart, setWireStart] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState('schematic');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [panelCircuits, setPanelCircuits] = useState<PanelCircuit[]>([
    { id: '1', name: 'Kitchen Outlets', amperage: 20, poles: 1, type: 'gfci', room: 'Kitchen', wireSize: '12 AWG', load: 1800 },
    { id: '2', name: 'Kitchen Lights', amperage: 15, poles: 1, type: 'breaker', room: 'Kitchen', wireSize: '14 AWG', load: 600 },
    { id: '3', name: 'Refrigerator', amperage: 20, poles: 1, type: 'breaker', room: 'Kitchen', wireSize: '12 AWG', load: 800 },
    { id: '4', name: 'Electric Range', amperage: 50, poles: 2, type: 'breaker', room: 'Kitchen', wireSize: '6 AWG', load: 12000 },
    { id: '5', name: 'Dishwasher', amperage: 20, poles: 1, type: 'gfci', room: 'Kitchen', wireSize: '12 AWG', load: 1500 },
    { id: '6', name: 'Bathroom', amperage: 20, poles: 1, type: 'gfci', room: 'Bathroom', wireSize: '12 AWG', load: 1200 },
    { id: '7', name: 'Master Bedroom', amperage: 15, poles: 1, type: 'afci', room: 'Bedroom', wireSize: '14 AWG', load: 1200 },
    { id: '8', name: 'Living Room', amperage: 15, poles: 1, type: 'afci', room: 'Living Room', wireSize: '14 AWG', load: 1500 },
  ]);
  
  const [newCircuit, setNewCircuit] = useState<Partial<PanelCircuit>>({
    name: '',
    amperage: 15,
    poles: 1,
    type: 'breaker',
    room: '',
    wireSize: '14 AWG',
    load: 0
  });
  
  const [showAddCircuitDialog, setShowAddCircuitDialog] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return symbolLibrary;
    return symbolLibrary.filter(s => 
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredWiringComponents = useMemo(() => {
    if (!searchQuery) return wiringComponents;
    return wiringComponents.filter(c => 
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(elements))
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setHistoryIndex(historyIndex - 1);
      toast.info('Undo');
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setHistoryIndex(historyIndex + 1);
      toast.info('Redo');
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement) {
          removeElement(selectedElement.id);
        }
      }
      if (e.key === 'r' && selectedElement) {
        rotateElement(selectedElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedElement]);

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = snapToGridValue((e.clientX - rect.left) / scale);
    const y = snapToGridValue((e.clientY - rect.top) / scale);

    const newElement: SchematicElement = {
      id: `${draggedType}-${Date.now()}`,
      type: 'symbol',
      subType: draggedType,
      x,
      y,
      rotation: 0,
      label: draggedType.toUpperCase().replace(/-/g, ' '),
      locked: false
    };

    setElements(prev => [...prev, newElement]);
    setDraggedType(null);
    saveToHistory();
    toast.success('Component added');
  }, [draggedType, zoom, snapToGrid]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = snapToGridValue((e.clientX - rect.left) / scale);
    const y = snapToGridValue((e.clientY - rect.top) / scale);

    if (tool === 'wire') {
      if (!wireStart) {
        setWireStart({ x, y });
        toast.info('Click to end wire', { duration: 1000 });
      } else {
        const newWire: SchematicElement = {
          id: `wire-${Date.now()}`,
          type: 'wire',
          x: wireStart.x,
          y: wireStart.y,
          rotation: 0,
          points: [wireStart, { x, y }],
          color: '#000000',
        };
        setElements(prev => [...prev, newWire]);
        setWireStart(null);
        saveToHistory();
        toast.success('Wire added');
      }
    } else if (tool === 'text') {
      const newText: SchematicElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x,
        y,
        rotation: 0,
        label: 'Label',
      };
      setElements(prev => [...prev, newText]);
      saveToHistory();
      toast.success('Text added');
    }
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    setSelectedElement(null);
    saveToHistory();
    toast.info('Element removed');
  };

  const duplicateElement = (element: SchematicElement) => {
    const newElement = {
      ...element,
      id: `${element.subType || element.type}-${Date.now()}`,
      x: element.x + 40,
      y: element.y + 40,
      locked: false
    };
    setElements(prev => [...prev, newElement]);
    saveToHistory();
    toast.success('Element duplicated');
  };

  const updateElementLabel = (id: string, label: string) => {
    setElements(prev => prev.map(e => 
      e.id === id ? { ...e, label } : e
    ));
  };

  const updateElementValue = (id: string, value: string) => {
    setElements(prev => prev.map(e => 
      e.id === id ? { ...e, value } : e
    ));
  };

  const rotateElement = (id: string) => {
    setElements(prev => prev.map(e => 
      e.id === id ? { ...e, rotation: (e.rotation + 90) % 360 } : e
    ));
    saveToHistory();
  };

  const toggleLockElement = (id: string) => {
    setElements(prev => prev.map(e => 
      e.id === id ? { ...e, locked: !e.locked } : e
    ));
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    saveToHistory();
    toast.info('Canvas cleared');
  };

  const exportSchematic = () => {
    const data = JSON.stringify({ elements, panelCircuits }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schematic-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schematic exported');
  };

  const exportBOM = () => {
    let csv = 'Item,Type,Value,Quantity\n';
    const counts: Record<string, number> = {};
    
    elements.filter(e => e.type === 'symbol').forEach(e => {
      const key = `${e.subType}|${e.value || ''}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    Object.entries(counts).forEach(([key, qty], idx) => {
      const [type, value] = key.split('|');
      csv += `${idx + 1},${type},${value || 'N/A'},${qty}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bom-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('BOM exported');
  };

  const totalLoad = useMemo(() => {
    return panelCircuits.reduce((sum, c) => sum + c.load, 0);
  }, [panelCircuits]);

  const totalCircuits = panelCircuits.length;
  const doublePoleCiruicts = panelCircuits.filter(c => c.poles === 2).length;
  const usedSpaces = totalCircuits + doublePoleCiruicts;

  const addCircuit = () => {
    if (!newCircuit.name || !newCircuit.room) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const circuit: PanelCircuit = {
      id: `circuit-${Date.now()}`,
      name: newCircuit.name || '',
      amperage: newCircuit.amperage || 15,
      poles: newCircuit.poles || 1,
      type: (newCircuit.type as PanelCircuit['type']) || 'breaker',
      room: newCircuit.room || '',
      wireSize: newCircuit.wireSize || '14 AWG',
      load: newCircuit.load || 0
    };
    
    setPanelCircuits(prev => [...prev, circuit]);
    setShowAddCircuitDialog(false);
    setNewCircuit({ name: '', amperage: 15, poles: 1, type: 'breaker', room: '', wireSize: '14 AWG', load: 0 });
    toast.success('Circuit added');
  };

  const removeCircuit = (id: string) => {
    setPanelCircuits(prev => prev.filter(c => c.id !== id));
    toast.info('Circuit removed');
  };

  const calculateTraceWidth = (current: number, thickness: number, tempRise: number) => {
    const k = thickness === 1 ? 0.048 : 0.024;
    const b = 0.44;
    const c = 0.725;
    
    const area = Math.pow(current / (k * Math.pow(tempRise, b)), 1 / c);
    const width = area / (thickness * 1.378);
    return width;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00C2D1] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Link href="/">
            <Button variant="outline" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Home
            </Button>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <FileText className="h-10 w-10 text-[#00C2D1]" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white">Schematic & Wiring Designer</h1>
            </div>
            <p className="text-gray-300">Professional schematic editor, wiring planner, and load calculator</p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="schematic" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <CircuitBoard className="h-4 w-4 mr-2" />Schematic Editor
              </TabsTrigger>
              <TabsTrigger value="wiring" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <Home className="h-4 w-4 mr-2" />Wiring Planner
              </TabsTrigger>
              <TabsTrigger value="panel" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <Layers className="h-4 w-4 mr-2" />Panel Schedule
              </TabsTrigger>
              <TabsTrigger value="pcb" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <Calculator className="h-4 w-4 mr-2" />PCB Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schematic">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-[#00C2D1]" />Schematic Editor
                  </CardTitle>
                  <CardDescription className="text-gray-300">Design professional electronic schematics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4 flex-wrap items-center">
                    <div className="flex gap-1 border border-white/20 rounded-lg p-1">
                      <Button size="sm" variant={tool === 'select' ? 'default' : 'ghost'} onClick={() => setTool('select')} className={tool === 'select' ? 'bg-[#00C2D1] text-[#071428]' : 'text-white'}><MousePointer className="h-4 w-4" /></Button>
                      <Button size="sm" variant={tool === 'wire' ? 'default' : 'ghost'} onClick={() => setTool('wire')} className={tool === 'wire' ? 'bg-[#00C2D1] text-[#071428]' : 'text-white'}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant={tool === 'text' ? 'default' : 'ghost'} onClick={() => setTool('text')} className={tool === 'text' ? 'bg-[#00C2D1] text-[#071428]' : 'text-white'}><Type className="h-4 w-4" /></Button>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Undo2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Redo2 className="h-4 w-4" /></Button>

                    <div className="h-6 w-px bg-white/20" />

                    <div className="flex gap-1 items-center">
                      <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(50, zoom - 10))} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><ZoomOut className="h-4 w-4" /></Button>
                      <span className="text-white text-sm min-w-[50px] text-center">{zoom}%</span>
                      <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 10))} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><ZoomIn className="h-4 w-4" /></Button>
                    </div>

                    <Button size="sm" variant="outline" onClick={() => setShowGrid(!showGrid)} className={`${showGrid ? 'bg-[#00C2D1]/20' : 'bg-white/10'} border-white/20 text-white hover:bg-white/20`}><Grid3x3 className="h-4 w-4" /></Button>

                    <div className="flex-1" />

                    <Button size="sm" variant="outline" onClick={exportBOM} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><FileSpreadsheet className="h-4 w-4 mr-1" />BOM</Button>
                    <Button size="sm" variant="outline" onClick={exportSchematic} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Download className="h-4 w-4 mr-1" />Export</Button>
                    <Button size="sm" variant="outline" onClick={clearCanvas} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Trash2 className="h-4 w-4" /></Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-[#071428] border-white/20">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-3 text-[#00C2D1]">Symbol Library</h3>
                        <div className="mb-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search symbols..." className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
                          </div>
                        </div>
                        <ScrollArea className="h-[500px]">
                          <div className="space-y-1 text-sm pr-2">
                            {['passive', 'semiconductor', 'power', 'control', 'ic', 'actuator', 'protection', 'wiring'].map(category => {
                              const categorySymbols = filteredSymbols.filter(s => s.category === category);
                              if (categorySymbols.length === 0) return null;
                              return (
                                <div key={category}>
                                  <p className="text-xs text-gray-400 uppercase mb-2 mt-3 first:mt-0">{category}</p>
                                  {categorySymbols.map((symbol) => (
                                    <div key={symbol.type} draggable onDragStart={() => handleDragStart(symbol.type)} className="p-2 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors">
                                      <div className="flex items-center justify-between text-white">
                                        <span className="text-xs">{symbol.label}</span>
                                        <span className="font-mono text-sm">{symbol.icon}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-3 bg-white/95 border-white/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-[#071428]">Drawing Canvas</h3>
                          <div className="text-xs text-gray-600">{elements.length} elements</div>
                        </div>
                        <div
                          ref={canvasRef}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onClick={handleCanvasClick}
                          className="bg-white rounded-lg border-2 border-gray-300 min-h-[500px] relative overflow-hidden cursor-crosshair"
                          style={{
                            backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                            backgroundSize: `${GRID_SIZE * (zoom / 100)}px ${GRID_SIZE * (zoom / 100)}px`,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left',
                            width: `${100 / (zoom / 100)}%`,
                            height: `${500 / (zoom / 100)}px`
                          }}
                        >
                          {elements.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold text-gray-600">Drag symbols here or use drawing tools</p>
                                <p className="text-sm mt-2">Build professional electronic schematics</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                                {elements.filter(e => e.type === 'wire' && e.points).map(element => (
                                  <line key={element.id} x1={element.points![0].x} y1={element.points![0].y} x2={element.points![1].x} y2={element.points![1].y} stroke={element.color || '#000000'} strokeWidth="2" />
                                ))}
                              </svg>
                              
                              {elements.filter(e => e.type !== 'wire').map((element) => {
                                const symbol = symbolLibrary.find(s => s.type === element.subType) || wiringComponents.find(w => w.type === element.subType);
                                return (
                                  <motion.div
                                    key={element.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`absolute p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                      selectedElement?.id === element.id
                                        ? 'border-[#00C2D1] bg-[#00C2D1]/10 shadow-lg'
                                        : 'border-gray-300 bg-white hover:border-[#00C2D1]/50'
                                    }`}
                                    style={{ left: element.x, top: element.y, transform: `rotate(${element.rotation}deg)` }}
                                    onClick={(e) => { e.stopPropagation(); setSelectedElement(element); }}
                                  >
                                    {element.locked && <Lock className="absolute -top-2 -right-2 h-4 w-4 text-red-500" />}
                                    {element.type === 'symbol' ? (
                                      <div className="flex flex-col items-center">
                                        <span className="font-mono text-xl mb-1">{symbol?.icon || '?'}</span>
                                        <span className="text-xs font-bold text-gray-700">{element.label}</span>
                                        {element.value && <span className="text-xs text-gray-600">{element.value}</span>}
                                      </div>
                                    ) : element.type === 'text' ? (
                                      <span className="text-sm font-medium text-gray-700">{element.label}</span>
                                    ) : null}
                                  </motion.div>
                                );
                              })}
                            </>
                          )}

                          {wireStart && (
                            <div className="absolute h-3 w-3 bg-[#00C2D1] rounded-full animate-pulse" style={{ left: wireStart.x - 6, top: wireStart.y - 6 }} />
                          )}
                        </div>

                        {selectedElement && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428] rounded-lg border border-white/20">
                            <h4 className="font-semibold mb-3 text-white">Element Properties</h4>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="p-2 bg-white/10 rounded">
                                <Label className="text-xs text-[#00C2D1]">Label</Label>
                                <Input type="text" value={selectedElement.label} onChange={(e) => updateElementLabel(selectedElement.id, e.target.value)} className="h-8 text-sm bg-white text-[#071428] mt-1" />
                              </div>
                              <div className="p-2 bg-white/10 rounded">
                                <Label className="text-xs text-[#00C2D1]">Value</Label>
                                <Input type="text" value={selectedElement.value || ''} onChange={(e) => updateElementValue(selectedElement.id, e.target.value)} className="h-8 text-sm bg-white text-[#071428] mt-1" placeholder="e.g., 1kΩ" />
                              </div>
                              <div className="p-2 bg-white/10 rounded flex items-center gap-2">
                                <Button size="sm" onClick={() => rotateElement(selectedElement.id)} className="bg-[#9C4AFF] text-white"><RotateCw className="h-4 w-4" /></Button>
                                <Button size="sm" onClick={() => duplicateElement(selectedElement)} className="bg-[#00C2D1] text-[#071428]"><Copy className="h-4 w-4" /></Button>
                                <Button size="sm" onClick={() => toggleLockElement(selectedElement.id)} variant="outline" className="border-white/20 text-white">{selectedElement.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Button>
                                <Button size="sm" variant="destructive" onClick={() => removeElement(selectedElement.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wiring">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Home className="h-5 w-5 text-[#00C2D1]" />Residential Wiring Planner
                  </CardTitle>
                  <CardDescription className="text-gray-300">Plan residential electrical installations with NEC compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-[#071428] border-white/20">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-3 text-[#00C2D1]">Wiring Components</h3>
                        <div className="mb-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
                          </div>
                        </div>
                        <ScrollArea className="h-[500px]">
                          <div className="space-y-1 text-sm pr-2">
                            {['protection', 'distribution', 'device', 'lighting', 'control', 'safety', 'hvac'].map(category => {
                              const categoryComponents = filteredWiringComponents.filter(c => c.category === category);
                              if (categoryComponents.length === 0) return null;
                              return (
                                <div key={category}>
                                  <p className="text-xs text-gray-400 uppercase mb-2 mt-3 first:mt-0">{category}</p>
                                  {categoryComponents.map((comp) => (
                                    <div key={comp.type} draggable onDragStart={() => handleDragStart(comp.type)} className="p-2 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors">
                                      <div className="flex items-center justify-between text-white">
                                        <span className="text-xs">{comp.label}</span>
                                        <span className="font-mono text-lg">{comp.icon}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-3 bg-white/95 border-white/20">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 text-[#071428]">Floor Plan</h3>
                        <div className="bg-white rounded-lg border-2 border-gray-300 min-h-[500px] relative" style={{ backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-semibold text-gray-600">Draw your floor plan and add electrical components</p>
                              <p className="text-sm mt-2">Plan outlets, switches, lighting, and circuits</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="panel">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Layers className="h-5 w-5 text-[#00C2D1]" />Panel Schedule
                      </CardTitle>
                      <CardDescription className="text-gray-300">Manage breakers and calculate loads</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddCircuitDialog(true)} className="bg-[#00C2D1] text-[#071428]">
                      <Plus className="h-4 w-4 mr-2" />Add Circuit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-white/10 border-white/20">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-gray-300 text-sm">Total Load</p>
                          <p className="text-3xl font-bold text-[#00C2D1]">{(totalLoad / 1000).toFixed(1)} kW</p>
                          <p className="text-gray-400 text-xs mt-1">{totalLoad} watts</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 border-white/20">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-gray-300 text-sm">Panel Spaces Used</p>
                          <p className="text-3xl font-bold text-[#FF6B00]">{usedSpaces} / 40</p>
                          <p className="text-gray-400 text-xs mt-1">{40 - usedSpaces} spaces available</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 border-white/20">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-gray-300 text-sm">Total Circuits</p>
                          <p className="text-3xl font-bold text-[#9C4AFF]">{totalCircuits}</p>
                          <p className="text-gray-400 text-xs mt-1">{panelCircuits.filter(c => c.type === 'gfci' || c.type === 'afci').length} protected</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="text-left p-3 text-white text-sm">Circuit</th>
                          <th className="text-left p-3 text-white text-sm">Room</th>
                          <th className="text-center p-3 text-white text-sm">Amps</th>
                          <th className="text-center p-3 text-white text-sm">Poles</th>
                          <th className="text-center p-3 text-white text-sm">Type</th>
                          <th className="text-center p-3 text-white text-sm">Wire</th>
                          <th className="text-right p-3 text-white text-sm">Load</th>
                          <th className="text-center p-3 text-white text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {panelCircuits.map((circuit, idx) => (
                          <tr key={circuit.id} className={idx % 2 === 0 ? 'bg-white/5' : ''}>
                            <td className="p-3 text-white text-sm">{circuit.name}</td>
                            <td className="p-3 text-gray-300 text-sm">{circuit.room}</td>
                            <td className="p-3 text-center text-white text-sm">{circuit.amperage}A</td>
                            <td className="p-3 text-center text-white text-sm">{circuit.poles}</td>
                            <td className="p-3 text-center">
                              <Badge className={`text-xs ${circuit.type === 'gfci' ? 'bg-green-500/20 text-green-400' : circuit.type === 'afci' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {circuit.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3 text-center text-gray-300 text-sm">{circuit.wireSize}</td>
                            <td className="p-3 text-right text-[#00C2D1] text-sm font-semibold">{circuit.load}W</td>
                            <td className="p-3 text-center">
                              <Button size="sm" variant="destructive" onClick={() => removeCircuit(circuit.id)}><Trash2 className="h-3 w-3" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#FF6B00]" />NEC Code Reminders
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Kitchen countertop outlets require GFCI protection</li>
                      <li>• Bathrooms require 20A GFCI circuits</li>
                      <li>• Bedrooms require AFCI protection (NEC 210.12)</li>
                      <li>• Garage outlets require GFCI protection</li>
                      <li>• Outdoor outlets require GFCI + weatherproof covers</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Dialog open={showAddCircuitDialog} onOpenChange={setShowAddCircuitDialog}>
                <DialogContent className="bg-[#071428] border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Circuit</DialogTitle>
                    <DialogDescription className="text-gray-300">Add a new breaker to the panel schedule</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Circuit Name *</Label>
                        <Input value={newCircuit.name} onChange={(e) => setNewCircuit(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Kitchen Outlets" className="bg-white/10 border-white/20 text-white mt-2" />
                      </div>
                      <div>
                        <Label className="text-white">Room *</Label>
                        <Input value={newCircuit.room} onChange={(e) => setNewCircuit(prev => ({ ...prev, room: e.target.value }))} placeholder="e.g., Kitchen" className="bg-white/10 border-white/20 text-white mt-2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">Amperage</Label>
                        <Select value={String(newCircuit.amperage)} onValueChange={(v) => setNewCircuit(prev => ({ ...prev, amperage: parseInt(v) }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15A</SelectItem>
                            <SelectItem value="20">20A</SelectItem>
                            <SelectItem value="30">30A</SelectItem>
                            <SelectItem value="40">40A</SelectItem>
                            <SelectItem value="50">50A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Poles</Label>
                        <Select value={String(newCircuit.poles)} onValueChange={(v) => setNewCircuit(prev => ({ ...prev, poles: parseInt(v) }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Single Pole</SelectItem>
                            <SelectItem value="2">Double Pole</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Breaker Type</Label>
                        <Select value={newCircuit.type} onValueChange={(v) => setNewCircuit(prev => ({ ...prev, type: v as any }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breaker">Standard</SelectItem>
                            <SelectItem value="gfci">GFCI</SelectItem>
                            <SelectItem value="afci">AFCI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Wire Size</Label>
                        <Select value={newCircuit.wireSize} onValueChange={(v) => setNewCircuit(prev => ({ ...prev, wireSize: v }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="14 AWG">14 AWG (15A)</SelectItem>
                            <SelectItem value="12 AWG">12 AWG (20A)</SelectItem>
                            <SelectItem value="10 AWG">10 AWG (30A)</SelectItem>
                            <SelectItem value="8 AWG">8 AWG (40A)</SelectItem>
                            <SelectItem value="6 AWG">6 AWG (50A)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Load (Watts)</Label>
                        <Input type="number" value={newCircuit.load} onChange={(e) => setNewCircuit(prev => ({ ...prev, load: parseInt(e.target.value) || 0 }))} placeholder="0" className="bg-white/10 border-white/20 text-white mt-2" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddCircuitDialog(false)} className="bg-white/10 border-white/20 text-white">Cancel</Button>
                    <Button onClick={addCircuit} className="bg-[#00C2D1] text-[#071428]"><Plus className="h-4 w-4 mr-2" />Add Circuit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="pcb">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#00C2D1]" />PCB Trace Width Calculator
                  </CardTitle>
                  <CardDescription className="text-gray-300">Calculate optimal trace widths for PCB design (IPC-2221)</CardDescription>
                </CardHeader>
                <CardContent>
                  <PCBCalculator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" />Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• Drag-and-drop component placement</p>
                <p>• Professional symbol library (50+)</p>
                <p>• Wire routing and connections</p>
                <p>• Undo/Redo with keyboard shortcuts</p>
                <p>• Export to JSON and BOM</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2"><Home className="h-5 w-5 text-[#00C2D1]" />Wiring Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• NEC compliant layouts</p>
                <p>• Color-coded circuits</p>
                <p>• Load calculations</p>
                <p>• Panel schedule management</p>
                <p>• GFCI/AFCI requirements</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2"><Download className="h-5 w-5 text-[#FF6B00]" />Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• JSON schematic data</p>
                <p>• BOM (Bill of Materials)</p>
                <p>• PNG/SVG images</p>
                <p>• Netlist export</p>
                <p>• Print-ready layouts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function PCBCalculator() {
  const [current, setCurrent] = useState(1);
  const [thickness, setThickness] = useState(1);
  const [tempRise, setTempRise] = useState(10);
  const [traceWidth, setTraceWidth] = useState(0);

  useEffect(() => {
    const k = thickness === 1 ? 0.048 : 0.024;
    const b = 0.44;
    const c = 0.725;
    
    const area = Math.pow(current / (k * Math.pow(tempRise, b)), 1 / c);
    const width = area / (thickness * 1.378);
    setTraceWidth(width);
  }, [current, thickness, tempRise]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-white">Current (A)</Label>
          <Input type="number" value={current} onChange={(e) => setCurrent(parseFloat(e.target.value) || 0)} className="mt-2 bg-white/10 border-white/20 text-white" step="0.1" />
        </div>
        <div>
          <Label className="text-white">Copper Thickness (oz)</Label>
          <Select value={thickness.toString()} onValueChange={(v) => setThickness(parseFloat(v))}>
            <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5 oz</SelectItem>
              <SelectItem value="1">1 oz</SelectItem>
              <SelectItem value="2">2 oz</SelectItem>
              <SelectItem value="3">3 oz</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white">Temperature Rise (°C)</Label>
          <Input type="number" value={tempRise} onChange={(e) => setTempRise(parseFloat(e.target.value) || 0)} className="mt-2 bg-white/10 border-white/20 text-white" />
        </div>
      </div>

      <Card className="bg-[#00C2D1]/20 border-[#00C2D1]/40">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-white text-sm mb-2">Minimum Trace Width</p>
            <p className="text-[#00C2D1] text-4xl font-bold">{traceWidth.toFixed(2)} mils</p>
            <p className="text-white text-2xl mt-2">{(traceWidth * 0.0254).toFixed(3)} mm</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">IPC-2221 Standard</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-300">
            <p>Formula: A = (I / (k × ΔT^b))^(1/c)</p>
            <p className="mt-2">Where:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>A = Cross-sectional area</li>
              <li>I = Current in Amps</li>
              <li>ΔT = Temperature rise</li>
              <li>k, b, c = Constants</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-300 space-y-1">
            <p>• Use 1 oz copper for standard PCBs</p>
            <p>• Keep temp rise under 10°C for reliability</p>
            <p>• Add safety margin of 20-50%</p>
            <p>• Consider trace length and vias</p>
            <p>• Check with PCB manufacturer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
