'use client';

import { Award, Star, Calculator, Zap, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface BadgeCardProps {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  earnedAt?: string;
  isLocked?: boolean;
}

const badgeIcons: Record<string, any> = {
  first_quiz: Star,
  perfect_score: Award,
  helper: CheckCircle,
  calculator_master: Calculator,
  week_warrior: Calendar,
  quiz_legend: Zap,
  helper_pro: Award,
};

const badgeColors: Record<string, string> = {
  first_quiz: 'gradient-violet',
  perfect_score: 'gradient-fire',
  helper: 'gradient-aqua',
  calculator_master: 'gradient-fire',
  week_warrior: 'gradient-aqua',
  quiz_legend: 'gradient-fire',
  helper_pro: 'gradient-violet',
};

export function BadgeCard({ badgeId, badgeName, badgeDescription, earnedAt, isLocked = false }: BadgeCardProps) {
  const Icon = badgeIcons[badgeId] || Award;
  const colorClass = badgeColors[badgeId] || 'gradient-violet';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`glass-surface border-white/10 hover:border-[#9C4AFF]/50 transition-all ${isLocked ? 'opacity-50' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`p-4 rounded-full ${colorClass} ${isLocked ? 'grayscale' : ''}`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">{badgeName}</h3>
              <p className="text-sm text-[#B8A7E0]">{badgeDescription}</p>
            </div>
            {earnedAt && !isLocked && (
              <Badge className="gradient-violet text-white text-xs mt-2">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </Badge>
            )}
            {isLocked && (
              <Badge className="bg-white/10 text-[#B8A7E0] text-xs mt-2">
                🔒 Locked
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
