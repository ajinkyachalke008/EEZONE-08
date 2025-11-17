'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/header';
import { PointsDisplay } from '@/components/gamification/points-display';
import { LevelBadge } from '@/components/gamification/level-badge';
import { AchievementCard } from '@/components/gamification/achievement-card';
import { Leaderboard } from '@/components/gamification/leaderboard';

export default function GamificationPage() {
  const [userStats, setUserStats] = useState<any>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = 'demo_user'; // In production, get from auth

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      // Fetch user stats
      const statsResponse = await fetch(`/api/gamification/user-stats?userId=${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
      } else {
        // Create initial stats if not found
        await createInitialStats();
      }

      // Fetch all badges
      const badgesResponse = await fetch('/api/gamification/badges');
      const badgesData = await badgesResponse.json();
      setAllBadges(badgesData);

      // Fetch earned badges
      const earnedResponse = await fetch(`/api/gamification/user-badges?userId=${userId}`);
      const earnedData = await earnedResponse.json();
      setEarnedBadges(earnedData);

      // Fetch achievements
      const achievementsResponse = await fetch(`/api/gamification/achievements?userId=${userId}`);
      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData);

      // Fetch leaderboard
      const leaderboardResponse = await fetch('/api/gamification/leaderboard?period=all_time');
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialStats = async () => {
    try {
      const response = await fetch('/api/gamification/user-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to create initial stats:', error);
    }
  };

  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badge.badgeId));

  if (loading) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9C4AFF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-depth">
      <Header 
        onSearch={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🏆 Your Gamification Dashboard
            </h1>
            <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
              Track your progress, earn badges, and compete on the leaderboard
            </p>
          </motion.div>

          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PointsDisplay 
                totalPoints={userStats.totalPoints}
                recentPoints={0}
                showAnimation={false}
              />
              <LevelBadge 
                level={userStats.level}
                totalPoints={userStats.totalPoints}
                currentStreak={userStats.currentStreak}
              />
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Trophy, label: 'Badges Earned', value: earnedBadges.length, color: '#FFD700' },
              { icon: Zap, label: 'Quizzes Done', value: userStats?.quizzesCompleted || 0, color: '#9C4AFF' },
              { icon: Target, label: 'Calculators Used', value: userStats?.calculatorsUsed || 0, color: '#00E5FF' },
              { icon: TrendingUp, label: 'Longest Streak', value: `${userStats?.longestStreak || 0} days`, color: '#FF6B00' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="glass-surface border-white/10 text-center">
                  <CardContent className="p-4">
                    <stat.icon className="h-8 w-8 mx-auto mb-2" style={{ color: stat.color }} />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-[#B8A7E0]">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-surface mb-8">
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <Card className="glass-surface border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    Badge Collection ({earnedBadges.length} / {allBadges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allBadges.map((badge) => {
                      const earned = earnedBadges.find(eb => eb.badge.badgeId === badge.badgeId);
                      const progress = userStats ? {
                        current: badge.requirementType === 'quiz_count' ? userStats.quizzesCompleted :
                                badge.requirementType === 'calculator_count' ? userStats.calculatorsUsed :
                                badge.requirementType === 'answers_accepted' ? userStats.answersAccepted :
                                badge.requirementType === 'streak_days' ? userStats.longestStreak : 0,
                        required: badge.requirementValue
                      } : undefined;

                      return (
                        <AchievementCard
                          key={badge.badgeId}
                          name={badge.name}
                          description={badge.description}
                          icon={badge.icon}
                          category={badge.category}
                          earnedAt={earned?.earnedAt}
                          locked={!earned}
                          progress={!earned ? progress : undefined}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card className="glass-surface border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="space-y-3">
                      {achievements.slice(0, 10).map((achievement) => (
                        <div 
                          key={achievement.id}
                          className="p-4 glass-surface border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold">{achievement.achievementType}</p>
                              <p className="text-sm text-[#B8A7E0]">
                                {new Date(achievement.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-[#FF6B00]">+{achievement.pointsAwarded}</p>
                              <p className="text-xs text-[#B8A7E0]">points</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-[#B8A7E0] py-8">
                      No achievements yet. Start completing tasks to earn points!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <Leaderboard 
                entries={leaderboard}
                currentUserId={userId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
