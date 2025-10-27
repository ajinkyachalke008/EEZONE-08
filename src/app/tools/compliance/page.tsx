'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scale, FileText, MapPin, FileCheck } from 'lucide-react';
import { NECCodeSearch } from '@/components/tools/nec-code-search';
import { ComplianceChecker } from '@/components/tools/compliance-checker';
import { CodeChangeTracker } from '@/components/tools/code-change-tracker';
import { JurisdictionDatabase } from '@/components/tools/jurisdiction-database';
import { PermitAssistant } from '@/components/tools/permit-assistant';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('nec-search');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-3">
            ⚖️ Code Compliance Tools
          </h1>
          <p className="text-lg text-gray-600">
            Ensure your designs meet electrical codes and standards
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-white">
            <TabsTrigger value="nec-search" className="flex items-center gap-2 py-3">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">NEC Search</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="compliance-checker" className="flex items-center gap-2 py-3">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Checker</span>
              <span className="sm:hidden">Check</span>
            </TabsTrigger>
            <TabsTrigger value="change-tracker" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Changes</span>
              <span className="sm:hidden">Track</span>
            </TabsTrigger>
            <TabsTrigger value="jurisdiction" className="flex items-center gap-2 py-3">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Jurisdiction</span>
              <span className="sm:hidden">Local</span>
            </TabsTrigger>
            <TabsTrigger value="permit" className="flex items-center gap-2 py-3">
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
