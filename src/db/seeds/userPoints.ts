import { db } from '@/db';
import { userPoints } from '@/db/schema';

async function main() {
    const sampleUserPoints = [
        {
            userId: 'user_001',
            totalPoints: 6000,
            level: 'Expert',
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2025-01-08').toISOString(),
        },
        {
            userId: 'user_002',
            totalPoints: 1500,
            level: 'Expert',
            createdAt: new Date('2024-11-01').toISOString(),
            updatedAt: new Date('2025-01-09').toISOString(),
        },
        {
            userId: 'user_003',
            totalPoints: 750,
            level: 'Advanced',
            createdAt: new Date('2024-11-15').toISOString(),
            updatedAt: new Date('2025-01-10').toISOString(),
        },
        {
            userId: 'user_004',
            totalPoints: 350,
            level: 'Intermediate',
            createdAt: new Date('2024-12-01').toISOString(),
            updatedAt: new Date('2025-01-11').toISOString(),
        },
        {
            userId: 'user_005',
            totalPoints: 100,
            level: 'Intermediate',
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2025-01-12').toISOString(),
        }
    ];

    await db.insert(userPoints).values(sampleUserPoints);
    
    console.log('✅ User points seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});