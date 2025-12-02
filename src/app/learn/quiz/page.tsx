'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Brain, ChevronLeft, ChevronRight, Clock, Target, 
  CheckCircle2, XCircle, Loader2, Play, RotateCcw,
  Zap, Trophy, AlertTriangle, HelpCircle, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Topic {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
}

interface Question {
  id: number;
  topicId: number;
  difficulty: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  explanation: string;
}

interface QuizResult {
  attempt_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  finished_at: string;
}

type QuizState = 'setup' | 'active' | 'reviewing' | 'completed';

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

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedTopicId = searchParams.get('topic');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>('setup');
  
  // Setup state
  const [selectedTopicId, setSelectedTopicId] = useState<string>(preselectedTopicId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Results state
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<{ [questionId: number]: string }>({});

  const userId = getUserId();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizState === 'active' && timeStarted) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - timeStarted.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState, timeStarted]);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/learn/topics');
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedTopicId !== 'all') params.append('topic_id', selectedTopicId);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      params.append('limit', questionCount.toString());

      // Fetch questions
      const questionsRes = await fetch(`/api/learn/questions?${params}`);
      if (!questionsRes.ok) {
        toast.error('Failed to load questions');
        return;
      }
      const questionsData = await questionsRes.json();
      
      if (questionsData.length === 0) {
        toast.error('No questions available for selected criteria');
        return;
      }

      setQuestions(questionsData);

      // Start quiz attempt
      const attemptRes = await fetch('/api/learn/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic_id: selectedTopicId !== 'all' ? parseInt(selectedTopicId) : null,
          total_questions: questionsData.length
        })
      });

      if (!attemptRes.ok) {
        toast.error('Failed to start quiz');
        return;
      }

      const attemptData = await attemptRes.json();
      setAttemptId(attemptData.id);
      setTimeStarted(new Date());
      setQuizState('active');
      setCurrentQuestionIndex(0);
      setAnswers({});
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Error starting quiz');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const submitQuiz = async () => {
    if (!attemptId) return;
    
    setLoading(true);
    try {
      const answersArray = questions.map(q => ({
        question_id: q.id,
        selected_option: answers[q.id] || 'A'
      }));

      const res = await fetch('/api/learn/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: answersArray
        })
      });

      if (!res.ok) {
        toast.error('Failed to submit quiz');
        return;
      }

      const resultData = await res.json();
      setResult(resultData);

      // Fetch detailed results for explanations
      const detailsRes = await fetch(`/api/learn/quiz/${attemptId}/results`);
      if (detailsRes.ok) {
        const details = await detailsRes.json();
        const correctMap: { [key: number]: string } = {};
        details.questionResults?.forEach((qr: any) => {
          correctMap[qr.questionId] = qr.correctOption;
        });
        setCorrectAnswers(correctMap);
      }

      setQuizState('completed');
      toast.success('Quiz submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setQuestions([]);
    setAnswers({});
    setAttemptId(null);
    setTimeStarted(null);
    setElapsedTime(0);
    setResult(null);
    setCurrentQuestionIndex(0);
    setShowExplanations(false);
    setCorrectAnswers({});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (loading && quizState === 'setup') {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C4AFF] mx-auto mb-4" />
          <p className="text-[#B8A7E0]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-depth">
      {/* Header */}
      <section className="relative py-6 px-4 border-b border-white/10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#00E5FF] opacity-15 blur-[150px] rounded-full" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="text-[#B8A7E0] hover:text-white">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Learn
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-aqua rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Smart Quiz</h1>
              <p className="text-[#B8A7E0] text-sm">Test your electrical engineering knowledge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Setup Screen */}
            {quizState === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass-surface border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <Target className="h-6 w-6 text-[#00E5FF]" />
                      Configure Your Quiz
                    </CardTitle>
                    <CardDescription className="text-[#B8A7E0]">
                      Select topic, difficulty, and number of questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Topic Selection */}
                    <div className="space-y-2">
                      <Label className="text-white">Topic</Label>
                      <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                        <SelectTrigger className="glass-surface border-white/20 text-white">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent className="glass-surface border-white/20">
                          <SelectItem value="all" className="text-white">All Topics (Mixed)</SelectItem>
                          {topics.map(topic => (
                            <SelectItem key={topic.id} value={topic.id.toString()} className="text-white">
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-2">
                      <Label className="text-white">Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="glass-surface border-white/20 text-white">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="glass-surface border-white/20">
                          <SelectItem value="all" className="text-white">All Difficulties (Mixed)</SelectItem>
                          <SelectItem value="easy" className="text-white">Easy</SelectItem>
                          <SelectItem value="medium" className="text-white">Medium</SelectItem>
                          <SelectItem value="hard" className="text-white">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <Label className="text-white">Number of Questions</Label>
                      <div className="flex gap-2">
                        {[5, 10, 15, 20].map(count => (
                          <Button
                            key={count}
                            variant="outline"
                            onClick={() => setQuestionCount(count)}
                            className={`flex-1 ${
                              questionCount === count
                                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                                : 'border-white/20 text-[#B8A7E0] hover:text-white'
                            }`}
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 glass-surface border border-[#9C4AFF]/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-[#9C4AFF] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-[#B8A7E0]">
                          <p className="font-medium text-white mb-1">How it works:</p>
                          <ul className="space-y-1">
                            <li>• Questions are randomly selected based on your criteria</li>
                            <li>• Your answers and time are tracked for analytics</li>
                            <li>• After completion, see detailed explanations and weak areas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={startQuiz}
                      disabled={loading}
                      className="w-full gradient-aqua hover:shadow-glowCyan text-white"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Quiz
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Active Quiz Screen */}
            {quizState === 'active' && currentQuestion && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#B8A7E0] text-sm">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#B8A7E0] text-sm flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(elapsedTime)}
                      </span>
                      <Badge className={`${
                        currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Question Card */}
                <Card className="glass-surface border-white/10 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg leading-relaxed">
                      {currentQuestion.questionText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onValueChange={(value) => selectAnswer(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionKey = `option${option}` as keyof Question;
                        const optionText = currentQuestion[optionKey] as string;
                        const isSelected = answers[currentQuestion.id] === option;
                        
                        return (
                          <div
                            key={option}
                            className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/50'
                                : 'glass-surface border-white/10 hover:border-white/30'
                            }`}
                            onClick={() => selectAnswer(currentQuestion.id, option)}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${option}`}
                              className="border-white/30 text-[#00E5FF]"
                            />
                            <Label
                              htmlFor={`option-${option}`}
                              className={`flex-1 cursor-pointer ${
                                isSelected ? 'text-white' : 'text-[#B8A7E0]'
                              }`}
                            >
                              <span className="font-semibold mr-2">{option}.</span>
                              {optionText}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="border-white/20 text-[#B8A7E0] hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-[#B8A7E0] text-sm">
                      {answeredCount}/{questions.length} answered
                    </span>
                  </div>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="gradient-violet hover:shadow-glowViolet"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={submitQuiz}
                      disabled={loading || answeredCount < questions.length}
                      className="gradient-fire hover:shadow-glowOrange"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Submit Quiz
                    </Button>
                  )}
                </div>

                {/* Quick Navigation Dots */}
                <div className="flex justify-center gap-2 mt-6 flex-wrap">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        idx === currentQuestionIndex
                          ? 'bg-[#00E5FF] text-white'
                          : answers[q.id]
                          ? 'bg-[#9C4AFF]/30 text-[#9C4AFF]'
                          : 'bg-white/10 text-[#B8A7E0] hover:bg-white/20'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results Screen */}
            {quizState === 'completed' && result && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <Card className="glass-surface border-white/10 text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      {result.percentage >= 80 ? (
                        <div className="p-6 bg-[#00E5FF]/20 rounded-full">
                          <Trophy className="h-16 w-16 text-[#00E5FF]" />
                        </div>
                      ) : result.percentage >= 50 ? (
                        <div className="p-6 bg-[#FF6B00]/20 rounded-full">
                          <CheckCircle2 className="h-16 w-16 text-[#FF6B00]" />
                        </div>
                      ) : (
                        <div className="p-6 bg-[#9C4AFF]/20 rounded-full">
                          <AlertTriangle className="h-16 w-16 text-[#9C4AFF]" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-4xl font-bold text-white">
                      {result.score}/{result.total_questions}
                    </CardTitle>
                    <CardDescription className="text-[#B8A7E0] text-lg">
                      You scored {result.percentage.toFixed(1)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="p-3 glass-surface rounded-xl">
                        <p className="text-[#00E5FF] text-2xl font-bold">{result.score}</p>
                        <p className="text-[#B8A7E0] text-xs">Correct</p>
                      </div>
                      <div className="p-3 glass-surface rounded-xl">
                        <p className="text-[#FF6B00] text-2xl font-bold">{result.total_questions - result.score}</p>
                        <p className="text-[#B8A7E0] text-xs">Incorrect</p>
                      </div>
                    </div>
                    <p className="text-[#B8A7E0] mt-4 text-sm">
                      Time taken: {formatTime(elapsedTime)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowExplanations(!showExplanations)}
                      className="border-white/20 text-[#B8A7E0] hover:text-white"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {showExplanations ? 'Hide' : 'Show'} Explanations
                    </Button>
                    <Button onClick={resetQuiz} className="gradient-violet hover:shadow-glowViolet">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Take Another Quiz
                    </Button>
                  </CardFooter>
                </Card>

                {/* Explanations */}
                {showExplanations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-[#9C4AFF]" />
                      Question Review
                    </h3>
                    {questions.map((q, idx) => {
                      const userAnswer = answers[q.id];
                      const correct = correctAnswers[q.id];
                      const isCorrect = userAnswer === correct;
                      
                      return (
                        <Card key={q.id} className={`glass-surface border ${
                          isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                        }`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-white text-sm flex items-center gap-2">
                                {isCorrect ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-400" />
                                )}
                                Q{idx + 1}: {q.questionText}
                              </CardTitle>
                              <Badge className={`${
                                q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {q.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <p className="text-[#B8A7E0]">
                              <span className="font-medium">Your answer:</span>{' '}
                              <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                {userAnswer}. {q[`option${userAnswer}` as keyof Question]}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-[#B8A7E0]">
                                <span className="font-medium">Correct answer:</span>{' '}
                                <span className="text-green-400">
                                  {correct}. {q[`option${correct}` as keyof Question]}
                                </span>
                              </p>
                            )}
                            <div className="p-3 bg-[#9C4AFF]/10 rounded-lg mt-2">
                              <p className="text-[#B8A7E0] text-xs">
                                <span className="font-medium text-[#9C4AFF]">Explanation:</span>{' '}
                                {q.explanation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </motion.div>
                )}

                {/* Action Links */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/learn/analytics`}>
                    <Button variant="outline" className="w-full border-white/20 text-[#B8A7E0] hover:text-white">
                      <Zap className="h-4 w-4 mr-2" />
                      View My Analytics
                    </Button>
                  </Link>
                  <Link href="/learn">
                    <Button variant="outline" className="w-full border-white/20 text-[#B8A7E0] hover:text-white">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Back to Learning Hub
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
