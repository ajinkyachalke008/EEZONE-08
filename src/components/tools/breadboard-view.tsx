'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  RotateCw, 
  Zap, 
  AlertCircle,
  Info,
  Cable,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Breadboard configuration
const BREADBOARD_CONFIG = {
  columns: 63, // a-j columns
  rows: 30, // 1-30 rows
  holeSize: 12,
  holeSpacing: 16,
  padding: 20,
  powerRailRows: 2,
  centerGap: 8,
};

// Component footprints for breadboard
interface ComponentFootprint {
  id: string;
  label: string;
  icon: string;
  pins: { row: number; col: number; label?: string }[];
  width: number;
  height: number;
  color: string;
}

const BREADBOARD_COMPONENTS: ComponentFootprint[] = [
  {
    id: 'led',
    label: 'LED',
    icon: '💡',
    pins: [
      { row: 0, col: 0, label: 'A' },
      { row: 0, col: 2, label: 'K' },
    ],
    width: 2,
    height: 1,
    color: '#FF6B00',
  },
  {
    id: 'resistor',
    label: 'Resistor',
    icon: '⚡',
    pins: [
      { row: 0, col: 0 },
      { row: 0, col: 4 },
    ],
    width: 4,
    height: 1,
    color: '#9C4AFF',
  },
  {
    id: 'button',
    label: 'Push Button',
    icon: '🔘',
    pins: [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 3, col: 0 },
      { row: 3, col: 2 },
    ],
    width: 2,
    height: 3,
    color: '#00E5FF',
  },
  {
    id: 'arduino-uno',
    label: 'Arduino Uno',
    icon: '🎛️',
    pins: [
      // Digital pins
      { row: 0, col: 0, label: 'D0' },
      { row: 0, col: 1, label: 'D1' },
      { row: 0, col: 2, label: 'D2' },
      { row: 0, col: 3, label: 'D3' },
      { row: 0, col: 4, label: 'D4' },
      { row: 0, col: 5, label: 'D5' },
      { row: 0, col: 6, label: 'D6' },
      { row: 0, col: 7, label: 'D7' },
      // Power pins
      { row: 15, col: 0, label: '5V' },
      { row: 15, col: 1, label: 'GND' },
      { row: 15, col: 2, label: 'VIN' },
    ],
    width: 8,
    height: 15,
    color: '#0066CC',
  },
  {
    id: 'capacitor',
    label: 'Capacitor',
    icon: '⚡',
    pins: [
      { row: 0, col: 0, label: '+' },
      { row: 0, col: 1, label: '-' },
    ],
    width: 1,
    height: 1,
    color: '#FFD700',
  },
  {
    id: 'ic-555',
    label: '555 Timer IC',
    icon: '🔲',
    pins: [
      { row: 0, col: 0, label: '1' },
      { row: 0, col: 1, label: '2' },
      { row: 0, col: 2, label: '3' },
      { row: 0, col: 3, label: '4' },
      { row: 3, col: 0, label: '8' },
      { row: 3, col: 1, label: '7' },
      { row: 3, col: 2, label: '6' },
      { row: 3, col: 3, label: '5' },
    ],
    width: 4,
    height: 3,
    color: '#9C4AFF',
  },
];

// Jumper wire colors
const JUMPER_COLORS = [
  { name: 'Red', color: '#FF0000', use: 'Power (+5V)' },
  { name: 'Black', color: '#000000', use: 'Ground (GND)' },
  { name: 'Green', color: '#00FF00', use: 'Signal' },
  { name: 'Blue', color: '#0000FF', use: 'Signal' },
  { name: 'Yellow', color: '#FFFF00', use: 'Signal' },
  { name: 'Orange', color: '#FF6B00', use: 'Signal' },
  { name: 'White', color: '#FFFFFF', use: 'Signal' },
];

interface PlacedComponent {
  id: string;
  componentId: string;
  row: number;
  col: number;
  rotation: number;
  value?: string;
}

interface JumperWire {
  id: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
  color: string;
}

interface DragWire {
  from: { row: number; col: number; x: number; y: number };
  currentX: number;
  currentY: number;
}

interface BreadboardViewProps {
  onSync?: (components: PlacedComponent[], wires: JumperWire[]) => void;
}

