'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle2, Play, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SafetyScenario {
  id: string;
  title: string;
  category: string;
  hazardLevel: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  learningObjectives: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const scenarios: SafetyScenario[] = [
  {
    id: 'arc-flash',
    title: 'Arc Flash Incident Response',
    category: 'Arc Flash',
    hazardLevel: 'extreme',
    description: 'Learn proper procedures for arc flash hazard assessment and PPE selection',
    learningObjectives: [
      'Identify arc flash hazard warning labels',
      'Calculate incident energy and arc flash boundary',
      'Select appropriate PPE based on hazard level',
      'Understand arc flash safety procedures'
    ]
  },
  {
    id: 'lockout-tagout',
    title: 'Lockout/Tagout Procedures',
    category: 'LOTO',
    hazardLevel: 'high',
    description: 'Master proper lockout/tagout procedures for electrical equipment',
    learningObjectives: [
      'Identify energy sources requiring isolation',
      'Apply locks and tags correctly',
      'Verify zero-energy state',
      'Understand group lockout procedures'
    ]
  },
  {
    id: 'working-live',
    title: 'Working on Live Circuits',
    category: 'Live Work',
    hazardLevel: 'extreme',
    description: 'Safety protocols for authorized live electrical work',
    learningObjectives: [
      'Understand when live work is permitted',
      'Select proper insulated tools',
      'Maintain safe working distances',
      'Use proper PPE for voltage level'
    ]
  },
  {
    id: 'confined-space',
    title: 'Confined Space Entry',
    category: 'Confined Space',
    hazardLevel: 'high',
    description: 'Electrical work in vaults, manholes, and enclosed spaces',
    learningObjectives: [
      'Identify confined space hazards',
      'Test atmosphere before entry',
      'Use proper ventilation and monitoring',
      'Establish emergency rescue procedures'
    ]
  }
];

const quizQuestions: Record<string, QuizQuestion[]> = {
  'arc-flash': [
    {
      question: 'What is the primary purpose of an arc flash label?',
      options: [
        'To show the equipment voltage rating',
        'To indicate the arc flash boundary and required PPE',
        'To list maintenance schedule',
        'To show the equipment manufacturer'
      ],
      correctAnswer: 1,
      explanation: 'Arc flash labels indicate the arc flash boundary distance and the required PPE category/level needed for safe work on energized equipment.'
    },
    {
      question: 'What does "incident energy" measure in arc flash calculations?',
      options: [
        'The voltage of the system',
        'The amount of current flowing',
        'The thermal energy at a working distance',
        'The equipment power rating'
      ],
      correctAnswer: 2,
      explanation: 'Incident energy (measured in cal/cm²) represents the thermal energy that a worker would be exposed to at a specific working distance during an arc flash event.'
    }
  ]
};

