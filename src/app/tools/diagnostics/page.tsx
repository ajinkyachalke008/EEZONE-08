'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, BarChart, Gauge, Thermometer } from 'lucide-react';
import { MaintenanceScheduler } from '@/components/tools/maintenance-scheduler';
import { TestReportGenerator } from '@/components/tools/test-report-generator';
import { LoadProfileAnalyzer } from '@/components/tools/load-profile-analyzer';
import { PowerQualityReporter } from '@/components/tools/power-quality-reporter';
import { ThermalImagingTool } from '@/components/tools/thermal-imaging-tool';

export default function DiagnosticsPage() {
  const [activeTab, setActiveTab] = useState('scheduler');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-3">
            🔧 Diagnostic & Testing Tools
          </h1>
          <p className="text-lg text-gray-600">
            Equipment maintenance, analysis, and reporting solutions
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-white">
            <TabsTrigger value="scheduler" className="flex items-center gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
              <span className="sm:hidden">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="test-reports" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Test Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="load-analyzer" className="flex items-center gap-2 py-3">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Load Analysis</span>
              <span className="sm:hidden">Load</span>
            </TabsTrigger>
            <TabsTrigger value="power-quality" className="flex items-center gap-2 py-3">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Power Quality</span>
              <span className="sm:hidden">Quality</span>
            </TabsTrigger>
            <TabsTrigger value="thermal" className="flex items-center gap-2 py-3">
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
