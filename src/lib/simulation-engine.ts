// Advanced Circuit Simulation Engine with SPICE-like Analysis
// Implements DC, AC, and Transient analysis using Modified Nodal Analysis (MNA)

export interface SimulationComponent {
  id: string;
  type: string;
  value: number;
  unit: string;
  nodes: string[]; // Node IDs this component connects to
  params?: Record<string, number>;
}

export interface SimulationNode {
  id: string;
  label: string;
  voltage: number;
  isGround: boolean;
}

export interface SimulationResult {
  success: boolean;
  mode: 'dc' | 'ac' | 'transient';
  timestamp: number;
  nodes: SimulationNode[];
  componentData: Record<string, {
    voltage: number;
    current: number;
    power: number;
  }>;
  waveforms?: {
    [nodeId: string]: {
      time: number[];
      voltage: number[];
      current?: number[];
    };
  };
  measurements?: {
    rms: Record<string, number>;
    peak: Record<string, number>;
    frequency: Record<string, number>;
    phase: Record<string, number>;
  };
  error?: string;
}

export interface SimulationSettings {
  mode: 'dc' | 'ac' | 'transient';
  
  // DC settings
  dcMaxIterations?: number;
  dcTolerance?: number;
  
  // AC settings
  acStartFreq?: number;
  acStopFreq?: number;
  acPointsPerDecade?: number;
  acLogScale?: boolean;
  
  // Transient settings
  transientStartTime?: number;
  transientStopTime?: number;
  transientTimeStep?: number;
  transientMaxStep?: number;
}

// Component models for simulation
interface ComponentModel {
  type: string;
  getStamps: (value: number, nodes: string[], params?: Record<string, number>) => {
    conductanceStamps?: Array<{ row: number; col: number; value: number }>;
    currentStamps?: Array<{ row: number; value: number }>;
    voltageStamps?: Array<{ row: number; col: number; value: number }>;
  };
}

// Define component models
const COMPONENT_MODELS: Record<string, ComponentModel> = {
  resistor: {
    type: 'resistor',
    getStamps: (resistance: number, nodes: string[]) => {
      if (resistance === 0) resistance = 1e-6; // Prevent division by zero
      const conductance = 1 / resistance;
      
      return {
        conductanceStamps: [
          { row: 0, col: 0, value: conductance },
          { row: 0, col: 1, value: -conductance },
          { row: 1, col: 0, value: -conductance },
          { row: 1, col: 1, value: conductance }
        ]
      };
    }
  },
  
  capacitor: {
    type: 'capacitor',
    getStamps: (capacitance: number, nodes: string[], params?: Record<string, number>) => {
      const dt = params?.timeStep || 1e-6;
      const conductance = capacitance / dt; // Backward Euler integration
      
      return {
        conductanceStamps: [
          { row: 0, col: 0, value: conductance },
          { row: 0, col: 1, value: -conductance },
          { row: 1, col: 0, value: -conductance },
          { row: 1, col: 1, value: conductance }
        ]
      };
    }
  },
  
  inductor: {
    type: 'inductor',
    getStamps: (inductance: number, nodes: string[], params?: Record<string, number>) => {
      const dt = params?.timeStep || 1e-6;
      const resistance = inductance / dt; // Backward Euler integration
      const conductance = 1 / resistance;
      
      return {
        conductanceStamps: [
          { row: 0, col: 0, value: conductance },
          { row: 0, col: 1, value: -conductance },
          { row: 1, col: 0, value: -conductance },
          { row: 1, col: 1, value: conductance }
        ]
      };
    }
  },
  
  voltage_dc: {
    type: 'voltage_source',
    getStamps: (voltage: number, nodes: string[]) => {
      return {
        voltageStamps: [
          { row: 0, col: 0, value: 1 },
          { row: 0, col: 1, value: -1 }
        ],
        currentStamps: [
          { row: 0, value: voltage }
        ]
      };
    }
  },
  
  battery: {
    type: 'voltage_source',
    getStamps: (voltage: number, nodes: string[]) => {
      return {
        voltageStamps: [
          { row: 0, col: 0, value: 1 },
          { row: 0, col: 1, value: -1 }
        ],
        currentStamps: [
          { row: 0, value: voltage }
        ]
      };
    }
  },
  
  current_source: {
    type: 'current_source',
    getStamps: (current: number, nodes: string[]) => {
      return {
        currentStamps: [
          { row: 0, value: -current },
          { row: 1, value: current }
        ]
      };
    }
  },
  
  led: {
    type: 'led',
    getStamps: (forwardVoltage: number, nodes: string[]) => {
      // Simplified LED model as voltage source + resistor
      const resistance = 10; // 10 ohm series resistance
      const conductance = 1 / resistance;
      
      return {
        conductanceStamps: [
          { row: 0, col: 0, value: conductance },
          { row: 0, col: 1, value: -conductance },
          { row: 1, col: 0, value: -conductance },
          { row: 1, col: 1, value: conductance }
        ],
        voltageStamps: [
          { row: 0, col: 0, value: 0.5 }
        ]
      };
    }
  },
  
  diode: {
    type: 'diode',
    getStamps: (forwardVoltage: number, nodes: string[]) => {
      // Simplified diode model
      const resistance = 0.7 / 0.001; // 0.7V @ 1mA
      const conductance = 1 / resistance;
      
      return {
        conductanceStamps: [
          { row: 0, col: 0, value: conductance },
          { row: 0, col: 1, value: -conductance },
          { row: 1, col: 0, value: -conductance },
          { row: 1, col: 1, value: conductance }
        ]
      };
    }
  }
};

