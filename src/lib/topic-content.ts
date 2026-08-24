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
    apparatus?: string[];
    procedure?: string[];
    observations: string[];
    vivaQuestions: Array<{
      question: string;
      answer: string;
    }>;
    virtualLabLink?: {
      title: string;
      url: string;
      toolName: string;
    };
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
          "z = Total number of armature conductors",
          "Ia = Armature current (Amperes)",
          "A = Number of parallel paths"
        ],
        usage: "Use this to calculate electromagnetic torque developed in a DC motor. Notice that Torque is directly proportional to flux (Φ) and armature current (Ia)."
      },
      {
        equation: "N ∝ Eb / Φ = (V - IaRa) / Φ",
        symbols: [
          "N = Speed (RPM)",
          "Eb = Back EMF (Volts)",
          "Φ = Flux per pole (Webers)",
          "V = Terminal voltage (Volts)",
          "Ia = Armature current (Amperes)",
          "Ra = Armature resistance (Ohms)"
        ],
        usage: "The golden formula for DC motor speed control. Speed can be controlled by varying voltage (V), armature resistance (Ra), or field flux (Φ)."
      }
    ],
    workedExample: {
      problem: "A 4-pole, 220V DC shunt motor has an armature resistance of 0.5Ω and a field resistance of 220Ω. When running on no-load, it takes 3A from the supply and runs at 1000 RPM. Calculate the speed when the motor takes a full-load current of 25A from the supply. Assume that armature reaction weakens the field flux by 3% at full load.",
      givenData: [
        "Supply voltage, V = 220 V",
        "Number of poles, P = 4",
        "Armature resistance, Ra = 0.5 Ω",
        "Field resistance, Rsh = 220 Ω",
        "No-load line current, IL0 = 3 A",
        "No-load speed, N0 = 1000 RPM",
        "Full-load line current, IL = 25 A",
        "Field flux reduction at full load = 3% (so Φ_FL = 0.97 × Φ0)"
      ],
      required: "Speed of the motor at full load (N_FL in RPM)",
      steps: [
        {
          title: "Step 1: Calculate field current (constant in shunt motor)",
          explanation: "In a shunt motor, field winding is connected in parallel with supply, so field current is constant (neglecting armature reaction initially).",
          calculation: "Ish = V / Rsh = 220 / 220 = 1.0 A"
        },
        {
          title: "Step 2: Calculate no-load armature current and back EMF",
          explanation: "Armature current is line current minus field current. Then calculate back EMF using Eb0 = V - Ia0*Ra.",
          calculation: "Ia0 = IL0 - Ish = 3.0 - 1.0 = 2.0 A\nEb0 = V - Ia0 × Ra = 220 - (2.0 × 0.5) = 220 - 1.0 = 219.0 V"
        },
        {
          title: "Step 3: Calculate full-load armature current and back EMF",
          explanation: "Find full-load armature current, then calculate full-load back EMF.",
          calculation: "Ia_FL = IL - Ish = 25.0 - 1.0 = 24.0 A\nEb_FL = V - Ia_FL × Ra = 220 - (24.0 × 0.5) = 220 - 12.0 = 208.0 V"
        },
        {
          title: "Step 4: Relate speed to back EMF and flux",
          explanation: "Using the speed-EMF relationship: N ∝ Eb / Φ, so N_FL / N0 = (Eb_FL / Eb0) × (Φ0 / Φ_FL).",
          calculation: "N_FL / 1000 = (208.0 / 219.0) × (1.0 / 0.97)\nN_FL / 1000 = 0.9498 × 1.0309 = 0.9792\nN_FL = 1000 × 0.9792 = 979.2 RPM"
        }
      ],
      finalAnswer: "979.2 RPM (or approximately 980 RPM)",
      interpretation: "The motor speed drops only slightly from 1000 RPM (no-load) to 979.2 RPM (full-load) – a speed drop of only about 2%. This demonstrates why DC shunt motors are called 'constant-speed motors' and are ideal for industrial drives requiring stable speeds under varying load conditions."
    },
    typicalMistakes: [
      {
        mistake: "Confusing line current with armature current in DC shunt motors",
        fix: "Always remember: For a shunt motor, Ia = IL - Ish. For a shunt generator, Ia = IL + Ish. Never use line current directly in Eb = V - IaRa."
      },
      {
        mistake: "Forgetting that A = 2 for wave winding and A = P for lap winding",
        fix: "In the EMF equation E = PΦNz / 60A: For Lap winding, A = P (number of poles). For Wave winding, A = 2 ALWAYS (regardless of number of poles)."
      },
      {
        mistake: "Assuming back EMF is zero during normal running condition",
        fix: "Back EMF is ONLY zero at the instant of starting (N=0). During normal running, back EMF is nearly equal to terminal voltage (Eb ≈ 0.9 to 0.95 × V)."
      },
      {
        mistake: "Starting a DC series motor on no-load",
        fix: "NEVER start a DC series motor on no-load! On no-load, current is very small, so flux Φ ≈ 0. Since N ∝ 1/Φ, the motor will accelerate to dangerously high speeds and destroy itself mechanically."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the working principle of a DC motor. Derive the expression for back EMF and torque developed in a DC motor.",
          marks: 10,
          intro: "A DC motor is an electromechanical device that converts direct current electrical energy into mechanical rotational energy based on the principle of Lorentz force.",
          points: [
            "Working Principle: When a current-carrying conductor is placed in a magnetic field, it experiences a mechanical force given by F = B × I × L × sin(θ). In a DC motor, conductors on opposite sides of the armature experience forces in opposite directions, producing a continuous rotational torque.",
            "Back EMF Derivation: As the armature rotates in the magnetic field, conductors cut flux lines, inducing an EMF according to Faraday's law. By Lenz's law, this induced EMF opposes the applied terminal voltage, hence called 'back EMF' (Eb). Eb = (PΦNz) / (60A) Volts.",
            "Voltage Equation: Applied voltage V must overcome back EMF and internal resistance drop: V = Eb + IaRa.",
            "Torque Derivation: Electrical power converted to mechanical form = Eb × Ia. Mechanical power developed = (2πNT) / 60. Equating both: Eb × Ia = (2πNT) / 60. Substituting Eb = (PΦNz) / (60A), we get Torque T = (PΦzIa) / (2πA) = 0.159 × (PΦzIa / A) N·m.",
            "Significance: Torque is directly proportional to Φ × Ia. Back EMF acts as a natural governor, automatically adjusting armature current to match the mechanical load."
          ],
          conclusion: "Back EMF makes the DC motor a self-regulating machine, adjusting its electrical intake based on mechanical load demand."
        }
      ],
      shortAnswers: [
        {
          question: "What is the function of a commutator in a DC machine?",
          answer: "The commutator serves as a mechanical rectifier. In a DC generator, it converts alternating EMF into unidirectional DC output. In a DC motor, it alternates armature current direction to ensure continuous torque in one direction.",
          keyTerms: ["mechanical rectifier", "unidirectional", "copper segments", "mica insulation"]
        },
        {
          question: "Why is a starter necessary for DC motors?",
          answer: "At starting (N=0), back EMF Eb=0, so starting current Ia = V/Ra. Since Ra is very small (0.5-1Ω), starting current can be 15-20 times rated current, burning windings and damaging commutators. Starters insert external resistance that is cut out as motor speeds up.",
          keyTerms: ["back EMF zero", "excessive starting current", "external resistance", "gradual cut-out"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Never start a DC motor with the field circuit open; zero flux causes runaway overspeeding.",
        "Ensure proper earth grounding of the motor frame before energizing.",
        "Keep loose clothing and hands clear of rotating shafts, couplings, and pulleys.",
        "Start with minimum load and increase gradually while observing armature ammeter.",
        "In case of any sparking or abnormal noise, trip the main supply isolator immediately."
      ],
      apparatus: [
        "DC Shunt Motor (220V, 5HP, 1500 RPM)",
        "Field Rheostat (0-500Ω, 2A wire-wound)",
        "Armature Rheostat (0-10Ω, 20A wire-wound)",
        "4-Point Starter with No-Volt Coil",
        "DC Ammeters (0-2A MC, 0-20A MC)",
        "DC Voltmeter (0-300V MC)",
        "Digital Non-Contact Tachometer"
      ],
      procedure: [
        "Connect circuit according to the 4-point starter schematic diagram.",
        "Set field rheostat to minimum resistance and armature rheostat to maximum resistance.",
        "Switch ON the DC supply and bring motor to base speed using the starter handle.",
        "Field Weakening: Keep Va constant at 220V, decrease field current If in steps, record speed N.",
        "Armature Voltage Control: Keep If constant, vary armature rheostat to reduce Va, record speed N.",
        "Plot Speed vs Field Current and Speed vs Armature Voltage characteristics."
      ],
      observations: [
        "Measure armature and field resistance with DMM before energizing.",
        "Observe starting current spike on ammeter and notice how it drops as motor accelerates.",
        "Record no-load speed and current, then apply mechanical brake load.",
        "Observe commutator sparking – excess sparking indicates dirty brushes or wrong neutral axis.",
        "Plot speed vs armature current characteristic (should show slight droop)."
      ],
      vivaQuestions: [
        {
          question: "How can you reverse the direction of rotation of a DC shunt motor?",
          answer: "By reversing either the armature connections OR the field connections, but not both. Reversing armature connections is preferred because field winding has high inductance which creates dangerous voltage spikes if switched."
        },
        {
          question: "What happens if field winding opens while motor is running?",
          answer: "The flux drops to residual magnetism (nearly zero). Since N ∝ 1/Φ, the motor accelerates to extremely high dangerous speeds ('runaway') and could mechanically disintegrate unless tripped by protection."
        }
      ],
      virtualLabLink: {
        title: "Electrical Machines Virtual Lab",
        url: "/tools/electrical-machines",
        toolName: "DC Motor Performance Simulator"
      }
    }
  },

  // ============================================
  // TOPIC 2: AC MACHINES – INDUCTION & SYNCHRONOUS
  // ============================================
  'ac-machines': {
    conceptOverview: {
      paragraphs: [
        "AC Machines form the backbone of industrial mechanical power and bulk electrical generation worldwide. They are broadly categorized into Induction (Asynchronous) Machines and Synchronous Machines. Three-phase induction motors account for over 85% of all industrial prime movers due to their ruggedness, low cost, and lack of brushes.",
        "Induction motors operate on the rotating magnetic field (RMF) principle established by Galileo Ferraris and Nikola Tesla. A 3-phase balanced stator current produces a constant-magnitude magnetic field rotating at synchronous speed Ns = 120f / P. The rotor never catches up with synchronous speed; the relative motion induces rotor currents that produce torque.",
        "Synchronous machines, by contrast, rotate at exact synchronous speed without slip. They are used as alternators in power stations and as constant-speed industrial drives. They have the unique ability to operate at leading, lagging, or unity power factor by adjusting DC rotor excitation."
      ],
      realWorldApplications: [
        "Industrial water pumps, fans, blowers, and air compressors",
        "Conveyor belts, overhead cranes, and escalators",
        "Synchronous alternators in thermal, hydro, and nuclear power plants",
        "Synchronous condensers for grid power factor correction",
        "Electric locomotives and modern high-speed electric trains"
      ]
    },
    keyFormulas: [
      {
        equation: "Ns = (120 * f) / P",
        symbols: ["Ns = Synchronous Speed (RPM)", "f = Supply frequency (Hz)", "P = Number of stator poles"],
        usage: "Calculates the rotational speed of the stator magnetic field. In a 50 Hz system, 2-pole Ns = 3000 RPM, 4-pole Ns = 1500 RPM."
      },
      {
        equation: "s = (Ns - N) / Ns",
        symbols: ["s = Fractional Slip", "Ns = Synchronous Speed (RPM)", "N = Actual Rotor Speed (RPM)"],
        usage: "Determines the fractional difference in speed. Normal full-load slip ranges between 0.02 and 0.05 (2% to 5%)."
      },
      {
        equation: "fr = s * f",
        symbols: ["fr = Rotor induced frequency (Hz)", "s = Slip", "f = Stator supply frequency (Hz)"],
        usage: "Calculates rotor frequency. At stand-still (s=1), fr = f (50 Hz). At running speed (s=0.04), fr = 2 Hz."
      },
      {
        equation: "T = (3 / (2π * Ns/60)) * [ (s * E2² * R2) / (R2² + (s * X2)²) ]",
        symbols: ["T = Developed Torque (N·m)", "s = Slip", "E2 = Rotor EMF at standstill", "R2 = Rotor resistance", "X2 = Standstill rotor reactance"],
        usage: "Full torque-slip relationship. Maximum breakdown torque occurs when s = R2 / X2."
      }
    ],
    workedExample: {
      problem: "A 3-phase, 4-pole, 50 Hz induction motor has a slip of 4% at full load. Find: (1) Synchronous speed, (2) Rotor speed, and (3) Frequency of rotor induced current at full load.",
      givenData: ["Poles, P = 4", "Frequency, f = 50 Hz", "Full load slip, s = 0.04 (4%)"],
      required: "Synchronous speed (Ns), Rotor speed (N), and Rotor frequency (fr)",
      steps: [
        {
          title: "Step 1: Calculate Synchronous Speed",
          explanation: "Use Ns = 120f / P",
          calculation: "Ns = (120 × 50) / 4 = 6000 / 4 = 1500 RPM"
        },
        {
          title: "Step 2: Calculate Rotor Speed",
          explanation: "Use N = Ns × (1 - s)",
          calculation: "N = 1500 × (1 - 0.04) = 1500 × 0.96 = 1440 RPM"
        },
        {
          title: "Step 3: Calculate Rotor Frequency",
          explanation: "Use fr = s × f",
          calculation: "fr = 0.04 × 50 = 2.0 Hz"
        }
      ],
      finalAnswer: "Ns = 1500 RPM, N = 1440 RPM, fr = 2.0 Hz",
      interpretation: "At full load, the motor runs at 1440 RPM with a low rotor frequency of 2 Hz. The low rotor frequency keeps rotor core losses negligible during normal running."
    },
    typicalMistakes: [
      {
        mistake: "Assuming rotor speed equals synchronous speed under light load",
        fix: "An induction motor can NEVER reach synchronous speed; if N = Ns, relative speed is zero, no EMF is induced, rotor current is zero, and torque drops to zero."
      },
      {
        mistake: "Starting large induction motors directly on-line (DOL)",
        fix: "DOL starting draws 5 to 7 times rated current, causing severe voltage dips on the bus. Use Star-Delta starters, auto-transformer starters, or Soft Starters for motors above 5 HP."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the production of rotating magnetic field in a 3-phase induction motor and derive the torque-slip characteristic.",
          marks: 10,
          intro: "When 3-phase balanced currents flow through 3-phase windings displaced 120° in space, they produce a magnetic flux of constant magnitude (1.5 Φm) rotating at synchronous speed.",
          points: [
            "Mathematical proof: At θ = 0°, Φ_R = Φm*sin(0) = 0, Φ_Y = Φm*sin(-120) = -√3/2 Φm, Φ_B = Φm*sin(120) = √3/2 Φm. Resultant = 1.5 Φm at 90°.",
            "Rotor Induction: The rotating field cuts stationary rotor conductors, inducing EMF and rotor current.",
            "Torque-Slip Curve: Starting torque at s=1, stable operating region between s=0 and s=sm (linear), breakdown peak torque at sm = R2/X2.",
            "Starting Methods: DOL, Star-Delta, Autotransformer, Rotor resistance starting (for slip-ring motors)."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is the function of damper windings in synchronous machines?",
          answer: "Damper windings prevent hunting (oscillations of rotor about synchronous position during load changes) and provide starting torque to start synchronous motors as induction motors.",
          keyTerms: ["hunting prevention", "starting torque", "rotor pole faces", "induction start"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Ensure Star-Delta starter transition timer is set correctly (5-8 seconds).",
        "Do not run motor uncoupled if belt or brake drum is loose.",
        "Ensure emergency stop push-button is operational before energizing."
      ],
      apparatus: [
        "3-Phase Squirrel Cage Induction Motor (3HP, 415V, 1440 RPM)",
        "Star-Delta Starter with thermal overload relay",
        "Mechanical Dynamometer / Brake Drum with spring balances",
        "3-Phase Digital Multimeter & Optical Tachometer"
      ],
      procedure: [
        "Connect stator terminals to 415V supply through Star-Delta starter.",
        "Start motor on no-load, record no-load current I0 and no-load speed N0.",
        "Apply mechanical brake load in steps by tightening handwheels.",
        "Record spring balance readings (S1, S2 in kg), line current, voltage, and speed.",
        "Calculate torque T = (S1 - S2) * 9.81 * Drum_Radius and efficiency."
      ],
      observations: [
        "Observe speed droop from 1490 RPM (no load) to 1420 RPM (full load).",
        "Notice line current increase from 1.8A (no load) to 4.5A (full load).",
        "Verify that torque increases linearly with slip in normal operating zone."
      ],
      vivaQuestions: [
        {
          question: "Why is the power factor of an induction motor very low on no load?",
          answer: "On no-load, the motor draws predominantly magnetizing current to establish the air-gap flux. Since core loss current is small, current lags voltage by 80°-85°, yielding a no-load power factor of 0.1 to 0.2."
        }
      ],
      virtualLabLink: {
        title: "AC Machines Virtual Bench",
        url: "/tools/electrical-machines",
        toolName: "Induction Motor Torque-Speed Lab"
      }
    }
  },

  // ============================================
  // TOPIC 3: TRANSFORMERS – THEORY AND APPLICATIONS
  // ============================================
  'transformers': {
    conceptOverview: {
      paragraphs: [
        "A transformer is a static electrical machine that transfers electrical energy between two or more circuits through electromagnetic induction at constant frequency. Transformers are critical to modern power grids because they allow high-voltage transmission (reducing I²R line losses) and safe low-voltage utilization at consumer premises.",
        "Operating on Faraday's law of mutual induction, an alternating voltage applied to the primary winding creates an alternating flux in the laminated silicon steel core. This flux links the secondary winding, inducing an EMF proportional to the turns ratio: V1 / V2 = N1 / N2 = I2 / I1.",
        "Transformer testing includes Open-Circuit (OC) test for core iron losses and Short-Circuit (SC) test for winding copper losses, allowing predetermination of all-day efficiency and voltage regulation without actual loading."
      ],
      realWorldApplications: [
        "Step-up transformers in generating stations (11kV to 400kV)",
        "Step-down distribution transformers in residential substations (11kV to 415V/230V)",
        "Instrument transformers (Current Transformers - CT and Potential Transformers - PT) for metering and relay protection",
        "Isolation transformers for medical and sensitive electronic equipment",
        "Autotransformers in laboratories for continuous variable voltage control"
      ]
    },
    keyFormulas: [
      {
        equation: "E = 4.44 * f * Φm * N",
        symbols: ["E = RMS Induced EMF (V)", "f = Frequency (Hz)", "Φm = Maximum Core Flux (Wb)", "N = Number of turns"],
        usage: "Fundamental Transformer EMF Equation for primary (E1) and secondary (E2)."
      },
      {
        equation: "η = (x * S * cosΦ) / (x * S * cosΦ + Pi + x² * Pcu) * 100",
        symbols: ["η = Efficiency (%)", "x = Fraction of full load", "S = Rated kVA", "Pi = Core Iron Loss", "Pcu = Full-Load Copper Loss"],
        usage: "Calculates transformer efficiency at any load fraction x and power factor cosΦ."
      },
      {
        equation: "% Reg = (I2 * Req * cosΦ ± I2 * Xeq * sinΦ) / V2 * 100",
        symbols: ["Req, Xeq = Equivalent winding resistance and reactance", "+ for lagging PF, - for leading PF"],
        usage: "Determines terminal voltage variation from no-load to full-load."
      }
    ],
    workedExample: {
      problem: "A 25 kVA, 2200V/220V, 50 Hz single-phase transformer has iron loss of 350 W and full-load copper loss of 400 W. Calculate its efficiency at: (1) Full load at unity power factor, (2) Half full load at 0.8 power factor lagging.",
      givenData: ["Rating, S = 25 kVA = 25000 VA", "Iron loss, Pi = 350 W = 0.35 kW", "Full-load copper loss, Pcu = 400 W = 0.40 kW"],
      required: "Efficiency at full load (UPF) and half load (0.8 PF lag)",
      steps: [
        {
          title: "Step 1: Efficiency at Full Load, UPF (x = 1.0, cosΦ = 1.0)",
          explanation: "Output = S * cosΦ = 25 * 1 = 25 kW. Total Losses = Pi + Pcu = 0.35 + 0.40 = 0.75 kW.",
          calculation: "η_FL = 25 / (25 + 0.75) * 100 = 25 / 25.75 * 100 = 97.09%"
        },
        {
          title: "Step 2: Efficiency at Half Load, 0.8 PF (x = 0.5, cosΦ = 0.8)",
          explanation: "Output = 0.5 * 25 * 0.8 = 10 kW. Copper loss = x² * Pcu = (0.5)² * 400 = 100 W = 0.1 kW. Total Losses = 0.35 + 0.10 = 0.45 kW.",
          calculation: "η_HL = 10 / (10 + 0.45) * 100 = 10 / 10.45 * 100 = 95.69%"
        }
      ],
      finalAnswer: "η (Full Load UPF) = 97.09%, η (Half Load 0.8 PF) = 95.69%",
      interpretation: "Transformers are among the most efficient electrical machines (typically >95%) because they have no moving parts and zero mechanical friction/windage losses."
    },
    typicalMistakes: [
      {
        mistake: "Using full-load copper loss directly when calculating half-load efficiency",
        fix: "Copper loss varies with the square of the load fraction: Pcu(x) = x² * Pcu_FL. At half load (x=0.5), copper loss is 0.25 * Pcu_FL."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Describe the Open-Circuit (OC) and Short-Circuit (SC) tests on a single-phase transformer and explain how efficiency and regulation are calculated.",
          marks: 10,
          intro: "OC and SC tests predetermine transformer performance with minimal power consumption without loading the transformer directly.",
          points: [
            "OC Test: Conducted on LV side at rated voltage with HV open. Measures iron loss Pi = W0, no-load current I0, and no-load power factor cosΦ0.",
            "SC Test: Conducted on HV side with LV shorted. Reduced voltage Vsc applied to circulate rated current. Measures full-load copper loss Pcu = Wsc.",
            "Equivalent Circuit Parameters: R0 = V1 / Iw, X0 = V1 / Iμ, Req = Wsc / Isc², Zeq = Vsc / Isc, Xeq = √(Zeq² - Req²).",
            "Condition for Maximum Efficiency: Variable copper loss equals constant iron loss (x² * Pcu = Pi)."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is an ideal transformer?",
          answer: "An ideal transformer has: (1) Zero winding resistance (no I²R loss), (2) Infinite core permeability (zero magnetizing current), (3) Zero core loss (no hysteresis or eddy current), (4) Zero leakage flux (100% magnetic coupling).",
          keyTerms: ["zero resistance", "infinite permeability", "zero core loss", "zero leakage"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Never exceed rated current in SC test.",
        "Never open the secondary of a current transformer when primary is energized.",
        "Ensure auto-transformer (variac) is set to zero before switching ON."
      ],
      apparatus: [
        "1-Phase Step Down Transformer (5kVA, 230V/115V)",
        "Variac (0-270V, 15A)",
        "Low Power Factor Wattmeter (300V, 5A, cosΦ=0.2)",
        "Unity Power Factor Wattmeter (150V, 20A, cosΦ=1.0)",
        "AC Digital Voltmeters and Ammeters"
      ],
      procedure: [
        "OC Test: Connect meters on LV side with HV open. Apply rated voltage 230V. Record V0, I0, W0.",
        "SC Test: Short LV side with ammeter. Apply reduced voltage to HV until rated current flows. Record Vsc, Isc, Wsc.",
        "Compute parameters R0, X0, Req, Xeq, and calculate efficiency at various loads."
      ],
      observations: [
        "Notice that W0 in OC test reads very low (~80W) despite full 230V applied.",
        "Notice that in SC test, only 5-10% of rated voltage (~18V) produces full rated current."
      ],
      vivaQuestions: [
        {
          question: "Why is a low power factor (LPF) wattmeter used in the OC test?",
          answer: "The no-load current is mainly magnetizing current which lags voltage by 75°-85° (cosΦ ≈ 0.15). Regular UPF wattmeters give inaccurate or unreadable deflections at such low power factors."
        }
      ],
      virtualLabLink: {
        title: "Virtual Machine Lab",
        url: "/tools/electrical-machines",
        toolName: "Transformer OC/SC Test Studio"
      }
    }
  },

  // ============================================
  // TOPIC 4: POWER SYSTEMS – TRANSMISSION & PROTECTION
  // ============================================
  'power-systems': {
    conceptOverview: {
      paragraphs: [
        "Power Systems encompass the entire engineering infrastructure responsible for generating, transmitting, and distributing electric energy reliably and economically. Generation transforms primary energy (hydro, thermal, nuclear, solar, wind) into electrical power at voltages around 11kV to 25kV.",
        "Transmission lines transport bulk power over long distances at extra-high voltages (400kV, 765kV AC, or ±800kV HVDC) to minimize transmission line losses. Distribution networks step down power through substations to feed industrial, commercial, and domestic loads safely.",
        "Protection schemes utilize protective relays and circuit breakers (SF6, Vacuum) to automatically isolate faulted segments within milliseconds, safeguarding equipment and preserving grid stability."
      ],
      realWorldApplications: [
        "National extra-high voltage transmission grids (400kV / 765kV)",
        "High-Voltage Direct Current (HVDC) undersea cable and long-distance links",
        "Substation protection systems using microprocessor numerical relays",
        "Power factor correction capacitor banks in industrial plants",
        "Smart grid distributed energy integration and solar microgrids"
      ]
    },
    keyFormulas: [
      {
        equation: "P = √3 * VL * IL * cosΦ",
        symbols: ["P = 3-Phase Active Power (Watts)", "VL = Line-to-Line Voltage", "IL = Line Current", "cosΦ = Power Factor"],
        usage: "Calculates total active power in balanced 3-phase systems."
      },
      {
        equation: "Q = √3 * VL * IL * sinΦ",
        symbols: ["Q = 3-Phase Reactive Power (VAR)"],
        usage: "Calculates total reactive power in balanced 3-phase systems."
      },
      {
        equation: "Vs = A * Vr + B * Ir",
        symbols: ["Vs, Is = Sending end voltage and current", "Vr, Ir = Receiving end voltage and current", "A, B, C, D = Generalized Transmission Line Constants (AD - BC = 1)"],
        usage: "ABCD two-port matrix representation of medium and long transmission lines."
      }
    ],
    workedExample: {
      problem: "A balanced 3-phase, 415V, 50 Hz system supplies a star-connected inductive load with impedance Z = (8 + j6) Ω per phase. Calculate: (1) Phase voltage, (2) Line current, (3) Power factor, (4) Total active power.",
      givenData: ["Line Voltage, VL = 415 V", "Phase Impedance, Zph = 8 + j6 Ω", "Load Connection = Star (Y)"],
      required: "Vph, IL, cosΦ, P",
      steps: [
        {
          title: "Step 1: Calculate Phase Voltage",
          explanation: "In star connection, Vph = VL / √3",
          calculation: "Vph = 415 / √3 = 239.6 V"
        },
        {
          title: "Step 2: Calculate Phase Impedance Magnitude and Angle",
          explanation: "|Zph| = √(8² + 6²) = √(64 + 36) = √100 = 10 Ω. Angle Φ = arctan(6/8) = 36.87°.",
          calculation: "|Zph| = 10 Ω, Φ = 36.87°"
        },
        {
          title: "Step 3: Calculate Line and Phase Current",
          explanation: "In star, IL = Iph = Vph / |Zph|",
          calculation: "IL = 239.6 / 10 = 23.96 A"
        },
        {
          title: "Step 4: Calculate Active Power and Power Factor",
          explanation: "cosΦ = cos(36.87°) = 0.8 lagging. P = √3 * VL * IL * cosΦ.",
          calculation: "P = √3 × 415 × 23.96 × 0.8 = 1.732 × 415 × 23.96 × 0.8 = 13778 W = 13.78 kW"
        }
      ],
      finalAnswer: "Vph = 239.6V, IL = 23.96A, cosΦ = 0.8 lag, P = 13.78 kW",
      interpretation: "The load draws 13.78 kW of active power and significant reactive power due to the 0.8 lagging power factor. Adding shunt capacitors could correct the power factor closer to 1.0, reducing the line current."
    },
    typicalMistakes: [
      {
        mistake: "Confusing star and delta relations",
        fix: "In Star (Y): VL = √3 * Vph, IL = Iph. In Delta (Δ): VL = Vph, IL = √3 * Iph."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the Ferranti effect in long transmission lines and how shunt reactors mitigate it.",
          marks: 8,
          intro: "The Ferranti effect refers to the phenomenon where receiving end voltage Vr exceeds sending end voltage Vs under no-load or light-load conditions.",
          points: [
            "Cause: Charging current flowing through the line's distributed capacitance creates a leading current through line inductance, resulting in a voltage rise.",
            "Voltage Rise Expression: ΔV ≈ (Vs * ω² * L * C) / 2.",
            "Mitigation: Installing shunt reactors at substations absorbs excess capacitive reactive power and stabilizes voltage."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is the function of Buchholz relay?",
          answer: "A gas-actuated protective relay installed on oil-immersed transformers between main tank and conservator. It detects minor internal insulation faults (gas accumulation) and severe short-circuit faults (oil surge).",
          keyTerms: ["gas-actuated", "internal faults", "oil surge", "conservator pipe"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Always de-energize 3-phase supplies before adjusting load bank connections.",
        "Ensure neutral conductor is securely clamped before applying power."
      ],
      apparatus: [
        "3-Phase 415V Power Panel",
        "Two-Wattmeter Measurement Kit (500V, 10A)",
        "3-Phase Variable R-L Load Bank",
        "3-Phase Digital Power Analyzer"
      ],
      procedure: [
        "Connect current coils of W1 in R-line, W2 in B-line, and common potential coils to Y-line.",
        "Vary load from 1 kW to 10 kW and record W1, W2, line voltage, and line current.",
        "Calculate active power P = W1 + W2 and power factor angle tanΦ = √3(W1-W2)/(W1+W2)."
      ],
      observations: [
        "Verify that at UPF, W1 = W2.",
        "Verify that when PF drops below 0.5, W2 reads negative."
      ],
      vivaQuestions: [
        {
          question: "Why do we use two wattmeters instead of three for 3-phase 3-wire systems?",
          answer: "By Blondel's Theorem, for an N-conductor system, N-1 wattmeters are sufficient to measure total active power regardless of load balance."
        }
      ],
      virtualLabLink: {
        title: "Power Systems Simulation Bench",
        url: "/tools/power-systems",
        toolName: "Transmission & Load Flow Simulator"
      }
    }
  },

  // ============================================
  // TOPIC 5: CIRCUIT ANALYSIS – THEOREMS & RESONANCE
  // ============================================
  'circuit-analysis': {
    conceptOverview: {
      paragraphs: [
        "Circuit Analysis provides the mathematical foundation for solving complex electrical and electronic networks. By applying Kirchhoff's Voltage Law (KVL) and Kirchhoff's Current Law (KCL), engineers analyze nodal voltages and mesh currents in DC and AC systems.",
        "Network reduction theorems—including Thevenin's, Norton's, Superposition, and Maximum Power Transfer theorems—allow complex multi-source networks to be simplified into single equivalent sources.",
        "AC circuit analysis extends these techniques into the frequency domain using complex phasor arithmetic (Z = R + jX), enabling the study of resonance, impedance matching, and transient RC/RL/RLC response."
      ],
      realWorldApplications: [
        "RF antenna impedance matching (Maximum Power Transfer)",
        "Filter design (Low-pass, High-pass, Band-pass) in audio and communications",
        "Power supply ripple filtering and decoupling networks",
        "Transient voltage suppression and snubber design"
      ]
    },
    keyFormulas: [
      {
        equation: "fr = 1 / (2π * √(L * C))",
        symbols: ["fr = Resonant Frequency (Hz)", "L = Inductance (H)", "C = Capacitance (F)"],
        usage: "Calculates the resonant frequency of series and parallel RLC circuits."
      },
      {
        equation: "Q = (ω0 * L) / R = 1 / (ω0 * C * R)",
        symbols: ["Q = Quality Factor", "ω0 = Resonant angular frequency (rad/s)"],
        usage: "Measures selectivity of an RLC tuned circuit."
      },
      {
        equation: "Pmax = Vth² / (4 * Rth)",
        symbols: ["Pmax = Maximum power delivered to load", "Vth = Thevenin voltage", "Rth = Thevenin resistance"],
        usage: "Maximum power transferred when load resistance RL equals Thevenin resistance Rth."
      }
    ],
    workedExample: {
      problem: "A series RLC circuit with R = 10 Ω, L = 100 mH, and C = 10 µF is connected to a 100V AC source. Calculate: (1) Resonant frequency fr, (2) Quality factor Q, (3) Current at resonance I0.",
      givenData: ["R = 10 Ω", "L = 0.1 H", "C = 10 × 10⁻⁶ F", "V = 100 V"],
      required: "fr, Q, I0",
      steps: [
        {
          title: "Step 1: Calculate Resonant Frequency fr",
          explanation: "fr = 1 / (2π * √(L * C))",
          calculation: "fr = 1 / (2π × √(0.1 × 10 × 10⁻⁶)) = 1 / (2π × 10⁻³) = 1000 / 6.283 = 159.15 Hz"
        },
        {
          title: "Step 2: Calculate Quality Factor Q",
          explanation: "Q = (2π * fr * L) / R",
          calculation: "Q = (2π × 159.15 × 0.1) / 10 = 100 / 10 = 10.0"
        },
        {
          title: "Step 3: Calculate Current at Resonance I0",
          explanation: "At resonance, Z = R = 10 Ω. I0 = V / R.",
          calculation: "I0 = 100 / 10 = 10.0 A"
        }
      ],
      finalAnswer: "fr = 159.15 Hz, Q = 10.0, I0 = 10.0 A",
      interpretation: "At resonance, the reactive impedance cancels completely and the circuit draws maximum current limited solely by R."
    },
    typicalMistakes: [
      {
        mistake: "Assuming maximum power transfer implies maximum efficiency",
        fix: "Maximum power transfer occurs at 50% efficiency (half the power is lost in Rth). In power transmission, efficiency (>95%) is prioritized over maximum power transfer."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "State and prove Maximum Power Transfer Theorem for DC networks.",
          marks: 8,
          intro: "Maximum power is delivered from a linear network to a load when the load resistance equals the Thevenin resistance seen from the load terminals.",
          points: [
            "Circuit model: Voltage source Vth with series resistance Rth connected to load RL.",
            "Power expression: PL = IL² * RL = [Vth / (Rth + RL)]² * RL.",
            "Differentiation: d(PL)/d(RL) = 0 yields (Rth + RL)² - 2*RL*(Rth + RL) = 0 => RL = Rth.",
            "Maximum power formula: Pmax = Vth² / (4 * Rth)."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is the bandwidth of a resonant circuit?",
          answer: "Bandwidth (BW) is the frequency band between lower and upper half-power frequencies (f2 - f1) where power is at least half of the peak resonant value. BW = fr / Q = R / (2πL).",
          keyTerms: ["half-power frequencies", "selectivity", "BW = fr/Q"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Keep function generator output within rated capacitor voltage limits.",
        "Be aware that voltages across L and C at resonance can reach Q * Vin (voltage amplification)."
      ],
      apparatus: [
        "Function Generator (0.1 Hz - 10 MHz)",
        "Digital Storage Oscilloscope (DSO 2-Channel)",
        "Precision Decade Resistor, Inductor (10mH), Capacitor (0.1µF)",
        "BNC-to-Alligator Test Leads"
      ],
      procedure: [
        "Connect R, L, C components in series on breadboard.",
        "Apply 5V pk-pk sine wave and sweep frequency from 1 kHz to 10 kHz.",
        "Record voltage across resistor VR (proportional to current) at each frequency.",
        "Plot current vs frequency curve to determine peak frequency fr and bandwidth."
      ],
      observations: [
        "Observe current peaking sharply at fr.",
        "Note that voltage and current are in phase at resonance (phase angle = 0°)."
      ],
      vivaQuestions: [
        {
          question: "Why is series resonance called voltage resonance?",
          answer: "Because the voltage across individual reactive elements (VL and VC) can be many times greater than the applied source voltage (VL = Q * Vin)."
        }
      ],
      virtualLabLink: {
        title: "Circuit CAD & SPICE Studio",
        url: "/tools/circuit-simulator",
        toolName: "Interactive SPICE Circuit Simulator"
      }
    }
  },

  // ============================================
  // TOPIC 6: OP-AMPS & ANALOG ELECTRONICS
  // ============================================
  'op-amps-analog': {
    conceptOverview: {
      paragraphs: [
        "Operational Amplifiers (Op-Amps) are high-gain direct-coupled differential voltage amplifiers that form the cornerstone of analog signal processing. The ideal op-amp possesses infinite open-loop gain, infinite input impedance, zero output impedance, and infinite bandwidth.",
        "In practical circuits, negative feedback is applied to create stable, precise amplifier topologies whose characteristics depend entirely on external passive resistors and capacitors rather than the internal IC parameters.",
        "Op-amps perform linear mathematical operations (addition, subtraction, integration, differentiation) as well as non-linear functions (comparators, Schmitt triggers, precision rectifiers, active filters, and oscillators)."
      ],
      realWorldApplications: [
        "Active Butterworth and Chebyshev filter stages in audio/biomedical instruments",
        "Instrumentation amplifiers for strain gauges and thermocouple sensor conditioning",
        "Analog-to-Digital Converter (ADC) input driver buffers",
        "PID analog controllers for precision motor and temperature regulation",
        "Precision peak detectors and audio preamplifiers"
      ]
    },
    keyFormulas: [
      {
        equation: "Vout = - (Rf / R1) * Vin (Inverting)",
        symbols: ["Rf = Feedback resistor", "R1 = Input resistor"],
        usage: "Gain equation for inverting op-amp amplifier with 180° phase shift."
      },
      {
        equation: "Vout = (1 + Rf / R1) * Vin (Non-Inverting)",
        symbols: ["Gain Av = 1 + Rf / R1 (always ≥ 1)"],
        usage: "Gain equation for non-inverting op-amp amplifier with 0° phase shift."
      },
      {
        equation: "Vout = - (1 / (R * C)) * ∫ Vin dt (Integrator)",
        symbols: ["R = Input resistor", "C = Feedback capacitor"],
        usage: "Output is proportional to the time integral of input voltage."
      }
    ],
    workedExample: {
      problem: "Design an inverting amplifier with a voltage gain of -10 and input impedance of 10 kΩ using an LM741 op-amp. Find the required values for R1 and Rf.",
      givenData: ["Voltage gain, Av = -10", "Input impedance, Rin = 10 kΩ"],
      required: "R1 and Rf resistor values",
      steps: [
        {
          title: "Step 1: Determine Input Resistor R1",
          explanation: "In an inverting op-amp, the inverting input is at virtual ground, so input impedance Rin = R1.",
          calculation: "R1 = Rin = 10 kΩ"
        },
        {
          title: "Step 2: Determine Feedback Resistor Rf",
          explanation: "Inverting gain is given by Av = -Rf / R1. Therefore, Rf = |Av| × R1.",
          calculation: "Rf = 10 × 10 kΩ = 100 kΩ"
        }
      ],
      finalAnswer: "R1 = 10 kΩ, Rf = 100 kΩ",
      interpretation: "Using standard E24 precision resistors (10kΩ and 100kΩ), the circuit provides a clean gain of -10.0 with 180° phase inversion."
    },
    typicalMistakes: [
      {
        mistake: "Leaving power supply bypass capacitors off op-amp rails",
        fix: "Always place 0.1 µF ceramic bypass capacitors directly between +Vcc/GND and -Vee/GND near IC pins to prevent high-frequency oscillations."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the concept of Virtual Ground in op-amps and derive the closed-loop gain for an Inverting and Non-Inverting amplifier.",
          marks: 10,
          intro: "Virtual ground is a node that is held at zero volts without being directly wired to the ground plane, established by negative feedback and infinite open-loop gain.",
          points: [
            "Golden Rules: (1) No current flows into input terminals (Iin = 0). (2) Negative feedback drives differential voltage to zero (V+ = V-).",
            "Inverting Derivation: Node equation at inverting pin: (Vin - 0)/R1 + (Vout - 0)/Rf = 0 => Vout/Vin = -Rf/R1.",
            "Non-Inverting Derivation: Voltage at inverting pin V- = Vout * [R1 / (R1 + Rf)]. Equating V- = Vin gives Vout/Vin = 1 + Rf/R1."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is Slew Rate in an op-amp?",
          answer: "Slew rate is the maximum rate of change of output voltage per unit time, expressed in V/µs. For LM741 it is 0.5 V/µs. It limits the high-frequency large-signal handling capacity.",
          keyTerms: ["max dV/dt", "V/µs", "LM741 = 0.5 V/µs", "distortion limit"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Never exceed ±18V power supply limits on 741 / TL072 ICs.",
        "Ensure power supply polarities (+15V and -15V) are wired correctly before turning ON power."
      ],
      apparatus: [
        "Dual DC Power Supply (±15V DC)",
        "LM741 / TL072 Op-Amp ICs",
        "Function Generator (Sine/Square 1 kHz)",
        "Digital Storage Oscilloscope (DSO)",
        "Resistors (1kΩ, 10kΩ, 100kΩ)"
      ],
      procedure: [
        "Assemble inverting amplifier (R1 = 1kΩ, Rf = 10kΩ) on breadboard with ±15V supplies.",
        "Apply 0.5V pk-pk 1kHz sine wave to input.",
        "Measure output voltage and verify 180° phase inversion and gain of -10.",
        "Reconfigure for non-inverting mode and verify gain of +11 and in-phase output."
      ],
      observations: [
        "Verify output clipping at approximately ±13.5V when input amplitude exceeds ±1.5V.",
        "Observe phase inversion on oscilloscope dual-trace display."
      ],
      vivaQuestions: [
        {
          question: "Why does an op-amp have two supply voltages (+Vcc and -Vee)?",
          answer: "To allow the output voltage to swing symmetrically in both positive and negative directions about ground for AC signals without requiring DC blocking capacitors."
        }
      ],
      virtualLabLink: {
        title: "Virtual Lab Breadboard",
        url: "/tools/lab-bench",
        toolName: "Interactive DSO & Multimeter Bench"
      }
    }
  },

  // ============================================
  // TOPIC 7: DIGITAL ELECTRONICS – LOGIC DESIGN
  // ============================================
  'digital-electronics': {
    conceptOverview: {
      paragraphs: [
        "Digital Electronics deals with discrete-level signals (binary 0 and 1) that represent information. Using Boolean algebra and Karnaugh maps (K-maps), digital circuits are minimized for optimal gate count and propagation delay.",
        "Digital systems are classified into Combinational circuits (output depends solely on current inputs, e.g., Adders, Multiplexers, Decoders) and Sequential circuits (output depends on current inputs and past states via memory elements like Flip-Flops, Registers, and Counters).",
        "Understanding TTL (74xx) and CMOS (40xx) logic families, timing diagrams, propagation delay, and setup/hold times is essential for digital hardware synthesis and embedded design."
      ],
      realWorldApplications: [
        "Microprocessor ALUs and memory address decoding",
        "Digital clock timing generators and frequency dividers",
        "FPGA and ASIC hardware digital architecture",
        "Traffic light sequential controllers and elevator state machines"
      ]
    },
    keyFormulas: [
      {
        equation: "De Morgan's: (A · B)' = A' + B', (A + B)' = A' · B'",
        symbols: ["A, B = Binary variables", "' = NOT negation"],
        usage: "Used for logic gate minimization and universal gate synthesis."
      },
      {
        equation: "Mod-N Counter: N ≤ 2^n",
        symbols: ["N = Number of count states", "n = Number of flip-flops required"],
        usage: "Determines flip-flop count for synchronous/asynchronous counters."
      }
    ],
    workedExample: {
      problem: "Design a full adder using two half adders and an OR gate. Write Boolean expressions for Sum and Carry.",
      givenData: ["Inputs: A, B, Cin"],
      required: "Sum (S) and Carry (Cout) Boolean equations",
      steps: [
        {
          title: "Step 1: First Half Adder",
          explanation: "HA1 takes A and B: S1 = A ⊕ B, C1 = A · B",
          calculation: "S1 = A ⊕ B, C1 = A · B"
        },
        {
          title: "Step 2: Second Half Adder & Output",
          explanation: "HA2 takes S1 and Cin: Sum S = S1 ⊕ Cin = A ⊕ B ⊕ Cin. Cout = C1 + C2 = (A · B) + (A ⊕ B) · Cin.",
          calculation: "Sum = A ⊕ B ⊕ Cin\nCout = A·B + B·Cin + A·Cin"
        }
      ],
      finalAnswer: "Sum = A ⊕ B ⊕ Cin, Cout = AB + BCin + ACin",
      interpretation: "A full adder computes binary sum of three single bits and forms the core component of arithmetic logic units (ALUs)."
    },
    typicalMistakes: [
      {
        mistake: "Leaving unused CMOS inputs floating",
        fix: "Floating CMOS inputs pick up static charge and cause intermediate logic states, excessive current draw, or circuit latch-up. Always pull unused inputs to Vcc or GND."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the working of a Master-Slave JK Flip-Flop and how it eliminates race-around condition.",
          marks: 10,
          intro: "A Master-Slave JK flip-flop is constructed using two clocked JK flip-flops in cascade to prevent race-around when J=K=1.",
          points: [
            "Race-around problem: In level-triggered JK flip-flops with J=K=1, if pulse width tp > propagation delay td, output toggles multiple times during one clock pulse.",
            "Master-Slave solution: Master is enabled when CLK=1, storing input. Slave is enabled when CLK=0, updating output. State changes only once per clock cycle."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "Why are NAND and NOR called universal gates?",
          answer: "Because combinations of NAND gates alone (or NOR gates alone) can realize all three basic logic operations (AND, OR, NOT) and thus any arbitrary Boolean function.",
          keyTerms: ["universal realization", "AND-OR-NOT", "De Morgan's law"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Operate TTL ICs strictly at +5.0V regulated DC; voltages above 5.5V destroy ICs.",
        "Ensure Pin 14 is +5V and Pin 7 is GND before powering the kit."
      ],
      apparatus: [
        "Digital Logic Trainer Kit with debounced logic switches & LED indicators",
        "TTL ICs: 7408 (AND), 7432 (OR), 7404 (NOT), 7400 (NAND), 7486 (XOR)",
        "+5V Regulated Power Supply"
      ],
      procedure: [
        "Insert 7408 IC into breadboard socket, connect Pin 14 to +5V and Pin 7 to GND.",
        "Connect input switches to pins 1 and 2, and pin 3 output to LED monitor.",
        "Cycle through logic combinations (00, 01, 10, 11) and record truth table.",
        "Repeat for 7400 universal gate realizations."
      ],
      observations: [
        "Verify that AND gate LED illuminates ONLY when both inputs are at logic 1 (+5V)."
      ],
      vivaQuestions: [
        {
          question: "What are typical logic thresholds for 74xx TTL ICs?",
          answer: "VIL_max = 0.8V (Logic 0), VIH_min = 2.0V (Logic 1), VOL_max = 0.4V, VOH_min = 2.4V."
        }
      ],
      virtualLabLink: {
        title: "Digital Logic Simulator",
        url: "/tools/digital-logic",
        toolName: "Logic Gate & Timing Synthesis Lab"
      }
    }
  },

  // ============================================
  // TOPIC 8: POWER ELECTRONICS – CONVERTERS & DRIVES
  // ============================================
  'power-electronics': {
    conceptOverview: {
      paragraphs: [
        "Power Electronics deals with the efficient conversion, control, and conditioning of electric power using solid-state semiconductor switching devices (SCRs, MOSFETs, IGBTs, GTOs, and TRIACs). Unlike linear electronics, power semiconductor devices operate as binary switches (fully ON or fully OFF) to minimize internal conduction losses.",
        "Key converter topologies include Rectifiers (AC to DC), Inverters (DC to AC), Choppers / Buck-Boost Converters (DC to DC), and Cycloconverters (AC to AC).",
        "Power electronics drives the transition to renewable energy (solar inverters, wind turbine converters) and modern electric mobility (EV motor inverters, fast battery chargers)."
      ],
      realWorldApplications: [
        "Electric Vehicle (EV) traction inverters and regenerative braking systems",
        "Grid-tied solar photovoltaic inverters with Maximum Power Point Tracking (MPPT)",
        "Variable Frequency Drives (VFDs) for industrial induction motor speed control",
        "Uninterruptible Power Supplies (UPS) and switch-mode power supplies (SMPS)"
      ]
    },
    keyFormulas: [
      {
        equation: "Vdc = (2 * Vm / π) * cos(α) (1-Phase Full Converter)",
        symbols: ["Vdc = Average DC output voltage", "Vm = Peak AC input voltage", "α = Firing / trigger angle"],
        usage: "Calculates average DC output of a controlled phase rectifier."
      },
      {
        equation: "Vout = D * Vin (Buck Converter)",
        symbols: ["Vout = Output DC voltage", "D = Duty cycle (Ton / T)", "Vin = Input DC voltage"],
        usage: "Step-down DC-DC buck converter voltage relationship."
      }
    ],
    workedExample: {
      problem: "A single-phase fully controlled bridge rectifier is fed from a 230V, 50 Hz supply and feeds a resistive load R = 10 Ω. If the firing angle α = 45°, calculate: (1) Average DC output voltage, (2) Average load current.",
      givenData: ["AC RMS Voltage, Vrms = 230 V", "Peak Voltage, Vm = 230 × √2 = 325.27 V", "Firing angle, α = 45°", "Load R = 10 Ω"],
      required: "Average output voltage Vdc and average load current Idc",
      steps: [
        {
          title: "Step 1: Calculate Average Output Voltage Vdc",
          explanation: "Use Vdc = (2 * Vm / π) * cos(α)",
          calculation: "Vdc = (2 × 325.27 / π) × cos(45°) = 207.08 × 0.7071 = 146.43 V"
        },
        {
          title: "Step 2: Calculate Average Load Current Idc",
          explanation: "Use Idc = Vdc / R",
          calculation: "Idc = 146.43 / 10 = 14.64 A"
        }
      ],
      finalAnswer: "Vdc = 146.43 V, Idc = 14.64 A",
      interpretation: "By controlling the firing angle α between 0° and 90°, average DC voltage can be smoothly varied from 207V down to 0V."
    },
    typicalMistakes: [
      {
        mistake: "Triggering SCRs with continuous DC gate signals",
        fix: "Use high-frequency pulse trains or short pulses with pulse transformers/optocouplers to minimize gate power dissipation and provide galvanic isolation."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the working of a single-phase full-bridge inverter with Sinusoidal Pulse Width Modulation (SPWM).",
          marks: 10,
          intro: "SPWM inverters generate synthesized AC voltages by comparing a high-frequency triangular carrier wave with a reference sine wave.",
          points: [
            "Bridge topology: Four IGBTs/MOSFETs with anti-parallel freewheeling diodes.",
            "Modulation: Carrier frequency fc determines switching rate; modulation index ma controls output fundamental amplitude.",
            "Harmonic Reduction: SPWM shifts harmonic energy to high frequencies (around carrier frequency), easily filtered with small LC filters."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is the difference between an SCR and a TRIAC?",
          answer: "An SCR is a unidirectional 4-layer thyristor that conducts current in one direction only. A TRIAC is a bidirectional thyristor equivalent to two anti-parallel SCRs, capable of conducting in both halves of the AC cycle.",
          keyTerms: ["unidirectional vs bidirectional", "anti-parallel SCRs", "AC phase control"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Always use an isolated oscilloscope differential probe when testing AC mains circuits.",
        "Allow DC link filter capacitors to discharge before touching power modules."
      ],
      apparatus: [
        "Power Electronics Trainer Module (SCR, TRIAC, MOSFET)",
        "AC 230V to 24V Isolation Transformer",
        "Digital Storage Oscilloscope with 100:1 high-voltage probe",
        "100W Lamp Load & Potentiometer Trigger Circuit"
      ],
      procedure: [
        "Connect TRIAC phase control dimmer circuit with lamp load.",
        "Vary gate potentiometer to adjust firing angle α from 30° to 150°.",
        "Observe chopped AC voltage waveforms across lamp on DSO and measure RMS voltage."
      ],
      observations: [
        "Observe lamp dimming as firing angle α increases.",
        "Observe voltage waveform triggering instantaneously at angle α."
      ],
      vivaQuestions: [
        {
          question: "What is holding current (Ih) vs latching current (Il)?",
          answer: "Latching current is the minimum anode current required to turn ON the SCR. Holding current is the minimum anode current below which the SCR turns OFF. Typically Il ≈ 2 to 3 * Ih."
        }
      ],
      virtualLabLink: {
        title: "Motor Drives & Converter Lab",
        url: "/tools/motor-drives",
        toolName: "VFD & Power Inverter Studio"
      }
    }
  },

  // ============================================
  // TOPIC 9: CONTROL SYSTEMS – FEEDBACK & PID
  // ============================================
  'control-systems': {
    conceptOverview: {
      paragraphs: [
        "Control Systems engineering focuses on directing, regulating, and managing the behavior of dynamic systems using feedback loops. In an open-loop system, control actions are independent of system output. In closed-loop feedback systems, the error between desired setpoint and actual process variable drives the actuator.",
        "Transfer functions in the Laplace domain (s-domain) characterize linear time-invariant (LTI) systems. Stability analysis techniques include Routh-Hurwitz criteria, Root Locus techniques, and Frequency Response methods (Bode plots, Nyquist plots).",
        "Proportional-Integral-Derivative (PID) controllers remain the dominant industry standard, providing robust transient response and zero steady-state error across automation, robotics, and industrial processes."
      ],
      realWorldApplications: [
        "Autonomous drone flight stabilization and autopilot systems",
        "Industrial robotic arm precision trajectory control",
        "Thermal power plant steam turbine speed governors",
        "Automotive cruise control and Anti-lock Braking Systems (ABS)"
      ]
    },
    keyFormulas: [
      {
        equation: "T(s) = G(s) / (1 + G(s) * H(s))",
        symbols: ["T(s) = Closed-loop transfer function", "G(s) = Forward path transfer function", "H(s) = Feedback path transfer function"],
        usage: "Standard negative feedback canonical closed-loop formula."
      },
      {
        equation: "u(t) = Kp * e(t) + Ki * ∫e(t)dt + Kd * (de(t)/dt)",
        symbols: ["u(t) = Controller output", "e(t) = Error signal", "Kp, Ki, Kd = Proportional, Integral, Derivative gains"],
        usage: "Time-domain parallel PID control equation."
      }
    ],
    workedExample: {
      problem: "A second-order unity feedback system has open-loop transfer function G(s) = 25 / (s(s + 6)). Determine: (1) Natural frequency ωn, (2) Damping ratio ζ, (3) Percentage Peak Overshoot (%Mp).",
      givenData: ["G(s) = 25 / (s(s + 6))", "H(s) = 1"],
      required: "ωn, ζ, %Mp",
      steps: [
        {
          title: "Step 1: Closed-Loop Characteristic Equation",
          explanation: "1 + G(s)H(s) = 0 => 1 + 25/(s² + 6s) = 0 => s² + 6s + 25 = 0",
          calculation: "s² + 6s + 25 = 0"
        },
        {
          title: "Step 2: Compare with Standard Form: s² + 2ζωn s + ωn² = 0",
          explanation: "ωn² = 25 => ωn = 5 rad/s. 2ζωn = 6 => 2 * ζ * 5 = 6 => ζ = 0.6.",
          calculation: "ωn = 5.0 rad/s, ζ = 0.60"
        },
        {
          title: "Step 3: Calculate Peak Overshoot %Mp",
          explanation: "%Mp = e^(-π * ζ / √(1 - ζ²)) * 100",
          calculation: "%Mp = e^(-π * 0.6 / √(1 - 0.36)) * 100 = e^(-1.8849 / 0.8) * 100 = e^(-2.356) * 100 = 9.48%"
        }
      ],
      finalAnswer: "ωn = 5.0 rad/s, ζ = 0.60 (Underdamped), %Mp = 9.48%",
      interpretation: "With a damping ratio of ζ = 0.6, the system exhibits an optimal balance between fast rise time and low overshoot (<10%)."
    },
    typicalMistakes: [
      {
        mistake: "Setting derivative gain Kd too high in noisy environments",
        fix: "Derivative action amplifies high-frequency noise. Always pair derivative terms with a first-order low-pass noise filter."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain the effects of Proportional (P), Integral (I), and Derivative (D) control actions on system transient and steady-state response.",
          marks: 10,
          intro: "PID controllers combine three distinct control modes to achieve fast, stable, and zero steady-state error response.",
          points: [
            "Proportional (Kp): Accelerates response and reduces rise time, but cannot eliminate steady-state error on its own.",
            "Integral (Ki): Integrates past error over time, boosting system type and eliminating steady-state offset, but reduces phase margin and stability.",
            "Derivative (Kd): Responds to rate of change of error, providing predictive damping, reducing overshoot, and improving settling time."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What is Phase Margin and Gain Margin?",
          answer: "Gain Margin (GM) is the additional gain required to make the system marginally stable. Phase Margin (PM) is the additional phase lag at gain crossover frequency required to bring the system to the verge of instability. For stable systems, both GM and PM are positive.",
          keyTerms: ["gain crossover", "phase crossover", "stability margins"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Avoid unstable gain settings that cause mechanical actuators to slam into hard limits."
      ],
      apparatus: [
        "Analog / Digital Control System Simulator",
        "2nd-Order Simulated Plant",
        "Step Signal Generator & Real-Time Response Scope"
      ],
      procedure: [
        "Apply unit step input to 2nd order plant and record open-loop response.",
        "Implement closed-loop P-control and increase Kp until sustained oscillation occurs.",
        "Apply Ziegler-Nichols tuning rules to calculate Kp, Ki, Kd and observe damped response."
      ],
      observations: [
        "Observe overshoot reduction when Kd is added.",
        "Observe steady-state error dropping to zero when Ki is enabled."
      ],
      vivaQuestions: [
        {
          question: "What is the physical meaning of an underdamped system (ζ < 1)?",
          answer: "An underdamped system contains complex conjugate poles, causing the system output to oscillate before settling to its final value."
        }
      ],
      virtualLabLink: {
        title: "Control Systems Lab Bench",
        url: "/tools/lab-bench",
        toolName: "PID Controller & Step Response Studio"
      }
    }
  },

  // ============================================
  // TOPIC 10: ELECTRICAL MACHINES TESTING & DIAGNOSTICS
  // ============================================
  'electrical-machines-testing': {
    conceptOverview: {
      paragraphs: [
        "Electrical Machines Testing and Diagnostics ensures operational reliability, safety, energy efficiency, and predictive maintenance compliance in industrial machinery. Standard testing complies with IEEE, IEC, and NEMA specifications.",
        "Testing methods include indirect loss separation tests (Swinburne's test, Hopkinson's regenerative test), insulation resistance meggering, polarization index (PI), and motor current signature analysis (MCSA).",
        "Regular diagnostic testing detects insulation breakdown, bearing degradation, rotor bar fractures, and winding inter-turn faults before catastrophic machine failures occur."
      ],
      realWorldApplications: [
        "Predictive maintenance in power generation plants and steel mills",
        "Factory acceptance testing (FAT) for newly manufactured motors and transformers",
        "High-voltage insulation assessment using 5kV Megohmmeter testing",
        "Vibration analysis and infrared thermal imaging of motor bearings"
      ]
    },
    keyFormulas: [
      {
        equation: "PI = R_10min / R_1min",
        symbols: ["PI = Polarization Index", "R_10min = Insulation resistance at 10 minutes", "R_1min = Insulation resistance at 1 minute"],
        usage: "Assesses insulation moisture and degradation. Good insulation has PI ≥ 2.0."
      },
      {
        equation: "η = √( (Pout1 * Pout2) / (Pin1 * Pin2) ) (Hopkinson's Test)",
        symbols: ["Pout, Pin = Measured output and input power of coupled identical DC machines"],
        usage: "Calculates machine efficiency under full-load regenerative conditions with minimal power drawn from mains."
      }
    ],
    workedExample: {
      problem: "In a Swinburne's test on a 220V DC shunt motor, the no-load current was 3A. Armature resistance Ra = 0.5 Ω and field resistance Rsh = 220 Ω. Calculate constant losses and predetermined efficiency when taking 20A full-load current.",
      givenData: ["V = 220V", "I0 = 3A", "Ra = 0.5Ω", "Rsh = 220Ω", "IL = 20A"],
      required: "Constant losses Pc and Full-load efficiency η",
      steps: [
        {
          title: "Step 1: Calculate Field Current and No-Load Armature Current",
          explanation: "Ish = 220 / 220 = 1.0A. Ia0 = 3.0 - 1.0 = 2.0A.",
          calculation: "Ish = 1.0 A, Ia0 = 2.0 A"
        },
        {
          title: "Step 2: Calculate Constant Losses (Pc)",
          explanation: "No-load input = V * I0 = 220 * 3 = 660W. No-load armature loss = Ia0² * Ra = 2² * 0.5 = 2W. Constant loss Pc = 660 - 2 = 658 W.",
          calculation: "Pc = 658 W"
        },
        {
          title: "Step 3: Calculate Full-Load Efficiency",
          explanation: "Full-load Ia = 20 - 1 = 19A. FL armature loss = 19² * 0.5 = 180.5W. Total losses = 658 + 180.5 = 838.5W. Input = 220 * 20 = 4400W. Output = 4400 - 838.5 = 3561.5W.",
          calculation: "η = 3561.5 / 4400 * 100 = 80.94%"
        }
      ],
      finalAnswer: "Constant Losses = 658 W, Full-Load Efficiency = 80.94%",
      interpretation: "Swinburne's test predetermines efficiency at any desired load without physically loading the motor, consuming negligible power."
    },
    typicalMistakes: [
      {
        mistake: "Conducting Swinburne's test on a DC Series motor",
        fix: "Swinburne's test requires running the machine on no-load. A DC series motor CANNOT be run on no-load due to runaway overspeed risk."
      }
    ],
    examCorner: {
      longAnswers: [
        {
          question: "Explain Hopkinson's Test (Back-to-Back Test) for DC shunt machines with circuit diagram and efficiency formulas.",
          marks: 10,
          intro: "Hopkinson's test is a regenerative test where two identical mechanically and electrically coupled DC shunt machines are tested under full load while drawing only loss power from the mains.",
          points: [
            "Setup: Motor drives generator; generator output is fed back into motor supply terminals.",
            "Power from mains supplies only total combined losses of both machines.",
            "Efficiency is calculated separately for motor and generator at full load without wasting enormous energy."
          ]
        }
      ],
      shortAnswers: [
        {
          question: "What does a Polarization Index (PI) < 1.0 indicate?",
          answer: "A PI < 1.0 indicates severe insulation contamination, moisture absorption, or insulation degradation, requiring cleaning, drying, and re-varnishing before energizing.",
          keyTerms: ["moisture absorption", "insulation contamination", "re-varnishing needed"]
        }
      ]
    },
    labPractical: {
      safetyNotes: [
        "Discharge high-voltage test charges after megger testing before touching terminals.",
        "Ensure mechanical shaft coupling guards are locked in place."
      ],
      apparatus: [
        "Two Identical DC Shunt Machines (220V, 3HP)",
        "5kV Digital Insulation Resistance Megohmmeter",
        "DC Regulated Power Supply & Starter Panel",
        "Digital Precision Power Analyzer"
      ],
      procedure: [
        "Coupling verification: Wire two identical DC shunt machines back-to-back.",
        "Start motor using starter, synchronize generator output to bus voltage.",
        "Close paralleling switch and increase generator excitation to transfer full load.",
        "Record supply voltage, supply current, generator current, and calculate machine efficiency."
      ],
      observations: [
        "Observe that the power drawn from the mains is only 15-20% of total circulating power (equal to combined machine losses)."
      ],
      vivaQuestions: [
        {
          question: "Why is Hopkinson's test called a regenerative test?",
          answer: "Because the power generated by the generator is fed back into the motor; power is recirculated rather than dissipated as heat in a resistor load."
        }
      ],
      virtualLabLink: {
        title: "Electrical Machines Testing Bench",
        url: "/tools/electrical-machines",
        toolName: "Hopkinson & Swinburne Testing Studio"
      }
    }
  }
};

// Aliases for matching alternate slug routes
topicContent['single-phase-transformers'] = topicContent['transformers'];
topicContent['operational-amplifiers'] = topicContent['op-amps-analog'];
topicContent['circuit-theorems'] = topicContent['circuit-analysis'];

// Default placeholder for unseeded topics
export const defaultTopicContent: TopicContent = topicContent['dc-machines'];
