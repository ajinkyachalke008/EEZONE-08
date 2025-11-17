import { db } from '@/db';
import { dailyLoginStreaks } from '@/db/schema';

async function main() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const sampleStreaks = [
        {
            userId: 'user_001',
            currentStreak: 21,
            longestStreak: 45,
            lastLoginDate: formatDate(today),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_002',
            currentStreak: 14,
            longestStreak: 30,
            lastLoginDate: formatDate(today),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_003',
            currentStreak: 7,
            longestStreak: 15,
            lastLoginDate: formatDate(yesterday),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_004',
            currentStreak: 3,
            longestStreak: 8,
            lastLoginDate: formatDate(today),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_005',
            currentStreak: 1,
            longestStreak: 5,
            lastLoginDate: formatDate(today),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(dailyLoginStreaks).values(sampleStreaks);
    
    console.log('✅ Daily login streaks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});