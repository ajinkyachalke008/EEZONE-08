'use client';

import { Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PointsDisplayProps {
  totalPoints: number;
  level: string;
  compact?: boolean;
}

export function PointsDisplay({ totalPoints, level, compact = false }: PointsDisplayProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'text-[#FF00C8]';
      case 'Advanced':
        return 'text-[#FF6B00]';
      case 'Intermediate':
        return 'text-[#00E5FF]';
      default:
        return 'text-[#9C4AFF]';
    }
  };

  const getLevelGradient = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'gradient-fire';
      case 'Advanced':
        return 'gradient-fire';
      case 'Intermediate':
        return 'gradient-aqua';
      default:
        return 'gradient-violet';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getLevelGradient(level)}`}>
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-[#B8A7E0]">Points</p>
          <p className="text-lg font-bold text-white">{totalPoints.toLocaleString()}</p>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div>
          <p className="text-sm text-[#B8A7E0]">Level</p>
          <p className={`text-lg font-bold ${getLevelColor(level)}`}>{level}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${getLevelGradient(level)}`}>
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#B8A7E0]">Total Points</p>
                <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#B8A7E0] mb-1">Current Level</p>
              <p className={`text-xl font-bold ${getLevelColor(level)} flex items-center gap-2`}>
                <TrendingUp className="h-5 w-5" />
                {level}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
