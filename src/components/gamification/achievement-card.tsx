'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
  locked?: boolean;
  progress?: { current: number; required: number };
}

export function AchievementCard({
  name,
  description,
  icon,
  category,
  earnedAt,
  locked = false,
  progress
}: AchievementCardProps) {
  const categoryColors: Record<string, string> = {
    quiz: '#9C4AFF',
    calculator: '#00E5FF',
    helper: '#FF6B00',
    streak: '#FF00C8',
  };

  const color = categoryColors[category] || '#9C4AFF';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`glass-surface transition-all ${
          locked 
            ? 'border-white/10 opacity-60' 
            : 'border-[#9C4AFF]/30 hover:border-[#9C4AFF]/60 hover:shadow-glowViolet'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                locked ? 'grayscale' : ''
              }`}
              style={{ 
                background: locked 
                  ? 'rgba(255,255,255,0.1)' 
                  : `linear-gradient(135deg, ${color}33, ${color}66)`,
                boxShadow: locked ? 'none' : `0 0 15px ${color}66`
              }}
            >
              {locked ? '🔒' : icon}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h4 className={`font-semibold ${locked ? 'text-[#B8A7E0]' : 'text-white'}`}>
                  {name}
                </h4>
                <Badge 
                  className="text-xs"
                  style={{ 
                    background: `${color}33`,
                    color: color,
                    border: `1px solid ${color}66`
                  }}
                >
                  {category}
                </Badge>
              </div>
              <p className="text-sm text-[#B8A7E0] mb-2">{description}</p>
              
              {earnedAt && (
                <p className="text-xs text-[#00E5FF]">
                  Earned {formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
                </p>
              )}

              {locked && progress && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-[#B8A7E0] mb-1">
                    <span>Progress</span>
                    <span>{progress.current} / {progress.required}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((progress.current / progress.required) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
