'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  Mic,
  Brain,
  Sparkles,
  Award,
  Zap,
  Volume2,
  CheckCircle2,
  GraduationCap,
  Shield,
  Clock,
  ArrowRight,
  UserCheck,
  Radio,
  FileCheck2,
  Flame,
  Layers,
  Cpu,
  Activity,
  Play
} from 'lucide-react';
import { AIVivaExaminerDialog } from '@/components/viva/ai-viva-examiner-dialog';

interface CareerVivaTrack {
  id: string;
  title: string;
  category: string;
  badge: string;
  color: 'violet' | 'orange' | 'cyan' | 'green';
  icon: any;
  description: string;
  rounds: number;
  initialQuestion: string;
  governingTheory: string;
  sampleKeywords: string[];
}

const careerVivaTracks: CareerVivaTrack[] = [
  {
    id: 'fe-electrical',
    title: 'FE Electrical Fundamentals Viva',
    category: 'Licensure & Fundamentals',
    badge: 'FE Licensure',
    color: 'violet',
    icon: GraduationCap,
    description: 'Comprehensive technical defense spanning Circuit Theorems, 3-Phase Power, Op-Amps, and Digital Systems.',
    rounds: 4,
    initialQuestion: 'Explain Thevenin and Norton equivalence theorems. Under what conditions do these models fail for nonlinear or time-varying networks?',
    governingTheory: 'Linear circuit analysis, open-circuit voltage Voc, short-circuit current Isc, maximum power transfer theorem (Rth = RL).',
    sampleKeywords: ['Thevenin', 'Norton', 'Impedance', 'Maximum Power', 'KVL', 'KCL', 'Linearity'],
  },
  {
    id: 'pe-power',
    title: 'PE Power Systems & Grid Viva',
    category: 'Power Engineering',
    badge: 'PE Power',
    color: 'orange',
    icon: Zap,
    description: 'High-level defense on Transmission line modeling, Fault Analysis, Transformer Losses, and Grid Protection.',
    rounds: 4,
    initialQuestion: 'How do you coordinate overcurrent and differential protection relays in a delta-wye substation transformer against inrush current?',
    governingTheory: 'Harmonic restraint (2nd harmonic detection), differential relaying (ANSI 87T), CT saturation, phase shift compensation (30-degree delta-star).',
    sampleKeywords: ['Differential Relay', 'Inrush Current', 'Harmonics', 'CT Saturation', 'Phase Shift', 'ANSI 87T'],
  },
  {
    id: 'electrician-safety',
    title: 'NEC & NFPA 70E Safety Interview',
    category: 'Safety & Codes',
    badge: 'Code Compliance',
    color: 'cyan',
    icon: Shield,
    description: 'Practical examination on Arc Flash boundaries, PPE categories, grounding electrode conductors, and load calculations.',
    rounds: 4,
    initialQuestion: 'Define the difference between equipment grounding and system bonding jumpers per NEC Article 250, and specify minimum sizing criteria.',
    governingTheory: 'NEC Article 250, effective ground-fault path, Table 250.66, Table 250.102(C)(1), fault current clearing time.',
    sampleKeywords: ['Grounding', 'Bonding', 'NEC 250', 'Arc Flash', 'Overcurrent', 'Fault Current'],
  },
  {
    id: 'analog-digital',
    title: 'Hardware & Circuit Design Defense',
    category: 'Electronics Engineering',
    badge: 'Hardware Design',
    color: 'violet',
    icon: Cpu,
    description: 'Rigorous technical questions on MOSFET switching losses, parasitic inductance, analog filtering, and signal integrity.',
    rounds: 4,
    initialQuestion: 'Analyze the trade-offs between slew rate, gain-bandwidth product, and phase margin when designing a closed-loop active op-amp filter.',
    governingTheory: 'Feedback stability, Barkhausen criterion, Miller compensation, poles and zeros, phase margin >= 45 degrees, slew rate limitation.',
    sampleKeywords: ['Phase Margin', 'Slew Rate', 'Gain-Bandwidth', 'Feedback', 'Stability', 'Miller Effect'],
  },
  {
    id: 'industrial-controls',
    title: 'Industrial Automation & PLC Viva',
    category: 'Controls & Drives',
    badge: 'Automation',
    color: 'orange',
    icon: Activity,
    description: 'Mock technical interview covering VFD scalar vs vector control, PLC scan cycles, PID loop tuning, and industrial fieldbuses.',
    rounds: 4,
    initialQuestion: 'Explain Field Oriented Control (FOC) in AC induction motors and compare its torque response with V/f scalar control.',
    governingTheory: 'Park and Clarke transformations, direct and quadrature axis currents (Id, Iq), decoupling flux and torque, encoder feedback.',
    sampleKeywords: ['Field Oriented Control', 'V/f Control', 'Clarke Transform', 'Torque Response', 'Inverter PWM', 'VFD'],
  },
  {
    id: 'ev-renewable',
    title: 'EV Powertrain & Battery Tech Viva',
    category: 'Clean Energy',
    badge: 'EV & Storage',
    color: 'green',
    icon: Flame,
    description: 'Technical evaluation on Lithium-ion BMS cell balancing, regenerative braking dynamics, and DC-DC converter topologies.',
    rounds: 4,
    initialQuestion: 'Describe the differences between passive vs active cell balancing in a 400V EV traction battery pack and their impact on thermal runaway risk.',
    governingTheory: 'State of Charge (SoC), State of Health (SoH), flyback/buck-boost active balancing, shunt resistor dissipation, thermal runaway threshold.',
    sampleKeywords: ['BMS', 'Cell Balancing', 'Thermal Runaway', 'State of Charge', 'Regenerative Braking', 'Inverter'],
  },
];

