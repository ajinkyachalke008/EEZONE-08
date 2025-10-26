'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export const NECCodeReference = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">NEC Code Reference</h2>
        <p className="text-gray-600">
          Complete National Electrical Code database with search and bookmarks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#00C2D1]" />
            NEC Code Database
          </CardTitle>
          <CardDescription>
            Full searchable code reference coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center">
            <p className="text-gray-500">NEC code reference database in development...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