export function SafetyTraining() {
  const [selectedScenario, setSelectedScenario] = useState<SafetyScenario | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startScenario = (scenario: SafetyScenario) => {
    setSelectedScenario(scenario);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const questions = quizQuestions[selectedScenario?.id || ''] || [];
    const question = questions[currentQuestion];
    
    if (answerIndex === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const questions = quizQuestions[selectedScenario?.id || ''] || [];
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  };

  const getHazardColor = (level: SafetyScenario['hazardLevel']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      extreme: 'bg-red-100 text-red-800'
    };
    return colors[level];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Safety Training Simulations</CardTitle>
          <CardDescription>
            Interactive training for electrical safety scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Selection */}
          {!selectedScenario && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Select Training Scenario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario) => (
                  <Card
                    key={scenario.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => startScenario(scenario)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <Shield className="h-8 w-8 text-[#00C2D1]" />
                        <Badge className={getHazardColor(scenario.hazardLevel)}>
                          {scenario.hazardLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{scenario.title}</h4>
                      <Badge variant="secondary" className="mb-3">{scenario.category}</Badge>
                      <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
                      <Button size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Training
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Active Training */}
          {selectedScenario && !isComplete && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{selectedScenario.title}</h3>
                      <Badge className={getHazardColor(selectedScenario.hazardLevel)}>
                        {selectedScenario.hazardLevel.toUpperCase()} HAZARD
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedScenario(null)}
                      className="text-white border-white hover:bg-white/10"
                    >
                      Exit Training
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Learning Objectives:</h4>
                    <ul className="space-y-2 text-sm opacity-90">
                      {selectedScenario.learningObjectives.map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00C2D1] flex-shrink-0 mt-0.5" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Question */}
              {quizQuestions[selectedScenario.id] && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Question {currentQuestion + 1} of {quizQuestions[selectedScenario.id].length}</CardTitle>
                      <Badge variant="outline">Score: {score}/{quizQuestions[selectedScenario.id].length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-lg font-medium text-[#071428]">
                        {quizQuestions[selectedScenario.id][currentQuestion].question}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {quizQuestions[selectedScenario.id][currentQuestion].options.map((option, idx) => {
                        const isCorrect = idx === quizQuestions[selectedScenario.id][currentQuestion].correctAnswer;
                        const isSelected = idx === selectedAnswer;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => !showExplanation && handleAnswerSelect(idx)}
                            disabled={showExplanation}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                              showExplanation
                                ? isCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-white opacity-50'
                                : 'border-gray-200 hover:border-[#00C2D1] bg-white hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                showExplanation && isCorrect
                                  ? 'bg-green-500 text-white'
                                  : showExplanation && isSelected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="flex-1">{option}</span>
                              {showExplanation && isCorrect && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showExplanation && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                          <p className="text-sm text-gray-700">
                            {quizQuestions[selectedScenario.id][currentQuestion].explanation}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {showExplanation && (
                      <Button onClick={handleNext} className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                        {currentQuestion < quizQuestions[selectedScenario.id].length - 1 ? 'Next Question' : 'Complete Training'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Completion Screen */}
          {isComplete && selectedScenario && (
            <Card className="border-2 border-[#00C2D1]">
              <CardContent className="pt-12 pb-12 text-center">
                <Award className="h-24 w-24 mx-auto text-[#00C2D1] mb-6" />
                <h3 className="text-3xl font-bold text-[#071428] mb-3">Training Complete!</h3>
                <p className="text-lg text-gray-600 mb-6">
                  {selectedScenario.title}
                </p>
                
                <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white max-w-md mx-auto mb-6">
                  <CardContent className="pt-6">
                    <div className="text-5xl font-bold text-[#00C2D1] mb-2">
                      {score}/{quizQuestions[selectedScenario.id]?.length || 0}
                    </div>
                    <div className="text-sm opacity-80">Correct Answers</div>
                    <div className="text-3xl font-bold mt-4">
                      {Math.round((score / (quizQuestions[selectedScenario.id]?.length || 1)) * 100)}%
                    </div>
                    <div className="text-sm opacity-80">Score</div>
                  </CardContent>
                </Card>

                {score === quizQuestions[selectedScenario.id]?.length && (
                  <Card className="bg-green-50 border-green-200 mb-6">
                    <CardContent className="pt-6">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-900">Perfect Score! 🎉</h4>
                      <p className="text-sm text-gray-700 mt-2">
                        You've demonstrated excellent understanding of {selectedScenario.category} safety procedures.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 justify-center">
                  <Button onClick={() => startScenario(selectedScenario)} variant="outline">
                    Retake Training
                  </Button>
                  <Button onClick={() => setSelectedScenario(null)} className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                    Choose Another Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Tips */}
          {!selectedScenario && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-3">Safety First!</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• Always de-energize equipment before working when possible</li>
                      <li>• Use proper PPE for the voltage level and hazard present</li>
                      <li>• Follow lockout/tagout procedures without exception</li>
                      <li>• Verify zero-energy state with proper test equipment</li>
                      <li>• Never work alone on high-voltage systems</li>
                      <li>• These simulations are for training only - always follow your company's safety procedures</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
