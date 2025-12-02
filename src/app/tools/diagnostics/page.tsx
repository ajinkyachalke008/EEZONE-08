'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, BarChart, Gauge, Thermometer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MaintenanceScheduler } from '@/components/tools/maintenance-scheduler';
import { TestReportGenerator } from '@/components/tools/test-report-generator';
import { LoadProfileAnalyzer } from '@/components/tools/load-profile-analyzer';
import { PowerQualityReporter } from '@/components/tools/power-quality-reporter';
import { ThermalImagingTool } from '@/components/tools/thermal-imaging-tool';

export default function DiagnosticsPage() {
  const [activeTab, setActiveTab] = useState('scheduler');

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-10 left-1/2 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />
      
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
              <Gauge className="h-12 w-12 text-[#FF6B00] glow-text-orange" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🔧 Diagnostic & Testing Tools
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Equipment maintenance, analysis, and reporting solutions
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 glass-surface backdrop-blur-glass border border-white/10">
            <TabsTrigger 
              value="scheduler" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
              <span className="sm:hidden">Schedule</span>
            </TabsTrigger>
            <TabsTrigger 
              value="test-reports" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Test Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
            <TabsTrigger 
              value="load-analyzer" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Load Analysis</span>
              <span className="sm:hidden">Load</span>
            </TabsTrigger>
            <TabsTrigger 
              value="power-quality" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Power Quality</span>
              <span className="sm:hidden">Quality</span>
            </TabsTrigger>
            <TabsTrigger 
              value="thermal" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Thermometer className="h-4 w-4" />
              <span className="hidden sm:inline">Thermal</span>
              <span className="sm:hidden">Heat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduler">
            <MaintenanceScheduler />
          </TabsContent>

          <TabsContent value="test-reports">
            <TestReportGenerator />
          </TabsContent>

          <TabsContent value="load-analyzer">
            <LoadProfileAnalyzer />
          </TabsContent>

          <TabsContent value="power-quality">
            <PowerQualityReporter />
          </TabsContent>

          <TabsContent value="thermal">
            <ThermalImagingTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}