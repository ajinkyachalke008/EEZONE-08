'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Award,
  GraduationCap,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  User,
  Activity,
  HelpCircle,
  Clock
} from 'lucide-react';
import { VivaAudioVisualizer } from './viva-audio-visualizer';
import { VivaReportCard } from './viva-report-card';
import { speechController, SpeechState } from '@/lib/audio/speech-controller';
import { AIVivaResponse, VivaExchange } from '@/app/api/ai-viva/route';
import { soundEngine } from '@/lib/audio/lab-sound-engine';
import { toast } from 'sonner';

interface AIVivaExaminerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  category?: string;
  experimentCode?: string;
  governingTheory?: string;
  initialQuestion?: string;
  studentName?: string;
  rollNo?: string;
}

export const AIVivaExaminerDialog: React.FC<AIVivaExaminerDialogProps> = ({
  isOpen,
  onClose,
  topic,
  category = 'Electrical Engineering',
  experimentCode = 'EE-LAB',
  governingTheory = '',
  initialQuestion = 'State the primary aim of this experiment and describe its core working principle.',
  studentName = 'Ajinkya Chalke',
  rollNo = '22030101',
}) => {
  const [persona, setPersona] = useState<'strict' | 'supportive'>('strict');
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 4;
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [history, setHistory] = useState<VivaExchange[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalResult, setFinalResult] = useState<AIVivaResponse | null>(null);

  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Initialize and speak initial question when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentRound(1);
      setCurrentQuestion(initialQuestion);
      setTypedAnswer('');
      setInterimTranscript('');
      setHistory([]);
      setFinalResult(null);
      setIsEvaluating(false);

      if (!isAudioMuted) {
        setTimeout(() => {
          speechController.speak(
            initialQuestion,
            persona,
            () => setSpeechState('speaking'),
            () => setSpeechState('idle')
          );
        }, 500);
      }
    } else {
      speechController.stopSpeaking();
      speechController.stopListening();
    }
  }, [isOpen, initialQuestion]);

  // Auto-scroll transcript on new items
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [history, isEvaluating]);

  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    if (next) {
      speechController.stopSpeaking();
      speechController.stopListening();
      setSpeechState('idle');
    }
    soundEngine.playKeyClick();
  };

  const handleSpeakQuestion = () => {
    soundEngine.playKeyClick();
    speechController.speak(
      currentQuestion,
      persona,
      () => setSpeechState('speaking'),
      () => setSpeechState('idle')
    );
  };

  const handleToggleMic = () => {
    soundEngine.playKeyClick();
    if (speechState === 'listening') {
      speechController.stopListening();
      setSpeechState('idle');
    } else {
      speechController.startListening(
        (interim) => {
          setInterimTranscript(interim);
        },
        (finalText) => {
          setInterimTranscript('');
          setTypedAnswer((prev) => (prev ? `${prev} ${finalText}` : finalText));
          setSpeechState('idle');
          toast.success('Speech captured!');
        },
        (errorMsg) => {
          toast.error(errorMsg);
          setSpeechState('idle');
        },
        (state) => {
          setSpeechState(state);
        }
      );
    }
  };

  const handleSubmitAnswer = async (answerText?: string) => {
    const finalAnswer = (answerText || typedAnswer || interimTranscript).trim();
    if (!finalAnswer) {
      toast.error('Please speak or type your answer before submitting.');
      return;
    }

    speechController.stopSpeaking();
    speechController.stopListening();
    soundEngine.playKeyClick();
    setIsEvaluating(true);
    setSpeechState('processing');

    try {
      const response = await fetch('/api/ai-viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category,
          experimentCode,
          governingTheory,
          persona,
          round: currentRound,
          totalRounds,
          studentAnswer: finalAnswer,
          currentQuestion,
          history,
        }),
      });

      const evalData: AIVivaResponse = await response.json();

      const newExchange: VivaExchange = {
        round: currentRound,
        question: currentQuestion,
        studentAnswer: finalAnswer,
        score: evalData.score,
        keyTermsUsed: evalData.keyTermsUsed,
        feedback: evalData.feedback,
      };

      setHistory((prev) => [...prev, newExchange]);
      setTypedAnswer('');
      setInterimTranscript('');
      setIsEvaluating(false);

      if (evalData.isFinal) {
        setFinalResult(evalData);
        setSpeechState('idle');
        toast.success('Examination Completed! Generating Grade Sheet...');
        if (!isAudioMuted) {
          speechController.speak(
            `Examination complete. Your overall score is ${evalData.score} out of 10. ${evalData.feedback}`,
            persona
          );
        }
      } else {
        setCurrentRound((prev) => prev + 1);
        setCurrentQuestion(evalData.nextQuestion);
        toast.info(`Round ${currentRound + 1}: Next question ready`);

        if (!isAudioMuted) {
          const spokenText = `${evalData.examinerCommentary} ${evalData.nextQuestion}`;
          speechController.speak(
            spokenText,
            persona,
            () => setSpeechState('speaking'),
            () => setSpeechState('idle')
          );
        } else {
          setSpeechState('idle');
        }
      }
    } catch (error) {
      console.error('Viva submit error:', error);
      setIsEvaluating(false);
      setSpeechState('idle');
      toast.error('Evaluation failed. Please try again.');
    }
  };

  const handleRestart = () => {
    soundEngine.playKeyClick();
    setCurrentRound(1);
    setCurrentQuestion(initialQuestion);
    setTypedAnswer('');
    setInterimTranscript('');
    setHistory([]);
    setFinalResult(null);
    setIsEvaluating(false);
    if (!isAudioMuted) {
      speechController.speak(
        initialQuestion,
        persona,
        () => setSpeechState('speaking'),
        () => setSpeechState('idle')
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-slate-950 border border-slate-800 text-white p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <DialogHeader className="p-4 px-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                AICTE ORAL VIVA • {experimentCode}
              </Badge>
              <span className="text-[10px] font-mono text-slate-400">
                Round {currentRound} of {totalRounds}
              </span>
            </div>
            <DialogTitle className="text-base font-black text-white mt-0.5 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
              {topic}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            {/* Persona Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
              <button
                onClick={() => {
                  setPersona('strict');
                  soundEngine.playKeyClick();
                }}
                className={`px-2 py-1 rounded transition-all ${
                  persona === 'strict'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dr. Sharma (Strict)
              </button>
              <button
                onClick={() => {
                  setPersona('supportive');
                  soundEngine.playKeyClick();
                }}
                className={`px-2 py-1 rounded transition-all ${
                  persona === 'supportive'
                    ? 'bg-purple-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Prof. Sarah (Supportive)
              </button>
            </div>

            {/* Mute Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className={`h-8 w-8 p-0 border-slate-800 bg-slate-900 ${
                isAudioMuted ? 'text-slate-500' : 'text-emerald-400 border-emerald-500/40'
              }`}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {finalResult ? (
            /* End-of-Viva Grade Sheet */
            <VivaReportCard
              topic={topic}
              category={category}
              experimentCode={experimentCode}
              studentName={studentName}
              rollNo={rollNo}
              persona={persona}
              finalResult={finalResult}
              history={history}
              onRestart={handleRestart}
            />
          ) : (
            /* Active Oral Exam Booth */
            <>
              {/* Audio Waveform Canvas */}
              <VivaAudioVisualizer state={speechState} persona={persona} />

              {/* Examiner's Question Card */}
              <Card className="bg-slate-900/90 border-cyan-500/30 text-white shadow-lg overflow-hidden">
                <CardHeader className="py-2.5 px-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {persona === 'strict'
                        ? 'Dr. R. K. Sharma (External Examiner)'
                        : 'Prof. Sarah Chen (Research Guide)'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSpeakQuestion}
                    className="h-6 px-2 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    <Volume2 className="h-3 w-3 mr-1" /> Replay Audio
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">
                    QUESTION {currentRound} OF {totalRounds}
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {currentQuestion}
                  </p>
                </CardContent>
              </Card>

              {/* Student Speech-to-Text & Input Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-cyan-400" />
                    Your Answer (Speak into microphone or type below):
                  </label>
                  {interimTranscript && (
                    <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                      Live Transcribing...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Textarea
                    value={typedAnswer || interimTranscript}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Click the microphone to speak, or type your technical answer here..."
                    className="min-h-[90px] text-xs bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-400 font-mono pr-28"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    {/* Push-to-Talk Mic Button */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleToggleMic}
                      className={`h-8 px-2.5 text-xs font-mono font-bold transition-all ${
                        speechState === 'listening'
                          ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : 'bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white'
                      }`}
                    >
                      {speechState === 'listening' ? (
                        <>
                          <MicOff className="h-3.5 w-3.5 mr-1" /> Stop Mic
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 mr-1 text-cyan-400" /> Mic Input
                        </>
                      )}
                    </Button>

                    {/* Submit Answer Button */}
                    <Button
                      type="button"
                      size="sm"
                      disabled={isEvaluating}
                      onClick={() => handleSubmitAnswer()}
                      className="h-8 px-3 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-mono"
                    >
                      {isEvaluating ? (
                        'Evaluating...'
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1" /> Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Transcript & Rubric Review */}
              {history.length > 0 && (
                <div
                  ref={transcriptScrollRef}
                  className="space-y-3 pt-4 border-t border-slate-800 max-h-[160px] overflow-y-auto"
                >
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                    Session Transcript & Scores
                  </span>
                  {history.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Q{h.round}: {h.question}</span>
                        <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px]">
                          {h.score} / 10
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-[11px] pl-2 border-l border-slate-700">
                        {h.studentAnswer}
                      </p>
                      <p className="text-amber-300/90 text-[10px] leading-relaxed">
                        <strong>Feedback:</strong> {h.feedback}
                      </p>
                      {h.keyTermsUsed && h.keyTermsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {h.keyTermsUsed.map((term, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[9px]"
                            >
                              ✓ {term}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
