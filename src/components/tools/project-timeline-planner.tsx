'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Trash2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[];
}

const statusColors = {
  'pending': 'bg-gray-200 text-gray-700',
  'in-progress': 'bg-blue-200 text-blue-700',
  'completed': 'bg-green-200 text-green-700'
};

const commonPhases = [
  { name: 'Design & Planning', duration: 5 },
  { name: 'Permits & Approvals', duration: 10 },
  { name: 'Material Procurement', duration: 7 },
  { name: 'Site Preparation', duration: 3 },
  { name: 'Rough-in Installation', duration: 15 },
  { name: 'Trim & Finish', duration: 10 },
  { name: 'Testing & Inspection', duration: 5 },
  { name: 'Final Walkthrough', duration: 2 }
];

export function ProjectTimelinePlanner() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectStart, setProjectStart] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [newPhase, setNewPhase] = useState({
    name: '',
    duration: 1
  });

  const calculateEndDate = (startDate: string, duration: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    return end.toISOString().split('T')[0];
  };

  const addPhase = () => {
    if (!newPhase.name) return;

    const lastPhase = phases[phases.length - 1];
    const startDate = lastPhase 
      ? calculateEndDate(lastPhase.startDate, lastPhase.duration)
      : projectStart;

    const phase: Phase = {
      id: Date.now().toString(),
      name: newPhase.name,
      startDate,
      endDate: calculateEndDate(startDate, newPhase.duration),
      duration: newPhase.duration,
      status: 'pending',
      dependencies: []
    };

    setPhases([...phases, phase]);
    setNewPhase({ name: '', duration: 1 });
  };

  const addCommonPhase = (phaseName: string, duration: number) => {
    const lastPhase = phases[phases.length - 1];
    const startDate = lastPhase 
      ? calculateEndDate(lastPhase.startDate, lastPhase.duration)
      : projectStart;

    const phase: Phase = {
      id: Date.now().toString(),
      name: phaseName,
      startDate,
      endDate: calculateEndDate(startDate, duration),
      duration,
      status: 'pending',
      dependencies: []
    };

    setPhases([...phases, phase]);
  };

  const removePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  const updatePhaseStatus = (id: string, status: Phase['status']) => {
    setPhases(phases.map(p => 
      p.id === id ? { ...p, status } : p
    ));
  };

  const getTotalDuration = () => {
    return phases.reduce((sum, p) => sum + p.duration, 0);
  };

  const getProjectEndDate = () => {
    if (phases.length === 0) return projectStart;
    const lastPhase = phases[phases.length - 1];
    return lastPhase.endDate;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline Planner</CardTitle>
          <CardDescription>
            Plan and visualize your electrical project schedule with phases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Start Date */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="projectStart">Project Start Date</Label>
            <Input
              id="projectStart"
              type="date"
              value={projectStart}
              onChange={(e) => setProjectStart(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Common Phases Quick Add */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Add Common Phases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonPhases.map((phase, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => addCommonPhase(phase.name, phase.duration)}
                  className="justify-start text-left h-auto py-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{phase.name}</div>
                    <div className="text-xs text-gray-500">{phase.duration} days</div>
                  </div>
                  <Plus className="h-4 w-4 text-[#00C2D1]" />
                </Button>
              ))}
            </div>
          </div>

          {/* Add Custom Phase */}
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#00C2D1]" />
              Add Custom Phase
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label>Phase Name</Label>
                <Input
                  value={newPhase.name}
                  onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                  placeholder="e.g., Underground Conduit Installation"
                />
              </div>
              <div>
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPhase.duration}
                  onChange={(e) => setNewPhase({ ...newPhase, duration: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={addPhase} className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>

          {/* Timeline Visualization */}
          {phases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Project Timeline</h3>
                <div className="text-sm text-gray-600">
                  Total: {getTotalDuration()} days
                </div>
              </div>

              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="relative">
                    {/* Timeline connector */}
                    {index < phases.length - 1 && (
                      <div className="absolute left-6 top-full w-0.5 h-3 bg-gray-300 z-0" />
                    )}
                    
                    <div className="flex items-start gap-4 p-4 bg-white border-2 rounded-lg hover:shadow-md transition-shadow relative z-10">
                      {/* Phase number */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#071428] text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      {/* Phase details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-lg text-[#071428]">{phase.name}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(phase.startDate)}
                              </span>
                              <span>→</span>
                              <span>{formatDate(phase.endDate)}</span>
                              <Badge variant="outline">{phase.duration} days</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhase(phase.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Status selector */}
                        <div className="flex gap-2">
                          {(['pending', 'in-progress', 'completed'] as const).map(status => (
                            <button
                              key={status}
                              onClick={() => updatePhaseStatus(phase.id, status)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                phase.status === status
                                  ? statusColors[status]
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {status.replace('-', ' ')}
                            </button>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              phase.status === 'completed' ? 'bg-green-500' :
                              phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{
                              width: phase.status === 'completed' ? '100%' :
                                     phase.status === 'in-progress' ? '50%' : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Project Summary */}
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm opacity-80">Start Date</div>
                      <div className="text-lg font-semibold">{formatDate(projectStart)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">End Date</div>
                      <div className="text-lg font-semibold">{formatDate(getProjectEndDate())}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Total Duration</div>
                      <div className="text-lg font-semibold text-[#00C2D1]">{getTotalDuration()} days</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Phases</div>
                      <div className="text-lg font-semibold">{phases.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {phases.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add phases to create your project timeline</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
