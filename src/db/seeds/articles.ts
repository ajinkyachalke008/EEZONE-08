import { db } from '@/db';
import { articles } from '@/db/schema';

async function main() {
    const sampleArticles = [
        {
            title: 'Understanding Arc Flash Hazards in Industrial Settings',
            excerpt: 'Learn about arc flash dangers, PPE requirements, and NFPA 70E compliance for electrical safety. This comprehensive guide covers incident energy calculations and protective boundary requirements.',
            content: `Arc flash incidents pose one of the most serious hazards in electrical work environments. An arc flash is an explosive release of energy caused by an electrical fault, producing intense heat, light, and pressure waves that can cause severe injuries or fatalities. Understanding these hazards is crucial for anyone working with or near energized electrical equipment.

The National Fire Protection Association (NFPA) 70E standard provides comprehensive guidance on electrical safety in the workplace. It establishes the framework for arc flash hazard analysis, including incident energy calculations measured in calories per square centimeter (cal/cm²). These calculations determine the appropriate level of personal protective equipment (PPE) required for specific tasks. PPE categories range from Category 1 (4 cal/cm²) to Category 4 (40+ cal/cm²), with each level requiring increasingly protective arc-rated clothing and equipment.

Establishing arc flash boundaries is essential for worker safety. The arc flash boundary is the distance at which a worker could receive a second-degree burn if an arc flash occurs. Inside this boundary, appropriate PPE must be worn. The limited approach boundary and restricted approach boundaries are additional safety zones that require specific qualifications and protective measures. Regular arc flash studies should be conducted to ensure accurate hazard assessments as electrical systems change.

Implementing a comprehensive electrical safety program involves more than just providing PPE. It requires proper training, hazard assessments, energized electrical work permits, and a strong commitment to safety culture. De-energizing equipment and using lockout/tagout procedures whenever possible remains the safest approach. When energized work is necessary, following NFPA 70E guidelines and using proper PPE can significantly reduce the risk of arc flash injuries.`,
            readTime: 12,
            category: 'Safety',
            author: 'David Chen, PE',
            authorAvatar: '/avatars/david-chen.jpg',
            views: 850,
            likes: 45,
            thumbnailUrl: '/articles/arc-flash-safety.jpg',
            tags: 'arc flash, safety, NFPA 70E, PPE, electrical hazards',
            publishedAt: new Date('2024-08-15').toISOString(),
            createdAt: new Date('2024-08-15').toISOString(),
            updatedAt: new Date('2024-08-15').toISOString(),
        },
        {
            title: 'Transformer Theory: Turns Ratio and Impedance',
            excerpt: 'Comprehensive guide to transformer fundamentals including turns ratio, voltage transformation, and impedance matching. Understand the principles that make power distribution possible.',
            content: `Transformers are fundamental components in electrical power systems, enabling efficient voltage transformation and power distribution. At the heart of transformer operation lies the turns ratio, which is the relationship between the number of windings on the primary coil to the number of windings on the secondary coil. This ratio directly determines the voltage transformation: Vs/Vp = Ns/Np, where Vs and Vp are secondary and primary voltages, and Ns and Np are the number of turns.

The turns ratio not only affects voltage but also current transformation. When voltage is stepped up, current is stepped down proportionally, and vice versa. This inverse relationship maintains power conservation (assuming ideal conditions): Vp × Ip = Vs × Is. In practical applications, this principle allows us to transmit power at high voltages and low currents to minimize transmission losses, then step down the voltage for safe utilization at the consumer level.

Transformer impedance is another critical concept that affects performance and protection coordination. The percent impedance (%Z) represents the voltage drop across the transformer at full load, expressed as a percentage of rated voltage. This impedance limits fault currents and affects voltage regulation. A transformer with 5% impedance will have a 5% voltage drop from no-load to full-load conditions. Understanding impedance is essential for proper transformer sizing and protection device coordination.

Impedance matching becomes particularly important in power electronics and RF applications. When connecting transformers to loads, matching impedances ensures maximum power transfer and minimizes reflections. The impedance transformation ratio follows the square of the turns ratio: Zs/Zp = (Ns/Np)². This relationship allows transformers to match high-impedance sources to low-impedance loads efficiently, making them invaluable in audio systems, power supplies, and communication equipment.`,
            readTime: 15,
            category: 'Theory',
            author: 'Jennifer Williams, EE',
            authorAvatar: '/avatars/jennifer-williams.jpg',
            views: 620,
            likes: 32,
            thumbnailUrl: '/articles/transformer-theory.jpg',
            tags: 'transformers, theory, turns ratio, impedance, voltage transformation',
            publishedAt: new Date('2024-09-05').toISOString(),
            createdAt: new Date('2024-09-05').toISOString(),
            updatedAt: new Date('2024-09-05').toISOString(),
        },
        {
            title: 'Solar PV System Design Guide for Residential Installations',
            excerpt: 'Step-by-step process for designing residential solar photovoltaic systems including sizing, equipment selection, and code compliance. Learn how to create efficient, code-compliant solar installations.',
            content: `Designing a residential solar PV system requires careful consideration of multiple factors to ensure optimal performance and code compliance. The process begins with a thorough site assessment, including roof condition, orientation, shading analysis, and available mounting space. South-facing roofs with minimal shading provide the best performance in the Northern Hemisphere, though east and west orientations can also be viable. Using tools like Solar Pathfinder or software like PVsyst helps accurately assess solar resource availability and predict system performance.

System sizing is critical for meeting energy needs while maximizing return on investment. Start by analyzing the homeowner's historical electricity consumption, typically using 12 months of utility bills. Calculate the average daily energy consumption in kilowatt-hours (kWh) and account for future usage changes. The system size in kilowatts (kW) is determined by dividing annual consumption by peak sun hours and accounting for system losses (typically 15-25%). For example, a home using 10,000 kWh annually in an area with 5 peak sun hours would require approximately 6-7 kW system capacity.

Equipment selection involves choosing appropriate solar modules, inverters, mounting systems, and balance of system components. Module selection should consider efficiency, temperature coefficient, warranty terms, and aesthetics. String inverters are cost-effective for uniform arrays, while microinverters or power optimizers offer advantages for partially shaded roofs or complex layouts. All equipment must be listed and labeled for the intended application, meeting UL standards and local code requirements.

Code compliance is paramount for safe, legal installation. The National Electrical Code (NEC) Articles 690 and 705 govern solar PV installations, covering conductor sizing, overcurrent protection, grounding, disconnecting means, and utility interconnection. Rapid shutdown requirements mandate that PV systems have controlled conductors within specified boundaries. String calculations must account for temperature extremes to ensure voltage stays within equipment ratings. Additionally, structural calculations verify that roof loads are acceptable, and permits must be obtained before installation begins.`,
            readTime: 18,
            category: 'Design',
            author: 'Michael Rodriguez, PE',
            authorAvatar: '/avatars/michael-rodriguez.jpg',
            views: 1240,
            likes: 78,
            thumbnailUrl: '/articles/solar-pv-design.jpg',
            tags: 'solar, PV, renewable energy, design, residential, NEC',
            publishedAt: new Date('2024-10-12').toISOString(),
            createdAt: new Date('2024-10-12').toISOString(),
            updatedAt: new Date('2024-10-12').toISOString(),
        },
        {
            title: 'Troubleshooting Motor Control Circuits',
            excerpt: 'Systematic approach to diagnosing and fixing common motor control circuit problems in industrial applications. Master the methodical process that saves time and prevents costly downtime.',
            content: `Troubleshooting motor control circuits requires a systematic approach to quickly identify and resolve issues while maintaining safety. Begin by gathering information about the problem: when it started, what changed, and what symptoms are present. Document normal operating parameters for reference. Before touching any equipment, verify that lockout/tagout procedures are properly implemented and test for the presence of voltage. Safety must always be the first priority when working with motor controls.

Start with visual inspection of the control circuit, looking for obvious signs of damage like burned components, loose connections, or tripped overloads. Check for proper fuse conditions and reset any tripped circuit breakers or motor starters. Examine control panel wiring for signs of overheating, damaged insulation, or loose terminals. Many motor control problems can be identified through careful visual inspection before requiring electrical testing. Pay special attention to control transformer connections, as loose or corroded terminals here can cause intermittent faults.

Use a systematic testing approach, working from the power source through the control circuit to the motor. Verify input power voltage and phase balance at the motor starter. Test control circuit voltage at the transformer secondary. Check pilot devices (push buttons, selector switches, limit switches) for proper operation and contact continuity. Use a multimeter to trace voltage through the control logic, identifying where voltage is lost. For complex circuits, refer to the electrical schematic and use it to trace the expected current path.

Common motor control circuit faults include failed overload relays, stuck contacts on starters or relays, damaged control transformers, and failed pilot devices. Intermittent problems often stem from loose connections, worn contacts, or environmental factors like moisture or vibration. When replacing components, always use properly rated parts and verify circuit operation before returning the system to service. Document all findings and repairs to build a maintenance history that helps predict future problems and improve reliability.`,
            readTime: 10,
            category: 'Troubleshooting',
            author: 'Sarah Thompson',
            authorAvatar: null,
            views: 890,
            likes: 56,
            thumbnailUrl: '/articles/motor-control-troubleshooting.jpg',
            tags: 'motor control, troubleshooting, industrial, maintenance, diagnostics',
            publishedAt: new Date('2024-09-28').toISOString(),
            createdAt: new Date('2024-09-28').toISOString(),
            updatedAt: new Date('2024-09-28').toISOString(),
        },
        {
            title: 'Power Factor Correction: Theory and Practice',
            excerpt: 'Understanding power factor, its impact on electrical systems, and methods for correction using capacitor banks. Improve efficiency and reduce utility costs through proper power factor management.',
            content: `Power factor is a critical measure of electrical system efficiency, representing the ratio of real power (kW) to apparent power (kVA). A power factor of 1.0 (unity) indicates that all supplied power is being used for useful work, while lower values indicate the presence of reactive power that performs no useful work but still flows through the system. Inductive loads such as motors, transformers, and fluorescent lighting create lagging power factors, while capacitive loads create leading power factors. Most industrial facilities experience lagging power factors due to predominant inductive loads.

The power triangle illustrates the relationship between real power, reactive power, and apparent power. Real power (P) represents actual work performed, measured in kilowatts. Reactive power (Q) represents energy oscillating between source and load, measured in kilovars (kVAR). Apparent power (S) is the vector sum of real and reactive power, measured in kilovolt-amperes (kVA). The power factor equals P/S, or the cosine of the angle between real and apparent power. Understanding this relationship is essential for calculating correction requirements.

Poor power factor has significant economic and technical impacts. Utilities often impose penalties for power factors below 0.95, as reactive power increases transmission losses and requires larger capacity equipment. Low power factor reduces available capacity for real power, limiting the useful work that existing electrical infrastructure can support. It causes increased voltage drops, higher conductor temperatures, and reduced equipment life. The financial impact includes both utility penalty charges and the cost of oversized equipment needed to handle apparent power loads.

Power factor correction typically involves installing capacitor banks to supply reactive power locally, reducing the reactive power drawn from the utility. Capacitors provide leading reactive power that offsets the lagging reactive power of inductive loads. The required capacitor size in kVAR can be calculated using: kVAR = kW × (tan θ₁ - tan θ₂), where θ₁ is the existing power factor angle and θ₂ is the target power factor angle. Automatic power factor correction systems use controllers to switch capacitor banks as loads change, maintaining optimal power factor under varying conditions while preventing overcorrection.`,
            readTime: 14,
            category: 'Theory',
            author: 'Robert Martinez, PE',
            authorAvatar: '/avatars/robert-martinez.jpg',
            views: 720,
            likes: 41,
            thumbnailUrl: null,
            tags: 'power factor, capacitors, efficiency, power quality, reactive power',
            publishedAt: new Date('2024-08-22').toISOString(),
            createdAt: new Date('2024-08-22').toISOString(),
            updatedAt: new Date('2024-08-22').toISOString(),
        },
        {
            title: 'Proper Grounding and Bonding in Commercial Buildings',
            excerpt: 'Essential grounding and bonding requirements for commercial electrical installations per NEC standards. Ensure safety and code compliance with proper grounding techniques.',
            content: `Grounding and bonding are fundamental safety requirements in commercial electrical installations, serving distinct but related purposes. Grounding provides a low-impedance path to earth, stabilizing voltage during normal operation and facilitating overcurrent device operation during ground faults. Bonding connects metallic parts to ensure electrical continuity and the capacity to safely conduct fault current. The National Electrical Code (NEC) Articles 250 establishes comprehensive requirements for both grounding and bonding in commercial installations.

The grounding electrode system forms the foundation of an effective grounding system. NEC requires that all available grounding electrodes be bonded together to form the grounding electrode system. These electrodes include metal underground water pipes, metal building frames, concrete-encased electrodes (Ufer grounds), ground rings, and rod and pipe electrodes. The grounding electrode conductor connects the grounding electrode system to the service equipment grounded conductor and establishes a reference to earth. Proper sizing of this conductor based on NEC Table 250.66 is critical for system safety.

Equipment grounding is essential for protecting people from electrical shock and ensuring proper operation of overcurrent protective devices. All non-current-carrying metal parts of electrical equipment must be bonded together and connected to the equipment grounding conductor system. This includes conduit systems, equipment enclosures, cable armor, and junction boxes. The equipment grounding conductor provides the low-impedance fault current path necessary for circuit breakers or fuses to operate quickly during ground faults. Sizing must follow NEC Table 250.122, based on the rating of the overcurrent device.

Bonding requirements extend beyond basic equipment grounding. The main bonding jumper at the service equipment connects the grounded conductor to the equipment grounding conductor and service enclosure, making it a critical link in the safety system. Separately derived systems, such as transformers and generators, require system bonding jumpers at their sources. Supplementary bonding may be required for specific locations, such as swimming pools, therapeutic pools, and areas with sensitive electronic equipment. All metallic piping systems, structural steel, and exposed conductive surfaces within reach of electrical equipment must be bonded to prevent potential differences that could cause shock hazards.`,
            readTime: 16,
            category: 'Installation',
            author: 'David Chen, PE',
            authorAvatar: '/avatars/david-chen.jpg',
            views: 1050,
            likes: 62,
            thumbnailUrl: '/articles/grounding-bonding.jpg',
            tags: 'grounding, bonding, NEC, safety, installation, commercial',
            publishedAt: new Date('2024-11-03').toISOString(),
            createdAt: new Date('2024-11-03').toISOString(),
            updatedAt: new Date('2024-11-03').toISOString(),
        },
        {
            title: 'Circuit Breaker Types and Selection Criteria',
            excerpt: 'Comprehensive overview of molded case, air, vacuum, and SF6 circuit breakers with selection guidelines. Choose the right breaker technology for your application requirements.',
            content: `Circuit breakers are essential protective devices that interrupt fault currents to protect electrical systems and equipment. Selecting the appropriate breaker type requires understanding the characteristics and applications of different technologies. Molded case circuit breakers (MCCBs) are the most common type in commercial and light industrial applications, rated from 15 to 2500 amperes. They feature thermal-magnetic or electronic trip units housed in an insulated molded case, providing overcurrent and short-circuit protection in a compact, economical package.

Air circuit breakers (ACBs) serve medium to high-power applications, typically rated above 800 amperes up to 6300 amperes. These breakers interrupt current by separating contacts in air, using arc chutes to extinguish the arc through cooling and lengthening. ACBs offer advantages including draw-out construction for easy maintenance, multiple protection functions, and longer electrical life. Their modular design allows for various trip units, communication modules, and accessories. Common applications include main service entrances, generator breakers, and large motor controls in industrial facilities.

Vacuum circuit breakers (VCBs) use vacuum interrupters to extinguish the arc, making them ideal for medium voltage applications from 4.16 kV to 38 kV. The vacuum provides excellent insulation and arc quenching properties, resulting in minimal contact erosion and extended maintenance intervals. VCBs are compact, require no periodic contact adjustment, and are environmentally friendly with no gas emissions. They excel in applications requiring frequent switching operations, such as motor starters, capacitor banks, and distribution substations.

Circuit breaker selection depends on multiple factors including voltage rating, continuous current rating, short-circuit interrupting capacity, ambient conditions, and application requirements. The interrupting rating must exceed the available fault current at the installation point, with appropriate safety margin. Consider coordination with upstream and downstream protective devices to ensure selective operation. Environmental factors such as temperature, altitude, and corrosive atmospheres may require derating or special features. Evaluate the total cost of ownership, including initial cost, installation requirements, maintenance needs, and expected service life when making the final selection.`,
            readTime: 11,
            category: 'Design',
            author: 'Jennifer Williams, EE',
            authorAvatar: '/avatars/jennifer-williams.jpg',
            views: 980,
            likes: 54,
            thumbnailUrl: '/articles/circuit-breakers.jpg',
            tags: 'circuit breakers, protection, MCCB, ACB, VCB, selection',
            publishedAt: new Date('2024-10-18').toISOString(),
            createdAt: new Date('2024-10-18').toISOString(),
            updatedAt: new Date('2024-10-18').toISOString(),
        },
        {
            title: 'Preventive Maintenance for Electrical Distribution Systems',
            excerpt: 'Best practices for maintaining switchgear, transformers, and distribution equipment to ensure reliability. Implement a comprehensive PM program to prevent failures and extend equipment life.',
            content: `A comprehensive preventive maintenance program is essential for ensuring reliability, safety, and longevity of electrical distribution systems. Regular maintenance activities detect potential problems before they cause failures, reducing unplanned downtime and costly repairs. The foundation of any PM program is a detailed inventory of all electrical equipment with maintenance schedules based on manufacturer recommendations, industry standards, and operational experience. Documentation of all maintenance activities provides trending data that helps predict failures and optimize maintenance intervals.

Switchgear maintenance encompasses both mechanical and electrical components. Visual inspections should check for signs of overheating, loose connections, corrosion, and physical damage. Mechanical operations include exercising breakers and switches to ensure smooth operation and proper contact alignment. Torque verification of bolted connections prevents failures due to thermal cycling and vibration. Insulation resistance testing with a megohmmeter verifies insulation integrity, while contact resistance measurements identify deteriorating connections. Protective relay testing confirms proper operation and coordination. Annual infrared thermography surveys detect hot spots before they cause failures.

Transformer maintenance varies by type and cooling method but shares common elements. Regular oil sampling and analysis for dry-type and oil-filled transformers monitors insulation condition, moisture content, and dissolved gases that indicate internal faults. Visual inspections check for oil leaks, unusual sounds, and proper operation of cooling systems. Temperature monitoring ensures transformers operate within design limits. Bushing inspections, including power factor testing, detect deterioration before failure. Load tap changer maintenance for adjustable transformers includes oil changes, contact inspection, and operational testing. Partial discharge testing on critical transformers identifies insulation weaknesses.

Distribution equipment maintenance extends to all system components. Motor control centers require regular cleaning, tightening of connections, and verification of proper operation. Panelboards need periodic inspection, cleaning, and thermal scanning. Emergency and standby power systems require monthly operation, annual load bank testing, and regular battery maintenance. Maintaining accurate as-built drawings and updating them after any modifications ensures maintenance personnel have correct information. Training personnel on proper maintenance procedures and safety requirements maximizes program effectiveness while protecting worker safety.`,
            readTime: 13,
            category: 'Maintenance',
            author: 'Michael Rodriguez, PE',
            authorAvatar: '/avatars/michael-rodriguez.jpg',
            views: 760,
            likes: 38,
            thumbnailUrl: null,
            tags: 'maintenance, PM, switchgear, transformers, reliability, preventive',
            publishedAt: new Date('2024-09-14').toISOString(),
            createdAt: new Date('2024-09-14').toISOString(),
            updatedAt: new Date('2024-09-14').toISOString(),
        },
    ];

    await db.insert(articles).values(sampleArticles);
    
    console.log('✅ Articles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});