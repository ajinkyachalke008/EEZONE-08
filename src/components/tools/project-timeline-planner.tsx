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
  'pending': 'bg-[#B8A7E0]/20 text-[#B8A7E0] border-[#B8A7E0]/30',
  'in-progress': 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30',
  'completed': 'bg-green-500/20 text-green-400 border-green-500/30'
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
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Project Timeline Planner</CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Plan and visualize your electrical project schedule with phases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Start Date */}
          <div className="p-4 glass-surface border border-white/10 rounded-lg">
            <Label htmlFor="projectStart" className="text-white">Project Start Date</Label>
            <Input
              id="projectStart"
              type="date"
              value={projectStart}
              onChange={(e) => setProjectStart(e.target.value)}
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>

          {/* Common Phases Quick Add */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Quick Add Common Phases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonPhases.map((phase, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => addCommonPhase(phase.name, phase.duration)}
                  className="justify-start text-left h-auto py-3 border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#00E5FF]/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{phase.name}</div>
                    <div className="text-xs text-[#B8A7E0]">{phase.duration} days</div>
                  </div>
                  <Plus className="h-4 w-4 text-[#00E5FF]" />
                </Button>
              ))}
            </div>
          </div>

          {/* Add Custom Phase */}
          <div className="space-y-4 p-4 border-2 border-dashed border-[#9C4AFF]/40 rounded-lg glass-surface">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-[#9C4AFF]" />
              Add Custom Phase
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label className="text-white">Phase Name</Label>
                <Input
                  value={newPhase.name}
                  onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                  placeholder="e.g., Underground Conduit Installation"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPhase.duration}
                  onChange={(e) => setNewPhase({ ...newPhase, duration: Number(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <Button onClick={addPhase} className="w-full gradient-violet text-white hover:shadow-glowViolet">
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>

          {/* Timeline Visualization */}
          {phases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white">Project Timeline</h3>
                <div className="text-sm text-[#B8A7E0]">
                  Total: {getTotalDuration()} days
                </div>
              </div>

              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="relative">
                    {/* Timeline connector */}
                    {index < phases.length - 1 && (
                      <div className="absolute left-6 top-full w-0.5 h-3 bg-[#9C4AFF]/50 z-0" />
                    )}
                    
                    <div className="flex items-start gap-4 p-4 glass-surface border border-white/10 rounded-lg hover:border-[#9C4AFF]/50 transition-all relative z-10">
                      {/* Phase number */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-violet text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      {/* Phase details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-lg text-white">{phase.name}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-[#B8A7E0]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(phase.startDate)}
                              </span>
                              <span>→</span>
                              <span>{formatDate(phase.endDate)}</span>
                              <Badge variant="outline" className="border-white/20 text-[#B8A7E0]">{phase.duration} days</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhase(phase.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
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
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                phase.status === status
                                  ? statusColors[status]
                                  : 'bg-white/5 text-[#B8A7E0] border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {status.replace('-', ' ')}
                            </button>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              phase.status === 'completed' ? 'bg-green-500' :
                              phase.status === 'in-progress' ? 'bg-[#00E5FF]' : 'bg-white/20'
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
              <Card className="bg-gradient-to-br from-[#9C4AFF]/20 to-[#FF6B00]/20 border border-[#9C4AFF]/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-[#B8A7E0]">Start Date</div>
                      <div className="text-lg font-semibold text-white">{formatDate(projectStart)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#B8A7E0]">End Date</div>
                      <div className="text-lg font-semibold text-white">{formatDate(getProjectEndDate())}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#B8A7E0]">Total Duration</div>
                      <div className="text-lg font-semibold text-[#00E5FF]">{getTotalDuration()} days</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#B8A7E0]">Phases</div>
                      <div className="text-lg font-semibold text-white">{phases.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {phases.length === 0 && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add phases to create your project timeline</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}