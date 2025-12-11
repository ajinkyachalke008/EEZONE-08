'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  Point, 
  Wire, 
  Net, 
  NetManager, 
  SpatialIndex,
  gridAStarRouter,
  snapToGrid,
  validateWiring,
  WiringValidationError,
  WIRE_COLORS,
  getWireColor
} from '@/lib/wiring-system';

export interface WiringElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string;
  value?: string;
  terminals: Array<{
    id: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    type: 'input' | 'output' | 'bidirectional';
  }>;
}

export interface WireConnection {
  id: string;
  from: { elementId: string; terminal: string; position: Point };
  to: { elementId: string; terminal: string; position: Point };
  path: Point[];
  netId: string;
  netLabel?: string;
  color: string;
  wireType: string;
}

export interface HistoryState {
  elements: WiringElement[];
  wires: WireConnection[];
}

export interface UseCanvasWiringOptions {
  gridSize?: number;
  snapEnabled?: boolean;
  autoRoute?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  debounceMs?: number;
}

export interface DragWireState {
  from: { elementId: string; terminal: string; position: Point };
  currentPosition: Point;
  previewPath: Point[];
}

const TERMINAL_OFFSETS: Record<string, (w: number, h: number) => Point> = {
  top: (w, h) => ({ x: w / 2, y: 0 }),
  bottom: (w, h) => ({ x: w / 2, y: h }),
  left: (w, h) => ({ x: 0, y: h / 2 }),
  right: (w, h) => ({ x: w, y: h / 2 }),
};

