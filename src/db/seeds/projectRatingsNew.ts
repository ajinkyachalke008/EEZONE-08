import { db } from '@/db';
import { projectRatingsNew } from '@/db/schema';

async function main() {
    const sampleRatings = [
        // Project 1 (3-Phase Motor Controller) - 8 ratings, avg ~4.5
        {
            projectId: 1,
            userId: 'user_002',
            rating: 5,
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'user_003',
            rating: 5,
            createdAt: new Date('2024-01-16T14:20:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'user_004',
            rating: 4,
            createdAt: new Date('2024-01-17T09:15:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'user_005',
            rating: 5,
            createdAt: new Date('2024-01-18T16:45:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'eng_001',
            rating: 4,
            createdAt: new Date('2024-01-19T11:30:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'eng_002',
            rating: 5,
            createdAt: new Date('2024-01-20T13:00:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'eng_003',
            rating: 3,
            createdAt: new Date('2024-01-21T15:20:00Z').toISOString(),
        },
        {
            projectId: 1,
            userId: 'eng_004',
            rating: 5,
            createdAt: new Date('2024-01-22T10:10:00Z').toISOString(),
        },

        // Project 2 (Solar Panel System) - 12 ratings, avg ~4.6
        {
            projectId: 2,
            userId: 'user_001',
            rating: 5,
            createdAt: new Date('2024-01-12T08:30:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'user_003',
            rating: 5,
            createdAt: new Date('2024-01-13T12:15:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'user_004',
            rating: 5,
            createdAt: new Date('2024-01-14T14:40:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'user_005',
            rating: 4,
            createdAt: new Date('2024-01-15T09:20:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'eng_001',
            rating: 5,
            createdAt: new Date('2024-01-16T16:30:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'eng_002',
            rating: 4,
            createdAt: new Date('2024-01-17T11:45:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'eng_003',
            rating: 5,
            createdAt: new Date('2024-01-18T13:10:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'eng_004',
            rating: 5,
            createdAt: new Date('2024-01-19T10:25:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'solar_001',
            rating: 4,
            createdAt: new Date('2024-01-20T15:50:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'solar_002',
            rating: 5,
            createdAt: new Date('2024-01-21T09:35:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'solar_003',
            rating: 3,
            createdAt: new Date('2024-01-22T14:15:00Z').toISOString(),
        },
        {
            projectId: 2,
            userId: 'solar_004',
            rating: 5,
            createdAt: new Date('2024-01-23T11:00:00Z').toISOString(),
        },

        // Project 3 (Home Automation) - 15 ratings, avg ~4.5
        {
            projectId: 3,
            userId: 'user_001',
            rating: 5,
            createdAt: new Date('2024-01-10T08:00:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'user_002',
            rating: 4,
            createdAt: new Date('2024-01-11T10:30:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'user_004',
            rating: 5,
            createdAt: new Date('2024-01-12T13:45:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'user_005',
            rating: 5,
            createdAt: new Date('2024-01-13T09:20:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'iot_001',
            rating: 4,
            createdAt: new Date('2024-01-14T15:10:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'iot_002',
            rating: 5,
            createdAt: new Date('2024-01-15T11:30:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'iot_003',
            rating: 5,
            createdAt: new Date('2024-01-16T14:00:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'iot_004',
            rating: 3,
            createdAt: new Date('2024-01-17T10:15:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'maker_001',
            rating: 4,
            createdAt: new Date('2024-01-18T16:25:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'maker_002',
            rating: 5,
            createdAt: new Date('2024-01-19T09:40:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'maker_003',
            rating: 5,
            createdAt: new Date('2024-01-20T12:50:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'maker_004',
            rating: 4,
            createdAt: new Date('2024-01-21T14:30:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'tech_001',
            rating: 5,
            createdAt: new Date('2024-01-22T11:20:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'tech_002',
            rating: 4,
            createdAt: new Date('2024-01-23T15:00:00Z').toISOString(),
        },
        {
            projectId: 3,
            userId: 'tech_003',
            rating: 5,
            createdAt: new Date('2024-01-24T10:45:00Z').toISOString(),
        },
    ];

    await db.insert(projectRatingsNew).values(sampleRatings);
    
    console.log('✅ Project ratings seeder completed successfully - 35 ratings created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});