'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Zap,
  Brain,
  Code,
  CheckCircle2,
  Play,
  Mic,
  Video,
  Star,
} from 'lucide-react';

interface InterviewQuestion {
  id: number;
  category: 'technical' | 'behavioral' | 'situational';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  sampleAnswer: string;
  tips: string[];
  keyPoints: string[];
}

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    category: 'technical',
    difficulty: 'Medium',
    question: "Explain the difference between AC and DC power. When would you use each in practical applications?",
    sampleAnswer: "AC (Alternating Current) power reverses direction periodically, typically at 50-60Hz, making it ideal for long-distance transmission due to easy voltage transformation via transformers. DC (Direct Current) flows in one direction and is preferred for electronics, batteries, and applications requiring stable voltage. AC is used in power grids and household electricity, while DC is essential for computers, LED lighting, electric vehicles, and renewable energy systems with battery storage.",
    tips: [
      "Start with basic definitions",
      "Provide real-world examples",
      "Mention efficiency considerations",
      "Discuss modern trends like DC microgrids"
    ],
    keyPoints: [
      "AC changes direction periodically",
      "DC flows in one constant direction",
      "AC better for long-distance transmission",
      "DC better for electronic devices"
    ]
  },
  {
    id: 2,
    category: 'technical',
    difficulty: 'Hard',
    question: "How would you design a protection system for a 480V three-phase motor?",
    sampleAnswer: "A comprehensive motor protection system should include: 1) Overload protection via thermal overload relays sized per NEC 430.32, typically 115-125% of motor FLA; 2) Short circuit protection using circuit breakers or fuses per NEC 430.52; 3) Ground fault protection; 4) Phase loss/imbalance protection; 5) Under-voltage protection. I would also consider adding a soft-starter or VFD for controlled starting, reducing inrush current and mechanical stress. The protection should be coordinated to ensure selectivity.",
    tips: [
      "Reference NEC standards",
      "Show understanding of coordination",
      "Mention both electrical and mechanical protection",
      "Consider startup conditions"
    ],
    keyPoints: [
      "Overload protection (thermal)",
      "Short circuit protection",
      "Ground fault detection",
      "Phase monitoring",
      "NEC compliance"
    ]
  },
  {
    id: 3,
    category: 'behavioral',
    difficulty: 'Medium',
    question: "Tell me about a time when you had to troubleshoot a complex electrical problem under time pressure.",
    sampleAnswer: "During a plant shutdown, a critical motor control center failed, threatening production delays. I systematically approached the problem: first checking supply voltage, then control circuits, and finally discovering a failed control transformer. I quickly coordinated with procurement for an emergency replacement while implementing a temporary bypass for essential equipment. We restored partial operations within 2 hours and full operations within 6 hours, minimizing production loss to 15% versus the potential 100% downtime. This taught me the importance of systematic troubleshooting, clear communication with stakeholders, and having backup plans.",
    tips: [
      "Use STAR method (Situation, Task, Action, Result)",
      "Quantify the impact and results",
      "Highlight technical skills and soft skills",
      "Show decision-making process"
    ],
    keyPoints: [
      "Systematic approach",
      "Time management",
      "Problem-solving methodology",
      "Communication with team",
      "Measurable results"
    ]
  },
  {
    id: 4,
    category: 'situational',
    difficulty: 'Medium',
    question: "If you discovered a safety violation in an existing installation, but fixing it would require shutting down operations, what would you do?",
    sampleAnswer: "Safety is non-negotiable. I would: 1) Immediately document the violation with photos and detailed notes; 2) Assess the severity and immediate risk level; 3) Notify my supervisor and the safety manager immediately; 4) If it poses imminent danger, implement temporary safeguards or recommend immediate shutdown; 5) Work with management to develop a corrective action plan that balances safety and operational needs; 6) Schedule the fix during the next available downtime if not immediately critical, but ensure proper warnings and temporary protection measures are in place. I would also investigate why it wasn't caught earlier and recommend process improvements.",
    tips: [
      "Always prioritize safety first",
      "Show you understand chain of command",
      "Demonstrate proactive thinking",
      "Consider business impact while maintaining ethics"
    ],
    keyPoints: [
      "Safety is priority",
      "Proper documentation",
      "Notify management immediately",
      "Risk assessment",
      "Follow-up and prevention"
    ]
  },
  {
    id: 5,
    category: 'technical',
    difficulty: 'Easy',
    question: "What is power factor and why is it important?",
    sampleAnswer: "Power factor is the ratio of real power (kW) to apparent power (kVA), ranging from 0 to 1. It indicates how effectively electrical power is being converted into useful work. A low power factor means the system draws more current than necessary, causing: 1) Higher utility bills due to demand charges; 2) Increased I²R losses in conductors; 3) Reduced system capacity; 4) Voltage drops. Industries often install capacitor banks or active power factor correction to improve power factor, typically targeting 0.95 or higher, which reduces operating costs and improves system efficiency.",
    tips: [
      "Define it simply first",
      "Explain practical implications",
      "Mention correction methods",
      "Relate to cost savings"
    ],
    keyPoints: [
      "Ratio of real to apparent power",
      "Affects efficiency and cost",
      "Improved with capacitors",
      "Utility penalty for low PF"
    ]
  },
];

