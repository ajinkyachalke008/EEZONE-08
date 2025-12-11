import RBush from 'rbush';

// Types
export interface Point {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  componentId: string;
  position: Point;
  type: 'input' | 'output' | 'bidirectional';
  label?: string;
}

export interface WireSegment {
  id: string;
  from: Point;
  to: Point;
  netId: string;
  color: string;
}

export interface Wire {
  id: string;
  segments: WireSegment[];
  fromTerminal: { componentId: string; terminal: string };
  toTerminal: { componentId: string; terminal: string };
  netId: string;
  netLabel?: string;
  color: string;
}

export interface Net {
  id: string;
  label: string;
  wires: string[];
  terminals: string[];
  color: string;
}

export interface WiringComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  terminals: Terminal[];
}

export interface FloorPlanRoom {
  id: string;
  name: string;
  points: Point[];
  color: string;
  devices: string[];
}

export interface FloorPlanWall {
  id: string;
  from: Point;
  to: Point;
  thickness: number;
}

// Grid A* Router
const GRID_CELL_PX = 12;
const OBSTACLE_INFLATION_PX = 6;

interface GridNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export function gridToPixel(gridX: number, gridY: number): Point {
  return { x: gridX * GRID_CELL_PX, y: gridY * GRID_CELL_PX };
}

export function pixelToGrid(px: number, py: number): { gx: number; gy: number } {
  return { gx: Math.round(px / GRID_CELL_PX), gy: Math.round(py / GRID_CELL_PX) };
}

export function snapToGrid(point: Point, gridSize: number = GRID_CELL_PX): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

function heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function gridAStarRouter(
  start: Point,
  end: Point,
  obstacles: { minX: number; minY: number; maxX: number; maxY: number }[],
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  const startGrid = pixelToGrid(start.x, start.y);
  const endGrid = pixelToGrid(end.x, end.y);
  
  const gridWidth = Math.ceil(canvasWidth / GRID_CELL_PX);
  const gridHeight = Math.ceil(canvasHeight / GRID_CELL_PX);
  
  const inflatedObstacles = obstacles.map(obs => ({
    minX: Math.floor((obs.minX - OBSTACLE_INFLATION_PX) / GRID_CELL_PX),
    minY: Math.floor((obs.minY - OBSTACLE_INFLATION_PX) / GRID_CELL_PX),
    maxX: Math.ceil((obs.maxX + OBSTACLE_INFLATION_PX) / GRID_CELL_PX),
    maxY: Math.ceil((obs.maxY + OBSTACLE_INFLATION_PX) / GRID_CELL_PX),
  }));
  
  const isBlocked = (gx: number, gy: number): boolean => {
    if (gx < 0 || gx >= gridWidth || gy < 0 || gy >= gridHeight) return true;
    return inflatedObstacles.some(
      obs => gx >= obs.minX && gx <= obs.maxX && gy >= obs.minY && gy <= obs.maxY
    );
  };
  
  const openSet = new PriorityQueue<GridNode>();
  const closedSet = new Set<string>();
  
  const startNode: GridNode = {
    x: startGrid.gx,
    y: startGrid.gy,
    g: 0,
    h: heuristic(startGrid, endGrid),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  
  openSet.enqueue(startNode, startNode.f);
  
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];
  
  let iterations = 0;
  const maxIterations = gridWidth * gridHeight * 2;
  
  while (!openSet.isEmpty() && iterations < maxIterations) {
    iterations++;
    const current = openSet.dequeue()!;
    
    if (current.x === endGrid.gx && current.y === endGrid.gy) {
      const path: Point[] = [];
      let node: GridNode | null = current;
      while (node) {
        path.unshift(gridToPixel(node.x, node.y));
        node = node.parent;
      }
      return simplifyPath(path);
    }
    
    const key = `${current.x},${current.y}`;
    if (closedSet.has(key)) continue;
    closedSet.add(key);
    
    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const nKey = `${nx},${ny}`;
      
      if (closedSet.has(nKey) || isBlocked(nx, ny)) continue;
      
      const g = current.g + 1;
      const h = heuristic({ x: nx, y: ny }, endGrid);
      const f = g + h;
      
      const neighbor: GridNode = { x: nx, y: ny, g, h, f, parent: current };
      openSet.enqueue(neighbor, f);
    }
  }
  
  return [start, end];
}

function simplifyPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;
  
  const result: Point[] = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];
    
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    
    if (dx1 !== dx2 || dy1 !== dy2) {
      result.push(curr);
    }
  }
  
  result.push(path[path.length - 1]);
  return result;
}

// Spatial Index using RBush
interface SpatialItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
  type: 'component' | 'wire' | 'terminal';
}

