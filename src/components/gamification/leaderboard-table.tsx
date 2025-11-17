'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  level: string;
  rank?: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-[#FF6B00]" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-[#B8A7E0]" />;
    if (rank === 3) return <Award className="h-5 w-5 text-[#FF6B00]" />;
    return <span className="text-[#B8A7E0] font-bold">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'gradient-fire';
    if (rank === 2) return 'bg-gradient-to-r from-[#B8A7E0] to-[#9C4AFF]';
    if (rank === 3) return 'gradient-fire';
    return 'glass-surface';
  };

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

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const rank = entry.rank || index + 1;
        const isCurrentUser = entry.userId === currentUserId;

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className={`${
                rank <= 3 ? getRankColor(rank) : 'glass-surface'
              } border-white/10 hover:border-[#9C4AFF]/50 transition-all ${
                isCurrentUser ? 'ring-2 ring-[#9C4AFF]' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(rank)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          {entry.userId}
                        </p>
                        {isCurrentUser && (
                          <Badge className="bg-[#9C4AFF] text-white text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm font-medium ${getLevelColor(entry.level)}`}>
                        {entry.level}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {entry.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#B8A7E0]">points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
