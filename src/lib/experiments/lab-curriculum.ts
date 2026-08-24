export interface LabExperiment {
  id: string;
  code: string;
  title: string;
  category: 'Electrical Machines' | 'Power Systems' | 'Microprocessors' | 'Digital Electronics' | 'Embedded IoT' | 'Analog Circuits' | 'Power Electronics & Control';
  aim: string;
  theory: string;
  apparatus: string[];
  procedure: string[];
  precautions?: string[];
  formulae: { label: string; formula: string }[];
  defaultObservations: { [key: string]: number | string }[];
  columns: { key: string; label: string; unit: string }[];
  graphConfig?: {
    xKey: string;
    xLabel: string;
    yKey: string;
    yLabel: string;
    title: string;
  };
  vivaQuestions?: { question: string; answer: string }[];
  toolLink: string;
}

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp-1',
    code: 'EE-301',
    title: 'Speed Control of DC Shunt Motor by Armature & Field Resistance Methods',
    category: 'Electrical Machines',
    aim: 'To determine the speed-armature voltage and speed-field current characteristics of a DC Shunt Motor and plot the curves.',
    theory: 'The speed equation of a DC motor is given by N = (V - Ia * Ra) / (k * Phi). Speed can be varied below rated base speed by adding external resistance in series with the armature (Armature Control), and above rated speed by weakening the field flux using field rheostat (Field Control).',
    apparatus: [
      'DC Shunt Motor (220V, 5HP, 1500 RPM)',
      'Field Rheostat (0-500Ω, 2A wire-wound)',
      'Armature Rheostat (0-10Ω, 20A wire-wound)',
      '4-Point DC Motor Starter with No-Volt & Overload Release',
      'DC Ammeters (0-2A MC, 0-20A MC)',
      'DC Voltmeter (0-300V MC)',
      'Digital Non-Contact Optical Tachometer'
    ],
    procedure: [
      'Connect the circuit as per schematic diagram with the 4-point starter.',
      'Check that the field rheostat is set to minimum resistance and armature rheostat to maximum resistance.',
      'Close the main DPST switch and bring the motor to rated speed using the starter handle.',
      'Field Control (Above rated speed): Keep armature voltage constant at 220V. Increase field resistance gradually, decrease If, and record speed N.',
      'Armature Control (Below rated speed): Keep field current constant at rated value (1.1A). Vary armature rheostat to reduce Va and record speed N.',
      'Plot graphs of Speed (N) vs Field Current (If) and Speed (N) vs Armature Voltage (Va).'
    ],
    precautions: [
      'Never open the field circuit while the motor is running, as flux approaches zero causing dangerous runaway overspeeding.',
      'Ensure proper grounding of the motor frame before switching ON power.',
      'Do not touch rotating shafts or couplings.'
    ],
    formulae: [
      { label: 'Back EMF (Eb)', formula: 'Eb = V - Ia * Ra' },
      { label: 'Speed Relation', formula: 'N ∝ Eb / Φ' },
      { label: 'Torque Equation', formula: 'T = (P * Φ * z * Ia) / (2π * A)' }
    ],
    columns: [
      { key: 'obs', label: 'Obs #', unit: '' },
      { key: 'if', label: 'Field Current (If)', unit: 'A' },
      { key: 'ra', label: 'Armature Res (Ra)', unit: 'Ω' },
      { key: 'v', label: 'Armature Voltage (V)', unit: 'V' },
      { key: 'ia', label: 'Armature Current (Ia)', unit: 'A' },
      { key: 'speed', label: 'Motor Speed (N)', unit: 'RPM' }
    ],
    defaultObservations: [
      { obs: 1, if: 1.10, ra: 0.5, v: 220, ia: 5.2, speed: 1500 },
      { obs: 2, if: 0.95, ra: 0.5, v: 220, ia: 5.4, speed: 1650 },
      { obs: 3, if: 0.80, ra: 0.5, v: 220, ia: 5.8, speed: 1820 },
      { obs: 4, if: 0.70, ra: 0.5, v: 220, ia: 6.2, speed: 1980 },
      { obs: 5, if: 1.10, ra: 2.0, v: 210, ia: 5.1, speed: 1380 },
      { obs: 6, if: 1.10, ra: 4.5, v: 195, ia: 4.9, speed: 1210 }
    ],
    graphConfig: {
      xKey: 'if',
      xLabel: 'Field Current (A)',
      yKey: 'speed',
      yLabel: 'Speed (RPM)',
      title: 'Speed vs Field Current (Field Weakening Characteristic)'
    },
    vivaQuestions: [
      { question: 'Why does speed increase when field current is decreased?', answer: 'Reducing field current decreases the magnetic flux Φ. Since back EMF cannot change instantaneously, the motor draws more armature current, producing higher torque and accelerating until back EMF balances the new flux level at a higher speed.' },
      { question: 'Why is armature resistance speed control inefficient?', answer: 'A large amount of power (Ia² * Rext) is wasted as heat in the external armature rheostat, leading to poor overall motor efficiency.' }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-2',
    code: 'EE-302',
    title: 'Open-Circuit & Short-Circuit Tests on Single-Phase Transformer',
    category: 'Electrical Machines',
    aim: 'To conduct OC and SC tests on a single-phase transformer to determine equivalent circuit parameters, predetermine efficiency, and voltage regulation.',
    theory: 'The Open Circuit (OC) test is conducted on the Low Voltage (LV) side with the High Voltage (HV) side open to determine core iron loss (Pi) and magnetizing branch parameters (R0, X0). The Short Circuit (SC) test is conducted on the HV side with LV shorted at reduced voltage to determine full-load copper loss (Psc) and equivalent winding impedance (Req, Xeq).',
    apparatus: [
      'Single-Phase Step-Down Transformer (5 kVA, 230V/115V, 50Hz)',
      '1-Phase Variac / Auto-transformer (0-270V, 15A)',
      'AC Digital Voltmeters (0-300V, 0-150V)',
      'AC Digital Ammeters (0-5A, 0-25A)',
      'Low Power Factor (LPF) Wattmeter (300V, 5A, cosΦ=0.2)',
      'Unity Power Factor (UPF) Wattmeter (150V, 25A, cosΦ=1.0)'
    ],
    procedure: [
      'OC Test: Connect meters on LV side (230V) with HV open. Apply rated voltage using variac. Record V0, I0, and W0.',
      'SC Test: Short-circuit the LV terminals with thick copper wire. Apply reduced voltage to HV until rated current flows. Record Vsc, Isc, and Wsc.',
      'Calculate R0, X0, Req, Xeq, efficiency at 25%, 50%, 75%, 100% load at 0.8 PF lagging, and % voltage regulation.'
    ],
    formulae: [
      { label: 'Core Iron Loss (Pi)', formula: 'Pi = W0' },
      { label: 'Full-Load Copper Loss (Pcu)', formula: 'Pcu = Wsc * (x)^2' },
      { label: 'Efficiency (η)', formula: 'η = (x * S * cosΦ) / (x * S * cosΦ + Pi + x² * Pcu) * 100' },
      { label: '% Voltage Regulation', formula: '% Reg = (I2*Req*cosΦ ± I2*Xeq*sinΦ) / V2 * 100' }
    ],
    columns: [
      { key: 'load', label: 'Load Fraction (x)', unit: '%' },
      { key: 'pf', label: 'Power Factor', unit: '' },
      { key: 'pout', label: 'Output Power', unit: 'kW' },
      { key: 'loss', label: 'Total Losses', unit: 'W' },
      { key: 'eta', label: 'Efficiency (η)', unit: '%' },
      { key: 'reg', label: '% Voltage Regulation', unit: '%' }
    ],
    defaultObservations: [
      { load: '25%', pf: 0.85, pout: 1.06, loss: 95, eta: 91.8, reg: 1.2 },
      { load: '50%', pf: 0.85, pout: 2.12, loss: 125, eta: 94.4, reg: 2.1 },
      { load: '75%', pf: 0.85, pout: 3.19, loss: 175, eta: 94.8, reg: 3.0 },
      { load: '100%', pf: 0.85, pout: 4.25, loss: 245, eta: 94.5, reg: 3.9 },
      { load: '120%', pf: 0.85, pout: 5.10, loss: 315, eta: 93.8, reg: 4.8 }
    ],
    graphConfig: {
      xKey: 'load',
      xLabel: 'Load Percentage (%)',
      yKey: 'eta',
      yLabel: 'Efficiency (%)',
      title: 'Transformer Efficiency vs Load Curve'
    },
    vivaQuestions: [
      { question: 'Why is an LPF wattmeter used in the OC test?', answer: 'In the OC test, the no-load current is primarily magnetizing current, which lags voltage by almost 75° to 85° (very low power factor, ~0.1-0.2). Standard wattmeters produce negligible torque and huge errors at low power factors.' },
      { question: 'What is the condition for maximum transformer efficiency?', answer: 'Maximum efficiency occurs when variable copper loss equals constant core iron loss: x² * Pcu = Pi.' }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-3',
    code: 'EE-303',
    title: 'Measurement of 3-Phase Active & Reactive Power by Two-Wattmeter Method',
    category: 'Power Systems',
    aim: 'To measure active power, reactive power, and determine the operating power factor of a 3-phase balanced inductive load using two wattmeters.',
    theory: 'In a 3-phase 3-wire star/delta system, total active power P = W1 + W2. Total reactive power Q = √3 * (W1 - W2). The power factor angle is calculated from tan(Φ) = √3 * (W1 - W2) / (W1 + W2).',
    apparatus: [
      '3-Phase 415V, 50Hz AC Power Supply',
      'Two 1-Phase Electrodynamometer Wattmeters (500V, 10A, UPF)',
      '3-Phase Balanced Variable R-L Load Bank (0-10 kW, 0-10 kVAR)',
      '3-Phase Digital Voltmeter (0-500V AC)',
      '3-Phase Digital Ammeter (0-20A AC)'
    ],
    procedure: [
      'Connect the current coil of W1 in R-phase and W2 in B-phase.',
      'Connect the pressure coil common terminals of both wattmeters to the Y-phase (reference line).',
      'Switch ON the 3-phase supply and adjust the R-L load in equal steps.',
      'Record readings W1, W2, line voltage VL, and line current IL for each step.',
      'Verify if W2 gives negative readings when power factor drops below 0.5 lagging.'
    ],
    formulae: [
      { label: 'Total Active Power (P)', formula: 'P = W1 + W2 (kW)' },
      { label: 'Total Reactive Power (Q)', formula: 'Q = √3 * (W1 - W2) (kVAR)' },
      { label: 'Phase Angle (Φ)', formula: 'Φ = arctan[ √3 * (W1 - W2) / (W1 + W2) ]' },
      { label: 'Power Factor (cosΦ)', formula: 'cosΦ = cos(Φ)' }
    ],
    columns: [
      { key: 'vl', label: 'Line Voltage (VL)', unit: 'V' },
      { key: 'il', label: 'Line Current (IL)', unit: 'A' },
      { key: 'w1', label: 'Wattmeter 1 (W1)', unit: 'kW' },
      { key: 'w2', label: 'Wattmeter 2 (W2)', unit: 'kW' },
      { key: 'ptot', label: 'Total Power (P)', unit: 'kW' },
      { key: 'pf', label: 'Power Factor', unit: '' }
    ],
    defaultObservations: [
      { vl: 415, il: 5.0, w1: 2.15, w2: 1.05, ptot: 3.20, pf: 0.89 },
      { vl: 415, il: 10.0, w1: 4.30, w2: 2.10, ptot: 6.40, pf: 0.89 },
      { vl: 415, il: 15.0, w1: 6.45, w2: 3.15, ptot: 9.60, pf: 0.89 },
      { vl: 415, il: 20.0, w1: 8.60, w2: 4.20, ptot: 12.80, pf: 0.89 }
    ],
    graphConfig: {
      xKey: 'il',
      xLabel: 'Line Current (A)',
      yKey: 'ptot',
      yLabel: 'Total Active Power (kW)',
      title: '3-Phase Active Power vs Line Current'
    },
    vivaQuestions: [
      { question: 'What happens when the load power factor is exactly 0.5 lagging?', answer: 'When cosΦ = 0.5 (Φ = 60°), W2 = V*I*cos(30+60) = 0. Thus, one wattmeter reads zero, and the entire power is measured by the other wattmeter (W1 = P).' },
      { question: 'What does a negative wattmeter reading signify?', answer: 'A negative reading indicates the power factor is below 0.5 lagging. To read the pointer, reverse either the current coil or pressure coil connections and record the value as negative.' }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-4',
    code: 'EE-304',
    title: 'Load Test and Torque-Speed Characteristics of 3-Phase Induction Motor',
    category: 'Electrical Machines',
    aim: 'To conduct a direct mechanical load test on a 3-phase squirrel cage induction motor and plot torque-speed, efficiency, and slip characteristics.',
    theory: 'The 3-phase induction motor operates on the principle of a rotating magnetic field (RMF) generated by balanced 3-phase stator currents. The rotor rotates at a speed N slightly less than synchronous speed Ns, where slip s = (Ns - N) / Ns.',
    apparatus: [
      '3-Phase Squirrel Cage Induction Motor (3HP, 415V, 1440 RPM)',
      'Direct-On-Line (DOL) / Star-Delta Starter',
      'Mechanical Eddy Current / Brake Drum Dynamometer with Spring Balances',
      '3-Phase Voltmeter & Ammeters',
      'Digital Optical Tachometer'
    ],
    procedure: [
      'Connect motor to 415V supply via Star-Delta starter with no mechanical load applied.',
      'Start the motor, measure no-load speed N0 and no-load current I0.',
      'Gradually tighten brake drum belt to load the motor in steps (S1, S2 spring balances in kg).',
      'Record line current, terminal voltage, speed, and spring balance readings at each step.',
      'Compute Torque T = (S1 - S2) * 9.81 * Drum_Radius, shaft power, and efficiency.'
    ],
    formulae: [
      { label: 'Torque (T)', formula: 'T = (S1 - S2) * 9.81 * R (N·m)' },
      { label: 'Shaft Output (Pout)', formula: 'Pout = (2π * N * T) / 60 (Watts)' },
      { label: 'Slip (s)', formula: 's = (Ns - N) / Ns * 100 (%)' },
      { label: 'Efficiency (η)', formula: 'η = Pout / Pin * 100 (%)' }
    ],
    columns: [
      { key: 's1', label: 'Spring S1', unit: 'kg' },
      { key: 's2', label: 'Spring S2', unit: 'kg' },
      { key: 'torque', label: 'Torque (T)', unit: 'N·m' },
      { key: 'speed', label: 'Rotor Speed (N)', unit: 'RPM' },
      { key: 'slip', label: 'Slip (s)', unit: '%' },
      { key: 'eta', label: 'Efficiency (η)', unit: '%' }
    ],
    defaultObservations: [
      { s1: 0.0, s2: 0.0, torque: 0.0, speed: 1490, slip: 0.67, eta: 0.0 },
      { s1: 3.5, s2: 0.5, torque: 3.68, speed: 1460, slip: 2.67, eta: 72.4 },
      { s1: 7.0, s2: 1.0, torque: 7.36, speed: 1430, slip: 4.67, eta: 81.5 },
      { s1: 10.5, s2: 1.5, torque: 11.04, speed: 1400, slip: 6.67, eta: 84.2 },
      { s1: 14.0, s2: 2.0, torque: 14.72, speed: 1360, slip: 9.33, eta: 82.0 }
    ],
    graphConfig: {
      xKey: 'torque',
      xLabel: 'Torque (N·m)',
      yKey: 'speed',
      yLabel: 'Speed (RPM)',
      title: 'Torque vs Speed Characteristic of Induction Motor'
    },
    vivaQuestions: [
      { question: 'Why cannot an induction motor run at synchronous speed?', answer: 'If the rotor ran at synchronous speed, there would be zero relative motion between the stator RMF and rotor conductors, meaning zero induced EMF, zero rotor current, and zero torque.' },
      { question: 'What is the typical slip of an induction motor at full load?', answer: 'Between 2% and 5% for industrial squirrel cage induction motors.' }
    ],
    toolLink: '/tools/electrical-machines'
  },
  {
    id: 'exp-5',
    code: 'EE-305',
    title: 'V-I Characteristics of PN Junction Diode & Zener Voltage Regulator',
    category: 'Analog Circuits',
    aim: 'To plot forward and reverse V-I characteristics of Silicon PN diode and analyze Zener breakdown voltage for voltage regulation.',
    theory: 'In forward bias, a PN diode conducts when voltage exceeds the barrier potential (~0.7V for Si). In reverse bias, leakage current remains small until Zener/Avalanche breakdown occurs, maintaining constant terminal voltage.',
    apparatus: [
      'Dual DC Variable Power Supply (0-30V, 2A)',
      'Silicon Diode (1N4007) and Zener Diode (1N4733A 5.1V)',
      'Digital Multimeters (Micro-ammeter, Milli-ammeter, Voltmeter)',
      'Current-limiting Resistors (330Ω, 1kΩ)',
      'Solderless Prototyping Breadboard'
    ],
    procedure: [
      'Forward Bias: Connect diode cathode to GND and anode via 330Ω resistor to variable supply. Increase voltage in 0.1V steps from 0V to 1.0V and record current.',
      'Reverse Bias: Reverse diode terminals and observe breakdown for Zener diode.',
      'Zener Regulator: Connect Zener in parallel with load and vary input DC voltage from 6V to 15V to verify output stabilization at 5.1V.'
    ],
    formulae: [
      { label: 'Shockley Diode Equation', formula: 'Id = Is * (e^(Vd / (n * Vt)) - 1)' },
      { label: 'Dynamic Resistance (rd)', formula: 'rd = ΔVd / ΔId' }
    ],
    columns: [
      { key: 'v_in', label: 'Input Voltage', unit: 'V' },
      { key: 'vd', label: 'Diode Voltage (Vd)', unit: 'V' },
      { key: 'id', label: 'Diode Current (Id)', unit: 'mA' },
      { key: 'state', label: 'Operating Region', unit: '' }
    ],
    defaultObservations: [
      { v_in: 0.2, vd: 0.20, id: 0.01, state: 'Cut-off' },
      { v_in: 0.5, vd: 0.48, id: 0.12, state: 'Sub-threshold' },
      { v_in: 0.7, vd: 0.64, id: 1.85, state: 'Knee Region' },
      { v_in: 1.0, vd: 0.71, id: 8.80, state: 'Linear Conduction' },
      { v_in: 2.0, vd: 0.75, id: 38.00, state: 'Active Conduction' }
    ],
    graphConfig: {
      xKey: 'vd',
      xLabel: 'Diode Voltage (V)',
      yKey: 'id',
      yLabel: 'Diode Current (mA)',
      title: 'Diode Forward V-I Characteristic Curve'
    },
    vivaQuestions: [
      { question: 'What is the difference between Avalanche and Zener breakdown?', answer: 'Zener breakdown occurs in heavily doped diodes at low reverse voltages (< 5V) via direct quantum tunneling. Avalanche breakdown occurs in lightly doped diodes at higher voltages (> 6V) via carrier multiplication by impact ionization.' }
    ],
    toolLink: '/tools/circuit-simulator'
  },
  {
    id: 'exp-6',
    code: 'EE-306',
    title: 'Verification of Thevenin\'s, Norton\'s & Maximum Power Transfer Theorems',
    category: 'Analog Circuits',
    aim: 'To verify Thevenin and Norton equivalent circuit parameters and prove that maximum power transfer occurs when load resistance equals Thevenin resistance (RL = Rth).',
    theory: 'Thevenin\'s theorem states that any linear two-terminal resistive network can be replaced by an equivalent voltage source Vth in series with Rth. Maximum power transfer occurs when RL = Rth, achieving maximum power Pmax = Vth² / (4 * Rth).',
    apparatus: [
      'Regulated DC Dual Power Supply (0-30V)',
      'Precision Resistor Decade Box & Fixed Resistors (100Ω, 220Ω, 470Ω, 1kΩ)',
      'Variable Rheostat / Potentiometer for RL',
      'Digital Precision Multimeters'
    ],
    procedure: [
      'Connect the bridge network circuit on breadboard.',
      'Remove RL and measure Open-Circuit Voltage Voc across terminals A-B to obtain Vth.',
      'Short terminals A-B through ammeter to measure Isc (Norton current IN). Compute Rth = Vth / Isc.',
      'Connect variable RL, record load voltage VL and current IL across different values of RL, and plot Power (PL = VL * IL) vs RL.'
    ],
    formulae: [
      { label: 'Thevenin Resistance (Rth)', formula: 'Rth = Vth / Isc' },
      { label: 'Load Power (PL)', formula: 'PL = IL² * RL = [Vth / (Rth + RL)]² * RL' },
      { label: 'Max Power (Pmax)', formula: 'Pmax = Vth² / (4 * Rth) (when RL = Rth)' }
    ],
    columns: [
      { key: 'rl', label: 'Load Resistor (RL)', unit: 'Ω' },
      { key: 'vl', label: 'Load Voltage (VL)', unit: 'V' },
      { key: 'il', label: 'Load Current (IL)', unit: 'mA' },
      { key: 'pl', label: 'Power Delivered (PL)', unit: 'mW' }
    ],
    defaultObservations: [
      { rl: 100, vl: 2.14, il: 21.4, pl: 45.8 },
      { rl: 220, vl: 3.82, il: 17.3, pl: 66.1 },
      { rl: 330, vl: 4.88, il: 14.8, pl: 72.2 },
      { rl: 470, vl: 5.86, il: 12.5, pl: 73.3 },
      { rl: 680, vl: 6.94, il: 10.2, pl: 70.8 },
      { rl: 1000, vl: 8.00, il: 8.0, pl: 64.0 }
    ],
    graphConfig: {
      xKey: 'rl',
      xLabel: 'Load Resistance (Ω)',
      yKey: 'pl',
      yLabel: 'Load Power (mW)',
      title: 'Maximum Power Transfer Curve (Peak at RL = Rth ≈ 470Ω)'
    },
    vivaQuestions: [
      { question: 'What is the efficiency of a circuit during maximum power transfer?', answer: 'Exactly 50%, because half the total power is dissipated internally across Rth and only half is delivered to the load RL.' }
    ],
    toolLink: '/tools/circuit-simulator'
  },
  {
    id: 'exp-7',
    code: 'EE-307',
    title: 'Series and Parallel RLC Resonance & Bandwidth Measurement',
    category: 'Analog Circuits',
    aim: 'To determine the resonant frequency fr, quality factor Q, and bandwidth BW of a series RLC circuit excited by a sinusoidal frequency generator.',
    theory: 'In a series RLC circuit, at resonant frequency fr = 1 / (2π * √(L * C)), inductive reactance XL cancels capacitive reactance XC. The total impedance is purely resistive and minimum (Z = R), resulting in maximum current Imax = V / R.',
    apparatus: [
      'Digital Function Generator (0.1 Hz - 20 MHz)',
      'Digital Storage Oscilloscope (DSO 100 MHz, 2-Channel)',
      'Inductor (10 mH), Capacitor (0.1 µF), Resistor (47Ω)',
      'BNC to Crocodile Probes'
    ],
    procedure: [
      'Connect R, L, and C components in series with the function generator output.',
      'Connect Channel 1 across generator and Channel 2 across resistor R (to measure current).',
      'Vary frequency from 1 kHz to 10 kHz in 500 Hz steps while maintaining constant generator amplitude at 5V pk-pk.',
      'Record current amplitude and plot Current vs Frequency to find f1, f2 (half-power frequencies) and fr.'
    ],
    formulae: [
      { label: 'Resonant Frequency (fr)', formula: 'fr = 1 / (2π * √(L * C))' },
      { label: 'Quality Factor (Q)', formula: 'Q = (2π * fr * L) / R = fr / BW' },
      { label: 'Bandwidth (BW)', formula: 'BW = f2 - f1 = R / (2π * L)' }
    ],
    columns: [
      { key: 'freq', label: 'Frequency (f)', unit: 'kHz' },
      { key: 'vr', label: 'Resistor Voltage', unit: 'V' },
      { key: 'i_circ', label: 'Current (I)', unit: 'mA' },
      { key: 'z_imp', label: 'Impedance (Z)', unit: 'Ω' }
    ],
    defaultObservations: [
      { freq: 2.0, vr: 0.45, i_circ: 9.5, z_imp: 526 },
      { freq: 3.5, vr: 1.25, i_circ: 26.6, z_imp: 188 },
      { freq: 5.0, vr: 4.85, i_circ: 103.2, z_imp: 48.4 },
      { freq: 6.5, vr: 1.85, i_circ: 39.4, z_imp: 127 },
      { freq: 8.0, vr: 0.65, i_circ: 13.8, z_imp: 362 }
    ],
    graphConfig: {
      xKey: 'freq',
      xLabel: 'Frequency (kHz)',
      yKey: 'i_circ',
      yLabel: 'Circuit Current (mA)',
      title: 'Series RLC Resonance Bell Curve (Peak at fr = 5.03 kHz)'
    },
    vivaQuestions: [
      { question: 'Why is series resonance called voltage resonance?', answer: 'At resonance, voltages across L and C can be Q times larger than the input source voltage (VL = VC = Q * Vin), which can be hazardous if Q is high.' }
    ],
    toolLink: '/tools/circuit-simulator'
  },
  {
    id: 'exp-8',
    code: 'EE-308',
    title: 'Inverting, Non-Inverting, and Summing Operational Amplifier Circuits',
    category: 'Analog Circuits',
    aim: 'To design, assemble and test inverting (gain = -10), non-inverting (gain = +11), and summing amplifier circuits using LM741 / TL072 op-amps.',
    theory: 'Using the two golden rules of ideal op-amps (zero input current and virtual short between inverting and non-inverting inputs), the inverting gain is Av = -Rf / R1 and non-inverting gain is Av = 1 + (Rf / R1).',
    apparatus: [
      'Dual Regulated Power Supply (±15V DC)',
      'LM741 / TL072 Operational Amplifier ICs',
      'Function Generator & Dual-Channel DSO',
      'Precision Resistors (1kΩ, 10kΩ, 100kΩ)',
      'Prototyping Breadboard'
    ],
    procedure: [
      'Wire the LM741 IC: Pin 7 to +15V, Pin 4 to -15V.',
      'Inverting mode: Connect R1 = 1kΩ to pin 2 and Rf = 10kΩ between pin 2 and pin 6. Ground pin 3.',
      'Apply 0.5V pk-pk 1kHz sine wave to input. Measure output amplitude on oscilloscope and verify 180° phase inversion and gain of 10.',
      'Reconfigure for non-inverting amplifier and verify in-phase output with gain = 1 + Rf/R1 = 11.'
    ],
    formulae: [
      { label: 'Inverting Gain', formula: 'Av = -Rf / R1' },
      { label: 'Non-Inverting Gain', formula: 'Av = 1 + (Rf / R1)' },
      { label: 'Gain-Bandwidth Product', formula: 'GBW = Gain * Bandwidth ≈ 1 MHz' }
    ],
    columns: [
      { key: 'mode', label: 'Op-Amp Config', unit: '' },
      { key: 'vin', label: 'Input Vin', unit: 'V' },
      { key: 'vout', label: 'Measured Vout', unit: 'V' },
      { key: 'gain', label: 'Actual Gain', unit: '' },
      { key: 'phase', label: 'Phase Shift', unit: 'deg' }
    ],
    defaultObservations: [
      { mode: 'Inverting (Rf=10k, R1=1k)', vin: 0.2, vout: -2.01, gain: -10.05, phase: '180°' },
      { mode: 'Inverting (Rf=10k, R1=1k)', vin: 0.5, vout: -5.02, gain: -10.04, phase: '180°' },
      { mode: 'Non-Inverting (Rf=10k, R1=1k)', vin: 0.2, vout: 2.21, gain: 11.05, phase: '0°' },
      { mode: 'Non-Inverting (Rf=10k, R1=1k)', vin: 0.5, vout: 5.51, gain: 11.02, phase: '0°' }
    ],
    graphConfig: {
      xKey: 'vin',
      xLabel: 'Input Voltage (V)',
      yKey: 'vout',
      yLabel: 'Output Voltage (V)',
      title: 'Op-Amp Transfer Characteristic (Linear Region)'
    },
    vivaQuestions: [
      { question: 'What is virtual ground in op-amps?', answer: 'Because of infinite open-loop gain and negative feedback, the potential difference between non-inverting and inverting terminals is zero. If pin 3 is grounded, pin 2 is virtually held at 0V without being physically connected to ground.' }
    ],
    toolLink: '/tools/circuit-simulator'
  },
  {
    id: 'exp-9',
    code: 'EC-401',
    title: 'Verification of Truth Tables of 74xx TTL Logic Gates & Universal NAND/NOR Realization',
    category: 'Digital Electronics',
    aim: 'To verify the truth tables of basic TTL logic gates (7408, 7432, 7404, 7486) and realize all basic gates using universal NAND (7400) and NOR (7402) ICs.',
    theory: 'Universal gates (NAND and NOR) can implement any Boolean algebraic function through combinations of De Morgan\'s laws: (A · B)\' = A\' + B\' and (A + B)\' = A\' · B\'.',
    apparatus: [
      'Digital Logic Trainer Kit with Debounced Logic Switches and LED Monitors',
      '7400 (Quad 2-input NAND), 7402 (Quad 2-input NOR), 7408 (AND), 7432 (OR), 7486 (XOR)',
      'Regulated +5V DC Power Supply',
      'Hookup Connecting Wires'
    ],
    procedure: [
      'Insert ICs into the trainer breadboard socket. Connect Pin 14 to +5V and Pin 7 to GND.',
      'Connect logic input switches to gate inputs and gate output to logic monitor LED.',
      'Cycle through input states (00, 01, 10, 11) and record logic output.',
      'Construct AND, OR, NOT functions using only NAND gates and verify truth tables.'
    ],
    formulae: [
      { label: 'AND using NAND', formula: 'Y = ((A · B)\')\'' },
      { label: 'OR using NAND', formula: 'Y = (A\' · B\')\'' },
      { label: 'XOR using NAND', formula: 'Y = A · (A·B)\' + B · (A·B)\'' }
    ],
    columns: [
      { key: 'gate', label: 'Gate Realization', unit: '' },
      { key: 'a', label: 'Input A', unit: '' },
      { key: 'b', label: 'Input B', unit: '' },
      { key: 'theo', label: 'Theoretical Output', unit: '' },
      { key: 'pract', label: 'Practical Output', unit: '' },
      { key: 'status', label: 'Verification', unit: '' }
    ],
    defaultObservations: [
      { gate: 'AND (7408)', a: 0, b: 0, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'AND (7408)', a: 0, b: 1, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'AND (7408)', a: 1, b: 0, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'AND (7408)', a: 1, b: 1, theo: 1, pract: 1, status: 'VERIFIED' },
      { gate: 'NAND-Realized OR', a: 0, b: 0, theo: 0, pract: 0, status: 'VERIFIED' },
      { gate: 'NAND-Realized OR', a: 1, b: 0, theo: 1, pract: 1, status: 'VERIFIED' }
    ],
    vivaQuestions: [
      { question: 'Why are TTL inputs considered HIGH when left floating?', answer: 'TTL inputs use multi-emitter NPN transistors. A floating input behaves as logic HIGH due to internal pull-up bias resistors, although floating inputs are prone to noise pickup.' }
    ],
    toolLink: '/tools/digital-logic'
  },
  {
    id: 'exp-10',
    code: 'EC-402',
    title: '8085 Microprocessor Assembly: Block Transfer, Arithmetic & Sorting',
    category: 'Microprocessors',
    aim: 'To write, assemble, simulate, and execute 8085 Assembly Language Programs (ALP) for 8-bit & 16-bit arithmetic, array block data transfer, and bubble sorting.',
    theory: 'The Intel 8085 is an 8-bit microprocessor with an accumulator (A), flags (S, Z, AC, P, CY), and general-purpose registers (B, C, D, E, H, L). The HL register pair acts as a 16-bit memory pointer (M).',
    apparatus: [
      'Intel 8085 Microprocessor Virtual Trainer Kit & Assembler IDE',
      'Hex Keypad Entry and 7-Segment Address/Data Display',
      'RAM Memory Map (0800H - 0FFFH User Code Space)'
    ],
    procedure: [
      'Enter memory address 0800H into trainer kit and input hex opcodes.',
      'Input data bytes at memory location 0900H.',
      'Execute program using RUN command starting from 0800H.',
      'Examine registers (A, B, C, flags) and target memory 0A00H to verify results.'
    ],
    formulae: [
      { label: '8-bit Addition', formula: 'A ← A + r + CY' },
      { label: 'Memory Addressing', formula: 'M ← [HL Pair Address]' }
    ],
    columns: [
      { key: 'addr', label: 'Memory Addr', unit: '' },
      { key: 'input_hex', label: 'Input Data', unit: 'Hex' },
      { key: 'op', label: 'Assembly Operation', unit: '' },
      { key: 'reg_a', label: 'Accumulator (A)', unit: 'Hex' },
      { key: 'flags', label: 'Flags (S-Z-CY)', unit: '' }
    ],
    defaultObservations: [
      { addr: '0900H', input_hex: '25H', op: 'MVI A, 25H', reg_a: '25H', flags: '0-0-0' },
      { addr: '0901H', input_hex: '37H', op: 'ADD B (37H)', reg_a: '5CH', flags: '0-0-0' },
      { addr: '0902H', input_hex: '92H', op: 'ADD C (92H)', reg_a: 'EEH', flags: '1-0-0' }
    ],
    vivaQuestions: [
      { question: 'What is the function of the ALE pin in 8085?', answer: 'Address Latch Enable (ALE) demultiplexes the multiplexed Address/Data bus AD0-AD7 by latching the lower 8-bit address into an external 74LS373 latch on its falling edge.' }
    ],
    toolLink: '/tools/microprocessor-8085'
  },
  {
    id: 'exp-11',
    code: 'PE-501',
    title: 'SCR & TRIAC Gate Triggering and V-I Characteristics with Phase-Controlled Lamp Dimmer',
    category: 'Power Electronics & Control',
    aim: 'To study the V-I characteristics of Silicon Controlled Rectifier (SCR), determine holding/latching currents, and implement an R-C phase angle lamp dimmer circuit.',
    theory: 'An SCR is a 4-layer (PNPN) thyristor that remains in forward blocking state until triggered by a gate pulse. Once turned ON, it stays in conduction until anode current falls below the holding current (Ih).',
    apparatus: [
      'SCR (TYN612 / 2N6508), TRIAC (BT136), DIAC (DB3)',
      'Dual Variable Power Supply & AC 230V Isolation Transformer',
      'Lamp Load (100W Incandescent) and Potentiometer (100kΩ)',
      'DSO with High-Voltage Differential Probes'
    ],
    procedure: [
      'Connect SCR in DC circuit and determine forward breakover voltage Vbo and holding current Ih.',
      'Connect TRIAC-DIAC phase control circuit to AC mains with 100W lamp load.',
      'Vary the potentiometer to adjust firing angle α from 0° to 180° and observe AC load voltage waveforms on oscilloscope.'
    ],
    formulae: [
      { label: 'RMS Output Voltage', formula: 'Vrms = Vs * √[ (1/π) * (π - α + sin(2α)/2) ]' },
      { label: 'Firing Angle (α)', formula: 'α = ω * R * C' }
    ],
    columns: [
      { key: 'alpha', label: 'Firing Angle (α)', unit: 'deg' },
      { key: 'v_load', label: 'RMS Load Voltage', unit: 'V' },
      { key: 'p_load', label: 'Lamp Power', unit: 'W' },
      { key: 'bright', label: 'Illumination %', unit: '%' }
    ],
    defaultObservations: [
      { alpha: 30, v_load: 226, p_load: 96.5, bright: 98 },
      { alpha: 60, v_load: 205, p_load: 79.5, bright: 82 },
      { alpha: 90, v_load: 162, p_load: 50.0, bright: 50 },
      { alpha: 120, v_load: 108, p_load: 22.0, bright: 21 },
      { alpha: 150, v_load: 42, p_load: 3.3, bright: 3 }
    ],
    graphConfig: {
      xKey: 'alpha',
      xLabel: 'Firing Angle α (Degrees)',
      yKey: 'v_load',
      yLabel: 'RMS Output Voltage (V)',
      title: 'Phase-Controlled AC Output Voltage vs Firing Angle'
    },
    vivaQuestions: [
      { question: 'What is the difference between latching current and holding current?', answer: 'Latching current (Il) is the minimum anode current required to transition the SCR from OFF to ON state at turn-on. Holding current (Ih) is the minimum anode current below which the SCR turns OFF. Latching current is typically 2-3 times holding current.' }
    ],
    toolLink: '/tools/motor-drives'
  },
  {
    id: 'exp-12',
    code: 'CS-601',
    title: 'PID Controller Tuning & Step Response Analysis of Closed-Loop Systems',
    category: 'Power Electronics & Control',
    aim: 'To design and tune Proportional-Integral-Derivative (PID) controllers using the Ziegler-Nichols method and analyze transient metrics (rise time, peak overshoot, settling time).',
    theory: 'The parallel PID control law is u(t) = Kp * e(t) + Ki * ∫e(t)dt + Kd * (de(t)/dt). Proportional action reduces rise time, Integral action eliminates steady-state error, and Derivative action improves stability and dampens overshoot.',
    apparatus: [
      'Virtual Analog Computer / Closed-Loop Control System Simulator',
      '2nd-Order Plant (G(s) = K / (s² + 2ζωn s + ωn²))',
      'Step Input Signal Generator and Real-Time Scope Display'
    ],
    procedure: [
      'Apply unity step input to open-loop plant and observe underdamped response.',
      'Increase proportional gain Kp until sustained oscillation is reached (Ultimate Gain Ku, Period Tu).',
      'Set PID parameters using Ziegler-Nichols rules: Kp = 0.6*Ku, Ti = 0.5*Tu, Td = 0.125*Tu.',
      'Fine-tune parameters to achieve < 5% peak overshoot and settling time < 1.0s.'
    ],
    formulae: [
      { label: 'PID Transfer Function', formula: 'C(s) = Kp + Ki/s + Kd*s' },
      { label: 'Peak Overshoot (Mp)', formula: 'Mp = e^(-π * ζ / √(1 - ζ²)) * 100 (%)' },
      { label: 'Settling Time (ts 2%)', formula: 'ts = 4 / (ζ * ωn)' }
    ],
    columns: [
      { key: 'type', label: 'Controller Type', unit: '' },
      { key: 'kp', label: 'Kp Gain', unit: '' },
      { key: 'ki', label: 'Ki Gain', unit: '' },
      { key: 'kd', label: 'Kd Gain', unit: '' },
      { key: 'tr', label: 'Rise Time (tr)', unit: 's' },
      { key: 'mp', label: 'Overshoot (Mp)', unit: '%' },
      { key: 'ess', label: 'Steady Error', unit: '%' }
    ],
    defaultObservations: [
      { type: 'Uncontrolled Plant', kp: 1.0, ki: 0.0, kd: 0.0, tr: 0.85, mp: 32.5, ess: 14.2 },
      { type: 'P-Only Controller', kp: 3.5, ki: 0.0, kd: 0.0, tr: 0.42, mp: 48.0, ess: 5.8 },
      { type: 'PI Controller', kp: 2.8, ki: 1.5, kd: 0.0, tr: 0.38, mp: 28.4, ess: 0.0 },
      { type: 'Full PID Controller', kp: 4.2, ki: 2.1, kd: 0.85, tr: 0.22, mp: 4.8, ess: 0.0 }
    ],
    graphConfig: {
      xKey: 'tr',
      xLabel: 'Rise Time (s)',
      yKey: 'mp',
      yLabel: 'Peak Overshoot (%)',
      title: 'Transient Performance Trade-off under PID Tuning'
    },
    vivaQuestions: [
      { question: 'Why does pure derivative control amplify high-frequency noise?', answer: 'The derivative operator s has magnitude proportional to frequency (ω). High-frequency measurement noise results in massive control signal fluctuations unless filtered with a low-pass filter.' }
    ],
    toolLink: '/tools/lab-bench'
  }
];