const categories = [
  { id: 'all', name: 'All Questions', icon: MessageSquare, count: interviewQuestions.length },
  { id: 'technical', name: 'Technical', icon: Code, count: interviewQuestions.filter(q => q.category === 'technical').length },
  { id: 'behavioral', name: 'Behavioral', icon: Brain, count: interviewQuestions.filter(q => q.category === 'behavioral').length },
  { id: 'situational', name: 'Situational', icon: Lightbulb, count: interviewQuestions.filter(q => q.category === 'situational').length },
];

export function InterviewPrep() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'read' | 'video' | 'audio'>('read');

  const filteredQuestions = selectedCategory === 'all' 
    ? interviewQuestions 
    : interviewQuestions.filter(q => q.category === selectedCategory);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id
                  ? 'border-2 border-[#9C4AFF] shadow-glowViolet gradient-violet'
                  : 'glass-surface border-white/10 hover:border-[#9C4AFF]/50'
              }`}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentQuestionIndex(0);
                setShowAnswer(false);
              }}
            >
              <CardContent className="p-6 text-center">
                <category.icon className={`h-8 w-8 mx-auto mb-3 ${
                  selectedCategory === category.id ? 'text-white' : 'text-[#9C4AFF]'
                }`} />
                <h3 className={`font-semibold mb-1 ${
                  selectedCategory === category.id ? 'text-white' : 'text-white'
                }`}>
                  {category.name}
                </h3>
                <p className={`text-sm ${
                  selectedCategory === category.id ? 'text-white/80' : 'text-[#B8A7E0]'
                }`}>
                  {category.count} questions
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Practice Mode Selection */}
      <Card className="glass-surface border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Practice Mode:</span>
            <div className="flex gap-2">
              {[
                { id: 'read', label: 'Read', icon: MessageSquare },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'audio', label: 'Audio', icon: Mic },
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={practiceMode === mode.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPracticeMode(mode.id as any)}
                  className={practiceMode === mode.id 
                    ? 'gradient-violet text-white' 
                    : 'border-white/20 text-white hover:bg-white/10'
                  }
                >
                  <mode.icon className="h-4 w-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-surface border-2 border-[#9C4AFF]/30 shadow-glowViolet">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    currentQuestion.difficulty === 'Easy' ? 'gradient-aqua' :
                    currentQuestion.difficulty === 'Medium' ? 'gradient-violet' : 'gradient-fire'
                  } text-white border-0`}>
                    {currentQuestion.difficulty}
                  </Badge>
                  <Badge className="glass-surface text-[#B8A7E0] border-white/20 capitalize">
                    {currentQuestion.category}
                  </Badge>
                </div>
                <span className="text-[#B8A7E0] text-sm">
                  Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                </span>
              </div>
              <CardTitle className="text-white text-xl leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Practice Area */}
              {practiceMode === 'video' && (
                <Card className="glass-surface border-[#FF6B00]/30 bg-black/20">
                  <CardContent className="p-8 text-center">
                    <Video className="h-16 w-16 text-[#FF6B00] mx-auto mb-4" />
                    <h4 className="text-white font-semibold mb-2">Video Practice Mode</h4>
                    <p className="text-[#B8A7E0] text-sm mb-4">
                      Record yourself answering this question to practice delivery and confidence
                    </p>
                    <Button className="gradient-fire hover:shadow-glowOrange text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </CardContent>
                </Card>
              )}

              {practiceMode === 'audio' && (
                <Card className="glass-surface border-[#00E5FF]/30">
                  <CardContent className="p-8 text-center">
                    <Mic className="h-16 w-16 text-[#00E5FF] mx-auto mb-4" />
                    <h4 className="text-white font-semibold mb-2">Audio Practice Mode</h4>
                    <p className="text-[#B8A7E0] text-sm mb-4">
                      Practice your answer verbally and get AI feedback on content and clarity
                    </p>
                    <Button className="gradient-aqua hover:shadow-glowCyan text-white">
                      <Mic className="h-4 w-4 mr-2" />
                      Start Speaking
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Answer Section */}
              {!showAnswer ? (
                <div className="text-center py-8">
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="gradient-violet hover:shadow-glowViolet text-white font-semibold px-8"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    View Sample Answer
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Sample Answer */}
                  <Card className="glass-surface border-[#00E5FF]/30 bg-[#00E5FF]/5">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-[#00E5FF]" />
                        Sample Answer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#B8A7E0] leading-relaxed">
                        {currentQuestion.sampleAnswer}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[#9C4AFF]" />
                        Key Points to Cover
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentQuestion.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-[#FF6B00] flex-shrink-0 mt-1" />
                            <span className="text-[#B8A7E0] text-sm">{point}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card className="glass-surface border-[#FF6B00]/30 bg-[#FF6B00]/5">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-[#FF6B00]" />
                        Interview Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentQuestion.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-[#B8A7E0] text-sm">
                            <span className="text-[#FF6B00]">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex === filteredQuestions.length - 1}
                className="gradient-violet hover:shadow-glowViolet text-white font-semibold"
              >
                Next Question
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <Card className="glass-surface border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Progress</span>
            <span className="text-[#B8A7E0]">
              {currentQuestionIndex + 1} / {filteredQuestions.length}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-violet"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
