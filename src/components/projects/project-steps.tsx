'use client';

import { CheckCircle, Calculator, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProjectStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  calculatorLink?: string | null;
}

interface ProjectStepsProps {
  steps: ProjectStep[];
}

export function ProjectSteps({ steps }: ProjectStepsProps) {
  if (steps.length === 0) {
    return (
      <Card className="glass-surface border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-[#B8A7E0]">No steps available for this project yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 transition-all">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full gradient-violet flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.stepNumber}</span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-[#00E5FF]" />
                      {step.title}
                    </h3>
                    <p className="text-[#B8A7E0] leading-relaxed">{step.description}</p>
                  </div>

                  {/* Step Image */}
                  {step.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={step.imageUrl}
                        alt={step.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Calculator Link */}
                  {step.calculatorLink && (
                    <div className="pt-2">
                      <Link href={step.calculatorLink}>
                        <Button className="gradient-aqua hover:shadow-glowCyan text-white">
                          <Calculator className="h-4 w-4 mr-2" />
                          Use Calculator for This Step
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
