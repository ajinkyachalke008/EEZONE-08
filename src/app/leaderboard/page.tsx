'use client';

import { useState, useEffect } from 'react';

import { LeaderboardTable } from '@/components/gamification/leaderboard-table';
import { PointsDisplay } from '@/components/gamification/points-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  level: string;
  rank?: number;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('all-time');
  const [category, setCategory] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<{ totalPoints: number; level: string; rank: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current user ID - in production, get from auth
  const currentUserId = 'user_002';

  useEffect(() => {
    fetchLeaderboard();
    fetchUserStats();
  }, [period, category]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // For now, using mock data - replace with actual API call
      // const response = await fetch(`/api/gamification/leaderboard?period=${period}&category=${category}`);
      // const data = await response.json();
      
      // Mock data
      const mockData: LeaderboardEntry[] = [
        { userId: 'user_001', totalPoints: 6000, level: 'Expert', rank: 1 },
        { userId: 'user_002', totalPoints: 1500, level: 'Expert', rank: 2 },
        { userId: 'user_003', totalPoints: 750, level: 'Advanced', rank: 3 },
        { userId: 'user_004', totalPoints: 350, level: 'Intermediate', rank: 4 },
        { userId: 'user_005', totalPoints: 100, level: 'Intermediate', rank: 5 },
      ];
      
      setLeaderboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Mock data - replace with actual API call
      // const response = await fetch(`/api/gamification/points?userId=${currentUserId}`);
      // const data = await response.json();
      
      const mockStats = {
        totalPoints: 1500,
        level: 'Expert',
        rank: 2,
      };
      
      setUserStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  return (
    <div className="min-h-screen gradient-depth">


      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-12 w-12 text-[#FF6B00] glow-text-orange" />
              <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Leaderboard
              </h1>
            </div>
            <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
              Compete with the community and climb to the top!
            </p>
          </motion.div>

          {/* User Stats Card */}
          {userStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="glass-surface border-2 border-[#9C4AFF]/50 shadow-glowViolet">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#9C4AFF]" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 glass-surface rounded-xl">
                      <TrendingUp className="h-8 w-8 text-[#9C4AFF] mx-auto mb-2" />
                      <p className="text-sm text-[#B8A7E0] mb-1">Current Rank</p>
                      <p className="text-3xl font-bold text-white">#{userStats.rank}</p>
                    </div>
                    <div className="text-center p-4 glass-surface rounded-xl">
                      <Zap className="h-8 w-8 text-[#FF6B00] mx-auto mb-2" />
                      <p className="text-sm text-[#B8A7E0] mb-1">Total Points</p>
                      <p className="text-3xl font-bold text-white">{userStats.totalPoints.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 glass-surface rounded-xl">
                      <Trophy className="h-8 w-8 text-[#00E5FF] mx-auto mb-2" />
                      <p className="text-sm text-[#B8A7E0] mb-1">Level</p>
                      <p className="text-3xl font-bold text-[#00E5FF]">{userStats.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="glass-surface border-white/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#B8A7E0] mb-2 block">Time Period</label>
                    <Tabs value={period} onValueChange={setPeriod} className="w-full">
                      <TabsList className="grid grid-cols-4 w-full glass-surface">
                        <TabsTrigger value="daily" className="text-xs md:text-sm">Daily</TabsTrigger>
                        <TabsTrigger value="weekly" className="text-xs md:text-sm">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly" className="text-xs md:text-sm">Monthly</TabsTrigger>
                        <TabsTrigger value="all-time" className="text-xs md:text-sm">All-Time</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div>
                    <label className="text-sm text-[#B8A7E0] mb-2 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="glass-surface border-white/20 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="glass-surface border-white/20">
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="quiz">Quiz Completions</SelectItem>
                        <SelectItem value="calculator">Calculator Usage</SelectItem>
                        <SelectItem value="community">Community Help</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="glass-surface border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#FF6B00]" />
                  Top Contributors
                </CardTitle>
                <CardDescription className="text-[#B8A7E0]">
                  {period === 'daily' && 'Rankings for today'}
                  {period === 'weekly' && 'Rankings for this week'}
                  {period === 'monthly' && 'Rankings for this month'}
                  {period === 'all-time' && 'All-time rankings'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4AFF] mx-auto mb-4"></div>
                    <p className="text-[#B8A7E0]">Loading leaderboard...</p>
                  </div>
                ) : (
                  <LeaderboardTable entries={leaderboardData} currentUserId={currentUserId} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8"
          >
            <Card className="glass-surface border-white/10">
              <CardHeader>
                <CardTitle className="text-white">How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 glass-surface rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Complete Quizzes</h4>
                    <p className="text-sm text-[#B8A7E0]">Earn 50-200 points based on your score</p>
                  </div>
                  <div className="p-4 glass-surface rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Ask Questions</h4>
                    <p className="text-sm text-[#B8A7E0]">Get 5 points for each question asked</p>
                  </div>
                  <div className="p-4 glass-surface rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Answer Accepted</h4>
                    <p className="text-sm text-[#B8A7E0]">Receive 20 points when your answer is accepted</p>
                  </div>
                  <div className="p-4 glass-surface rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Daily Login</h4>
                    <p className="text-sm text-[#B8A7E0]">Get 10 points just for logging in</p>
                  </div>
                  <div className="p-4 glass-surface rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Use Calculators</h4>
                    <p className="text-sm text-[#B8A7E0]">Earn points for using various tools</p>
                  </div>
                  <div className="p-4 glass-surface rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Build Projects</h4>
                    <p className="text-sm text-[#B8A7E0]">Share your projects to earn bonus points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
