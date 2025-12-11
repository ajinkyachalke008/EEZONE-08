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
  RotateCw, FlipHorizontal, FlipVertical, Maximize2, Move, MousePointer
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    mode: 'dc',
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
  
  const [wires, setWires] = useState<Wire[]>([]);
  const [dragWire, setDragWire] = useState<DragWire | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [hoveredTerminal, setHoveredTerminal] = useState<{ componentId: string; terminal: string } | null>(null);
  const [selectedWires, setSelectedWires] = useState<string[]>([]);
  const [wireDrawingMode, setWireDrawingMode] = useState(false);
  const [showAllTerminals, setShowAllTerminals] = useState(true);
  
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
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const runEnhancedSimulation = useCallback(() => {
    if (components.length === 0) {
      toast.error('Add components to the circuit first');
      return;
    }
    
    if (wires.length === 0) {
      toast.warning('Add wires to connect components');
      return;
    }
    
    setIsRunning(true);
    setLiveEditMode(true);
    
    const { components: simComponents, nodes } = convertToSimulationComponents();
    
    if (simComponents.length === 0) {
      toast.error('No valid components to simulate');
      setIsRunning(false);
      return;
    }
    
    try {
      const result = runSimulation(simComponents, nodes, simulationSettings);
      setSimulationResult(result);
      
      if (result.success) {
        toast.success(`${simulationSettings.mode.toUpperCase()} simulation completed!`);
        
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

  const updateComponentValueLive = useCallback((id: string, value: number) => {
    if (!liveEditMode || !simulationResult) {
      setComponents(prev => prev.map(c => 
        c.id === id ? { ...c, value } : c
      ));
      return;
    }
    
    const updatedComponents = components.map(c => 
      c.id === id ? { ...c, value } : c
    );
    setComponents(updatedComponents);
    
    const { components: simComponents, nodes } = convertToSimulationComponents();
    const updatedSimComponents = simComponents.map(sc =>
      sc.id === id ? { ...sc, value } : sc
    );
    
    const newResult = updateSimulation(simulationResult, updatedSimComponents, nodes, simulationSettings);
    setSimulationResult(newResult);
    
    if (newResult.success) {
      toast.success('Live update applied', { duration: 1000 });
    }
  }, [liveEditMode, simulationResult, components, simulationSettings, convertToSimulationComponents]);

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
    setSaveName(template.name);
    setCurrentProjectId(null);
    saveToHistory();
    toast.success(`Loaded template: ${template.name}`);
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
    saveToHistory();
    toast.success(`${componentInfo?.label} added to canvas`);
  }, [draggedType, zoom, snapToGrid]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeComponent = (id: string) => {
    const removedWireCount = wires.filter(w => w.from.componentId === id || w.to.componentId === id).length;
    setWires(prev => prev.filter(w => w.from.componentId !== id && w.to.componentId !== id));
    setComponents(prev => prev.filter(c => c.id !== id));
    setSelectedComponent(null);
    saveToHistory();
    toast.info(`Component removed${removedWireCount > 0 ? ` (${removedWireCount} wire${removedWireCount !== 1 ? 's' : ''} disconnected)` : ''}`);
  };

  const duplicateComponent = (component: Component) => {
    const newComponent: Component = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      x: component.x + 80,
      y: component.y + 80,
      locked: false
    };
    setComponents(prev => [...prev, newComponent]);
    saveToHistory();
    toast.success('Component duplicated');
  };

  const rotateComponent = (id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
    ));
    saveToHistory();
  };

  const toggleLockComponent = (id: string) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, locked: !c.locked } : c
    ));
  };

  const updateComponentValue = (id: string, value: number) => {
    updateComponentValueLive(id, value);
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
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (dragWire) {
      setDragWire(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }

    if (draggedComponent && activeTool === 'select') {
      const comp = components.find(c => c.id === draggedComponent);
      if (comp && !comp.locked) {
        const newX = snapToGridValue(x - dragOffset.x);
        const newY = snapToGridValue(y - dragOffset.y);
        setComponents(prev => prev.map(c => 
          c.id === draggedComponent ? { ...c, x: newX, y: newY } : c
        ));
      }
    }
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
    saveToHistory();
    toast.success('Wire connected successfully!');
  };

  const handleCanvasMouseUp = () => {
    if (dragWire) {
      setDragWire(null);
      setWireDrawingMode(false);
      toast.info('Wire connection cancelled');
    }
    if (draggedComponent) {
      setDraggedComponent(null);
      saveToHistory();
    }
  };

  const handleComponentMouseDown = (e: React.MouseEvent, comp: Component) => {
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
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#00C2D1] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-[1920px]">
          <Link href="/">
            <Button variant="outline" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
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
                    <CircuitBoard className="h-10 w-10 text-[#00C2D1]" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-white">Professional Circuit Simulator</h1>
                  {liveEditMode && (
                    <Badge className="bg-[#FF6B00] text-white animate-pulse">Live Edit Mode</Badge>
                  )}
                </div>
                <p className="text-gray-300">SPICE-like simulation with DC/AC/Transient analysis</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => { setShowSaveDialog(true); }} disabled={components.length === 0} className="bg-green-600 text-white hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />Save
                </Button>
                <Button onClick={() => { setShowLoadDialog(true); loadSavedProjects(); }} className="bg-blue-600 text-white hover:bg-blue-700">
                  <FolderOpen className="h-4 w-4 mr-2" />Load
                </Button>
                <Button onClick={() => setShowTemplates(!showTemplates)} className="bg-[#9C4AFF] text-white hover:bg-[#9C4AFF]/90">
                  <BookOpen className="h-4 w-4 mr-2" />Templates
                </Button>
                <Button onClick={runValidation} className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90">
                  <Bug className="h-4 w-4 mr-2" />Validate
                </Button>
              </div>
            </div>
          </motion.div>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogContent className="bg-[#071428] border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Save Circuit Project</DialogTitle>
                <DialogDescription className="text-gray-300">Save your circuit for later</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-white">Project Name *</Label>
                  <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="My Circuit" className="bg-white/10 border-white/20 text-white mt-2" />
                </div>
                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} placeholder="Describe your circuit..." className="bg-white/10 border-white/20 text-white mt-2" rows={3} />
                </div>
                <div>
                  <Label className="text-white">Category *</Label>
                  <Select value={saveCategory} onValueChange={setSaveCategory}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2"><SelectValue /></SelectTrigger>
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
                <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="bg-white/10 border-white/20 text-white">Cancel</Button>
                <Button onClick={saveCircuit} disabled={isSaving || !saveName.trim()} className="bg-[#00C2D1] text-[#071428]">
                  <Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogContent className="bg-[#071428] border-white/20 text-white max-w-3xl">
              <DialogHeader>
                <DialogTitle>Load Saved Project</DialogTitle>
                <DialogDescription className="text-gray-300">Select a project to load</DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[500px] overflow-y-auto">
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin text-[#00C2D1]"><Activity className="h-8 w-8" /></div>
                  </div>
                ) : savedProjects.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No saved projects yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedProjects.map(project => (
                      <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-sm">{project.name}</CardTitle>
                          <CardDescription className="text-gray-400 text-xs">{project.description || 'No description'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => loadCircuit(project.id)} className="flex-1 bg-[#00C2D1] text-[#071428]">Load</Button>
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

          <AnimatePresence>
            {showTemplates && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Circuit Templates</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)} className="text-white">Close</Button>
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
                              <Card key={template.id} className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => loadTemplate(template)}>
                                <CardHeader>
                                  <CardTitle className="text-white text-sm flex items-center justify-between">
                                    {template.name}
                                    <Badge variant="outline" className="text-xs">{'⭐'.repeat(template.difficulty)}</Badge>
                                  </CardTitle>
                                  <CardDescription className="text-gray-300 text-xs">{template.description}</CardDescription>
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

          <AnimatePresence>
            {showValidation && validationErrors.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
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
                              <p className="text-gray-300 text-xs mt-1">{error.description}</p>
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

          <Card className="mb-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <div className="flex gap-1 border border-white/20 rounded-lg p-1">
                  <Button size="sm" variant={activeTool === 'select' ? 'default' : 'ghost'} onClick={() => setActiveTool('select')} className={activeTool === 'select' ? 'bg-[#00C2D1] text-[#071428]' : 'text-white'}><MousePointer className="h-4 w-4" /></Button>
                  <Button size="sm" variant={activeTool === 'wire' ? 'default' : 'ghost'} onClick={() => setActiveTool('wire')} className={activeTool === 'wire' ? 'bg-[#00C2D1] text-[#071428]' : 'text-white'}><Cable className="h-4 w-4" /></Button>
                  <Button size="sm" variant={activeTool === 'move' ? 'default' : 'ghost'} onClick={() => setActiveTool('move')} className={activeTool === 'move' ? 'bg-[#00C2D1] text-[#071428]' : 'text-white'}><Move className="h-4 w-4" /></Button>
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

                <Button size="sm" variant="outline" onClick={() => setShowGrid(!showGrid)} className={`${showGrid ? 'bg-[#00C2D1]/20' : 'bg-white/10'} border-white/20 text-white hover:bg-white/20`}><Grid3X3 className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setShowAllTerminals(!showAllTerminals)} className={`${showAllTerminals ? 'bg-[#9C4AFF]/20' : 'bg-white/10'} border-white/20 text-white hover:bg-white/20`}><Link2 className="h-4 w-4" /></Button>

                <div className="h-6 w-px bg-white/20" />

                <Select value={simulationSettings.mode} onValueChange={(v: any) => setSimulationSettings(prev => ({ ...prev, mode: v }))}>
                  <SelectTrigger className="w-36 bg-white/10 text-white border-white/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dc">DC Analysis</SelectItem>
                    <SelectItem value="ac">AC Frequency</SelectItem>
                    <SelectItem value="transient">Transient</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={runEnhancedSimulation} disabled={components.length === 0} className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"><Play className="h-4 w-4 mr-2" />Run</Button>
                <Button variant="outline" onClick={resetSimulation} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><RotateCcw className="h-4 w-4" /></Button>

                <div className="h-6 w-px bg-white/20" />

                <Button variant="outline" onClick={autoLabel} disabled={wires.length === 0} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Sparkles className="h-4 w-4 mr-1" />Label</Button>
                <Button variant="outline" onClick={autoCleanupWires} disabled={wires.length === 0} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Cable className="h-4 w-4 mr-1" />Clean</Button>
                <Button variant="outline" onClick={exportAsJSON} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Download className="h-4 w-4 mr-1" />Export</Button>
                <Button variant="outline" onClick={clearCanvas} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><Trash2 className="h-4 w-4" /></Button>
              </div>

              <div className="grid lg:grid-cols-4 gap-4">
                <Card className="bg-[#071428] border-white/20 lg:col-span-1">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3 text-[#00C2D1] flex items-center gap-2"><Zap className="h-4 w-4" />Components</h3>
                    
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input value={componentSearch} onChange={(e) => setComponentSearch(e.target.value)} placeholder="Search..." className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
                      </div>
                    </div>
                    
                    {!componentSearch && (
                      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
                        <TabsList className="bg-white/10 w-full flex-wrap h-auto gap-1 p-1">
                          {Object.entries(COMPONENT_CATEGORIES).map(([key, cat]) => (
                            <TabsTrigger key={key} value={key} className="text-xs px-2 py-1 data-[state=active]:bg-[#9C4AFF]">{cat.icon}</TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    )}
                    
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2 text-sm pr-2">
                        {filteredComponents.map((comp) => (
                          <div key={comp.type} draggable onDragStart={() => handleDragStart(comp.type)} className="p-3 border border-white/10 rounded hover:bg-[#00C2D1]/20 cursor-move transition-colors backdrop-blur-sm group">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{comp.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{comp.label}</p>
                                <p className="text-gray-400 text-[10px] truncate">{comp.description}</p>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-1 flex-wrap">
                              <Badge variant="outline" className="text-[9px] px-1 py-0">{comp.category}</Badge>
                              <Badge variant="outline" className="text-[9px] px-1 py-0">{comp.pins} pins</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-white/95 border-white/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#071428]">{saveName || 'Circuit Canvas'}</h3>
                      <div className="text-xs text-gray-600 flex gap-4">
                        <span>{components.length} components</span>
                        <span className="text-[#9C4AFF] font-semibold">{wires.length} wires</span>
                        {wireDrawingMode && <span className="text-[#FF6B00] font-bold animate-pulse">Drawing wire...</span>}
                      </div>
                    </div>
                    <div
                      ref={canvasRef}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      className={`bg-white rounded-lg border-2 ${wireDrawingMode ? 'border-[#9C4AFF] border-solid' : 'border-dashed border-gray-300'} min-h-[500px] relative overflow-hidden transition-all`}
                      style={{
                        backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                        backgroundSize: `${GRID_SIZE * (zoom / 100)}px ${GRID_SIZE * (zoom / 100)}px`,
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        width: `${100 / (zoom / 100)}%`,
                        height: `${500 / (zoom / 100)}px`
                      }}
                    >
                      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                        {wires.map((wire) => {
                          const pathD = wire.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const isSelected = selectedWires.includes(wire.id);
                          return (
                            <g key={wire.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedWires(prev => prev.includes(wire.id) ? prev.filter(id => id !== wire.id) : [...prev, wire.id]); }}>
                              <path d={pathD} fill="none" stroke={wire.color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" filter="blur(4px)" />
                              <path d={pathD} fill="none" stroke={isSelected ? '#FFD700' : wire.color} strokeWidth={isSelected ? "5" : "3"} strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx={wire.path[0].x} cy={wire.path[0].y} r="4" fill={wire.color} stroke="white" strokeWidth="1" />
                              <circle cx={wire.path[wire.path.length - 1].x} cy={wire.path[wire.path.length - 1].y} r="4" fill={wire.color} stroke="white" strokeWidth="1" />
                              {wire.netLabel && (
                                <text x={(wire.path[0].x + wire.path[wire.path.length - 1].x) / 2} y={(wire.path[0].y + wire.path[wire.path.length - 1].y) / 2 - 10} fontSize="10" fill="#9C4AFF" fontWeight="bold" textAnchor="middle" className="pointer-events-none">{wire.netLabel}</text>
                              )}
                            </g>
                          );
                        })}
                        {dragWire && (
                          <g>
                            <line x1={dragWire.from.x} y1={dragWire.from.y} x2={dragWire.currentX} y2={dragWire.currentY} stroke="#9C4AFF" strokeWidth="4" strokeDasharray="10,5" strokeLinecap="round" opacity="0.8">
                              <animate attributeName="stroke-dashoffset" from="0" to="15" dur="0.5s" repeatCount="indefinite" />
                            </line>
                            <circle cx={dragWire.from.x} cy={dragWire.from.y} r="6" fill="#9C4AFF" stroke="white" strokeWidth="2" />
                            <circle cx={dragWire.currentX} cy={dragWire.currentY} r="5" fill="#FF6B00" className="animate-pulse" />
                          </g>
                        )}
                      </svg>

                      {components.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ zIndex: 0 }}>
                          <div className="text-center">
                            <CircuitBoard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-600">Drag components here to build your circuit</p>
                            <p className="text-sm mt-2">Load a template or saved project to start</p>
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
                              } ${comp.locked ? 'opacity-80' : ''}`}
                              style={{ left: comp.x, top: comp.y, transform: `rotate(${comp.rotation}deg)`, zIndex: 2 }}
                              onClick={() => setSelectedComponent(comp)}
                              onMouseDown={(e) => handleComponentMouseDown(e, comp)}
                              onMouseEnter={() => setHoveredComponent(comp.id)}
                              onMouseLeave={() => setHoveredComponent(null)}
                            >
                              {comp.locked && <Lock className="absolute -top-2 -right-2 h-4 w-4 text-red-500" />}
                              
                              {(isHovered || showAllTerminals || wireDrawingMode) && (
                                <>
                                  {(['top', 'bottom', 'left', 'right'] as const).map((terminal) => {
                                    const termPos = { top: { x: 20, y: -8 }, bottom: { x: 20, y: 56 }, left: { x: -8, y: 20 }, right: { x: 56, y: 20 } };
                                    const isTerminalHovered = hoveredTerminal?.componentId === comp.id && hoveredTerminal?.terminal === terminal;
                                    return (
                                      <div
                                        key={terminal}
                                        className={`absolute w-4 h-4 border-2 border-white rounded-full cursor-crosshair transition-all shadow-lg ${isTerminalHovered ? 'bg-[#FF6B00] scale-125' : 'bg-[#9C4AFF] hover:bg-[#FF6B00] hover:scale-110'}`}
                                        style={{ left: termPos[terminal].x, top: termPos[terminal].y, zIndex: 10 }}
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
                                <span className="text-xs font-medium text-gray-700">{comp.value} {comp.unit}</span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {selectedComponent && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-gradient-to-br from-[#071428] via-[#0a1d38] to-[#071428] rounded-lg border-2 border-[#00C2D1]/30 shadow-lg">
                        <h4 className="font-bold mb-4 text-white text-base flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[#00C2D1]" />Component Properties
                          {liveEditMode && <Badge className="text-xs bg-[#FF6B00]">Live Edit</Badge>}
                        </h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">Type</Label>
                            <p className="text-sm font-bold capitalize text-white">{selectedComponent.type}</p>
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">Value</Label>
                            <Input type="number" value={selectedComponent.value} onChange={(e) => updateComponentValue(selectedComponent.id, parseFloat(e.target.value))} className="h-8 text-sm bg-white text-[#071428] font-bold border-[#00C2D1]/30" />
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <Label className="text-xs font-semibold text-[#00C2D1] mb-1 block">Unit</Label>
                            <p className="text-sm font-bold text-white">{selectedComponent.unit}</p>
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg border border-white/20 flex items-center gap-2">
                            <Button size="sm" onClick={() => rotateComponent(selectedComponent.id)} className="bg-[#9C4AFF] text-white"><RotateCw className="h-4 w-4" /></Button>
                            <Button size="sm" onClick={() => duplicateComponent(selectedComponent)} className="bg-[#00C2D1] text-[#071428]"><Copy className="h-4 w-4" /></Button>
                            <Button size="sm" onClick={() => toggleLockComponent(selectedComponent.id)} variant="outline" className="border-white/20 text-white">{selectedComponent.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Button>
                            <Button size="sm" variant="destructive" onClick={() => removeComponent(selectedComponent.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#00C2D1]" />Oscilloscope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#071428] rounded p-4 h-48 relative overflow-hidden">
                  {waveform.length > 0 ? (
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <polyline points={waveform.map((v, i) => `${(i / waveform.length) * 100}%,${50 - (v / (voltage || 1) * 40)}%`).join(' ')} fill="none" stroke="#00C2D1" strokeWidth="2" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                    </svg>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Run simulation to see waveform</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2"><Gauge className="h-4 w-4 text-[#00C2D1]" />Multimeter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-white/5 rounded"><span className="text-gray-300">Voltage:</span><span className="font-bold text-[#00C2D1]">{voltage.toFixed(2)} V</span></div>
                  <div className="flex justify-between p-2 bg-white/5 rounded"><span className="text-gray-300">Current:</span><span className="font-bold text-[#00C2D1]">{(current * 1000).toFixed(2)} mA</span></div>
                  <div className="flex justify-between p-2 bg-white/5 rounded"><span className="text-gray-300">Resistance:</span><span className="font-bold text-[#00C2D1]">{resistance.toFixed(0)} Ω</span></div>
                  <div className="flex justify-between p-2 bg-white/5 rounded"><span className="text-gray-300">Power:</span><span className="font-bold text-[#00C2D1]">{(power * 1000).toFixed(2)} mW</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2"><Zap className="h-4 w-4 text-[#00C2D1]" />Circuit Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-300">
                  {isRunning ? (
                    <>
                      <p className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />{simulationSettings.mode.toUpperCase()} analysis</p>
                      <p>Components: {components.length}</p>
                      <p>Wires: {wires.length}</p>
                      <p>Nets: {buildNetlist(components, wires).length}</p>
                      <p>Power: {(power * 1000).toFixed(2)} mW</p>
                    </>
                  ) : (
                    <>
                      <p>{components.length} components</p>
                      <p>{wires.length} connections</p>
                      <p>{COMPONENT_LIBRARY.length}+ available</p>
                      <p>{CIRCUIT_TEMPLATES.length} templates</p>
                      <Button size="sm" onClick={runValidation} className="w-full mt-2 bg-[#FF6B00]"><Bug className="h-3 w-3 mr-2" />Check Circuit</Button>
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
