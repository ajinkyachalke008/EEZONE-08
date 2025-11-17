'use client';

import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LevelBadgeProps {
  level: string;
  totalPoints: number;
  currentStreak: number;
}

const levelConfig = {
  Beginner: { min: 0, max: 500, color: '#00E5FF', icon: '🌱' },
  Intermediate: { min: 501, max: 2000, color: '#9C4AFF', icon: '⚡' },
  Advanced: { min: 2001, max: 5000, color: '#FF6B00', icon: '🔥' },
  Expert: { min: 5001, max: Infinity, color: '#FF00C8', icon: '👑' },
};

export function LevelBadge({ level, totalPoints, currentStreak }: LevelBadgeProps) {
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.Beginner;
  const progress = config.max === Infinity 
    ? 100 
    : ((totalPoints - config.min) / (config.max - config.min)) * 100;

  return (
    <Card className="glass-surface border-[#9C4AFF]/30 hover:border-[#9C4AFF]/60 transition-all hover:shadow-glowViolet">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${config.color}33, ${config.color}66)`,
                boxShadow: `0 0 20px ${config.color}66`
              }}
            >
              {config.icon}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-fire rounded-full p-1">
              <Award className="h-4 w-4 text-white" />
            </div>
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white glow-text-violet">
                {level}
              </h3>
              <div className="flex items-center gap-1 text-[#FF6B00]">
                <Star className="h-4 w-4 fill-[#FF6B00]" />
                <span className="text-sm font-semibold">{currentStreak} day streak</span>
              </div>
            </div>
            <p className="text-sm text-[#B8A7E0] mb-2">
              {totalPoints.toLocaleString()} / {config.max === Infinity ? '∞' : config.max.toLocaleString()} XP
            </p>
            <Progress 
              value={progress} 
              className="h-2"
              style={{ 
                background: 'rgba(255,255,255,0.1)'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
