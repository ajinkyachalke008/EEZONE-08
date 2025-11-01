'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  Brain,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';

interface StudyPlanWeek {
  week: number;
  topic: string;
  subtopics: string[];
  resources: string[];
  practiceQuestions: number;
  estimatedHours: number;
}

export function StudyPlanGenerator() {
  const [examType, setExamType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState([15]);
  const [currentLevel, setCurrentLevel] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlanWeek[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const exams = [
    { id: 'fe-electrical', name: 'FE Electrical', duration: 8, topics: 6 },
    { id: 'pe-power', name: 'PE Power', duration: 12, topics: 8 },
    { id: 'journeyman', name: 'Journeyman Electrician', duration: 6, topics: 5 },
    { id: 'master', name: 'Master Electrician', duration: 10, topics: 7 },
  ];

  const generatePlan = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const samplePlan: StudyPlanWeek[] = [
        {
          week: 1,
          topic: 'Circuit Analysis Fundamentals',
          subtopics: ['Ohm\'s Law', 'Kirchhoff\'s Laws', 'Series & Parallel Circuits', 'Thevenin & Norton'],
          resources: ['Textbook Ch. 1-3', 'Video Series A', 'Practice Problems Set 1'],
          practiceQuestions: 50,
          estimatedHours: hoursPerWeek[0],
        },
        {
          week: 2,
          topic: 'AC Circuit Analysis',
          subtopics: ['Phasors', 'Impedance', 'Power Factor', 'Resonance'],
          resources: ['Textbook Ch. 4-5', 'Video Series B', 'Practice Problems Set 2'],
          practiceQuestions: 45,
          estimatedHours: hoursPerWeek[0],
        },
        {
          week: 3,
          topic: 'Three-Phase Power Systems',
          subtopics: ['Wye & Delta Connections', 'Power Calculations', 'Transformers', 'Per-Unit System'],
          resources: ['Textbook Ch. 6-7', 'Video Series C', 'Practice Problems Set 3'],
          practiceQuestions: 40,
          estimatedHours: hoursPerWeek[0],
        },
        {
          week: 4,
          topic: 'Electronics & Semiconductors',
          subtopics: ['Diodes', 'Transistors', 'Op-Amps', 'Logic Gates'],
          resources: ['Textbook Ch. 8-10', 'Video Series D', 'Practice Problems Set 4'],
          practiceQuestions: 55,
          estimatedHours: hoursPerWeek[0],
        },
        {
          week: 5,
          topic: 'Control Systems',
          subtopics: ['Transfer Functions', 'Stability Analysis', 'PID Controllers', 'Root Locus'],
          resources: ['Textbook Ch. 11-12', 'Video Series E', 'Practice Problems Set 5'],
          practiceQuestions: 35,
          estimatedHours: hoursPerWeek[0],
        },
        {
          week: 6,
          topic: 'NEC Codes & Standards',
          subtopics: ['Article 90-110', 'Wiring Methods', 'Grounding', 'Protection Devices'],
          resources: ['NEC Handbook', 'Video Series F', 'Practice Problems Set 6'],
          practiceQuestions: 60,
          estimatedHours: hoursPerWeek[0],
        },
        {
          week: 7,
          topic: 'Review & Practice Exams',
          subtopics: ['Full-Length Mock Exam 1', 'Weak Area Focus', 'Time Management'],
          resources: ['Mock Exam 1', 'Review Materials', 'Flashcards'],
          practiceQuestions: 110,
          estimatedHours: hoursPerWeek[0] + 5,
        },
        {
          week: 8,
          topic: 'Final Review & Exam Day Prep',
          subtopics: ['Full-Length Mock Exam 2', 'Formula Sheet Review', 'Mental Preparation'],
          resources: ['Mock Exam 2', 'Formula Guide', 'Test-Taking Strategies'],
          practiceQuestions: 110,
          estimatedHours: hoursPerWeek[0] + 3,
        },
      ];
      
      setGeneratedPlan(samplePlan);
      setIsGenerating(false);
    }, 2000);
  };

  const canGenerate = examType && startDate && currentLevel;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="glass-surface border-2 border-[#9C4AFF]/30 shadow-glowViolet">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#9C4AFF]" />
            AI Study Plan Generator
          </CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Create a personalized study schedule based on your exam, timeline, and available study time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">Target Exam</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger className="glass-surface border-white/20 text-white">
                  <SelectValue placeholder="Select your exam" />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id} className="text-white">
                      {exam.name} ({exam.duration} weeks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-surface border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Current Knowledge Level</Label>
              <Select value={currentLevel} onValueChange={setCurrentLevel}>
                <SelectTrigger className="glass-surface border-white/20 text-white">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  <SelectItem value="beginner" className="text-white">Beginner (Just Starting)</SelectItem>
                  <SelectItem value="intermediate" className="text-white">Intermediate (Some Experience)</SelectItem>
                  <SelectItem value="advanced" className="text-white">Advanced (Mostly Prepared)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">Hours Per Week</Label>
                <span className="text-[#9C4AFF] font-bold text-lg">{hoursPerWeek[0]} hours</span>
              </div>
              <Slider
                value={hoursPerWeek}
                onValueChange={setHoursPerWeek}
                min={5}
                max={40}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#B8A7E0]">
                <span>5 hrs</span>
                <span>40 hrs</span>
              </div>
            </div>
          </div>

          <Button
            onClick={generatePlan}
            disabled={!canGenerate || isGenerating}
            className="w-full gradient-violet hover:shadow-glowViolet text-white font-semibold text-lg h-12"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Brain className="h-5 w-5" />
                </motion.div>
                Generating Your Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Study Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Plan */}
      <AnimatePresence>
        {generatedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Plan Summary */}
            <Card className="glass-surface border-2 border-[#00E5FF]/30 shadow-glowCyan">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[#00E5FF]" />
                  Your Personalized Study Plan
                </CardTitle>
                <CardDescription className="text-[#B8A7E0]">
                  {generatedPlan.length} weeks • {generatedPlan.reduce((acc, w) => acc + w.estimatedHours, 0)} total hours • {generatedPlan.reduce((acc, w) => acc + w.practiceQuestions, 0)} practice questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Weeks', value: generatedPlan.length, icon: Calendar, color: 'cyan' },
                    { label: 'Study Hours', value: `${generatedPlan.reduce((acc, w) => acc + w.estimatedHours, 0)}h`, icon: Clock, color: 'violet' },
                    { label: 'Topics', value: generatedPlan.length, icon: BookOpen, color: 'orange' },
                    { label: 'Questions', value: generatedPlan.reduce((acc, w) => acc + w.practiceQuestions, 0), icon: Target, color: 'cyan' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="p-4 glass-surface rounded-xl border border-white/10 text-center">
                        <stat.icon className={`h-8 w-8 mx-auto mb-2 ${
                          stat.color === 'violet' ? 'text-[#9C4AFF]' :
                          stat.color === 'orange' ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                        }`} />
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-[#B8A7E0]">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button className="flex-1 gradient-fire hover:shadow-glowOrange text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </CardFooter>
            </Card>

            {/* Weekly Breakdown */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#9C4AFF]" />
                Week-by-Week Breakdown
              </h3>
              
              {generatedPlan.map((week, index) => (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="gradient-violet text-white border-0 text-lg px-3 py-1">
                              Week {week.week}
                            </Badge>
                            <Badge className="glass-surface text-[#B8A7E0] border-white/20">
                              {week.estimatedHours} hours
                            </Badge>
                            <Badge className="glass-surface text-[#00E5FF] border-[#00E5FF]/20">
                              {week.practiceQuestions} questions
                            </Badge>
                          </div>
                          <CardTitle className="text-white text-xl">{week.topic}</CardTitle>
                        </div>
                        <Award className="h-8 w-8 text-[#9C4AFF] opacity-50" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-[#9C4AFF]" />
                          Key Subtopics
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {week.subtopics.map((subtopic, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                              <CheckCircle2 className="h-4 w-4 text-[#00E5FF] flex-shrink-0" />
                              <span>{subtopic}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                          Study Resources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {week.resources.map((resource, idx) => (
                            <Badge key={idx} className="glass-surface text-[#B8A7E0] border-white/20">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <Zap className="h-4 w-4 mr-2" />
                        Start Week {week.week}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
