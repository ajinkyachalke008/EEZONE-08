'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  CircuitBoard, ArrowLeft, Play, Pause, RotateCcw, Download, Zap, Activity, 
  Gauge, Trash2, Cable, Link2, AlertTriangle, CheckCircle, Info, FileCode,
  Search, BookOpen, Save, Upload, Sparkles, Bug, TrendingUp, BarChart3,
  FolderOpen, FileJson, Image as ImageIcon, FileText, Undo2, Redo2, 
  ZoomIn, ZoomOut, Grid3X3, Copy, Layers, Eye, EyeOff, Lock, Unlock,
  RotateCw, FlipHorizontal, FlipVertical, Maximize2, Move, MousePointer,
  Target, Crosshair, Magnet, Radio
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
  type CircuitTemplate 
} from '@/lib/circuit-templates';
import { 
  validateCircuit, 
  autoLabelNets, 
  buildNetlist,
  type ValidationError 
} from '@/lib/circuit-validator';
import {
  runSimulation,
  updateSimulation,
  type SimulationResult,
  type SimulationSettings,
  type SimulationComponent
} from '@/lib/simulation-engine';
import {
  generateSpiceNetlist,
  downloadNetlist,
  isSpiceEligible
} from '@/lib/spice-netlist-generator';
import { runSpiceSimulation } from '@/lib/spice-runner';
import { MeasurementBus } from '@/lib/measurement-bus';
import { InteractiveMultimeter } from '@/components/circuit/interactive-multimeter';
import { InteractiveOscilloscope } from '@/components/circuit/interactive-oscilloscope';
import { SignalGeneratorPanel } from '@/components/circuit/signal-generator-panel';
import { EnhancedComponentProperties } from '@/components/circuit/enhanced-component-properties';
import type { SignalGeneratorConfig } from '@/lib/instrument-types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

// Enhanced component SVG symbols for professional rendering
const ComponentSymbol = ({ type, rotation = 0, isActive = false }: { type: string; rotation?: number; isActive?: boolean }) => {
  const color = isActive ? '#00E5FF' : '#374151';
  const glowColor = isActive ? '#00E5FF40' : 'transparent';
  
  const symbols: Record<string, JSX.Element> = {
    resistor: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <line x1="0" y1="30" x2="12" y2="30" stroke={color} strokeWidth="2"/>
        <path d="M12 30 L16 20 L24 40 L32 20 L40 40 L48 20 L52 30" fill="none" stroke={color} strokeWidth="2" filter={isActive ? "url(#glow)" : ""}/>
        <line x1="48" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    capacitor: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="0" y1="30" x2="25" y2="30" stroke={color} strokeWidth="2"/>
        <line x1="25" y1="10" x2="25" y2="50" stroke={color} strokeWidth="3"/>
        <line x1="35" y1="10" x2="35" y2="50" stroke={color} strokeWidth="3"/>
        <line x1="35" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    inductor: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="0" y1="30" x2="10" y2="30" stroke={color} strokeWidth="2"/>
        <path d="M10 30 Q15 10 20 30 Q25 50 30 30 Q35 10 40 30 Q45 50 50 30" fill="none" stroke={color} strokeWidth="2"/>
        <line x1="50" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    led: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="0" y1="30" x2="20" y2="30" stroke={color} strokeWidth="2"/>
        <polygon points="20,15 20,45 40,30" fill={isActive ? '#FF6B00' : 'none'} stroke={color} strokeWidth="2"/>
        <line x1="40" y1="15" x2="40" y2="45" stroke={color} strokeWidth="2"/>
        <line x1="40" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
        {/* Light rays */}
        <line x1="42" y1="10" x2="50" y2="2" stroke={isActive ? '#FF6B00' : color} strokeWidth="1.5"/>
        <line x1="45" y1="12" x2="55" y2="5" stroke={isActive ? '#FF6B00' : color} strokeWidth="1.5"/>
      </svg>
    ),
    diode: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="0" y1="30" x2="20" y2="30" stroke={color} strokeWidth="2"/>
        <polygon points="20,15 20,45 40,30" fill="none" stroke={color} strokeWidth="2"/>
        <line x1="40" y1="15" x2="40" y2="45" stroke={color} strokeWidth="2"/>
        <line x1="40" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    transistor_npn: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="0" y1="30" x2="20" y2="30" stroke={color} strokeWidth="2"/>
        <line x1="20" y1="15" x2="20" y2="45" stroke={color} strokeWidth="3"/>
        <line x1="20" y1="22" x2="45" y2="8" stroke={color} strokeWidth="2"/>
        <line x1="20" y1="38" x2="45" y2="52" stroke={color} strokeWidth="2"/>
        <polygon points="40,48 45,52 42,45" fill={color}/>
        <circle cx="30" cy="30" r="18" fill="none" stroke={color} strokeWidth="1"/>
      </svg>
    ),
    battery: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="0" y1="30" x2="20" y2="30" stroke={color} strokeWidth="2"/>
        <line x1="20" y1="15" x2="20" y2="45" stroke={color} strokeWidth="3"/>
        <line x1="28" y1="22" x2="28" y2="38" stroke={color} strokeWidth="1.5"/>
        <line x1="36" y1="15" x2="36" y2="45" stroke={color} strokeWidth="3"/>
        <line x1="44" y1="22" x2="44" y2="38" stroke={color} strokeWidth="1.5"/>
        <line x1="44" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
        <text x="5" y="55" fontSize="8" fill={color}>+</text>
        <text x="50" y="55" fontSize="8" fill={color}>-</text>
      </svg>
    ),
    ground: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <line x1="30" y1="0" x2="30" y2="25" stroke={color} strokeWidth="2"/>
        <line x1="10" y1="25" x2="50" y2="25" stroke={color} strokeWidth="2"/>
        <line x1="15" y1="33" x2="45" y2="33" stroke={color} strokeWidth="2"/>
        <line x1="22" y1="41" x2="38" y2="41" stroke={color} strokeWidth="2"/>
        <line x1="27" y1="49" x2="33" y2="49" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    voltage_dc: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="2"/>
        <text x="22" y="28" fontSize="12" fill={color}>+</text>
        <text x="22" y="42" fontSize="12" fill={color}>−</text>
        <line x1="30" y1="0" x2="30" y2="10" stroke={color} strokeWidth="2"/>
        <line x1="30" y1="50" x2="30" y2="60" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    voltage_ac: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="2"/>
        <path d="M20 30 Q25 20 30 30 Q35 40 40 30" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="30" y1="0" x2="30" y2="10" stroke={color} strokeWidth="2"/>
        <line x1="30" y1="50" x2="30" y2="60" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    op_amp: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <polygon points="5,10 5,50 55,30" fill="none" stroke={color} strokeWidth="2"/>
        <text x="10" y="24" fontSize="10" fill={color}>−</text>
        <text x="10" y="42" fontSize="10" fill={color}>+</text>
        <line x1="0" y1="20" x2="5" y2="20" stroke={color} strokeWidth="2"/>
        <line x1="0" y1="40" x2="5" y2="40" stroke={color} strokeWidth="2"/>
        <line x1="55" y1="30" x2="60" y2="30" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    '555_timer': (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <rect x="10" y="10" width="40" height="40" fill="none" stroke={color} strokeWidth="2"/>
        <text x="20" y="35" fontSize="10" fontWeight="bold" fill={color}>555</text>
        <line x1="0" y1="20" x2="10" y2="20" stroke={color} strokeWidth="2"/>
        <line x1="0" y1="40" x2="10" y2="40" stroke={color} strokeWidth="2"/>
        <line x1="50" y1="20" x2="60" y2="20" stroke={color} strokeWidth="2"/>
        <line x1="50" y1="40" x2="60" y2="40" stroke={color} strokeWidth="2"/>
        <line x1="30" y1="0" x2="30" y2="10" stroke={color} strokeWidth="2"/>
        <line x1="30" y1="50" x2="30" y2="60" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    arduino_uno: (
      <svg width="80" height="60" viewBox="0 0 80 60">
        <rect x="5" y="5" width="70" height="50" rx="3" fill="#00979D" stroke={color} strokeWidth="2"/>
        <rect x="10" y="45" width="60" height="8" fill="#1A1A1A"/>
        <text x="20" y="32" fontSize="10" fontWeight="bold" fill="white">Arduino</text>
        <text x="30" y="44" fontSize="8" fill="white">UNO</text>
        <circle cx="15" cy="15" r="3" fill="#FF0"/>
        <rect x="60" y="10" width="10" height="20" fill="#999"/>
      </svg>
    ),
  };
  
  return (
    <div style={{ transform: `rotate(${rotation}deg)` }}>
      {symbols[type] || (
        <div className="w-[60px] h-[60px] flex items-center justify-center bg-gray-200 rounded border-2 border-gray-400">
          <span className="text-xs text-gray-600">{type}</span>
        </div>
      )}
    </div>
  );
};

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: number;
  unit?: string;
  rotation: number;
  locked?: boolean;
  label?: string;
}

interface Wire {
  id: string;
  from: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
  to: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right' };
  color: string;
  netLabel?: string;
  path: { x: number; y: number }[];
}

interface HistoryState {
  components: Component[];
  wires: Wire[];
}

interface DragWire {
  from: { componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number };
  currentX: number;
  currentY: number;
}

const wireColors = ['#FF00C8', '#00E5FF', '#9C4AFF', '#FF6B00', '#00FF88', '#FFD700', '#FF4444', '#44FF44'];

const GRID_SIZE = 20;

