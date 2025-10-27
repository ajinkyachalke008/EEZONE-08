'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, CircuitBoard, Wrench, Mic, Globe } from 'lucide-react';
import { AICodeAssistant } from '@/components/tools/ai-code-assistant';
import { AICircuitDesigner } from '@/components/tools/ai-circuit-designer';
import { AITroubleshooting } from '@/components/tools/ai-troubleshooting';
import { VoiceInput } from '@/components/tools/voice-input';
import { MultiLanguageSupport } from '@/components/tools/multi-language-support';

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState('code-assistant');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-3">
            ✨ Advanced AI Features
          </h1>
          <p className="text-lg text-gray-600">
            Leverage artificial intelligence for code assistance, design, and troubleshooting
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-white">
            <TabsTrigger value="code-assistant" className="flex items-center gap-2 py-3">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Code Assistant</span>
              <span className="sm:hidden">Code</span>
            </TabsTrigger>
            <TabsTrigger value="circuit-designer" className="flex items-center gap-2 py-3">
              <CircuitBoard className="h-4 w-4" />
              <span className="hidden sm:inline">Circuit Designer</span>
              <span className="sm:hidden">Circuit</span>
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center gap-2 py-3">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Troubleshooting</span>
              <span className="sm:hidden">Debug</span>
            </TabsTrigger>
            <TabsTrigger value="voice-input" className="flex items-center gap-2 py-3">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice Input</span>
              <span className="sm:hidden">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="multi-language" className="flex items-center gap-2 py-3">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Multi-Language</span>
              <span className="sm:hidden">Lang</span>
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
        </Tabs>
      </div>
    </div>
  );
}
