'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface LevelProgressProps {
  totalPoints: number;
  level: string;
}

const levelThresholds = {
  Beginner: { min: 0, max: 500 },
  Intermediate: { min: 501, max: 2000 },
  Advanced: { min: 2001, max: 5000 },
  Expert: { min: 5000, max: Infinity },
};

export function LevelProgress({ totalPoints, level }: LevelProgressProps) {
  const currentThreshold = levelThresholds[level as keyof typeof levelThresholds];
  
  let progress = 0;
  let pointsToNext = 0;
  let nextLevel = '';

  if (level === 'Beginner') {
    progress = (totalPoints / 500) * 100;
    pointsToNext = 500 - totalPoints;
    nextLevel = 'Intermediate';
  } else if (level === 'Intermediate') {
    progress = ((totalPoints - 500) / 1500) * 100;
    pointsToNext = 2000 - totalPoints;
    nextLevel = 'Advanced';
  } else if (level === 'Advanced') {
    progress = ((totalPoints - 2000) / 3000) * 100;
    pointsToNext = 5000 - totalPoints;
    nextLevel = 'Expert';
  } else {
    progress = 100;
    pointsToNext = 0;
    nextLevel = 'Max Level';
  }

  progress = Math.min(Math.max(progress, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-surface border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#9C4AFF]" />
              <h3 className="font-semibold text-white">Level Progress</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#B8A7E0]">Current: <span className="text-white font-bold">{level}</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            
            <div className="flex justify-between text-sm">
              <span className="text-[#B8A7E0]">{totalPoints.toLocaleString()} pts</span>
              {level !== 'Expert' && (
                <span className="text-[#B8A7E0]">{currentThreshold.max} pts</span>
              )}
            </div>

            {level !== 'Expert' && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-[#B8A7E0]">
                  <span className="text-[#9C4AFF] font-semibold">{pointsToNext.toLocaleString()} points</span> until <span className="text-white font-semibold">{nextLevel}</span>
                </p>
              </div>
            )}

            {level === 'Expert' && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-[#FF00C8] font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  You've reached the maximum level! 🎉
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