export function CareerVivaExaminer() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('fe-electrical');
  const [candidateName, setCandidateName] = useState<string>('Candidate');
  const [candidateId, setCandidateId] = useState<string>('EE-2026-ENG');
  const [persona, setPersona] = useState<'strict' | 'supportive'>('strict');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const selectedTrack = careerVivaTracks.find(t => t.id === selectedTrackId) || careerVivaTracks[0];

  const handleLaunchExam = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <Card className="glass-surface border-2 border-[#9C4AFF]/30 overflow-hidden relative shadow-[0_0_40px_rgba(156,74,255,0.2)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00] opacity-10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9C4AFF] opacity-15 blur-[100px] rounded-full pointer-events-none" />
        
        <CardHeader className="relative z-10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl gradient-violet shadow-glowViolet flex items-center justify-center">
                <Mic className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="gradient-fire text-white border-0 text-xs px-2.5 py-0.5">
                    Live Audio AI Examiner
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-[#00E5FF] text-xs">
                    Speech-to-Text & Synthesis
                  </Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-white mt-1">
                  AI Technical Viva & Mock Interview Examiner
                </CardTitle>
              </div>
            </div>

            <Button
              onClick={handleLaunchExam}
              size="lg"
              className="gradient-fire hover:shadow-glowOrange text-white font-bold px-8 py-6 rounded-xl text-base group"
            >
              <Radio className="h-5 w-5 mr-2 text-white animate-pulse" />
              Start Live Viva Exam
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <CardDescription className="text-[#B8A7E0] text-base mt-2 max-w-4xl">
            Simulate real-world technical panel interviews and oral board examinations. Get real-time spoken questions, voice evaluation with speech recognition, multi-round technical follow-ups, and a signed performance assessment card with official scorecards.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration & Track Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Selection Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#9C4AFF]" />
              Select Examination Domain / Track
            </h3>
            <span className="text-xs text-[#B8A7E0]">{careerVivaTracks.length} Specialized Tracks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerVivaTracks.map((track) => {
              const isSelected = track.id === selectedTrackId;
              const IconComp = track.icon;
              return (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  <Card
                    className={`h-full transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? 'glass-surface border-2 border-[#9C4AFF] shadow-[0_0_25px_rgba(156,74,255,0.4)]'
                        : 'glass-surface border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#9C4AFF]/20 rounded-bl-full pointer-events-none" />
                    )}
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-xl ${
                          track.color === 'violet' ? 'gradient-violet' :
                          track.color === 'orange' ? 'gradient-fire' :
                          track.color === 'cyan' ? 'gradient-aqua' : 'bg-emerald-600'
                        } text-white`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <Badge className={`${
                          isSelected ? 'gradient-violet text-white' : 'glass-surface text-[#B8A7E0] border-white/20'
                        } text-xs`}>
                          {track.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg mt-2">{track.title}</CardTitle>
                      <CardDescription className="text-[#B8A7E0] text-xs line-clamp-2">
                        {track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {track.sampleKeywords.slice(0, 4).map((kw, i) => (
                          <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-[#00E5FF] px-2 py-0.5 rounded-md">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Candidate & Session Settings Column */}
        <div className="space-y-6">
          <Card className="glass-surface border-2 border-white/10 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#FF6B00]" />
                Candidate & Session Setup
              </CardTitle>
              <CardDescription className="text-[#B8A7E0] text-xs">
                Configure candidate credentials for your official Viva Report Card.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white text-xs">Candidate Full Name</Label>
                <Input
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white text-xs">Candidate / Licensure ID</Label>
                <Input
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="e.g. EE-2026-ENG"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white text-xs">Examiner Panel Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPersona('strict')}
                    className={`h-11 text-xs justify-start px-3 ${
                      persona === 'strict'
                        ? 'gradient-violet text-white border-transparent shadow-glowViolet'
                        : 'border-white/20 text-[#B8A7E0] hover:bg-white/10'
                    }`}
                  >
                    <Flame className="h-4 w-4 mr-1.5 text-amber-300" />
                    Strict Board
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPersona('supportive')}
                    className={`h-11 text-xs justify-start px-3 ${
                      persona === 'supportive'
                        ? 'gradient-aqua text-white border-transparent shadow-glowCyan'
                        : 'border-white/20 text-[#B8A7E0] hover:bg-white/10'
                    }`}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-cyan-300" />
                    Supportive Mentor
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5 text-[#B8A7E0]">
                <div className="flex items-center justify-between text-white font-medium">
                  <span>Examination Rounds:</span>
                  <span className="text-[#00E5FF]">4 Progressive Rounds</span>
                </div>
                <div className="flex items-center justify-between text-white font-medium">
                  <span>Voice Interaction:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> Active (Speech API)
                  </span>
                </div>
                <div className="flex items-center justify-between text-white font-medium">
                  <span>Rubric Scoring:</span>
                  <span className="text-[#FF6B00]">Technical / Terms / Logic</span>
                </div>
              </div>

              <Button
                onClick={handleLaunchExam}
                className="w-full gradient-fire hover:shadow-glowOrange text-white font-bold py-6 rounded-xl text-base"
              >
                <Mic className="h-5 w-5 mr-2" />
                Launch {selectedTrack.badge} Viva
              </Button>
            </CardContent>
          </Card>

          {/* Evaluation Rubric Breakdown Card */}
          <Card className="glass-surface border border-white/10 p-4 space-y-3">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#00E5FF]" />
              Evaluation Rubric Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-white">
                <span>Technical Accuracy</span>
                <span className="font-bold text-[#9C4AFF]">5.0 Points</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="gradient-violet h-full w-[50%]" />
              </div>

              <div className="flex justify-between items-center text-white pt-1">
                <span>Engineering Terminology</span>
                <span className="font-bold text-[#00E5FF]">3.0 Points</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="gradient-aqua h-full w-[30%]" />
              </div>

              <div className="flex justify-between items-center text-white pt-1">
                <span>Conceptual Reasoning</span>
                <span className="font-bold text-[#FF6B00]">2.0 Points</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="gradient-fire h-full w-[20%]" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Selected Track Preview & Opening Question Card */}
      <Card className="glass-surface border-2 border-[#00E5FF]/30 p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="gradient-violet text-white">{selectedTrack.category}</Badge>
              <span className="text-white font-semibold text-lg">{selectedTrack.title}</span>
            </div>
            <p className="text-[#B8A7E0] text-sm">
              <span className="text-white font-medium">Round 1 Question Preview: </span>
              &ldquo;{selectedTrack.initialQuestion}&rdquo;
            </p>
          </div>

          <Button
            onClick={handleLaunchExam}
            className="gradient-aqua hover:shadow-glowCyan text-white font-semibold rounded-xl px-6 whitespace-nowrap"
          >
            <Play className="h-4 w-4 mr-2" />
            Begin Defense Now
          </Button>
        </div>
      </Card>

      {/* The AI Viva Examiner Interactive Dialog */}
      <AIVivaExaminerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        topic={selectedTrack.title}
        category={selectedTrack.category}
        experimentCode={selectedTrack.badge}
        governingTheory={selectedTrack.governingTheory}
        initialQuestion={selectedTrack.initialQuestion}
        studentName={candidateName}
        rollNo={candidateId}
      />
    </div>
  );
}
