import { db } from '@/db';
import { badges } from '@/db/schema';

async function main() {
    const sampleBadges = [
        {
            badgeId: 'first_quiz',
            name: 'First Quiz',
            description: 'Completed your first quiz',
            icon: '🎯',
            category: 'quiz',
            requirementType: 'quiz_count',
            requirementValue: 1,
            createdAt: new Date().toISOString(),
        },
        {
            badgeId: 'perfect_score',
            name: 'Perfect Score',
            description: 'Achieved a perfect score on a quiz',
            icon: '💯',
            category: 'quiz',
            requirementType: 'perfect_quiz',
            requirementValue: 1,
            createdAt: new Date().toISOString(),
        },
        {
            badgeId: 'helper',
            name: 'Helper',
            description: 'Had 10 answers accepted by others',
            icon: '🤝',
            category: 'helper',
            requirementType: 'answers_accepted',
            requirementValue: 10,
            createdAt: new Date().toISOString(),
        },
        {
            badgeId: 'calculator_master',
            name: 'Calculator Master',
            description: 'Used calculators 20 times',
            icon: '🧮',
            category: 'calculator',
            requirementType: 'calculator_count',
            requirementValue: 20,
            createdAt: new Date().toISOString(),
        },
        {
            badgeId: 'week_warrior',
            name: 'Week Warrior',
            description: 'Maintained a 7-day login streak',
            icon: '🔥',
            category: 'streak',
            requirementType: 'streak_days',
            requirementValue: 7,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(badges).values(sampleBadges);
    
    console.log('✅ Badges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});