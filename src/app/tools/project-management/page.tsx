'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Clock, Calendar, ClipboardList, TrendingUp } from 'lucide-react';
import { MaterialCostEstimator } from '@/components/tools/material-cost-estimator';
import { LaborTimeCalculator } from '@/components/tools/labor-time-calculator';
import { ProjectTimelinePlanner } from '@/components/tools/project-timeline-planner';
import { BOMGenerator } from '@/components/tools/bom-generator';
import { VendorComparison } from '@/components/tools/vendor-comparison';

export default function ProjectManagementPage() {
  const [activeTab, setActiveTab] = useState('cost-estimator');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-3">
            📋 Project Management Suite
          </h1>
          <p className="text-lg text-gray-600">
            Professional tools for planning, estimation, and project execution
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-white">
            <TabsTrigger value="cost-estimator" className="flex items-center gap-2 py-3">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Cost Estimator</span>
              <span className="sm:hidden">Cost</span>
            </TabsTrigger>
            <TabsTrigger value="labor-calculator" className="flex items-center gap-2 py-3">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Labor Time</span>
              <span className="sm:hidden">Labor</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
              <span className="sm:hidden">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="bom" className="flex items-center gap-2 py-3">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">BOM Generator</span>
              <span className="sm:hidden">BOM</span>
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2 py-3">
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
