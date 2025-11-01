'use client';

import { useState, useMemo } from 'react';
import { Search, Briefcase, GraduationCap, Wrench, ChevronRight, Star, Zap, Calculator, BookOpen, Cpu, Settings, Lightbulb, CircuitBoard, FileText, Gauge, GraduationCap as EducationIcon, ClipboardList, Scale, Wrench as DiagnosticIcon, Code, Sparkles, Headphones, Globe, Beaker, Box, Shield, Clock, Calendar, TrendingUp, MapPin, FileCheck, BarChart, Thermometer, PlayCircle, Smartphone, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { InstrumentScanner } from '@/components/instrument-scanner';
import { ProblemSolver } from '@/components/problem-solver';
import { Header } from '@/components/header';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Role = 'professional' | 'student' | 'technician' | null;

const featuredApps = [
  {
    id: 1,
    name: 'Circuit Simulator Pro',
    description: 'Advanced circuit simulation with real-time analysis',
    rating: 4.8,
    reviews: 2340,
    category: 'Design',
    isPro: true,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'NEC Code Reference',
    description: 'Complete National Electrical Code database',
    rating: 4.9,
    reviews: 5678,
    category: 'Reference',
    isPro: false,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Load Calculator',
    description: 'Calculate electrical loads for residential & commercial',
    rating: 4.7,
    reviews: 1890,
    category: 'Calculator',
    isPro: false,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Power Quality Analyzer',
    description: 'Monitor and analyze power quality issues',
    rating: 4.6,
    reviews: 982,
    category: 'Analysis',
    isPro: true,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
  },
];

const quickTools = [
  { icon: Calculator, name: 'Ohm\'s Law', href: '/calculators#ohms-law' },
  { icon: Zap, name: 'Voltage Drop', href: '/calculators#voltage-drop' },
  { icon: Cpu, name: 'Power Factor', href: '/calculators#power-factor' },
  { icon: BookOpen, name: 'Tutorials', href: '/tutorials' },
];

const toolCategories = [
  {
    id: 'power-systems',
    title: 'Power Systems',
    description: 'Three-Phase Power Calculator, Short Circuit Analysis, Harmonic Analysis Tool, Load Schedule Generator, Conduit Fill Calculator, Grounding System Designer',
    href: '/tools/power-systems',
    icon: Zap,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/professional-electrical-power-systems-da-d3d6b005-20251026042843.jpg',
  },
  {
    id: 'motor-drives',
    title: 'Motor & Drive Systems',
    description: 'Motor Starter Sizing, VFD Calculator, Motor Selection Tool, Belt/Chain Drive Calculator, Torque & Load Analysis, NEC Compliance Check',
    href: '/tools/motor-drives',
    icon: Settings,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/industrial-motor-and-drive-systems-with--51cf91fa-20251026042846.jpg',
  },
  {
    id: 'lighting-energy',
    title: 'Lighting & Energy',
    description: 'Lighting Design Calculator, Energy Cost Calculator, Solar PV System Designer, Energy Audit Tool, ROI Analysis, Efficiency Recommendations',
    href: '/tools/lighting-energy',
    icon: Lightbulb,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/modern-lighting-design-and-solar-energy--d5951729-20251026042847.jpg',
  },
  {
    id: 'circuit-simulator',
    title: 'Circuit Simulation',
    description: 'Live Circuit Simulator (Drag & Drop), SPICE Integration (DC/AC/Transient), Virtual Oscilloscope Viewer, Real-time Waveform Display, Exportable Netlists',
    href: '/tools/circuit-simulator',
    icon: CircuitBoard,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/interactive-circuit-simulation-interface-cf8d5da5-20251026042847.jpg',
  },
  {
    id: 'schematic',
    title: 'Schematic & Wiring',
    description: 'Professional Schematic Editor, Residential Wiring Planner, Control Panel Designer, PCB Trace Width Calculator, Multi-sheet Design Support',
    href: '/tools/schematic-wiring',
    icon: FileText,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/electrical-schematic-editor-and-wiring-d-edc888a6-20251026042846.jpg',
  },
];

const projectManagementTools = [
  { icon: Calculator, name: 'Material Cost Estimator', description: 'Calculate component and material costs for projects', href: '/tools/project-management#cost-estimator' },
  { icon: Clock, name: 'Labor Time Calculator', description: 'Estimate labor hours and project duration', href: '/tools/project-management#labor-calculator' },
  { icon: Calendar, name: 'Project Timeline Planner', description: 'Plan and visualize project schedules', href: '/tools/project-management#timeline' },
  { icon: ClipboardList, name: 'BOM Generator', description: 'Create detailed Bills of Materials', href: '/tools/project-management#bom' },
  { icon: TrendingUp, name: 'Vendor Comparison', description: 'Compare prices and specs across vendors', href: '/tools/project-management#vendor-comparison' },
];

const codeComplianceTools = [
  { icon: Search, name: 'NEC Code Search', description: 'AI-powered National Electrical Code search', href: '/tools/compliance#nec-search' },
  { icon: Scale, name: 'Compliance Checker', description: 'Automatic code compliance verification', href: '/tools/compliance#checker' },
  { icon: FileText, name: 'Code Change Tracker', description: 'Track updates in NEC 2026 and beyond', href: '/tools/compliance#change-tracker' },
  { icon: MapPin, name: 'Jurisdiction Database', description: 'Local code requirements by location', href: '/tools/compliance#jurisdiction' },
  { icon: FileCheck, name: 'Permit Assistant', description: 'Help with permit applications', href: '/tools/compliance#permit' },
];

const diagnosticTools = [
  { icon: Calendar, name: 'Maintenance Scheduler', description: 'Schedule and track equipment maintenance', href: '/tools/diagnostics#scheduler' },
  { icon: FileText, name: 'Test Report Generator', description: 'Generate megger and insulation test reports', href: '/tools/diagnostics#test-reports' },
  { icon: BarChart, name: 'Load Profile Analyzer', description: 'Analyze meter data and load profiles', href: '/tools/diagnostics#load-analyzer' },
  { icon: Gauge, name: 'Power Quality Reporter', description: 'Interpret power quality reports', href: '/tools/diagnostics#power-quality' },
  { icon: Thermometer, name: 'Thermal Imaging Tool', description: 'Analyze thermal imaging data', href: '/tools/diagnostics#thermal' },
];

const aiFeatures = [
  { icon: Code, name: 'AI Code Assistant', description: 'PLC, Arduino, ESP32 code generation', isPro: true, href: '/tools/ai-features#code-assistant' },
  { icon: CircuitBoard, name: 'AI Circuit Designer', description: 'Describe needs, get schematic suggestions', isPro: true, href: '/tools/ai-features#circuit-designer' },
  { icon: Wrench, name: 'AI Troubleshooting', description: 'Upload error photos for diagnostics', isPro: true, href: '/tools/ai-features#troubleshooting' },
  { icon: Headphones, name: 'Voice Input', description: 'Hands-free queries for field work', isPro: false, href: '/tools/ai-features#voice-input' },
  { icon: Globe, name: 'Multi-language Support', description: 'Spanish, Mandarin, Hindi support', isPro: false, href: '/tools/ai-features#multi-language' },
];

const interactiveSimulations = [
  { icon: Beaker, name: 'Virtual Lab Experiments', description: 'No physical equipment needed', href: '/tools/simulations#virtual-lab' },
  { icon: Box, name: '3D Installation Viewer', description: 'Visualize electrical installations', href: '/tools/simulations#3d-viewer' },
  { icon: PlayCircle, name: 'Animated Theory', description: 'How transformers and motors work', href: '/tools/simulations#animated-theory' },
  { icon: Shield, name: 'Safety Training', description: 'Arc flash scenario simulations', href: '/tools/simulations#safety-training' },
  { icon: Smartphone, name: 'AR Circuit Overlays', description: 'Camera-based circuit visualization', href: '/tools/simulations#ar-overlays' },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const roles = [
    {
      type: 'professional' as Role,
      icon: Briefcase,
      title: 'Professional',
      description: 'Advanced tools for electrical engineers',
    },
    {
      type: 'student' as Role,
      icon: GraduationCap,
      title: 'Student',
      description: 'Learning resources and tutorials',
    },
    {
      type: 'technician' as Role,
      icon: Wrench,
      title: 'Technician',
      description: 'Practical tools and quick references',
    },
  ];

  // Filter content based on search query
  const filteredApps = useMemo(() => {
    if (!searchQuery) return featuredApps;
    const query = searchQuery.toLowerCase();
    return featuredApps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredTools = useMemo(() => {
    if (!searchQuery) return toolCategories;
    const query = searchQuery.toLowerCase();
    return toolCategories.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredQuickTools = useMemo(() => {
    if (!searchQuery) return quickTools;
    const query = searchQuery.toLowerCase();
    return quickTools.filter((tool) =>
      tool.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const hasSearchResults = searchQuery && (filteredApps.length > 0 || filteredTools.length > 0 || filteredQuickTools.length > 0);
  const hasNoResults = searchQuery && filteredApps.length === 0 && filteredTools.length === 0 && filteredQuickTools.length === 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen gradient-depth">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Search Results Section */}
      {hasSearchResults && (
        <section className="glass-surface py-8 px-4 border-b border-white/10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white glow-text-violet">
                Search Results for "{searchQuery}"
              </h2>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="text-[#B8A7E0] hover:text-white hover:bg-white/10"
              >
                Clear Search
              </Button>
            </div>
            <p className="text-[#B8A7E0]">
              Found {filteredApps.length + filteredTools.length + filteredQuickTools.length} results
            </p>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {hasNoResults && (
        <section className="glass-surface py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Search className="h-16 w-16 text-[#9C4AFF] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No results found for "{searchQuery}"
            </h2>
            <p className="text-[#B8A7E0] mb-6">
              Try searching with different keywords or browse our categories below
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              className="gradient-fire text-white hover:shadow-glowOrange"
            >
              Clear Search
            </Button>
          </div>
        </section>
      )}

      {/* Hero Section - Hidden when searching */}
      {!searchQuery && (
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Ambient Background Orbs */}
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
          <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/2 w-[300px] h-[300px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '4s' }} />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold leading-tight text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Your Complete <span className="gradient-text-violet glow-text-violet">Electrical & Electronics</span> Platform
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-[#B8A7E0] max-w-3xl mx-auto"
              >
                Access professional tools, calculators, tutorials, and resources designed for EEE professionals, students, and technicians.
              </motion.p>

              {/* Search Bar */}
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onSubmit={(e) => { e.preventDefault(); }} 
                className="max-w-2xl mx-auto mt-8"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8A7E0] h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search apps, calculators, tutorials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 glass-surface backdrop-blur-glass text-white border-white/20 focus:border-[#9C4AFF] focus:ring-[#9C4AFF] placeholder:text-[#B8A7E0]"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => handleSearch(searchQuery)} 
                    className="h-12 px-6 gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Search
                  </Button>
                </div>
              </motion.form>

              {/* Role Selector */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto"
              >
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.type;
                  return (
                    <motion.div
                      key={role.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'gradient-fire border-[#FF6B00] shadow-glowOrange'
                            : 'glass-surface border-white/20 hover:border-[#9C4AFF] hover:shadow-glowViolet'
                        }`}
                        onClick={() => setSelectedRole(role.type)}
                      >
                        <CardHeader>
                          <Icon className={`h-10 w-10 mb-2 ${isSelected ? 'text-white' : 'text-[#9C4AFF]'}`} />
                          <CardTitle className="text-white">
                            {role.title}
                          </CardTitle>
                          <CardDescription className="text-[#B8A7E0]">
                            {role.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Instrument Scanner Section */}
      {!searchQuery && (
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full" />
          <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <CircuitBoard className="h-12 w-12 text-[#00E5FF] glow-text-cyan" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-white glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  AI-Powered Instrument Scanner
                </h2>
              </div>
              <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
                Instantly identify any electrical or electronic instrument with advanced AI technology
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
              {/* Feature Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden border-2 border-[#00E5FF]/30 shadow-glowCyan"
              >
                <img
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop"
                  alt="Instrument Scanner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00E5FF]/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2 glow-text-cyan">Advanced Recognition</h3>
                  <p className="text-white/90 text-sm">Identify multimeters, oscilloscopes, power supplies, and more</p>
                </div>
              </motion.div>

              {/* Feature List */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { icon: Zap, title: 'Instant Recognition', desc: 'AI identifies instruments in under 2 seconds' },
                  { icon: CircuitBoard, title: 'Complete Specifications', desc: 'Get full technical specs and datasheets' },
                  { icon: BookOpen, title: 'Usage Tutorials', desc: 'Learn how to use each instrument properly' },
                  { icon: Shield, title: 'Safety Guidelines', desc: 'Important safety notes and precautions' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 glass-surface border border-white/10 rounded-xl p-4 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all"
                  >
                    <div className="p-3 gradient-aqua rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg mb-1">{feature.title}</h4>
                      <p className="text-[#B8A7E0] text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <InstrumentScanner />
            </motion.div>
          </div>
        </section>
      )}

      {/* Problem Solver Section */}
      {!searchQuery && (
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-[#FF00C8] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-12 w-12 text-[#FF00C8] glow-text-orange" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  AI Problem Solver
                </h2>
              </div>
              <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
                Get detailed step-by-step solutions for electrical & electronics numerical problems
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
              {/* Feature List */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4 order-2 lg:order-1"
              >
                {[
                  { icon: Calculator, title: 'Complex Calculations', desc: 'Solve circuit analysis, power systems, and control problems' },
                  { icon: BookOpen, title: 'Step-by-Step Solutions', desc: 'Detailed breakdown of every calculation step' },
                  { icon: Camera, title: 'Multiple Input Methods', desc: 'Type, paste, or scan problems from books' },
                  { icon: Zap, title: 'Instant Results', desc: 'Get solutions in seconds with AI processing' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 glass-surface border border-white/10 rounded-xl p-4 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all"
                  >
                    <div className="p-3 gradient-violet rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg mb-1">{feature.title}</h4>
                      <p className="text-[#B8A7E0] text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Feature Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden border-2 border-[#9C4AFF]/30 shadow-glowViolet order-1 lg:order-2"
              >
                <img
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop"
                  alt="Problem Solver"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#9C4AFF]/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2 glow-text-violet">Smart Analysis</h3>
                  <p className="text-white/90 text-sm">AI-powered solutions for complex electrical problems</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <ProblemSolver />
            </motion.div>
          </div>
        </section>
      )}

      {/* Advanced Calculators & Tools */}
      {(!searchQuery || filteredTools.length > 0) && (
        <section className="py-16 px-4 relative overflow-hidden">
          {/* Ambient Orb */}
          <div className="absolute top-10 left-1/2 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {searchQuery ? 'Tool Categories' : 'Advanced Calculators & Tools'}
              </h2>
              {!searchQuery && (
                <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                  High-level design and analysis tools for power systems, motors, drives, and energy management
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {filteredTools.slice(0, 3).map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <Card className="overflow-hidden glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={tool.image}
                          alt={tool.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 gradient-violet opacity-20" />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Icon className="h-5 w-5 text-[#9C4AFF]" />
                          {tool.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <ul className="text-sm text-[#B8A7E0] space-y-1">
                          {tool.description.split(', ').map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Link href={tool.href} className="w-full">
                          <Button className="w-full gradient-violet hover:shadow-glowViolet text-white rounded-xl">
                            Explore Tools
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Design Tools - Show only 2 remaining categories when not searching */}
      {!searchQuery && filteredTools.length > 3 && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#071428] to-[#0a1d38]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">🎨 Interactive Design Tools</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Hands-on tools for circuit development, simulation, and professional layout design
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredTools.slice(3).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card key={tool.id} className="overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#00C2D1]" />
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {tool.description.split(', ').slice(0, 2).join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-gray-300 space-y-2">
                      <ul className="space-y-1 text-sm">
                        {tool.description.split(', ').map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={tool.href} className="w-full">
                        <Button className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                          Launch Tool
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Project Management Suite - NEW */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#071428] mb-4">📋 Project Management Suite</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Professional tools for planning, estimation, and project execution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectManagementTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.name} href={tool.href}>
                    <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                      <CardHeader>
                        <Icon className="h-10 w-10 text-[#00C2D1] mb-2" />
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Code Compliance Tools - NEW */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-gradient-to-br from-[#071428] to-[#0a1d38]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">⚖️ Code Compliance Tools</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Ensure your designs meet electrical codes and standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {codeComplianceTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.name} href={tool.href}>
                    <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full bg-white/5 border-white/10 hover:bg-white/10">
                      <CardHeader>
                        <Icon className="h-10 w-10 text-[#00C2D1] mb-2" />
                        <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Diagnostic & Testing Tools - NEW */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#071428] mb-4">🔧 Diagnostic & Testing Tools</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Equipment maintenance, analysis, and reporting solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnosticTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.name} href={tool.href}>
                    <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                      <CardHeader>
                        <Icon className="h-10 w-10 text-[#00C2D1] mb-2" />
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Advanced AI Features - NEW */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-gradient-to-br from-indigo-900 to-purple-900">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">✨ Advanced AI Features</h2>
              <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                Leverage artificial intelligence for code assistance, design, and troubleshooting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.name} href={feature.href}>
                    <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Icon className="h-10 w-10 text-[#00C2D1]" />
                          {feature.isPro && (
                            <Badge className="bg-yellow-500 text-black">Pro</Badge>
                          )}
                        </div>
                        <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-200 text-sm">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Simulations - NEW */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#071428] mb-4">🎮 Interactive Simulations</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Immersive and educational experiences for hands-on learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interactiveSimulations.map((sim) => {
                const Icon = sim.icon;
                return (
                  <Link key={sim.name} href={sim.href}>
                    <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-gray-200 hover:border-[#00C2D1] h-full">
                      <CardHeader>
                        <Icon className="h-10 w-10 text-[#00C2D1] mb-2" />
                        <CardTitle className="text-lg">{sim.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm">{sim.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick-Access Utilities - Hidden when searching */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#071428] mb-4">🔥 Quick-Access Utilities</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Essential everyday calculators for component and protection selection
              </p>
            </div>

            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/quick-access-electrical-utilities-dashbo-31822a66-20251026042846.jpg"
                  alt="Quick Utilities"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071428]/90 to-[#071428]/70 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl">
                      <h3 className="text-3xl font-bold text-white mb-4">
                        Essential Component Calculators
                      </h3>
                      <p className="text-lg text-gray-300 mb-6">
                        Fast, accurate tools for daily electrical engineering tasks
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-2 text-white">
                          <Gauge className="h-5 w-5 text-[#00C2D1]" />
                          <span>Fuse/Breaker Selector</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Gauge className="h-5 w-5 text-[#00C2D1]" />
                          <span>Voltage Divider</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Gauge className="h-5 w-5 text-[#00C2D1]" />
                          <span>555 Timer Designer</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Gauge className="h-5 w-5 text-[#00C2D1]" />
                          <span>Opamp Calculator</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Gauge className="h-5 w-5 text-[#00C2D1]" />
                          <span>Filter Designer</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Gauge className="h-5 w-5 text-[#00C2D1]" />
                          <span>Thermal Management</span>
                        </div>
                      </div>
                      <Link href="/tools/quick-utilities">
                        <Button size="lg" className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
                          Access All Utilities
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Educational & Training - Hidden when searching */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-gradient-to-b from-[#071428] to-[#0a1d38]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">🎓 Educational & Training</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Learning, troubleshooting, and professional development resources
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/educational-electrical-engineering-learn-74ff25a4-20251026042846.jpg"
                  alt="Educational Resources"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#00C2D1]" />
                        Interactive Tutorials
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">Step-by-step guides with embedded calculators and real-world examples</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-[#00C2D1]" />
                        Troubleshooting Wizard
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">Diagnostic flowcharts for common electrical issues and solutions</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <EducationIcon className="h-5 w-5 text-[#00C2D1]" />
                        Certification Prep
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">Exam simulators for Journeyman/Master electrician certifications</p>
                    </CardContent>
                  </Card>
                </div>

                <Link href="/tutorials">
                  <Button size="lg" className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
                    Start Learning
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Apps Carousel */}
      {(!searchQuery || filteredApps.length > 0) && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#071428]">
                  {searchQuery ? 'Matching Apps' : 'Featured Apps'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {searchQuery 
                    ? `${filteredApps.length} app${filteredApps.length !== 1 ? 's' : ''} found`
                    : 'Explore our most popular electrical engineering tools'
                  }
                </p>
              </div>
              <Link href="/apps">
                <Button variant="outline" className="hidden md:flex items-center gap-2">
                  View All Apps
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {filteredApps.map((app) => (
                  <CarouselItem key={app.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <img
                            src={app.image}
                            alt={app.name}
                            className="w-full h-full object-cover"
                          />
                          {app.isPro && (
                            <Badge className="absolute top-3 right-3 bg-[#00C2D1] text-[#071428]">
                              Pro
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                        </div>
                        <CardDescription className="mb-3">{app.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{app.rating}</span>
                            <span className="text-gray-500">({app.reviews})</span>
                          </div>
                          <Badge variant="secondary">{app.category}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-[#071428] hover:bg-[#071428]/90">
                          Launch App
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>

            <div className="md:hidden mt-6 text-center">
              <Link href="/apps">
                <Button variant="outline" className="items-center gap-2">
                  View All Apps
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Quick Tools */}
      {(!searchQuery || filteredQuickTools.length > 0) && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-[#071428] text-center mb-8">
              {searchQuery ? 'Quick Tools' : 'Quick Access Tools'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredQuickTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.name} href={tool.href}>
                    <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-[#00C2D1]">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Icon className="h-12 w-12 text-[#00C2D1] mb-3" />
                        <p className="font-semibold text-[#071428]">{tool.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!searchQuery && (
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 gradient-violet opacity-50 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
          <div className="absolute top-0 left-0 w-full h-full bg-[#0A0014]/50" />
          
          {/* Ambient Orbs */}
          <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#FF6B00] opacity-30 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#00E5FF] opacity-30 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />

          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4 text-white glow-text-violet"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Ready to Level Up Your EE Skills?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-[#B8A7E0] mb-8"
            >
              Join thousands of professionals using EE Zone for their daily electrical engineering needs.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl px-8 transition-all duration-300 hover:scale-105 uppercase tracking-wider">
                Start Free Trial
              </Button>
              <Button size="lg" className="glass-surface border-2 border-white/20 text-white hover:border-[#9C4AFF] hover:shadow-glowViolet rounded-xl px-8 transition-all duration-300 hover:scale-105 uppercase tracking-wider">
                Explore Features
              </Button>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}