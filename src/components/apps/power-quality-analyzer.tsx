'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export const PowerQualityAnalyzer = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">Power Quality Analyzer</h2>
        <p className="text-gray-600">
          Monitor and analyze power quality issues in real-time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#00C2D1]" />
            Power Quality Monitoring
          </CardTitle>
          <CardDescription>
            Real-time power quality analysis coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center">
            <p className="text-gray-500">Power quality analyzer in development...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