export function BreadboardView({ onSync }: BreadboardViewProps) {
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [jumperWires, setJumperWires] = useState<JumperWire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponent | null>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);
  const [dragWire, setDragWire] = useState<DragWire | null>(null);
  const [selectedWireColor, setSelectedWireColor] = useState(JUMPER_COLORS[2].color);
  const [hoveredHole, setHoveredHole] = useState<{ row: number; col: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const breadboardRef = useRef<HTMLDivElement>(null);

  // Get hole position
  const getHolePosition = (row: number, col: number) => {
    const x = BREADBOARD_CONFIG.padding + col * BREADBOARD_CONFIG.holeSpacing;
    const y = BREADBOARD_CONFIG.padding + row * BREADBOARD_CONFIG.holeSpacing;
    return { x, y };
  };

  // Get hole from position
  const getHoleFromPosition = (x: number, y: number) => {
    const col = Math.round((x - BREADBOARD_CONFIG.padding) / BREADBOARD_CONFIG.holeSpacing);
    const row = Math.round((y - BREADBOARD_CONFIG.padding) / BREADBOARD_CONFIG.holeSpacing);
    
    if (col >= 0 && col < BREADBOARD_CONFIG.columns && row >= 0 && row < BREADBOARD_CONFIG.rows) {
      return { row, col };
    }
    return null;
  };

  // Handle component drag start
  const handleComponentDragStart = (componentId: string) => {
    setDraggedComponentType(componentId);
  };

  // Handle drop on breadboard
  const handleBreadboardDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedComponentType || !breadboardRef.current) return;

    const rect = breadboardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const hole = getHoleFromPosition(x, y);
    if (!hole) {
      toast.error('Invalid position on breadboard');
      setDraggedComponentType(null);
      return;
    }

    const component = BREADBOARD_COMPONENTS.find(c => c.id === draggedComponentType);
    if (!component) return;

    // Check if position is available
    const occupied = placedComponents.some(pc => {
      const comp = BREADBOARD_COMPONENTS.find(c => c.id === pc.componentId);
      if (!comp) return false;
      
      return comp.pins.some(pin => {
        const pinRow = pc.row + pin.row;
        const pinCol = pc.col + pin.col;
        return component.pins.some(newPin => {
          return pinRow === hole.row + newPin.row && pinCol === hole.col + newPin.col;
        });
      });
    });

    if (occupied) {
      toast.error('Position occupied by another component');
      setDraggedComponentType(null);
      return;
    }

    const newComponent: PlacedComponent = {
      id: `${draggedComponentType}-${Date.now()}`,
      componentId: draggedComponentType,
      row: hole.row,
      col: hole.col,
      rotation: 0,
    };

    setPlacedComponents(prev => [...prev, newComponent]);
    setDraggedComponentType(null);
    toast.success(`${component.label} placed`);
  }, [draggedComponentType, placedComponents, zoom]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Remove component
  const removeComponent = (id: string) => {
    setPlacedComponents(prev => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
    toast.info('Component removed');
  };

  // Handle hole click for wiring
  const handleHoleClick = (row: number, col: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!dragWire) {
      // Start wire
      const pos = getHolePosition(row, col);
      setDragWire({
        from: { row, col, x: pos.x, y: pos.y },
        currentX: pos.x,
        currentY: pos.y,
      });
      toast.info('Drag to connect...', { duration: 1000 });
    } else {
      // End wire
      if (dragWire.from.row === row && dragWire.from.col === col) {
        toast.error('Cannot connect to same hole');
        setDragWire(null);
        return;
      }

      const newWire: JumperWire = {
        id: `wire-${Date.now()}`,
        from: { row: dragWire.from.row, col: dragWire.from.col },
        to: { row, col },
        color: selectedWireColor,
      };

      setJumperWires(prev => [...prev, newWire]);
      setDragWire(null);
      toast.success('Wire connected!');
    }
  };

  // Handle breadboard mouse move
  const handleBreadboardMouseMove = (e: React.MouseEvent) => {
    if (!dragWire || !breadboardRef.current) return;

    const rect = breadboardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setDragWire(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  // Cancel wire drawing
  const handleBreadboardClick = () => {
    if (dragWire) {
      setDragWire(null);
      toast.info('Wire cancelled');
    }
  };

  // Delete selected wire
  const deleteWire = (id: string) => {
    setJumperWires(prev => prev.filter(w => w.id !== id));
    toast.info('Wire removed');
  };

  // Clear all
  const clearAll = () => {
    setPlacedComponents([]);
    setJumperWires([]);
    setSelectedComponent(null);
    setDragWire(null);
    toast.info('Breadboard cleared');
  };

  // Sync with schematic
  const handleSync = () => {
    onSync?.(placedComponents, jumperWires);
    toast.success('Synchronized with circuit schematic!');
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="space-y-4">
      {/* Component Palette */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#00E5FF]" />
            Breadboard Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {BREADBOARD_COMPONENTS.map(comp => (
              <motion.div
                key={comp.id}
                draggable
                onDragStart={() => handleComponentDragStart(comp.id)}
                whileHover={{ scale: 1.05 }}
                className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-move hover:bg-white/10 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{comp.icon}</div>
                  <p className="text-xs text-white font-medium truncate">{comp.label}</p>
                  <Badge 
                    variant="outline" 
                    className="text-[9px] mt-1"
                    style={{ borderColor: comp.color, color: comp.color }}
                  >
                    {comp.pins.length} pins
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="bg-white/10 border-white/20 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="bg-white/10 border-white/20 text-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Wire Color:</span>
          <div className="flex gap-1">
            {JUMPER_COLORS.map(color => (
              <button
                key={color.color}
                onClick={() => setSelectedWireColor(color.color)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  selectedWireColor === color.color ? 'border-white scale-110' : 'border-white/30'
                }`}
                style={{ backgroundColor: color.color }}
                title={`${color.name} - ${color.use}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSync}
            disabled={placedComponents.length === 0}
            className="bg-[#9C4AFF] text-white hover:bg-[#9C4AFF]/90"
            size="sm"
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Sync with Circuit
          </Button>
          <Button
            onClick={clearAll}
            variant="outline"
            className="bg-white/10 border-white/20 text-white"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2 text-[#00E5FF]">
          <Zap className="h-4 w-4" />
          <span>{placedComponents.length} components</span>
        </div>
        <div className="flex items-center gap-2 text-[#FF6B00]">
          <Cable className="h-4 w-4" />
          <span>{jumperWires.length} wires</span>
        </div>
        {dragWire && (
          <div className="flex items-center gap-2 text-[#9C4AFF] animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <span>Wiring mode active...</span>
          </div>
        )}
      </div>

      {/* Breadboard Canvas */}
      <Card className="bg-white/95 border-white/20 overflow-auto">
        <CardContent className="p-4">
          <div
            ref={breadboardRef}
            onDrop={handleBreadboardDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleBreadboardMouseMove}
            onClick={handleBreadboardClick}
            className="relative bg-[#1a1a1a] rounded-lg border-4 border-[#8B4513] cursor-crosshair"
            style={{
              width: BREADBOARD_CONFIG.columns * BREADBOARD_CONFIG.holeSpacing + BREADBOARD_CONFIG.padding * 2,
              height: BREADBOARD_CONFIG.rows * BREADBOARD_CONFIG.holeSpacing + BREADBOARD_CONFIG.padding * 2,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            {/* Power Rails (top and bottom) */}
            <div className="absolute left-0 right-0 top-2 h-8 bg-gradient-to-b from-red-600/30 to-blue-600/30 rounded" />
            <div className="absolute left-0 right-0 bottom-2 h-8 bg-gradient-to-b from-red-600/30 to-blue-600/30 rounded" />

            {/* Center Gap */}
            <div 
              className="absolute left-0 right-0 bg-[#2a2a2a] border-y-2 border-[#8B4513]"
              style={{
                top: BREADBOARD_CONFIG.padding + (BREADBOARD_CONFIG.rows / 2) * BREADBOARD_CONFIG.holeSpacing - BREADBOARD_CONFIG.centerGap / 2,
                height: BREADBOARD_CONFIG.centerGap,
              }}
            />

            {/* Holes Grid */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {Array.from({ length: BREADBOARD_CONFIG.rows }).map((_, row) =>
                Array.from({ length: BREADBOARD_CONFIG.columns }).map((_, col) => {
                  const { x, y } = getHolePosition(row, col);
                  const isHovered = hoveredHole?.row === row && hoveredHole?.col === col;
                  
                  return (
                    <g key={`${row}-${col}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r={BREADBOARD_CONFIG.holeSize / 2}
                        fill={isHovered ? '#9C4AFF' : '#444'}
                        stroke={isHovered ? '#00E5FF' : '#666'}
                        strokeWidth="1"
                        className="pointer-events-auto cursor-pointer hover:fill-[#9C4AFF]"
                        onClick={(e) => handleHoleClick(row, col, e)}
                        onMouseEnter={() => setHoveredHole({ row, col })}
                        onMouseLeave={() => setHoveredHole(null)}
                      />
                      {/* Hole labels */}
                      {row === 0 && (
                        <text
                          x={x}
                          y={y - 15}
                          fontSize="8"
                          fill="#888"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {col + 1}
                        </text>
                      )}
                    </g>
                  );
                })
              )}
            </svg>

            {/* Jumper Wires */}
            <svg className="absolute inset-0" style={{ zIndex: 2 }}>
              {jumperWires.map(wire => {
                const fromPos = getHolePosition(wire.from.row, wire.from.col);
                const toPos = getHolePosition(wire.to.row, wire.to.col);
                
                // Create arched path for wires
                const midX = (fromPos.x + toPos.x) / 2;
                const midY = (fromPos.y + toPos.y) / 2;
                const arch = Math.min(Math.abs(toPos.x - fromPos.x) / 3, 30);
                
                return (
                  <g key={wire.id} className="group cursor-pointer">
                    {/* Wire shadow */}
                    <path
                      d={`M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY - arch} ${toPos.x} ${toPos.y}`}
                      fill="none"
                      stroke="#000"
                      strokeWidth="6"
                      opacity="0.3"
                      filter="blur(2px)"
                    />
                    {/* Wire */}
                    <path
                      d={`M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY - arch} ${toPos.x} ${toPos.y}`}
                      fill="none"
                      stroke={wire.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="transition-all group-hover:stroke-width-6"
                    />
                    {/* Delete button */}
                    <g
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWire(wire.id);
                      }}
                    >
                      <circle cx={midX} cy={midY - arch} r="8" fill="#FF0000" />
                      <text
                        x={midX}
                        y={midY - arch + 4}
                        fontSize="10"
                        fill="white"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        ×
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Drag wire preview */}
              {dragWire && (
                <g>
                  <line
                    x1={dragWire.from.x}
                    y1={dragWire.from.y}
                    x2={dragWire.currentX}
                    y2={dragWire.currentY}
                    stroke={selectedWireColor}
                    strokeWidth="4"
                    strokeDasharray="8,4"
                    strokeLinecap="round"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="12"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  </line>
                  <circle cx={dragWire.from.x} cy={dragWire.from.y} r="6" fill={selectedWireColor} />
                  <circle cx={dragWire.currentX} cy={dragWire.currentY} r="5" fill={selectedWireColor} opacity="0.6" />
                </g>
              )}
            </svg>

            {/* Placed Components */}
            {placedComponents.map(pc => {
              const component = BREADBOARD_COMPONENTS.find(c => c.id === pc.componentId);
              if (!component) return null;

              const pos = getHolePosition(pc.row, pc.col);
              const isSelected = selectedComponent?.id === pc.id;

              return (
                <motion.div
                  key={pc.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute p-2 rounded cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-[#00E5FF] ring-offset-2 ring-offset-[#1a1a1a]' : ''
                  }`}
                  style={{
                    left: pos.x - 20,
                    top: pos.y - 20,
                    backgroundColor: component.color + '40',
                    border: `2px solid ${component.color}`,
                    zIndex: 10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComponent(pc);
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl">{component.icon}</div>
                    <p className="text-[8px] text-white font-bold mt-1">{component.label}</p>
                  </div>
                  
                  {isSelected && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(pc.id);
                      }}
                    >
                      ×
                    </Button>
                  )}

                  {/* Component pins indicators */}
                  {component.pins.map((pin, idx) => {
                    const pinPos = getHolePosition(pc.row + pin.row, pc.col + pin.col);
                    return (
                      <div
                        key={idx}
                        className="absolute w-2 h-2 rounded-full bg-yellow-400 border border-yellow-600"
                        style={{
                          left: pinPos.x - pos.x + 20 - 4,
                          top: pinPos.y - pos.y + 20 - 4,
                        }}
                        title={pin.label || `Pin ${idx + 1}`}
                      />
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="bg-[#00E5FF]/10 border-[#00E5FF]/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">Breadboard Tips:</p>
              <ul className="text-[#B8A7E0] space-y-1 text-xs">
                <li>• <strong>Drag components</strong> from the palette onto the breadboard</li>
                <li>• <strong>Click holes</strong> to start and end jumper wires</li>
                <li>• <strong>Select wire color</strong> before connecting (Red=Power, Black=GND)</li>
                <li>• <strong>Hover over wires</strong> to see delete button</li>
                <li>• <strong>Click "Sync"</strong> to convert breadboard layout to schematic</li>
                <li>• Power rails at top/bottom are connected horizontally</li>
                <li>• Main terminal strips connect vertically (except center gap)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
