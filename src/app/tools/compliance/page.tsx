'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scale, FileText, MapPin, FileCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NECCodeSearch } from '@/components/tools/nec-code-search';
import { ComplianceChecker } from '@/components/tools/compliance-checker';
import { CodeChangeTracker } from '@/components/tools/code-change-tracker';
import { JurisdictionDatabase } from '@/components/tools/jurisdiction-database';
import { PermitAssistant } from '@/components/tools/permit-assistant';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('nec-search');

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
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
              <Scale className="h-12 w-12 text-[#00E5FF] glow-text-cyan" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ⚖️ Code Compliance Tools
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Ensure your designs meet electrical codes and standards
          </p>
        </motion.div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 glass-surface backdrop-blur-glass border border-white/10">
            <TabsTrigger 
              value="nec-search" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">NEC Search</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="compliance-checker" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Checker</span>
              <span className="sm:hidden">Check</span>
            </TabsTrigger>
            <TabsTrigger 
              value="change-tracker" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Changes</span>
              <span className="sm:hidden">Track</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jurisdiction" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Jurisdiction</span>
              <span className="sm:hidden">Local</span>
            </TabsTrigger>
            <TabsTrigger 
              value="permit" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]"
            >
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Permits</span>
              <span className="sm:hidden">Permit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nec-search">
            <NECCodeSearch />
          </TabsContent>

          <TabsContent value="compliance-checker">
            <ComplianceChecker />
          </TabsContent>

          <TabsContent value="change-tracker">
            <CodeChangeTracker />
          </TabsContent>

          <TabsContent value="jurisdiction">
            <JurisdictionDatabase />
          </TabsContent>

          <TabsContent value="permit">
            <PermitAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}