'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: string;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-[#FFD700]" />;
      case 2:
        return <Medal className="h-5 w-5 text-[#C0C0C0]" />;
      case 3:
        return <Award className="h-5 w-5 text-[#CD7F32]" />;
      default:
        return <span className="text-[#B8A7E0] font-semibold">#{rank}</span>;
    }
  };

  const getRankGlow = (rank: number) => {
    switch (rank) {
      case 1:
        return '0 0 20px rgba(255, 215, 0, 0.5)';
      case 2:
        return '0 0 20px rgba(192, 192, 192, 0.5)';
      case 3:
        return '0 0 20px rgba(205, 127, 50, 0.5)';
      default:
        return 'none';
    }
  };

  return (
    <Card className="glass-surface border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white glow-text-violet flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#FFD700]" />
            Leaderboard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all_time" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-surface">
            <TabsTrigger value="daily" onClick={() => setPeriod('daily')}>Daily</TabsTrigger>
            <TabsTrigger value="weekly" onClick={() => setPeriod('weekly')}>Weekly</TabsTrigger>
            <TabsTrigger value="monthly" onClick={() => setPeriod('monthly')}>Monthly</TabsTrigger>
            <TabsTrigger value="all_time" onClick={() => setPeriod('all_time')}>All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-6">
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const isCurrentUser = entry.userId === currentUserId;
                const isTopThree = entry.rank <= 3;

                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      className={`transition-all ${
                        isCurrentUser
                          ? 'glass-surface border-[#00E5FF] shadow-glowCyan'
                          : 'glass-surface border-white/10 hover:border-[#9C4AFF]/50'
                      }`}
                      style={{ boxShadow: isTopThree ? getRankGlow(entry.rank) : undefined }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 flex items-center justify-center">
                              {getRankIcon(entry.rank)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold ${isCurrentUser ? 'text-[#00E5FF]' : 'text-white'}`}>
                                  {entry.username}
                                  {isCurrentUser && (
                                    <Badge className="ml-2 bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/50">
                                      You
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <p className="text-sm text-[#B8A7E0]">{entry.level}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
