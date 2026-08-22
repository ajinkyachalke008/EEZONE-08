// Circuit Validation & Error Checking System

export interface ValidationError {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'short' | 'floating' | 'polarity' | 'unconnected' | 'value' | 'topology';
  message: string;
  description: string;
  fix?: string;
  componentIds: string[];
  wireIds?: string[];
  severity: 1 | 2 | 3 | 4 | 5; // 1=info, 5=critical
}

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
  from: { componentId: string; terminal: string };
  to: { componentId: string; terminal: string };
  color: string;
  netLabel?: string;
}

interface Net {
  id: string;
  label: string;
  components: { componentId: string; terminal: string }[];
  isGround: boolean;
  isPower: boolean;
}

// Build netlist from components and wires
export function buildNetlist(components: Component[], wires: Wire[]): Net[] {
  const nets: Net[] = [];
  const processedConnections = new Set<string>();

  // Create a map of connections
  const connectionMap = new Map<string, Set<string>>();

  wires.forEach(wire => {
    const fromKey = `${wire.from.componentId}:${wire.from.terminal}`;
    const toKey = `${wire.to.componentId}:${wire.to.terminal}`;

    if (!connectionMap.has(fromKey)) connectionMap.set(fromKey, new Set());
    if (!connectionMap.has(toKey)) connectionMap.set(toKey, new Set());

    connectionMap.get(fromKey)!.add(toKey);
    connectionMap.get(toKey)!.add(fromKey);
  });

  // Find all connected components (nets) using BFS
  const visited = new Set<string>();

  connectionMap.forEach((_, startKey) => {
    if (visited.has(startKey)) return;

    const netComponents: { componentId: string; terminal: string }[] = [];
    const queue = [startKey];
    visited.add(startKey);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const [componentId, terminal] = current.split(':');
      netComponents.push({ componentId, terminal });

      const connections = connectionMap.get(current) || new Set();
      connections.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }

    if (netComponents.length > 0) {
      const netId = `net-${nets.length + 1}`;
      
      // Check if this net is ground or power
      const isGround = netComponents.some(nc => {
        const comp = components.find(c => c.id === nc.componentId);
        return comp?.type === 'ground';
      });

      const isPower = netComponents.some(nc => {
        const comp = components.find(c => c.id === nc.componentId);
        if (!comp) return false;
        if (comp.type === 'voltage_dc' || comp.type === 'voltage_ac' || comp.type === 'battery' || comp.type === 'signal_generator') {
          // Only positive terminal (right or top) is the power rail!
          return nc.terminal === 'right' || nc.terminal === 'top';
        }
        return false;
      });

      // Auto-label based on type
      let label = `Node_${nets.length + 1}`;
      if (isGround) label = 'GND';
      else if (isPower) label = 'VCC';

      // Check for existing label from wires
      const wire = wires.find(w => 
        (w.from.componentId === netComponents[0].componentId && w.from.terminal === netComponents[0].terminal) ||
        (w.to.componentId === netComponents[0].componentId && w.to.terminal === netComponents[0].terminal)
      );
      if (wire?.netLabel) label = wire.netLabel;

      nets.push({
        id: netId,
        label,
        components: netComponents,
        isGround,
        isPower
      });
    }
  });

  return nets;
}