export function useCanvasWiring(options: UseCanvasWiringOptions = {}) {
  const {
    gridSize = 20,
    snapEnabled = true,
    autoRoute = true,
    canvasWidth = 800,
    canvasHeight = 600,
    debounceMs = 60,
  } = options;

  const [elements, setElements] = useState<WiringElement[]>([]);
  const [wires, setWires] = useState<WireConnection[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedWireIds, setSelectedWireIds] = useState<string[]>([]);
  const [dragWire, setDragWire] = useState<DragWireState | null>(null);
  const [hoveredTerminal, setHoveredTerminal] = useState<{ elementId: string; terminal: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<WiringValidationError[]>([]);

  const netManagerRef = useRef(new NetManager());
  const spatialIndexRef = useRef(new SpatialIndex());
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const routingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(elements)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, wires, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setWires(prevState.wires);
      setHistoryIndex(historyIndex - 1);
      return true;
    }
    return false;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setWires(nextState.wires);
      setHistoryIndex(historyIndex + 1);
      return true;
    }
    return false;
  }, [history, historyIndex]);

  const getTerminalPosition = useCallback((element: WiringElement, terminalPos: string): Point => {
    const offset = TERMINAL_OFFSETS[terminalPos];
    if (!offset) return { x: element.x, y: element.y };
    const pt = offset(element.width, element.height);
    return { x: element.x + pt.x, y: element.y + pt.y };
  }, []);

  const rebuildSpatialIndex = useCallback(() => {
    spatialIndexRef.current.clear();
    
    for (const el of elements) {
      spatialIndexRef.current.insert({
        minX: el.x,
        minY: el.y,
        maxX: el.x + el.width,
        maxY: el.y + el.height,
        id: el.id,
        type: 'component',
      });
      
      for (const term of el.terminals) {
        const pos = getTerminalPosition(el, term.position);
        spatialIndexRef.current.insert({
          minX: pos.x - 10,
          minY: pos.y - 10,
          maxX: pos.x + 10,
          maxY: pos.y + 10,
          id: `${el.id}-${term.id}`,
          type: 'terminal',
        });
      }
    }
  }, [elements, getTerminalPosition]);

  useEffect(() => {
    rebuildSpatialIndex();
  }, [elements, rebuildSpatialIndex]);

  const getObstacles = useCallback(() => {
    return elements.map(el => ({
      minX: el.x - 5,
      minY: el.y - 5,
      maxX: el.x + el.width + 5,
      maxY: el.y + el.height + 5,
    }));
  }, [elements]);

  const routeWire = useCallback((from: Point, to: Point): Point[] => {
    if (!autoRoute) {
      const midX = (from.x + to.x) / 2;
      return [from, { x: midX, y: from.y }, { x: midX, y: to.y }, to];
    }
    return gridAStarRouter(from, to, getObstacles(), canvasWidth, canvasHeight);
  }, [autoRoute, getObstacles, canvasWidth, canvasHeight]);

  const addElement = useCallback((element: Omit<WiringElement, 'id'>) => {
    const newElement: WiringElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    if (snapEnabled) {
      const snapped = snapToGrid({ x: newElement.x, y: newElement.y }, gridSize);
      newElement.x = snapped.x;
      newElement.y = snapped.y;
    }
    
    setElements(prev => [...prev, newElement]);
    setTimeout(saveToHistory, 0);
    return newElement;
  }, [snapEnabled, gridSize, saveToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<WiringElement>) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      const updated = { ...el, ...updates };
      
      if (snapEnabled && (updates.x !== undefined || updates.y !== undefined)) {
        const snapped = snapToGrid({ x: updated.x, y: updated.y }, gridSize);
        updated.x = snapped.x;
        updated.y = snapped.y;
      }
      
      return updated;
    }));
    
    if (routingDebounceRef.current) {
      clearTimeout(routingDebounceRef.current);
    }
    routingDebounceRef.current = setTimeout(() => {
      setWires(prev => prev.map(wire => {
        const fromEl = elements.find(e => e.id === wire.from.elementId);
        const toEl = elements.find(e => e.id === wire.to.elementId);
        
        if (!fromEl || !toEl) return wire;
        if (wire.from.elementId !== id && wire.to.elementId !== id) return wire;
        
        const fromPos = getTerminalPosition(
          wire.from.elementId === id ? { ...fromEl, ...updates } as WiringElement : fromEl,
          wire.from.terminal
        );
        const toPos = getTerminalPosition(
          wire.to.elementId === id ? { ...toEl, ...updates } as WiringElement : toEl,
          wire.to.terminal
        );
        
        return {
          ...wire,
          from: { ...wire.from, position: fromPos },
          to: { ...wire.to, position: toPos },
          path: routeWire(fromPos, toPos),
        };
      }));
    }, debounceMs);
  }, [snapEnabled, gridSize, elements, getTerminalPosition, routeWire, debounceMs]);

  const removeElement = useCallback((id: string) => {
    setWires(prev => prev.filter(w => w.from.elementId !== id && w.to.elementId !== id));
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    saveToHistory();
  }, [selectedElementId, saveToHistory]);

  const startWireDrag = useCallback((elementId: string, terminal: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const terminalDef = element.terminals.find(t => t.id === terminal || t.position === terminal);
    if (!terminalDef) return;
    
    const position = getTerminalPosition(element, terminalDef.position);
    
    setDragWire({
      from: { elementId, terminal: terminalDef.position, position },
      currentPosition: position,
      previewPath: [position],
    });
  }, [elements, getTerminalPosition]);

  const updateWireDrag = useCallback((currentPos: Point) => {
    if (!dragWire) return;
    
    const snappedPos = snapEnabled ? snapToGrid(currentPos, gridSize) : currentPos;
    const previewPath = routeWire(dragWire.from.position, snappedPos);
    
    setDragWire(prev => prev ? {
      ...prev,
      currentPosition: snappedPos,
      previewPath,
    } : null);
    
    const nearby = spatialIndexRef.current.findTerminalAt(snappedPos, 25);
    if (nearby && nearby.id !== `${dragWire.from.elementId}-${dragWire.from.terminal}`) {
      const [elId, termId] = nearby.id.split('-');
      setHoveredTerminal({ elementId: elId, terminal: termId });
    } else {
      setHoveredTerminal(null);
    }
  }, [dragWire, snapEnabled, gridSize, routeWire]);

  const endWireDrag = useCallback((targetElementId?: string, targetTerminal?: string) => {
    if (!dragWire) return null;
    
    let toElementId = targetElementId;
    let toTerminal = targetTerminal;
    
    if (!toElementId && hoveredTerminal) {
      toElementId = hoveredTerminal.elementId;
      toTerminal = hoveredTerminal.terminal;
    }
    
    if (!toElementId || !toTerminal) {
      setDragWire(null);
      setHoveredTerminal(null);
      return null;
    }
    
    if (toElementId === dragWire.from.elementId) {
      setDragWire(null);
      setHoveredTerminal(null);
      return null;
    }
    
    const toElement = elements.find(el => el.id === toElementId);
    if (!toElement) {
      setDragWire(null);
      setHoveredTerminal(null);
      return null;
    }
    
    const toTerminalDef = toElement.terminals.find(t => t.id === toTerminal || t.position === toTerminal);
    if (!toTerminalDef) {
      setDragWire(null);
      setHoveredTerminal(null);
      return null;
    }
    
    const toPosition = getTerminalPosition(toElement, toTerminalDef.position);
    const path = routeWire(dragWire.from.position, toPosition);
    
    const net = netManagerRef.current.createNet();
    const colorIndex = wires.length % Object.keys(WIRE_COLORS).length;
    const color = Object.values(WIRE_COLORS)[colorIndex] || WIRE_COLORS.default;
    
    const newWire: WireConnection = {
      id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: dragWire.from,
      to: { elementId: toElementId, terminal: toTerminalDef.position, position: toPosition },
      path,
      netId: net.id,
      netLabel: net.label,
      color,
      wireType: 'signal',
    };
    
    netManagerRef.current.addWireToNet(newWire.id, net.id);
    
    setWires(prev => [...prev, newWire]);
    setDragWire(null);
    setHoveredTerminal(null);
    saveToHistory();
    
    return newWire;
  }, [dragWire, hoveredTerminal, elements, getTerminalPosition, routeWire, wires.length, saveToHistory]);

  const cancelWireDrag = useCallback(() => {
    setDragWire(null);
    setHoveredTerminal(null);
  }, []);

  const removeWire = useCallback((wireId: string) => {
    netManagerRef.current.removeWire(wireId);
    setWires(prev => prev.filter(w => w.id !== wireId));
    setSelectedWireIds(prev => prev.filter(id => id !== wireId));
    saveToHistory();
  }, [saveToHistory]);

  const removeSelectedWires = useCallback(() => {
    for (const wireId of selectedWireIds) {
      netManagerRef.current.removeWire(wireId);
    }
    setWires(prev => prev.filter(w => !selectedWireIds.includes(w.id)));
    setSelectedWireIds([]);
    saveToHistory();
  }, [selectedWireIds, saveToHistory]);

  const updateWireColor = useCallback((wireId: string, color: string) => {
    setWires(prev => prev.map(w => w.id === wireId ? { ...w, color } : w));
  }, []);

  const updateWireNetLabel = useCallback((wireId: string, label: string) => {
    setWires(prev => prev.map(w => {
      if (w.id !== wireId) return w;
      const net = netManagerRef.current.getNet(w.netId);
      if (net) net.label = label;
      return { ...w, netLabel: label };
    }));
  }, []);

  const rerouteAllWires = useCallback(() => {
    setWires(prev => prev.map(wire => {
      const fromEl = elements.find(e => e.id === wire.from.elementId);
      const toEl = elements.find(e => e.id === wire.to.elementId);
      
      if (!fromEl || !toEl) return wire;
      
      const fromPos = getTerminalPosition(fromEl, wire.from.terminal);
      const toPos = getTerminalPosition(toEl, wire.to.terminal);
      
      return {
        ...wire,
        from: { ...wire.from, position: fromPos },
        to: { ...wire.to, position: toPos },
        path: routeWire(fromPos, toPos),
      };
    }));
  }, [elements, getTerminalPosition, routeWire]);

  const runValidation = useCallback(() => {
    const wiringComponents = elements.map(el => ({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
      terminals: el.terminals.map(t => ({
        id: t.id,
        componentId: el.id,
        position: getTerminalPosition(el, t.position),
        type: t.type,
      })),
    }));
    
    const wiringWires: Wire[] = wires.map(w => ({
      id: w.id,
      segments: [],
      fromTerminal: { componentId: w.from.elementId, terminal: w.from.terminal },
      toTerminal: { componentId: w.to.elementId, terminal: w.to.terminal },
      netId: w.netId,
      netLabel: w.netLabel,
      color: w.color,
    }));
    
    const errors = validateWiring(wiringComponents, wiringWires, netManagerRef.current);
    setValidationErrors(errors);
    return errors;
  }, [elements, wires, getTerminalPosition]);

  const clearCanvas = useCallback(() => {
    setElements([]);
    setWires([]);
    setSelectedElementId(null);
    setSelectedWireIds([]);
    setDragWire(null);
    setHoveredTerminal(null);
    setValidationErrors([]);
    netManagerRef.current.clear();
    saveToHistory();
  }, [saveToHistory]);

  const exportData = useCallback(() => {
    return {
      elements,
      wires,
      nets: netManagerRef.current.getAllNets(),
      exportedAt: new Date().toISOString(),
    };
  }, [elements, wires]);

  const importData = useCallback((data: { elements: WiringElement[]; wires: WireConnection[] }) => {
    setElements(data.elements);
    setWires(data.wires);
    netManagerRef.current.clear();
    saveToHistory();
  }, [saveToHistory]);

  const selectedElement = useMemo(() => {
    return elements.find(el => el.id === selectedElementId) || null;
  }, [elements, selectedElementId]);

  const selectedWires = useMemo(() => {
    return wires.filter(w => selectedWireIds.includes(w.id));
  }, [wires, selectedWireIds]);

  return {
    elements,
    wires,
    selectedElement,
    selectedWires,
    selectedElementId,
    selectedWireIds,
    dragWire,
    hoveredTerminal,
    validationErrors,
    
    setSelectedElementId,
    setSelectedWireIds,
    
    addElement,
    updateElement,
    removeElement,
    
    startWireDrag,
    updateWireDrag,
    endWireDrag,
    cancelWireDrag,
    
    removeWire,
    removeSelectedWires,
    updateWireColor,
    updateWireNetLabel,
    rerouteAllWires,
    
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    
    runValidation,
    clearCanvas,
    exportData,
    importData,
    
    getTerminalPosition,
    spatialIndex: spatialIndexRef.current,
    netManager: netManagerRef.current,
  };
}