export class SpatialIndex {
  private tree: RBush<SpatialItem>;
  
  constructor() {
    this.tree = new RBush<SpatialItem>();
  }
  
  insert(item: SpatialItem) {
    this.tree.insert(item);
  }
  
  remove(item: SpatialItem) {
    this.tree.remove(item);
  }
  
  clear() {
    this.tree.clear();
  }
  
  search(bounds: { minX: number; minY: number; maxX: number; maxY: number }): SpatialItem[] {
    return this.tree.search(bounds);
  }
  
  findNearby(point: Point, radius: number): SpatialItem[] {
    return this.tree.search({
      minX: point.x - radius,
      minY: point.y - radius,
      maxX: point.x + radius,
      maxY: point.y + radius,
    });
  }
  
  findTerminalAt(point: Point, snapRadius: number = 20): SpatialItem | null {
    const nearby = this.findNearby(point, snapRadius).filter(item => item.type === 'terminal');
    if (nearby.length === 0) return null;
    
    let closest: SpatialItem | null = null;
    let minDist = Infinity;
    
    for (const item of nearby) {
      const cx = (item.minX + item.maxX) / 2;
      const cy = (item.minY + item.maxY) / 2;
      const dist = Math.sqrt((point.x - cx) ** 2 + (point.y - cy) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = item;
      }
    }
    
    return closest;
  }
}

// Net Manager
export class NetManager {
  private nets: Map<string, Net> = new Map();
  private wireToNet: Map<string, string> = new Map();
  private terminalToNet: Map<string, string> = new Map();
  private colorIndex = 0;
  
  private static colors = [
    '#FF00C8', '#00E5FF', '#9C4AFF', '#FF6B00', '#00FF88',
    '#FFD700', '#FF4444', '#44FF44', '#4488FF', '#FF8844',
  ];
  
