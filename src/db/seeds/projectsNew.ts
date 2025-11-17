import { db } from '@/db';
import { projectsNew } from '@/db/schema';

async function main() {
    const sampleProjects = [
        {
            userId: 'user_001',
            title: '3-Phase Motor Controller',
            description: 'Build a complete 3-phase motor controller with variable frequency drive (VFD) for industrial applications. Includes overload protection, emergency stop, and remote monitoring capabilities.',
            category: 'motor_controller',
            difficulty: 'advanced',
            imageUrl: '/images/motor-controller.jpg',
            views: 523,
            featured: 1,
            createdAt: new Date('2024-10-01').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
        {
            userId: 'user_002',
            title: 'Solar Panel System Design',
            description: 'Complete guide to designing and installing a residential solar panel system with battery backup. Covers panel selection, inverter sizing, wiring, and grid connection requirements.',
            category: 'solar_panel',
            difficulty: 'intermediate',
            imageUrl: '/images/solar-system.jpg',
            views: 892,
            featured: 1,
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
        {
            userId: 'user_003',
            title: 'Smart Home Automation Circuit',
            description: 'IoT-based home automation system using ESP32. Control lights, fans, and appliances via smartphone app. Includes temperature sensors and automated scheduling.',
            category: 'home_automation',
            difficulty: 'beginner',
            imageUrl: '/images/home-automation.jpg',
            views: 1247,
            featured: 0,
            createdAt: new Date('2024-11-01').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        }
    ];

    await db.insert(projectsNew).values(sampleProjects);
    
    console.log('✅ Projects seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});