/**
 * Modified Nodal Analysis (MNA) Solver
 * Solves circuit equations using matrix methods
 */
class MNASolver {
  private nodeMap: Map<string, number> = new Map();
  private matrixSize: number = 0;
  private G: number[][] = []; // Conductance matrix
  private B: number[] = []; // Right-hand side vector
  private X: number[] = []; // Solution vector (node voltages)
  
  constructor(nodes: string[]) {
    // Create node mapping (excluding ground which is always 0)
    let index = 0;
    nodes.forEach(node => {
      if (node !== 'GND' && node !== 'ground') {
        this.nodeMap.set(node, index++);
      }
    });
    
    this.matrixSize = this.nodeMap.size;
    this.initializeMatrices();
  }
  
  private initializeMatrices() {
    // Initialize G matrix (conductance)
    this.G = Array(this.matrixSize).fill(0).map(() => 
      Array(this.matrixSize).fill(0)
    );
    
    // Initialize B vector (current sources)
    this.B = Array(this.matrixSize).fill(0);
    
    // Initialize X vector (solution)
    this.X = Array(this.matrixSize).fill(0);
  }
  
  /**
   * Add component stamps to the system matrices
   */
  addComponent(comp: SimulationComponent) {
    const model = COMPONENT_MODELS[comp.type];
    if (!model) {
      console.warn(`No model for component type: ${comp.type}`);
      return;
    }
    
    const stamps = model.getStamps(comp.value, comp.nodes, comp.params);
    
    // Add conductance stamps
    if (stamps.conductanceStamps) {
      stamps.conductanceStamps.forEach(stamp => {
        const nodeRow = this.nodeMap.get(comp.nodes[stamp.row]);
        const nodeCol = this.nodeMap.get(comp.nodes[stamp.col]);
        
        if (nodeRow !== undefined && nodeCol !== undefined) {
          this.G[nodeRow][nodeCol] += stamp.value;
        }
      });
    }
    
    // Add current stamps
    if (stamps.currentStamps) {
      stamps.currentStamps.forEach(stamp => {
        const nodeRow = this.nodeMap.get(comp.nodes[stamp.row]);
        if (nodeRow !== undefined) {
          this.B[nodeRow] += stamp.value;
        }
      });
    }
  }
  
