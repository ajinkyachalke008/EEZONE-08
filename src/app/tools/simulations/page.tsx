'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, Box, PlayCircle, Shield, Smartphone } from 'lucide-react';
import { VirtualLabExperiments } from '@/components/tools/virtual-lab-experiments';
import { ThreeDInstallationViewer } from '@/components/tools/3d-installation-viewer';
import { AnimatedTheory } from '@/components/tools/animated-theory';
import { SafetyTraining } from '@/components/tools/safety-training';
import { ARCircuitOverlays } from '@/components/tools/ar-circuit-overlays';

export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState('virtual-lab');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-3">
            🎮 Interactive Simulations
          </h1>
          <p className="text-lg text-gray-600">
            Immersive and educational experiences for hands-on learning
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-white">
            <TabsTrigger value="virtual-lab" className="flex items-center gap-2 py-3">
              <Beaker className="h-4 w-4" />
              <span className="hidden sm:inline">Virtual Lab</span>
              <span className="sm:hidden">Lab</span>
            </TabsTrigger>
            <TabsTrigger value="3d-viewer" className="flex items-center gap-2 py-3">
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">3D Viewer</span>
              <span className="sm:hidden">3D</span>
            </TabsTrigger>
            <TabsTrigger value="animated-theory" className="flex items-center gap-2 py-3">
              <PlayCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Theory</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="safety-training" className="flex items-center gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Safety</span>
              <span className="sm:hidden">Safe</span>
            </TabsTrigger>
            <TabsTrigger value="ar-overlays" className="flex items-center gap-2 py-3">
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
