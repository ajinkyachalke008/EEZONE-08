'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Flag,
  BookOpen,
  AlertCircle,
  Trophy,
  Zap,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

const sampleQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the power dissipated in a 10Ω resistor when 2A current flows through it?",
    options: ["10W", "20W", "40W", "80W"],
    correctAnswer: 2,
    explanation: "Using P = I²R, where I = 2A and R = 10Ω: P = (2)² × 10 = 4 × 10 = 40W. The power dissipation formula can also be expressed as P = V²/R or P = VI, depending on known values.",
    difficulty: "Easy",
    topic: "Circuit Analysis"
  },
  {
    id: 2,
    question: "In a three-phase balanced system with line voltage of 480V, what is the phase voltage?",
    options: ["240V", "277V", "480V", "831V"],
    correctAnswer: 1,
    explanation: "For a wye-connected system: V_phase = V_line / √3 = 480 / 1.732 = 277V. This is why most commercial lighting in North America operates at 277V - it's the phase voltage of a 480V three-phase system.",
    difficulty: "Medium",
    topic: "Power Systems"
  },
  {
    id: 3,
    question: "According to NEC Article 430, what is the minimum percentage of motor full-load current rating required for motor overload protection?",
    options: ["100%", "115%", "125%", "150%"],
    correctAnswer: 1,
    explanation: "NEC 430.32 requires overload protection to trip at no more than 115% of the motor's nameplate full-load current rating for motors with a service factor of 1.15 or greater, or 125% for all other motors.",
    difficulty: "Hard",
    topic: "NEC Codes"
  },
];

interface QuizInterfaceProps {
  mode: 'practice' | 'timed';
  duration?: number; // in minutes
  onComplete?: (score: number, answers: number[]) => void;
}

