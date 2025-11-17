import { db } from '@/db';
import { projects } from '@/db/schema';

async function main() {
    const sampleProjects = [
        {
            title: 'Build a 3-Phase Motor Controller',
            description: 'Learn to design and build a complete 3-phase motor controller circuit with speed control and protection features. Perfect for industrial automation applications.',
            category: 'motor_controller',
            difficulty: 'intermediate',
            estimatedTime: '4 hours',
            authorId: 'author_001',
            authorName: 'John Electrician',
            thumbnailUrl: null,
            status: 'published',
            viewsCount: 245,
            likesCount: 32,
            ratingAverage: 4.5,
            ratingCount: 18,
            tags: JSON.stringify(['motor-control', 'three-phase', 'industrial', 'automation']),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Design a Solar Panel System',
            description: 'Complete guide to designing a residential solar panel system including panel selection, inverter sizing, battery storage, and grid connection.',
            category: 'solar_panel',
            difficulty: 'advanced',
            estimatedTime: '8 hours',
            authorId: 'author_002',
            authorName: 'Sarah Green Energy',
            thumbnailUrl: null,
            status: 'published',
            viewsCount: 567,
            likesCount: 89,
            ratingAverage: 4.8,
            ratingCount: 45,
            tags: JSON.stringify(['solar', 'renewable-energy', 'power-systems', 'green-energy']),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Create a Home Automation Circuit',
            description: 'Build a simple home automation circuit using relays and microcontrollers to control lights, fans, and appliances remotely.',
            category: 'home_automation',
            difficulty: 'beginner',
            estimatedTime: '2 hours',
            authorId: 'author_003',
            authorName: 'Mike Smart Home',
            thumbnailUrl: null,
            status: 'published',
            viewsCount: 892,
            likesCount: 156,
            ratingAverage: 4.3,
            ratingCount: 67,
            tags: JSON.stringify(['home-automation', 'iot', 'smart-home', 'relay-control']),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(projects).values(sampleProjects);
    
    console.log('✅ Projects seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});