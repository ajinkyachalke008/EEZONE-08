'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, GraduationCap, Target, TrendingUp, Clock, 
  CheckCircle2, Zap, Battery, RotateCw, Activity, 
  Cpu, Gauge, Cable, CircuitBoard, Plug, FileCheck,
  ChevronRight, Star, Loader2, Play, Brain
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Topic {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
}

interface UserProgress {
  topicId: number;
  completionPercent: number;
  lastVisitedAt: string;
  topic: {
    slug: string;
    title: string;
    icon: string;
  };
}

const iconMap: { [key: string]: any } = {
  Battery, RotateCw, Zap, Cable, CircuitBoard, Activity, Cpu, Plug, Gauge, FileCheck
};

// Generate anonymous user ID for demo
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

export default function LearnPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    fetchData(id);
  }, []);

  const fetchData = async (uid: string) => {
    try {
      const [topicsRes, progressRes] = await Promise.all([
        fetch('/api/learn/topics'),
        fetch(`/api/learn/progress/${uid}`)
      ]);
      
      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTopics(topicsData);
      }
      
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch {
      // Silent fail - learning data will show empty state
    } finally {
      setLoading(false);
    }
  };

  const getTopicProgress = (topicId: number) => {
    const p = progress.find(pr => pr.topicId === topicId);
    return p?.completionPercent || 0;
  };

  const getTopicIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || BookOpen;
    return IconComponent;
  };

  const heroTopics = ['dc-machines', 'transformers', 'op-amps-analog'];
  const filteredHeroTopics = topics.filter(t => heroTopics.includes(t.slug));
  const otherTopics = topics.filter(t => !heroTopics.includes(t.slug));

  if (loading) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C4AFF] mx-auto mb-4" />
          <p className="text-[#B8A7E0]">Loading learning modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-depth">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="h-12 w-12 text-[#9C4AFF] glow-text-violet" />
              <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                EE Learning Hub
              </h1>
            </div>
            <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
              Master Electrical Engineering concepts with structured learning modules, practice quizzes, and track your progress
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: BookOpen, label: 'Learning Topics', value: topics.length, color: '#9C4AFF' },
              { icon: Brain, label: 'Practice MCQs', value: '30+', color: '#FF6B00' },
              { icon: Target, label: 'Sections per Topic', value: '7', color: '#00E5FF' },
              { icon: TrendingUp, label: 'Your Progress', value: `${progress.length} Started`, color: '#9C4AFF' },
            ].map((stat, index) => (
              <Card key={index} className="glass-surface border-white/10 text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-2" style={{ color: stat.color }} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-[#B8A7E0]">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero Topics - Featured */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Star className="h-8 w-8 text-[#FF6B00]" />
              Featured Learning Modules
            </h2>
            <p className="text-[#B8A7E0]">Deep-dive into these essential EE topics with complete 7-section structured content</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHeroTopics.map((topic, index) => {
              const Icon = getTopicIcon(topic.icon);
              const progressPercent = getTopicProgress(topic.id);
              
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Link href={`/learn/${topic.slug}`}>
                    <Card className="h-full glass-surface border-2 border-[#FF6B00]/30 hover:border-[#FF6B00]/60 hover:shadow-glowOrange transition-all cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-3 gradient-fire rounded-xl">
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
                            Featured
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-xl">{topic.title}</CardTitle>
                        <CardDescription className="text-[#B8A7E0] line-clamp-2">
                          {topic.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-[#B8A7E0]">
                            <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
                            <span>7 Learning Sections</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#B8A7E0]">
                            <Brain className="h-4 w-4 text-[#9C4AFF]" />
                            <span>10 Practice MCQs</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#B8A7E0]">
                            <Clock className="h-4 w-4 text-[#FF6B00]" />
                            <span>~45 min to complete</span>
                          </div>
                          {progressPercent > 0 && (
                            <div className="pt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#B8A7E0]">Your Progress</span>
                                <span className="text-[#00E5FF]">{progressPercent}%</span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full gradient-fire hover:shadow-glowOrange text-white">
                          {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Topics Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-[#9C4AFF]" />
              All Learning Topics
            </h2>
            <p className="text-[#B8A7E0]">Explore all electrical engineering topics available for learning</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTopics.map((topic, index) => {
              const Icon = getTopicIcon(topic.icon);
              const progressPercent = getTopicProgress(topic.id);
              
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                >
                  <Link href={`/learn/${topic.slug}`}>
                    <Card className="h-full glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 gradient-violet rounded-lg">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-white text-lg">{topic.title}</CardTitle>
                        </div>
                        <CardDescription className="text-[#B8A7E0] line-clamp-2 text-sm">
                          {topic.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {progressPercent > 0 ? (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[#B8A7E0]">Progress</span>
                              <span className="text-[#00E5FF]">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-1.5" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-[#B8A7E0]">
                            <Play className="h-4 w-4" />
                            <span>Not started yet</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="glass-surface border border-white/10 rounded-2xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/learn/quiz">
                <Card className="glass-surface border-[#00E5FF]/30 hover:border-[#00E5FF]/60 hover:shadow-glowCyan transition-all cursor-pointer h-full">
                  <CardContent className="pt-6 text-center">
                    <Brain className="h-12 w-12 text-[#00E5FF] mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Quick Quiz</h3>
                    <p className="text-[#B8A7E0] text-sm">Test your knowledge with random questions across all topics</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/learn/analytics">
                <Card className="glass-surface border-[#9C4AFF]/30 hover:border-[#9C4AFF]/60 hover:shadow-glowViolet transition-all cursor-pointer h-full">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-12 w-12 text-[#9C4AFF] mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">My Analytics</h3>
                    <p className="text-[#B8A7E0] text-sm">View your learning progress, strengths and weak areas</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/learn/bookmarks">
                <Card className="glass-surface border-[#FF6B00]/30 hover:border-[#FF6B00]/60 hover:shadow-glowOrange transition-all cursor-pointer h-full">
                  <CardContent className="pt-6 text-center">
                    <Star className="h-12 w-12 text-[#FF6B00] mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Bookmarks</h3>
                    <p className="text-[#B8A7E0] text-sm">Access your saved topics and continue where you left off</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}