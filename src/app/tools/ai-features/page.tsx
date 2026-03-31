'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, CircuitBoard, Wrench, Mic, Globe, ArrowLeft, Sparkles, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AICodeAssistant } from '@/components/tools/ai-code-assistant';
import { AICircuitDesigner } from '@/components/tools/ai-circuit-designer';
import { AITroubleshooting } from '@/components/tools/ai-troubleshooting';
import { VoiceInput } from '@/components/tools/voice-input';
import { MultiLanguageSupport } from '@/components/tools/multi-language-support';
import { ProDiagramEditorDetails } from '@/components/tools/pro-diagram-editor-details';

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState('code-assistant');

  return (
    <div className="min-h-screen gradient-depth">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-violet opacity-30 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#FF00C8] opacity-25 blur-[150px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-25 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      
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
              <Sparkles className="h-12 w-12 text-[#FF00C8] glow-text-orange" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ✨ Advanced AI Features
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Leverage artificial intelligence for code assistance, design, and troubleshooting
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 glass-surface backdrop-blur-glass border border-white/10">
            <TabsTrigger 
              value="code-assistant" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Code Assistant</span>
              <span className="sm:hidden">Code</span>
            </TabsTrigger>
            <TabsTrigger 
              value="circuit-designer" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <CircuitBoard className="h-4 w-4" />
              <span className="hidden sm:inline">Circuit Designer</span>
              <span className="sm:hidden">Circuit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="troubleshooting" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Troubleshooting</span>
              <span className="sm:hidden">Debug</span>
            </TabsTrigger>
            <TabsTrigger 
              value="voice-input" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice Input</span>
              <span className="sm:hidden">Voice</span>
            </TabsTrigger>
            <TabsTrigger 
              value="multi-language" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Multi-Language</span>
              <span className="sm:hidden">Lang</span>
            </TabsTrigger>
            <TabsTrigger 
              value="diagram-editor" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <PenTool className="h-4 w-4" />
              <span className="hidden sm:inline">Diagram Editor</span>
              <span className="sm:hidden">Draw</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code-assistant">
            <AICodeAssistant />
          </TabsContent>

          <TabsContent value="circuit-designer">
            <AICircuitDesigner />
          </TabsContent>

          <TabsContent value="troubleshooting">
            <AITroubleshooting />
          </TabsContent>

          <TabsContent value="voice-input">
            <VoiceInput />
          </TabsContent>

          <TabsContent value="multi-language">
            <MultiLanguageSupport />
          </TabsContent>

          <TabsContent value="diagram-editor">
            <ProDiagramEditorDetails />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}