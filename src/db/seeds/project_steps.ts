import { db } from '@/db';
import { projectStepsNew } from '@/db/schema';

async function main() {
    const sampleProjectSteps = [
        // Project 1 (3-Phase Motor Controller) - 5 steps
        {
            projectId: 1,
            stepNumber: 1,
            title: 'Circuit Design and Component Selection',
            description: `## Circuit Design and Component Selection

For a reliable 3-phase motor controller, component selection is critical. Start by determining your motor specifications: voltage rating, current draw, and operating frequency. Based on these parameters, select appropriate IGBTs (Insulated Gate Bipolar Transistors) with a voltage rating at least 150% of your supply voltage and current rating 120% of motor full load current.

Choose gate driver ICs that can handle the switching frequency (typically 8-20kHz for motor control). Popular choices include IR2110, UCC27211, or TLP250. These drivers provide electrical isolation and fast switching capabilities. For protection, include fast-acting fuses, MOVs (Metal Oxide Varistors) for voltage spike protection, and current sensing resistors (typically 0.01-0.1Ω, 5W rated).

Don't forget auxiliary components: bootstrap diodes and capacitors for high-side driver operation, gate resistors (typically 10-47Ω) to control switching speed, and snubber circuits to minimize voltage spikes. Create a complete bill of materials with part numbers, quantities, and suppliers before proceeding to the next step.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 2,
            title: 'PCB Layout and Power Stage Design',
            description: `## PCB Layout and Power Stage Design

PCB layout for high-power motor controllers requires careful attention to thermal management and noise reduction. Use a minimum 2oz copper weight for power traces, with trace width calculated based on expected current (approximately 1mm width per 3A for 2oz copper). Keep power stage components as close as possible to minimize parasitic inductance.

Implement a star ground topology with separate power and signal grounds connected at a single point. Place gate driver circuits close to IGBT gates with short, direct traces to minimize switching delays and reduce EMI. Include ground planes on inner layers for noise shielding, but avoid placing them directly under high-frequency switching nodes.

For thermal management, use large copper pours connected to IGBT collectors and mounting tabs. Calculate heat dissipation (Pd = Vce × Ic + Eon × fsw + Eoff × fsw) and size heatsinks accordingly. Plan for forced air cooling if natural convection is insufficient. Include thermal vias (minimum 0.3mm diameter, 0.8mm pitch) under high-power components to transfer heat to inner and bottom layers.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 3,
            title: 'Control Circuit Assembly',
            description: `## Control Circuit Assembly

Begin assembly by soldering surface-mount components first, starting with the smallest parts. Use a temperature-controlled soldering station set to 350°C for lead-free solder. Mount IGBTs to the heatsink with thermal compound (thin, even layer) before soldering to the PCB. Torque mounting screws to manufacturer specifications (typically 0.5-1.5 Nm).

Wire the microcontroller (Arduino, STM32, or similar) to the gate driver inputs using twisted pair or shielded cable to reduce noise pickup. Connect current sensing circuits to ADC inputs with low-pass RC filters (cutoff around 1kHz) to remove switching noise. Implement Hall effect sensors or current transformers for phase current measurement, ensuring proper orientation and calibration.

Add protection circuits including overcurrent detection (comparator-based with 100-200ns response time), over-temperature monitoring (thermistor or digital sensor on heatsink), and DC bus overvoltage/undervoltage detection. Connect enable/disable signals and emergency stop functionality. Use optocouplers for any signals crossing safety boundaries. Double-check all polarities before applying power.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 4,
            title: 'Programming and Logic Implementation',
            description: `## Programming and Logic Implementation

Implement Space Vector Pulse Width Modulation (SVPWM) or Sinusoidal PWM for smooth motor control. Set up three PWM channels at 10-20kHz with dead time insertion (typically 1-2µs) to prevent shoot-through. Configure ADC for current sensing with sampling synchronized to PWM to avoid switching noise interference.

Program protection algorithms: overcurrent threshold (150% rated current), DC bus overvoltage (120% nominal), undervoltage (80% nominal), and thermal shutdown (typically 85-100°C junction temperature). Implement soft-start by ramping output frequency from 1-5Hz to target speed over 2-3 seconds to limit inrush current.

For closed-loop control, implement V/f (Volts per Hertz) control for basic applications or Field-Oriented Control (FOC) for high-performance systems. FOC requires Clarke and Park transformations, PID controllers for torque and flux, and inverse Park transformation. Add communication interface (UART, CAN, or Modbus) for remote control and monitoring. Include diagnostic features to log fault conditions with timestamps.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 5,
            title: 'Testing and Calibration',
            description: `## Testing and Calibration

Start with low-power bench testing using a DC power supply with current limiting (set to 1A initially). Verify PWM signal generation with an oscilloscope, checking for proper dead time, frequency, and duty cycle. Gradually increase supply voltage while monitoring gate signals and IGBT switching behavior. Look for proper gate voltage levels (typically 12-15V for turn-on, 0V for turn-off).

Connect a 3-phase resistive load bank (old washing machine motor or resistor array) for initial motor tests. Start with V/f ratio at minimum (1V/Hz) and slowly increase frequency from 5Hz to 30Hz. Monitor phase currents for balance (should be within 5% of each other). Check temperature rise on IGBTs, drivers, and heatsink. Current should follow a smooth sinusoidal pattern without significant distortion.

Calibrate current sensors by comparing readings against a calibrated clamp meter at various load points (25%, 50%, 75%, 100% rated current). Adjust ADC scaling factors in code to match actual measurements. Test all protection features: simulate overcurrent by reducing load resistance, verify thermal shutdown by heating sensor, test emergency stop response time (should disable output within 1ms). Document all test results and calibration values for future reference.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15T10:00:00').toISOString(),
        },

        // Project 2 (Solar Panel System) - 5 steps
        {
            projectId: 2,
            stepNumber: 1,
            title: 'System Load Calculation',
            description: `## System Load Calculation

Begin by creating a comprehensive inventory of all electrical loads that will run on the solar system. List each appliance with its power rating (watts) and daily usage hours. For example: LED lights (15W × 5 hours = 75Wh), refrigerator (150W × 24 hours × 0.3 duty cycle = 1080Wh), laptop charger (65W × 4 hours = 260Wh), and so on. Sum the daily watt-hours (Wh) for all loads.

Add a safety margin of 25-30% to account for system losses (inverter efficiency, battery losses, wiring resistance). For critical loads, identify which must run during nighttime or cloudy days to determine minimum battery capacity. Calculate peak simultaneous load by adding wattage of all devices that might run at the same time - this determines inverter size. For example, if your largest simultaneous load is 800W, select a 1000W or 1200W inverter.

Consider seasonal variations in energy consumption. Summer typically has higher cooling loads while winter may have heating needs. If your daily energy consumption is 5000Wh (5kWh) with 30% safety margin, your system should be designed to produce 6500Wh daily. This becomes the basis for calculating required solar panel array size and battery capacity in the following steps.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20T10:00:00').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 2,
            title: 'Panel Selection and Array Design',
            description: `## Panel Selection and Array Design

Select solar panels based on available space, budget, and efficiency requirements. Monocrystalline panels (18-22% efficiency) are more efficient but costly, while polycrystalline (15-17% efficiency) are budget-friendly. For a 6500Wh daily requirement with 5 peak sun hours in your location, you need 6500Wh ÷ 5h = 1300W of panel capacity. Adding 20% for dust and degradation losses: 1300W × 1.2 = 1560W total panel capacity.

If using 300W panels, you would need 1560W ÷ 300W = 5.2, rounded up to 6 panels (1800W array). For a 24V system, wire panels in series-parallel configuration. With 6 panels rated at 37V Vmp and 8.1A Imp each, connect 2 strings of 3 panels in series (3 × 37V = 111V per string), then parallel the strings for 16.2A total current. This configuration maximizes voltage for charge controller efficiency.

Consider panel orientation and tilt angle: tilt should equal your latitude for year-round optimization (e.g., 35° tilt for 35° latitude). Face panels true south (northern hemisphere) or true north (southern hemisphere). Ensure mounting structure can withstand wind loads (typically 120-150 mph rating). Leave 4-6 inches clearance between panels and roof for air circulation to prevent overheating. Calculate wire gauge based on array current and distance: for 20A at 100 feet, use minimum 8 AWG copper.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20T10:00:00').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 3,
            title: 'Inverter and Charge Controller Sizing',
            description: `## Inverter and Charge Controller Sizing

Select an MPPT (Maximum Power Point Tracking) charge controller for 20-30% higher efficiency compared to PWM controllers. The controller must handle your array's maximum voltage and current. For the 6-panel array (111V Voc per string, 16.2A), choose a controller rated for 150V input and 20-30A output. Popular choices include Victron, Morningstar, or Epever MPPT controllers with display and monitoring capabilities.

Calculate required inverter capacity based on maximum simultaneous load plus 20% surge margin. If peak load is 800W, a 1000W pure sine wave inverter is minimum. For motor loads (pumps, refrigerators), consider 3x starting surge - a 500W refrigerator needs 1500W inverter capacity. Choose pure sine wave inverters for sensitive electronics; modified sine wave damages some devices and causes humming in audio equipment.

Match system voltage to battery bank: 12V for systems up to 1000W, 24V for 1000-3000W, and 48V for larger systems. A 24V system with 1000W inverter draws 1000W ÷ 24V = 41.7A (use 50A breaker). Ensure inverter's battery voltage range matches your battery bank configuration. Include proper disconnects, breakers, and surge protection (SPD rated for 20kA minimum) between panels and controller, and between battery and inverter.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20T10:00:00').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 4,
            title: 'Battery Bank Configuration',
            description: `## Battery Bank Configuration

Calculate battery capacity for desired autonomy days (typically 2-3 days for residential systems). For 6500Wh daily consumption with 2 days autonomy: 6500Wh × 2 = 13000Wh. Account for depth of discharge (DoD): lead-acid should not exceed 50% DoD for longevity, lithium can go to 80-90% DoD. For lead-acid: 13000Wh ÷ 0.5 = 26000Wh (26kWh) usable capacity needed.

For a 24V system, convert to amp-hours: 26000Wh ÷ 24V = 1083Ah. Use deep-cycle batteries: if each battery is 200Ah at 12V, you need 1083Ah ÷ 200Ah = 5.4 batteries per string. Round to 6 batteries per string. For 24V, connect 2 batteries in series (12V + 12V = 24V), then parallel 3 strings for 600Ah total (2 series × 3 parallel = 6 batteries total).

Wire batteries with heavy gauge cable: for 100A maximum current, use 2/0 AWG copper for runs under 5 feet. Keep all cables equal length to ensure balanced charging. Install battery disconnect switch, fuse (125A for 100A system), and battery monitor to track state of charge. For lead-acid, provide ventilation for hydrogen gas. For lithium, use Battery Management System (BMS) with temperature sensors and cell balancing. Install batteries in insulated enclosure to maintain 50-80°F operating temperature range.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20T10:00:00').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 5,
            title: 'Installation and Grid Connection',
            description: `## Installation and Grid Connection

Mount solar panels on racking system securely fastened to roof rafters or ground mounts with concrete footings. For roof installations, locate rafters with stud finder and use lag bolts (typically 3/8" × 5" minimum) with flashing to prevent leaks. Torque mounting hardware to manufacturer specifications. Install grounding lugs on each panel frame and connect to ground with 6 AWG bare copper wire running to grounding rod (8-foot copper rod driven into earth, resistance under 25 ohms).

Run DC wiring from panels to charge controller in UV-resistant conduit (PVC Schedule 40 or EMT). Use MC4 connectors for panel-to-panel connections. Label positive and negative clearly. Install DC disconnect breaker between panels and controller, and between battery and inverter. Use appropriately sized wire: for 20A at 50 feet run, use minimum 10 AWG copper (voltage drop under 2%).

For grid-tie systems, install bi-directional meter and interconnection agreement with utility company. Install grid-tie inverter with anti-islanding protection and rapid shutdown capability per NEC 690.12. For off-grid systems, install transfer switch if backup generator present. Commission system by verifying all voltages, checking polarity, testing GFCI outlets, and confirming charge controller enters bulk/absorption/float charge stages properly. Monitor system for first few days to ensure panels are charging batteries and loads are operating normally. Document all component serial numbers and installation date for warranty purposes.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20T10:00:00').toISOString(),
        },

        // Project 3 (Home Automation Circuit) - 4 steps
        {
            projectId: 3,
            stepNumber: 1,
            title: 'Component Gathering and Schematic Review',
            description: `## Component Gathering and Schematic Review

For this home automation project, gather the following components: ESP8266 NodeMCU or ESP32 development board for WiFi connectivity and control logic, 4-channel 5V relay module with optocoupler isolation (rated for 10A at 250VAC per channel), USB power supply (5V 2A minimum), jumper wires (male-to-female for breadboard connections), breadboard for prototyping, and appropriate enclosure for final assembly.

The schematic shows a simple yet effective design: the microcontroller GPIO pins connect to relay module inputs through current-limiting resistors (typically built into relay modules). Each relay's COM (common) terminal connects to AC hot wire, NO (normally open) terminal connects to load, and NC (normally closed) remains unused for standard switching. The relay module receives 5V power from the microcontroller's power supply with common ground.

Review the circuit's isolation: the optocouplers on the relay module provide electrical isolation between the low-voltage control circuit (3.3V/5V) and high-voltage switching circuit (120V/240VAC). This is critical for safety. Ensure the relay module has LED indicators for visual feedback of relay states. Calculate total power consumption: ESP8266 uses ~200mA during WiFi transmission, relay coils use ~70mA each, so 5V 1A supply is sufficient for control side. For load side, verify relay contact ratings exceed your maximum load current (e.g., 5A incandescent bulb, 2A LED driver).`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-25T10:00:00').toISOString(),
        },
        {
            projectId: 3,
            stepNumber: 2,
            title: 'Relay Module Connection',
            description: `## Relay Module Connection

Begin by connecting the control side (low voltage) circuit on a breadboard for testing before final assembly. Connect the relay module's VCC pin to the ESP8266's VIN pin (5V when powered via USB) or to external 5V supply. Connect relay module's GND to ESP8266 GND - this common ground is essential for proper optocoupler operation. Connect relay input pins: IN1 to GPIO D1 (GPIO5), IN2 to GPIO D2 (GPIO4), IN3 to GPIO D5 (GPIO14), IN4 to GPIO D6 (GPIO12).

For the AC power side, work carefully with mains voltage. Turn OFF power at the breaker before any wiring. Connect incoming AC hot (black wire) to the COM (common) terminal of each relay. Connect the relay's NO (normally open) terminal to the hot wire of each load (lights, fans, outlets). Connect all neutral wires (white) together in a wire nut - they bypass the relay. Connect all ground wires (green/bare copper) together and to the junction box ground screw.

Test continuity with a multimeter before applying power: with relay de-energized, there should be infinite resistance between COM and NO terminals. When relay energizes (apply 5V to IN pin), you should hear a click and measure near-zero resistance between COM and NO. Verify all four relays switch properly. Double-check that no AC voltage appears on low-voltage control wires. Use a voltage detector pen to verify AC wiring before closing junction boxes. Label each relay channel (1=Living Room Light, 2=Bedroom Fan, etc.).`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-25T10:00:00').toISOString(),
        },
        {
            projectId: 3,
            stepNumber: 3,
            title: 'Microcontroller Programming',
            description: `## Microcontroller Programming

Program the ESP8266 using Arduino IDE with ESP8266 board support installed. Start with basic relay control code: define relay pins as outputs (pinMode(D1, OUTPUT)), then test each relay independently using digitalWrite(D1, HIGH) to energize relay and digitalWrite(D1, LOW) to de-energize. Note: some relay modules are active-low (LOW=ON, HIGH=OFF), adjust code accordingly.

Implement WiFi connectivity using ESP8266WiFi library. Configure as WiFi client connecting to your router or as access point for direct control. For web-based control, use ESP8266WebServer library to create a simple web interface with ON/OFF buttons for each relay. Example URL structure: /relay1/on, /relay1/off, etc. Add HTML form for user-friendly interface with buttons styled using basic CSS.

For integration with smart home platforms, implement MQTT protocol using PubSubClient library. Connect to MQTT broker (Mosquitto running on Raspberry Pi or cloud service like CloudMQTT). Subscribe to topics like "home/relay1/command" and publish relay states to "home/relay1/state". Add HomeAssistant or Google Home integration by configuring MQTT discovery. Include OTA (Over-The-Air) updates using ArduinoOTA library so you can update code wirelessly. Add reconnection logic to handle WiFi drops automatically. Flash the code to ESP8266 using USB connection and verify serial monitor shows successful WiFi connection and web server startup.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-25T10:00:00').toISOString(),
        },
        {
            projectId: 3,
            stepNumber: 4,
            title: 'Final Assembly and Testing',
            description: `## Final Assembly and Testing

Select an appropriate enclosure for housing the control electronics. A plastic junction box (minimum 4"×4"×2") with knockout holes works well. Mount the ESP8266 using standoffs and screws to prevent shorts. Mount the relay module similarly, ensuring no exposed metal contacts can touch the enclosure. Install a cable gland or strain relief bushing where AC wires enter/exit the enclosure to prevent wire damage.

Route low-voltage control wires separately from AC wiring inside the enclosure to minimize electromagnetic interference. Use cable ties to organize wiring neatly. If space permits, add a small cooling fan (5V 40mm) connected to 5V supply to prevent heat buildup from relays. Label all terminal connections clearly with a label maker. Drill ventilation holes (3-4 small holes, 1/4" diameter) in the bottom of enclosure for air circulation and condensation drainage.

Conduct comprehensive testing before final installation. Test each relay individually through web interface or MQTT commands. Verify relay LEDs illuminate when activated. Connect known-good loads (lamps) to each relay output and verify switching works reliably. Test under various WiFi conditions including router reboot to ensure reconnection works. Measure system temperature after 1 hour of operation - should remain below 50°C. Test rapid switching (on-off cycles every second) to verify relay doesn't overheat or fail. Once validated, install enclosure in accessible location (near electrical panel or in utility room) and secure AC wiring in conduit per electrical code. Create documentation of relay assignments, IP address, and MQTT topics for future reference.`,
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-25T10:00:00').toISOString(),
        },
    ];

    await db.insert(projectStepsNew).values(sampleProjectSteps);
    
    console.log('✅ Project steps seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});