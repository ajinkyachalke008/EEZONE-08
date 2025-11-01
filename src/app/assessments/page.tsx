'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Brain,
  Zap,
  FileText,
  BarChart3,
  Trophy,
  BookOpen,
  AlertCircle,
  Play,
  Timer,
  Award,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { QuizInterface } from '@/components/assessments/quiz-interface';

const quizTopics = [
  { id: 'circuits', name: 'Circuit Analysis', icon: Zap, color: 'violet' },
  { id: 'power', name: 'Power Systems', icon: Target, color: 'orange' },
  { id: 'motors', name: 'Motor Controls', icon: TrendingUp, color: 'cyan' },
  { id: 'nec', name: 'NEC Codes', icon: FileText, color: 'violet' },
  { id: 'protection', name: 'Protection Systems', icon: CheckCircle2, color: 'orange' },
  { id: 'digital', name: 'Digital Electronics', icon: Brain, color: 'cyan' },
];

const mockExams = [
  {
    id: 'fe-electrical',
    title: 'FE Electrical Exam',
    description: 'Full-length Fundamentals of Engineering practice test',
    duration: '6 hours',
    questions: 110,
    difficulty: 'Advanced',
    attempts: 1247,
    avgScore: 68,
    badge: 'Popular',
    icon: GraduationCap,
  },
  {
    id: 'pe-power',
    title: 'PE Power Exam',
    description: 'Professional Engineer Power Systems simulator',
    duration: '8 hours',
    questions: 80,
    difficulty: 'Expert',
    attempts: 856,
    avgScore: 62,
    badge: 'Pro',
    icon: Target,
  },
  {
    id: 'journeyman',
    title: 'Journeyman Electrician',
    description: 'State-level electrician certification practice',
    duration: '4 hours',
    questions: 80,
    difficulty: 'Intermediate',
    attempts: 2103,
    avgScore: 75,
    badge: 'New',
    icon: Award,
  },
  {
    id: 'master',
    title: 'Master Electrician',
    description: 'Advanced electrician certification test',
    duration: '5 hours',
    questions: 100,
    difficulty: 'Advanced',
    attempts: 934,
    avgScore: 71,
    badge: null,
    icon: Trophy,
  },
];

const skillProgress = [
  { category: 'Circuit Analysis', progress: 85, status: 'strong', color: 'violet' },
  { category: 'Power Systems', progress: 72, status: 'good', color: 'cyan' },
  { category: 'Motor Controls', progress: 45, status: 'weak', color: 'orange' },
  { category: 'NEC Codes', progress: 91, status: 'strong', color: 'violet' },
  { category: 'Protection Systems', progress: 58, status: 'average', color: 'cyan' },
  { category: 'Digital Electronics', progress: 38, status: 'weak', color: 'orange' },
];

const recentTests = [
  { name: 'Circuit Analysis Quiz', score: 88, date: '2 days ago', status: 'passed' },
  { name: 'NEC Code Practice', score: 92, date: '5 days ago', status: 'passed' },
  { name: 'Motor Controls Test', score: 62, date: '1 week ago', status: 'review' },
  { name: 'Power Systems Quiz', score: 75, date: '2 weeks ago', status: 'passed' },
];