  createNet(label?: string): Net {
    const id = `net-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const color = NetManager.colors[this.colorIndex % NetManager.colors.length];
    this.colorIndex++;
    
    const net: Net = {
      id,
      label: label || `N${this.nets.size + 1}`,
      wires: [],
      terminals: [],
      color,
    };
    
    this.nets.set(id, net);
    return net;
  }
  
  getNet(netId: string): Net | undefined {
    return this.nets.get(netId);
  }
  
  getAllNets(): Net[] {
    return Array.from(this.nets.values());
  }
  
  addWireToNet(wireId: string, netId: string) {
    const net = this.nets.get(netId);
    if (net && !net.wires.includes(wireId)) {
      net.wires.push(wireId);
      this.wireToNet.set(wireId, netId);
    }
  }
  
  addTerminalToNet(terminalId: string, netId: string) {
    const net = this.nets.get(netId);
    if (net && !net.terminals.includes(terminalId)) {
      net.terminals.push(terminalId);
      this.terminalToNet.set(terminalId, netId);
    }
  }
  
  getNetForWire(wireId: string): Net | undefined {
    const netId = this.wireToNet.get(wireId);
    return netId ? this.nets.get(netId) : undefined;
  }
  
  getNetForTerminal(terminalId: string): Net | undefined {
    const netId = this.terminalToNet.get(terminalId);
    return netId ? this.nets.get(netId) : undefined;
  }
  
  mergeNets(netId1: string, netId2: string): Net | null {
    if (netId1 === netId2) return this.nets.get(netId1) || null;
    
    const net1 = this.nets.get(netId1);
    const net2 = this.nets.get(netId2);
    
    if (!net1 || !net2) return null;
    
    net1.wires.push(...net2.wires);
    net1.terminals.push(...net2.terminals);
    
    for (const wireId of net2.wires) {
      this.wireToNet.set(wireId, netId1);
    }
    for (const terminalId of net2.terminals) {
      this.terminalToNet.set(terminalId, netId1);
    }
    
    this.nets.delete(netId2);
    return net1;
  }
  
  removeWire(wireId: string) {
    const netId = this.wireToNet.get(wireId);
    if (netId) {
      const net = this.nets.get(netId);
      if (net) {
        net.wires = net.wires.filter(id => id !== wireId);
        if (net.wires.length === 0 && net.terminals.length === 0) {
          this.nets.delete(netId);
        }
      }
      this.wireToNet.delete(wireId);
    }
  }
  
  clear() {
    this.nets.clear();
    this.wireToNet.clear();
    this.terminalToNet.clear();
    this.colorIndex = 0;
  }
}

// Wire validation
export interface WiringValidationError {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  description: string;
  componentId?: string;
  wireId?: string;
  fix?: string;
}

export function validateWiring(
  components: WiringComponent[],
  wires: Wire[],
  netManager: NetManager
): WiringValidationError[] {
  const errors: WiringValidationError[] = [];
  
  const unconnectedTerminals = new Set<string>();
  for (const comp of components) {
    for (const terminal of comp.terminals) {
      unconnectedTerminals.add(terminal.id);
    }
  }
  
  for (const wire of wires) {
    unconnectedTerminals.delete(`${wire.fromTerminal.componentId}-${wire.fromTerminal.terminal}`);
    unconnectedTerminals.delete(`${wire.toTerminal.componentId}-${wire.toTerminal.terminal}`);
  }
  
  if (unconnectedTerminals.size > 0) {
    errors.push({
      id: `unconnected-${Date.now()}`,
      type: 'warning',
      message: `${unconnectedTerminals.size} unconnected terminal(s)`,
      description: 'Some terminals are not connected to any wire',
      fix: 'Connect all terminals for a complete circuit',
    });
  }
  
  const connectionCount: Record<string, number> = {};
  for (const wire of wires) {
    const fromKey = `${wire.fromTerminal.componentId}-${wire.fromTerminal.terminal}`;
    const toKey = `${wire.toTerminal.componentId}-${wire.toTerminal.terminal}`;
    connectionCount[fromKey] = (connectionCount[fromKey] || 0) + 1;
    connectionCount[toKey] = (connectionCount[toKey] || 0) + 1;
  }
  
  for (const [terminalKey, count] of Object.entries(connectionCount)) {
    if (count > 3) {
      errors.push({
        id: `multiconnect-${terminalKey}`,
        type: 'warning',
        message: `High fan-out on terminal`,
        description: `Terminal ${terminalKey} has ${count} connections`,
        fix: 'Consider using junction nodes for cleaner routing',
      });
    }
  }
  
  const nets = netManager.getAllNets();
  for (const net of nets) {
    if (net.terminals.length === 1 && net.wires.length === 0) {
      errors.push({
        id: `isolated-net-${net.id}`,
        type: 'info',
        message: `Isolated net: ${net.label}`,
        description: 'This net has only one terminal connection',
        fix: 'Connect additional terminals to complete the net',
      });
    }
  }
  
  return errors;
}

// Auto-labeling
export function autoLabelNets(netManager: NetManager): void {
  const nets = netManager.getAllNets();
  let powerIndex = 1;
  let signalIndex = 1;
  let groundIndex = 1;
  
  for (const net of nets) {
    if (net.label.startsWith('N')) {
      if (net.terminals.some(t => t.toLowerCase().includes('vcc') || t.toLowerCase().includes('power'))) {
        net.label = `VCC${powerIndex++}`;
      } else if (net.terminals.some(t => t.toLowerCase().includes('gnd') || t.toLowerCase().includes('ground'))) {
        net.label = `GND${groundIndex++}`;
      } else {
        net.label = `SIG${signalIndex++}`;
      }
    }
  }
}

// Wire color utilities
export const WIRE_COLORS = {
  power: '#FF0000',
  ground: '#000000',
  signal: '#0066FF',
  neutral: '#FFFFFF',
  hot: '#000000',
  traveler: '#FF0000',
  switched: '#FFD700',
  default: '#9C4AFF',
};

export function getWireColor(type: string): string {
  return WIRE_COLORS[type as keyof typeof WIRE_COLORS] || WIRE_COLORS.default;
}

// NEC wire size calculator
export function calculateWireSize(amperage: number, length: number, voltage: number): string {
  const awgTable = [
    { awg: '14', maxAmps: 15, resistance: 2.525 },
    { awg: '12', maxAmps: 20, resistance: 1.588 },
    { awg: '10', maxAmps: 30, resistance: 0.999 },
    { awg: '8', maxAmps: 40, resistance: 0.628 },
    { awg: '6', maxAmps: 55, resistance: 0.395 },
    { awg: '4', maxAmps: 70, resistance: 0.249 },
    { awg: '2', maxAmps: 95, resistance: 0.156 },
    { awg: '1/0', maxAmps: 125, resistance: 0.098 },
    { awg: '2/0', maxAmps: 145, resistance: 0.078 },
    { awg: '3/0', maxAmps: 165, resistance: 0.062 },
    { awg: '4/0', maxAmps: 195, resistance: 0.049 },
  ];
  
  const maxVoltageDrop = voltage * 0.03;
  
  for (const wire of awgTable) {
    if (wire.maxAmps >= amperage) {
      const voltageDrop = 2 * length * wire.resistance * amperage / 1000;
      if (voltageDrop <= maxVoltageDrop) {
        return `${wire.awg} AWG`;
      }
    }
  }
  
  return '4/0 AWG or larger';
}
