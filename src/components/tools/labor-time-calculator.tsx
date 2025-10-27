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
      <Card>
        <CardHeader>
          <CardTitle>Labor Time Calculator</CardTitle>
          <CardDescription>
            Estimate labor hours and project duration for electrical installations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
              <Input
                id="laborRate"
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="crewSize">Crew Size</Label>
              <Input
                id="crewSize"
                type="number"
                min="1"
                value={crewSize}
                onChange={(e) => setCrewSize(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="workDayHours">Work Day Hours</Label>
              <Input
                id="workDayHours"
                type="number"
                min="1"
                max="24"
                value={workDayHours}
                onChange={(e) => setWorkDayHours(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Common Tasks Quick Add */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Add Common Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonTasks.map((task, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => addCommonTask(task)}
                  className="justify-start text-left h-auto py-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{task.name}</div>
                    <div className="text-xs text-gray-500">{task.hours} hrs • {task.category}</div>
                  </div>
                  <Plus className="h-4 w-4 text-[#00C2D1]" />
                </Button>
              ))}
            </div>
          </div>

          {/* Add Custom Task */}
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#00C2D1]" />
              Add Custom Task
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label>Task Name</Label>
                <Input
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                  placeholder="e.g., Install Transformer"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newTask.quantity}
                  onChange={(e) => setNewTask({ ...newTask, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Hours per Unit</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newTask.hoursPerUnit}
                  onChange={(e) => setNewTask({ ...newTask, hoursPerUnit: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={addTask} className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Tasks List */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Project Tasks ({tasks.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <Clock className="h-5 w-5 text-[#00C2D1]" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      <div className="md:col-span-2">
                        <div className="font-semibold text-[#071428]">{task.taskName}</div>
                        <Badge variant="secondary" className="text-xs mt-1">{task.category}</Badge>
                      </div>
                      <div className="text-gray-600">
                        Qty: <span className="font-medium">{task.quantity}</span>
                      </div>
                      <div className="text-gray-600">
                        {task.hoursPerUnit} hrs/unit
                      </div>
                      <div className="font-semibold text-[#00C2D1]">
                        {task.totalHours.toFixed(1)} hrs
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
            <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#00C2D1]" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm opacity-80">Total Man-Hours</div>
                    <div className="text-2xl font-bold text-[#00C2D1]">{summary.totalHours.toFixed(1)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm opacity-80">Actual Hours (Crew of {crewSize})</div>
                    <div className="text-2xl font-bold text-[#00C2D1]">{summary.actualHours.toFixed(1)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm opacity-80">Estimated Days</div>
                    <div className="text-2xl font-bold">{summary.workDays}</div>
                    <div className="text-xs opacity-60">({workDayHours} hrs/day)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm opacity-80">Total Labor Cost</div>
                    <div className="text-2xl font-bold">${summary.totalCost.toLocaleString()}</div>
                    <div className="text-xs opacity-60">(${laborRate}/hr)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add tasks to calculate project duration and labor costs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