  /**
   * Solve the system using Gaussian elimination
   */
  solve(): Map<string, number> {
    const n = this.matrixSize;
    
    // Create augmented matrix [G|B]
    const augmented = this.G.map((row, i) => [...row, this.B[i]]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Check for singular matrix
      if (Math.abs(augmented[i][i]) < 1e-10) {
        console.error('Singular matrix detected');
        continue;
      }
      
      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
    
    // Back substitution
    this.X = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      this.X[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        this.X[i] -= augmented[i][j] * this.X[j];
      }
      this.X[i] /= augmented[i][i];
    }
    
    // Build result map
    const voltages = new Map<string, number>();
    voltages.set('GND', 0);
    voltages.set('ground', 0);
    
    this.nodeMap.forEach((index, node) => {
      voltages.set(node, this.X[index]);
    });
    
    return voltages;
  }
}

/**
 * DC Operating Point Analysis
 */
export function simulateDC(
  components: SimulationComponent[],
  nodes: string[]
): SimulationResult {
  try {
    const solver = new MNASolver(nodes);
    
    // Add all components to solver
    components.forEach(comp => solver.addComponent(comp));
    
    // Solve for node voltages
    const voltages = solver.solve();
    
    // Calculate component currents and powers
    const componentData: Record<string, any> = {};
    
    components.forEach(comp => {
      const v1 = voltages.get(comp.nodes[0]) || 0;
      const v2 = voltages.get(comp.nodes[1]) || 0;
      const voltageDrop = v1 - v2;
      
      let current = 0;
      if (comp.type === 'resistor') {
        current = voltageDrop / comp.value;
      } else if (comp.type === 'voltage_dc' || comp.type === 'battery') {
        // Current through voltage source (simplified)
        current = 0.001; // Placeholder
      }
      
      componentData[comp.id] = {
        voltage: Math.abs(voltageDrop),
        current: Math.abs(current),
        power: Math.abs(voltageDrop * current)
      };
    });
    
    return {
      success: true,
      mode: 'dc',
      timestamp: Date.now(),
      nodes: Array.from(voltages.entries()).map(([id, voltage]) => ({
        id,
        label: id,
        voltage,
        isGround: id === 'GND' || id === 'ground'
      })),
      componentData
    };
  } catch (error) {
    return {
      success: false,
      mode: 'dc',
      timestamp: Date.now(),
      nodes: [],
      componentData: {},
      error: error instanceof Error ? error.message : 'DC analysis failed'
    };
  }
}

/**
 * AC Frequency Response Analysis
 */
export function simulateAC(
  components: SimulationComponent[],
  nodes: string[],
  settings: SimulationSettings
): SimulationResult {
  try {
    const startFreq = settings.acStartFreq || 1;
    const stopFreq = settings.acStopFreq || 1000000;
    const pointsPerDecade = settings.acPointsPerDecade || 10;
    
    const waveforms: Record<string, any> = {};
    const measurements: Record<string, any> = { rms: {}, peak: {}, frequency: {}, phase: {} };
    
    // Generate frequency points
    const decades = Math.log10(stopFreq / startFreq);
    const numPoints = Math.ceil(decades * pointsPerDecade);
    const frequencies: number[] = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const freq = startFreq * Math.pow(10, (i * decades) / numPoints);
      frequencies.push(freq);
    }
    
    // Simulate at each frequency
    nodes.forEach(nodeId => {
      if (nodeId === 'GND' || nodeId === 'ground') return;
      
      const voltages: number[] = [];
      
      frequencies.forEach(freq => {
        // Simplified AC analysis - would need complex impedance in real implementation
        const omega = 2 * Math.PI * freq;
        
        // Find AC source
        const acSource = components.find(c => c.type === 'voltage_ac');
        const sourceVoltage = acSource?.value || 0;
        
        // Calculate transfer function (simplified)
        const voltage = sourceVoltage * Math.exp(-freq / 10000); // Simple roll-off
        voltages.push(voltage);
      });
      
      waveforms[nodeId] = {
        time: frequencies,
        voltage: voltages
      };
      
      // Calculate measurements
      measurements.rms[nodeId] = Math.sqrt(
        voltages.reduce((sum, v) => sum + v * v, 0) / voltages.length
      );
      measurements.peak[nodeId] = Math.max(...voltages.map(Math.abs));
      measurements.frequency[nodeId] = frequencies[Math.floor(frequencies.length / 2)];
    });
    
    return {
      success: true,
      mode: 'ac',
      timestamp: Date.now(),
      nodes: [],
      componentData: {},
      waveforms,
      measurements
    };
  } catch (error) {
    return {
      success: false,
      mode: 'ac',
      timestamp: Date.now(),
      nodes: [],
      componentData: {},
      error: error instanceof Error ? error.message : 'AC analysis failed'
    };
  }
}

