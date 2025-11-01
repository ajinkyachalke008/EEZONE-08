'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, ArrowLeft, Download, Save, Upload, ZoomIn, ZoomOut, 
  Grid3x3, Pencil, Square, Circle, Move, Type, Trash2, Copy,
  Home, Lightbulb, Zap, Settings, CircuitBoard
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
}

const symbolLibrary = [
  { type: 'resistor', label: 'Resistor', icon: '—◊—', category: 'passive' },
  { type: 'capacitor', label: 'Capacitor', icon: '—∥—', category: 'passive' },
  { type: 'inductor', label: 'Inductor', icon: '—⋎—', category: 'passive' },
  { type: 'battery', label: 'Battery', icon: '—⊥⊤—', category: 'power' },
  { type: 'ground', label: 'Ground', icon: '⊥', category: 'power' },
  { type: 'switch', label: 'Switch', icon: '—/—', category: 'control' },
  { type: 'led', label: 'LED', icon: '—▷|—', category: 'active' },
  { type: 'diode', label: 'Diode', icon: '—▷|—', category: 'active' },
  { type: 'transistor', label: 'Transistor', icon: '⊳', category: 'active' },
  { type: 'motor', label: 'Motor', icon: 'M', category: 'actuator' },
  { type: 'outlet', label: 'Outlet', icon: '⊙', category: 'wiring' },
  { type: 'lightbulb', label: 'Light', icon: '💡', category: 'wiring' },
  { type: 'junction', label: 'Junction', icon: '•', category: 'wiring' },
];

const wiringComponents = [
  { type: 'breaker', label: 'Circuit Breaker', icon: '⊓', category: 'protection' },
  { type: 'panel', label: 'Panel', icon: '⊞', category: 'distribution' },
  { type: 'receptacle', label: 'Receptacle', icon: '⊙', category: 'device' },
  { type: 'light-fixture', label: 'Light Fixture', icon: '◉', category: 'device' },
  { type: 'switch-sp', label: 'Single Pole Switch', icon: 'S', category: 'control' },
  { type: 'switch-3way', label: '3-Way Switch', icon: 'S₃', category: 'control' },
  { type: 'gfci', label: 'GFCI Outlet', icon: 'G', category: 'device' },
  { type: 'fan', label: 'Ceiling Fan', icon: '⚙', category: 'device' },
];

