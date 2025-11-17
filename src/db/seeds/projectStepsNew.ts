import { db } from '@/db';
import { projectStepsNew } from '@/db/schema';

async function main() {
    const sampleProjectSteps = [
        // Project 1: 3-Phase Motor Controller (4 steps)
        {
            projectId: 1,
            stepNumber: 1,
            title: 'Component Selection and Planning',
            description: 'Select appropriate IGBTs, gate drivers, and control ICs. Calculate power requirements and thermal dissipation.',
            imageUrl: null,
            calculatorLink: '/calculators/power-dissipation',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 2,
            title: 'Power Circuit Design',
            description: 'Design the 3-phase inverter topology with proper snubber circuits and protection elements.',
            imageUrl: null,
            calculatorLink: '/calculators/motor-power',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 3,
            title: 'Control Circuit Implementation',
            description: 'Implement PWM generation, current sensing, and feedback control loops using microcontroller.',
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            projectId: 1,
            stepNumber: 4,
            title: 'Testing and Commissioning',
            description: 'Perform no-load and full-load testing. Calibrate protection circuits and verify safe operation.',
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-10').toISOString(),
        },
        // Project 2: Solar Panel System (5 steps)
        {
            projectId: 2,
            stepNumber: 1,
            title: 'Energy Assessment',
            description: 'Calculate daily energy consumption and required solar capacity. Determine optimal panel orientation.',
            imageUrl: null,
            calculatorLink: '/calculators/solar-sizing',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 2,
            title: 'Component Procurement',
            description: 'Select solar panels, charge controller, inverter, and battery bank based on calculations.',
            imageUrl: null,
            calculatorLink: '/calculators/battery-capacity',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 3,
            title: 'Mounting and Wiring',
            description: 'Install mounting structure, wire panels in series/parallel, and connect to charge controller.',
            imageUrl: null,
            calculatorLink: '/calculators/wire-size',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 4,
            title: 'System Integration',
            description: 'Connect inverter, batteries, and grid connection. Configure monitoring system.',
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            projectId: 2,
            stepNumber: 5,
            title: 'Testing and Optimization',
            description: 'Test system performance under various conditions. Optimize settings for maximum efficiency.',
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        // Project 3: Home Automation (3 steps)
        {
            projectId: 3,
            stepNumber: 1,
            title: 'ESP32 Setup',
            description: 'Flash ESP32 with firmware, configure WiFi, and set up cloud connectivity.',
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            projectId: 3,
            stepNumber: 2,
            title: 'Relay Circuit Assembly',
            description: 'Build relay board for switching AC loads. Include optocoupler isolation and protection.',
            imageUrl: null,
            calculatorLink: '/calculators/relay-selection',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            projectId: 3,
            stepNumber: 3,
            title: 'Sensor Integration',
            description: 'Connect DHT22 temperature sensors and implement data logging functionality.',
            imageUrl: null,
            calculatorLink: null,
            createdAt: new Date('2024-01-20').toISOString(),
        },
    ];

    await db.insert(projectStepsNew).values(sampleProjectSteps);
    
    console.log('✅ Project steps seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});