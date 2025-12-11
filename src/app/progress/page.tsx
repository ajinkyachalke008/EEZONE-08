'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Layers,
  Database,
  Palette,
  Calculator,
  BookOpen,
  Briefcase,
  Wrench,
  Code,
  FileText,
  Zap,
  Target,
  CircleDashed,
  Circle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkItem {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  category: string;
  subTasks?: { name: string; done: boolean }[];
}

const workItems: WorkItem[] = [
  {
    id: '1',
    title: 'Homepage Role Selector & Filtering',
    status: 'completed',
    priority: 'high',
    category: 'Frontend UI',
  },
  {
    id: '2',
    title: 'Homepage Unified Search',
    status: 'completed',
    priority: 'high',
    category: 'Frontend UI',
  },
  {
    id: '3',
    title: 'Lazy Loading (Scanner & Solver)',
    status: 'completed',
    priority: 'medium',
    category: 'Performance',
  },
  {
    id: '4',
    title: 'Apps Library NeoLumen Redesign',
    status: 'completed',
    priority: 'high',
    category: 'Frontend UI',
  },
  {
    id: '5',
    title: 'Calculators Page NeoLumen Redesign',
    status: 'completed',
    priority: 'high',
    category: 'Frontend UI',
  },
  {
    id: '6',
    title: 'Tool Pages NeoLumen Redesign (11 Pages)',
    status: 'completed',
    priority: 'high',
    category: 'Frontend UI',
    subTasks: [
      { name: 'Motor & Drives', done: true },
      { name: 'Lighting & Energy', done: true },
      { name: 'Power Systems', done: true },
      { name: 'Project Management', done: true },
      { name: 'Compliance', done: true },
      { name: 'Diagnostics', done: true },
      { name: 'AI Features', done: true },
      { name: 'Simulations', done: true },
      { name: 'Circuit Simulator', done: true },
      { name: 'Schematic & Wiring', done: true },
      { name: 'Quick Utilities', done: true },
    ],
  },
  {
    id: '7',
    title: '555 Timer Calculator',
    status: 'completed',
    priority: 'high',
    category: 'Calculators',
  },
  {
    id: '8',
    title: 'OpAmp Calculator',
    status: 'completed',
    priority: 'high',
    category: 'Calculators',
  },
  {
    id: '9',
    title: 'Dark Theme Text Visibility Fixes',
    status: 'completed',
    priority: 'high',
    category: 'Frontend UI',
    subTasks: [
      { name: 'Labor Time Calculator', done: true },
      { name: 'Project Timeline Planner', done: true },
      { name: 'BOM Generator', done: true },
      { name: 'Vendor Comparison', done: true },
      { name: 'Maintenance Scheduler', done: true },
      { name: 'Test Report Generator', done: true },
      { name: 'Load Profile Analyzer', done: true },
      { name: 'Compliance Checker', done: true },
      { name: 'Code Change Tracker', done: true },
      { name: 'NEC Code Search', done: true },
      { name: 'Jurisdiction Database', done: true },
      { name: 'Permit Assistant', done: true },
      { name: 'Material Cost Estimator', done: true },
    ],
  },
  {
    id: '10',
    title: 'Apps Database Integration',
    status: 'pending',
    priority: 'high',
    category: 'Database',
    subTasks: [
      { name: 'Create database schema', done: false },
      { name: 'Seed database with apps', done: false },
      { name: 'Create API routes', done: false },
      { name: 'Update apps page', done: false },
      { name: 'Create app detail pages', done: false },
    ],
  },
  {
    id: '11',
    title: 'Assessment System Enhancements',
    status: 'pending',
    priority: 'medium',
    category: 'Features',
    subTasks: [
      { name: 'Replace placeholder questions', done: false },
      { name: 'Create database schema', done: false },
      { name: 'Add quiz persistence', done: false },
      { name: 'Add analytics/tracking', done: false },
      { name: 'Generate certificates', done: false },
    ],
  },
  {
    id: '12',
    title: 'Projects System Enhancements',
    status: 'pending',
    priority: 'medium',
    category: 'Features',
    subTasks: [
      { name: 'Project Builder Wizard', done: false },
      { name: 'Add more seed projects', done: false },
      { name: 'User submissions', done: false },
      { name: 'Collaboration features', done: false },
    ],
  },
  {
    id: '13',
    title: 'Tutorials Enhancements',
    status: 'pending',
    priority: 'low',
    category: 'Features',
    subTasks: [
      { name: 'In-app video player', done: false },
      { name: 'Bookmark functionality', done: false },
      { name: 'Progress tracking', done: false },
    ],
  },
  {
    id: '14',
    title: 'Career Page Enhancements',
    status: 'pending',
    priority: 'medium',
    category: 'Features',
    subTasks: [
      { name: 'Connect to job APIs', done: false },
      { name: 'Resume PDF generator', done: false },
      { name: 'Interview practice tool', done: false },
      { name: 'Application tracking', done: false },
    ],
  },
];

