'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, Box, PlayCircle, Shield, Smartphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { VirtualLabExperiments } from '@/components/tools/virtual-lab-experiments';
import { ThreeDInstallationViewer } from '@/components/tools/3d-installation-viewer';
import { AnimatedTheory } from '@/components/tools/animated-theory';
import { SafetyTraining } from '@/components/tools/safety-training';
import { ARCircuitOverlays } from '@/components/tools/ar-circuit-overlays';

export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState('virtual-lab');

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full" />
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
              <Beaker className="h-12 w-12 text-[#00E5FF] glow-text-cyan" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🎮 Interactive Simulations
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Immersive and educational experiences for hands-on learning
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 glass-surface backdrop-blur-glass border border-white/10">
            <TabsTrigger 
              value="virtual-lab" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Beaker className="h-4 w-4" />
              <span className="hidden sm:inline">Virtual Lab</span>
              <span className="sm:hidden">Lab</span>
            </TabsTrigger>
            <TabsTrigger 
              value="3d-viewer" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">3D Viewer</span>
              <span className="sm:hidden">3D</span>
            </TabsTrigger>
            <TabsTrigger 
              value="animated-theory" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <PlayCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Theory</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
            <TabsTrigger 
              value="safety-training" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Safety</span>
              <span className="sm:hidden">Safe</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ar-overlays" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">AR Overlays</span>
              <span className="sm:hidden">AR</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="virtual-lab">
            <VirtualLabExperiments />
          </TabsContent>

          <TabsContent value="3d-viewer">
            <ThreeDInstallationViewer />
          </TabsContent>

          <TabsContent value="animated-theory">
            <AnimatedTheory />
          </TabsContent>

          <TabsContent value="safety-training">
            <SafetyTraining />
          </TabsContent>

          <TabsContent value="ar-overlays">
            <ARCircuitOverlays />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}