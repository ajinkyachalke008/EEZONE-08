import { COMPONENT_LIBRARY } from '@/lib/circuit-components';

export type PinDirection = 'input' | 'output' | 'power' | 'passive' | 'bidirectional' | 'reference';

export interface ComponentPinReference {
  /** Canvas terminal identifier. This is the electrical connection used by wires. */
  terminal: string;
  name: string;
  direction: PinDirection;
  description: string;
}

export interface ComponentReference {
  structure: string;
  workingPrinciple: string;
  characteristics: string[];
  commonUses: string;
  designNotes: string;
  pins: ComponentPinReference[];
}

const pin = (terminal: string, name: string, direction: PinDirection, description: string): ComponentPinReference => ({
  terminal,
  name,
  direction,
  description
});

const twoTerminal = (terminalA: string, nameA: string, nameB: string, descriptionA: string, descriptionB: string) => {
  const terminalB = ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as Record<string, string>)[terminalA] ?? 'right';
  return [
    pin(terminalA, nameA, 'passive', descriptionA),
    pin(terminalB, nameB, 'passive', descriptionB)
  ];
};

/**
 * Educational reference for every catalog symbol. Ratings are intentionally
 * described as model/family behavior unless a selected component value sets them.
 */
export const COMPONENT_REFERENCE: Record<string, ComponentReference> = {
  voltage_dc: {
    structure: 'Ideal two-terminal DC source.',
    workingPrinciple: 'Maintains the configured voltage from + to −. It supplies or absorbs whatever current the surrounding circuit demands in the ideal model.',
    characteristics: ['Polarity matters: reversing the terminals reverses the circuit voltage.', 'Configured value is the nominal source voltage.', 'No internal resistance, current limit, or thermal limit is included.'],
    commonUses: 'Power rails, bias supplies, and DC operating-point examples.',
    designNotes: 'Real supplies have output resistance, current limits, ripple, and a finite compliance range; none are inferred by this generic symbol.',
    pins: twoTerminal('top', '＋', '−', 'Positive voltage terminal.', 'Negative/reference terminal.')
  },
  voltage_ac: {
    structure: 'Ideal two-terminal programmable voltage source.',
    workingPrinciple: 'Produces the selected sine, square, triangle, sawtooth, or DC waveform. The configured amplitude is peak voltage; frequency, offset, and duty cycle are source parameters.',
    characteristics: ['Polarity sets waveform sign.', 'Peak amplitude differs from RMS: a sine wave has Vrms = Vpeak/√2.', 'AC small-signal analysis uses the configured amplitude as its AC magnitude.'],
    commonUses: 'AC circuits, filters, transient response, and frequency-response examples.',
    designNotes: 'The generic source has no output impedance, current limit, or frequency-dependent source distortion.',
    pins: twoTerminal('top', '＋', '−', 'Positive waveform output.', 'Waveform return/reference terminal.')
  },
  current_source: {
    structure: 'Ideal two-terminal DC current source.',
    workingPrinciple: 'Forces the configured current from the first terminal toward the second; its voltage changes to satisfy that current unless the circuit is impossible.',
    characteristics: ['Arrow/reference direction is from + to − in the symbol.', 'Configured value is in amperes.', 'An ideal source has unlimited compliance voltage.'],
    commonUses: 'Current bias, Norton equivalents, and sensor/excitation models.',
    designNotes: 'Physical sources have a compliance range and finite output resistance.',
    pins: twoTerminal('left', '+', '-', 'Positive/reference current terminal; current is defined leaving this pin.', 'Negative/return current terminal.')
  },
  battery: {
    structure: 'Ideal DC source representing a battery pack.',
    workingPrinciple: 'Maintains the configured DC voltage with fixed polarity in this simulator.',
    characteristics: ['Long plate is positive in the conventional cell symbol.', 'Value represents nominal pack voltage.', 'No state of charge or internal resistance is simulated.'],
    commonUses: 'Portable supply examples and basic DC circuits.',
    designNotes: 'Real cell voltage changes with chemistry, load, temperature, age, and state of charge.',
    pins: twoTerminal('left', '−', '+', 'Negative battery terminal.', 'Positive battery terminal.')
  },
  ground: {
    structure: 'Single-terminal net reference connected to SPICE node 0.',
    workingPrinciple: 'Defines the circuit reference potential as 0 V; other node voltages are measured relative to it.',
    characteristics: ['A reference is required for a well-defined nodal solution.', 'Ground is a reference connection, not automatically a physical earth connection.', 'All ground symbols join the same reference net.'],
    commonUses: 'Supply returns, measurement references, and circuit voltage references.',
    designNotes: 'Do not confuse signal ground, chassis ground, and protective earth in a real installation.',
    pins: [pin('top', 'GND / 0', 'reference', 'Circuit reference node; electrically maps to SPICE node 0.')]
  },
  resistor: {
    structure: 'Resistive element between two terminals.',
    workingPrinciple: 'Obeys Ohm’s law V = I·R and dissipates electrical energy as heat.',
    characteristics: ['Non-polarized.', 'Increasing resistance lowers current for a fixed applied voltage.', 'Ideal model has no tolerance, temperature coefficient, inductance, or power rating.'],
    commonUses: 'Current limiting, voltage division, biasing, pull-up/pull-down, and loads.',
    designNotes: 'Check both voltage and power ratings. The selected resistance is not a power rating.',
    pins: twoTerminal('left', '1', '2', 'First resistor lead; no polarity.', 'Second resistor lead; no polarity.')
  },
  potentiometer: {
    structure: 'A resistive track with two end terminals and a movable wiper.',
    workingPrinciple: 'The wiper divides the total resistance into two sections; the position control sets their ratio.',
    characteristics: ['End-to-end resistance is the configured value.', 'Wiper position ranges from 1% to 99% to avoid an exactly zero segment.', 'The track is modeled as two ideal resistors.'],
    commonUses: 'Adjustable dividers, level controls, calibration, and analog setpoints.',
    designNotes: 'A real wiper has contact resistance and a finite power rating; loading changes divider output.',
    pins: [pin('left', 'A', 'passive', 'Track end A.'), pin('top', 'W', 'output', 'Wiper output; adjustable tap on the track.'), pin('right', 'B', 'passive', 'Track end B.')]
  },
  capacitor: {
    structure: 'Two conductive plates separated by a dielectric.',
    workingPrinciple: 'Stores charge and energy in an electric field. Current follows i = C·dV/dt; an ideal capacitor blocks steady DC after settling.',
    characteristics: ['Capacitance sets charge per volt.', 'Impedance magnitude falls as frequency rises.', 'Ideal model omits ESR, leakage, dielectric loss, and voltage dependence.'],
    commonUses: 'Decoupling, coupling, timing, filtering, and energy storage.',
    designNotes: 'The catalog symbol is non-polarized. Check voltage rating and polarity before substituting a polarized real capacitor.',
    pins: twoTerminal('left', '1', '2', 'First capacitor plate; generic symbol has no polarity.', 'Second capacitor plate; generic symbol has no polarity.')
  },
  inductor: {
    structure: 'A coil represented by an ideal inductance.',
    workingPrinciple: 'Stores energy in a magnetic field and opposes changes in current; voltage follows v = L·dI/dt.',
    characteristics: ['Inductive reactance rises with frequency.', 'Ideal model has no winding resistance, core loss, saturation, or coupling.', 'Initial current matters in transient circuits.'],
    commonUses: 'Filters, chokes, resonant networks, and energy conversion.',
    designNotes: 'Real inductors can saturate and overheat; check current and frequency ratings.',
    pins: twoTerminal('left', '1', '2', 'First winding terminal.', 'Second winding terminal.')
  },
  transformer: {
    structure: 'Two windings with primary and secondary terminals; winding polarity is conventionally shown by dot marks.',
    workingPrinciple: 'Changing primary flux induces secondary voltage. In an ideal transformer, voltage ratio follows turns ratio and current ratio is inverse.',
    characteristics: ['P1/P2 are the primary pair; S1/S2 are the secondary pair.', 'Relative winding polarity determines phase.', 'This canvas symbol is design-only; no mutual inductance or energy transfer is solved.'],
    commonUses: 'Isolation, voltage conversion, impedance matching, and power conversion.',
    designNotes: 'A real model requires turns ratio, winding resistance, magnetizing inductance, leakage, core losses, and a dot convention.',
    pins: [pin('left', 'P1', 'passive', 'Primary winding reference end.'), pin('right', 'P2', 'passive', 'Other primary winding end.'), pin('top', 'S1', 'passive', 'Secondary winding reference end; phase relative to P1 depends on the dot convention.'), pin('bottom', 'S2', 'passive', 'Other secondary winding end.')]
  },
  led: {
    structure: 'A p-n junction diode made from a light-emitting semiconductor material.',
    workingPrinciple: 'Forward current causes electron-hole recombination that emits light; reverse bias blocks current until breakdown.',
    characteristics: ['Anode must be more positive than cathode for forward conduction.', 'Configured Vf calibrates the generic diode model at the selected current.', 'Brightness and color are not simulated.'],
    commonUses: 'Indicators, illumination, optical signaling, and status outputs.',
    designNotes: 'Always use a current-limiting element in a real circuit. Vf varies with color, current, and temperature.',
    pins: twoTerminal('left', 'A / Anode', 'K / Cathode', 'Anode; conventional current enters here when forward biased.', 'Cathode; marked by the bar in the diode symbol.')
  },
  diode: {
    structure: 'A semiconductor p-n junction with an anode and cathode.',
    workingPrinciple: 'Conducts readily when forward biased and blocks reverse voltage within its rating.',
    characteristics: ['Conventional forward current flows anode to cathode.', 'Configured forward drop calibrates the generic model at 1 mA.', 'Reverse recovery, capacitance, leakage, and breakdown are not represented.'],
    commonUses: 'Rectification, polarity protection, clipping, and switching.',
    designNotes: 'The 1 mA calibration point is a model convention, not a universal silicon-diode Vf.',
    pins: twoTerminal('left', 'A / Anode', 'K / Cathode', 'Anode; forward current enters this terminal.', 'Cathode; forward current exits this terminal.')
  },
  zener_diode: {
    structure: 'A heavily doped p-n junction designed to operate in reverse breakdown.',
    workingPrinciple: 'In reverse bias, it holds approximately its configured Zener voltage over a useful current range; forward bias behaves like a diode.',
    characteristics: ['Cathode is the regulated-side terminal in a shunt reference.', 'Configured value sets nominal breakdown voltage.', 'Dynamic resistance, knee current, power, and temperature coefficient are simplified.'],
    commonUses: 'Shunt references, clamps, and overvoltage limiting.',
    designNotes: 'A series current-limiting resistor is required in practical use; the idealized model does not enforce a power rating.',
    pins: twoTerminal('left', 'A / Anode', 'K / Cathode', 'Anode; normally toward the return in a reverse-biased shunt reference.', 'Cathode; normally toward the positive regulated node.')
  },
  transistor_npn: {
    structure: 'Three-layer N-P-N bipolar junction transistor with base, collector, and emitter regions.',
    workingPrinciple: 'A small base-emitter drive controls a larger collector-emitter current; the junctions must be biased appropriately.',
    characteristics: ['Base-emitter junction is diode-like.', 'Beta (BF) is a generic gain parameter and varies with operating point.', 'No package, safe operating area, storage time, or thermal model is selected.'],
    commonUses: 'Low-side switching, amplification, and current control.',
    designNotes: 'The symbol orientation does not guarantee a specific transistor pinout. Check the chosen part datasheet.',
    pins: [pin('left', 'B / Base', 'input', 'Control terminal; base current controls conduction.'), pin('top', 'C / Collector', 'passive', 'Main current terminal; conventional NPN current enters in active operation.'), pin('bottom', 'E / Emitter', 'passive', 'Reference/current-return terminal; emitter arrow points outward for NPN.')]
  },
  transistor_pnp: {
    structure: 'Three-layer P-N-P bipolar junction transistor with base, collector, and emitter regions.',
    workingPrinciple: 'Conduction increases when the base is sufficiently below the emitter; emitter current is controlled by base drive.',
    characteristics: ['Polarity is opposite to an NPN device.', 'Beta (BF) is a generic gain parameter.', 'No package, safe operating area, or thermal model is selected.'],
    commonUses: 'High-side switching, complementary stages, and amplification.',
    designNotes: 'The emitter arrow points inward for PNP. Verify the exact device pinout and ratings before wiring hardware.',
    pins: [pin('left', 'B / Base', 'input', 'Control terminal; lowering base voltage relative to emitter turns the device on.'), pin('top', 'C / Collector', 'passive', 'Main current terminal; conventional current exits toward the load in active operation.'), pin('bottom', 'E / Emitter', 'passive', 'Reference/current-source terminal; emitter arrow points inward for PNP.')]
  },
  mosfet_n: {
    structure: 'N-channel MOSFET with insulated gate and drain-source channel.',
    workingPrinciple: 'Gate-to-source voltage forms/increases a conductive channel; drain current then flows according to bias and device region.',
    characteristics: ['Gate draws little steady-state current in the ideal model.', 'Threshold and KP are generic model parameters, not a full gate-drive specification.', 'Body diode, gate charge, switching loss, and thermal effects are omitted.'],
    commonUses: 'Low-side switching, power conversion, and analog control.',
    designNotes: 'Threshold voltage is not the same as a guaranteed low-resistance gate-drive voltage. Use a datasheet for real switching.',
    pins: [pin('left', 'G / Gate', 'input', 'Electric-field control terminal; referenced to source.'), pin('top', 'D / Drain', 'passive', 'Drain terminal of the channel.'), pin('bottom', 'S / Source', 'passive', 'Channel reference terminal for VGS.')]
  },
  mosfet_p: {
    structure: 'P-channel MOSFET with insulated gate and drain-source channel.',
    workingPrinciple: 'A sufficiently negative gate-to-source voltage forms/increases the channel; current direction is opposite to the usual N-channel convention.',
    characteristics: ['Gate draws little steady-state current in the ideal model.', 'Threshold and KP are generic magnitudes.', 'Body diode, gate charge, switching loss, and thermal effects are omitted.'],
    commonUses: 'High-side switching and complementary power stages.',
    designNotes: 'Verify the sign and magnitude of gate drive relative to source and use the selected part’s datasheet.',
    pins: [pin('left', 'G / Gate', 'input', 'Control terminal; referenced to source.'), pin('top', 'D / Drain', 'passive', 'Drain terminal of the channel.'), pin('bottom', 'S / Source', 'passive', 'Channel reference terminal for VGS.')]
  },
  logic_and: {
    structure: 'Two-input Boolean AND gate; internal transistor implementation depends on the logic family.',
    workingPrinciple: 'Y is HIGH only when A and B are both HIGH.',
    characteristics: ['Combinational; no memory or clock.', 'Real devices have logic thresholds, propagation delay, fan-out, and supply pins.', 'Digital behavior is documented but not simulated by the analog solver.'],
    commonUses: 'Enable gating, qualification, and Boolean control.',
    designNotes: 'The symbol exposes logic pins only; power rails and family-specific voltage levels are omitted.',
    pins: [pin('left', 'A', 'input', 'First logic input.'), pin('bottom', 'B', 'input', 'Second logic input.'), pin('right', 'Y', 'output', 'HIGH only when A and B are HIGH.')]
  },
  logic_or: {
    structure: 'Two-input Boolean OR gate.',
    workingPrinciple: 'Y is HIGH when at least one input is HIGH.',
    characteristics: ['Combinational; no memory or clock.', 'Output behavior depends on logic family thresholds and loading.', 'Digital behavior is not simulated by the analog solver.'],
    commonUses: 'Combining event, alarm, or enable conditions.',
    designNotes: 'Power pins, voltage levels, timing, and fan-out are omitted.',
    pins: [pin('left', 'A', 'input', 'First logic input.'), pin('bottom', 'B', 'input', 'Second logic input.'), pin('right', 'Y', 'output', 'HIGH when A or B is HIGH.')]
  },
  logic_not: {
    structure: 'Single-input inverter.',
    workingPrinciple: 'Y is the logical complement of A.',
    characteristics: ['Combinational; no memory.', 'A real inverter has input thresholds, output drive, and propagation delay.', 'Digital behavior is not simulated by the analog solver.'],
    commonUses: 'Signal inversion, active-low control, and logic construction.',
    designNotes: 'Power pins and logic family are omitted.',
    pins: [pin('left', 'A', 'input', 'Logic input.'), pin('right', 'Y', 'output', 'Complement of A.')]
  },
  logic_nand: {
    structure: 'Two-input NAND gate, equivalent to an AND followed by an inversion.',
    workingPrinciple: 'Y is LOW only when A and B are both HIGH.',
    characteristics: ['Combinational; no memory.', 'Universal gate when combined into networks.', 'Real thresholds, delay, drive, and supply rails are omitted.'],
    commonUses: 'Logic control and implementing other Boolean functions.',
    designNotes: 'Digital behavior is not simulated by the analog solver.',
    pins: [pin('left', 'A', 'input', 'First logic input.'), pin('bottom', 'B', 'input', 'Second logic input.'), pin('right', 'Y', 'output', 'LOW only when A and B are HIGH.')]
  },
  logic_nor: {
    structure: 'Two-input NOR gate, equivalent to an OR followed by an inversion.',
    workingPrinciple: 'Y is HIGH only when both A and B are LOW.',
    characteristics: ['Combinational; no memory.', 'Universal gate when combined into networks.', 'Real thresholds, delay, drive, and supply rails are omitted.'],
    commonUses: 'Logic control, interlocks, and Boolean networks.',
    designNotes: 'Digital behavior is not simulated by the analog solver.',
    pins: [pin('left', 'A', 'input', 'First logic input.'), pin('bottom', 'B', 'input', 'Second logic input.'), pin('right', 'Y', 'output', 'HIGH only when both inputs are LOW.')]
  },
  logic_xor: {
    structure: 'Two-input exclusive-OR gate.',
    workingPrinciple: 'Y is HIGH when the two inputs differ.',
    characteristics: ['Combinational; no memory.', 'Often used for parity and sum bits.', 'Real thresholds, propagation delay, and supply pins are omitted.'],
    commonUses: 'Parity, comparison, and half-adder sum logic.',
    designNotes: 'Digital behavior is not simulated by the analog solver.',
    pins: [pin('left', 'A', 'input', 'First logic input.'), pin('bottom', 'B', 'input', 'Second logic input.'), pin('right', 'Y', 'output', 'HIGH when A and B differ.')]
  },
  shift_register: {
    structure: 'Abstract 8-stage serial-in/parallel-out register. This symbol exposes four taps for canvas readability.',
    workingPrinciple: 'On each active clock edge, stored bits shift one stage and the serial input enters the first stage; clear resets the stored state.',
    characteristics: ['Stateful and clocked.', 'SER is serial data; CLK advances state; CLR is active-high in this generic symbol.', 'No clock edge, output state, or propagation behavior is simulated.'],
    commonUses: 'Serial expansion, serialization, and digital delay pipelines.',
    designNotes: 'This is a functional block symbol, not a pin-compatible package model. Exact ICs may use active-low clear and output-enable pins.',
    pins: [pin('left', 'SER', 'input', 'Serial data input.'), pin('right', 'CLK', 'input', 'Clock input; generic behavior shifts on a rising edge.'), pin('pin_clr', 'CLR', 'input', 'Generic active-high clear.'), pin('pin_q0', 'Q0', 'output', 'First exposed parallel data tap.'), pin('pin_q1', 'Q1', 'output', 'Second exposed parallel data tap.'), pin('pin_q2', 'Q2', 'output', 'Third exposed parallel data tap.'), pin('pin_q3', 'Q3', 'output', 'Fourth exposed parallel data tap.'), pin('pin_vcc', 'VCC', 'power', 'Positive logic supply; voltage family is unspecified.'), pin('pin_gnd', 'GND', 'reference', 'Logic supply return.')]
  },
  counter: {
    structure: 'Abstract 4-bit binary counter with enable and reset.',
    workingPrinciple: 'An enabled clock edge increments the binary state; reset returns it to zero; outputs expose the four state bits.',
    characteristics: ['Stateful and clocked.', 'Generic symbol treats RESET as active-high and synchronous.', 'No state transitions or timing are simulated.'],
    commonUses: 'Event counting, dividers, sequencing, and digital timing.',
    designNotes: 'Real counters differ in edge, reset, enable, pinout, and maximum clock rate; this is not a specific IC model.',
    pins: [pin('left', 'CLK', 'input', 'Clock input; generic counter increments on the rising edge.'), pin('right', 'RESET', 'input', 'Generic active-high synchronous reset.'), pin('pin_en', 'EN', 'input', 'Count enable; LOW holds the current state.'), pin('pin_q0', 'Q0 / LSB', 'output', 'Least-significant state bit.'), pin('pin_q1', 'Q1', 'output', 'Bit 1 of the binary count.'), pin('pin_q2', 'Q2', 'output', 'Bit 2 of the binary count.'), pin('pin_q3', 'Q3 / MSB', 'output', 'Most-significant state bit.'), pin('pin_vcc', 'VCC', 'power', 'Positive logic supply; voltage family is unspecified.'), pin('pin_gnd', 'GND', 'reference', 'Logic supply return.')]
  },
  arduino_uno: {
    structure: 'Arduino Uno R3 development board: ATmega328P-based board with USB/serial interface, clock, reset, and power circuitry.',
    workingPrinciple: 'A loaded program reads digital/analog pins and drives outputs; peripherals communicate through GPIO, UART, SPI, and I²C.',
    characteristics: ['The symbol shows logical signal names, not package pin numbers.', 'D0–D13 are digital; D0/D1 are commonly shared with UART.', 'A0–A5 are analog inputs; A4/A5 also provide I²C SDA/SCL aliases.', 'Firmware and board electrical behavior are not simulated.'],
    commonUses: 'Prototyping, education, simple sensing, and control.',
    designNotes: 'This reference represents unique logical nets; duplicate ground and header contacts are grouped. Confirm board revision and voltage/current limits before hardware use.',
    pins: [pin('left', '5V', 'power', 'Nominal 5 V board rail.'), pin('right', 'GND', 'reference', 'Common board ground.'), pin('pin_vin', 'VIN', 'power', 'External input to the board regulator; not the regulated 5 V rail.'), ...Array.from({ length: 14 }, (_, i) => pin(`pin_d${i}`, `D${i}`, 'bidirectional', `Digital GPIO ${i}; D0/D1 are also UART RX/TX.`)), ...Array.from({ length: 6 }, (_, i) => pin(`pin_a${i}`, `A${i}`, 'input', `Analog input A${i}${i === 4 ? ' (also SDA)' : i === 5 ? ' (also SCL)' : ''}.`)), pin('pin_3v3', '3V3', 'power', 'Nominal 3.3 V auxiliary rail.'), pin('pin_reset', 'RESET', 'input', 'Active-low reset input.'), pin('pin_aref', 'AREF', 'reference', 'Optional analog reference input.'), pin('pin_ioref', 'IOREF', 'reference', 'Board logic-voltage reference.')]
  },
  arduino_nano: {
    structure: 'Classic Nano V3-style compact ATmega328P development board with USB/serial and on-board power regulation.',
    workingPrinciple: 'Runs uploaded firmware, samples analog inputs, and drives GPIO and serial buses.',
    characteristics: ['Signal labels are logical names; board revisions and clones may vary.', 'A0–A7 are analog inputs; A6/A7 are analog-only on the classic Nano.', 'D0/D1 commonly serve UART; A4/A5 are I²C SDA/SCL aliases.', 'Firmware is not executed by the circuit simulator.'],
    commonUses: 'Compact embedded prototypes and breadboard projects.',
    designNotes: 'Power, USB, and duplicated header contacts are simplified into unique logical nets. Verify the exact board pinout and 5 V/3.3 V compatibility.',
    pins: [pin('left', '5V', 'power', 'Regulated board 5 V rail.'), pin('right', 'GND', 'reference', 'Common board ground.'), pin('pin_vin', 'VIN', 'power', 'External supply input to the regulator.'), ...Array.from({ length: 14 }, (_, i) => pin(`pin_d${i}`, `D${i}`, 'bidirectional', `Digital GPIO ${i}; D0/D1 are also UART RX/TX.`)), ...Array.from({ length: 8 }, (_, i) => pin(`pin_a${i}`, `A${i}`, 'input', `Analog input A${i}${i === 4 ? ' (also SDA)' : i === 5 ? ' (also SCL)' : i >= 6 ? ' (analog-only)' : ''}.`)), pin('pin_3v3', '3V3', 'power', 'Auxiliary 3.3 V rail on supported board revisions.'), pin('pin_reset', 'RESET', 'input', 'Active-low reset input.'), pin('pin_aref', 'AREF', 'reference', 'Optional analog reference input.')]
  },
  esp32: {
    structure: 'ESP32 development-board symbol around a Wi-Fi/Bluetooth-capable microcontroller, flash, clock, and power circuitry.',
    workingPrinciple: 'Firmware executes on the MCU; GPIO, ADC, timers, serial interfaces, and radio peripherals operate according to software configuration.',
    characteristics: ['This is a generic 30-pin DevKit-style logical breakout; ESP32 board variants differ.', 'GPIO34–GPIO39 are input-only on common ESP32 variants; some pins have boot-strapping roles.', 'GPIO matrix peripheral routing is software-configured.', 'Firmware, RF, boot behavior, and pin electrical characteristics are not simulated.'],
    commonUses: 'Wi-Fi/Bluetooth IoT devices, sensors, and embedded control.',
    designNotes: 'Treat GPIO as 3.3 V logic on common ESP32 boards. Do not assume 5 V tolerance; check the exact module and board datasheet.',
    pins: ['3V3','GND','EN','VP','VN','GPIO34','GPIO35','GPIO32','GPIO33','GPIO25','GPIO26','GPIO27','GPIO14','GPIO12','GPIO13','VIN','GPIO23','GPIO22','TX0','RX0','GPIO21','GPIO19','GPIO18','GPIO5','GPIO17','GPIO16','GPIO4','GPIO2','GPIO15'].map((name, i) => pin(i === 0 ? 'left' : i === 1 ? 'right' : `pin_${name.toLowerCase()}`, name, ['3V3','VIN'].includes(name) ? 'power' : name === 'GND' ? 'reference' : ['EN','VP','VN','GPIO34','GPIO35'].includes(name) ? 'input' : ['TX0'].includes(name) ? 'output' : 'bidirectional', `${name} logical board signal; availability and alternate functions depend on the specific ESP32 board.`))
  },
  esp8266: {
    structure: 'ESP8266 Wi-Fi microcontroller board with flash, clock, USB/serial bridge, reset, and regulated power.',
    workingPrinciple: 'Firmware controls GPIO, ADC, timers, and Wi-Fi radio functions.',
    characteristics: ['D0–D8 are board aliases for GPIO pins and can vary by board.', 'A0 is the analog input; its allowable voltage depends on the board divider.', 'Some pins affect boot mode and must be at valid levels during reset.', 'Firmware and Wi-Fi behavior are not simulated.'],
    commonUses: 'Wi-Fi-enabled sensors, control nodes, and IoT prototypes.',
    designNotes: 'The symbol is a generic NodeMCU-style breakout; verify the board schematic and 3.3 V limits.',
    pins: ['3V3','GND','EN','RST','A0','D0','D1','D2','D3','D4','D5','D6','D7','D8','RX','TX','VIN'].map((name, i) => pin(i === 0 ? 'left' : i === 1 ? 'right' : `pin_${name.toLowerCase()}`, name, ['3V3','VIN'].includes(name) ? 'power' : name === 'GND' ? 'reference' : ['EN','RST','A0','RX'].includes(name) ? 'input' : name === 'TX' ? 'output' : 'bidirectional', `${name} board signal; D-label to GPIO mapping is board-specific.`))
  },
  raspberry_pi_pico: {
    structure: 'Raspberry Pi Pico-style RP2040 board with MCU, flash, clock, USB, regulator, and castellated GPIO.',
    workingPrinciple: 'Firmware executes on two MCU cores and configures GPIO, ADC, PWM, PIO, and serial peripherals.',
    characteristics: ['GPIO0–GPIO28 are logical signals; package and board functions vary by pin.', 'Power/control signals are shown once even where the physical board duplicates contacts.', 'Firmware and timing are not simulated.'],
    commonUses: 'Embedded control, education, instrumentation, and PIO-based interfaces.',
    designNotes: 'This is a logical breakout, not a package pin-number drawing. Check the Pico board pinout and RP2040 datasheet for electrical limits.',
    pins: ['VBUS','VSYS','GND','3V3','3V3_EN','ADC_VREF','RUN','SWDIO','SWCLK', ...Array.from({ length: 29 }, (_, i) => `GP${i}`)].map((name, i) => pin(i === 0 ? 'left' : i === 1 ? 'right' : `pin_${name.toLowerCase()}`, name, ['VBUS','VSYS','3V3','3V3_EN'].includes(name) ? 'power' : name === 'GND' ? 'reference' : ['ADC_VREF'].includes(name) ? 'reference' : name === 'RUN' ? 'input' : ['SWDIO','SWCLK'].includes(name) ? 'bidirectional' : 'bidirectional', `${name} logical board signal.`))
  },
  ultrasonic: {
    structure: 'HC-SR04-style ultrasonic module containing a transmit transducer, receive amplifier/comparator, and timing logic.',
    workingPrinciple: 'A TRIG pulse starts an ultrasonic burst. ECHO stays high for the round-trip travel time; distance is estimated from time × speed of sound ÷ 2.',
    characteristics: ['Four-wire interface: supply, ground, trigger input, echo output.', 'Distance depends on air temperature and target angle/material.', 'No acoustic timing or distance-to-pulse simulation is provided.'],
    commonUses: 'Non-contact distance measurement and obstacle detection.',
    designNotes: 'Echo voltage compatibility depends on module revision; some 5 V modules need level shifting before a 3.3 V MCU input.',
    pins: [pin('left', 'VCC', 'power', 'Module supply; commonly 5 V for HC-SR04-style boards.'), pin('right', 'TRIG', 'input', 'Trigger input; a short high pulse starts a measurement.'), pin('pin_echo', 'ECHO', 'output', 'Pulse width represents round-trip acoustic time.'), pin('pin_gnd', 'GND', 'reference', 'Supply return.')]
  },
  temp_sensor: {
    structure: 'Generic digital temperature/humidity sensor interface representing the DHT family; sensing element and timing controller are abstracted.',
    workingPrinciple: 'The sensing element converts temperature (and for DHT variants, humidity) into digital data on a timed single-wire protocol.',
    characteristics: ['VCC and GND power the module; DATA is bidirectional/open-drain-style on common parts.', 'DHT11 and DHT22 differ in range, resolution, accuracy, and sampling time.', 'No temperature conversion or protocol timing is simulated.'],
    commonUses: 'Environmental monitoring and thermostatic control.',
    designNotes: 'The catalog groups distinct sensor parts. Select one datasheet before using numeric accuracy or operating limits.',
    pins: [pin('left', 'VCC', 'power', 'Sensor supply; exact range depends on the selected sensor.'), pin('right', 'DATA', 'bidirectional', 'Timed digital data line; often requires a pull-up.'), pin('pin_gnd', 'GND', 'reference', 'Supply return.')]
  },
  pir_sensor: {
    structure: 'PIR module containing a pyroelectric sensing element, amplifier, threshold logic, and output stage.',
    workingPrinciple: 'Detects changes in infrared energy across sensing zones and asserts OUT according to the module’s retrigger and delay settings.',
    characteristics: ['Output reports motion/change, not absolute distance or temperature.', 'Sensitivity, delay, and retrigger mode depend on the module.', 'No motion event or output timing is simulated.'],
    commonUses: 'Occupancy, motion-triggered lighting, and intrusion detection.',
    designNotes: 'Allow warm-up time and account for field of view, ambient changes, and supply requirements.',
    pins: [pin('left', 'VCC', 'power', 'Module supply.'), pin('right', 'OUT', 'output', 'Digital motion-detection output.'), pin('pin_gnd', 'GND', 'reference', 'Supply return.')]
  },
  servo: {
    structure: 'RC servo assembly with DC motor, reduction gears, position sensor, and closed-loop controller.',
    workingPrinciple: 'A pulse-width command sets the target angle; the internal controller drives the motor until measured position approaches the target.',
    characteristics: ['Three-wire interface: supply, command, and ground.', 'Typical control uses repeated pulses near 50 Hz; pulse-angle mapping is model-specific.', 'Mechanical motion, torque, speed, and stall current are not simulated.'],
    commonUses: 'Robotics, positioning, linkages, and hobby actuators.',
    designNotes: 'Power the servo from a supply sized for its stall current; share signal ground with the controller.',
    pins: [pin('left', 'VCC', 'power', 'Motor/control supply; follow the servo datasheet.'), pin('right', 'SIGNAL', 'input', 'Pulse-width target command.'), pin('pin_gnd', 'GND', 'reference', 'Signal and power return.')]
  },
  stepper: {
    structure: 'Generic four-wire bipolar stepper motor with two independent phase windings.',
    workingPrinciple: 'A driver energizes phase windings in a sequence; the rotor advances in discrete magnetic steps.',
    characteristics: ['A+/A− form phase A; B+/B− form phase B.', 'Direction and speed depend on phase sequence and step timing.', 'The symbol does not simulate winding inductance, torque, rotor motion, or missed steps.'],
    commonUses: 'Positioning, printers, CNC axes, and controlled rotation.',
    designNotes: 'The four-lead symbol is not compatible with five-wire unipolar stepper motors. Select a matching driver and check the motor winding and current ratings.',
    pins: [pin('left', 'A+', 'passive', 'First end of phase A winding.'), pin('right', 'A−', 'passive', 'Other end of phase A winding.'), pin('pin_b_plus', 'B+', 'passive', 'First end of phase B winding.'), pin('pin_b_minus', 'B−', 'passive', 'Other end of phase B winding.')]
  },
  lcd_display: {
    structure: '16×2 character LCD module with an HD44780-compatible controller, character memory, row/column drivers, and backlight.',
    workingPrinciple: 'A controller receives command/data bytes over a parallel bus, stores character codes, and refreshes the visible character cells.',
    characteristics: ['RS selects command or data; R/W selects read or write; E latches transfers.', 'D0–D7 form the parallel data bus; D4–D7 support common 4-bit mode.', 'The contrast pin and backlight need appropriate bias/current.', 'Display pixels and command timing are not simulated.'],
    commonUses: 'Text readouts, menus, and embedded instrumentation.',
    designNotes: 'Pin behavior and supply/backlight ratings depend on the exact module; the pin map is the standard 16-pin character-LCD header.',
    pins: [pin('left','VSS','reference','Ground.'),pin('right','VDD','power','Logic supply.'),pin('pin_vo','VO / V0','input','Contrast voltage input.'),pin('pin_rs','RS','input','Register select: command or character data.'),pin('pin_rw','R/W','input','Read/write control; tie low for write-only use.'),pin('pin_e','E','input','Enable strobe for bus transfer.'),...Array.from({length:8},(_,i)=>pin(`pin_d${i}`,`D${i}`,'bidirectional',`Parallel data bus bit ${i}.`)),pin('pin_a','A / LED+','power','Backlight anode; use the module’s current-limiting arrangement.'),pin('pin_k','K / LED−','reference','Backlight cathode.')]
  },
  oled_display: {
    structure: 'Generic 128×64 OLED module with pixel matrix and a display controller on an I²C interface.',
    workingPrinciple: 'The host sends commands and display-memory data over SDA/SCL; controller drivers illuminate selected organic-LED pixels.',
    characteristics: ['Four-wire logical interface: supply, ground, SDA, and SCL.', 'Resolution and controller are generic; address and supply vary by module.', 'Pixel rendering, I²C transactions, and current draw are not simulated.'],
    commonUses: 'Compact text, icons, and low-power graphical status displays.',
    designNotes: 'Verify logic voltage, pull-ups, I²C address, and controller compatibility for the selected module.',
    pins: [pin('left','VCC','power','Module supply; exact range depends on the breakout.'),pin('right','GND','reference','Supply return.'),pin('pin_sda','SDA','bidirectional','I²C serial data; typically open-drain with pull-up.'),pin('pin_scl','SCL','input','I²C serial clock.')]
  },
  seven_segment: {
    structure: 'Seven LED segments (a–g) plus decimal point arranged to form numeric characters; two common pins are grouped.',
    workingPrinciple: 'Driving selected segments creates a numeral; multiplexed displays switch common pins and segment patterns over time.',
    characteristics: ['The symbol exposes a, b, c, d, e, f, g, dp, COM1, and COM2.', 'Common-anode versus common-cathode wiring is not specified.', 'No segment illumination or multiplexing behavior is simulated.'],
    commonUses: 'Numeric counters, clocks, and status displays.',
    designNotes: 'Identify common-anode/cathode before driving and use one current-limiting resistor per independently driven segment.',
    pins: [...['A','B','C','D','E','F','G','DP'].map((name,i)=>pin(i===0?'left':i===1?'right':`pin_${name.toLowerCase()}`,name,'input',`Segment ${name}; drive through current limiting.`)),pin('pin_com1','COM1','power','First common terminal; connect according to display type.'),pin('pin_com2','COM2','power','Second common terminal; internally common on typical single-digit displays.')]
  },
  buzzer: {
    structure: 'Generic two-terminal piezoelectric buzzer element.',
    workingPrinciple: 'An alternating electrical field flexes the piezo element and produces sound; a passive piezo requires an AC/toggling drive.',
    characteristics: ['Polarity may be marked on the package but depends on the part.', 'Tone depends on drive frequency and enclosure.', 'Acoustic output and drive waveform are not simulated.'],
    commonUses: 'Alerts, user feedback, and simple tone generation.',
    designNotes: 'The catalog does not distinguish passive piezo from an active oscillator buzzer; select the correct driver and voltage for the actual part.',
    pins: twoTerminal('left','+','−','Positive-marked terminal when the selected part is polarized.','Return terminal.')
  },
  relay: {
    structure: 'Electromechanical single-pole double-throw relay: an energized coil moves a mechanical armature between NC and NO contacts.',
    workingPrinciple: 'Coil current creates magnetic force. With the coil de-energized, COM is connected to NC; when energized, COM transfers to NO.',
    characteristics: ['COIL+ and COIL− are the control winding.', 'COM is the moving contact; NO is open at rest; NC is closed at rest.', 'Coil voltage/current, contact ratings, bounce, and isolation are not simulated.'],
    commonUses: 'Galvanic isolation, load switching, and control interfaces.',
    designNotes: 'Use a flyback path for a DC coil and observe contact voltage/current ratings. The component is design-only in this simulator.',
    pins: [pin('left','COIL+','input','Coil positive terminal.'),pin('right','COIL−','input','Coil return terminal.'),pin('pin_com','COM','passive','Common moving contact.'),pin('pin_no','NO','passive','Normally open contact; closes when the coil is energized.'),pin('pin_nc','NC','passive','Normally closed contact; opens when the coil is energized.')]
  },
  op_amp: {
    structure: 'Idealized high-gain differential amplifier represented by non-inverting input, inverting input, and output.',
    workingPrinciple: 'Output is open-loop gain times (V+ − V−) in the generic model. Feedback is required for predictable linear operation.',
    characteristics: ['Open-loop gain is configurable.', 'Supply pins, output saturation, input bias, offset, bandwidth, slew rate, and common-mode range are omitted.', 'The three-terminal model is approximate.'],
    commonUses: 'Amplifiers, buffers, active filters, and analog computation.',
    designNotes: 'This is not a pin-compatible LM741 package model. Real op amps require supply connections and obey input/output limits.',
    pins: [pin('left','＋ / V+','input','Non-inverting input.'),pin('bottom','− / V−','input','Inverting input.'),pin('right','OUT','output','Amplified output; no rail clamp in this model.')]
  },
  comparator: {
    structure: 'High-gain differential threshold detector represented by two inputs and one output.',
    workingPrinciple: 'The output changes state according to which input is higher; the simplified model uses a high-gain analog source.',
    characteristics: ['Open-loop gain is configurable.', 'Output polarity follows V+ greater than V−.', 'Saturation levels, open-collector behavior, hysteresis, propagation delay, and supply rails are omitted.'],
    commonUses: 'Threshold detection, zero-crossing detection, and window-comparator building blocks.',
    designNotes: 'A real comparator is not interchangeable with an op amp in all circuits. Check output topology and common-mode limits.',
    pins: [pin('left','＋ / IN+','input','Non-inverting threshold input.'),pin('bottom','− / IN−','input','Inverting/reference input.'),pin('right','OUT','output','Output changes according to the input difference; real logic levels are not modeled.')]
  },
  '555_timer': {
    structure: 'Eight-pin 555 timer block containing a resistor divider, two comparators, an SR latch, discharge transistor, and output driver.',
    workingPrinciple: 'Threshold and trigger inputs set/reset the latch; discharge switches the timing capacitor to create monostable or astable timing.',
    characteristics: ['Standard pin names are shown for an NE555-style device.', 'TRIG is typically compared with about 1/3 VCC; THRESH with about 2/3 VCC.', 'The canvas symbol has no validated timer macromodel and does not simulate timing.'],
    commonUses: 'One-shot pulse generation, oscillators, and timing/control circuits.',
    designNotes: 'Threshold fractions, output drive, reset behavior, supply range, and timing accuracy depend on the specific bipolar/CMOS timer.',
    pins: [pin('left','GND','reference','Ground / negative supply.'),pin('right','TRIG','input','Trigger comparator input; low pulse sets the latch.'),pin('pin_out','OUT','output','Push-pull timer output on common NE555 devices.'),pin('pin_reset','RESET','input','Active-low reset; hold high for normal operation.'),pin('pin_ctrl','CTRL / CV','input','Control-voltage access to the internal threshold reference.'),pin('pin_thresh','THRESH','input','Threshold comparator input; high level resets the latch.'),pin('pin_disch','DISCH','output','Open-collector-style discharge transistor connection for timing capacitor.'),pin('pin_vcc','VCC','power','Positive supply.')]
  },
  voltage_regulator: {
    structure: 'Generic three-terminal fixed-output linear regulator block.',
    workingPrinciple: 'Adjusts its internal pass element to keep OUT near the configured voltage while input headroom and load limits are satisfied.',
    characteristics: ['Configured value is the ideal target output.', 'The model uses an idealized output source.', 'Dropout, quiescent current, current limit, stability, and thermal protection are not modeled.'],
    commonUses: 'Local DC rails and supply conditioning.',
    designNotes: 'This is not a specific 7805 or LDO model. Real regulators need correct input/output capacitors and thermal design.',
    pins: [pin('left','IN','input','Unregulated input supply.'),pin('right','OUT','output','Regulated output target.'),pin('bottom','GND','reference','Regulator reference/return.')]
  },
  ammeter: {
    structure: 'Series meter represented by a small shunt resistor.',
    workingPrinciple: 'Current through the shunt creates a small burden voltage; the solver reports branch behavior from the circuit model.',
    characteristics: ['Must be inserted in series with the branch.', 'Default burden resistance is 1 mΩ and is adjustable.', 'The ammeter is approximate and can affect very low-voltage circuits.'],
    commonUses: 'Current measurement and branch-current checks.',
    designNotes: 'Never place a real current meter directly across a voltage source; select the correct current range and fuse.',
    pins: twoTerminal('left','＋','−','Current-entry/reference-positive terminal.', 'Current-exit/return terminal.')
  },
  voltmeter: {
    structure: 'Parallel meter represented by an input resistance.',
    workingPrinciple: 'Measures terminal potential difference while drawing a small current through its input resistance.',
    characteristics: ['Must be connected in parallel across the measured nodes.', 'Default input resistance is 10 MΩ and is adjustable.', 'Finite input resistance slightly loads the circuit.'],
    commonUses: 'Node voltage, supply, and component-drop measurements.',
    designNotes: 'Real meters have range, bandwidth, input protection, and accuracy limits that are not modeled.',
    pins: twoTerminal('left','＋','−','Positive measurement input.', 'COM/negative measurement input.')
  },
  probe: {
    structure: 'Non-loading node marker used to identify a circuit net for waveform measurement.',
    workingPrinciple: 'Associates a node with an instrument channel; it adds no electrical load and creates no new voltage source.',
    characteristics: ['Single electrical connection.', 'Marker itself does not alter the circuit.', 'Actual instrument input capacitance and probe attenuation are not modeled.'],
    commonUses: 'Oscilloscope/DMM node selection and waveform labeling.',
    designNotes: 'The reference is selected separately by the instrument. A probe label is not a component with a calibrated transfer response.',
    pins: [pin('top','PROBE','input','Attach to the node to observe.')]
  }
};

export function getComponentReference(type: string): ComponentReference | undefined {
  return COMPONENT_REFERENCE[type];
}

export function getComponentReferenceCatalog() {
  return COMPONENT_LIBRARY.map(component => ({
    ...component,
    reference: COMPONENT_REFERENCE[component.type]
  }));
}