export function QuizInterface({ mode, duration = 30, onComplete }: QuizInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(sampleQuestions.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(mode === 'timed' ? duration * 60 : 0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (mode === 'timed' && timeLeft > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeLeft, quizCompleted]);

  const currentQ = sampleQuestions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== null;
  const isCorrect = answers[currentQuestion] === currentQ.correctAnswer;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
    
    if (mode === 'practice') {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmitQuiz = () => {
    const score = answers.reduce((acc, answer, idx) => {
      return answer === sampleQuestions[idx].correctAnswer ? acc + 1 : acc;
    }, 0);
    setQuizCompleted(true);
    if (onComplete) {
      onComplete(score, answers as number[]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const progressPercentage = (answeredCount / sampleQuestions.length) * 100;

  if (quizCompleted) {
    const score = answers.reduce((acc, answer, idx) => {
      return answer === sampleQuestions[idx].correctAnswer ? acc + 1 : acc;
    }, 0);
    const percentage = Math.round((score / sampleQuestions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-surface border-2 border-[#9C4AFF]/30 shadow-glowViolet">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Trophy className="h-24 w-24 text-[#FF6B00] mx-auto mb-6 glow-text-orange" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4 glow-text-violet">Quiz Complete!</h2>
            <p className="text-xl text-[#B8A7E0] mb-8">
              You scored {score} out of {sampleQuestions.length} questions correct
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <div className="relative h-32 w-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9C4AFF" />
                      <stop offset="100%" stopColor="#FF6B00" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{percentage}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <CheckCircle2 className="h-8 w-8 text-[#00E5FF] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{score}</div>
                  <div className="text-sm text-[#B8A7E0]">Correct</div>
                </div>
                <div>
                  <XCircle className="h-8 w-8 text-[#FF6B00] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{sampleQuestions.length - score}</div>
                  <div className="text-sm text-[#B8A7E0]">Incorrect</div>
                </div>
                <div>
                  <Flag className="h-8 w-8 text-[#9C4AFF] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{flaggedQuestions.size}</div>
                  <div className="text-sm text-[#B8A7E0]">Flagged</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="gradient-violet hover:shadow-glowViolet text-white font-semibold">
                <BookOpen className="h-4 w-4 mr-2" />
                Review Answers
              </Button>
              <Button className="gradient-fire hover:shadow-glowOrange text-white font-semibold">
                <Zap className="h-4 w-4 mr-2" />
                Try Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="glass-surface border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </span>
              {mode === 'timed' && (
                <div className={`flex items-center gap-2 ${timeLeft < 300 ? 'text-[#FF6B00]' : 'text-[#00E5FF]'}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#B8A7E0] text-sm">{answeredCount} answered</span>
              <Badge className="glass-surface text-[#B8A7E0] border-white/20">
                {flaggedQuestions.size} flagged
              </Badge>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-surface border-2 border-[#9C4AFF]/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${
                      currentQ.difficulty === 'Easy' ? 'gradient-aqua' :
                      currentQ.difficulty === 'Medium' ? 'gradient-violet' : 'gradient-fire'
                    } text-white border-0`}>
                      {currentQ.difficulty}
                    </Badge>
                    <Badge className="glass-surface text-[#B8A7E0] border-white/20">
                      {currentQ.topic}
                    </Badge>
                    {flaggedQuestions.has(currentQuestion) && (
                      <Flag className="h-5 w-5 text-[#FF6B00] fill-[#FF6B00]" />
                    )}
                  </div>
                  <CardTitle className="text-white text-xl leading-relaxed">
                    {currentQ.question}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFlag}
                  className="text-[#B8A7E0] hover:text-white"
                >
                  <Flag className={`h-5 w-5 ${flaggedQuestions.has(currentQuestion) ? 'fill-[#FF6B00] text-[#FF6B00]' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={answers[currentQuestion]?.toString()} onValueChange={(val) => handleAnswer(parseInt(val))}>
                {currentQ.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === index;
                  const showResult = isAnswered && showExplanation;
                  const isThisCorrect = index === currentQ.correctAnswer;
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Label
                        htmlFor={`option-${index}`}
                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          showResult && isThisCorrect
                            ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-glowCyan'
                            : showResult && isSelected && !isThisCorrect
                            ? 'border-[#FF6B00] bg-[#FF6B00]/10 shadow-glowOrange'
                            : isSelected
                            ? 'border-[#9C4AFF] bg-[#9C4AFF]/10'
                            : 'border-white/10 hover:border-[#9C4AFF]/50 glass-surface'
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="text-[#9C4AFF]" />
                        <span className="text-white flex-1">{option}</span>
                        {showResult && isThisCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-[#00E5FF]" />
                        )}
                        {showResult && isSelected && !isThisCorrect && (
                          <XCircle className="h-5 w-5 text-[#FF6B00]" />
                        )}
                      </Label>
                    </motion.div>
                  );
                })}
              </RadioGroup>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`border-2 ${isCorrect ? 'border-[#00E5FF]/50 bg-[#00E5FF]/5' : 'border-[#FF6B00]/50 bg-[#FF6B00]/5'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-[#00E5FF] flex-shrink-0 mt-1" />
                          ) : (
                            <Lightbulb className="h-6 w-6 text-[#FF6B00] flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">
                              {isCorrect ? 'Correct!' : 'Explanation:'}
                            </h4>
                            <p className="text-[#B8A7E0] text-sm leading-relaxed">
                              {currentQ.explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestion === sampleQuestions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  className="gradient-fire hover:shadow-glowOrange text-white font-semibold"
                  disabled={answeredCount < sampleQuestions.length}
                >
                  Submit Quiz
                  <Trophy className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="gradient-violet hover:shadow-glowViolet text-white font-semibold"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Question Navigator */}
      <Card className="glass-surface border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-[#9C4AFF]" />
            <span className="text-white font-medium text-sm">Quick Navigation</span>
          </div>
          <div className="grid grid-cols-10 gap-2">
            {sampleQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestion(index);
                  setShowExplanation(false);
                }}
                className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                  index === currentQuestion
                    ? 'gradient-violet text-white shadow-glowViolet'
                    : answers[index] !== null
                    ? 'glass-surface text-[#00E5FF] border border-[#00E5FF]/50'
                    : 'glass-surface text-[#B8A7E0] border border-white/10 hover:border-[#9C4AFF]/50'
                }`}
              >
                {index + 1}
                {flaggedQuestions.has(index) && (
                  <Flag className="h-3 w-3 absolute -top-1 -right-1 text-[#FF6B00] fill-[#FF6B00]" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
