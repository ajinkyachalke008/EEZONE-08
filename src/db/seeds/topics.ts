import { db } from '@/db';
import { topics } from '@/db/schema';

async function main() {
    const sampleTopics = [
        {
            slug: 'dc-machines',
            title: 'DC Machines – Basics and Performance',
            description: 'Master the fundamentals of DC motors and generators, including construction, working principles, and performance characteristics. Learn about armature reaction, commutation, and speed control methods used in industrial applications.',
            icon: 'Battery',
            orderIndex: 1,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'ac-machines',
            title: 'AC Machines – Synchronous and Induction Motors',
            description: 'Explore three-phase induction motors, synchronous machines, and single-phase motors. Understand torque-speed characteristics, starting methods, and efficiency optimization techniques for rotating electrical machinery.',
            icon: 'RotateCw',
            orderIndex: 2,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'transformers',
            title: 'Transformers – Theory and Applications',
            description: 'Study transformer construction, EMF equations, equivalent circuits, and losses. Learn about three-phase transformers, autotransformers, and instrument transformers used in power distribution systems.',
            icon: 'Zap',
            orderIndex: 3,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'power-systems',
            title: 'Power Systems – Generation, Transmission & Distribution',
            description: 'Understand power system components, load flow analysis, fault calculations, and protection schemes. Learn about transmission line parameters, HVDC systems, and modern smart grid technologies.',
            icon: 'Cable',
            orderIndex: 4,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'circuit-analysis',
            title: 'Circuit Analysis – Network Theorems and Techniques',
            description: 'Apply fundamental circuit analysis methods including mesh and nodal analysis, Thevenin and Norton theorems, and AC circuit analysis using phasor diagrams. Master complex impedance calculations and resonance phenomena.',
            icon: 'CircuitBoard',
            orderIndex: 5,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'op-amps-analog',
            title: 'Op-Amps & Analog Electronics',
            description: 'Learn operational amplifier characteristics, ideal and non-ideal behavior, and practical circuit applications. Study inverting and non-inverting configurations, filters, oscillators, and instrumentation amplifiers.',
            icon: 'Activity',
            orderIndex: 6,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'digital-electronics',
            title: 'Digital Electronics – Logic Design and Systems',
            description: 'Master Boolean algebra, combinational and sequential logic circuits, and digital system design. Learn about flip-flops, counters, registers, and memory devices used in modern digital systems.',
            icon: 'Cpu',
            orderIndex: 7,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'power-electronics',
            title: 'Power Electronics – Converters and Drives',
            description: 'Study power semiconductor devices, rectifiers, inverters, and DC-DC converters. Understand PWM techniques, motor drive circuits, and applications in renewable energy systems and electric vehicles.',
            icon: 'Plug',
            orderIndex: 8,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'control-systems',
            title: 'Control Systems – Analysis and Design',
            description: 'Explore feedback control principles, transfer functions, time and frequency domain analysis. Learn stability criteria, PID controllers, state-space methods, and modern control techniques for industrial automation.',
            icon: 'Gauge',
            orderIndex: 9,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'electrical-machines-testing',
            title: 'Electrical Machines Testing & Measurements',
            description: 'Learn standard testing procedures for transformers, motors, and generators. Understand load tests, no-load tests, efficiency calculations, and diagnostic techniques for predictive maintenance in electrical machinery.',
            icon: 'FileCheck',
            orderIndex: 10,
            createdAt: new Date('2024-01-01').toISOString(),
        },
    ];

    await db.insert(topics).values(sampleTopics);
    
    console.log('✅ Topics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});