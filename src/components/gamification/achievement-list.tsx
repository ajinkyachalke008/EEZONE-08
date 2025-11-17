'use client';

import { BadgeCard } from './badge-card';
import { motion } from 'framer-motion';

interface Badge {
  id: number;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  earnedAt: string;
}

interface AchievementListProps {
  badges: Badge[];
  showLocked?: boolean;
}

const allPossibleBadges = [
  {
    badgeId: 'first_quiz',
    badgeName: 'First Quiz',
    badgeDescription: 'Complete your first quiz',
  },
  {
    badgeId: 'perfect_score',
    badgeName: 'Perfect Score',
    badgeDescription: 'Get 100% on any quiz',
  },
  {
    badgeId: 'helper',
    badgeName: 'Helper',
    badgeDescription: 'Answer 10 questions',
  },
  {
    badgeId: 'calculator_master',
    badgeName: 'Calculator Master',
    badgeDescription: 'Use 20 different calculators',
  },
  {
    badgeId: 'week_warrior',
    badgeName: 'Week Warrior',
    badgeDescription: '7-day login streak',
  },
];

export function AchievementList({ badges, showLocked = false }: AchievementListProps) {
  const earnedBadgeIds = badges.map((b) => b.badgeId);
  
  const displayBadges = showLocked
    ? allPossibleBadges.map((possibleBadge) => {
        const earnedBadge = badges.find((b) => b.badgeId === possibleBadge.badgeId);
        return earnedBadge || { ...possibleBadge, id: 0, earnedAt: '', isLocked: true };
      })
    : badges;

  if (displayBadges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#B8A7E0] text-lg">No badges earned yet. Start completing activities to earn your first badge! 🏆</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayBadges.map((badge, index) => (
        <motion.div
          key={badge.badgeId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <BadgeCard
            badgeId={badge.badgeId}
            badgeName={badge.badgeName}
            badgeDescription={badge.badgeDescription}
            earnedAt={badge.earnedAt}
            isLocked={!!(badge as any).isLocked}
          />
        </motion.div>
      ))}
    </div>
  );
}