export default function CircuitSimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'wire' | 'move' | 'zoom'>('select');
  
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    mode: 'transient',
    dcMaxIterations: 100,
    dcTolerance: 1e-6,
    acStartFreq: 1,
    acStopFreq: 1000000,
    acPointsPerDecade: 10,
    transientStartTime: 0,
    transientStopTime: 0.01,
    transientTimeStep: 0.0001
  });
  const [liveEditMode, setLiveEditMode] = useState(false);
  
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [power, setPower] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [engineUsed, setEngineUsed] = useState<'spice-ts' | 'legacy-mna'>('spice-ts');
  const [spiceModalOpen, setSpiceModalOpen] = useState(false);
  const [currentNetlist, setCurrentNetlist] = useState('');
  const [snappedTerminal, setSnappedTerminal] = useState<{ componentId: string; terminal: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number } | null>(null);
  
  // Real Virtual Laboratory Measurement Bus
  const [measurementBus, setMeasurementBus] = useState<MeasurementBus>(() => new MeasurementBus());
  const [signalGenConfig, setSignalGenConfig] = useState<SignalGeneratorConfig>({
    enabled: true,
    waveform: 'SINE',
    frequency: 1000,
    amplitude: 5.0,
    offset: 0.0,
    dutyCycle: 50,
    outputNode: '1',
    referenceNode: '0'
  });
  const [showSignalGen, setShowSignalGen] = useState(false);

  const [wires, setWires] = useState<Wire[]>([]);
  const [dragWire, setDragWire] = useState<DragWire | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [hoveredTerminal, setHoveredTerminal] = useState<{ componentId: string; terminal: string } | null>(null);
  const [selectedWires, setSelectedWires] = useState<string[]>([]);
  const [wireDrawingMode, setWireDrawingMode] = useState(false);
  const [showAllTerminals, setShowAllTerminals] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: 'component' | 'wire' | 'canvas';
    targetComponentId?: string;
    targetWireId?: string;
  }>({ visible: false, x: 0, y: 0, type: 'canvas' });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('power');
  const [componentSearch, setComponentSearch] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CircuitTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveCategory, setSaveCategory] = useState<string>('beginner');
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showSnapIndicators, setShowSnapIndicators] = useState(false);
  const [snapPosition, setSnapPosition] = useState<{ x: number; y: number } | null>(null);
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const filteredComponents = useMemo(() => {
    return componentSearch 
      ? searchComponents(componentSearch)
      : getComponentsByCategory(selectedCategory);
  }, [componentSearch, selectedCategory]);

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires))
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [components, wires, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setComponents(prevState.components);
      setWires(prevState.wires);
      setHistoryIndex(historyIndex - 1);
      toast.info('Undo');
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setComponents(nextState.components);
      setWires(nextState.wires);
      setHistoryIndex(historyIndex + 1);
      toast.info('Redo');
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponent) {
          removeComponent(selectedComponent.id);
        }
        if (selectedWires.length > 0) {
          deleteSelectedWires();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedComponent) {
          duplicateComponent(selectedComponent);
        }
      }
      if (e.key === 'r' && selectedComponent) {
        rotateComponent(selectedComponent.id);
      }
      // Escape to cancel dragging
      if (e.key === 'Escape') {
        setDragWire(null);
        setWireDrawingMode(false);
        setDraggedType(null);
        setIsDraggingFromLibrary(false);
        setDragPreviewPosition(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedComponent, selectedWires]);

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const loadSavedProjects = async () => {
    setLoadingProjects(true);
    try {
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('ee_zone_user_id') || 'guest'
        : 'guest';
      
      const response = await fetch(`/api/circuit-projects?user_id=${userId}`);
      if (response.ok) {
        const projects = await response.json();
        setSavedProjects(projects);
      } else {
        toast.error('Failed to load projects');
      }
    } catch (error) {
      toast.error('Error loading projects');
      console.error(error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const saveCircuit = async () => {
    if (!saveName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (components.length === 0) {
      toast.error('Cannot save empty circuit');
      return;
    }

    setIsSaving(true);

    try {
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('ee_zone_user_id') || 'guest'
        : 'guest';

      const projectData = {
        userId,
        name: saveName.trim(),
        description: saveDescription.trim() || null,
        category: saveCategory,
        components: JSON.stringify(components),
        wires: JSON.stringify(wires),
        simulationSettings: JSON.stringify(simulationSettings),
        thumbnail: null,
        isTemplate: false
      };

      let response;
      if (currentProjectId) {
        response = await fetch(`/api/circuit-projects/${currentProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
      } else {
        response = await fetch('/api/circuit-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
      }

      if (response.ok) {
        const savedProject = await response.json();
        setCurrentProjectId(savedProject.id);
        toast.success(currentProjectId ? 'Project updated!' : 'Project saved!');
        setShowSaveDialog(false);
        setSaveName('');
        setSaveDescription('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save project');
      }
    } catch (error) {
      toast.error('Error saving project');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadCircuit = async (projectId: number) => {
    try {
      const response = await fetch(`/api/circuit-projects/${projectId}`);
      if (response.ok) {
        const project = await response.json();
        
        const loadedComponents = typeof project.components === 'string' 
          ? JSON.parse(project.components) 
          : project.components;
        const loadedWires = typeof project.wires === 'string'
          ? JSON.parse(project.wires)
          : project.wires;
        const loadedSettings = project.simulationSettings 
          ? (typeof project.simulationSettings === 'string' 
            ? JSON.parse(project.simulationSettings) 
            : project.simulationSettings)
          : simulationSettings;

        setComponents(loadedComponents);
        setWires(loadedWires);
        setSimulationSettings(loadedSettings);
        setCurrentProjectId(project.id);
        setSaveName(project.name);
        setSaveDescription(project.description || '');
        setSaveCategory(project.category);
        
        saveToHistory();
        toast.success(`Loaded: ${project.name}`);
        setShowLoadDialog(false);
        resetSimulation();
      } else {
        toast.error('Failed to load project');
      }
    } catch (error) {
      toast.error('Error loading project');
      console.error(error);
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      const response = await fetch(`/api/circuit-projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Project deleted');
        loadSavedProjects();
        if (currentProjectId === projectId) {
          setCurrentProjectId(null);
          clearCanvas();
        }
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      toast.error('Error deleting project');
      console.error(error);
    }
  };

  const exportAsJSON = () => {
    const exportData = {
      name: saveName || 'Untitled Circuit',
      components,
      wires,
      simulationSettings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportData.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Circuit exported as JSON');
  };

  const exportAsNetlist = () => {
    const nets = buildNetlist(components, wires);
    let netlist = `* Circuit: ${saveName || 'Untitled'}\n`;
    netlist += `* Generated: ${new Date().toISOString()}\n\n`;
    
    components.forEach(comp => {
      const connectedWires = wires.filter(w => 
        w.from.componentId === comp.id || w.to.componentId === comp.id
      );
      
      if (connectedWires.length >= 2) {
        const nodes = connectedWires
          .map(w => w.netLabel || `Node_${w.id}`)
          .slice(0, 2);
        
        netlist += `${comp.type.toUpperCase()} ${comp.id} ${nodes.join(' ')} ${comp.value}${comp.unit}\n`;
      }
    });
    
    netlist += `\n.end\n`;
    
    const blob = new Blob([netlist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(saveName || 'Untitled').replace(/\s+/g, '_')}.net`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Netlist exported');
  };

  // Export as SVG
  const exportAsSVG = () => {
    if (!canvasRef.current) return;
    
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">`;
    svgContent += `<rect width="800" height="600" fill="white"/>`;
    
    // Add wires
    wires.forEach(wire => {
      const pathD = wire.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      svgContent += `<path d="${pathD}" fill="none" stroke="${wire.color}" stroke-width="2"/>`;
    });
    
    // Add component placeholders
    components.forEach(comp => {
      svgContent += `<rect x="${comp.x}" y="${comp.y}" width="60" height="60" fill="#f0f0f0" stroke="#333" stroke-width="2"/>`;
      svgContent += `<text x="${comp.x + 30}" y="${comp.y + 35}" text-anchor="middle" font-size="10">${comp.type}</text>`;
    });
    
    svgContent += `</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(saveName || 'circuit').replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('SVG exported');
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.components && data.wires) {
          setComponents(data.components);
          setWires(data.wires);
          if (data.simulationSettings) {
            setSimulationSettings(data.simulationSettings);
          }
          if (data.name) {
            setSaveName(data.name);
          }
          
          saveToHistory();
          toast.success('Circuit imported successfully');
          resetSimulation();
        } else {
          toast.error('Invalid circuit file format');
        }
      } catch (error) {
        toast.error('Failed to parse circuit file');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const convertToSimulationComponents = useCallback((): { components: SimulationComponent[]; nodes: string[] } => {
    const nets = buildNetlist(components, wires);
    const simComponents: SimulationComponent[] = [];
    const nodeSet = new Set<string>();
    
    components.forEach(comp => {
      const connectedWires = wires.filter(w => 
        w.from.componentId === comp.id || w.to.componentId === comp.id
      );
      
      const componentNodes: string[] = [];
      connectedWires.forEach(wire => {
        const net = nets.find(n =>
          n.components.some(nc =>
            (nc.componentId === wire.from.componentId && nc.terminal === wire.from.terminal) ||
            (nc.componentId === wire.to.componentId && nc.terminal === wire.to.terminal)
          )
        );
        
        if (net && !componentNodes.includes(net.label)) {
          componentNodes.push(net.label);
          nodeSet.add(net.label);
        }
      });
      
      while (componentNodes.length < 2) {
        componentNodes.push('GND');
      }
      
      simComponents.push({
        id: comp.id,
        type: comp.type,
        value: comp.value || 0,
        unit: comp.unit || '',
        nodes: componentNodes
      });
    });
    
    return {
      components: simComponents,
      nodes: Array.from(nodeSet)
    };
  }, [components, wires]);

  const runEnhancedSimulation = useCallback(async () => {
    if (components.length === 0) {
      toast.error('Add components to the circuit first');
      return;
    }
    
    if (wires.length === 0) {
      toast.warning('Add wires to connect components');
      return;
    }

    // Pre-flight circuit validation
    const valErrors = validateCircuit(components, wires);
    const criticalErrors = valErrors.filter(e => e.severity >= 4);
    if (criticalErrors.length > 0) {
      setValidationErrors(valErrors);
      setShowValidation(true);
      toast.error(`Circuit issue: ${criticalErrors[0].message}`);
      return;
    }
    
    setIsRunning(true);
    setLiveEditMode(true);

    // Auto-detect mode if AC or reactive/dynamic components are present
    const hasDynamic = components.some(c => 
      c.type === 'voltage_ac' || 
      c.type === 'signal_generator' || 
      c.type === 'capacitor' || 
      c.type === 'inductor' || 
      c.type === '555_timer'
    );
    const effectiveSettings: SimulationSettings = {
      ...simulationSettings,
      mode: hasDynamic ? 'transient' : simulationSettings.mode
    };

    // Try SPICE solver if circuit components are eligible
    if (isSpiceEligible(components as any)) {
      try {
        const netlist = generateSpiceNetlist(components as any, wires as any, effectiveSettings);
        setCurrentNetlist(netlist);
        const result = await runSpiceSimulation(netlist, effectiveSettings, components as any);
        
        if (result.success) {
          setSimulationResult(result);
          setEngineUsed('spice-ts');
          const bus = new MeasurementBus(result, `spice-${Date.now()}`, components as any);
          setMeasurementBus(bus);
          toast.success(`SPICE ${effectiveSettings.mode.toUpperCase()} simulation completed!`);

          if (result.componentData) {
            const firstComponent = Object.values(result.componentData)[0];
            if (firstComponent) {
              setVoltage(firstComponent.voltage);
              setCurrent(firstComponent.current);
              setPower(firstComponent.power);
              const r = firstComponent.current > 0 ? firstComponent.voltage / firstComponent.current : 0;
              setResistance(r);
            }
          }

          if (result.waveforms && Object.keys(result.waveforms).length > 0) {
            const firstWaveform = Object.values(result.waveforms)[0];
            if (firstWaveform && firstWaveform.voltage && firstWaveform.voltage.length > 0) {
              setWaveform(firstWaveform.voltage);
            }
          }
          return;
        } else {
          toast.warning(`SPICE solver notice: ${result.error || 'Switching to MNA'}`);
        }
      } catch (spiceErr) {
        console.warn('SPICE simulation error, falling back to legacy MNA:', spiceErr);
      }
    }

    // Fallback to MNA solver
    const { components: simComponents, nodes } = convertToSimulationComponents();
    if (simComponents.length === 0) {
      toast.error('No valid components to simulate');
      setIsRunning(false);
      return;
    }

    try {
      const result = runSimulation(simComponents, nodes, simulationSettings);
      setSimulationResult(result);
      setEngineUsed('legacy-mna');
      const bus = new MeasurementBus(result, `mna-${Date.now()}`, components as any);
      setMeasurementBus(bus);
      
      if (result.success) {
        toast.info(`Legacy MNA ${simulationSettings.mode.toUpperCase()} simulation completed`);
        
        if (simulationSettings.mode === 'dc' && result.componentData) {
          const firstComponent = Object.values(result.componentData)[0];
          if (firstComponent) {
            setVoltage(firstComponent.voltage);
            setCurrent(firstComponent.current);
            setPower(firstComponent.power);
          }
        }
        
        if (result.waveforms && Object.keys(result.waveforms).length > 0) {
          const firstWaveform = Object.values(result.waveforms)[0];
          if (firstWaveform && firstWaveform.voltage) {
            setWaveform(firstWaveform.voltage);
          }
        }
      } else {
        toast.error(`Simulation failed: ${result.error}`);
        setIsRunning(false);
        setLiveEditMode(false);
      }
    } catch (error) {
      toast.error('Simulation engine error');
      console.error(error);
      setIsRunning(false);
      setLiveEditMode(false);
    }
  }, [components, wires, simulationSettings, convertToSimulationComponents]);

  const updateComponentValueLive = useCallback(async (id: string, value: number) => {
    const numericVal = isNaN(value) ? 0 : value;

    const updatedComponents = components.map(c => 
      c.id === id ? { ...c, value: numericVal } : c
    );
    setComponents(updatedComponents);
    setSelectedComponent(prev => prev && prev.id === id ? { ...prev, value: numericVal } : prev);

    // Auto-update simulation & MeasurementBus so Oscilloscope/Multimeter update immediately
    const hasDynamic = updatedComponents.some(c => 
      c.type === 'voltage_ac' || c.type === 'signal_generator' || c.type === 'capacitor' || c.type === 'inductor' || c.type.includes('555')
    );
    const effectiveSettings: SimulationSettings = {
      ...simulationSettings,
      mode: hasDynamic ? 'transient' : simulationSettings.mode
    };

    if (isSpiceEligible(updatedComponents as any)) {
      try {
        const netlist = generateSpiceNetlist(updatedComponents as any, wires as any, effectiveSettings);
        setCurrentNetlist(netlist);
        const newResult = await runSpiceSimulation(netlist, effectiveSettings, updatedComponents as any);
        if (newResult.success) {
          setSimulationResult(newResult);
          const bus = new MeasurementBus(newResult, `spice-${Date.now()}`, updatedComponents as any);
          setMeasurementBus(bus);
          return;
        }
      } catch (e) {
        console.warn('SPICE live update error:', e);
      }
    }

    try {
      const { components: simComponents, nodes } = convertToSimulationComponents();
      const updatedSimComponents = simComponents.map(sc =>
        sc.id === id ? { ...sc, value: numericVal } : sc
      );
      const newResult = runDcSimulation(updatedSimComponents, nodes, effectiveSettings);
      if (newResult.success) {
        setSimulationResult(newResult);
        const bus = new MeasurementBus(newResult, `mna-${Date.now()}`, updatedComponents as any);
        setMeasurementBus(bus);
      }
    } catch (e) {
      console.warn('Simulation live update fallback error:', e);
    }
  }, [components, wires, simulationSettings, convertToSimulationComponents]);

  const handleExportNetlist = () => {
    if (components.length === 0) {
      toast.error('Add components to generate a SPICE netlist');
      return;
    }
    const netlist = generateSpiceNetlist(components as any, wires as any, simulationSettings);
    setCurrentNetlist(netlist);
    downloadNetlist(netlist, 'eezone-circuit.cir');
    toast.success('Exported SPICE netlist (eezone-circuit.cir)');
  };

  const handlePreviewNetlist = () => {
    if (components.length === 0) {
      toast.error('Add components to generate a SPICE netlist');
      return;
    }
    const netlist = generateSpiceNetlist(components as any, wires as any, simulationSettings);
    setCurrentNetlist(netlist);
    setSpiceModalOpen(true);
  };

  const loadTemplate = (template: CircuitTemplate) => {
    const newComps = template.components;
    const newWires = template.wires.map(w => {
      const fromComp = template.components.find(c => c.id === w.from.componentId);
      const toComp = template.components.find(c => c.id === w.to.componentId);
      const fromPos = fromComp ? getTerminalPosition(fromComp as any, w.from.terminal) : { x: 0, y: 0 };
      const toPos = toComp ? getTerminalPosition(toComp as any, w.to.terminal) : { x: 100, y: 100 };
      return {
        ...w,
        color: w.color || '#0F172A',
        path: createSmartPath(fromPos.x, fromPos.y, toPos.x, toPos.y)
      };
    });

    setComponents(newComps);
    setWires(newWires);
    setSelectedTemplate(template);
    setShowTemplates(false);
    setSaveName(template.name);
    setCurrentProjectId(null);
    saveToHistory();
    toast.success(`Loaded template: ${template.name}`);

    // Determine simulation mode
    const hasAc = newComps.some(c => c.type === 'voltage_ac' || c.type === 'signal_generator' || c.type.includes('555'));
    const mode = hasAc ? 'transient' : 'dc';
    const settings: SimulationSettings = {
      ...simulationSettings,
      mode,
      transientStopTime: 0.01,
      transientTimeStep: 1e-5
    };
    setSimulationSettings(settings);

    // Auto-run simulation immediately so instruments show live values
    setTimeout(async () => {
      try {
        const netlist = generateSpiceNetlist(newComps as any, newWires as any, settings);
        setCurrentNetlist(netlist);
        const res = await runSpiceSimulation(netlist, settings, newComps as any);
        if (res.success) {
          setSimulationResult(res);
          setIsRunning(true);
          setEngineUsed('spice-ts');
          const bus = new MeasurementBus(res, `auto-${Date.now()}`, newComps as any);
          setMeasurementBus(bus);

          if (res.componentData) {
            const firstComponent = Object.values(res.componentData)[0];
            if (firstComponent) {
              setVoltage(firstComponent.voltage);
              setCurrent(firstComponent.current);
              setPower(firstComponent.power);
              const r = firstComponent.current > 0 ? firstComponent.voltage / firstComponent.current : 0;
              setResistance(r);
            }
          }

          if (res.waveforms && Object.keys(res.waveforms).length > 0) {
            const firstWf = Object.values(res.waveforms)[0];
            if (firstWf?.voltage) {
              setWaveform(firstWf.voltage);
            }
          }
        }
      } catch (e) {
        console.warn('Auto-run template error:', e);
      }
    }, 50);
  };

  const runValidation = () => {
    const errors = validateCircuit(components, wires);
    setValidationErrors(errors);
    setShowValidation(true);
    
    if (errors.length === 0) {
      toast.success('No issues found! Circuit looks good.');
    } else {
      const errorCount = errors.filter(e => e.type === 'error').length;
      const warningCount = errors.filter(e => e.type === 'warning').length;
      toast.warning(`Found ${errorCount} error(s) and ${warningCount} warning(s)`);
    }
  };

  const autoLabel = () => {
    const labeledWires = autoLabelNets(wires, components);
    setWires(labeledWires);
    saveToHistory();
    toast.success('Net labels updated automatically');
  };

  const handleDragStart = (type: string) => {
    setDraggedType(type);
    setIsDraggingFromLibrary(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = snapToGridValue((e.clientX - rect.left) / scale);
    const y = snapToGridValue((e.clientY - rect.top) / scale);

    const componentInfo = COMPONENT_LIBRARY.find(c => c.type === draggedType);
    
    const newComponent: Component = {
      id: `${draggedType}-${Date.now()}`,
      type: draggedType,
      x,
      y,
      value: componentInfo?.defaultValue,
      unit: componentInfo?.unit,
      rotation: 0,
      locked: false,
      label: componentInfo?.label
    };

    setComponents(prev => [...prev, newComponent]);
    setDraggedType(null);
    setIsDraggingFromLibrary(false);
    setDragPreviewPosition(null);
    saveToHistory();
    toast.success(`${componentInfo?.label} added to canvas`);
  }, [draggedType, zoom, snapToGrid]);

  const addComponentDirectly = (type: string) => {
    const componentInfo = COMPONENT_LIBRARY.find(c => c.type === type);
    const count = components.length;
    const x = snapToGridValue(160 + (count % 4) * 120);
    const y = snapToGridValue(120 + Math.floor(count / 4) * 100);

    const newComp: Component = {
      id: `${type}-${Date.now()}`,
      type,
      x,
      y,
      value: componentInfo?.defaultValue || 0,
      unit: componentInfo?.defaultUnit || '',
      rotation: 0,
      locked: false
    };

    setComponents(prev => [...prev, newComp]);
    saveToHistory();
    toast.success(`Added ${componentInfo?.label || type}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !isDraggingFromLibrary) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = snapToGridValue((e.clientX - rect.left) / scale);
    const y = snapToGridValue((e.clientY - rect.top) / scale);
    
    setDragPreviewPosition({ x, y });
    setShowSnapIndicators(true);
    setSnapPosition({ x, y });
  };

  const handleDragLeave = () => {
    setDragPreviewPosition(null);
    setShowSnapIndicators(false);
  };

  const removeComponent = (id: string) => {
    const removedWireCount = wires.filter(w => w.from.componentId === id || w.to.componentId === id).length;
    const remainingWires = wires.filter(w => w.from.componentId !== id && w.to.componentId !== id);
    const remainingComponents = components.filter(c => c.id !== id);
    setWires(remainingWires);
    setComponents(remainingComponents);
    setSelectedComponent(null);
    saveToHistory();
    toast.info(`Component removed${removedWireCount > 0 ? ` (${removedWireCount} wire${removedWireCount !== 1 ? 's' : ''} disconnected)` : ''}`);

    if (simulationResult || isRunning || liveEditMode) {
      if (remainingComponents.length > 0) {
        setTimeout(() => runSimulation(), 100);
      } else {
        setSimulationResult(null);
        setMeasurementBus(new MeasurementBus());
      }
    }
  };

  const removeWire = (wireId: string) => {
    const remainingWires = wires.filter(w => w.id !== wireId);
    setWires(remainingWires);
    setSelectedWires(prev => prev.filter(id => id !== wireId));
    saveToHistory();
    toast.info('Wire removed');

    if (simulationResult || isRunning || liveEditMode) {
      setTimeout(() => runSimulation(), 100);
    }
  };

  const removeSelectedWires = () => {
    if (selectedWires.length === 0) return;
    const count = selectedWires.length;
    const remainingWires = wires.filter(w => !selectedWires.includes(w.id));
    setWires(remainingWires);
    setSelectedWires([]);
    saveToHistory();
    toast.info(`Removed ${count} wire${count > 1 ? 's' : ''}`);

    if (simulationResult || isRunning || liveEditMode) {
      setTimeout(() => runSimulation(), 100);
    }
  };

  const duplicateComponent = (component: Component) => {
    const newComponent: Component = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      x: component.x + 60,
      y: component.y + 60,
      locked: false
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
    saveToHistory();
    toast.success('Component duplicated (Ctrl+D)');
  };

  const rotateComponent = (id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
    ));
    setSelectedComponent(prev => prev && prev.id === id ? { ...prev, rotation: (prev.rotation + 90) % 360 } : prev);
    saveToHistory();
    toast.info('Component rotated 90° (R)');
  };

  const toggleLockComponent = (id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, locked: !c.locked } : c
    ));
    setSelectedComponent(prev => prev && prev.id === id ? { ...prev, locked: !prev.locked } : prev);
  };

  const updateComponentValue = (id: string, value: number) => {
    updateComponentValueLive(id, value);
  };

  const getComponentTerminals = (comp: Component): {
    id: 'top' | 'bottom' | 'left' | 'right';
    label?: string;
    x: number;
    y: number;
  }[] => {
    switch (comp.type) {
      case 'ground':
        return [{ id: 'top', label: 'GND', x: 30, y: 0 }];
      case 'voltage_dc':
      case 'voltage_ac':
        return [
          { id: 'top', label: '+', x: 30, y: 0 },
          { id: 'bottom', label: '-', x: 30, y: 60 }
        ];
      case 'transistor_npn':
      case 'transistor_pnp':
        return [
          { id: 'left', label: 'B', x: 0, y: 30 },
          { id: 'top', label: 'C', x: 45, y: 8 },
          { id: 'bottom', label: 'E', x: 45, y: 52 }
        ];
      case 'mosfet_n':
      case 'mosfet_p':
        return [
          { id: 'left', label: 'G', x: 0, y: 30 },
          { id: 'top', label: 'D', x: 45, y: 8 },
          { id: 'bottom', label: 'S', x: 45, y: 52 }
        ];
      case 'op_amp':
      case 'comparator':
        return [
          { id: 'left', label: '+', x: 0, y: 20 },
          { id: 'bottom', label: '-', x: 0, y: 40 },
          { id: 'right', label: 'OUT', x: 60, y: 30 }
        ];
      case 'potentiometer':
        return [
          { id: 'left', label: '1', x: 0, y: 30 },
          { id: 'right', label: '2', x: 60, y: 30 },
          { id: 'top', label: 'W', x: 30, y: 10 }
        ];
      default:
        return [
          { id: 'left', label: comp.type === 'battery' ? '-' : '1', x: 0, y: 30 },
          { id: 'right', label: comp.type === 'battery' ? '+' : '2', x: 60, y: 30 }
        ];
    }
  };

  const getTerminalPosition = (comp: Component, terminal: 'top' | 'bottom' | 'left' | 'right') => {
    const terminals = getComponentTerminals(comp);
    const found = terminals.find(t => t.id === terminal);
    if (found) {
      return { x: comp.x + found.x, y: comp.y + found.y };
    }
    switch (terminal) {
      case 'top': return { x: comp.x + 30, y: comp.y };
      case 'bottom': return { x: comp.x + 30, y: comp.y + 60 };
      case 'left': return { x: comp.x, y: comp.y + 30 };
      case 'right': return { x: comp.x + 60, y: comp.y + 30 };
    }
  };

  const [wireDragStartTime, setWireDragStartTime] = useState<number>(0);

  // Magnetic proximity finder for terminals
  const findNearestTerminal = useCallback((cursorX: number, cursorY: number, excludeComponentId?: string) => {
    let nearest: {
      component: Component;
      terminal: 'top' | 'bottom' | 'left' | 'right';
      position: { x: number; y: number };
      distance: number;
    } | null = null;
    let minDistance = 50; // 50px generous magnetic snap radius

    components.forEach(comp => {
      if (excludeComponentId && comp.id === excludeComponentId) return;

      (['top', 'bottom', 'left', 'right'] as const).forEach(terminal => {
        const pos = getTerminalPosition(comp, terminal);
        const dist = Math.hypot(cursorX - pos.x, cursorY - pos.y);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = {
            component: comp,
            terminal,
            position: pos,
            distance: dist
          };
        }
      });
    });

    return nearest;
  }, [components]);

  const startWiring = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right') => {
    const comp = components.find(c => c.id === componentId);
    if (!comp) return;

    const pos = getTerminalPosition(comp, terminal);
    setDragWire({
      from: { componentId, terminal, x: pos.x, y: pos.y },
      currentX: pos.x,
      currentY: pos.y,
    });
    setWireDragStartTime(Date.now());
    setWireDrawingMode(true);
    toast.info('Click target pin or component to connect wire', { duration: 1500 });
  };

  const completeWiring = (targetComponentId: string, targetTerminal: 'top' | 'bottom' | 'left' | 'right') => {
    if (!dragWire) return;

    if (dragWire.from.componentId === targetComponentId && dragWire.from.terminal === targetTerminal) {
      if (Date.now() - wireDragStartTime > 400) {
        setDragWire(null);
        setSnappedTerminal(null);
        setWireDrawingMode(false);
        toast.info('Wiring cancelled');
      }
      return;
    }

    if (dragWire.from.componentId === targetComponentId) {
      toast.error('Cannot connect component to itself');
      setDragWire(null);
      setSnappedTerminal(null);
      setWireDrawingMode(false);
      return;
    }

    const duplicate = wires.find(
      w =>
        (w.from.componentId === dragWire.from.componentId &&
          w.from.terminal === dragWire.from.terminal &&
          w.to.componentId === targetComponentId &&
          w.to.terminal === targetTerminal) ||
        (w.to.componentId === dragWire.from.componentId &&
          w.to.terminal === dragWire.from.terminal &&
          w.from.componentId === targetComponentId &&
          w.from.terminal === targetTerminal)
    );

    if (duplicate) {
      toast.error('Connection already exists');
      setDragWire(null);
      setSnappedTerminal(null);
      setWireDrawingMode(false);
      return;
    }

    const comp = components.find(c => c.id === targetComponentId);
    if (!comp) return;

    const toPos = getTerminalPosition(comp, targetTerminal);
    const path = createSmartPath(dragWire.from.x, dragWire.from.y, toPos.x, toPos.y);
    const color = '#0F172A';

    const newWire: Wire = {
      id: `wire-${Date.now()}`,
      from: { componentId: dragWire.from.componentId, terminal: dragWire.from.terminal },
      to: { componentId: targetComponentId, terminal: targetTerminal },
      color,
      path,
    };

    setWires(prev => [...prev, newWire]);
    setDragWire(null);
    setSnappedTerminal(null);
    setWireDrawingMode(false);
    saveToHistory();
    toast.success('Wire connected successfully!');
  };

  const handleTerminalMouseDown = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dragWire) {
      startWiring(componentId, terminal);
    } else if (dragWire.from.componentId !== componentId) {
      completeWiring(componentId, terminal);
    }
  };

  const handleTerminalClick = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dragWire) {
      startWiring(componentId, terminal);
    } else if (dragWire.from.componentId !== componentId) {
      completeWiring(componentId, terminal);
    } else if (Date.now() - wireDragStartTime > 400) {
      setDragWire(null);
      setSnappedTerminal(null);
      setWireDrawingMode(false);
      toast.info('Wiring cancelled');
    }
  };

  const handleTerminalMouseUp = (componentId: string, terminal: 'top' | 'bottom' | 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dragWire) return;
    if (dragWire.from.componentId !== componentId) {
      completeWiring(componentId, terminal);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (dragWire) {
      const nearest = findNearestTerminal(x, y, dragWire.from.componentId);
      if (nearest) {
        setSnappedTerminal({
          componentId: nearest.component.id,
          terminal: nearest.terminal,
          x: nearest.position.x,
          y: nearest.position.y
        });
        setDragWire(prev => prev ? { ...prev, currentX: nearest.position.x, currentY: nearest.position.y } : null);
      } else {
        setSnappedTerminal(null);
        setDragWire(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
      }
    }

    if (draggedComponent && activeTool === 'select' && !dragWire) {
      const comp = components.find(c => c.id === draggedComponent);
      if (comp && !comp.locked) {
        const newX = snapToGridValue(x - dragOffset.x);
        const newY = snapToGridValue(y - dragOffset.y);
        setComponents(prev => prev.map(c => 
          c.id === draggedComponent ? { ...c, x: newX, y: newY } : c
        ));
        setShowSnapIndicators(true);
        setSnapPosition({ x: newX, y: newY });
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (dragWire) {
      if (snappedTerminal) {
        completeWiring(snappedTerminal.componentId, snappedTerminal.terminal);
      } else if (Date.now() - wireDragStartTime > 400) {
        setDragWire(null);
        setSnappedTerminal(null);
        setWireDrawingMode(false);
        toast.info('Wiring cancelled');
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (dragWire && Date.now() - wireDragStartTime > 350) {
      if (snappedTerminal) {
        completeWiring(snappedTerminal.componentId, snappedTerminal.terminal);
      }
    }
    if (draggedComponent) {
      setDraggedComponent(null);
      setShowSnapIndicators(false);
      saveToHistory();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger canvas hotkeys when typing in input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Escape: Cancel wiring or deselect all
      if (e.key === 'Escape') {
        if (dragWire) {
          setDragWire(null);
          setSnappedTerminal(null);
          setWireDrawingMode(false);
          toast.info('Wiring cancelled');
        }
        setSelectedComponent(null);
        setSelectedWires([]);
        setContextMenu(prev => ({ ...prev, visible: false }));
      }

      // Delete / Backspace: Remove selected component or selected wires
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponent) {
          removeComponent(selectedComponent.id);
        } else if (selectedWires.length > 0) {
          removeSelectedWires();
        }
      }

      // R or r: Rotate selected component 90 degrees
      if (e.key === 'r' || e.key === 'R') {
        if (selectedComponent) {
          rotateComponent(selectedComponent.id);
        }
      }

      // D or d (or Ctrl+D): Duplicate selected component
      if ((e.ctrlKey && (e.key === 'd' || e.key === 'D')) || (!e.ctrlKey && (e.key === 'd' || e.key === 'D'))) {
        if (selectedComponent && !e.ctrlKey) {
          duplicateComponent(selectedComponent);
        } else if (selectedComponent && e.ctrlKey) {
          e.preventDefault();
          duplicateComponent(selectedComponent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dragWire, selectedComponent, selectedWires, components, wires]);

  const handleComponentClick = (comp: Component, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(prev => ({ ...prev, visible: false }));
    setSelectedWires([]);
    
    if (dragWire) {
      if (comp.id === dragWire.from.componentId) {
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      const scale = zoom / 100;
      const x = rect ? (e.clientX - rect.left) / scale : comp.x + 30;
      const y = rect ? (e.clientY - rect.top) / scale : comp.y + 30;

      const terminals = getComponentTerminals(comp);
      let bestTerminal = terminals[0]?.id || 'left';
      let bestDist = Infinity;
      terminals.forEach(t => {
        const pos = { x: comp.x + t.x, y: comp.y + t.y };
        const d = Math.hypot(x - pos.x, y - pos.y);
        if (d < bestDist) {
          bestDist = d;
          bestTerminal = t.id;
        }
      });

      completeWiring(comp.id, bestTerminal);
      return;
    }

    if (activeTool === 'wire') {
      const terminals = getComponentTerminals(comp);
      startWiring(comp.id, terminals[terminals.length - 1]?.id || 'right');
      return;
    }

    setSelectedComponent(comp);
  };

  const handleComponentContextMenu = (comp: Component, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedComponent(comp);
    setSelectedWires([]);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'component',
      targetComponentId: comp.id
    });
  };

  const handleWireContextMenu = (wire: Wire, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWires([wire.id]);
    setSelectedComponent(null);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'wire',
      targetWireId: wire.id
    });
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'canvas'
    });
  };

  const handleComponentMouseDown = (e: React.MouseEvent, comp: Component) => {
    if (dragWire) {
      e.stopPropagation();
      return;
    }
    if (activeTool !== 'select' || comp.locked) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setDraggedComponent(comp.id);
    setDragOffset({ x: x - comp.x, y: y - comp.y });
    setSelectedComponent(comp);
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
    saveToHistory();
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
    saveToHistory();
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
    toast.success('Wire layout optimized!');
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

  const resetSimulation = () => {
    setIsRunning(false);
    setLiveEditMode(false);
    setSimulationResult(null);
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
    setCurrentProjectId(null);
    setSaveName('');
    setSaveDescription('');
    saveToHistory();
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
    <div className="min-h-screen gradient-depth">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00E5FF] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9C4AFF] rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-[1920px]">
          <Link href="/">
            <Button variant="outline" className="mb-4 glass-surface border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                    <CircuitBoard className="h-10 w-10 text-[#00E5FF] glow-cyan" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-white glow-text-cyan">Professional Circuit Simulator</h1>
                  {liveEditMode && (
                    <Badge className="bg-[#FF6B00] text-white animate-pulse">Live Edit Mode</Badge>
                  )}
                </div>
                <p className="text-[#B8A7E0]">SPICE-like simulation with DC/AC/Transient analysis • 50+ components • Real-time visualization</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => { setShowSaveDialog(true); }} disabled={components.length === 0} className="bg-green-600 text-white hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />Save
                </Button>
                <Button onClick={() => { setShowLoadDialog(true); loadSavedProjects(); }} className="bg-blue-600 text-white hover:bg-blue-700">
                  <FolderOpen className="h-4 w-4 mr-2" />Load
                </Button>
                <Button onClick={() => setShowTemplates(!showTemplates)} className="gradient-violet text-white hover:shadow-glowViolet">
                  <BookOpen className="h-4 w-4 mr-2" />Templates
                </Button>
                <Button onClick={runValidation} className="gradient-fire text-white hover:shadow-glowOrange">
                  <Bug className="h-4 w-4 mr-2" />Validate
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Save Dialog */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogContent className="glass-surface border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Save Circuit Project</DialogTitle>
                <DialogDescription className="text-[#B8A7E0]">Save your circuit for later</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-white">Project Name *</Label>
                  <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="My Circuit" className="glass-surface border-white/20 text-white mt-2" />
                </div>
                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} placeholder="Describe your circuit..." className="glass-surface border-white/20 text-white mt-2" rows={3} />
                </div>
                <div>
                  <Label className="text-white">Category *</Label>
                  <Select value={saveCategory} onValueChange={setSaveCategory}>
                    <SelectTrigger className="glass-surface border-white/20 text-white mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="analog">Analog</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="arduino">Arduino</SelectItem>
                      <SelectItem value="power">Power</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="glass-surface border-white/20 text-white">Cancel</Button>
                <Button onClick={saveCircuit} disabled={isSaving || !saveName.trim()} className="gradient-aqua text-white">
                  <Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load Dialog */}
          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogContent className="glass-surface border-white/20 text-white max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-white">Load Saved Project</DialogTitle>
                <DialogDescription className="text-[#B8A7E0]">Select a project to load</DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[500px] overflow-y-auto">
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin text-[#00E5FF]"><Activity className="h-8 w-8" /></div>
                  </div>
                ) : savedProjects.length === 0 ? (
                  <div className="text-center py-12 text-[#B8A7E0]">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No saved projects yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedProjects.map(project => (
                      <Card key={project.id} className="glass-surface border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan cursor-pointer transition-all">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-sm">{project.name}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-xs">{project.description || 'No description'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => loadCircuit(project.id)} className="flex-1 gradient-aqua text-white">Load</Button>
                            <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Templates Panel */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <Card className="glass-surface border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Circuit Templates</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)} className="text-white">Close</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="beginner" className="w-full">
                      <TabsList className="glass-surface">
                        <TabsTrigger value="beginner" className="data-[state=active]:bg-[#9C4AFF]">Beginner</TabsTrigger>
                        <TabsTrigger value="analog" className="data-[state=active]:bg-[#9C4AFF]">Analog</TabsTrigger>
                        <TabsTrigger value="digital" className="data-[state=active]:bg-[#9C4AFF]">Digital</TabsTrigger>
                        <TabsTrigger value="arduino" className="data-[state=active]:bg-[#9C4AFF]">Arduino</TabsTrigger>
                        <TabsTrigger value="power" className="data-[state=active]:bg-[#9C4AFF]">Power</TabsTrigger>
                      </TabsList>
                      {['beginner', 'analog', 'digital', 'arduino', 'power'].map(category => (
                        <TabsContent key={category} value={category}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getTemplatesByCategory(category as any).map(template => (
                              <Card key={template.id} className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet cursor-pointer transition-all" onClick={() => loadTemplate(template)}>
                                <CardHeader>
                                  <CardTitle className="text-white text-sm flex items-center justify-between">
                                    {template.name}
                                    <Badge variant="outline" className="text-xs border-[#FF6B00]/50 text-[#FF6B00]">{'⭐'.repeat(template.difficulty)}</Badge>
                                  </CardTitle>
                                  <CardDescription className="text-[#B8A7E0] text-xs">{template.description}</CardDescription>
                                </CardHeader>
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
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
                <Card className="glass-surface border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#FF6B00]" />Validation Results
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowValidation(false)} className="text-white">Close</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {validationErrors.map(error => (
                        <div key={error.id} className={`p-3 rounded-lg border ${error.type === 'error' ? 'bg-red-500/10 border-red-500/30' : error.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-white text-sm">{error.message}</p>
                              <p className="text-[#B8A7E0] text-xs mt-1">{error.description}</p>
                              {error.fix && <p className="text-[#00E5FF] text-xs mt-2">Fix: {error.fix}</p>}
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

          {/* Main Editor Card */}
          <Card className="mb-6 glass-surface border-white/10">
            <CardContent className="pt-6">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 mb-4 items-center p-3 glass-surface rounded-xl border border-white/10">
                <div className="flex gap-1 border border-white/20 rounded-lg p-1">
                  <Button size="sm" variant={activeTool === 'select' ? 'default' : 'ghost'} onClick={() => setActiveTool('select')} className={activeTool === 'select' ? 'gradient-aqua text-white' : 'text-white'}><MousePointer className="h-4 w-4" /></Button>
                  <Button size="sm" variant={activeTool === 'wire' ? 'default' : 'ghost'} onClick={() => setActiveTool('wire')} className={activeTool === 'wire' ? 'gradient-aqua text-white' : 'text-white'}><Cable className="h-4 w-4" /></Button>
                  <Button size="sm" variant={activeTool === 'move' ? 'default' : 'ghost'} onClick={() => setActiveTool('move')} className={activeTool === 'move' ? 'gradient-aqua text-white' : 'text-white'}><Move className="h-4 w-4" /></Button>
                </div>

                <div className="h-6 w-px bg-white/20" />

                <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} className="glass-surface border-white/20 text-white hover:bg-white/10"><Undo2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="glass-surface border-white/20 text-white hover:bg-white/10"><Redo2 className="h-4 w-4" /></Button>

                <div className="h-6 w-px bg-white/20" />

                <div className="flex gap-1 items-center">
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(50, zoom - 10))} className="glass-surface border-white/20 text-white hover:bg-white/10"><ZoomOut className="h-4 w-4" /></Button>
                  <span className="text-white text-sm min-w-[50px] text-center">{zoom}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 10))} className="glass-surface border-white/20 text-white hover:bg-white/10"><ZoomIn className="h-4 w-4" /></Button>
                </div>

                <Button size="sm" variant="outline" onClick={() => setShowGrid(!showGrid)} className={`${showGrid ? 'bg-[#00E5FF]/20 border-[#00E5FF]/50' : 'glass-surface'} border-white/20 text-white hover:bg-white/10`}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSnapToGrid(!snapToGrid)} className={`${snapToGrid ? 'bg-[#9C4AFF]/20 border-[#9C4AFF]/50' : 'glass-surface'} border-white/20 text-white hover:bg-white/10`}>
                  <Magnet className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAllTerminals(!showAllTerminals)} className={`${showAllTerminals ? 'bg-[#FF6B00]/20 border-[#FF6B00]/50' : 'glass-surface'} border-white/20 text-white hover:bg-white/10`}>
                  <Link2 className="h-4 w-4" />
                </Button>

                <div className="h-6 w-px bg-white/20" />

                <Select value={simulationSettings.mode} onValueChange={(v: any) => setSimulationSettings(prev => ({ ...prev, mode: v }))}>
                  <SelectTrigger className="w-36 glass-surface text-white border-white/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dc">DC Analysis</SelectItem>
                    <SelectItem value="ac">AC Frequency</SelectItem>
                    <SelectItem value="transient">Transient</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={runEnhancedSimulation} disabled={components.length === 0} className="gradient-aqua text-white hover:shadow-glowCyan"><Play className="h-4 w-4 mr-2" />Run</Button>
                <Button variant="outline" onClick={resetSimulation} className="glass-surface border-white/20 text-white hover:bg-white/10"><RotateCcw className="h-4 w-4" /></Button>

                <div className="h-6 w-px bg-white/20" />

                <Button variant="outline" onClick={handleExportNetlist} disabled={components.length === 0} className="glass-surface border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70" title="Export .cir SPICE Netlist for LTspice/ngspice"><Download className="h-4 w-4 mr-1" />.cir</Button>
                <Button variant="outline" onClick={handlePreviewNetlist} disabled={components.length === 0} className="glass-surface border-white/20 text-white hover:bg-white/10" title="View SPICE Netlist"><FileCode className="h-4 w-4 mr-1" />SPICE</Button>

                <div className="h-6 w-px bg-white/20" />

                <Button variant="outline" onClick={autoLabel} disabled={wires.length === 0} className="glass-surface border-white/20 text-white hover:bg-white/10"><Sparkles className="h-4 w-4 mr-1" />Label</Button>
                <Button variant="outline" onClick={autoCleanupWires} disabled={wires.length === 0} className="glass-surface border-white/20 text-white hover:bg-white/10"><Cable className="h-4 w-4 mr-1" />Clean</Button>
                
                <div className="h-6 w-px bg-white/20" />
                
                <Button variant="outline" onClick={exportAsJSON} className="glass-surface border-white/20 text-white hover:bg-white/10"><FileJson className="h-4 w-4 mr-1" />JSON</Button>
                <Button variant="outline" onClick={exportAsSVG} className="glass-surface border-white/20 text-white hover:bg-white/10"><ImageIcon className="h-4 w-4 mr-1" />SVG</Button>
                <Button variant="outline" onClick={clearCanvas} className="glass-surface border-white/20 text-white hover:bg-white/10"><Trash2 className="h-4 w-4" /></Button>
              </div>

              <div className="grid lg:grid-cols-4 gap-4">
                {/* Component Library */}
                <Card className="glass-surface border-white/10 lg:col-span-1">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 text-[#00E5FF] flex items-center gap-2"><Zap className="h-4 w-4" />Components</h3>
                    
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A7E0]" />
                        <Input value={componentSearch} onChange={(e) => setComponentSearch(e.target.value)} placeholder="Search..." className="pl-10 glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]" />
                      </div>
                    </div>
                    
                    {!componentSearch && (
                      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
                        <TabsList className="glass-surface w-full flex-wrap h-auto gap-1 p-1">
                          {Object.entries(COMPONENT_CATEGORIES).map(([key, cat]) => (
                            <TabsTrigger key={key} value={key} className="text-xs px-2 py-1 data-[state=active]:bg-[#9C4AFF] data-[state=active]:text-white">{cat.icon}</TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    )}
                    
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2 text-sm pr-2">
                        {filteredComponents.map((comp) => (
                          <div 
                            key={comp.type} 
                            draggable 
                            onClick={() => addComponentDirectly(comp.type)}
                            onDragStart={() => handleDragStart(comp.type)} 
                            className="p-2.5 border border-white/10 rounded-lg hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 cursor-pointer transition-all group glass-surface"
                            title="Click or drag to add to canvas"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-white/10 text-xl">
                                <span>{comp.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{comp.label}</p>
                                <p className="text-[#B8A7E0] text-[10px] truncate">{comp.description}</p>
                              </div>
                              <span className="text-[10px] text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity font-bold">+ Add</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Canvas */}
                <Card className="lg:col-span-3 bg-white border-white/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">{saveName || 'Circuit Canvas'}</h3>
                      <div className="text-xs text-gray-600 flex gap-4">
                        <span className="flex items-center gap-1"><CircuitBoard className="h-3 w-3" />{components.length} components</span>
                        <span className="flex items-center gap-1 text-[#9C4AFF] font-semibold"><Cable className="h-3 w-3" />{wires.length} wires</span>
                        {wireDrawingMode && <span className="text-[#FF6B00] font-bold animate-pulse">Drawing wire...</span>}
                        {snapToGrid && <span className="text-[#00E5FF] flex items-center gap-1"><Magnet className="h-3 w-3" />Snap ON</span>}
                      </div>
                    </div>
                    <div
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      className={`bg-white rounded-lg border-2 ${wireDrawingMode ? 'border-[#00FF88] shadow-lg shadow-[#00FF88]/20 border-solid' : 'border-dashed border-gray-300'} min-h-[500px] relative overflow-hidden transition-all`}
                      style={{
                        backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                        backgroundSize: `${GRID_SIZE * (zoom / 100)}px ${GRID_SIZE * (zoom / 100)}px`,
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        width: `${100 / (zoom / 100)}%`,
                        height: `${500 / (zoom / 100)}px`
                      }}
                    >
                      {/* Snap indicators */}
                      {showSnapIndicators && snapPosition && (
                        <div className="absolute pointer-events-none" style={{ left: snapPosition.x - 10, top: snapPosition.y - 10, zIndex: 100 }}>
                          <div className="w-5 h-5 border-2 border-[#00E5FF] rounded-full animate-ping" />
                          <Crosshair className="absolute top-0 left-0 w-5 h-5 text-[#00E5FF]" />
                        </div>
                      )}
                      
                      {/* Drag preview */}
                      {isDraggingFromLibrary && dragPreviewPosition && draggedType && (
                        <div 
                          className="absolute pointer-events-none opacity-50 border-2 border-dashed border-[#00E5FF] rounded-lg p-2"
                          style={{ left: dragPreviewPosition.x, top: dragPreviewPosition.y, zIndex: 50 }}
                        >
                          <ComponentSymbol type={draggedType} />
                        </div>
                      )}

                      {/* Wires SVG Layer (Proteus / MATLAB CAD Style) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10, width: '100%', height: '100%' }}>
                        {wires.map((wire) => {
                          const pathD = wire.path && wire.path.length > 0 
                            ? wire.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                            : '';
                          const isSelected = selectedWires.includes(wire.id);
                          if (!pathD) return null;

                          return (
                            <g
                              key={wire.id}
                              className="pointer-events-auto cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setContextMenu(prev => ({ ...prev, visible: false }));
                                setSelectedComponent(null);
                                setSelectedWires(prev => prev.includes(wire.id) ? prev.filter(id => id !== wire.id) : [...prev, wire.id]);
                              }}
                              onContextMenu={(e) => handleWireContextMenu(wire, e)}
                            >
                              {/* Wide hit-stroke for easy clicking */}
                              <path d={pathD} fill="none" stroke="transparent" strokeWidth="18" />
                              
                              {/* Selection Glowing Halo */}
                              {isSelected && (
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="7"
                                  strokeOpacity="0.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}

                              {/* Main crisp schematic wire */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke={isSelected ? '#2563EB' : '#1E293B'}
                                strokeWidth={isSelected ? "4" : "3"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {/* Schematic junction dots */}
                              <circle cx={wire.path[0].x} cy={wire.path[0].y} r="3.5" fill={isSelected ? '#2563EB' : '#1E293B'} />
                              <circle cx={wire.path[wire.path.length - 1].x} cy={wire.path[wire.path.length - 1].y} r="3.5" fill={isSelected ? '#2563EB' : '#1E293B'} />
                              
                              {wire.netLabel && (
                                <text
                                  x={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2}
                                  y={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 - 8}
                                  fontSize="11"
                                  fill="#1E40AF"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  className="pointer-events-none font-mono select-none"
                                >
                                  {wire.netLabel}
                                </text>
                              )}

                              {/* Interactive Delete Badge on Selected Wire */}
                              {isSelected && (
                                <g
                                  className="cursor-pointer hover:scale-125 transition-transform"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeWire(wire.id);
                                  }}
                                >
                                  <circle
                                    cx={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2}
                                    cy={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2}
                                    r="9"
                                    fill="#EF4444"
                                    stroke="#FFFFFF"
                                    strokeWidth="1.5"
                                  />
                                  <line
                                    x1={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2 - 3.5}
                                    y1={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 - 3.5}
                                    x2={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2 + 3.5}
                                    y2={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 + 3.5}
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                  />
                                  <line
                                    x1={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2 + 3.5}
                                    y1={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 - 3.5}
                                    x2={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2 - 3.5}
                                    y2={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 + 3.5}
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                  />
                                </g>
                              )}
                            </g>
                          );
                        })}
                        {dragWire && (
                          <g>
                            {/* Proteus drawing wire: clean red dashed guide */}
                            <line
                              x1={dragWire.from.x}
                              y1={dragWire.from.y}
                              x2={dragWire.currentX}
                              y2={dragWire.currentY}
                              stroke="#DC2626"
                              strokeWidth="2.5"
                              strokeDasharray="5,4"
                              strokeLinecap="round"
                            />
                            {/* Origin pin marker */}
                            <rect x={dragWire.from.x - 3.5} y={dragWire.from.y - 3.5} width="7" height="7" fill="#DC2626" stroke="#000" strokeWidth="1" />
                            {/* Target pin pen cursor */}
                            <circle cx={dragWire.currentX} cy={dragWire.currentY} r="4" fill="#DC2626" />
                            <line x1={dragWire.currentX - 7} y1={dragWire.currentY} x2={dragWire.currentX + 7} y2={dragWire.currentY} stroke="#DC2626" strokeWidth="2" />
                            <line x1={dragWire.currentX} y1={dragWire.currentY - 7} x2={dragWire.currentX} y2={dragWire.currentY + 7} stroke="#DC2626" strokeWidth="2" />
                          </g>
                        )}
                      </svg>

                      {/* Floating Wiring Status Banner */}
                      {dragWire && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-full shadow-2xl border border-red-500/60 flex items-center gap-3 text-xs backdrop-blur-md pointer-events-auto">
                          <span className="flex items-center gap-2 font-semibold text-red-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                            Connecting wire... Click any pin or component to connect
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDragWire(null);
                              setSnappedTerminal(null);
                              setWireDrawingMode(false);
                              toast.info('Wiring cancelled');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors"
                          >
                            Cancel (Esc)
                          </button>
                        </div>
                      )}

                      {components.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-6" style={{ zIndex: 0 }}>
                          <div className="text-center max-w-md">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                              <CircuitBoard className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-800">Empty Circuit Canvas</h3>
                            <p className="text-xs text-gray-500 mt-1 mb-4">Click components on the left to add them, or start with a pre-built circuit below:</p>
                            
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              <button
                                onClick={() => {
                                  const t = CIRCUIT_TEMPLATES.find(x => x.id === 'simple_led');
                                  if (t) loadTemplate(t);
                                }}
                                className="p-2.5 bg-white border border-gray-200 hover:border-blue-500 hover:shadow-sm rounded-lg text-left transition-all group"
                              >
                                <span className="text-base block mb-1">💡</span>
                                <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 truncate">LED Circuit</p>
                                <p className="text-[10px] text-gray-400">9V + LED</p>
                              </button>

                              <button
                                onClick={() => {
                                  const t = CIRCUIT_TEMPLATES.find(x => x.id === 'voltage_divider');
                                  if (t) loadTemplate(t);
                                }}
                                className="p-2.5 bg-white border border-gray-200 hover:border-blue-500 hover:shadow-sm rounded-lg text-left transition-all group"
                              >
                                <span className="text-base block mb-1">⚡</span>
                                <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 truncate">Divider</p>
                                <p className="text-[10px] text-gray-400">12V Divider</p>
                              </button>

                              <button
                                onClick={() => {
                                  const t = CIRCUIT_TEMPLATES.find(x => x.id === 'rc_lowpass');
                                  if (t) loadTemplate(t);
                                }}
                                className="p-2.5 bg-white border border-gray-200 hover:border-blue-500 hover:shadow-sm rounded-lg text-left transition-all group"
                              >
                                <span className="text-base block mb-1">⏱️</span>
                                <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 truncate">RC Timing</p>
                                <p className="text-[10px] text-gray-400">Low-Pass</p>
                              </button>

                              <button
                                onClick={() => {
                                  const t = CIRCUIT_TEMPLATES.find(x => x.id === 'rlc_resonance');
                                  if (t) loadTemplate(t);
                                }}
                                className="p-2.5 bg-white border border-gray-200 hover:border-blue-500 hover:shadow-sm rounded-lg text-left transition-all group"
                              >
                                <span className="text-base block mb-1">🌊</span>
                                <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 truncate">RLC Tank</p>
                                <p className="text-[10px] text-gray-400">5.03kHz Res</p>
                              </button>
                            </div>

                            <Button onClick={() => setShowTemplates(true)} variant="outline" size="sm" className="text-xs text-gray-700 border-gray-300">
                              <BookOpen className="h-3.5 w-3.5 mr-1.5" />Browse All Templates
                            </Button>
                          </div>
                        </div>
                      ) : (
                        components.map((comp) => {
                          const isHovered = hoveredComponent === comp.id;
                          const isSelected = selectedComponent?.id === comp.id;
                          const compTerminals = getComponentTerminals(comp);
                          
                          return (
                            <motion.div
                              key={comp.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`absolute cursor-pointer select-none transition-shadow ${
                                isSelected
                                  ? 'ring-2 ring-[#2563EB] shadow-md'
                                  : isHovered
                                  ? 'ring-1 ring-gray-400'
                                  : ''
                              } ${comp.locked ? 'opacity-80' : ''}`}
                              style={{ left: comp.x, top: comp.y, zIndex: isSelected ? 30 : 2 }}
                              onClick={(e) => handleComponentClick(comp, e)}
                              onContextMenu={(e) => handleComponentContextMenu(comp, e)}
                              onMouseDown={(e) => handleComponentMouseDown(e, comp)}
                              onMouseEnter={() => setHoveredComponent(comp.id)}
                              onMouseLeave={() => setHoveredComponent(null)}
                            >
                              {comp.locked && <Lock className="absolute -top-2 -right-2 h-4 w-4 text-red-500 bg-white rounded-full p-0.5" />}
                              
                              {/* Proteus / Simulink Style Floating Quick-Action Pill */}
                              {isSelected && (
                                <div
                                  className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 text-white px-2 py-1 rounded-lg shadow-xl border border-cyan-500/50 backdrop-blur-md z-50 pointer-events-auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => rotateComponent(comp.id)}
                                    className="p-1 hover:bg-slate-700 rounded text-cyan-400 hover:text-white transition-colors"
                                    title="Rotate 90° (R)"
                                  >
                                    <RotateCw className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => duplicateComponent(comp)}
                                    className="p-1 hover:bg-slate-700 rounded text-indigo-400 hover:text-white transition-colors"
                                    title="Duplicate (D)"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleLockComponent(comp.id)}
                                    className="p-1 hover:bg-slate-700 rounded text-amber-400 hover:text-white transition-colors"
                                    title={comp.locked ? 'Unlock' : 'Lock'}
                                  >
                                    {comp.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => removeComponent(comp.id)}
                                    className="p-1 hover:bg-red-600 rounded text-red-400 hover:text-white transition-colors"
                                    title="Delete (Del)"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                              
                              {/* Proteus / MATLAB Clean Pin Terminals (No Neon Dots) */}
                              {compTerminals.map((term) => {
                                const isTerminalHovered = hoveredTerminal?.componentId === comp.id && hoveredTerminal?.terminal === term.id;
                                const isSnapped = snappedTerminal?.componentId === comp.id && snappedTerminal?.terminal === term.id;
                                const isSource = dragWire?.from.componentId === comp.id && dragWire?.from.terminal === term.id;
                                const isWiring = dragWire !== null;

                                return (
                                  <div
                                    key={term.id}
                                    className="absolute flex items-center justify-center cursor-crosshair z-30"
                                    style={{
                                      left: term.x - 9,
                                      top: term.y - 9,
                                      width: 18,
                                      height: 18
                                    }}
                                    onMouseDown={(e) => handleTerminalMouseDown(comp.id, term.id, e)}
                                    onMouseUp={(e) => handleTerminalMouseUp(comp.id, term.id, e)}
                                    onClick={(e) => handleTerminalClick(comp.id, term.id, e)}
                                    onMouseEnter={() => setHoveredTerminal({ componentId: comp.id, terminal: term.id })}
                                    onMouseLeave={() => setHoveredTerminal(null)}
                                    title={`Pin ${term.label || term.id}`}
                                  >
                                    {/* Proteus style pin node: clean red square on hover/wire, crisp square otherwise */}
                                    <div
                                      className={`transition-all ${
                                        isSource
                                          ? 'w-3.5 h-3.5 bg-red-600 border border-black shadow'
                                          : isSnapped || isTerminalHovered
                                          ? 'w-4 h-4 bg-red-500 border border-black scale-125'
                                          : isWiring
                                          ? 'w-3 h-3 bg-red-400 border border-red-700'
                                          : 'w-2 h-2 bg-gray-700 border border-black'
                                      }`}
                                      style={{ borderRadius: 1 }}
                                    />
                                  </div>
                                );
                              })}

                              <div className="bg-white/95 rounded border border-gray-300 p-1 flex flex-col items-center min-w-[60px] shadow-sm">
                                <ComponentSymbol type={comp.type} rotation={comp.rotation} isActive={isRunning} />
                                <span className="text-[10px] font-mono font-medium text-gray-700 mt-0.5 whitespace-nowrap">
                                  {comp.value} {comp.unit}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {/* Enhanced Component Properties Inspector */}
                    {selectedComponent && (
                      <EnhancedComponentProperties
                        component={selectedComponent}
                        wires={wires}
                        simulationResult={simulationResult}
                        measurementBus={measurementBus}
                        liveEditMode={liveEditMode || isRunning}
                        onUpdateValue={(id, val) => updateComponentValue(id, val)}
                        onUpdateParams={(id, params) => {
                          setComponents(prev => prev.map(c => c.id === id ? { ...c, params } : c));
                          setSelectedComponent(prev => prev && prev.id === id ? { ...prev, params } : prev);
                          updateComponentValue(id, selectedComponent.value);
                        }}
                        onRotate={(id) => rotateComponent(id)}
                        onDuplicate={(comp) => duplicateComponent(comp)}
                        onToggleLock={(id) => toggleLockComponent(id)}
                        onRemove={(id) => removeComponent(id)}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Signal Generator Toggle Toolbar Item */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSignalGen(!showSignalGen)}
                className={`text-xs font-bold ${
                  showSignalGen ? 'bg-indigo-600 text-white' : 'glass-surface border-white/20 text-white'
                }`}
              >
                <Radio className="h-4 w-4 mr-1.5" /> {showSignalGen ? 'Hide Signal Generator' : 'Show Signal Generator'}
              </Button>
            </div>
          </div>

          {/* Arbitrary Signal Generator Panel */}
          {showSignalGen && (
            <div className="mb-6">
              <SignalGeneratorPanel
                config={signalGenConfig}
                isRunning={isRunning}
                onChange={(newCfg) => {
                  setSignalGenConfig(newCfg);
                  setComponents(prev => prev.map(c => {
                    if (c.type === 'voltage_ac' || c.type === 'signal_generator') {
                      const wfTypeMap = { SINE: 0, SQUARE: 1, TRIANGLE: 2, SAWTOOTH: 2, DC: 3 };
                      return {
                        ...c,
                        value: newCfg.amplitude,
                        params: {
                          ...c.params,
                          frequency: newCfg.frequency,
                          offset: newCfg.offset,
                          dutyCycle: newCfg.dutyCycle,
                          waveformType: wfTypeMap[newCfg.waveform] ?? 0
                        }
                      };
                    }
                    return c;
                  }));
                }}
              />
            </div>
          )}

          {/* Real Virtual Laboratory: 4-Channel Oscilloscope & Digital Multimeter */}
          <div className="grid lg:grid-cols-12 gap-4 mb-8">
            {/* Real 4-Channel Working Oscilloscope */}
            <div className="lg:col-span-7">
              <InteractiveOscilloscope
                measurementBus={measurementBus}
                simulationResult={simulationResult}
                isRunning={isRunning}
                onRerunSimulation={runEnhancedSimulation}
              />
            </div>

            {/* Real Working Digital Multimeter */}
            <div className="lg:col-span-5">
              <InteractiveMultimeter
                measurementBus={measurementBus}
                simulationResult={simulationResult}
                isRunning={isRunning}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SPICE Netlist Preview Dialog */}
      <Dialog open={spiceModalOpen} onOpenChange={setSpiceModalOpen}>
        <DialogContent className="glass-surface border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-[#00E5FF]">
              <FileCode className="h-5 w-5" /> SPICE Netlist (.cir)
            </DialogTitle>
            <DialogDescription className="text-[#B8A7E0]">
              Standard SPICE netlist generated from your canvas. Compatible with spice-ts, LTspice, ngspice, and KiCad.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <ScrollArea className="h-64 rounded-lg bg-black/60 border border-white/10 p-4 font-mono text-xs text-emerald-400">
              <pre className="whitespace-pre">{currentNetlist || generateSpiceNetlist(components as any, wires as any, simulationSettings)}</pre>
            </ScrollArea>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const netlist = currentNetlist || generateSpiceNetlist(components as any, wires as any, simulationSettings);
                navigator.clipboard.writeText(netlist);
                toast.success('Netlist copied to clipboard');
              }}
              className="glass-surface border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-2" /> Copy Netlist
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSpiceModalOpen(false)}
                className="glass-surface border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleExportNetlist();
                  setSpiceModalOpen(false);
                }}
                className="gradient-aqua text-white"
              >
                <Download className="h-4 w-4 mr-2" /> Download .cir
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proteus / MATLAB Simulink Right-Click Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-slate-900/95 border border-slate-700 text-white rounded-xl shadow-2xl py-1.5 min-w-[200px] backdrop-blur-md text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
          style={{ left: Math.min(contextMenu.x, typeof window !== 'undefined' ? window.innerWidth - 220 : contextMenu.x), top: Math.min(contextMenu.y, typeof window !== 'undefined' ? window.innerHeight - 250 : contextMenu.y) }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'component' && contextMenu.targetComponentId && (
            <>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-400 font-bold border-b border-slate-800 flex items-center justify-between">
                <span>Component Options</span>
                <Badge className="text-[9px] bg-slate-800 text-slate-300">Proteus EDA</Badge>
              </div>
              <button
                onClick={() => {
                  rotateComponent(contextMenu.targetComponentId!);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2"><RotateCw className="h-3.5 w-3.5 text-cyan-400" /> Rotate 90°</span>
                <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">R</kbd>
              </button>
              <button
                onClick={() => {
                  const comp = components.find(c => c.id === contextMenu.targetComponentId);
                  if (comp) duplicateComponent(comp);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2"><Copy className="h-3.5 w-3.5 text-indigo-400" /> Duplicate (Clone)</span>
                <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">D</kbd>
              </button>
              <button
                onClick={() => {
                  toggleLockComponent(contextMenu.targetComponentId!);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <Lock className="h-3.5 w-3.5 text-amber-400" /> Lock / Unlock Position
              </button>
              <div className="my-1 border-t border-slate-800" />
              <button
                onClick={() => {
                  removeComponent(contextMenu.targetComponentId!);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 flex items-center justify-between text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
              >
                <span className="flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete Component</span>
                <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">Del</kbd>
              </button>
            </>
          )}

          {contextMenu.type === 'wire' && contextMenu.targetWireId && (
            <>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-400 font-bold border-b border-slate-800 flex items-center justify-between">
                <span>Wire Options</span>
                <Badge className="text-[9px] bg-slate-800 text-slate-300">Simulink</Badge>
              </div>
              <button
                onClick={() => {
                  removeWire(contextMenu.targetWireId!);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 flex items-center justify-between text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
              >
                <span className="flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete Wire</span>
                <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">Del</kbd>
              </button>
            </>
          )}

          {contextMenu.type === 'canvas' && (
            <>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                Canvas Options
              </div>
              <button
                onClick={() => {
                  runSimulation();
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-emerald-400 transition-colors"
              >
                <span className="flex items-center gap-2"><Play className="h-3.5 w-3.5" /> Run SPICE Simulation</span>
              </button>
              <button
                onClick={() => {
                  setWires([]);
                  setComponents([]);
                  setSelectedComponent(null);
                  setSelectedWires([]);
                  setSimulationResult(null);
                  setMeasurementBus(new MeasurementBus());
                  setContextMenu(prev => ({ ...prev, visible: false }));
                  toast.info('Canvas cleared');
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All Canvas
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}