'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Trash2, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MaintenanceTask {
  id: string;
  equipmentName: string;
  equipmentType: string;
  taskType: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  status: 'overdue' | 'due-soon' | 'scheduled' | 'completed';
  assignedTo: string;
  notes: string;
}

const equipmentTypes = [
  'Transformer',
  'Motor',
  'Generator',
  'Circuit Breaker',
  'Panel',
  'UPS',
  'Battery Bank',
  'Switchgear',
  'VFD',
  'Other'
];

const taskTypes = [
  'Visual Inspection',
  'Thermal Scan',
  'Insulation Test',
  'Contact Resistance Test',
  'Load Test',
  'Cleaning',
  'Lubrication',
  'Calibration',
  'Firmware Update'
];

const frequencies = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'semi-annual', label: 'Semi-Annual', days: 180 },
  { value: 'annual', label: 'Annual', days: 365 }
];

export function MaintenanceScheduler() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      equipmentName: 'Main Transformer #1',
      equipmentType: 'Transformer',
      taskType: 'Thermal Scan',
      frequency: 'quarterly',
      lastCompleted: '2025-07-15',
      nextDue: '2025-10-15',
      status: 'overdue',
      assignedTo: 'John Smith',
      notes: 'Check for hot spots'
    },
    {
      id: '2',
      equipmentName: 'Emergency Generator',
      equipmentType: 'Generator',
      taskType: 'Load Test',
      frequency: 'monthly',
      lastCompleted: '2025-09-20',
      nextDue: '2025-10-20',
      status: 'due-soon',
      assignedTo: 'Mike Johnson',
      notes: 'Full load test required'
    }
  ]);

  const [newTask, setNewTask] = useState({
    equipmentName: '',
    equipmentType: 'Transformer',
    taskType: 'Visual Inspection',
    frequency: 'monthly',
    assignedTo: '',
    notes: ''
  });

  const calculateNextDue = (lastCompleted: string, frequency: string) => {
    const freq = frequencies.find(f => f.value === frequency);
    if (!freq) return lastCompleted;
    
    const date = new Date(lastCompleted);
    date.setDate(date.getDate() + freq.days);
    return date.toISOString().split('T')[0];
  };

  const getStatus = (nextDue: string): MaintenanceTask['status'] => {
    const today = new Date();
    const dueDate = new Date(nextDue);
    const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'due-soon';
    return 'scheduled';
  };

  const addTask = () => {
    if (!newTask.equipmentName) return;

    const today = new Date().toISOString().split('T')[0];
    const nextDue = calculateNextDue(today, newTask.frequency);

    const task: MaintenanceTask = {
      id: Date.now().toString(),
      ...newTask,
      lastCompleted: today,
      nextDue,
      status: getStatus(nextDue)
    };

    setTasks([...tasks, task]);
    setNewTask({
      equipmentName: '',
      equipmentType: 'Transformer',
      taskType: 'Visual Inspection',
      frequency: 'monthly',
      assignedTo: '',
      notes: ''
    });
  };

  const markComplete = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id !== id) return task;
      
      const today = new Date().toISOString().split('T')[0];
      const nextDue = calculateNextDue(today, task.frequency);
      
      return {
        ...task,
        lastCompleted: today,
        nextDue,
        status: getStatus(nextDue)
      };
    }));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getStatusBadge = (status: MaintenanceTask['status']) => {
    const styles = {
      overdue: 'bg-red-100 text-red-800 border-red-300',
      'due-soon': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300'
    };
    
    const icons = {
      overdue: <AlertTriangle className="h-3 w-3" />,
      'due-soon': <Clock className="h-3 w-3" />,
      scheduled: <Calendar className="h-3 w-3" />,
      completed: <CheckCircle2 className="h-3 w-3" />
    };
    
    return (
      <Badge className={`${styles[status]} flex items-center gap-1`}>
        {icons[status]}
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportSchedule = () => {
    const csv = [
      ['Equipment Name', 'Type', 'Task', 'Frequency', 'Last Completed', 'Next Due', 'Status', 'Assigned To', 'Notes'],
      ...tasks.map(t => [
        t.equipmentName,
        t.equipmentType,
        t.taskType,
        t.frequency,
        t.lastCompleted,
        t.nextDue,
        t.status,
        t.assignedTo,
        t.notes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maintenance_schedule.csv';
    a.click();
  };

  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const dueSoonCount = tasks.filter(t => t.status === 'due-soon').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Scheduler</CardTitle>
          <CardDescription>
            Schedule and track equipment maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-400">{overdueCount}</div>
                  <div className="text-sm opacity-80">Overdue</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">{dueSoonCount}</div>
                  <div className="text-sm opacity-80">Due Soon</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#00C2D1]">{tasks.length}</div>
                  <div className="text-sm opacity-80">Total Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Task Form */}
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#00C2D1]" />
              Schedule New Maintenance Task
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Equipment Name</Label>
                <Input
                  value={newTask.equipmentName}
                  onChange={(e) => setNewTask({ ...newTask, equipmentName: e.target.value })}
                  placeholder="e.g., Main Transformer #2"
                />
              </div>
              <div>
                <Label>Equipment Type</Label>
                <Select value={newTask.equipmentType} onValueChange={(value) => setNewTask({ ...newTask, equipmentType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Task Type</Label>
                <Select value={newTask.taskType} onValueChange={(value) => setNewTask({ ...newTask, taskType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={newTask.frequency} onValueChange={(value) => setNewTask({ ...newTask, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Input
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  placeholder="Technician name"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  placeholder="Special instructions"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Scheduled Tasks</h3>
                <Button onClick={exportSchedule} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="space-y-3">
                {tasks.sort((a, b) => {
                  const statusOrder = { overdue: 0, 'due-soon': 1, scheduled: 2, completed: 3 };
                  return statusOrder[a.status] - statusOrder[b.status];
                }).map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-lg text-[#071428]">{task.equipmentName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{task.equipmentType}</Badge>
                                <Badge variant="secondary">{task.taskType}</Badge>
                              </div>
                            </div>
                            {getStatusBadge(task.status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Frequency</div>
                              <div className="font-medium capitalize">{task.frequency.replace('-', ' ')}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Last Completed</div>
                              <div className="font-medium">{formatDate(task.lastCompleted)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Next Due</div>
                              <div className="font-medium">{formatDate(task.nextDue)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Assigned To</div>
                              <div className="font-medium">{task.assignedTo}</div>
                            </div>
                          </div>

                          {task.notes && (
                            <div className="text-sm text-gray-600 italic">
                              Note: {task.notes}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={() => markComplete(task.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Complete
                            </Button>
                            <Button
                              onClick={() => removeTask(task.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>No maintenance tasks scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
