import { db } from '@/db';
import { projectCommentsNew } from '@/db/schema';

async function main() {
    const sampleComments = [
        // Project 1: 3-Phase Motor Controller (5 comments)
        {
            projectId: 1,
            userId: 'user_002',
            comment: 'Excellent guide! Successfully built this for my workshop CNC machine. The thermal calculations were spot-on.',
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            projectId: 1,
            userId: 'eng_001',
            comment: "What IGBT modules did you use? I'm planning to build one for a 5HP motor.",
            createdAt: new Date('2024-01-16T14:20:00').toISOString(),
        },
        {
            projectId: 1,
            userId: 'user_003',
            comment: 'Very detailed instructions. The PWM frequency selection section was particularly helpful.',
            createdAt: new Date('2024-01-18T09:15:00').toISOString(),
        },
        {
            projectId: 1,
            userId: 'eng_002',
            comment: 'Great project! Minor suggestion: add more details about the gate driver power supply isolation.',
            createdAt: new Date('2024-01-20T16:45:00').toISOString(),
        },
        {
            projectId: 1,
            userId: 'user_004',
            comment: 'This is advanced but well explained. Took me 2 weeks but finally got it working perfectly!',
            createdAt: new Date('2024-01-25T11:00:00').toISOString(),
        },

        // Project 2: Solar Panel System (7 comments)
        {
            projectId: 2,
            userId: 'user_001',
            comment: 'Just completed this installation on my home. Generating 4.5kW daily! Thanks for the detailed guide.',
            createdAt: new Date('2024-01-12T08:30:00').toISOString(),
        },
        {
            projectId: 2,
            userId: 'solar_001',
            comment: 'Quick question - can I use a 48V battery bank instead of 24V? How would that affect the inverter selection?',
            createdAt: new Date('2024-01-14T13:20:00').toISOString(),
        },
        {
            projectId: 2,
            userId: 'user_003',
            comment: 'The battery sizing calculator was a lifesaver. Saved me from undersizing my system.',
            createdAt: new Date('2024-01-17T10:45:00').toISOString(),
        },
        {
            projectId: 2,
            userId: 'solar_002',
            comment: 'Best solar guide I've found. Clear explanations of series vs parallel configurations.',
            createdAt: new Date('2024-01-19T15:30:00').toISOString(),
        },
        {
            projectId: 2,
            userId: 'user_005',
            comment: 'Installing mine this weekend. Already ordered all components based on your recommendations.',
            createdAt: new Date('2024-01-22T09:00:00').toISOString(),
        },
        {
            projectId: 2,
            userId: 'eng_003',
            comment: 'Have you considered adding MPPT optimization algorithm details? Would be a great addition.',
            createdAt: new Date('2024-01-24T14:15:00').toISOString(),
        },
        {
            projectId: 2,
            userId: 'maker_001',
            comment: 'System working great for 2 months now. Zero issues. Well done!',
            createdAt: new Date('2024-01-28T11:30:00').toISOString(),
        },

        // Project 3: Home Automation (8 comments)
        {
            projectId: 3,
            userId: 'user_001',
            comment: 'Perfect beginner project! Got it running in a weekend. The code examples were very clear.',
            createdAt: new Date('2024-01-10T09:45:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'user_002',
            comment: 'Can this be expanded to control more than 8 devices? What are the ESP32 limitations?',
            createdAt: new Date('2024-01-13T14:30:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'iot_001',
            comment: 'Implemented this with Home Assistant integration. Works flawlessly!',
            createdAt: new Date('2024-01-16T10:20:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'user_004',
            comment: 'Great starter project for IoT. Now I'm planning to add motion sensors and door locks.',
            createdAt: new Date('2024-01-19T16:00:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'maker_002',
            comment: 'The relay isolation circuit design is solid. Good safety practices demonstrated.',
            createdAt: new Date('2024-01-21T11:45:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'tech_001',
            comment: 'Used this as base for my college project. Professor was impressed! Added voice control too.',
            createdAt: new Date('2024-01-23T13:15:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'iot_002',
            comment: "How's the WiFi stability? Does it reconnect automatically after power outages?",
            createdAt: new Date('2024-01-26T09:30:00').toISOString(),
        },
        {
            projectId: 3,
            userId: 'user_005',
            comment: 'Simple yet powerful. Exactly what I needed for my home. Thank you!',
            createdAt: new Date('2024-01-29T15:20:00').toISOString(),
        },
    ];

    await db.insert(projectCommentsNew).values(sampleComments);
    
    console.log('✅ Project comments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});