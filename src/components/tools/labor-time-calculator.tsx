'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Plus, Trash2, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LaborTask {
  id: string;
  taskName: string;
  category: string;
  quantity: number;
  hoursPerUnit: number;
  totalHours: number;
}

const taskCategories = [
  { name: 'Rough-in', avgHours: 2.5 },
  { name: 'Device Installation', avgHours: 0.5 },
  { name: 'Panel Installation', avgHours: 6 },
  { name: 'Fixture Installation', avgHours: 1 },
  { name: 'Conduit Running', avgHours: 3 },
  { name: 'Wire Pulling', avgHours: 2 },
  { name: 'Testing & Commissioning', avgHours: 4 },
  { name: 'Troubleshooting', avgHours: 2 },
  { name: 'Other', avgHours: 1 }
];

const commonTasks = [
  { name: 'Install Receptacle Outlet', category: 'Device Installation', hours: 0.3 },
  { name: 'Install Light Switch', category: 'Device Installation', hours: 0.25 },
  { name: 'Install Light Fixture', category: 'Fixture Installation', hours: 1 },
  { name: 'Install Ceiling Fan', category: 'Fixture Installation', hours: 1.5 },
  { name: 'Install 100A Panel', category: 'Panel Installation', hours: 6 },
  { name: 'Install 200A Panel', category: 'Panel Installation', hours: 8 },
  { name: 'Run 100ft EMT Conduit', category: 'Conduit Running', hours: 3 },
  { name: 'Pull Wire 100ft', category: 'Wire Pulling', hours: 1.5 },
  { name: 'Rough-in Bedroom', category: 'Rough-in', hours: 4 },
  { name: 'Rough-in Kitchen', category: 'Rough-in', hours: 8 }
];

export function LaborTimeCalculator() {
  const [tasks, setTasks] = useState<LaborTask[]>([]);
  const [laborRate, setLaborRate] = useState(75);
  const [crewSize, setCrewSize] = useState(1);
  const [workDayHours, setWorkDayHours] = useState(8);

  const [newTask, setNewTask] = useState({
    taskName: '',
    category: 'Device Installation',
    quantity: 1,
    hoursPerUnit: 1
  });

  const addTask = () => {
    if (!newTask.taskName) return;

    const task: LaborTask = {
      id: Date.now().toString(),
      ...newTask,
      totalHours: newTask.quantity * newTask.hoursPerUnit
    };

    setTasks([...tasks, task]);
    setNewTask({
      taskName: '',
      category: 'Device Installation',
      quantity: 1,
      hoursPerUnit: 1
    });
  };

  const addCommonTask = (task: typeof commonTasks[0]) => {
    const newTask: LaborTask = {
      id: Date.now().toString(),
      taskName: task.name,
      category: task.category,
      quantity: 1,
      hoursPerUnit: task.hours,
      totalHours: task.hours
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const calculateSummary = () => {
    const totalHours = tasks.reduce((sum, t) => sum + t.totalHours, 0);
    const totalCost = totalHours * laborRate;
    const workDays = Math.ceil(totalHours / (workDayHours * crewSize));
    const actualHours = totalHours / crewSize;
    
    return { totalHours, totalCost, workDays, actualHours };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Labor Time Calculator</CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Estimate labor hours and project duration for electrical installations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 glass-surface border border-white/10 rounded-lg">
            <div>
              <Label htmlFor="laborRate" className="text-white">Labor Rate ($/hr)</Label>
              <Input
                id="laborRate"
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="crewSize" className="text-white">Crew Size</Label>
              <Input
                id="crewSize"
                type="number"
                min="1"
                value={crewSize}
                onChange={(e) => setCrewSize(Number(e.target.value))}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="workDayHours" className="text-white">Work Day Hours</Label>
              <Input
                id="workDayHours"
                type="number"
                min="1"
                max="24"
                value={workDayHours}
                onChange={(e) => setWorkDayHours(Number(e.target.value))}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Common Tasks Quick Add */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-white">Quick Add Common Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonTasks.map((task, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => addCommonTask(task)}
                  className="justify-start text-left h-auto py-3 border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#00E5FF]/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{task.name}</div>
                    <div className="text-xs text-[#B8A7E0]">{task.hours} hrs • {task.category}</div>
                  </div>
                  <Plus className="h-4 w-4 text-[#00E5FF]" />
                </Button>
              ))}
            </div>
          </div>

          {/* Add Custom Task */}
          <div className="space-y-4 p-4 border-2 border-dashed border-[#9C4AFF]/40 rounded-lg glass-surface">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-[#9C4AFF]" />
              Add Custom Task
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label className="text-white">Task Name</Label>
                <Input
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                  placeholder="e.g., Install Transformer"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Category</Label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-white/20">
                    {taskCategories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name} className="text-white hover:bg-white/10">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newTask.quantity}
                  onChange={(e) => setNewTask({ ...newTask, quantity: Number(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-white">Hours per Unit</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newTask.hoursPerUnit}
                  onChange={(e) => setNewTask({ ...newTask, hoursPerUnit: Number(e.target.value) })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <Button onClick={addTask} className="w-full gradient-violet text-white hover:shadow-glowViolet">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Tasks List */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-white">Project Tasks ({tasks.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 glass-surface border border-white/10 rounded-lg hover:border-[#00E5FF]/50 transition-all">
                    <Clock className="h-5 w-5 text-[#00E5FF]" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      <div className="md:col-span-2">
                        <div className="font-semibold text-white">{task.taskName}</div>
                        <Badge variant="secondary" className="text-xs mt-1 bg-[#9C4AFF]/20 text-[#9C4AFF] border-[#9C4AFF]/30">{task.category}</Badge>
                      </div>
                      <div className="text-[#B8A7E0]">
                        Qty: <span className="font-medium text-white">{task.quantity}</span>
                      </div>
                      <div className="text-[#B8A7E0]">
                        {task.hoursPerUnit} hrs/unit
                      </div>
                      <div className="font-semibold text-[#00E5FF]">
                        {task.totalHours.toFixed(1)} hrs
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(task.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {tasks.length > 0 && (
            <Card className="bg-gradient-to-br from-[#9C4AFF]/20 to-[#FF6B00]/20 border border-[#9C4AFF]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calculator className="h-5 w-5 text-[#00E5FF]" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-[#B8A7E0]">Total Man-Hours</div>
                    <div className="text-2xl font-bold text-[#00E5FF]">{summary.totalHours.toFixed(1)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-[#B8A7E0]">Actual Hours (Crew of {crewSize})</div>
                    <div className="text-2xl font-bold text-[#00E5FF]">{summary.actualHours.toFixed(1)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-[#B8A7E0]">Estimated Days</div>
                    <div className="text-2xl font-bold text-white">{summary.workDays}</div>
                    <div className="text-xs text-[#B8A7E0]">({workDayHours} hrs/day)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-[#B8A7E0]">Total Labor Cost</div>
                    <div className="text-2xl font-bold text-[#FF6B00]">${summary.totalCost.toLocaleString()}</div>
                    <div className="text-xs text-[#B8A7E0]">(${laborRate}/hr)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add tasks to calculate project duration and labor costs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}