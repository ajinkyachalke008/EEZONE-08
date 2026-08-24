'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, GraduationCap, ChevronLeft, ChevronRight, Star, StarOff,
  CheckCircle2, Zap, Battery, RotateCw, Activity, AlertTriangle,
  Cpu, Gauge, Cable, CircuitBoard, Plug, FileCheck, Lightbulb,
  Calculator, FileText, Brain, Beaker, HelpCircle, Loader2, Play,
  BookMarked, Clock, Target, TrendingUp, Mic
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AIVivaExaminerDialog } from '@/components/viva/ai-viva-examiner-dialog';

// Topic content data - Full 7-section structure
import { topicContent } from '@/lib/topic-content';

interface Topic {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
}

const iconMap: { [key: string]: any } = {
  Battery, RotateCw, Zap, Cable, CircuitBoard, Activity, Cpu, Plug, Gauge, FileCheck
};

const sectionIcons: { [key: string]: any } = {
  'concept-overview': Lightbulb,
  'key-formulas': Calculator,
  'worked-example': FileText,
  'typical-mistakes': AlertTriangle,
  'exam-corner': GraduationCap,
  'mcq-set': Brain,
  'lab-practical': Beaker,
};

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

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('concept-overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    fetchTopic();
    fetchProgress(id);
    fetchBookmarks(id);
  }, [slug]);

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/learn/topics/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTopic(data);
      } else {
        router.push('/learn');
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (uid: string) => {
    try {
      const res = await fetch(`/api/learn/progress/${uid}`);
      if (res.ok) {
        const data = await res.json();
        const topicProgress = data.find((p: any) => p.topic?.slug === slug);
        if (topicProgress) {
          const sections = JSON.parse(topicProgress.sectionsCompleted || '[]');
          setCompletedSections(sections);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchBookmarks = async (uid: string) => {
    try {
      const res = await fetch(`/api/learn/bookmarks/${uid}`);
      if (res.ok) {
        const data = await res.json();
        const bookmark = data.find((b: any) => b.contentType === 'topic' && topic?.id && b.contentId === topic.id);
        if (bookmark) {
          setIsBookmarked(true);
          setBookmarkId(bookmark.id);
        }
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleSectionComplete = async (sectionId: string) => {
    if (!topic || completedSections.includes(sectionId)) return;
    
    const newCompleted = [...completedSections, sectionId];
    setCompletedSections(newCompleted);
    
    const completionPercent = Math.round((newCompleted.length / 7) * 100);
    
    try {
      await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic_id: topic.id,
          section_completed: sectionId,
          completion_percent: completionPercent
        })
      });
      toast.success('Section marked complete!');
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!topic) return;
    
    try {
      if (isBookmarked && bookmarkId) {
        await fetch(`/api/learn/bookmarks?id=${bookmarkId}`, { method: 'DELETE' });
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success('Bookmark removed');
      } else {
        const res = await fetch('/api/learn/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            content_type: 'topic',
            content_id: topic.id
          })
        });
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(true);
          setBookmarkId(data.id);
          toast.success('Topic bookmarked!');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const content = topicContent[slug];
  const completionPercent = Math.round((completedSections.length / 7) * 100);

  const sections = [
    { id: 'concept-overview', name: 'Concept Overview', icon: Lightbulb },
    { id: 'key-formulas', name: 'Key Formulas', icon: Calculator },
    { id: 'worked-example', name: 'Worked Example', icon: FileText },
    { id: 'typical-mistakes', name: 'Typical Mistakes', icon: AlertTriangle },
    { id: 'exam-corner', name: 'Exam Corner', icon: GraduationCap },
    { id: 'mcq-set', name: 'MCQ Practice', icon: Brain },
    { id: 'lab-practical', name: 'Lab / Practical', icon: Beaker },
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C4AFF] mx-auto mb-4" />
          <p className="text-[#B8A7E0]">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic || !content) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <Card className="glass-surface border-white/10 max-w-md">
          <CardContent className="pt-6 text-center">
            <HelpCircle className="h-16 w-16 text-[#FF6B00] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Content Coming Soon</h2>
            <p className="text-[#B8A7E0] mb-4">
              Detailed content for this topic is being prepared. Check back soon!
            </p>
            <Link href="/learn">
              <Button className="gradient-violet">Back to Learning Hub</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TopicIcon = iconMap[topic.icon] || BookOpen;

  return (
    <div className="min-h-screen gradient-depth">
      {/* Header */}
      <section className="relative py-8 px-4 border-b border-white/10">
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
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 gradient-violet rounded-2xl">
                <TopicIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{topic.title}</h1>
                <p className="text-[#B8A7E0] text-sm mt-1">{topic.description.substring(0, 100)}...</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBookmark}
                className={`border-white/20 ${isBookmarked ? 'text-[#FF6B00] border-[#FF6B00]/50' : 'text-[#B8A7E0]'}`}
              >
                {isBookmarked ? <Star className="h-4 w-4 mr-1 fill-current" /> : <StarOff className="h-4 w-4 mr-1" />}
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              
              <Link href={`/learn/quiz?topic=${topic.id}`}>
                <Button className="gradient-fire hover:shadow-glowOrange">
                  <Brain className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#B8A7E0]">Your Progress</span>
              <span className="text-[#00E5FF]">{completionPercent}% Complete</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
            <p className="text-xs text-[#B8A7E0] mt-1">{completedSections.length} of 7 sections completed</p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="glass-surface border-white/10 sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-[#9C4AFF]" />
                    Sections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sections.map((section) => {
                    const isCompleted = completedSections.includes(section.id);
                    const isActive = activeSection === section.id;
                    const SectionIcon = section.icon;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          isActive 
                            ? 'bg-[#9C4AFF]/20 border border-[#9C4AFF]/50 text-white' 
                            : 'hover:bg-white/5 text-[#B8A7E0]'
                        }`}
                      >
                        <SectionIcon className={`h-5 w-5 ${isActive ? 'text-[#9C4AFF]' : ''}`} />
                        <span className="text-sm flex-1">{section.name}</span>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section 1: Concept Overview */}
                {activeSection === 'concept-overview' && content.conceptOverview && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#9C4AFF]/20 rounded-lg">
                          <Lightbulb className="h-6 w-6 text-[#9C4AFF]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Concept Overview</CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            Understanding the fundamentals
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none">
                      <div className="space-y-4 text-[#E0D6F5]">
                        {content.conceptOverview.paragraphs.map((para: string, idx: number) => (
                          <p key={idx} className="leading-relaxed">{para}</p>
                        ))}
                        
                        {content.conceptOverview.realWorldApplications && (
                          <div className="mt-6 p-4 glass-surface border border-[#00E5FF]/30 rounded-xl">
                            <h4 className="text-[#00E5FF] font-semibold mb-3 flex items-center gap-2">
                              <Zap className="h-5 w-5" />
                              Real-World Applications
                            </h4>
                            <ul className="space-y-2">
                              {content.conceptOverview.realWorldApplications.map((app: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-[#00E5FF] mt-1 flex-shrink-0" />
                                  <span>{app}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('concept-overview')}
                        disabled={completedSections.includes('concept-overview')}
                        className={completedSections.includes('concept-overview') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-violet hover:shadow-glowViolet'}
                      >
                        {completedSections.includes('concept-overview') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Section 2: Key Formulas */}
                {activeSection === 'key-formulas' && content.keyFormulas && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF6B00]/20 rounded-lg">
                          <Calculator className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Key Formulas and Meaning</CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            Essential equations for exams and design
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {content.keyFormulas.map((formula: any, idx: number) => (
                          <div key={idx} className="p-4 glass-surface border border-white/10 rounded-xl">
                            <div className="text-center mb-4 p-4 bg-[#0A0014] rounded-lg">
                              <code className="text-2xl text-[#00E5FF] font-mono">{formula.equation}</code>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-[#9C4AFF] font-semibold text-sm mb-2">Symbol Meanings:</h4>
                                <ul className="text-[#E0D6F5] text-sm space-y-1">
                                  {formula.symbols.map((sym: string, i: number) => (
                                    <li key={i}>• {sym}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-[#FF6B00] font-semibold text-sm mb-1">When to Use:</h4>
                                <p className="text-[#B8A7E0] text-sm">{formula.usage}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('key-formulas')}
                        disabled={completedSections.includes('key-formulas')}
                        className={completedSections.includes('key-formulas') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-fire hover:shadow-glowOrange'}
                      >
                        {completedSections.includes('key-formulas') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Section 3: Worked Example */}
                {activeSection === 'worked-example' && content.workedExample && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00E5FF]/20 rounded-lg">
                          <FileText className="h-6 w-6 text-[#00E5FF]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Worked Design Example</CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            Step-by-step numerical problem solution
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Problem Statement */}
                        <div className="p-4 bg-[#9C4AFF]/10 border border-[#9C4AFF]/30 rounded-xl">
                          <h4 className="text-[#9C4AFF] font-semibold mb-2">Problem Statement:</h4>
                          <p className="text-[#E0D6F5]">{content.workedExample.problem}</p>
                        </div>

                        {/* Given Data */}
                        <div className="p-4 glass-surface border border-white/10 rounded-xl">
                          <h4 className="text-[#00E5FF] font-semibold mb-3">1. Given Data:</h4>
                          <ul className="text-[#E0D6F5] space-y-1">
                            {content.workedExample.givenData.map((data: string, idx: number) => (
                              <li key={idx}>• {data}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Required */}
                        <div className="p-4 glass-surface border border-white/10 rounded-xl">
                          <h4 className="text-[#FF6B00] font-semibold mb-2">2. Required:</h4>
                          <p className="text-[#E0D6F5]">{content.workedExample.required}</p>
                        </div>

                        {/* Solution Steps */}
                        <div className="p-4 glass-surface border border-white/10 rounded-xl">
                          <h4 className="text-[#9C4AFF] font-semibold mb-4">3. Solution:</h4>
                          <div className="space-y-4">
                            {content.workedExample.steps.map((step: any, idx: number) => (
                              <div key={idx} className="border-l-2 border-[#9C4AFF] pl-4">
                                <p className="text-[#00E5FF] font-medium mb-1">Step {idx + 1}: {step.title}</p>
                                <p className="text-[#E0D6F5] text-sm mb-2">{step.explanation}</p>
                                {step.calculation && (
                                  <code className="block bg-[#0A0014] p-3 rounded text-[#00E5FF] text-sm font-mono">
                                    {step.calculation}
                                  </code>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Final Answer */}
                        <div className="p-4 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl">
                          <h4 className="text-[#00E5FF] font-semibold mb-2">4. Final Answer:</h4>
                          <p className="text-[#E0D6F5] font-medium">{content.workedExample.finalAnswer}</p>
                          {content.workedExample.interpretation && (
                            <p className="text-[#B8A7E0] text-sm mt-2 italic">{content.workedExample.interpretation}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('worked-example')}
                        disabled={completedSections.includes('worked-example')}
                        className={completedSections.includes('worked-example') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-aqua hover:shadow-glowCyan'}
                      >
                        {completedSections.includes('worked-example') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Section 4: Typical Mistakes */}
                {activeSection === 'typical-mistakes' && content.typicalMistakes && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FF6B00]/20 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Typical Mistakes</CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            Common errors to avoid in exams and practice
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {content.typicalMistakes.map((mistake: any, idx: number) => (
                          <div key={idx} className="p-4 glass-surface border border-[#FF6B00]/20 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                                <span className="text-red-400 font-bold">✗</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-red-400 font-semibold mb-2">Mistake: {mistake.mistake}</h4>
                                <div className="flex items-start gap-2 mt-3">
                                  <CheckCircle2 className="h-5 w-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                                  <p className="text-[#00E5FF]"><span className="font-semibold">Fix:</span> {mistake.fix}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('typical-mistakes')}
                        disabled={completedSections.includes('typical-mistakes')}
                        className={completedSections.includes('typical-mistakes') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-fire hover:shadow-glowOrange'}
                      >
                        {completedSections.includes('typical-mistakes') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Section 5: Exam Corner */}
                {activeSection === 'exam-corner' && content.examCorner && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#9C4AFF]/20 rounded-lg">
                          <GraduationCap className="h-6 w-6 text-[#9C4AFF]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">Exam Corner (5M / 10M Style)</CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            Exam-ready questions and structured answers
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="long" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 glass-surface">
                          <TabsTrigger value="long" className="data-[state=active]:bg-[#9C4AFF]/30">
                            Long Answers (5-10M)
                          </TabsTrigger>
                          <TabsTrigger value="short" className="data-[state=active]:bg-[#9C4AFF]/30">
                            Short Answers (2-3M)
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="long" className="space-y-6 mt-4">
                          {content.examCorner.longAnswers.map((qa: any, idx: number) => (
                            <div key={idx} className="p-4 glass-surface border border-[#9C4AFF]/30 rounded-xl">
                              <Badge className="mb-3 bg-[#9C4AFF]/20 text-[#9C4AFF]">
                                {qa.marks} Marks
                              </Badge>
                              <h4 className="text-white font-semibold mb-4">Q{idx + 1}: {qa.question}</h4>
                              <div className="text-[#E0D6F5] space-y-3 pl-4 border-l-2 border-[#9C4AFF]/50">
                                <p className="italic text-[#B8A7E0]">{qa.intro}</p>
                                <ul className="space-y-2">
                                  {qa.points.map((point: string, i: number) => (
                                    <li key={i}>• {point}</li>
                                  ))}
                                </ul>
                                {qa.conclusion && (
                                  <p className="italic text-[#B8A7E0]">{qa.conclusion}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                        
                        <TabsContent value="short" className="space-y-4 mt-4">
                          {content.examCorner.shortAnswers.map((qa: any, idx: number) => (
                            <div key={idx} className="p-4 glass-surface border border-white/10 rounded-xl">
                              <h4 className="text-white font-semibold mb-2">Q{idx + 1}: {qa.question}</h4>
                              <p className="text-[#E0D6F5] text-sm">{qa.answer}</p>
                              {qa.keyTerms && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  {qa.keyTerms.map((term: string, i: number) => (
                                    <Badge key={i} className="bg-[#00E5FF]/20 text-[#00E5FF] text-xs">
                                      {term}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('exam-corner')}
                        disabled={completedSections.includes('exam-corner')}
                        className={completedSections.includes('exam-corner') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-violet hover:shadow-glowViolet'}
                      >
                        {completedSections.includes('exam-corner') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Section 6: MCQ Practice */}
                {activeSection === 'mcq-set' && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00E5FF]/20 rounded-lg">
                          <Brain className="h-6 w-6 text-[#00E5FF]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">MCQ Practice Set</CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            Test your understanding with multiple choice questions
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <Brain className="h-20 w-20 text-[#00E5FF] mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-bold text-white mb-2">Ready to Test Your Knowledge?</h3>
                      <p className="text-[#B8A7E0] mb-6 max-w-md mx-auto">
                        Take a quiz focused on this topic. The system will track your performance and help identify weak areas.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href={`/learn/quiz?topic=${topic?.id}`}>
                          <Button className="gradient-aqua hover:shadow-glowCyan">
                            <Play className="h-4 w-4 mr-2" />
                            Start Topic Quiz (10 Questions)
                          </Button>
                        </Link>
                        <Link href="/learn/quiz">
                          <Button variant="outline" className="border-white/20 text-[#B8A7E0] hover:text-white">
                            Mixed Topics Quiz
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('mcq-set')}
                        disabled={completedSections.includes('mcq-set')}
                        className={completedSections.includes('mcq-set') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-aqua hover:shadow-glowCyan'}
                      >
                        {completedSections.includes('mcq-set') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Section 7: Lab / Practical */}
                {activeSection === 'lab-practical' && content.labPractical && (
                  <Card className="glass-surface border-white/10">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#FF6B00]/20 rounded-xl">
                            <Beaker className="h-6 w-6 text-[#FF6B00]" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-xl flex items-center gap-2">
                              Lab / Practical Insight & Hands-On Manual
                            </CardTitle>
                            <CardDescription className="text-[#B8A7E0]">
                              Connect theoretical formulations to hands-on bench experiments and viva preparation
                            </CardDescription>
                          </div>
                        </div>

                        {content.labPractical.virtualLabLink && (
                          <Link href={content.labPractical.virtualLabLink.url}>
                            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg">
                              <Zap className="h-3.5 w-3.5 mr-1 text-black" />
                              Launch {content.labPractical.virtualLabLink.toolName} &rarr;
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Safety Notes Alert */}
                      {content.labPractical.safetyNotes && content.labPractical.safetyNotes.length > 0 && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                          <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Crucial Safety & Protection Notes
                          </h4>
                          <ul className="text-[#E0D6F5] space-y-2 text-sm">
                            {content.labPractical.safetyNotes.map((note: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-400">⚠</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Apparatus Checklist */}
                      {content.labPractical.apparatus && content.labPractical.apparatus.length > 0 && (
                        <div className="p-4 glass-surface border border-[#9C4AFF]/30 rounded-xl">
                          <h4 className="text-[#9C4AFF] font-semibold mb-3 flex items-center gap-2">
                            <Cable className="h-5 w-5" />
                            Apparatus & Required Test Instruments
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-2 text-xs">
                            {content.labPractical.apparatus.map((item: string, idx: number) => (
                              <div key={idx} className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-[#9C4AFF]/20 text-[#9C4AFF] flex items-center justify-center text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Procedure */}
                      {content.labPractical.procedure && content.labPractical.procedure.length > 0 && (
                        <div className="p-4 glass-surface border border-white/10 rounded-xl">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-[#00E5FF]" />
                            Standard Experimental Procedure
                          </h4>
                          <div className="space-y-2 text-xs">
                            {content.labPractical.procedure.map((step: string, idx: number) => (
                              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-start gap-3 text-slate-200">
                                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-[#00E5FF] font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
                                  {idx + 1}
                                </span>
                                <p className="leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* What to Observe */}
                      {content.labPractical.observations && content.labPractical.observations.length > 0 && (
                        <div className="p-4 glass-surface border border-[#00E5FF]/30 rounded-xl">
                          <h4 className="text-[#00E5FF] font-semibold mb-3 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Key Observations & Data Logging Points
                          </h4>
                          <ul className="text-[#E0D6F5] space-y-2 text-sm">
                            {content.labPractical.observations.map((obs: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#00E5FF]">✦</span>
                                <span>{obs}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Viva Questions */}
                      {content.labPractical.vivaQuestions && content.labPractical.vivaQuestions.length > 0 && (
                        <div className="p-4 glass-surface border border-[#FF00C8]/30 rounded-xl space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-[#FF00C8] font-semibold flex items-center gap-2">
                              <HelpCircle className="h-5 w-5" />
                              Viva-Voce & Oral Examination Questions
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => setIsVivaModalOpen(true)}
                              className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs font-mono shadow-lg"
                            >
                              <Mic className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                              Start Live AI Viva (Voice & Chat) &rarr;
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {content.labPractical.vivaQuestions.map((vq: any, idx: number) => (
                              <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-lg space-y-1.5">
                                <p className="text-white font-medium text-sm flex items-center gap-2">
                                  <span className="text-[#FF00C8] font-bold">Q{idx + 1}:</span>
                                  {vq.question}
                                </p>
                                <p className="text-[#B8A7E0] text-xs pl-6 leading-relaxed font-mono">
                                  {vq.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSectionComplete('lab-practical')}
                        disabled={completedSections.includes('lab-practical')}
                        className={completedSections.includes('lab-practical') 
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]' 
                          : 'gradient-fire hover:shadow-glowOrange'}
                      >
                        {completedSections.includes('lab-practical') ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(sections[currentIndex - 1].id);
                      }
                    }}
                    disabled={activeSection === sections[0].id}
                    className="border-white/20 text-[#B8A7E0] hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Section
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex < sections.length - 1) {
                        setActiveSection(sections[currentIndex + 1].id);
                      }
                    }}
                    disabled={activeSection === sections[sections.length - 1].id}
                    className="gradient-violet hover:shadow-glowViolet"
                  >
                    Next Section
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Viva Voce Examiner Dialog */}
      <AIVivaExaminerDialog
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        topic={topic?.title || slug}
        category="Electrical Engineering"
        experimentCode={slug.toUpperCase()}
        initialQuestion={
          content?.labPractical?.vivaQuestions?.[0]?.question ||
          `Explain the foundational working principle and governing laws of ${topic?.title || slug}.`
        }
      />
    </div>
  );
}
