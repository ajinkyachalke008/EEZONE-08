'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableProperties } from 'lucide-react';

export const PanelScheduleBuilder = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">Panel Schedule Builder</h2>
        <p className="text-gray-600">
          Create professional electrical panel schedules quickly
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableProperties className="h-5 w-5 text-[#00C2D1]" />
            Panel Schedule Designer
          </CardTitle>
          <CardDescription>
            Drag-and-drop panel builder coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center">
            <p className="text-gray-500">Panel schedule builder in development...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