const categories = [
  { name: 'Frontend UI', icon: Palette, color: '#9C4AFF' },
  { name: 'Calculators', icon: Calculator, color: '#FF6B00' },
  { name: 'Database', icon: Database, color: '#00E5FF' },
  { name: 'Features', icon: Layers, color: '#10B981' },
  { name: 'Performance', icon: Zap, color: '#F59E0B' },
];

export default function ProgressPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const completedItems = workItems.filter(item => item.status === 'completed');
  const inProgressItems = workItems.filter(item => item.status === 'in-progress');
  const pendingItems = workItems.filter(item => item.status === 'pending');

  const totalSubTasks = workItems.reduce((acc, item) => acc + (item.subTasks?.length || 1), 0);
  const completedSubTasks = workItems.reduce((acc, item) => {
    if (item.status === 'completed') return acc + (item.subTasks?.length || 1);
    return acc + (item.subTasks?.filter(st => st.done).length || 0);
  }, 0);

  const overallProgress = Math.round((completedSubTasks / totalSubTasks) * 100);

  const filteredItems = selectedCategory 
    ? workItems.filter(item => item.category === selectedCategory)
    : workItems;

  const categoryStats = categories.map(cat => ({
    ...cat,
    total: workItems.filter(item => item.category === cat.name).length,
    completed: workItems.filter(item => item.category === cat.name && item.status === 'completed').length,
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <CircleDashed className="h-5 w-5 text-gray-400" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': 
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'in-progress': 
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
      case 'pending': 
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Pending</Badge>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': 
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High</Badge>;
      case 'medium': 
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium</Badge>;
      case 'low': 
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Low</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen gradient-depth py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Project <span className="gradient-text-violet glow-text-violet">Progress Dashboard</span>
          </h1>
          <p className="text-lg text-[#B8A7E0] max-w-2xl mx-auto">
            Track all completed work and remaining tasks for EE Zone
          </p>
        </motion.div>

        {/* Overall Progress Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-surface border-[#9C4AFF]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#9C4AFF]" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#B8A7E0]">Total Completion</span>
                  <span className="text-2xl font-bold text-white">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-4 bg-white/10" />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 glass-surface rounded-xl border border-green-500/30">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{completedItems.length}</div>
                    <div className="text-sm text-[#B8A7E0]">Completed</div>
                  </div>
                  <div className="text-center p-4 glass-surface rounded-xl border border-yellow-500/30">
                    <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{inProgressItems.length}</div>
                    <div className="text-sm text-[#B8A7E0]">In Progress</div>
                  </div>
                  <div className="text-center p-4 glass-surface rounded-xl border border-gray-500/30">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{pendingItems.length}</div>
                    <div className="text-sm text-[#B8A7E0]">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-surface border-[#FF6B00]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-6 w-6 text-[#FF6B00]" />
                Progress by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categoryStats.map((cat, index) => {
                  const Icon = cat.icon;
                  const progress = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedCategory === cat.name 
                          ? 'ring-2 ring-white/50 bg-white/10' 
                          : 'glass-surface hover:bg-white/5'
                      }`}
                      style={{ borderColor: `${cat.color}40`, borderWidth: 1 }}
                    >
                      <Icon className="h-8 w-8 mb-2" style={{ color: cat.color }} />
                      <div className="text-sm font-medium text-white mb-1">{cat.name}</div>
                      <div className="text-xs text-[#B8A7E0] mb-2">{cat.completed}/{cat.total} done</div>
                      <Progress value={progress} className="h-2 bg-white/10" />
                    </motion.div>
                  );
                })}
              </div>
              {selectedCategory && (
                <div className="mt-4 text-center">
                  <Badge 
                    className="cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear Filter: {selectedCategory} ✕
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Task List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="glass-surface border border-white/10 mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#9C4AFF] data-[state=active]:text-white">
                All Tasks ({filteredItems.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Completed ({filteredItems.filter(i => i.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">
                Remaining ({filteredItems.filter(i => i.status === 'pending' || i.status === 'in-progress').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-4">
                {filteredItems.map((item, index) => (
                  <TaskCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {filteredItems.filter(i => i.status === 'completed').map((item, index) => (
                  <TaskCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="space-y-4">
                {filteredItems.filter(i => i.status === 'pending' || i.status === 'in-progress').map((item, index) => (
                  <TaskCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Visual Summary Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="glass-surface border-[#00E5FF]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-[#00E5FF]" />
                Visual Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Horizontal Bar Chart */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-[#B8A7E0]">Frontend UI</span>
                    <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#9C4AFF] to-[#FF6B00]"
                      />
                    </div>
                    <span className="w-16 text-right text-white font-bold">100%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-[#B8A7E0]">Calculators</span>
                    <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#00E5FF]"
                      />
                    </div>
                    <span className="w-16 text-right text-white font-bold">100%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-[#B8A7E0]">Performance</span>
                    <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-gradient-to-r from-[#F59E0B] to-[#10B981]"
                      />
                    </div>
                    <span className="w-16 text-right text-white font-bold">100%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-[#B8A7E0]">Database</span>
                    <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="h-full bg-gradient-to-r from-[#00E5FF] to-[#9C4AFF]"
                      />
                    </div>
                    <span className="w-16 text-right text-white font-bold">0%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-[#B8A7E0]">Features</span>
                    <div className="flex-1 h-8 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#F59E0B]"
                      />
                    </div>
                    <span className="w-16 text-right text-white font-bold">0%</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span className="text-sm text-[#B8A7E0]">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500" />
                    <span className="text-sm text-[#B8A7E0]">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500" />
                    <span className="text-sm text-[#B8A7E0]">Pending</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TaskCard({ item, index }: { item: WorkItem; index: number }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <CircleDashed className="h-5 w-5 text-gray-400" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': 
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'in-progress': 
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
      case 'pending': 
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Pending</Badge>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': 
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High Priority</Badge>;
      case 'medium': 
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Medium</Badge>;
      case 'low': 
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Low</Badge>;
      default: return null;
    }
  };

  const subTasksCompleted = item.subTasks?.filter(st => st.done).length || 0;
  const subTasksTotal = item.subTasks?.length || 0;
  const taskProgress = item.status === 'completed' ? 100 : subTasksTotal > 0 ? Math.round((subTasksCompleted / subTasksTotal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`glass-surface border transition-all ${
        item.status === 'completed' 
          ? 'border-green-500/30 hover:border-green-500/50' 
          : item.status === 'in-progress'
          ? 'border-yellow-500/30 hover:border-yellow-500/50'
          : 'border-white/10 hover:border-white/20'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-1">{getStatusIcon(item.status)}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className={`font-semibold ${item.status === 'completed' ? 'text-green-400' : 'text-white'}`}>
                  {item.title}
                </h3>
                {getStatusBadge(item.status)}
                {getPriorityBadge(item.priority)}
                <Badge className="bg-white/10 text-[#B8A7E0] border-white/20">{item.category}</Badge>
              </div>
              
              {item.subTasks && item.subTasks.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={taskProgress} className="h-2 flex-1 bg-white/10" />
                    <span className="text-xs text-[#B8A7E0]">{subTasksCompleted}/{subTasksTotal}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.subTasks.map((subTask, idx) => (
                      <div 
                        key={idx}
                        className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                          subTask.done 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-white/5 text-[#B8A7E0]'
                        }`}
                      >
                        {subTask.done ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {subTask.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
