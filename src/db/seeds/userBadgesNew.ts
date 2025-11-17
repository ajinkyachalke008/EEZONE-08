import { db } from '@/db';
import { userBadgesNew } from '@/db/schema';

async function main() {
    const sampleBadges = [
        // user_001 badges (Expert level, 6000 points) - 4 badges
        {
            userId: 'user_001',
            badgeId: 'calculator_master',
            badgeName: 'Calculator Master',
            badgeDescription: 'Used 50+ calculators',
            earnedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_001',
            badgeId: 'quiz_legend',
            badgeName: 'Quiz Legend',
            badgeDescription: 'Completed 100+ quizzes',
            earnedAt: new Date('2024-02-20').toISOString(),
        },
        {
            userId: 'user_001',
            badgeId: 'helper_pro',
            badgeName: 'Helper Pro',
            badgeDescription: 'Had 50+ answers accepted',
            earnedAt: new Date('2024-03-10').toISOString(),
        },
        {
            userId: 'user_001',
            badgeId: 'week_warrior',
            badgeName: 'Week Warrior',
            badgeDescription: 'Maintained a 7-day login streak',
            earnedAt: new Date('2024-03-25').toISOString(),
        },
        // user_002 badges (Expert level, 1500 points) - 3 badges
        {
            userId: 'user_002',
            badgeId: 'first_quiz',
            badgeName: 'First Quiz',
            badgeDescription: 'Completed your first quiz',
            earnedAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: 'user_002',
            badgeId: 'perfect_score',
            badgeName: 'Perfect Score',
            badgeDescription: 'Achieved a perfect score on a quiz',
            earnedAt: new Date('2024-02-15').toISOString(),
        },
        {
            userId: 'user_002',
            badgeId: 'week_warrior',
            badgeName: 'Week Warrior',
            badgeDescription: 'Maintained a 7-day login streak',
            earnedAt: new Date('2024-03-05').toISOString(),
        },
        // user_003 badges (Advanced level, 750 points) - 2 badges
        {
            userId: 'user_003',
            badgeId: 'first_quiz',
            badgeName: 'First Quiz',
            badgeDescription: 'Completed your first quiz',
            earnedAt: new Date('2024-02-10').toISOString(),
        },
        {
            userId: 'user_003',
            badgeId: 'helper',
            badgeName: 'Helper',
            badgeDescription: 'Had 10 answers accepted by community',
            earnedAt: new Date('2024-03-15').toISOString(),
        },
        // user_004 badges (Intermediate level, 350 points) - 1 badge
        {
            userId: 'user_004',
            badgeId: 'first_quiz',
            badgeName: 'First Quiz',
            badgeDescription: 'Completed your first quiz',
            earnedAt: new Date('2024-03-01').toISOString(),
        },
    ];

    await db.insert(userBadgesNew).values(sampleBadges);
    
    console.log('✅ User badges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});