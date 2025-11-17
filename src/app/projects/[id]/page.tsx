'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Eye, Heart, Star, Share2, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProjectStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  instructions: string;
  estimatedDuration: string | null;
}

interface Project {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  authorName: string;
  viewsCount: number;
  likesCount: number;
  ratingAverage: number;
  ratingCount: number;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    incrementViewCount();
  }, [resolvedParams.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${resolvedParams.id}`);
      const data = await response.json();
      setProject(data.project);
      setSteps(data.steps || []);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/projects/${resolvedParams.id}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handleLike = async () => {
    try {
      await fetch(`/api/projects/${resolvedParams.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo_user' }),
      });
      if (project) {
        setProject({ ...project, likesCount: project.likesCount + 1 });
      }
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  const toggleStepComplete = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  const progress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9C4AFF]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
          <Button onClick={() => router.push('/projects')} className="gradient-fire text-white">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen gradient-depth">
      <Header 
        onSearch={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/projects')}
          className="mb-6 text-[#B8A7E0] hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <Card className="glass-surface border-white/10 mb-6">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-white mb-2">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-[#B8A7E0] text-lg">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-[#B8A7E0]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{project.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.viewsCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{project.likesCount} likes</span>
                  </div>
                  {project.ratingCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                      <span>{project.ratingAverage.toFixed(1)} ({project.ratingCount})</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-[#B8A7E0] mb-2">
                    <span>Your Progress</span>
                    <span>{completedSteps.size} / {steps.length} steps completed</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
            </Card>

            {/* Steps Content */}
            <Card className="glass-surface border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Step {currentStep + 1}: {currentStepData?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-[#B8A7E0] whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: currentStepData?.instructions || '' }}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    onClick={() => toggleStepComplete(currentStepData?.stepNumber)}
                    className={`${
                      completedSteps.has(currentStepData?.stepNumber)
                        ? 'gradient-aqua'
                        : 'gradient-fire'
                    } text-white`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {completedSteps.has(currentStepData?.stepNumber) ? 'Completed' : 'Mark as Complete'}
                  </Button>

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Previous
                      </Button>
                    )}
                    {currentStep < steps.length - 1 && (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="gradient-violet text-white"
                      >
                        Next Step
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-surface border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Project Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.stepNumber);
                    const isCurrent = index === currentStep;

                    return (
                      <motion.div
                        key={step.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setCurrentStep(index)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          isCurrent
                            ? 'gradient-violet text-white'
                            : isCompleted
                            ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]'
                            : 'glass-surface border border-white/10 text-[#B8A7E0] hover:border-[#9C4AFF]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                            <span className="text-sm font-medium">{step.title}</span>
                          </div>
                          {isCurrent && <ChevronRight className="h-4 w-4" />}
                        </div>
                        {step.estimatedDuration && (
                          <p className="text-xs mt-1 ml-6 opacity-70">
                            {step.estimatedDuration}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