export default function AssessmentsPage() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [quizMode, setQuizMode] = useState<'practice' | 'timed' | null>(null);
  const [startQuiz, setStartQuiz] = useState(false);

  const handleStartQuiz = () => {
    if (selectedTopic && selectedDifficulty && quizMode) {
      setStartQuiz(true);
    }
  };

  const handleQuizComplete = (score: number, answers: number[]) => {
    console.log('Quiz completed:', { score, answers });
    setStartQuiz(false);
    setSelectedTopic('');
    setSelectedDifficulty('');
    setQuizMode(null);
  };

  return (
    <div className="min-h-screen gradient-depth">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Ambient Background Orbs */}
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="h-14 w-14 text-[#9C4AFF] glow-text-violet" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Practice & Assessment Center
              </h1>
            </div>
            <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
              Master electrical engineering concepts with smart quizzes, mock exams, and personalized skill tracking
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Tests Taken', value: '47', icon: FileText, color: 'violet' },
              { label: 'Average Score', value: '78%', icon: Target, color: 'orange' },
              { label: 'Study Streak', value: '12 days', icon: Zap, color: 'cyan' },
              { label: 'Rank', value: 'Top 15%', icon: Trophy, color: 'violet' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${
                      stat.color === 'violet' ? 'text-[#9C4AFF]' :
                      stat.color === 'orange' ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                    }`} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-[#B8A7E0]">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="quiz-generator" className="space-y-8">
            <TabsList className="glass-surface border border-white/10 p-1 grid w-full grid-cols-3">
              <TabsTrigger value="quiz-generator" className="data-[state=active]:gradient-violet data-[state=active]:text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                Smart Quiz
              </TabsTrigger>
              <TabsTrigger value="mock-exams" className="data-[state=active]:gradient-fire data-[state=active]:text-white">
                <GraduationCap className="h-4 w-4 mr-2" />
                Mock Exams
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:gradient-aqua data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Skill Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Smart Quiz Generator */}
            <TabsContent value="quiz-generator" className="space-y-8">
              {!startQuiz ? (
                <>
                  <Card className="glass-surface border-2 border-[#9C4AFF]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[#9C4AFF]" />
                        Smart Quiz Generator
                      </CardTitle>
                      <CardDescription className="text-[#B8A7E0]">
                        Create customized quizzes based on topic and difficulty
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-white font-medium">Select Topic</label>
                          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                            <SelectTrigger className="glass-surface border-white/20 text-white">
                              <SelectValue placeholder="Choose a topic..." />
                            </SelectTrigger>
                            <SelectContent className="glass-surface border-white/20">
                              {quizTopics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id} className="text-white">
                                  {topic.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-white font-medium">Difficulty Level</label>
                          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                            <SelectTrigger className="glass-surface border-white/20 text-white">
                              <SelectValue placeholder="Choose difficulty..." />
                            </SelectTrigger>
                            <SelectContent className="glass-surface border-white/20">
                              <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                              <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                              <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                              <SelectItem value="expert" className="text-white">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-white font-medium">Quiz Mode</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card 
                            className={`cursor-pointer transition-all ${
                              quizMode === 'practice' 
                                ? 'border-2 border-[#9C4AFF] shadow-glowViolet gradient-violet' 
                                : 'glass-surface border-white/10 hover:border-[#9C4AFF]/50'
                            }`}
                            onClick={() => setQuizMode('practice')}
                          >
                            <CardContent className="p-6 text-center">
                              <BookOpen className={`h-10 w-10 mx-auto mb-3 ${quizMode === 'practice' ? 'text-white' : 'text-[#9C4AFF]'}`} />
                              <h3 className={`font-semibold mb-2 ${quizMode === 'practice' ? 'text-white' : 'text-white'}`}>
                                Practice Mode
                              </h3>
                              <p className={`text-sm ${quizMode === 'practice' ? 'text-white/90' : 'text-[#B8A7E0]'}`}>
                                Unlimited time, instant feedback
                              </p>
                            </CardContent>
                          </Card>

                          <Card 
                            className={`cursor-pointer transition-all ${
                              quizMode === 'timed' 
                                ? 'border-2 border-[#FF6B00] shadow-glowOrange gradient-fire' 
                                : 'glass-surface border-white/10 hover:border-[#FF6B00]/50'
                            }`}
                            onClick={() => setQuizMode('timed')}
                          >
                            <CardContent className="p-6 text-center">
                              <Timer className={`h-10 w-10 mx-auto mb-3 ${quizMode === 'timed' ? 'text-white' : 'text-[#FF6B00]'}`} />
                              <h3 className={`font-semibold mb-2 ${quizMode === 'timed' ? 'text-white' : 'text-white'}`}>
                                Timed Mode
                              </h3>
                              <p className={`text-sm ${quizMode === 'timed' ? 'text-white/90' : 'text-[#B8A7E0]'}`}>
                                Real exam conditions, time pressure
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Button 
                        size="lg" 
                        className="w-full gradient-violet hover:shadow-glowViolet text-white font-semibold"
                        disabled={!selectedTopic || !selectedDifficulty || !quizMode}
                        onClick={handleStartQuiz}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Available Topics */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">Available Topics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {quizTopics.map((topic, index) => (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all cursor-pointer">
                            <CardContent className="p-6">
                              <topic.icon className={`h-8 w-8 mb-3 ${
                                topic.color === 'violet' ? 'text-[#9C4AFF]' :
                                topic.color === 'orange' ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                              }`} />
                              <h4 className="text-white font-semibold mb-2">{topic.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-[#B8A7E0]">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>45 questions available</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <QuizInterface 
                  mode={quizMode!} 
                  duration={30}
                  onComplete={handleQuizComplete}
                />
              )}
            </TabsContent>

            {/* Mock Exams */}
            <TabsContent value="mock-exams" className="space-y-8">
              <div className="space-y-6">
                {mockExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 gradient-fire rounded-xl">
                              <exam.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white flex items-center gap-2">
                                {exam.title}
                                {exam.badge && (
                                  <Badge className={`${
                                    exam.badge === 'Pro' ? 'gradient-violet' : 
                                    exam.badge === 'New' ? 'gradient-aqua' : 'gradient-fire'
                                  } text-white border-0`}>
                                    {exam.badge}
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-[#B8A7E0]">
                                {exam.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                              <Clock className="h-4 w-4" />
                              Duration
                            </div>
                            <div className="text-white font-semibold">{exam.duration}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                              <FileText className="h-4 w-4" />
                              Questions
                            </div>
                            <div className="text-white font-semibold">{exam.questions}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                              <Target className="h-4 w-4" />
                              Difficulty
                            </div>
                            <div className="text-white font-semibold">{exam.difficulty}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                              <BarChart3 className="h-4 w-4" />
                              Avg Score
                            </div>
                            <div className="text-white font-semibold">{exam.avgScore}%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#B8A7E0]">
                            {exam.attempts.toLocaleString()} attempts by users
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                              View Details
                            </Button>
                            <Button className="gradient-fire hover:shadow-glowOrange text-white">
                              <Play className="h-4 w-4 mr-2" />
                              Start Exam
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Skill Dashboard */}
            <TabsContent value="dashboard" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Skill Progress */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-surface border-2 border-[#00E5FF]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-[#00E5FF]" />
                        Progress by Topic
                      </CardTitle>
                      <CardDescription className="text-[#B8A7E0]">
                        Track your mastery across different electrical engineering topics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {skillProgress.map((skill, index) => (
                        <motion.div
                          key={skill.category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{skill.category}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${
                                skill.status === 'strong' ? 'text-[#00E5FF]' :
                                skill.status === 'weak' ? 'text-[#FF6B00]' : 'text-[#B8A7E0]'
                              }`}>
                                {skill.progress}%
                              </span>
                              <Badge className={`${
                                skill.status === 'strong' ? 'gradient-aqua' :
                                skill.status === 'weak' ? 'gradient-fire' : 'glass-surface'
                              } text-white border-0`}>
                                {skill.status}
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={skill.progress} 
                            className="h-2 bg-white/10"
                          />
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Weak Areas */}
                  <Card className="glass-surface border-2 border-[#FF6B00]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-[#FF6B00]" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {skillProgress
                        .filter(s => s.status === 'weak')
                        .map((skill, index) => (
                          <div key={skill.category} className="flex items-center justify-between p-4 glass-surface rounded-lg border border-white/10">
                            <div>
                              <h4 className="text-white font-medium">{skill.category}</h4>
                              <p className="text-sm text-[#B8A7E0]">Focus on this topic</p>
                            </div>
                            <Button className="gradient-fire hover:shadow-glowOrange text-white">
                              Practice Now
                            </Button>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Recent Tests */}
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Recent Tests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentTests.map((test, index) => (
                        <div key={index} className="p-3 glass-surface rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white text-sm font-medium">{test.name}</h4>
                            {test.status === 'passed' ? (
                              <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-[#FF6B00]" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#B8A7E0]">{test.date}</span>
                            <span className={`font-semibold ${
                              test.score >= 80 ? 'text-[#00E5FF]' : 
                              test.score >= 60 ? 'text-[#B8A7E0]' : 'text-[#FF6B00]'
                            }`}>
                              {test.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recommended Path */}
                  <Card className="glass-surface border-2 border-[#9C4AFF]/30">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#9C4AFF]" />
                        Recommended Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 gradient-violet rounded-lg">
                        <h4 className="text-white font-semibold mb-1">Next: Motor Controls</h4>
                        <p className="text-white/80 text-sm">Complete 3 practice quizzes</p>
                      </div>
                      <Button className="w-full gradient-violet hover:shadow-glowViolet text-white">
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}