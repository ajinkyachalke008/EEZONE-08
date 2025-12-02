'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Clock, Calendar, ClipboardList, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MaterialCostEstimator } from '@/components/tools/material-cost-estimator';
import { LaborTimeCalculator } from '@/components/tools/labor-time-calculator';
import { ProjectTimelinePlanner } from '@/components/tools/project-timeline-planner';
import { BOMGenerator } from '@/components/tools/bom-generator';
import { VendorComparison } from '@/components/tools/vendor-comparison';

export default function ProjectManagementPage() {
  const [activeTab, setActiveTab] = useState('cost-estimator');

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/2 w-[300px] h-[300px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '4s' }} />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <Link href="/">
          <Button variant="outline" className="mb-6 glass-surface border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Calculator className="h-12 w-12 text-[#9C4AFF] glow-text-violet" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              📋 Project Management Suite
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Professional tools for planning, estimation, and project execution
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 glass-surface backdrop-blur-glass border border-white/10">
            <TabsTrigger 
              value="cost-estimator" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Cost Estimator</span>
              <span className="sm:hidden">Cost</span>
            </TabsTrigger>
            <TabsTrigger 
              value="labor-calculator" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Labor Time</span>
              <span className="sm:hidden">Labor</span>
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
              <span className="sm:hidden">Timeline</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bom" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">BOM Generator</span>
              <span className="sm:hidden">BOM</span>
            </TabsTrigger>
            <TabsTrigger 
              value="vendor" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Vendor Compare</span>
              <span className="sm:hidden">Vendor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cost-estimator">
            <MaterialCostEstimator />
          </TabsContent>

          <TabsContent value="labor-calculator">
            <LaborTimeCalculator />
          </TabsContent>

          <TabsContent value="timeline">
            <ProjectTimelinePlanner />
          </TabsContent>

          <TabsContent value="bom">
            <BOMGenerator />
          </TabsContent>

          <TabsContent value="vendor">
            <VendorComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}