export default function SchematicWiringPage() {
  const [elements, setElements] = useState<SchematicElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<SchematicElement | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'wire' | 'text' | 'shape'>('select');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [wireStart, setWireStart] = useState<{ x: number; y: number } | null>(null);
  const [activeTab, setActiveTab] = useState('schematic');
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

    const newElement: SchematicElement = {
      id: `${draggedType}-${Date.now()}`,
      type: 'symbol',
      subType: draggedType,
      x,
      y,
      rotation: 0,
      label: draggedType.toUpperCase(),
    };

    setElements(prev => [...prev, newElement]);
    setDraggedType(null);
  }, [draggedType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'wire') {
      if (!wireStart) {
        setWireStart({ x, y });
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
      }
    } else if (tool === 'text') {
      const newText: SchematicElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x,
        y,
        rotation: 0,
        label: 'Text',
      };
      setElements(prev => [...prev, newText]);
    }
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    setSelectedElement(null);
  };

  const duplicateElement = (element: SchematicElement) => {
    const newElement = {
      ...element,
      id: `${element.subType || element.type}-${Date.now()}`,
      x: element.x + 30,
      y: element.y + 30,
    };
    setElements(prev => [...prev, newElement]);
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
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
  };

  const exportSchematic = () => {
    const data = JSON.stringify(elements, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schematic-${Date.now()}.json`;
    a.click();
  };

  const calculateTraceWidth = (current: number, thickness: number, tempRise: number) => {
    // IPC-2221 formula
    const k = thickness === 1 ? 0.048 : 0.024;
    const b = thickness === 1 ? 0.44 : 0.44;
    const c = thickness === 1 ? 0.725 : 0.725;
    
    const area = (current / (k * Math.pow(tempRise, b))) ** (1 / c);
    const width = area / (thickness * 1.378); // Convert to mils
    return width;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428]">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00C2D1] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
                <FileText className="h-10 w-10 text-[#00C2D1]" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white">Schematic & Wiring Designer</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Professional schematic editor and residential wiring planner
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="schematic" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <CircuitBoard className="h-4 w-4 mr-2" />
                Schematic Editor
              </TabsTrigger>
              <TabsTrigger value="wiring" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <Home className="h-4 w-4 mr-2" />
                Wiring Planner
              </TabsTrigger>
              <TabsTrigger value="pcb" className="data-[state=active]:bg-[#00C2D1] data-[state=active]:text-[#071428]">
                <Zap className="h-4 w-4 mr-2" />
                PCB Calculator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schematic">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-[#00C2D1]" />
                    Schematic Editor
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Design professional electronic schematics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6 flex-wrap items-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={tool === 'select' ? 'default' : 'outline'}
                        onClick={() => setTool('select')}
                        className={tool === 'select' ? 'bg-[#00C2D1] text-[#071428]' : 'bg-white/10 border-white/20 text-white'}
                      >
                        <Move className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={tool === 'wire' ? 'default' : 'outline'}
                        onClick={() => setTool('wire')}
                        className={tool === 'wire' ? 'bg-[#00C2D1] text-[#071428]' : 'bg-white/10 border-white/20 text-white'}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={tool === 'text' ? 'default' : 'outline'}
                        onClick={() => setTool('text')}
                        className={tool === 'text' ? 'bg-[#00C2D1] text-[#071428]' : 'bg-white/10 border-white/20 text-white'}
                      >
                        <Type className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-white text-sm min-w-[60px] text-center">{zoom}%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowGrid(!showGrid)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      Grid
                    </Button>

                    <div className="flex-1" />

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearCanvas}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={exportSchematic}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    {/* Symbol Library */}
                    <Card className="bg-[#071428] border-white/20">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-3 text-[#00C2D1]">Symbol Library</h3>
                        <div className="space-y-2 text-sm max-h-[600px] overflow-y-auto">
                          {['passive', 'active', 'power', 'control', 'actuator'].map(category => (
                            <div key={category}>
                              <p className="text-xs text-gray-400 uppercase mb-2 mt-4 first:mt-0">{category}</p>
                              {symbolLibrary
                                .filter(s => s.category === category)
                                .map((symbol) => (
                                  <div
                                    key={symbol.type}
                                    draggable
                                    onDragStart={() => handleDragStart(symbol.type)}
                                    className="p-3 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors"
                                  >
                                    <div className="flex items-center justify-between text-white">
                                      <span className="text-xs">{symbol.label}</span>
                                      <span className="font-mono text-sm">{symbol.icon}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Drawing Canvas */}
                    <Card className="md:col-span-3 bg-white/95 border-white/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-[#071428]">Drawing Canvas</h3>
                          <div className="text-xs text-gray-600">
                            {elements.length} element{elements.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div
                          ref={canvasRef}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onClick={handleCanvasClick}
                          className="bg-white rounded-lg border-2 border-gray-300 min-h-[600px] relative overflow-hidden cursor-crosshair"
                          style={{
                            backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                            backgroundSize: '20px 20px',
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left',
                          }}
                        >
                          {elements.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold text-gray-600">
                                  Drag symbols here or use drawing tools
                                </p>
                                <p className="text-sm mt-2">
                                  Build professional electronic schematics
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {elements.map((element) => {
                                if (element.type === 'wire' && element.points) {
                                  return (
                                    <svg
                                      key={element.id}
                                      className="absolute inset-0 pointer-events-none"
                                      width="100%"
                                      height="100%"
                                    >
                                      <line
                                        x1={element.points[0].x}
                                        y1={element.points[0].y}
                                        x2={element.points[1].x}
                                        y2={element.points[1].y}
                                        stroke={element.color || '#000000'}
                                        strokeWidth="2"
                                      />
                                    </svg>
                                  );
                                }

                                const symbol = symbolLibrary.find(s => s.type === element.subType);
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
                                    style={{
                                      left: element.x,
                                      top: element.y,
                                      transform: `rotate(${element.rotation}deg)`,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedElement(element);
                                    }}
                                  >
                                    {element.type === 'symbol' ? (
                                      <div className="flex flex-col items-center">
                                        <span className="font-mono text-xl mb-1">{symbol?.icon}</span>
                                        <span className="text-xs font-bold text-gray-700">{element.label}</span>
                                        {element.value && (
                                          <span className="text-xs text-gray-600">{element.value}</span>
                                        )}
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
                            <div
                              className="absolute h-2 w-2 bg-[#00C2D1] rounded-full"
                              style={{ left: wireStart.x - 4, top: wireStart.y - 4 }}
                            />
                          )}
                        </div>

                        {/* Element Properties */}
                        {selectedElement && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-gray-50 rounded-lg border"
                          >
                            <h4 className="font-semibold mb-3 text-[#071428]">Element Properties</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Label</Label>
                                <Input
                                  type="text"
                                  value={selectedElement.label}
                                  onChange={(e) => updateElementLabel(selectedElement.id, e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Value</Label>
                                <Input
                                  type="text"
                                  value={selectedElement.value || ''}
                                  onChange={(e) => updateElementValue(selectedElement.id, e.target.value)}
                                  className="h-8 text-sm"
                                  placeholder="e.g., 1kΩ"
                                />
                              </div>
                              <div className="col-span-2 flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => rotateElement(selectedElement.id)}
                                  className="flex-1"
                                >
                                  Rotate 90°
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => duplicateElement(selectedElement)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeElement(selectedElement.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
                    <Home className="h-5 w-5 text-[#00C2D1]" />
                    Residential Wiring Planner
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Plan residential electrical installations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {/* Wiring Components */}
                    <Card className="bg-[#071428] border-white/20">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-3 text-[#00C2D1]">Components</h3>
                        <div className="space-y-2 text-sm max-h-[600px] overflow-y-auto">
                          {['protection', 'distribution', 'device', 'control'].map(category => (
                            <div key={category}>
                              <p className="text-xs text-gray-400 uppercase mb-2 mt-4 first:mt-0">{category}</p>
                              {wiringComponents
                                .filter(c => c.category === category)
                                .map((comp) => (
                                  <div
                                    key={comp.type}
                                    draggable
                                    onDragStart={() => handleDragStart(comp.type)}
                                    className="p-3 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors"
                                  >
                                    <div className="flex items-center justify-between text-white">
                                      <span className="text-xs">{comp.label}</span>
                                      <span className="font-mono text-lg">{comp.icon}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Floor Plan Canvas */}
                    <Card className="md:col-span-3 bg-white/95 border-white/20">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 text-[#071428]">Floor Plan</h3>
                        <div
                          className="bg-white rounded-lg border-2 border-gray-300 min-h-[600px] relative"
                          style={{
                            backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-semibold text-gray-600">
                                Draw your floor plan and add electrical components
                              </p>
                              <p className="text-sm mt-2">
                                Plan outlets, switches, lighting, and circuits
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pcb">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#00C2D1]" />
                    PCB Trace Width Calculator
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Calculate optimal trace widths for PCB design
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PCBCalculator />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• Drag-and-drop component placement</p>
                <p>• Professional symbol library</p>
                <p>• Wire routing and connections</p>
                <p>• Multi-sheet design support</p>
                <p>• Export to various formats</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Wiring Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• NEC compliant layouts</p>
                <p>• Color-coded circuits</p>
                <p>• Load calculations</p>
                <p>• Circuit labeling</p>
                <p>• Panel schedules</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• PDF documentation</p>
                <p>• PNG/SVG images</p>
                <p>• Netlist export</p>
                <p>• BOM generation</p>
                <p>• JSON schematic data</p>
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
    // IPC-2221 formula
    const k = thickness === 1 ? 0.048 : 0.024;
    const b = 0.44;
    const c = 0.725;
    
    const area = Math.pow(current / (k * Math.pow(tempRise, b)), 1 / c);
    const width = area / (thickness * 1.378); // Convert to mils
    setTraceWidth(width);
  }, [current, thickness, tempRise]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-white">Current (A)</Label>
          <Input
            type="number"
            value={current}
            onChange={(e) => setCurrent(parseFloat(e.target.value) || 0)}
            className="mt-2 bg-white/10 border-white/20 text-white"
            step="0.1"
          />
        </div>
        <div>
          <Label className="text-white">Copper Thickness (oz)</Label>
          <Select value={thickness.toString()} onValueChange={(v) => setThickness(parseFloat(v))}>
            <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
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
          <Input
            type="number"
            value={tempRise}
            onChange={(e) => setTempRise(parseFloat(e.target.value) || 0)}
            className="mt-2 bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      <Card className="bg-[#00C2D1]/20 border-[#00C2D1]/40">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-white text-sm mb-2">Minimum Trace Width</p>
            <p className="text-[#00C2D1] text-4xl font-bold">
              {traceWidth.toFixed(2)} mils
            </p>
            <p className="text-white text-2xl mt-2">
              {(traceWidth * 0.0254).toFixed(3)} mm
            </p>
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