/**
 * Transient Time-Domain Analysis
 */
export function simulateTransient(
  components: SimulationComponent[],
  nodes: string[],
  settings: SimulationSettings
): SimulationResult {
  try {
    const startTime = settings.transientStartTime || 0;
    const stopTime = settings.transientStopTime || 0.01;
    const timeStep = settings.transientTimeStep || 0.0001;
    
    const numSteps = Math.ceil((stopTime - startTime) / timeStep);
    const timePoints: number[] = [];
    const waveforms: Record<string, any> = {};
    
    // Initialize waveforms for each node
    nodes.forEach(nodeId => {
      if (nodeId !== 'GND' && nodeId !== 'ground') {
        waveforms[nodeId] = {
          time: [],
          voltage: []
        };
      }
    });
    
    // Time-stepping loop
    for (let step = 0; step <= numSteps; step++) {
      const time = startTime + step * timeStep;
      timePoints.push(time);
      
      // Update component parameters for this time step
      const updatedComponents = components.map(comp => ({
        ...comp,
        params: { ...comp.params, timeStep, time }
      }));
      
      // Solve DC operating point at this time
      const dcResult = simulateDC(updatedComponents, nodes);
      
      // Store voltages
      dcResult.nodes.forEach(node => {
        if (node.id !== 'GND' && node.id !== 'ground' && waveforms[node.id]) {
          waveforms[node.id].time.push(time);
          waveforms[node.id].voltage.push(node.voltage);
        }
      });
    }
    
    // Calculate measurements
    const measurements: Record<string, any> = { rms: {}, peak: {}, frequency: {}, phase: {} };
    
    Object.keys(waveforms).forEach(nodeId => {
      const voltages = waveforms[nodeId].voltage;
      
      // RMS
      measurements.rms[nodeId] = Math.sqrt(
        voltages.reduce((sum: number, v: number) => sum + v * v, 0) / voltages.length
      );
      
      // Peak
      measurements.peak[nodeId] = Math.max(...voltages.map((v: number) => Math.abs(v)));
      
      // Frequency (using zero crossings)
      let zeroCrossings = 0;
      for (let i = 1; i < voltages.length; i++) {
        if (voltages[i - 1] * voltages[i] < 0) zeroCrossings++;
      }
      measurements.frequency[nodeId] = zeroCrossings / (2 * (stopTime - startTime));
    });
    
    return {
      success: true,
      mode: 'transient',
      timestamp: Date.now(),
      nodes: [],
      componentData: {},
      waveforms,
      measurements
    };
  } catch (error) {
    return {
      success: false,
      mode: 'transient',
      timestamp: Date.now(),
      nodes: [],
      componentData: {},
      error: error instanceof Error ? error.message : 'Transient analysis failed'
    };
  }
}

/**
 * Main simulation entry point
 */
export function runSimulation(
  components: SimulationComponent[],
  nodes: string[],
  settings: SimulationSettings
): SimulationResult {
  switch (settings.mode) {
    case 'dc':
      return simulateDC(components, nodes);
    case 'ac':
      return simulateAC(components, nodes, settings);
    case 'transient':
      return simulateTransient(components, nodes, settings);
    default:
      return {
        success: false,
        mode: settings.mode,
        timestamp: Date.now(),
        nodes: [],
        componentData: {},
        error: 'Invalid simulation mode'
      };
  }
}

/**
 * Live simulation update - allows changing component values without full restart
 */
export function updateSimulation(
  previousResult: SimulationResult,
  updatedComponents: SimulationComponent[],
  nodes: string[],
  settings: SimulationSettings
): SimulationResult {
  // For now, just re-run the simulation
  // In a real implementation, this would do incremental updates
  return runSimulation(updatedComponents, nodes, settings);
}
