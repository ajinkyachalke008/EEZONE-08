'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, Target, Brain, Clock, Award, ChevronLeft,
  AlertTriangle, CheckCircle2, Loader2, BarChart3, PieChart,
  Zap, BookOpen, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Analytics {
  overallStats: {
    totalQuizzes: number;
    totalQuestions: number;
    correctAnswers: number;
    overallAccuracy: number;
    averageScore: number;
  };
  performanceByDifficulty: {
    easy: { total: number; correct: number; accuracy: number };
    medium: { total: number; correct: number; accuracy: number };
    hard: { total: number; correct: number; accuracy: number };
  };
  performanceByTopic: Array<{
    topicId: number;
    topicTitle: string;
    topicSlug: string;
    topicIcon: string;
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number;
  }>;
  weakAreas: Array<{ type: string; name: string; accuracy: number }>;
  strongAreas: Array<{ type: string; name: string; accuracy: number }>;
  recentActivity: Array<{
    attemptId: number;
    topicTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    finishedAt: string;
  }>;
  progressSummary: Array<{
    topicId: number;
    topicTitle: string;
    topicSlug: string;
    completionPercent: number;
    lastVisitedAt: string;
  }>;
}

const getUserId = () => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('ee_zone_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('ee_zone_user_id', userId);
    }
    return userId;
  }
  return 'anonymous';
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();
    fetchAnalytics(userId);
  }, []);

  const fetchAnalytics = async (userId: string) => {
    try {
      const res = await fetch(`/api/learn/analytics/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C4AFF] mx-auto mb-4" />
          <p className="text-[#B8A7E0]">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <Card className="glass-surface border-white/10 max-w-md text-center">
          <CardContent className="pt-6">
            <BarChart3 className="h-16 w-16 text-[#9C4AFF] mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
            <p className="text-[#B8A7E0] mb-4">
              Take some quizzes to see your performance analytics!
            </p>
            <Link href="/learn/quiz">
              <Button className="gradient-violet hover:shadow-glowViolet">
                <Brain className="h-4 w-4 mr-2" />
                Start a Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasQuizData = analytics.overallStats.totalQuizzes > 0;

  return (
    <div className="min-h-screen gradient-depth">
      {/* Header */}
      <section className="relative py-6 px-4 border-b border-white/10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#9C4AFF] opacity-15 blur-[150px] rounded-full" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="text-[#B8A7E0] hover:text-white">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Learn
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-violet rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Learning Analytics</h1>
              <p className="text-[#B8A7E0] text-sm">Track your progress and identify areas for improvement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#00E5FF]" />
              Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-surface border-white/10">
                <CardContent className="pt-6 text-center">
                  <Brain className="h-8 w-8 text-[#9C4AFF] mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{analytics.overallStats.totalQuizzes}</p>
                  <p className="text-sm text-[#B8A7E0]">Quizzes Taken</p>
                </CardContent>
              </Card>
              <Card className="glass-surface border-white/10">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-[#00E5FF] mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{analytics.overallStats.totalQuestions}</p>
                  <p className="text-sm text-[#B8A7E0]">Questions Attempted</p>
                </CardContent>
              </Card>
              <Card className="glass-surface border-white/10">
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 text-[#FF6B00] mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{analytics.overallStats.overallAccuracy.toFixed(1)}%</p>
                  <p className="text-sm text-[#B8A7E0]">Overall Accuracy</p>
                </CardContent>
              </Card>
              <Card className="glass-surface border-white/10">
                <CardContent className="pt-6 text-center">
                  <Award className="h-8 w-8 text-[#00E5FF] mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{analytics.overallStats.averageScore.toFixed(1)}</p>
                  <p className="text-sm text-[#B8A7E0]">Avg Score per Quiz</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Performance by Difficulty */}
          {hasQuizData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#FF6B00]" />
                Performance by Difficulty
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                  const data = analytics.performanceByDifficulty[difficulty];
                  const color = difficulty === 'easy' ? '#00E5FF' : difficulty === 'medium' ? '#FF6B00' : '#9C4AFF';
                  
                  return (
                    <Card key={difficulty} className="glass-surface border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white capitalize flex items-center justify-between">
                          {difficulty}
                          <Badge style={{ backgroundColor: `${color}20`, color: color }}>
                            {data.total} questions
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#B8A7E0]">Accuracy</span>
                            <span style={{ color }}>{data.accuracy.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={data.accuracy} 
                            className="h-2"
                            style={{ 
                              ['--progress-color' as any]: color 
                            }}
                          />
                          <p className="text-xs text-[#B8A7E0]">
                            {data.correct} correct out of {data.total}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Weak and Strong Areas */}
          {hasQuizData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Weak Areas */}
              <Card className="glass-surface border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Weak Areas (Needs Practice)
                  </CardTitle>
                  <CardDescription className="text-[#B8A7E0]">
                    Topics with less than 60% accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.weakAreas.length === 0 ? (
                    <p className="text-[#B8A7E0] text-sm">No weak areas identified yet. Great job!</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.weakAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 glass-surface rounded-lg">
                          <div className="flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                            <span className="text-white text-sm">{area.name}</span>
                            <Badge className="bg-white/10 text-[#B8A7E0] text-xs">{area.type}</Badge>
                          </div>
                          <span className="text-red-400 font-medium">{area.accuracy.toFixed(1)}%</span>
                        </div>
                      ))}
                      <Link href="/learn/quiz">
                        <Button className="w-full mt-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                          <Brain className="h-4 w-4 mr-2" />
                          Practice Weak Areas
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Strong Areas */}
              <Card className="glass-surface border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Strong Areas
                  </CardTitle>
                  <CardDescription className="text-[#B8A7E0]">
                    Topics with 80% or higher accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.strongAreas.length === 0 ? (
                    <p className="text-[#B8A7E0] text-sm">Keep practicing to identify your strong areas!</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.strongAreas.map((area, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 glass-surface rounded-lg">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                            <span className="text-white text-sm">{area.name}</span>
                            <Badge className="bg-white/10 text-[#B8A7E0] text-xs">{area.type}</Badge>
                          </div>
                          <span className="text-green-400 font-medium">{area.accuracy.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Topic Performance */}
          {analytics.performanceByTopic.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#9C4AFF]" />
                Performance by Topic
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.performanceByTopic.map((topic) => (
                  <Card key={topic.topicId} className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium text-sm line-clamp-1">{topic.topicTitle}</h3>
                        <Badge className={`${
                          topic.accuracy >= 80 ? 'bg-green-500/20 text-green-400' :
                          topic.accuracy >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {topic.accuracy.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={topic.accuracy} className="h-2 mb-2" />
                      <p className="text-xs text-[#B8A7E0]">
                        {topic.correctAnswers}/{topic.questionsAttempted} correct
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          {analytics.recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#00E5FF]" />
                Recent Quiz Attempts
              </h2>
              <Card className="glass-surface border-white/10">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 glass-surface rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            activity.percentage >= 80 ? 'bg-green-500/20' :
                            activity.percentage >= 50 ? 'bg-yellow-500/20' :
                            'bg-red-500/20'
                          }`}>
                            <Brain className={`h-5 w-5 ${
                              activity.percentage >= 80 ? 'text-green-400' :
                              activity.percentage >= 50 ? 'text-yellow-400' :
                              'text-red-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{activity.topicTitle}</p>
                            <p className="text-[#B8A7E0] text-xs">{formatDate(activity.finishedAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{activity.score}/{activity.totalQuestions}</p>
                          <p className={`text-sm ${
                            activity.percentage >= 80 ? 'text-green-400' :
                            activity.percentage >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {activity.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Learning Progress */}
          {analytics.progressSummary.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                Topics in Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.progressSummary.map((topic) => (
                  <Link key={topic.topicId} href={`/learn/${topic.topicSlug}`}>
                    <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 transition-all cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-medium">{topic.topicTitle}</h3>
                          <span className="text-[#FF6B00] font-bold">{topic.completionPercent}%</span>
                        </div>
                        <Progress value={topic.completionPercent} className="h-2 mb-2" />
                        <p className="text-xs text-[#B8A7E0]">
                          Last visited: {formatDate(topic.lastVisitedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State CTA */}
          {!hasQuizData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-12"
            >
              <Brain className="h-20 w-20 text-[#9C4AFF] mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2">Start Your Learning Journey</h3>
              <p className="text-[#B8A7E0] mb-6 max-w-md mx-auto">
                Take quizzes and study topics to see your detailed performance analytics here.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/learn/quiz">
                  <Button className="gradient-violet hover:shadow-glowViolet">
                    <Brain className="h-4 w-4 mr-2" />
                    Take a Quiz
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button variant="outline" className="border-white/20 text-[#B8A7E0] hover:text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Topics
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