// Main validation function
export function validateCircuit(components: Component[], wires: Wire[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Build netlist for analysis
  const nets = buildNetlist(components, wires);

  // 1. Check for short circuits (power to ground with low resistance)
  errors.push(...checkShortCircuits(components, wires, nets));

  // 2. Check for floating nodes
  errors.push(...checkFloatingNodes(components, wires, nets));

  // 3. Check for reverse polarity (LEDs, capacitors, diodes)
  errors.push(...checkPolarity(components, wires));

  // 4. Check for unconnected pins
  errors.push(...checkUnconnectedPins(components, wires));

  // 5. Check for missing ground reference
  errors.push(...checkGroundReference(components, nets));

  // 6. Check for unrealistic component values
  errors.push(...checkComponentValues(components));

  // 7. Check for isolated components
  errors.push(...checkIsolatedComponents(components, wires));

  return errors.sort((a, b) => b.severity - a.severity);
}

// Check for short circuits
function checkShortCircuits(components: Component[], wires: Wire[], nets: Net[]): ValidationError[] {
  const errors: ValidationError[] = [];

  nets.forEach(net => {
    // Check if positive terminal of a voltage source connects directly to Ground
    const hasPowerPos = net.components.some(nc => {
      const comp = components.find(c => c.id === nc.componentId);
      if (!comp) return false;
      if (comp.type === 'voltage_dc' || comp.type === 'voltage_ac' || comp.type === 'battery' || comp.type === 'signal_generator') {
        return nc.terminal === 'right' || nc.terminal === 'top';
      }
      return false;
    });

    const hasGround = net.isGround;

    // Check if positive and negative terminals of the same source are on the same net
    const powerSourceIds = new Set<string>();
    let sameSourceShort = false;
    net.components.forEach(nc => {
      const comp = components.find(c => c.id === nc.componentId);
      if (comp && (comp.type === 'voltage_dc' || comp.type === 'voltage_ac' || comp.type === 'battery' || comp.type === 'signal_generator')) {
        if (powerSourceIds.has(comp.id)) {
          sameSourceShort = true;
        }
        powerSourceIds.add(comp.id);
      }
    });

    if ((hasPowerPos && hasGround) || sameSourceShort) {
      // Check if there are other loads or resistors in path
      const loadsInPath = net.components.filter(nc => {
        const comp = components.find(c => c.id === nc.componentId);
        return comp && comp.type !== 'voltage_dc' && comp.type !== 'voltage_ac' && comp.type !== 'battery' && comp.type !== 'signal_generator' && comp.type !== 'ground';
      });

      if (loadsInPath.length === 0) {
        errors.push({
          id: `short-${net.id}`,
          type: 'error',
          category: 'short',
          message: 'Short Circuit Detected',
          description: `Positive terminal of power source is connected directly to Ground or return path without a load.`,
          fix: 'Add a resistor or load between power and ground to limit current.',
          componentIds: net.components.map(nc => nc.componentId),
          wireIds: wires.filter(w => 
            net.components.some(nc => nc.componentId === w.from.componentId) &&
            net.components.some(nc => nc.componentId === w.to.componentId)
          ).map(w => w.id),
          severity: 5
        });
      }
    }
  });

  return errors;
}

// Check for floating nodes (high impedance, no DC path)
function checkFloatingNodes(components: Component[], wires: Wire[], nets: Net[]): ValidationError[] {
  const errors: ValidationError[] = [];

  nets.forEach(net => {
    // Skip ground and power nets
    if (net.isGround || net.isPower) return;

    // Check if node has a DC path to ground
    const hasResistivePathToGround = net.components.some(nc => {
      const comp = components.find(c => c.id === nc.componentId);
      return comp?.type === 'resistor' || comp?.type === 'inductor';
    });

    // Check if only connected to capacitors (AC coupled, floating DC)
    const onlyCapacitors = net.components.every(nc => {
      const comp = components.find(c => c.id === nc.componentId);
      return comp?.type === 'capacitor';
    });

    if (onlyCapacitors) {
      errors.push({
        id: `floating-${net.id}`,
        type: 'warning',
        category: 'floating',
        message: 'Floating Node Detected',
        description: `Net "${net.label}" is only connected to capacitors, creating a floating DC voltage. This can cause unpredictable behavior.`,
        fix: 'Add a resistor to ground to provide DC bias.',
        componentIds: net.components.map(nc => nc.componentId),
        severity: 3
      });
    }
  });

  return errors;
}

// Check component polarity
function checkPolarity(components: Component[], wires: Wire[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const polarizedTypes = ['led', 'diode', 'zener_diode', 'capacitor', 'battery'];

  components.forEach(comp => {
    if (!polarizedTypes.includes(comp.type)) return;

    // Find wires connected to this component
    const connectedWires = wires.filter(w => 
      w.from.componentId === comp.id || w.to.componentId === comp.id
    );

    if (connectedWires.length < 2) return;

    // For LEDs and diodes, check if anode is more positive than cathode
    if (comp.type === 'led' || comp.type === 'diode' || comp.type === 'zener_diode') {
      // This is a simplified check - in real implementation, you'd trace voltage
      // For now, just warn if connected backwards to obvious power/ground
      const anodeWire = connectedWires.find(w => w.from.componentId === comp.id && w.from.terminal === 'left');
      const cathodeWire = connectedWires.find(w => w.to.componentId === comp.id && w.to.terminal === 'right');

      // Check if anode connects to ground and cathode to power (reverse bias)
      const anodeToGround = anodeWire && components.some(c => 
        c.id === anodeWire.to.componentId && c.type === 'ground'
      );
      const cathodeToPower = cathodeWire && components.some(c =>
        c.id === cathodeWire.from.componentId && (c.type === 'voltage_dc' || c.type === 'battery')
      );

      if (anodeToGround || cathodeToPower) {
        errors.push({
          id: `polarity-${comp.id}`,
          type: 'warning',
          category: 'polarity',
          message: 'Possible Reverse Polarity',
          description: `${comp.type.toUpperCase()} may be connected in reverse. Check anode/cathode orientation.`,
          fix: 'Flip the component or reconnect wires to correct polarity.',
          componentIds: [comp.id],
          severity: 3
        });
      }
    }
  });

  return errors;
}

// Check for unconnected pins
function checkUnconnectedPins(components: Component[], wires: Wire[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const componentsRequiringConnections = [
    'transistor_npn', 'transistor_pnp', 'mosfet_n', 'mosfet_p',
    'op_amp', 'arduino_uno', 'esp32'
  ];

  components.forEach(comp => {
    if (!componentsRequiringConnections.includes(comp.type)) return;

    // Count connections to this component
    const connections = wires.filter(w =>
      w.from.componentId === comp.id || w.to.componentId === comp.id
    ).length;

    // Transistors and MOSFETs should have at least 2 connections
    if (comp.type.includes('transistor') || comp.type.includes('mosfet')) {
      if (connections < 2) {
        errors.push({
          id: `unconnected-${comp.id}`,
          type: 'warning',
          category: 'unconnected',
          message: 'Unconnected Pins',
          description: `${comp.type} has only ${connections} connection(s). Transistors typically need at least base/gate and collector/drain connections.`,
          fix: 'Connect all required pins for proper operation.',
          componentIds: [comp.id],
          severity: 3
        });
      }
    }
  });

  return errors;
}

// Check for missing ground reference
function checkGroundReference(components: Component[], nets: Net[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const hasGround = nets.some(net => net.isGround);

  if (!hasGround && components.length > 0) {
    errors.push({
      id: 'no-ground',
      type: 'error',
      category: 'topology',
      message: 'No Ground Reference',
      description: 'Circuit has no ground reference. All circuits need a common ground for voltage measurements and proper operation.',
      fix: 'Add a ground symbol to establish a voltage reference point.',
      componentIds: [],
      severity: 4
    });
  }

  return errors;
}

// Check component values
function checkComponentValues(components: Component[]): ValidationError[] {
  const errors: ValidationError[] = [];

  components.forEach(comp => {
    const value = comp.value || 0;

    // Check resistor values
    if (comp.type === 'resistor') {
      if (value < 1) {
        errors.push({
          id: `value-${comp.id}`,
          type: 'warning',
          category: 'value',
          message: 'Unusually Low Resistance',
          description: `Resistor value of ${value}Ω is very low and may cause excessive current.`,
          fix: 'Increase resistor value or verify if this is intentional.',
          componentIds: [comp.id],
          severity: 3
        });
      } else if (value > 10000000) {
        errors.push({
          id: `value-${comp.id}`,
          type: 'info',
          category: 'value',
          message: 'Unusually High Resistance',
          description: `Resistor value of ${value}Ω is very high. Check if this is intentional.`,
          fix: 'Verify resistor value is correct.',
          componentIds: [comp.id],
          severity: 1
        });
      }
    }

    // Check capacitor values
    if (comp.type === 'capacitor') {
      if (value > 10000) {
        errors.push({
          id: `value-${comp.id}`,
          type: 'info',
          category: 'value',
          message: 'Large Capacitor Value',
          description: `Capacitor value of ${value}μF is quite large. Verify this is intentional.`,
          fix: 'Check capacitor value and voltage rating.',
          componentIds: [comp.id],
          severity: 1
        });
      }
    }

    // Check voltage source values
    if (comp.type === 'voltage_dc' || comp.type === 'battery') {
      if (value > 50) {
        errors.push({
          id: `value-${comp.id}`,
          type: 'warning',
          category: 'value',
          message: 'High Voltage Warning',
          description: `Voltage source of ${value}V is quite high. Ensure all components are rated for this voltage.`,
          fix: 'Verify voltage rating and component specifications.',
          componentIds: [comp.id],
          severity: 2
        });
      }
    }
  });

  return errors;
}

// Check for isolated components
function checkIsolatedComponents(components: Component[], wires: Wire[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const ignoredTypes = ['ground', 'probe'];

  components.forEach(comp => {
    if (ignoredTypes.includes(comp.type)) return;

    const connections = wires.filter(w =>
      w.from.componentId === comp.id || w.to.componentId === comp.id
    ).length;

    if (connections === 0) {
      errors.push({
        id: `isolated-${comp.id}`,
        type: 'warning',
        category: 'unconnected',
        message: 'Isolated Component',
        description: `${comp.type} is not connected to any other components.`,
        fix: 'Connect this component with wires to include it in the circuit.',
        componentIds: [comp.id],
        severity: 2
      });
    }
  });

  return errors;
}

// Auto-generate net labels
export function autoLabelNets(wires: Wire[], components: Component[]): Wire[] {
  const nets = buildNetlist(components, wires);
  
  return wires.map(wire => {
    // Find which net this wire belongs to
    const net = nets.find(n =>
      n.components.some(nc =>
        (nc.componentId === wire.from.componentId && nc.terminal === wire.from.terminal) ||
        (nc.componentId === wire.to.componentId && nc.terminal === wire.to.terminal)
      )
    );

    if (net && !wire.netLabel) {
      return { ...wire, netLabel: net.label };
    }

    return wire;
  });
}
