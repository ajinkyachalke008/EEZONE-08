'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export const LightingDesignTool = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">Lighting Design Tool</h2>
        <p className="text-gray-600">
          Plan and calculate lighting layouts for optimal illumination
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#00C2D1]" />
            Lighting Layout Designer
          </CardTitle>
          <CardDescription>
            Professional lighting design tool coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center">
            <p className="text-gray-500">Lighting design tool in development...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
