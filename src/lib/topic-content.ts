// Complete 7-section content for EE Zone Learning Topics
// Following the topic_page_template specification

export interface TopicContent {
  conceptOverview: {
    paragraphs: string[];
    realWorldApplications: string[];
  };
  keyFormulas: Array<{
    equation: string;
    symbols: string[];
    usage: string;
  }>;
  workedExample: {
    problem: string;
    givenData: string[];
    required: string;
    steps: Array<{
      title: string;
      explanation: string;
      calculation?: string;
    }>;
    finalAnswer: string;
    interpretation?: string;
  };
  typicalMistakes: Array<{
    mistake: string;
    fix: string;
  }>;
  examCorner: {
    longAnswers: Array<{
      question: string;
      marks: number;
      intro: string;
      points: string[];
      conclusion?: string;
    }>;
    shortAnswers: Array<{
      question: string;
      answer: string;
      keyTerms?: string[];
    }>;
  };
  labPractical: {
    safetyNotes: string[];
    observations: string[];
    vivaQuestions: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export const topicContent: { [slug: string]: TopicContent } = {
  // ============================================
  // TOPIC 1: DC MACHINES – BASICS AND PERFORMANCE
  // ============================================
  'dc-machines': {
    conceptOverview: {
      paragraphs: [
        "A DC (Direct Current) machine is a rotating electrical machine that can work either as a motor (converting electrical energy to mechanical) or as a generator (converting mechanical energy to electrical). The fundamental principle behind DC machines is electromagnetic induction – when a conductor moves through a magnetic field, an EMF is induced, and when current flows through a conductor in a magnetic field, a force is produced.",
        "Understanding DC machines is essential for every electrical engineer because they form the foundation of electromechanical energy conversion. Even though AC machines dominate industrial applications today, DC machines are still widely used where precise speed control is needed – from electric vehicles and cranes to rolling mills and paper industries. The concepts you learn here will also help you understand more complex machines like brushless DC motors and servo systems.",
        "In real life, you'll find DC machines in battery-powered vehicles (like forklifts and golf carts), elevator systems, steel rolling mills, printing presses, and even in your car's starter motor and window wiper motors. The ability of DC motors to provide high starting torque and smooth speed control over a wide range makes them irreplaceable in many precision applications."
      ],
      realWorldApplications: [
        "Electric vehicles and battery-powered equipment (forklifts, golf carts)",
        "Industrial cranes and hoists requiring high starting torque",
        "Steel rolling mills where precise speed control is critical",
        "Paper and textile industries for winding applications",
        "Automotive starters, wipers, and power windows",
        "Traction systems in metros and electric trains"
      ]
    },
    keyFormulas: [
      {
        equation: "E = (PΦNz) / (60A)",
        symbols: [
          "E = Generated EMF (Volts)",
          "P = Number of poles",
          "Φ = Flux per pole (Webers)",
          "N = Speed (RPM)",
          "z = Total number of armature conductors",
          "A = Number of parallel paths (A=P for lap, A=2 for wave winding)"
        ],
        usage: "Use this formula to calculate the EMF generated in a DC generator or the back EMF in a DC motor. This is your primary equation for understanding machine behavior with changing speed or flux."
      },
      {
        equation: "Eb = V - IaRa (Motor)",
        symbols: [
          "Eb = Back EMF (Volts)",
          "V = Applied terminal voltage (Volts)",
          "Ia = Armature current (Amperes)",
          "Ra = Armature resistance (Ohms)"
        ],
        usage: "Use this for DC motor analysis. The back EMF opposes the applied voltage and depends on motor speed. At starting, Eb = 0, so starting current is very high (V/Ra)."
      },
      {
        equation: "T = (PΦzIa) / (2πA)",
        symbols: [
          "T = Torque developed (Newton-meters)",
          "P = Number of poles",
          "Φ = Flux per pole (Webers)",
          "z = Number of armature conductors",
          "Ia = Armature current (Amperes)",
          "A = Number of parallel paths"
        ],
        usage: "Use this to calculate electromagnetic torque. Notice that torque is directly proportional to flux and armature current – this explains why DC motors can provide high torque at low speeds."
      },
      {
        equation: "N = (V - IaRa) / (KΦ)",
        symbols: [
          "N = Motor speed (RPM)",
          "V = Applied voltage (Volts)",
          "Ia = Armature current (Amperes)",
          "Ra = Armature resistance (Ohms)",
          "K = Machine constant (PZ/60A)",
          "Φ = Flux per pole (Webers)"
        ],
        usage: "Speed equation for DC motors. Shows three methods of speed control: (1) Varying V (armature voltage control), (2) Varying Ra (resistance control), (3) Varying Φ (field flux control)."
      },
      {
        equation: "η = (Output Power / Input Power) × 100%",
        symbols: [
          "η = Efficiency (%)",
          "Output Power = Mechanical power output (Watts)",
          "Input Power = Electrical power input (Watts)",
          "Losses = Copper losses + Iron losses + Mechanical losses"
        ],
        usage: "Calculate machine efficiency. For motors: η = (Pout/Pin). For generators: η = (Electrical output/Mechanical input). Maximum efficiency occurs when variable losses equal constant losses."
      }
    ],
    workedExample: {
      problem: "A 220V DC shunt motor has an armature resistance of 0.4Ω and field resistance of 110Ω. The motor draws 40A from the supply at full load. Calculate: (a) Back EMF, (b) Power developed in the armature, (c) If the motor runs at 1200 RPM, find the torque developed.",
      givenData: [
        "Supply voltage V = 220 V",
        "Armature resistance Ra = 0.4 Ω",
        "Field resistance Rf = 110 Ω",
        "Line current IL = 40 A",
        "Speed N = 1200 RPM"
      ],
      required: "Calculate back EMF (Eb), power developed in armature (Pa), and torque developed (T)",
      steps: [
        {
          title: "Calculate Field Current",
          explanation: "In a shunt motor, field winding is connected across the supply, so field current depends only on supply voltage and field resistance.",
          calculation: "If = V/Rf = 220/110 = 2 A"
        },
        {
          title: "Calculate Armature Current",
          explanation: "Line current splits into field current and armature current in a shunt motor.",
          calculation: "Ia = IL - If = 40 - 2 = 38 A"
        },
        {
          title: "Calculate Back EMF",
          explanation: "Back EMF equals applied voltage minus voltage drop across armature resistance.",
          calculation: "Eb = V - IaRa = 220 - (38 × 0.4) = 220 - 15.2 = 204.8 V"
        },
        {
          title: "Calculate Power Developed in Armature",
          explanation: "Power developed (electromagnetic power) equals back EMF multiplied by armature current.",
          calculation: "Pa = Eb × Ia = 204.8 × 38 = 7782.4 W ≈ 7.78 kW"
        },
        {
          title: "Calculate Torque Developed",
          explanation: "Torque can be calculated from power and angular velocity. Convert RPM to rad/s first.",
          calculation: "ω = 2πN/60 = 2π × 1200/60 = 125.66 rad/s\nT = Pa/ω = 7782.4/125.66 = 61.92 N-m"
        }
      ],
      finalAnswer: "Back EMF = 204.8 V, Power developed = 7.78 kW, Torque = 61.92 N-m",
      interpretation: "The back EMF (204.8V) is about 93% of supply voltage, indicating the motor is running at a good speed. The remaining 7% is the voltage drop across armature resistance which appears as I²R copper loss."
    },
    typicalMistakes: [
      {
        mistake: "Using line current directly as armature current in shunt motors without subtracting field current",
        fix: "Always remember: In shunt motors, Ia = IL - If. The line current splits between field and armature circuits. Only in series motors does the full line current flow through the armature."
      },
      {
        mistake: "Forgetting that back EMF is zero at starting, leading to underestimation of starting current",
        fix: "At standstill, Eb = 0, so starting current = V/Ra, which can be 10-20 times the rated current. This is why starters (resistances or electronic controllers) are essential for DC motors."
      },
      {
        mistake: "Confusing lap and wave winding parallel paths when calculating EMF",
        fix: "For lap winding: A = P (parallel paths equal number of poles). For wave winding: A = 2 (always two parallel paths regardless of poles). Choose correctly based on the winding type mentioned."
      },
      {
        mistake: "Ignoring armature reaction effects when calculating EMF under load",
        fix: "Armature reaction weakens the main flux under load, reducing the actual EMF. In problems, if armature reaction is mentioned, reduce the flux accordingly (typically 3-5% reduction per unit armature current increase)."
      },
      {
        mistake: "Wrong unit conversions – mixing RPM with rad/s or not converting kW to W",
        fix: "Always convert: RPM to rad/s using ω = 2πN/60. Keep power in Watts for calculations, convert to kW only for final answers. Double-check units in every step."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the construction and working principle of a DC motor with a neat diagram.",
          marks: 10,
          intro: "A DC motor is an electromechanical device that converts direct current electrical energy into mechanical rotational energy based on the principle of electromagnetic force production.",
          points: [
            "Construction: Main parts include (1) Yoke/Frame – provides mechanical support and carries magnetic flux, (2) Pole cores and pole shoes – create main magnetic field, (3) Field windings – carry DC current to produce magnetic flux, (4) Armature core – made of laminated silicon steel to reduce eddy current losses, (5) Armature winding – carries current and experiences force, (6) Commutator – converts AC EMF to DC, (7) Brushes – conduct current to rotating armature, (8) Bearings – reduce friction and support shaft",
            "Working Principle: When current flows through armature conductors placed in magnetic field, a force F = BIL acts on each conductor (Fleming's Left Hand Rule). This force creates a torque that rotates the armature.",
            "Role of Commutator: As the armature rotates, the commutator reverses the current direction in conductors every half revolution. This ensures that the force on conductors always acts in the same direction, maintaining continuous rotation.",
            "Back EMF: As the armature rotates, it cuts magnetic flux and generates a back EMF (Eb) that opposes the applied voltage. Eb = V - IaRa. This back EMF limits the armature current and makes the motor self-regulating.",
            "Speed Equation: N ∝ (V - IaRa)/Φ shows that speed can be controlled by varying voltage, armature resistance, or field flux."
          ],
          conclusion: "DC motors provide excellent speed control characteristics and high starting torque, making them suitable for applications like electric vehicles, cranes, and rolling mills where precise control is essential."
        },
        {
          question: "Derive the EMF equation for a DC generator and explain the significance of each term.",
          marks: 5,
          intro: "The EMF equation relates the generated voltage to the physical and electrical parameters of the DC machine.",
          points: [
            "Consider a DC generator with P poles, Z total armature conductors, N rpm speed, Φ weber flux per pole, and A parallel paths.",
            "Flux cut by one conductor in one revolution = PΦ webers",
            "Time for one revolution = 60/N seconds",
            "Average EMF induced per conductor = PΦN/60 volts (by Faraday's law)",
            "Total EMF = EMF per conductor × Conductors in each path = (PΦN/60) × (Z/A)",
            "Final EMF Equation: E = PΦNZ/(60A) volts",
            "Significance: E ∝ Φ (flux control), E ∝ N (speed control). For lap winding A=P, for wave winding A=2."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is the function of a commutator in a DC machine?",
          answer: "The commutator serves as a mechanical rectifier. In a DC generator, it converts the alternating EMF generated in the armature windings into unidirectional (DC) output voltage. In a DC motor, it reverses the current direction in armature conductors at appropriate positions to maintain continuous unidirectional torque. It consists of copper segments insulated from each other by mica, connected to the armature coils.",
          keyTerms: ["mechanical rectifier", "unidirectional", "copper segments", "mica insulation"]
        },
        {
          question: "Why is a starter necessary for DC motors?",
          answer: "At starting, the back EMF (Eb) is zero because the motor is stationary. The starting current = V/Ra, which can be 15-20 times the rated current since armature resistance is very small (typically 0.5-1Ω). This excessive current can damage the armature winding and commutator. A starter inserts external resistance in series with armature at start, then gradually cuts it out as motor accelerates and back EMF builds up.",
          keyTerms: ["back EMF zero", "excessive starting current", "external resistance", "gradual cut-out"]
        },
        {
          question: "Differentiate between lap and wave winding.",
          answer: "Lap Winding: Parallel paths (A) = Number of poles (P), suitable for high current-low voltage applications, used in machines requiring many brushes. Wave Winding: Parallel paths (A) = 2 always, suitable for high voltage-low current applications, requires only two brushes regardless of poles, gives higher EMF per conductor path.",
          keyTerms: ["parallel paths", "high current", "high voltage", "brush requirement"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Never start a DC motor without a starter or with field circuit open – it can cause dangerous overspeeding",
        "Ensure proper earthing of the machine frame before energizing",
        "Do not touch rotating parts – keep loose clothing and hair away from the shaft",
        "Start with minimum load and increase gradually while monitoring armature current",
        "If the motor fails to start, switch off immediately and check connections before retrying",
        "Use appropriate fuse rating and overload protection"
      ],
      observations: [
        "Measure armature and field resistance using multimeter before starting",
        "Observe starting current spike on ammeter – note how it decreases as motor accelerates",
        "Record no-load speed and current, then gradually apply mechanical load",
        "Plot speed vs armature current characteristic (should show slight droop)",
        "Note the direction of rotation and understand reversal methods",
        "Observe sparking at brushes – excessive sparking indicates commutation problems",
        "Measure temperature rise at various loads using thermometer or IR gun"
      ],
      vivaQuestions: [
        {
          question: "Why does a DC shunt motor have good speed regulation?",
          answer: "In a shunt motor, the field is connected across constant supply voltage, so flux remains nearly constant. When load increases, Ia increases causes small increase in IaRa drop, slightly reducing Eb. Since N ∝ Eb/Φ and Φ is constant, speed drops only slightly (3-5% from no-load to full-load), giving good speed regulation."
        },
        {
          question: "What happens if the field circuit of a DC motor is accidentally opened while running?",
          answer: "If field circuit opens, flux Φ becomes nearly zero (only residual magnetism remains). Since N ∝ 1/Φ, the motor will dangerously overspeed trying to maintain back EMF. The armature current shoots up, potentially damaging the motor. This is why field circuit protection and proper interlocking are essential safety features."
        },
        {
          question: "Why is armature core laminated?",
          answer: "The armature rotates in a magnetic field, causing the flux through it to change continuously. This changing flux induces eddy currents in the core material which cause power loss and heating. Laminating the core (using thin silicon steel sheets insulated from each other) increases the resistance to eddy current paths, significantly reducing these losses."
        },
        {
          question: "How can you reverse the direction of rotation of a DC motor?",
          answer: "Rotation direction can be reversed by reversing either the armature current direction OR the field current direction, but not both simultaneously. Practically, reversing armature connections is preferred as field winding has high inductance causing voltage spikes during switching. For quick reversal, use a DPDT switch in the armature circuit."
        },
        {
          question: "What is armature reaction and how does it affect machine performance?",
          answer: "Armature reaction is the effect of armature flux on main field flux. It causes: (1) Cross-magnetizing effect – distorts the main flux distribution, shifting the magnetic neutral axis, (2) Demagnetizing effect – weakens the main flux under load, reducing generated EMF. Remedies include using compensating windings and interpoles."
        },
        {
          question: "Why are interpoles used in DC machines?",
          answer: "Interpoles (commutating poles) are small poles placed between main poles. They produce a flux that neutralizes the armature reaction flux in the commutation zone, helping achieve sparkless commutation. Interpole winding carries armature current, so its strength automatically adjusts with load, providing automatic compensation."
        },
        {
          question: "Explain the significance of back EMF in a DC motor.",
          answer: "Back EMF (Eb): (1) Opposes applied voltage, limiting armature current to safe value during running, (2) Makes motor self-regulating – if load increases, speed drops, Eb drops, more current flows to meet increased torque demand, (3) Converts electrical energy to mechanical – power converted = Eb × Ia, (4) At starting Eb=0, hence high starting current requiring starters."
        }
      ]
    }
  },

  // ============================================
  // TOPIC 2: TRANSFORMERS – THEORY AND APPLICATIONS
  // ============================================
  'transformers': {
    conceptOverview: {
      paragraphs: [
        "A transformer is a static electrical device that transfers electrical energy from one circuit to another through electromagnetic induction, without any change in frequency. It works on the principle of mutual induction – when alternating current flows through the primary winding, it creates an alternating magnetic flux in the core, which links with the secondary winding and induces an EMF in it.",
        "Transformers are the backbone of our electrical power system. Without them, efficient long-distance power transmission would be impossible. They allow us to step up voltage for transmission (reducing I²R losses) and step down for safe distribution and utilization. Every electrical engineer must understand transformer operation, losses, efficiency, and testing methods thoroughly.",
        "You encounter transformers everywhere – from the massive power transformers in substations handling hundreds of MVA, to the small adapters charging your phone. Distribution transformers supply power to homes, instrument transformers help in metering and protection, and isolation transformers provide safety in medical equipment. The same fundamental principles apply to all these applications."
      ],
      realWorldApplications: [
        "Power transmission and distribution networks (step-up and step-down)",
        "Industrial power supply systems and factory substations",
        "Instrument transformers (CT and PT) for metering and protection",
        "Isolation transformers in medical equipment and sensitive electronics",
        "Welding transformers providing high current at low voltage",
        "Electronic power supplies and battery chargers",
        "Audio transformers for impedance matching"
      ]
    },
    keyFormulas: [
      {
        equation: "E₁ = 4.44 f N₁ Φₘ",
        symbols: [
          "E₁ = Induced EMF in primary (Volts)",
          "f = Frequency (Hz)",
          "N₁ = Number of primary turns",
          "Φₘ = Maximum flux in core (Webers)"
        ],
        usage: "EMF equation – use this to calculate voltage induced in any winding. For secondary: E₂ = 4.44 f N₂ Φₘ. The ratio E₁/E₂ = N₁/N₂ is the transformation ratio."
      },
      {
        equation: "K = V₂/V₁ = N₂/N₁ = I₁/I₂",
        symbols: [
          "K = Transformation ratio (turns ratio)",
          "V₂/V₁ = Voltage ratio",
          "N₂/N₁ = Turns ratio",
          "I₁/I₂ = Inverse current ratio (for ideal transformer)"
        ],
        usage: "Use this fundamental ratio for voltage and current calculations. K < 1 for step-down transformer, K > 1 for step-up transformer. V₁I₁ ≈ V₂I₂ (power equality)."
      },
      {
        equation: "η = (V₂I₂cosθ₂) / (V₂I₂cosθ₂ + Wᵢ + Wᶜᵤ) × 100%",
        symbols: [
          "η = Efficiency (%)",
          "V₂I₂cosθ₂ = Output power (Watts)",
          "Wᵢ = Iron (core) losses = constant",
          "Wᶜᵤ = Copper losses = I²R (depends on load)"
        ],
        usage: "Calculate transformer efficiency at any load. Iron losses are constant at all loads; copper losses vary with square of load current. Maximum efficiency occurs when Wᵢ = Wᶜᵘ."
      },
      {
        equation: "%Regulation = ((V₂ₙₗ - V₂ₗ) / V₂ₗ) × 100%",
        symbols: [
          "V₂ₙₗ = Secondary voltage at no load",
          "V₂ₗ = Secondary voltage at full load",
          "%Regulation = Change in voltage from no-load to full-load as % of rated"
        ],
        usage: "Measure how much voltage drops when load is applied. Good transformers have regulation < 5%. Can also be calculated using equivalent circuit: Regulation ≈ (Iₓ(Rₑcosθ + Xₑsinθ))/V₂ × 100%"
      },
      {
        equation: "Wᵢ = Wₕ + Wₑ = Kₕf Bₘ^1.6 + Kₑf²Bₘ²",
        symbols: [
          "Wᵢ = Total iron/core loss",
          "Wₕ = Hysteresis loss (proportional to f)",
          "Wₑ = Eddy current loss (proportional to f²)",
          "Bₘ = Maximum flux density",
          "Kₕ, Kₑ = Constants depending on material"
        ],
        usage: "Understanding core losses. Hysteresis loss due to magnetic domain reversal; eddy current loss due to induced currents in core. Both measured together in no-load test."
      }
    ],
    workedExample: {
      problem: "A single-phase 50 kVA, 2400/240 V transformer has the following test results: Open circuit test (LV side): 240 V, 1.5 A, 120 W. Short circuit test (HV side): 60 V, 20.8 A, 500 W. Calculate: (a) Equivalent circuit parameters referred to HV side, (b) Efficiency at full load 0.8 pf lagging, (c) Voltage regulation at full load 0.8 pf lagging.",
      givenData: [
        "Rating = 50 kVA, 2400/240 V (transformation ratio K = 10)",
        "OC Test (on LV): V₀ = 240 V, I₀ = 1.5 A, W₀ = 120 W",
        "SC Test (on HV): Vₛc = 60 V, Iₛc = 20.8 A, Wₛc = 500 W"
      ],
      required: "Calculate equivalent circuit parameters (R₀, X₀, Rₑ, Xₑ), full-load efficiency at 0.8 pf, and voltage regulation at 0.8 pf lagging",
      steps: [
        {
          title: "Calculate Iron Loss and No-Load Parameters from OC Test",
          explanation: "OC test gives iron losses (core losses) and excitation parameters. Since test was on LV side, we'll refer to HV side using K² for impedances.",
          calculation: "Iron losses Wᵢ = 120 W (constant at all loads)\ncos θ₀ = W₀/(V₀I₀) = 120/(240×1.5) = 0.333\nIw = I₀cos θ₀ = 1.5×0.333 = 0.5 A\nIm = I₀sin θ₀ = 1.5×0.943 = 1.414 A\nReferred to HV: R₀' = V₀K²/Iw = 240×100/0.5 = 48000 Ω\nX₀' = V₀K²/Im = 240×100/1.414 = 16970 Ω"
        },
        {
          title: "Calculate Copper Loss and Series Parameters from SC Test",
          explanation: "SC test gives copper losses at the test current and equivalent resistance and reactance. Test current should be compared with rated current.",
          calculation: "Rated HV current = 50000/2400 = 20.83 A ≈ Iₛc\nFull load copper loss Wᶜᵘ = 500 W\nRₑ = Wₛc/Iₛc² = 500/(20.8)² = 1.156 Ω\nZₑ = Vₛc/Iₛc = 60/20.8 = 2.885 Ω\nXₑ = √(Zₑ² - Rₑ²) = √(2.885² - 1.156²) = 2.64 Ω"
        },
        {
          title: "Calculate Full Load Efficiency",
          explanation: "At full load, output power = Rating × power factor. Total losses = Iron losses + Copper losses.",
          calculation: "Output = 50000 × 0.8 = 40000 W = 40 kW\nTotal losses = Wᵢ + Wᶜᵤ = 120 + 500 = 620 W\nInput = Output + Losses = 40000 + 620 = 40620 W\nη = 40000/40620 × 100 = 98.47%"
        },
        {
          title: "Calculate Voltage Regulation",
          explanation: "Use approximate regulation formula with resistance and reactance drops. For lagging pf, both drops add.",
          calculation: "cos θ = 0.8, sin θ = 0.6\nI = 20.83 A (full load HV current)\n%Reg = (I(Rₑcos θ + Xₑsin θ)/V₁) × 100\n= (20.83(1.156×0.8 + 2.64×0.6)/2400) × 100\n= (20.83 × 2.51/2400) × 100\n= 2.18%"
        }
      ],
      finalAnswer: "Equivalent circuit (HV): Rₑ = 1.156 Ω, Xₑ = 2.64 Ω, R₀ = 48 kΩ, X₀ = 16.97 kΩ. Efficiency at FL, 0.8 pf = 98.47%. Voltage regulation at 0.8 pf lag = 2.18%",
      interpretation: "The high efficiency (98.47%) is typical for transformers of this size. The low regulation (2.18%) indicates the secondary voltage remains fairly stable from no-load to full-load. Maximum efficiency would occur when copper loss equals iron loss, which is at about 49% of full load."
    },
    typicalMistakes: [
      {
        mistake: "Confusing which side the OC and SC tests should be performed on",
        fix: "OC test is performed on LV side (for safety – lower voltage to apply), SC test on HV side (for convenience – rated current is lower). If test data is given for opposite sides, use K² to refer impedance parameters."
      },
      {
        mistake: "Forgetting to square the transformation ratio when referring impedances",
        fix: "Impedances are referred using K² (voltage ratio squared). If Rₑ on LV side = 0.01Ω and K = 10, then Rₑ on HV side = 0.01 × 10² = 1Ω. Currents use ratio 1/K, voltages use K."
      },
      {
        mistake: "Using the same copper loss for all loads instead of scaling with load current squared",
        fix: "Copper loss at any load = (Load fraction)² × Full load copper loss. At half load, Wᶜᵤ = (0.5)² × Wᶜᵤ(FL) = 0.25 × Wᶜᵤ(FL). Iron losses remain constant regardless of load."
      },
      {
        mistake: "Adding resistive and reactive voltage drops directly instead of considering their phase",
        fix: "For lagging pf: %Reg ≈ IR cosθ + IX sinθ (both positive). For leading pf: %Reg ≈ IR cosθ - IX sinθ (X drop subtracts). At unity pf, regulation is purely resistive."
      },
      {
        mistake: "Calculating kVA rating from OC test power (which gives only losses)",
        fix: "OC test wattmeter reading gives core losses only, not the transformer rating. SC test power gives copper losses at the test current. Actual rating must be calculated from nameplate or given voltage × rated current."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain Open Circuit (OC) and Short Circuit (SC) tests on a transformer. How are these test results used to determine efficiency and regulation?",
          marks: 10,
          intro: "OC and SC tests are the standard methods to determine transformer equivalent circuit parameters and predict performance without actually loading the transformer to its full rating.",
          points: [
            "Open Circuit Test: Performed on LV side with HV open. LV side is supplied rated voltage. Instruments measure V₀, I₀, W₀. Since current is small (2-5% of rated), copper loss is negligible. W₀ represents core losses (hysteresis + eddy current). From measurements: cos θ₀ = W₀/(V₀I₀), gives magnetizing and core-loss current components. Shunt branch parameters: R₀ = V₀/Iw, X₀ = V₀/Im.",
            "Short Circuit Test: Performed on HV side with LV short-circuited. Reduced voltage is applied to circulate rated current. Since voltage is low (5-10% of rated), flux and core loss are negligible. Wₛc represents copper losses at rated current. Series parameters: Rₑ = Wₛc/Iₛc², Zₑ = Vₛc/Iₛc, Xₑ = √(Zₑ² - Rₑ²).",
            "Efficiency Calculation: η = Output/(Output + Wᵢ + x²Wᶜᵤ) where Wᵢ = OC test watts (constant), Wᶜᵤ = SC test watts at rated current, x = load fraction. Maximum efficiency at x = √(Wᵢ/Wᶜᵤ).",
            "Regulation Calculation: Using equivalent circuit values, %Reg = (IRₑcosθ ± IXₑsinθ)/V × 100. Plus for lagging, minus for leading power factor.",
            "Advantages: These tests require only 2-3% of full-load power input, avoiding heat and energy costs of direct loading. Equivalent circuit enables calculation at any load and power factor."
          ],
          conclusion: "OC and SC tests together provide complete equivalent circuit, enabling accurate prediction of efficiency, regulation, and performance at any loading condition without requiring a load capable of absorbing full transformer power."
        },
        {
          question: "Derive the condition for maximum efficiency of a transformer and explain its practical significance.",
          marks: 5,
          intro: "Transformer efficiency depends on the balance between fixed losses (iron/core losses) and variable losses (copper losses).",
          points: [
            "Let output power = V₂I₂cosθ = x × kVA × cosθ, where x = load fraction",
            "Iron losses (Wᵢ) are constant at all loads (depend on voltage and frequency only)",
            "Copper losses at load fraction x = x²Wᶜᵤ (vary with square of current)",
            "Efficiency η = Output/(Output + Wᵢ + x²Wᶜᵤ)",
            "For maximum efficiency, dη/dx = 0, solving: x²Wᶜᵤ = Wᵢ",
            "Condition: Copper losses = Iron losses at maximum efficiency",
            "Load at max efficiency: x = √(Wᵢ/Wᶜᵤ) as fraction of full load",
            "Practical significance: Distribution transformers are designed with Wᵢ < Wᶜᵤ (max η above FL), power transformers with Wᵢ ≈ Wᶜᵤ (max η around 50-75% load where they typically operate)"
          ]
        }
      ],
      shortAnswers: [
        {
          question: "Why is the transformer core laminated?",
          answer: "The transformer core is laminated (made of thin silicon steel sheets insulated with varnish) to reduce eddy current losses. When alternating flux passes through a solid core, it induces circulating currents (eddy currents) causing I²R heating loss. Laminations increase resistance to eddy current flow paths, reducing these losses proportional to (lamination thickness)². Typical lamination thickness is 0.35-0.5 mm.",
          keyTerms: ["eddy currents", "silicon steel", "lamination thickness", "I²R losses"]
        },
        {
          question: "Differentiate between core-type and shell-type transformers.",
          answer: "Core-type: Windings surround the core limbs; core forms single magnetic circuit; better cooling as windings are exposed; used for high voltage transformers. Shell-type: Core surrounds the windings; provides two parallel paths for flux; better mechanical strength; windings sandwiched between core shells; used for low voltage, high current applications.",
          keyTerms: ["winding arrangement", "magnetic circuit", "cooling", "mechanical strength"]
        },
        {
          question: "What is the purpose of conservator tank in a transformer?",
          answer: "The conservator is a small cylindrical tank connected to the main transformer tank through a pipe. It serves to: (1) Provide space for oil expansion due to temperature rise during loading, (2) Keep main tank completely filled with oil, (3) Reduce oil surface exposed to atmosphere (minimizing moisture absorption and oxidation), (4) Allow fitting of Buchholz relay in connecting pipe for fault protection.",
          keyTerms: ["oil expansion", "breathing", "Buchholz relay", "moisture protection"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Never exceed rated voltage – core saturation causes excessive excitation current",
        "Never open secondary of Current Transformer (CT) – dangerous high voltage develops",
        "Ensure proper grounding of transformer tank and core",
        "For SC test, apply voltage gradually – start from zero using variac",
        "Keep rated current limits in mind during SC test – avoid overheating",
        "Never touch terminals when transformer is energized"
      ],
      observations: [
        "In OC test, note that wattmeter shows low power (only core losses) despite full voltage",
        "In OC test, observe that no-load current is only 2-5% of rated current",
        "In SC test, observe that 5-10% of rated voltage circulates full-load current",
        "Record all three instruments simultaneously for accurate calculations",
        "Note the current waveform – should be sinusoidal at proper voltage",
        "During load test, observe temperature rise at different loading levels",
        "Listen for humming sound – excessive noise indicates loose laminations or core problems"
      ],
      vivaQuestions: [
        {
          question: "Why is OC test performed on LV side and SC test on HV side?",
          answer: "OC test requires applying rated voltage – safer to apply lower voltage (LV side). Since secondary is open, no current flows in secondary, so it doesn't matter which side is open. SC test requires circulating rated current – HV side has lower rated current (easier to handle with available ammeters and reduce safety hazard). Both approaches give same equivalent circuit when properly referred."
        },
        {
          question: "What losses are measured in OC test and SC test?",
          answer: "OC Test measures iron/core losses (hysteresis + eddy current). Since I₀ is very small (2-5% rated), copper loss I²R is negligible. SC Test measures copper losses (I²R in both windings). Since applied voltage is low (5-10%), the flux is low, making iron losses negligible."
        },
        {
          question: "How does transformer cooling affect its rating?",
          answer: "Transformer rating is limited by temperature rise, which depends on losses and cooling. Better cooling allows: (1) Higher current without exceeding temperature limits, (2) Smaller size for same rating, (3) Longer insulation life. Cooling methods: ONAN (weakest), ONAF, OFAF, OFWF (strongest). Rating increases typically 33% from ONAN to ONAF, and another 33% to OFAF."
        },
        {
          question: "Why is the efficiency of a transformer very high compared to rotating machines?",
          answer: "Transformer efficiency is 95-99% because: (1) No mechanical losses (friction, windage) – it's a static device, (2) No air gap – all flux links both windings through low-reluctance iron path, (3) High-grade silicon steel core minimizes hysteresis and eddy losses, (4) Copper losses at full load are only 1-2% of rating. Rotating machines have additional mechanical losses and air gap reluctance."
        },
        {
          question: "What is the all-day efficiency and where is it important?",
          answer: "All-day efficiency = (kWh output in 24h)/(kWh input in 24h). It's important for distribution transformers that remain connected but operate at varying loads throughout the day. A transformer may have high full-load efficiency but poor all-day efficiency if iron losses (which occur 24/7) are high compared to actual energy delivered. Distribution transformers are designed with low iron losses for good all-day efficiency."
        },
        {
          question: "What is exciting inrush current and why does it occur?",
          answer: "When a transformer is switched on, the first peak of magnetizing current can be 10-20 times normal no-load current. This occurs because: (1) Residual flux in core from previous operation, (2) If switched on at voltage zero-crossing, flux must start from zero but builds to double the normal value to maintain flux-voltage relationship, (3) Core saturates, causing extremely high current until flux stabilizes. This inrush current decays over several cycles."
        },
        {
          question: "How do you determine polarity of transformer windings and why is it important?",
          answer: "Polarity can be determined by: (1) DC kick test – apply DC to one winding and observe voltmeter deflection direction on other winding, (2) AC test – connect one terminal of each winding and measure voltage across remaining terminals (subtractive = same polarity, additive = opposite). Polarity is critical for: parallel operation, CT/PT secondary connections, and proper phase relationships in three-phase banks."
        }
      ]
    }
  },

  // ============================================
  // TOPIC 3: OP-AMPS & ANALOG ELECTRONICS
  // ============================================
  'op-amps-analog': {
    conceptOverview: {
      paragraphs: [
        "An Operational Amplifier (Op-Amp) is a high-gain DC-coupled amplifier with differential inputs and typically a single output. The name 'operational' comes from its original use in analog computers to perform mathematical operations like addition, subtraction, integration, and differentiation. Today, op-amps are the fundamental building blocks of analog electronics, used in everything from audio equipment to precision instrumentation.",
        "Understanding op-amps is crucial for electrical engineers because they simplify analog circuit design dramatically. With just a few external components, you can build amplifiers with precise gain, active filters, oscillators, comparators, and signal conditioning circuits. The two 'golden rules' of ideal op-amps – no current into inputs and equal input voltages with negative feedback – make analysis straightforward even for complex circuits.",
        "Real-world applications are everywhere: audio preamplifiers in music systems, sensor signal conditioning in industrial control, active filters in communication receivers, voltage regulators in power supplies, and analog computation in control systems. The ubiquitous 741 op-amp has been in production since 1968, and modern variants like TL082, LM358, and precision amplifiers like OP07 serve countless applications."
      ],
      realWorldApplications: [
        "Audio amplifiers and preamplifiers in music systems",
        "Sensor signal conditioning (temperature, pressure, strain gauges)",
        "Active filters for signal processing and noise rejection",
        "Voltage regulators and reference circuits",
        "Analog computation in PID controllers",
        "Instrumentation amplifiers for biomedical equipment",
        "Comparators for level detection and zero-crossing detection",
        "Oscillators and waveform generators"
      ]
    },
    keyFormulas: [
      {
        equation: "Av = -Rf/Rin (Inverting Amplifier)",
        symbols: [
          "Av = Closed-loop voltage gain",
          "Rf = Feedback resistor (Ω)",
          "Rin = Input resistor (Ω)",
          "Negative sign indicates 180° phase inversion"
        ],
        usage: "Use for inverting amplifier configuration. Input impedance equals Rin. Gain magnitude can be >1 or <1 depending on Rf/Rin ratio. Virtual ground at inverting input."
      },
      {
        equation: "Av = 1 + Rf/Rin (Non-Inverting Amplifier)",
        symbols: [
          "Av = Closed-loop voltage gain (always ≥1)",
          "Rf = Feedback resistor",
          "Rin = Resistor from inverting input to ground",
          "No phase inversion (output in phase with input)"
        ],
        usage: "Use for non-inverting configuration when you need high input impedance and no phase inversion. Minimum gain is 1 (when Rf = 0 or Rin = ∞, giving buffer/voltage follower)."
      },
      {
        equation: "Vout = -Rf(V1/R1 + V2/R2 + V3/R3) (Summing Amplifier)",
        symbols: [
          "Vout = Output voltage",
          "V1, V2, V3 = Input voltages",
          "R1, R2, R3 = Input resistors",
          "Rf = Feedback resistor"
        ],
        usage: "Inverting summing amplifier – adds multiple signals with individual gains. If all Ri = Rf = R, then Vout = -(V1 + V2 + V3). Use for audio mixing, DAC summing, averaging."
      },
      {
        equation: "Vout = -RC × dVin/dt (Differentiator)",
        symbols: [
          "Vout = Output voltage",
          "R = Feedback resistance (Ω)",
          "C = Input capacitance (F)",
          "dVin/dt = Rate of change of input voltage"
        ],
        usage: "Output is proportional to derivative of input. Produces high output for fast-changing signals. Practical circuits need high-frequency limiting resistor to reduce noise amplification."
      },
      {
        equation: "Vout = -(1/RC) × ∫Vin dt (Integrator)",
        symbols: [
          "Vout = Output voltage",
          "R = Input resistance (Ω)",
          "C = Feedback capacitance (F)",
          "∫Vin dt = Time integral of input voltage"
        ],
        usage: "Output is proportional to integral of input. Converts square wave to triangle wave. Practical circuits need high-value parallel resistor with C to prevent DC drift (saturation)."
      },
      {
        equation: "GBW = Av × Bandwidth (Constant)",
        symbols: [
          "GBW = Gain-Bandwidth Product (Hz)",
          "Av = Closed-loop gain (magnitude)",
          "Bandwidth = -3dB frequency of closed-loop response",
          "For 741: GBW ≈ 1 MHz"
        ],
        usage: "Fundamental op-amp limitation. Higher gain means lower bandwidth. If 741 (GBW = 1 MHz) is used at gain 100, bandwidth = 1MHz/100 = 10 kHz. Choose op-amp with sufficient GBW for your application."
      }
    ],
    workedExample: {
      problem: "Design a non-inverting amplifier using an op-amp to amplify a sensor signal from 0-50mV to 0-5V range. The sensor has 10kΩ source impedance. Calculate the required component values. If using a 741 op-amp (GBW = 1MHz), what is the maximum signal frequency that can be amplified?",
      givenData: [
        "Input voltage range: 0-50 mV",
        "Output voltage range: 0-5 V",
        "Sensor source impedance: 10 kΩ",
        "Op-amp: 741 with GBW = 1 MHz"
      ],
      required: "Design the amplifier circuit (find resistor values) and determine maximum operating frequency",
      steps: [
        {
          title: "Calculate Required Voltage Gain",
          explanation: "The gain needed to convert 50mV to 5V is simply the output to input ratio.",
          calculation: "Av = Vout(max)/Vin(max) = 5V/50mV = 100"
        },
        {
          title: "Choose Non-Inverting Configuration",
          explanation: "Non-inverting is chosen because: (1) high input impedance won't load the sensor, (2) no phase inversion needed for DC signals.",
          calculation: "For non-inverting: Av = 1 + Rf/R1\n100 = 1 + Rf/R1\nRf/R1 = 99"
        },
        {
          title: "Select Practical Resistor Values",
          explanation: "Choose R1 in kΩ range to minimize offset current effects. Common values preferred.",
          calculation: "Let R1 = 1 kΩ\nThen Rf = 99 × 1 kΩ = 99 kΩ\nUse standard value: Rf = 100 kΩ (gives gain = 101, acceptable)\nAlternatively: R1 = 1 kΩ, Rf = 100 kΩ in series with 1 kΩ pot for adjustment"
        },
        {
          title: "Verify Input Impedance",
          explanation: "Non-inverting input impedance is very high (typically >1 MΩ for 741), so it won't load the 10kΩ sensor.",
          calculation: "Input impedance of non-inverting amp ≈ Ri(op-amp) × (1 + Av×β) >> 10 kΩ ✓"
        },
        {
          title: "Calculate Maximum Signal Frequency",
          explanation: "Using the gain-bandwidth product relationship to find the -3dB bandwidth at this gain.",
          calculation: "Bandwidth = GBW/Av = 1 MHz/100 = 10 kHz\nMaximum usable frequency ≈ 10 kHz"
        }
      ],
      finalAnswer: "Design: Non-inverting amplifier with R1 = 1 kΩ, Rf = 100 kΩ (use 99 kΩ or adjustable for exact gain of 100). Maximum signal frequency = 10 kHz. For higher frequencies, use a faster op-amp like TL082 (GBW = 3 MHz) or AD711 (GBW = 4 MHz).",
      interpretation: "The 10 kHz bandwidth is adequate for most sensor applications (temperature, pressure, flow sensors change slowly). For audio applications requiring 20 kHz bandwidth at this gain, you would need an op-amp with GBW ≥ 2 MHz."
    },
    typicalMistakes: [
      {
        mistake: "Forgetting the '1' in non-inverting gain formula, writing Av = Rf/Rin instead of Av = 1 + Rf/Rin",
        fix: "Non-inverting gain is ALWAYS ≥ 1. The formula is Av = 1 + Rf/Rin. A voltage follower (Rf = 0) has gain = 1. If you calculate gain < 1, you've made an error or need inverting configuration with Rf < Rin."
      },
      {
        mistake: "Ignoring negative sign in inverting amplifier output, getting wrong phase relationship",
        fix: "Inverting amplifier ALWAYS inverts the signal (180° phase shift). If input is +1V with gain -10, output is -10V, not +10V. This matters for feedback systems, signal processing, and power supply considerations."
      },
      {
        mistake: "Designing circuits that exceed op-amp output voltage swing (saturation)",
        fix: "Op-amp output cannot exceed power supply rails. With ±15V supply, a 741 swings about ±13V. With gains over 100, even small DC offset at input will saturate output. Include DC blocking or offset adjustment in high-gain circuits."
      },
      {
        mistake: "Not considering bandwidth reduction with increased gain",
        fix: "GBW product is constant. Gain of 1000 with 741 (1 MHz GBW) gives only 1 kHz bandwidth! Always calculate bandwidth = GBW/gain and verify it exceeds your signal frequency. Choose appropriate op-amp for the application."
      },
      {
        mistake: "Using integrator without DC stabilization, causing output to drift to rail",
        fix: "Practical integrators need a large resistor (1-10 MΩ) in parallel with the feedback capacitor to provide DC feedback and prevent bias current from charging the capacitor. This limits low-frequency integration time constant."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the working of an op-amp as (i) Inverting amplifier (ii) Non-inverting amplifier with circuit diagrams and derive expressions for voltage gain.",
          marks: 10,
          intro: "An operational amplifier can be configured as a closed-loop amplifier using negative feedback. The two basic configurations are inverting and non-inverting amplifiers.",
          points: [
            "(i) Inverting Amplifier: Input applied to inverting terminal through resistor Rin, feedback from output to inverting terminal through Rf, non-inverting terminal grounded. Using virtual ground concept (V- ≈ V+ = 0) and Kirchhoff's current law: Current through Rin = Vin/Rin flows into node. Current through Rf = Vout/Rf flows out of node. Since no current enters op-amp (ideal): Vin/Rin = -Vout/Rf. Therefore, Av = Vout/Vin = -Rf/Rin. The negative sign indicates 180° phase inversion.",
            "(ii) Non-Inverting Amplifier: Input applied directly to non-inverting terminal, voltage divider (R1-Rf) in feedback from output to inverting terminal. Using virtual short concept (V+ = V-): V- = V+ = Vin. Voltage divider: V- = Vout × R1/(R1+Rf). Therefore: Vin = Vout × R1/(R1+Rf). Solving: Av = Vout/Vin = 1 + Rf/R1. Gain is always positive (no inversion) and ≥ 1.",
            "Comparison: Inverting has lower input impedance (= Rin), while non-inverting has very high input impedance. Inverting can have gain < 1; non-inverting always ≥ 1. Both provide stable, predictable gain determined by external resistors, not the op-amp's high open-loop gain.",
            "Practical considerations: Choose resistors in kΩ to MΩ range. Higher resistors reduce power consumption but increase noise and offset effects. For precision, use 1% tolerance resistors and consider offset nulling."
          ],
          conclusion: "Both configurations leverage negative feedback to create stable amplifiers with gain determined solely by external resistor ratios, making them fundamental building blocks for analog signal processing."
        },
        {
          question: "Describe the ideal characteristics of an operational amplifier and explain how practical op-amps differ from ideal.",
          marks: 5,
          intro: "An ideal op-amp is a theoretical device with perfect characteristics that simplify circuit analysis.",
          points: [
            "Ideal Op-Amp Characteristics: (1) Infinite open-loop gain (Av → ∞), (2) Infinite input impedance (Rin → ∞, no current flows into inputs), (3) Zero output impedance (can drive any load without voltage drop), (4) Infinite bandwidth (flat frequency response from DC to infinity), (5) Zero offset voltage (Vout = 0 when V+ = V-), (6) Infinite CMRR (complete rejection of common-mode signals), (7) Infinite slew rate (output can change infinitely fast)",
            "Practical Op-Amp (741 example): Open-loop gain ≈ 200,000 (not infinite), Input impedance ≈ 2 MΩ (not infinite), Output impedance ≈ 75 Ω (not zero), GBW ≈ 1 MHz (limited bandwidth), Input offset voltage ≈ 2 mV (not zero), CMRR ≈ 90 dB (not infinite), Slew rate ≈ 0.5 V/µs (limited)",
            "Impact on design: High but finite gain means closed-loop gain < ideal. Limited bandwidth restricts high-frequency operation. Offset voltage causes DC errors in precision circuits. Slew rate limits large-signal high-frequency response. Input bias currents cause errors with high-impedance sources."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is virtual ground in an op-amp circuit?",
          answer: "Virtual ground is the condition at the inverting input of an op-amp in negative feedback configuration where the voltage is maintained at 0V (same as ground) but no current flows to ground through it. It occurs because the high open-loop gain forces the differential input to nearly zero, and if non-inverting input is grounded, the inverting input is at virtual ground. This concept simplifies analysis of inverting amplifier, summing amplifier, and current-to-voltage converter circuits.",
          keyTerms: ["0V potential", "no current to ground", "negative feedback", "high open-loop gain"]
        },
        {
          question: "What is slew rate and how does it affect op-amp circuits?",
          answer: "Slew rate is the maximum rate of change of output voltage, expressed in V/µs. For 741, it's about 0.5 V/µs. It limits the maximum frequency at which large signals can be amplified without distortion. Maximum undistorted frequency for a sine wave of peak amplitude Vp is: fmax = SR/(2πVp). For 741 with 10V peak output: fmax = 0.5×10⁶/(2π×10) = 8 kHz. Exceeding this causes slew-rate limiting (triangular distortion of sine waves).",
          keyTerms: ["V/µs", "large signal bandwidth", "slew-rate limiting", "distortion"]
        },
        {
          question: "What is CMRR and why is it important?",
          answer: "CMRR (Common Mode Rejection Ratio) is the ratio of differential gain to common-mode gain, expressed in dB: CMRR = 20 log(Ad/Acm). A signal appearing equally on both inputs (common-mode) should ideally produce zero output. High CMRR (90-120 dB) is essential for rejecting noise and interference picked up equally by both input leads. Important in instrumentation amplifiers measuring small differential signals in noisy environments, like biomedical ECG measurements.",
          keyTerms: ["differential gain", "common-mode gain", "noise rejection", "dB ratio"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Connect power supply correctly – reversed polarity destroys the IC immediately",
        "Do not exceed absolute maximum voltage ratings (typically ±18V for 741)",
        "Avoid shorting output to supply rails directly – use current limiting",
        "Handle CMOS op-amps carefully – static discharge can damage them",
        "Add bypass capacitors (0.1µF) close to IC power pins to prevent oscillations",
        "Do not exceed input voltage beyond supply rails (can damage input stage)"
      ],
      observations: [
        "Verify DC output is near zero before applying AC input (offset check)",
        "Observe input and output waveforms on oscilloscope simultaneously",
        "Check for phase inversion in inverting amp, no inversion in non-inverting",
        "Increase frequency and observe gain rolloff (find -3dB point)",
        "Increase input amplitude and observe clipping at supply rails",
        "At high gains, look for oscillations (may need compensation)",
        "Measure actual gain vs calculated and note any discrepancy",
        "Observe slew-rate limiting with large fast signals (triangular output)"
      ],
      vivaQuestions: [
        {
          question: "Why is negative feedback used in op-amp circuits?",
          answer: "Negative feedback reduces gain but provides: (1) Stable, predictable gain determined by external components, (2) Increased bandwidth proportional to feedback amount, (3) Reduced distortion (output tries to match input × gain), (4) Reduced sensitivity to op-amp parameter variations, (5) Lower output impedance. Without feedback, the 200,000 open-loop gain is unstable and useless for linear amplification."
        },
        {
          question: "How does a voltage follower work and where is it used?",
          answer: "Voltage follower (buffer) is a non-inverting amp with Rf = 0 (output connected directly to inverting input) and no Rin. Gain = 1 + 0/∞ = 1. It provides: unity gain, extremely high input impedance (doesn't load source), low output impedance (can drive low-impedance loads). Used as buffer between high-impedance source and low-impedance load, such as before ADC inputs or between filter stages."
        },
        {
          question: "What happens if positive feedback is applied to an op-amp?",
          answer: "Positive feedback causes the output to drive further in the direction of any small disturbance, leading to: (1) In bistable configuration – output latches to +Vsat or -Vsat creating a comparator with hysteresis (Schmitt trigger), (2) In oscillator configuration – sustained oscillations when loop gain = 1 at a particular frequency. Unintended positive feedback (from layouts or poor bypassing) causes unwanted oscillations."
        },
        {
          question: "Why are bypass capacitors needed on op-amp power pins?",
          answer: "Op-amps draw varying current from supply as output changes. Long supply wires have inductance that opposes current changes, causing supply voltage variations that can feed back to input and cause oscillations. Bypass capacitors (0.1µF ceramic placed close to IC) provide local charge reservoir, maintaining stable supply during transients and preventing high-frequency feedback through supply rails."
        },
        {
          question: "How do input bias currents affect op-amp circuits?",
          answer: "Op-amp inputs draw small DC currents (100nA to 1µA typical for BJT input op-amps, <50pA for JFET/CMOS). These currents flowing through source resistances create offset voltages. Minimize by: (1) Using equal resistance seen from both inputs (add compensation resistor), (2) Keeping resistances low in high-precision circuits, (3) Using FET-input or chopper-stabilized op-amps when needed, (4) AC coupling input for AC-only applications."
        },
        {
          question: "What is the significance of gain-bandwidth product?",
          answer: "GBW is constant for a given op-amp – trading off between gain and bandwidth. For 741 (GBW = 1 MHz): gain 1 → BW = 1 MHz, gain 10 → BW = 100 kHz, gain 100 → BW = 10 kHz, gain 1000 → BW = 1 kHz. This limits applications – high-gain audio (20 kHz) needs GBW > 2 MHz. Choose op-amp with GBW > (required gain × max signal frequency). Modern op-amps offer GBW from 1 MHz to >1 GHz."
        },
        {
          question: "Explain offset null adjustment in 741 op-amp.",
          answer: "Due to manufacturing mismatches, 741 output may not be exactly zero when inputs are shorted. This input offset voltage (±2mV typical) is amplified by closed-loop gain, causing significant DC error in high-gain circuits. Pins 1 and 5 of 741 connect to a 10kΩ potentiometer with wiper to -Vcc, allowing adjustment of internal bias to null the offset. Newer precision op-amps (OP07, LT1001) have much lower offset (<100µV) and may not need external null."
        }
      ]
    }
  }
};

// Default placeholder for topics without full content yet
export const defaultTopicContent: TopicContent = {
  conceptOverview: {
    paragraphs: [
      "This topic content is being prepared. Please check back soon for the complete learning material.",
      "In the meantime, you can explore the quiz section to test your existing knowledge on this subject."
    ],
    realWorldApplications: [
      "Content coming soon..."
    ]
  },
  keyFormulas: [],
  workedExample: {
    problem: "Example problem coming soon...",
    givenData: [],
    required: "",
    steps: [],
    finalAnswer: "",
  },
  typicalMistakes: [],
  examCorner: {
    longAnswers: [],
    shortAnswers: []
  },
  labPractical: {
    safetyNotes: [],
    observations: [],
    vivaQuestions: []
  }
};
