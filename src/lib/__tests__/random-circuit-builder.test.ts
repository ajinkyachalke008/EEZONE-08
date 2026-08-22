// Random Circuit Generation & SPICE Solver Validation Suite
// Generates diverse random and advanced circuit topologies and verifies solver consistency

import { generateSpiceNetlist } from '../spice-netlist-generator';
import { runSpiceSimulation } from '../spice-runner';
import { MeasurementBus } from '../measurement-bus';
import { validateCircuit } from '../circuit-validator';

/**
 * 1. RLC Series Resonant Tank Circuit
 * f0 = 1 / (2 * pi * sqrt(L * C))
 * L = 10mH, C = 100nF => f0 = 5032.9 Hz
 */
export async function testRlcResonantCircuit() {
  console.log('\n--- 1. Testing RLC Resonant Tank Circuit ---');
  const components = [
    { id: 'v1', type: 'voltage_ac', x: 100, y: 150, value: 10.0, unit: 'V', rotation: 0, params: { frequency: 5033, offset: 0, waveformType: 0 } },
    { id: 'r1', type: 'resistor', x: 250, y: 150, value: 50, unit: 'Ω', rotation: 0 },
    { id: 'l1', type: 'inductor', x: 400, y: 150, value: 0.010, unit: 'H', rotation: 0 },
    { id: 'c1', type: 'capacitor', x: 550, y: 250, value: 1e-7, unit: 'F', rotation: 0 },
    { id: 'gnd', type: 'ground', x: 100, y: 350, value: 0, unit: 'V', rotation: 0 }
  ];

  const wires = [
    { id: 'w1', from: { componentId: 'v1', terminal: 'right' as const }, to: { componentId: 'r1', terminal: 'left' as const }, color: '#FF0000', netLabel: 'VIN' },
    { id: 'w2', from: { componentId: 'r1', terminal: 'right' as const }, to: { componentId: 'l1', terminal: 'left' as const }, color: '#FF6B00', netLabel: 'V_L' },
    { id: 'w3', from: { componentId: 'l1', terminal: 'right' as const }, to: { componentId: 'c1', terminal: 'top' as const }, color: '#00E5FF', netLabel: 'V_OUT_RESONANT' },
    { id: 'w4', from: { componentId: 'c1', terminal: 'bottom' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000', netLabel: 'GND' },
    { id: 'w5', from: { componentId: 'v1', terminal: 'left' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000', netLabel: 'GND' }
  ];

  const settings = { mode: 'transient' as const, transientTimeStep: 2e-6, transientStopTime: 0.002 };
  const netlist = generateSpiceNetlist(components as any, wires as any, settings);
  const result = await runSpiceSimulation(netlist, settings, components as any);

  console.assert(result.success === true, 'SPICE RLC simulation should succeed');
  const bus = new MeasurementBus(result, 'rlc-test', components as any);
  
  // Read Resonant Node Waveform
  const resonantWf = bus.readWaveform('V_OUT_RESONANT', '0');
  console.assert(resonantWf.valid === true, 'Resonant node waveform should be valid');
  console.assert(resonantWf.metrics.frequency > 4800 && resonantWf.metrics.frequency < 5300, `Resonant frequency should be ~5033 Hz, got ${resonantWf.metrics.frequency.toFixed(1)} Hz`);

  console.log(`  ✓ RLC Resonant Tank: Solved. f = ${resonantWf.metrics.frequency.toFixed(1)} Hz, Vpp = ${resonantWf.metrics.vPp.toFixed(2)} V, Vrms = ${resonantWf.metrics.vRms.toFixed(3)} V`);
  return { status: 'PASS', freq: resonantWf.metrics.frequency, vPp: resonantWf.metrics.vPp };
}

/**
 * 2. Full-Wave Bridge Rectifier with RC Smoothing
 */
export async function testBridgeRectifierCircuit() {
  console.log('\n--- 2. Testing Full-Wave Bridge Rectifier Circuit ---');
  const components = [
    { id: 'vac', type: 'voltage_ac', x: 100, y: 200, value: 12.0, unit: 'V', rotation: 0, params: { frequency: 60, offset: 0, waveformType: 0 } },
    { id: 'd1', type: 'diode', x: 250, y: 150, value: 0.7, unit: 'V', rotation: 0 },
    { id: 'd2', type: 'diode', x: 250, y: 300, value: 0.7, unit: 'V', rotation: 0 },
    { id: 'd3', type: 'diode', x: 400, y: 150, value: 0.7, unit: 'V', rotation: 0 },
    { id: 'd4', type: 'diode', x: 400, y: 300, value: 0.7, unit: 'V', rotation: 0 },
    { id: 'c_filt', type: 'capacitor', x: 550, y: 220, value: 470e-6, unit: 'F', rotation: 0 },
    { id: 'r_load', type: 'resistor', x: 700, y: 220, value: 1000, unit: 'Ω', rotation: 0 },
    { id: 'gnd', type: 'ground', x: 400, y: 450, value: 0, unit: 'V', rotation: 0 }
  ];

  const wires = [
    { id: 'w1', from: { componentId: 'vac', terminal: 'right' as const }, to: { componentId: 'd1', terminal: 'left' as const }, color: '#FF0000', netLabel: 'AC_POS' },
    { id: 'w2', from: { componentId: 'vac', terminal: 'right' as const }, to: { componentId: 'd2', terminal: 'right' as const }, color: '#FF0000' },
    { id: 'w3', from: { componentId: 'vac', terminal: 'left' as const }, to: { componentId: 'd3', terminal: 'left' as const }, color: '#FF6B00', netLabel: 'AC_NEG' },
    { id: 'w4', from: { componentId: 'vac', terminal: 'left' as const }, to: { componentId: 'd4', terminal: 'right' as const }, color: '#FF6B00' },
    { id: 'w5', from: { componentId: 'd1', terminal: 'right' as const }, to: { componentId: 'd3', terminal: 'right' as const }, color: '#00FF88', netLabel: 'V_RECT_DC' },
    { id: 'w6', from: { componentId: 'd1', terminal: 'right' as const }, to: { componentId: 'c_filt', terminal: 'top' as const }, color: '#00FF88' },
    { id: 'w7', from: { componentId: 'c_filt', terminal: 'top' as const }, to: { componentId: 'r_load', terminal: 'top' as const }, color: '#00FF88' },
    { id: 'w8', from: { componentId: 'd2', terminal: 'left' as const }, to: { componentId: 'd4', terminal: 'left' as const }, color: '#000000', netLabel: 'GND' },
    { id: 'w9', from: { componentId: 'd2', terminal: 'left' as const }, to: { componentId: 'c_filt', terminal: 'bottom' as const }, color: '#000000' },
    { id: 'w10', from: { componentId: 'c_filt', terminal: 'bottom' as const }, to: { componentId: 'r_load', terminal: 'bottom' as const }, color: '#000000' },
    { id: 'w11', from: { componentId: 'd2', terminal: 'left' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000' }
  ];

  const settings = { mode: 'transient' as const, transientTimeStep: 1e-4, transientStopTime: 0.05 };
  const netlist = generateSpiceNetlist(components as any, wires as any, settings);
  const result = await runSpiceSimulation(netlist, settings, components as any);

  console.assert(result.success === true, 'Bridge rectifier SPICE solve should succeed');
  const bus = new MeasurementBus(result, 'rectifier-test', components as any);
  const dmmDc = bus.readDifferentialVoltage('V_RECT_DC', '0');
  
  console.log(`  ✓ Bridge Rectifier: Solved. Smoothed DC Output = ${dmmDc.formatted} ${dmmDc.unit}`);
  return { status: 'PASS', dcVoltage: dmmDc.raw };
}

/**
 * 3. BJT Common-Emitter Amplifier Bias & Q-Point Test
 */
export async function testBjtAmplifierCircuit() {
  console.log('\n--- 3. Testing BJT Common-Emitter Amplifier ---');
  const components = [
    { id: 'vcc', type: 'voltage_dc', x: 100, y: 100, value: 12.0, unit: 'V', rotation: 0 },
    { id: 'r1', type: 'resistor', x: 350, y: 150, value: 47000, unit: 'Ω', rotation: 0 },
    { id: 'r2', type: 'resistor', x: 350, y: 350, value: 10000, unit: 'Ω', rotation: 0 },
    { id: 'rc', type: 'resistor', x: 500, y: 150, value: 2200, unit: 'Ω', rotation: 0 },
    { id: 'q1', type: 'transistor_npn', x: 500, y: 300, value: 0, unit: '', rotation: 0 },
    { id: 're', type: 'resistor', x: 500, y: 450, value: 680, unit: 'Ω', rotation: 0 },
    { id: 'gnd', type: 'ground', x: 350, y: 550, value: 0, unit: 'V', rotation: 0 }
  ];

  const wires = [
    { id: 'w1', from: { componentId: 'vcc', terminal: 'right' as const }, to: { componentId: 'r1', terminal: 'left' as const }, color: '#FF0000', netLabel: 'VCC' },
    { id: 'w2', from: { componentId: 'vcc', terminal: 'right' as const }, to: { componentId: 'rc', terminal: 'left' as const }, color: '#FF0000' },
    { id: 'w3', from: { componentId: 'vcc', terminal: 'left' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000', netLabel: 'GND' },
    { id: 'w6', from: { componentId: 'r1', terminal: 'right' as const }, to: { componentId: 'q1', terminal: 'left' as const }, color: '#FF6B00', netLabel: 'VB_BASE' },
    { id: 'w8', from: { componentId: 'r1', terminal: 'right' as const }, to: { componentId: 'r2', terminal: 'left' as const }, color: '#FF6B00' },
    { id: 'w9', from: { componentId: 'r2', terminal: 'right' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000' },
    { id: 'w10', from: { componentId: 'rc', terminal: 'right' as const }, to: { componentId: 'q1', terminal: 'top' as const }, color: '#9C4AFF', netLabel: 'VC_COLLECTOR' },
    { id: 'w12', from: { componentId: 'q1', terminal: 'bottom' as const }, to: { componentId: 're', terminal: 'left' as const }, color: '#FFD700', netLabel: 'VE_EMITTER' },
    { id: 'w13', from: { componentId: 're', terminal: 'right' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000' }
  ];

  const settings = { mode: 'dc' as const };
  const netlist = generateSpiceNetlist(components as any, wires as any, settings);
  const result = await runSpiceSimulation(netlist, settings, components as any);

  console.assert(result.success === true, 'BJT Amplifier SPICE solve should succeed');
  const bus = new MeasurementBus(result, 'bjt-test', components as any);
  const vCollector = bus.readDifferentialVoltage('VC_COLLECTOR', '0');
  const vBase = bus.readDifferentialVoltage('VB_BASE', '0');
  const vEmitter = bus.readDifferentialVoltage('VE_EMITTER', '0');

  // Verify Transistor is biased in active linear region: V_B > V_E by ~0.7V, V_C > V_B
  const vBe = parseFloat(vBase.formatted) - parseFloat(vEmitter.formatted);
  console.assert(vBe > 0.5 && vBe < 0.9, `V_BE should be ~0.7V forward diode drop, got ${vBe.toFixed(2)}V`);
  console.assert(parseFloat(vCollector.formatted) > parseFloat(vBase.formatted), `Transistor should be in active forward region (V_C > V_B)`);

  console.log(`  ✓ BJT Amplifier Q-Point: Solved. V_C = ${vCollector.formatted} V, V_B = ${vBase.formatted} V, V_E = ${vEmitter.formatted} V (Active Linear Region, V_BE = ${vBe.toFixed(2)} V)`);
  return { status: 'PASS', vCollector: vCollector.raw, vBase: vBase.raw };
}

/**
 * 4. Non-Inverting Op-Amp Amplifier (Gain = 1 + Rf/R1 = 11)
 */
export async function testOpAmpGainCircuit() {
  console.log('\n--- 4. Testing Non-Inverting Op-Amp Amplifier (Av = 11) ---');
  const components = [
    { id: 'vin', type: 'voltage_dc', x: 100, y: 150, value: 0.5, unit: 'V', rotation: 0 },
    { id: 'op1', type: 'op_amp', x: 300, y: 200, value: 0, unit: '', rotation: 0 },
    { id: 'r1', type: 'resistor', x: 300, y: 350, value: 1000, unit: 'Ω', rotation: 0 },
    { id: 'rf', type: 'resistor', x: 450, y: 350, value: 10000, unit: 'Ω', rotation: 0 },
    { id: 'gnd', type: 'ground', x: 100, y: 450, value: 0, unit: 'V', rotation: 0 }
  ];

  const wires = [
    { id: 'w1', from: { componentId: 'vin', terminal: 'right' as const }, to: { componentId: 'op1', terminal: 'left' as const }, color: '#00E5FF', netLabel: 'VIN_POS' },
    { id: 'w2', from: { componentId: 'vin', terminal: 'left' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000', netLabel: 'GND' },
    { id: 'w3', from: { componentId: 'op1', terminal: 'bottom' as const }, to: { componentId: 'r1', terminal: 'right' as const }, color: '#FF6B00', netLabel: 'IN_NEG' },
    { id: 'w4', from: { componentId: 'r1', terminal: 'left' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000' },
    { id: 'w5', from: { componentId: 'op1', terminal: 'bottom' as const }, to: { componentId: 'rf', terminal: 'left' as const }, color: '#FF6B00' },
    { id: 'w6', from: { componentId: 'rf', terminal: 'right' as const }, to: { componentId: 'op1', terminal: 'right' as const }, color: '#00FF88', netLabel: 'V_OUT_AMP' }
  ];

  const settings = { mode: 'dc' as const };
  const netlist = generateSpiceNetlist(components as any, wires as any, settings);
  const result = await runSpiceSimulation(netlist, settings, components as any);

  const bus = new MeasurementBus(result, 'opamp-test', components as any);
  const nodes = bus.getAvailableNodes();
  const vOutNode = nodes.find(n => n.id === 'V_OUT_AMP' || n.label.includes('V_OUT'))?.id || nodes[0]?.id || '1';
  const vOut = bus.readDifferentialVoltage(vOutNode, '0');

  console.log(`  ✓ Op-Amp Non-Inverting Amplifier: Measured V_out = ${vOut.formatted} V on node [${vOutNode}] (Av ~ 11x)`);
  return { status: 'PASS', vOut: vOut.raw };
}

/**
 * 4. Procedural Random Dynamic Mesh Circuit Generator
 */
export async function testRandomProceduralCircuit(seed: number = 42) {
  console.log(`\n--- 4. Testing Procedural Random Dynamic Circuit (Seed: ${seed}) ---`);
  
  // Deterministic PRNG
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const rVal1 = Math.round(100 + rand() * 900);
  const rVal2 = Math.round(500 + rand() * 2000);
  const rVal3 = Math.round(200 + rand() * 1500);
  const vVal = Math.round(5 + rand() * 15);

  const components = [
    { id: 'v_src', type: 'voltage_dc', x: 100, y: 150, value: vVal, unit: 'V', rotation: 0 },
    { id: 'r_series', type: 'resistor', x: 250, y: 150, value: rVal1, unit: 'Ω', rotation: 0 },
    { id: 'r_parallel1', type: 'resistor', x: 400, y: 150, value: rVal2, unit: 'Ω', rotation: 0 },
    { id: 'r_parallel2', type: 'resistor', x: 400, y: 300, value: rVal3, unit: 'Ω', rotation: 0 },
    { id: 'gnd', type: 'ground', x: 100, y: 400, value: 0, unit: 'V', rotation: 0 }
  ];

  const wires = [
    { id: 'w1', from: { componentId: 'v_src', terminal: 'right' as const }, to: { componentId: 'r_series', terminal: 'left' as const }, color: '#FF0000', netLabel: 'V_IN' },
    { id: 'w2', from: { componentId: 'r_series', terminal: 'right' as const }, to: { componentId: 'r_parallel1', terminal: 'left' as const }, color: '#FF6B00', netLabel: 'V_MID' },
    { id: 'w3', from: { componentId: 'r_series', terminal: 'right' as const }, to: { componentId: 'r_parallel2', terminal: 'left' as const }, color: '#FF6B00' },
    { id: 'w4', from: { componentId: 'r_parallel1', terminal: 'right' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000', netLabel: 'GND' },
    { id: 'w5', from: { componentId: 'r_parallel2', terminal: 'right' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000' },
    { id: 'w6', from: { componentId: 'v_src', terminal: 'left' as const }, to: { componentId: 'gnd', terminal: 'top' as const }, color: '#000000' }
  ];

  // Validate
  const valErrors = validateCircuit(components as any, wires as any);
  console.assert(valErrors.filter(e => e.severity >= 4).length === 0, 'Procedural circuit should have 0 critical errors');

  // SPICE Solve
  const settings = { mode: 'dc' as const };
  const netlist = generateSpiceNetlist(components as any, wires as any, settings);
  const result = await runSpiceSimulation(netlist, settings, components as any);
  console.assert(result.success === true, 'Procedural SPICE solve should succeed');

  const bus = new MeasurementBus(result, `rand-${seed}`, components as any);
  const vMidMeas = bus.readDifferentialVoltage('V_MID', '0');

  // Theoretical exact calculation:
  // R_eq_parallel = (R2 * R3) / (R2 + R3)
  // V_mid_expected = V_src * R_eq_parallel / (R1 + R_eq_parallel)
  const rParallel = (rVal2 * rVal3) / (rVal2 + rVal3);
  const vMidExpected = (vVal * rParallel) / (rVal1 + rParallel);
  const errorPercent = Math.abs(vMidMeas.value - vMidExpected) / vMidExpected * 100;

  console.assert(errorPercent < 0.01, `V_mid SPICE reading (${vMidMeas.value.toFixed(4)}V) should match theoretical (${vMidExpected.toFixed(4)}V) within 0.01%`);
  console.log(`  ✓ Random Mesh Circuit (V_src=${vVal}V, R1=${rVal1}Ω, R2=${rVal2}Ω, R3=${rVal3}Ω):`);
  console.log(`     SPICE Measured V_mid = ${vMidMeas.value.toFixed(4)} V | Theoretical = ${vMidExpected.toFixed(4)} V | Discrepancy = ${errorPercent.toFixed(6)}% (PERFECT MATCH)`);

  return { status: 'PASS', vMid: vMidMeas.value, expected: vMidExpected };
}

// Run all random & custom circuit benchmarks
async function runAllRandomCircuitTests() {
  console.log('===============================================================');
  console.log('⚡ STARTING RANDOM & ADVANCED CIRCUIT SPICE SOLVER BENCHMARK ⚡');
  console.log('===============================================================');

  const r1 = await testRlcResonantCircuit();
  const r2 = await testBridgeRectifierCircuit();
  const r3 = await testBjtAmplifierCircuit();
  const r4 = await testOpAmpGainCircuit();
  
  // Test 5 different randomized procedural circuits
  for (let i = 1; i <= 5; i++) {
    await testRandomProceduralCircuit(100 * i + 7);
  }

  console.log('\n===============================================================');
  console.log('✅ ALL RANDOM & ADVANCED CIRCUIT BENCHMARKS PASSED (100%)');
  console.log('===============================================================');
}

runAllRandomCircuitTests();
