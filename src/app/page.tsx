'use client';

import { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { Search, Briefcase, GraduationCap, Wrench, ChevronRight, Star, Zap, Calculator, BookOpen, Cpu, Settings, Lightbulb, CircuitBoard, FileText, Gauge, GraduationCap as EducationIcon, ClipboardList, Scale, Wrench as DiagnosticIcon, Code, Sparkles, Headphones, Globe, Beaker, Box, Shield, Clock, Calendar, TrendingUp, MapPin, FileCheck, BarChart, Thermometer, PlayCircle, Smartphone, Camera, Brain, Award, Building2, Users, CheckCircle2, Target, DollarSign, MessageSquare, FileCheck as FileCheckIcon, Loader2, Battery, RotateCw, Activity, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Lazy load heavy components
const InstrumentScanner = lazy(() => import('@/components/instrument-scanner').then(mod => ({ default: mod.InstrumentScanner })));
const ProblemSolver = lazy(() => import('@/components/problem-solver').then(mod => ({ default: mod.ProblemSolver })));

// Loading fallback component
const SectionLoader = () => (
  <div className="flex flex-col items-center justify-center py-12 glass-surface border border-white/10 rounded-2xl">
    <div className="relative">
      <Loader2 className="h-12 w-12 animate-spin text-[#9C4AFF] glow-violet" />
      <div className="absolute inset-0 h-12 w-12 animate-ping text-[#9C4AFF]/30">
        <Loader2 className="h-12 w-12" />
      </div>
    </div>
    <p className="text-[#B8A7E0] mt-4">Loading...</p>
  </div>
);

// Add icon map for topics
const topicIconMap: { [key: string]: any } = {
  Battery, RotateCw, Zap, Cable: CircuitBoard, CircuitBoard, Activity, Cpu, Plug, Gauge, FileCheck
};

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
    targetRoles: ['professional', 'student'] as Role[],
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
    targetRoles: ['professional', 'technician'] as Role[],
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
    targetRoles: ['professional', 'technician', 'student'] as Role[],
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
    targetRoles: ['professional'] as Role[],
  },
  {
    id: 5,
    name: 'Basic Electronics Tutor',
    description: 'Interactive lessons for beginners',
    rating: 4.9,
    reviews: 4521,
    category: 'Learning',
    isPro: false,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
    targetRoles: ['student'] as Role[],
  },
  {
    id: 6,
    name: 'Field Service Toolkit',
    description: 'Essential tools for on-site electrical work',
    rating: 4.7,
    reviews: 1234,
    category: 'Tools',
    isPro: false,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    targetRoles: ['technician'] as Role[],
  },
];

const quickTools = [
  { icon: Calculator, name: 'Ohm\'s Law', href: '/calculators#ohms-law', targetRoles: ['professional', 'student', 'technician'] as Role[] },
  { icon: Zap, name: 'Voltage Drop', href: '/calculators#voltage-drop', targetRoles: ['professional', 'technician'] as Role[] },
  { icon: Cpu, name: 'Power Factor', href: '/calculators#power-factor', targetRoles: ['professional', 'technician'] as Role[] },
  { icon: BookOpen, name: 'Tutorials', href: '/tutorials', targetRoles: ['student', 'professional'] as Role[] },
  { icon: Wrench, name: 'Field Guide', href: '/tools/quick-utilities', targetRoles: ['technician'] as Role[] },
  { icon: GraduationCap, name: 'Learn Basics', href: '/tutorials', targetRoles: ['student'] as Role[] },
];

const toolCategories = [
  {
    id: 'power-systems',
    title: 'Power Systems',
    description: 'Advanced power analysis and design tools including Three-Phase Power Calculator for balanced/unbalanced systems, Short Circuit Analysis for fault current calculations, Harmonic Analysis Tool for power quality assessment, Load Schedule Generator for electrical demand planning, Conduit Fill Calculator for NEC compliance, and Grounding System Designer for safe installations.',
    href: '/tools/power-systems',
    icon: Zap,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/professional-electrical-power-systems-da-d3d6b005-20251026042843.jpg',
    targetRoles: ['professional', 'technician'] as Role[],
  },
  {
    id: 'motor-drives',
    title: 'Motor & Drive Systems',
    description: 'Complete motor control and drive design suite featuring Motor Starter Sizing for proper protection, VFD Calculator for variable frequency drive selection, Motor Selection Tool for application-specific requirements, Belt/Chain Drive Calculator for mechanical design, Torque & Load Analysis for performance optimization, and NEC Compliance Check for electrical code adherence.',
    href: '/tools/motor-drives',
    icon: Settings,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/industrial-motor-and-drive-systems-with--51cf91fa-20251026042846.jpg',
    targetRoles: ['professional', 'technician'] as Role[],
  },
  {
    id: 'lighting-energy',
    title: 'Lighting & Energy',
    description: 'Comprehensive energy efficiency and lighting design tools including Lighting Design Calculator for optimal illumination planning, Energy Cost Calculator for utility expense analysis, Solar PV System Designer for renewable energy projects, Energy Audit Tool for consumption assessment, ROI Analysis for investment planning, and Efficiency Recommendations for cost savings.',
    href: '/tools/lighting-energy',
    icon: Lightbulb,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/modern-lighting-design-and-solar-energy--d5951729-20251026042847.jpg',
    targetRoles: ['professional', 'student'] as Role[],
  },
  {
    id: 'circuit-simulator',
    title: 'Circuit Simulation',
    description: 'Professional-grade circuit simulation environment with Live Circuit Simulator featuring drag-and-drop component placement, SPICE Integration for accurate DC, AC, and Transient analysis, Virtual Oscilloscope Viewer for real-time waveform monitoring, Real-time Waveform Display for signal visualization, and Exportable Netlists for sharing designs with colleagues.',
    href: '/tools/circuit-simulator',
    icon: CircuitBoard,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/interactive-circuit-simulation-interface-cf8d5da5-20251026042847.jpg',
    targetRoles: ['professional', 'student'] as Role[],
  },
  {
    id: 'schematic',
    title: 'Schematic & Wiring',
    description: 'Complete schematic and wiring design suite with Professional Schematic Editor for creating detailed electrical drawings, Residential Wiring Planner for home installations, Control Panel Designer for industrial applications, PCB Trace Width Calculator for proper current handling, and Multi-sheet Design Support for complex projects.',
    href: '/tools/schematic-wiring',
    icon: FileText,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/electrical-schematic-editor-and-wiring-d-edc888a6-20251026042846.jpg',
    targetRoles: ['professional', 'technician'] as Role[],
  },
];

const tutorialContent = [
  { type: 'tutorial-video', title: 'Circuit Analysis Fundamentals', description: 'Learn basic circuit analysis techniques', category: 'tutorials', section: 'Video Tutorial' },
  { type: 'tutorial-video', title: 'Power Systems Design', description: 'Complete guide to power system design', category: 'tutorials', section: 'Video Tutorial' },
  { type: 'tutorial-article', title: 'Understanding Three-Phase Power', description: 'Deep dive into three-phase electrical systems', category: 'tutorials', section: 'Article' },
  { type: 'tutorial-article', title: 'NEC Code Guide 2023', description: 'Comprehensive NEC code reference', category: 'tutorials', section: 'Article' },
  { type: 'tutorial-resource', title: 'Electrical Symbols Library', description: 'Complete electrical symbol reference', category: 'tutorials', section: 'Resource' },
];

const projectContent = [
  { type: 'project', title: 'Build a 3-Phase Motor Controller', description: 'Step-by-step motor controller project', category: 'projects', difficulty: 'Intermediate' },
  { type: 'project', title: 'Solar Panel System Design', description: 'Design and build a solar power system', category: 'projects', difficulty: 'Advanced' },
  { type: 'project', title: 'Home Automation Circuit', description: 'IoT-based home automation', category: 'projects', difficulty: 'Beginner' },
  { type: 'project', title: 'Industrial PLC Programming', description: 'Learn PLC programming with real projects', category: 'projects', difficulty: 'Advanced' },
];

const assessmentContent = [
  { type: 'assessment', title: 'Circuit Analysis Quiz', description: 'Test your circuit analysis knowledge', category: 'assessments', topic: 'Circuits' },
  { type: 'assessment', title: 'Power Systems Quiz', description: 'Comprehensive power systems assessment', category: 'assessments', topic: 'Power' },
  { type: 'assessment', title: 'NEC Code Practice Test', description: 'Practice NEC code questions', category: 'assessments', topic: 'NEC' },
  { type: 'mock-exam', title: 'FE Electrical Exam', description: 'Full-length FE exam simulator', category: 'assessments', topic: 'Certification' },
  { type: 'mock-exam', title: 'PE Power Exam', description: 'Professional Engineer practice exam', category: 'assessments', topic: 'Certification' },
];

const careerContent = [
  { type: 'certification', title: 'FE Electrical Certification', description: 'Fundamentals of Engineering prep course', category: 'career', level: 'Entry Level' },
  { type: 'certification', title: 'PE Power Certification', description: 'Professional Engineer Power Systems', category: 'career', level: 'Professional' },
  { type: 'certification', title: 'Journeyman Electrician', description: 'State electrician certification prep', category: 'career', level: 'Intermediate' },
  { type: 'job', title: 'Senior Power Systems Engineer', description: 'Tesla Energy - Austin, TX', category: 'career', company: 'Tesla' },
  { type: 'job', title: 'Controls Engineer', description: 'Siemens - Chicago, IL', category: 'career', company: 'Siemens' },
  { type: 'career-tool', title: 'Resume Builder', description: 'Create professional EE resumes', category: 'career' },
  { type: 'career-tool', title: 'Interview Prep', description: 'Practice technical interviews', category: 'career' },
];

const projectManagementTools = [
  { icon: Calculator, name: 'Material Cost Estimator', description: 'Comprehensive cost analysis tool for calculating component prices, material expenses, shipping costs, and vendor comparisons. Generate detailed budget reports for client proposals and project planning with real-time pricing updates.', href: '/tools/project-management#cost-estimator' },
  { icon: Clock, name: 'Labor Time Calculator', description: 'Professional labor estimation system for accurately calculating installation hours, troubleshooting time, commissioning duration, and testing phases. Includes complexity factors and skill-level adjustments for precise project timeline forecasting.', href: '/tools/project-management#labor-calculator' },
  { icon: Calendar, name: 'Project Timeline Planner', description: 'Interactive Gantt chart creator for visualizing project schedules, tracking milestones, managing dependencies, and coordinating team resources. Features critical path analysis and automated deadline alerts for on-time delivery.', href: '/tools/project-management#timeline' },
  { icon: ClipboardList, name: 'BOM Generator', description: 'Automated Bill of Materials creation tool that generates detailed parts lists with specifications, quantities, part numbers, and supplier information. Export to CSV, PDF, or Excel formats for procurement and documentation purposes.', href: '/tools/project-management#bom' },
  { icon: TrendingUp, name: 'Vendor Comparison', description: 'Multi-vendor price and specification comparison engine for finding the best deals on electrical components. Compare delivery times, warranty terms, technical specs, and total cost across major distributors like Digi-Key, Mouser, and Newark.', href: '/tools/project-management#vendor-comparison' },
];

const codeComplianceTools = [
  { icon: Search, name: 'NEC Code Search', description: 'AI-powered search engine for the National Electrical Code with natural language queries, instant article lookup, cross-referencing, and contextual explanations. Access NEC 2020, 2023, and upcoming 2026 editions with highlighted changes and amendments.', href: '/tools/compliance#nec-search' },
  { icon: Scale, name: 'Compliance Checker', description: 'Automated design verification tool that validates your electrical installations against NEC requirements, NFPA 70E safety standards, and local amendments. Generates comprehensive compliance reports with violation warnings and correction recommendations.', href: '/tools/compliance#checker' },
  { icon: FileText, name: 'Code Change Tracker', description: 'Track all updates between NEC editions with side-by-side comparisons, impact analysis, and practical implementation guides. Stay current with the latest safety requirements, installation methods, and calculation updates affecting your projects.', href: '/tools/compliance#change-tracker' },
  { icon: MapPin, name: 'Jurisdiction Database', description: 'Comprehensive database of local electrical code requirements, amendments, and special provisions for over 15,000 US jurisdictions. Search by ZIP code or city to find specific local regulations, permit requirements, and inspection protocols.', href: '/tools/compliance#jurisdiction' },
  { icon: FileCheck, name: 'Permit Assistant', description: 'Step-by-step guidance for preparing electrical permit applications with required documentation checklists, form auto-fill, plan review preparation, and common rejection avoidance tips. Includes jurisdiction-specific requirements and submission workflows.', href: '/tools/compliance#permit' },
];

const diagnosticTools = [
  { icon: Calendar, name: 'Maintenance Scheduler', description: 'Complete preventive maintenance planning system for tracking equipment service intervals, creating maintenance calendars, setting automated reminders, and logging completed work. Includes NFPA 70B and manufacturer-recommended schedules for electrical equipment.', href: '/tools/diagnostics#scheduler' },
  { icon: FileText, name: 'Test Report Generator', description: 'Professional report creation tool for megger testing, insulation resistance measurements, ground fault testing, and power quality surveys. Auto-generates IEEE and NETA-compliant reports with graphs, pass/fail indicators, and trending analysis for predictive maintenance.', href: '/tools/diagnostics#test-reports' },
  { icon: BarChart, name: 'Load Profile Analyzer', description: 'Advanced analytics for utility meter data with demand pattern recognition, peak load identification, power factor analysis, and energy consumption trends. Visualize daily, weekly, and seasonal usage patterns to optimize electrical systems and reduce utility costs.', href: '/tools/diagnostics#load-analyzer' },
  { icon: Gauge, name: 'Power Quality Reporter', description: 'Comprehensive power quality data interpretation tool for analyzing voltage sags, swells, harmonics, transients, and flicker events. Identifies problem sources, quantifies financial impacts, and recommends mitigation solutions with IEEE 519 compliance verification.', href: '/tools/diagnostics#power-quality' },
  { icon: Thermometer, name: 'Thermal Imaging Tool', description: 'Thermal imaging data analysis platform for detecting hot spots, loose connections, overloaded circuits, and failing components. Imports data from FLIR and other IR cameras, generates prioritized repair lists, and creates professional thermal inspection reports with NFPA 70B standards.', href: '/tools/diagnostics#thermal' },
];

const aiFeatures = [
  { icon: Code, name: 'AI Code Assistant', description: 'Intelligent code generation for PLC ladder logic, Arduino C++, ESP32 firmware, and industrial automation controllers. Describe your control logic in plain English and get production-ready, commented code with best practices and error handling included.', isPro: true, href: '/tools/ai-features#code-assistant' },
  { icon: CircuitBoard, name: 'AI Circuit Designer', description: 'Revolutionary circuit design assistant that converts functional requirements into complete schematic suggestions. Input specifications like voltage, current, frequency requirements and receive optimized circuit topologies with component recommendations and design rationale.', isPro: true, href: '/tools/ai-features#circuit-designer' },
  { icon: Wrench, name: 'AI Troubleshooting', description: 'Advanced diagnostic AI that analyzes photos of electrical problems, error codes, meter readings, and equipment failures. Provides step-by-step troubleshooting procedures, likely root causes ranked by probability, and safety precautions for field technicians.', isPro: true, href: '/tools/ai-features#troubleshooting' },
  { icon: Headphones, name: 'Voice Input', description: 'Hands-free operation for field work with natural voice commands for calculations, code lookups, and tool access. Perfect for electricians wearing gloves or working in confined spaces. Supports complex queries like "Calculate voltage drop for 12 AWG copper wire, 150 feet, 20 amps".', isPro: false, href: '/tools/ai-features#voice-input' },
  { icon: Globe, name: 'Multi-language Support', description: 'Full platform translation for Spanish, Mandarin Chinese, and Hindi-speaking electrical professionals. Includes technical terminology, NEC code translations, calculation results, and interface localization to serve the global electrical engineering community.', isPro: false, href: '/tools/ai-features#multi-language' },
];

const interactiveSimulations = [
  { icon: Beaker, name: 'Virtual Lab Experiments', description: 'Complete virtual electrical laboratory with realistic circuit simulations, oscilloscope measurements, and component testing without physical equipment. Includes safety-critical experiments like transformer polarity testing, motor starting, and fault condition analysis that are too dangerous or expensive for physical labs.', href: '/tools/simulations#virtual-lab' },
  { icon: Box, name: '3D Installation Viewer', description: 'Immersive 3D visualization tool for planning and reviewing electrical installations in commercial and industrial facilities. Walk through conduit routing, panel layouts, and equipment placements in virtual reality before installation. Export to BIM and coordinate with other trades to avoid conflicts.', href: '/tools/simulations#3d-viewer' },
  { icon: PlayCircle, name: 'Animated Theory', description: 'Dynamic animated explanations of complex electrical concepts including transformer operation, motor starting, AC waveform generation, three-phase power, magnetic fields, and semiconductor behavior. Interactive controls let you adjust parameters and see real-time effects on system operation.', href: '/tools/simulations#animated-theory' },
  { icon: Shield, name: 'Safety Training', description: 'OSHA and NFPA 70E compliant safety simulation scenarios including arc flash incidents, electrical shock prevention, proper PPE selection, lockout/tagout procedures, and emergency response. Practice hazard recognition in realistic virtual environments without risk to personnel.', href: '/tools/simulations#safety-training' },
  { icon: Smartphone, name: 'AR Circuit Overlays', description: 'Augmented reality mobile app that overlays circuit diagrams, cable identification, voltage readings, and equipment specifications onto live camera feeds. Point your phone at a panel or circuit and see real-time data, connection diagrams, and maintenance history displayed in AR for rapid troubleshooting and documentation.', href: '/tools/simulations#ar-overlays' },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add state for continue learning
  const [continueTopics, setContinueTopics] = useState<any[]>([]);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<any[]>([]);
  const [loadingLearning, setLoadingLearning] = useState(true);

  // Fetch learning data on mount
  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('ee_zone_user_id') || ''
        : '';
      
      if (!userId) {
        setLoadingLearning(false);
        return;
      }

      const [progressRes, bookmarksRes, topicsRes] = await Promise.all([
        fetch(`/api/learn/progress/${userId}`),
        fetch(`/api/learn/bookmarks/${userId}`),
        fetch('/api/learn/topics')
      ]);

      let topics: any[] = [];
      if (topicsRes.ok) {
        topics = await topicsRes.json();
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        // Get in-progress topics (not 100% complete)
        const inProgress = progressData
          .filter((p: any) => p.completionPercent < 100)
          .slice(0, 3)
          .map((p: any) => ({
            ...p,
            topic: p.topic || topics.find((t: any) => t.id === p.topicId)
          }));
        setContinueTopics(inProgress);
      }

      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        const topicBookmarks = bookmarksData
          .filter((b: any) => b.contentType === 'topic')
          .slice(0, 3)
          .map((b: any) => ({
            ...b,
            topic: topics.find((t: any) => t.id === b.contentId)
          }));
        setBookmarkedTopics(topicBookmarks);
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoadingLearning(false);
    }
  };

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

  // Role-based filtering
  const roleFilteredApps = useMemo(() => {
    if (!selectedRole) return featuredApps;
    return featuredApps.filter(app => app.targetRoles.includes(selectedRole));
  }, [selectedRole]);

  const roleFilteredTools = useMemo(() => {
    if (!selectedRole) return toolCategories;
    return toolCategories.filter(tool => tool.targetRoles.includes(selectedRole));
  }, [selectedRole]);

  const roleFilteredQuickTools = useMemo(() => {
    if (!selectedRole) return quickTools;
    return quickTools.filter(tool => tool.targetRoles.includes(selectedRole));
  }, [selectedRole]);

  // UNIFIED SEARCH across ALL sections
  const unifiedSearchResults = useMemo(() => {
    if (!searchQuery) return null;
    
    const query = searchQuery.toLowerCase();
    const results: any = {
      apps: [],
      tools: [],
      quickTools: [],
      tutorials: [],
      projects: [],
      assessments: [],
      career: [],
    };

    // Search in role-filtered apps
    results.apps = roleFilteredApps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
    );

    // Search in role-filtered tools
    results.tools = roleFilteredTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );

    // Search in role-filtered quick tools
    results.quickTools = roleFilteredQuickTools.filter((tool) =>
      tool.name.toLowerCase().includes(query)
    );

    // Search in tutorials
    results.tutorials = tutorialContent.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.section.toLowerCase().includes(query)
    );

    // Search in projects
    results.projects = projectContent.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.difficulty.toLowerCase().includes(query)
    );

    // Search in assessments
    results.assessments = assessmentContent.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.topic.toLowerCase().includes(query)
    );

    // Search in career content
    results.career = careerContent.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.company && item.company.toLowerCase().includes(query)) ||
        (item.level && item.level.toLowerCase().includes(query))
    );

    return results;
  }, [searchQuery, roleFilteredApps, roleFilteredTools, roleFilteredQuickTools]);

  // Calculate total results
  const totalResults = unifiedSearchResults
    ? Object.values(unifiedSearchResults).reduce((acc: number, arr: any) => acc + arr.length, 0)
    : 0;

  const hasSearchResults = searchQuery && totalResults > 0;
  const hasNoResults = searchQuery && totalResults === 0;

  // Search filtering (applied on top of role filtering)
  const filteredApps = useMemo(() => {
    const baseApps = roleFilteredApps;
    if (!searchQuery) return baseApps;
    const query = searchQuery.toLowerCase();
    return baseApps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
    );
  }, [searchQuery, roleFilteredApps]);

  const filteredTools = useMemo(() => {
    const baseTools = roleFilteredTools;
    if (!searchQuery) return baseTools;
    const query = searchQuery.toLowerCase();
    return baseTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }, [searchQuery, roleFilteredTools]);

  const filteredQuickTools = useMemo(() => {
    const baseQuickTools = roleFilteredQuickTools;
    if (!searchQuery) return baseQuickTools;
    const query = searchQuery.toLowerCase();
    return baseQuickTools.filter((tool) =>
      tool.name.toLowerCase().includes(query)
    );
  }, [searchQuery, roleFilteredQuickTools]);

  // Role-specific welcome messages
  const getRoleMessage = () => {
    switch (selectedRole) {
      case 'professional':
        return {
          title: 'Professional Engineering Tools',
          subtitle: 'Advanced analysis, design tools, and compliance resources for licensed electrical engineers'
        };
      case 'student':
        return {
          title: 'Learn Electrical Engineering',
          subtitle: 'Interactive tutorials, simulators, and practice tools to master EE fundamentals'
        };
      case 'technician':
        return {
          title: 'Field-Ready Tools',
          subtitle: 'Practical calculators, code references, and diagnostic tools for on-site work'
        };
      default:
        return {
          title: 'Your Complete Electrical & Electronics Platform',
          subtitle: 'Access professional tools, calculators, tutorials, and resources designed for EEE professionals, students, and technicians.'
        };
    }
  };

  const roleMessage = getRoleMessage();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tutorials': return BookOpen;
      case 'projects': return Wrench;
      case 'assessments': return Brain;
      case 'career': return Briefcase;
      default: return Zap;
    }
  };

  return (
    <div className="min-h-screen gradient-depth">
      {/* Unified Search Results Section */}
      {hasSearchResults && (
        <section className="glass-surface py-8 px-4 border-b border-white/10">
          <div className="container mx-auto max-w-6xl border-2 border-white/10 rounded-2xl p-8 glass-surface">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white glow-text-violet">
                  Search Results for "{searchQuery}"
                </h2>
                {selectedRole && (
                  <p className="text-sm text-[#B8A7E0] mt-1">
                    Filtered for: <span className="font-semibold capitalize">{selectedRole}</span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="text-[#B8A7E0] hover:text-white hover:bg-white/10"
              >
                Clear Search
              </Button>
            </div>
            
            <div className="mb-6">
              <p className="text-[#B8A7E0]">
                Found <span className="text-white font-semibold">{totalResults}</span> results across all sections
              </p>
            </div>

            {/* Results by Category */}
            <div className="space-y-6">
              {/* Apps Results */}
              {unifiedSearchResults.apps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#9C4AFF]" />
                    Apps ({unifiedSearchResults.apps.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unifiedSearchResults.apps.slice(0, 3).map((app: any) => (
                      <Card key={app.id} className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-base">{app.name}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-sm line-clamp-2">{app.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Button size="sm" className="w-full gradient-violet text-white">View App</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {unifiedSearchResults.apps.length > 3 && (
                    <Link href="/apps">
                      <Button variant="ghost" className="mt-3 text-[#9C4AFF] hover:text-white">
                        View all {unifiedSearchResults.apps.length} apps →
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Tools Results */}
              {unifiedSearchResults.tools.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#FF6B00]" />
                    Tools ({unifiedSearchResults.tools.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unifiedSearchResults.tools.slice(0, 2).map((tool: any) => (
                      <Card key={tool.id} className="glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-base">{tool.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-sm line-clamp-2">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Link href={tool.href} className="w-full">
                            <Button size="sm" className="w-full gradient-fire text-white">Explore Tools</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tutorials Results */}
              {unifiedSearchResults.tutorials.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#00E5FF]" />
                    Tutorials ({unifiedSearchResults.tutorials.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unifiedSearchResults.tutorials.slice(0, 3).map((item: any, idx: number) => (
                      <Card key={idx} className="glass-surface border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all">
                        <CardHeader className="pb-3">
                          <Badge className="w-fit mb-2 bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30">{item.section}</Badge>
                          <CardTitle className="text-white text-base">{item.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-sm line-clamp-2">{item.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Link href="/tutorials" className="w-full">
                            <Button size="sm" className="w-full gradient-aqua text-white">View Tutorial</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {unifiedSearchResults.tutorials.length > 3 && (
                    <Link href="/tutorials">
                      <Button variant="ghost" className="mt-3 text-[#00E5FF] hover:text-white">
                        View all {unifiedSearchResults.tutorials.length} tutorials →
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Projects Results */}
              {unifiedSearchResults.projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-[#9C4AFF]" />
                    Projects ({unifiedSearchResults.projects.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unifiedSearchResults.projects.slice(0, 2).map((item: any, idx: number) => (
                      <Card key={idx} className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-[#9C4AFF]/20 text-[#9C4AFF] border-[#9C4AFF]/30">{item.difficulty}</Badge>
                          </div>
                          <CardTitle className="text-white text-base">{item.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-sm line-clamp-2">{item.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Link href="/projects" className="w-full">
                            <Button size="sm" className="w-full gradient-violet text-white">Start Building</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {unifiedSearchResults.projects.length > 2 && (
                    <Link href="/projects">
                      <Button variant="ghost" className="mt-3 text-[#9C4AFF] hover:text-white">
                        View all {unifiedSearchResults.projects.length} projects →
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Assessments Results */}
              {unifiedSearchResults.assessments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#FF6B00]" />
                    Assessments ({unifiedSearchResults.assessments.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unifiedSearchResults.assessments.slice(0, 3).map((item: any, idx: number) => (
                      <Card key={idx} className="glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all">
                        <CardHeader className="pb-3">
                          <Badge className="w-fit mb-2 bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">{item.topic}</Badge>
                          <CardTitle className="text-white text-base">{item.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-sm line-clamp-2">{item.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Link href="/assessments" className="w-full">
                            <Button size="sm" className="w-full gradient-fire text-white">Start Quiz</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {unifiedSearchResults.assessments.length > 3 && (
                    <Link href="/assessments">
                      <Button variant="ghost" className="mt-3 text-[#FF6B00] hover:text-white">
                        View all {unifiedSearchResults.assessments.length} assessments →
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Career Results */}
              {unifiedSearchResults.career.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#00E5FF]" />
                    Career Resources ({unifiedSearchResults.career.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unifiedSearchResults.career.slice(0, 3).map((item: any, idx: number) => (
                      <Card key={idx} className="glass-surface border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all">
                        <CardHeader className="pb-3">
                          {item.level && (
                            <Badge className="w-fit mb-2 bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30">{item.level}</Badge>
                          )}
                          {item.company && (
                            <Badge className="w-fit mb-2 bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30">{item.company}</Badge>
                          )}
                          <CardTitle className="text-white text-base">{item.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] text-sm line-clamp-2">{item.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Link href="/career" className="w-full">
                            <Button size="sm" className="w-full gradient-aqua text-white">View Details</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {unifiedSearchResults.career.length > 3 && (
                    <Link href="/career">
                      <Button variant="ghost" className="mt-3 text-[#00E5FF] hover:text-white">
                        View all {unifiedSearchResults.career.length} career resources →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {hasNoResults && (
        <section className="glass-surface py-16 px-4">
          <div className="container mx-auto max-w-6xl border-2 border-white/10 rounded-2xl p-8 glass-surface">
            <div className="flex flex-col items-center text-center">
              <Search className="h-16 w-16 text-[#9C4AFF] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No results found for "{searchQuery}"
              </h2>
              {selectedRole && (
                <p className="text-[#B8A7E0] mb-4">
                  in <span className="font-semibold capitalize">{selectedRole}</span> content
                </p>
              )}
              <p className="text-[#B8A7E0] mb-6">
                Try searching with different keywords or browse our categories below
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setSearchQuery('')}
                  className="gradient-fire text-white hover:shadow-glowOrange"
                >
                  Clear Search
                </Button>
                {selectedRole && (
                  <Button
                    onClick={() => setSelectedRole(null)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Show All Roles
                  </Button>
                )}
              </div>
            </div>
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
                {selectedRole ? roleMessage.title : (
                  <>Your Complete <span className="gradient-text-violet glow-text-violet">Electrical & Electronics</span> Platform</>
                )}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-[#B8A7E0] max-w-3xl mx-auto"
              >
                {roleMessage.subtitle}
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
                      placeholder={selectedRole ? `Search ${selectedRole} resources...` : "Search apps, calculators, tutorials..."}
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
                        onClick={() => setSelectedRole(isSelected ? null : role.type)}
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

              {/* Show active filter badge */}
              {selectedRole && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 mt-6"
                >
                  <Badge className="gradient-violet text-white text-base px-4 py-2">
                    Showing content for: {selectedRole}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRole(null)}
                    className="text-[#B8A7E0] hover:text-white"
                  >
                    Clear filter
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Continue Learning Section */}
      {!searchQuery && (continueTopics.length > 0 || bookmarkedTopics.length > 0) && (
        <section className="py-12 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#FF6B00]/40 rounded-3xl p-8 glass-surface shadow-[0_0_30px_rgba(255,107,0,0.3)] hover:border-[#FF6B00]/60 hover:shadow-[0_0_40px_rgba(255,107,0,0.4)] transition-all">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-[#FF6B00]" />
                  <h2 className="text-3xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Continue Learning
                  </h2>
                </div>
                <Link href="/learn">
                  <Button variant="ghost" className="text-[#B8A7E0] hover:text-white">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-[#B8A7E0] mt-2">Pick up where you left off or continue with saved topics</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* In Progress Topics */}
              {continueTopics.map((item, index) => {
                const topic = item.topic;
                if (!topic) return null;
                const Icon = topicIconMap[topic.icon] || BookOpen;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <Link href={`/learn/${topic.slug}`}>
                      <Card className="h-full glass-surface border-[2px] border-[#FF6B00]/40 hover:border-[#FF6B00]/70 shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_30px_rgba(255,107,0,0.35)] transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 gradient-fire rounded-lg">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
                              In Progress
                            </Badge>
                          </div>
                          <CardTitle className="text-white text-lg mt-2">{topic.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#B8A7E0]">Progress</span>
                              <span className="text-[#FF6B00]">{item.completionPercent}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className="gradient-fire h-2 rounded-full transition-all"
                                style={{ width: `${item.completionPercent}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full gradient-fire hover:shadow-glowOrange text-white text-sm">
                            Resume Learning
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Bookmarked Topics */}
              {bookmarkedTopics.map((item, index) => {
                const topic = item.topic;
                if (!topic) return null;
                const Icon = topicIconMap[topic.icon] || BookOpen;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (continueTopics.length + index) * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <Link href={`/learn/${topic.slug}`}>
                      <Card className="h-full glass-surface border-[2px] border-[#9C4AFF]/40 hover:border-[#9C4AFF]/70 shadow-[0_0_20px_rgba(156,74,255,0.2)] hover:shadow-[0_0_30px_rgba(156,74,255,0.35)] transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 gradient-violet rounded-lg">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <Badge className="bg-[#9C4AFF]/20 text-[#9C4AFF] border-[#9C4AFF]/30">
                              <Star className="h-3 w-3 mr-1" /> Bookmarked
                            </Badge>
                          </div>
                          <CardTitle className="text-white text-lg mt-2">{topic.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[#B8A7E0] text-sm line-clamp-2">{topic.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full gradient-violet hover:shadow-glowViolet text-white text-sm">
                            Start Learning
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Quick Quiz CTA if we have space */}
              {(continueTopics.length + bookmarkedTopics.length) < 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Link href="/learn/quiz">
                    <Card className="h-full glass-surface border-[2px] border-[#00E5FF]/40 hover:border-[#00E5FF]/70 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] transition-all cursor-pointer">
                      <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                        <Brain className="h-12 w-12 text-[#00E5FF] mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Quick Quiz</h3>
                        <p className="text-[#B8A7E0] text-sm mb-4">Test your knowledge across all topics</p>
                        <Button className="gradient-aqua hover:shadow-glowCyan text-white">
                          Start Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Instrument Scanner Section */}
      {!searchQuery && (
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full" />
          <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full" />

          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#00E5FF]/40 rounded-3xl p-8 glass-surface shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:border-[#00E5FF]/60 hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all">
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
                className="relative rounded-2xl overflow-hidden border-[2px] border-[#00E5FF]/40 shadow-[0_0_25px_rgba(0,229,255,0.3)]"
              >
                <img
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop"
                  alt="Instrument Scanner"
                  className="w-full h-full object-cover"
                  loading="lazy"
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
                    className="glass-surface border-[2px] border-[#00E5FF]/30 rounded-xl p-4 hover:border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 gradient-aqua rounded-lg">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">{feature.title}</h4>
                        <p className="text-[#B8A7E0] text-sm">{feature.desc}</p>
                      </div>
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
              <Suspense fallback={<SectionLoader />}>
                <InstrumentScanner />
              </Suspense>
            </motion.div>
          </div>
        </section>
      )}

      {/* Problem Solver Section */}
      {!searchQuery && (
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-[#FF00C8] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#9C4AFF]/40 rounded-3xl p-8 glass-surface shadow-[0_0_30px_rgba(156,74,255,0.3)] hover:border-[#9C4AFF]/60 hover:shadow-[0_0_40px_rgba(156,74,255,0.4)] transition-all">
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
                    className="glass-surface border-[2px] border-[#9C4AFF]/30 rounded-xl p-4 hover:border-[#9C4AFF]/60 shadow-[0_0_15px_rgba(156,74,255,0.2)] hover:shadow-[0_0_25px_rgba(156,74,255,0.3)] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 gradient-violet rounded-lg">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">{feature.title}</h4>
                        <p className="text-[#B8A7E0] text-sm">{feature.desc}</p>
                      </div>
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
                className="relative rounded-2xl overflow-hidden border-[2px] border-[#9C4AFF]/40 shadow-[0_0_25px_rgba(156,74,255,0.3)] order-1 lg:order-2"
              >
                <img
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop"
                  alt="Problem Solver"
                  className="w-full h-full object-cover"
                  loading="lazy"
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
              <Suspense fallback={<SectionLoader />}>
                <ProblemSolver />
              </Suspense>
            </motion.div>
          </div>
        </section>
      )}

      {/* Advanced Calculators & Tools */}
      {(!searchQuery || filteredTools.length > 0) && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#9C4AFF]/20 rounded-3xl p-8 glass-surface hover:border-[#9C4AFF]/40 transition-all">
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
                          loading="lazy"
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

      {/* Interactive Design Tools */}
      {!searchQuery && filteredTools.length > 3 && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#FF6B00]/20 rounded-3xl p-8 glass-surface hover:border-[#FF6B00]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                🎨 Interactive Design Tools
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Hands-on tools for circuit development, simulation, and professional layout design
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredTools.slice(3).map((tool, index) => {
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
                    <Card className="overflow-hidden glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all h-full">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={tool.image}
                          alt={tool.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 gradient-fire opacity-20" />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Icon className="h-5 w-5 text-[#FF6B00]" />
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="text-[#B8A7E0]">
                          {tool.description.split(', ').slice(0, 2).join(', ')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-[#B8A7E0] space-y-2">
                        <ul className="space-y-1 text-sm">
                          {tool.description.split(', ').map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Link href={tool.href} className="w-full">
                          <Button className="w-full gradient-fire hover:shadow-glowOrange text-white rounded-xl">
                            Launch Tool
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

      {/* Project Management Suite */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 w-[400px] h-[400px] bg-[#9C4AFF] opacity-15 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#9C4AFF]/20 rounded-3xl p-8 glass-surface hover:border-[#9C4AFF]/40 transition-all">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                📋 Project Management Suite
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Professional tools for planning, estimation, and project execution
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectManagementTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "50px" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link href={tool.href}>
                      <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all cursor-pointer h-full">
                        <CardHeader>
                          <Icon className="h-10 w-10 text-[#9C4AFF] mb-2" />
                          <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[#B8A7E0] text-sm">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Code Compliance Tools */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#00E5FF]/20 rounded-3xl p-8 glass-surface hover:border-[#00E5FF]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                ⚖️ Code Compliance Tools
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Ensure your designs meet electrical codes and standards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {codeComplianceTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link href={tool.href}>
                      <Card className="glass-surface border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all cursor-pointer h-full">
                        <CardHeader>
                          <Icon className="h-10 w-10 text-[#00E5FF] mb-2" />
                          <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[#B8A7E0] text-sm">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Diagnostic & Testing Tools */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#FF6B00]/20 rounded-3xl p-8 glass-surface hover:border-[#FF6B00]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                🔧 Diagnostic & Testing Tools
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Equipment maintenance, analysis, and reporting solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnosticTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link href={tool.href}>
                      <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all cursor-pointer h-full">
                        <CardHeader>
                          <Icon className="h-10 w-10 text-[#FF6B00] mb-2" />
                          <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[#B8A7E0] text-sm">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Advanced AI Features */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-violet opacity-30 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#FF00C8] opacity-25 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-25 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#9C4AFF]/20 rounded-3xl p-8 glass-surface hover:border-[#9C4AFF]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                ✨ Advanced AI Features
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Leverage artificial intelligence for code assistance, design, and troubleshooting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link href={feature.href}>
                      <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Icon className="h-10 w-10 text-[#9C4AFF]" />
                            {feature.isPro && (
                              <Badge className="gradient-fire text-white border-0">Pro</Badge>
                            )}
                          </div>
                          <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[#B8A7E0] text-sm">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Simulations */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#00E5FF]/20 rounded-3xl p-8 glass-surface hover:border-[#00E5FF]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                🎮 Interactive Simulations
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Immersive and educational experiences for hands-on learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interactiveSimulations.map((sim, index) => {
                const Icon = sim.icon;
                return (
                  <motion.div
                    key={sim.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link href={sim.href}>
                      <Card className="glass-surface border-2 border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all cursor-pointer h-full">
                        <CardHeader>
                          <Icon className="h-10 w-10 text-[#00E5FF] mb-2" />
                          <CardTitle className="text-lg text-white">{sim.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[#B8A7E0] text-sm">{sim.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick-Access Utilities */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2B0B4B] to-[#0A0014]" />
          <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#FF6B00] opacity-20 blur-[120px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#FF6B00]/20 rounded-3xl p-8 glass-surface hover:border-[#FF6B00]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                🔥 Quick-Access Utilities
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Essential everyday calculators for component and protection selection
              </p>
            </div>

            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative h-96 rounded-2xl overflow-hidden mb-8 border-2 border-[#FF6B00]/30 shadow-glowOrange"
              >
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/quick-access-electrical-utilities-dashbo-31822a66-20251026042846.jpg"
                  alt="Quick Utilities"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 gradient-fire opacity-60" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl">
                      <h3 className="text-3xl font-bold text-white mb-4 glow-text-orange">
                        Essential Component Calculators
                      </h3>
                      <p className="text-lg text-white/90 mb-6">
                        Fast, accurate tools for daily electrical engineering tasks
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {['Fuse/Breaker Selector', 'Voltage Divider', '555 Timer Designer', 'Opamp Calculator', 'Filter Designer', 'Thermal Management'].map((item, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-white"
                          >
                            <Gauge className="h-5 w-5 text-[#00E5FF]" />
                            <span>{item}</span>
                          </motion.div>
                        ))}
                      </div>
                      <Link href="/tools/quick-utilities">
                        <Button size="lg" className="glass-surface border-2 border-white/30 text-white hover:border-white hover:shadow-glowOrange font-semibold rounded-xl px-8 transition-all duration-300 hover:scale-105 uppercase tracking-wider">
                          Access All Utilities
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Educational & Training */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#9C4AFF]/20 rounded-3xl p-8 glass-surface hover:border-[#9C4AFF]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                🎓 Educational & Training
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Learning, troubleshooting, and professional development resources
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative h-96 rounded-2xl overflow-hidden border-2 border-[#9C4AFF]/30 shadow-glowViolet"
              >
                <img
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/educational-electrical-engineering-learn-74ff25a4-20251026042846.jpg"
                  alt="Educational Resources"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 gradient-violet opacity-40" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {[
                    { icon: BookOpen, title: 'Interactive Tutorials', desc: 'Step-by-step guides with embedded calculators and real-world examples', href: '/tutorials' },
                    { icon: Brain, title: 'Practice & Assessment', desc: 'Smart quizzes, mock exams, and personalized skill tracking', href: '/assessments' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link href={item.href}>
                        <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all cursor-pointer">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                              <item.icon className="h-5 w-5 text-[#9C4AFF]" />
                              {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-[#B8A7E0] text-sm">{item.desc}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link href="/assessments" className="flex-1">
                    <Button size="lg" className="w-full gradient-violet hover:shadow-glowViolet text-white font-semibold rounded-xl py-3 uppercase tracking-wider">
                      Start Practicing
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Advance Your Career Section */}
      {!searchQuery && (
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-fire opacity-30 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
          <div className="absolute top-0 left-0 w-full h-full bg-[#0A0014]/40" />
          
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#FF6B00] opacity-25 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-25 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />

          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#FF6B00]/20 rounded-3xl p-8 glass-surface hover:border-[#FF6B00]/40 transition-all">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Briefcase className="h-14 w-14 text-[#FF6B00] glow-text-orange" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Advance Your Career
                </h2>
              </div>
              <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
                Professional certifications, career tools, and curated job opportunities to accelerate your electrical engineering career
              </p>
            </motion.div>

            {/* Three Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Professional Certifications Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="glass-surface border-2 border-[#9C4AFF]/30 hover:border-[#9C4AFF]/60 hover:shadow-glowViolet transition-all h-full">
                  <CardHeader>
                    <div className="p-4 w-fit rounded-xl gradient-violet mb-4">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-2xl mb-2">Professional Certifications</CardTitle>
                    <CardDescription className="text-[#B8A7E0]">
                      FE Electrical, PE Power, Journeyman, Master
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#9C4AFF]" />
                        <span className="text-white font-semibold">87% Success Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#9C4AFF]" />
                        <span className="text-[#B8A7E0]">12.5k+ Students</span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {['Full exam simulators', 'Video solutions', 'AI study plans', 'Progress tracking'].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#9C4AFF]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/career?tab=certifications" className="w-full">
                      <Button className="w-full gradient-violet hover:shadow-glowViolet text-white font-semibold rounded-xl">
                        Explore Certifications
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Career Tools Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="glass-surface border-2 border-[#FF6B00]/30 hover:border-[#FF6B00]/60 hover:shadow-glowOrange transition-all h-full">
                  <CardHeader>
                    <div className="p-4 w-fit rounded-xl gradient-fire mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-2xl mb-2">Career Tools</CardTitle>
                    <CardDescription className="text-[#B8A7E0]">
                      Resume Builder, Portfolio, Interview Coach
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#FF6B00]" />
                        <span className="text-white font-semibold">50+ Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                        <span className="text-[#B8A7E0]">200+ Questions</span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {['ATS-friendly resumes', 'Portfolio generator', 'Interview prep AI', 'Salary negotiation'].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#FF6B00]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/career?tab=career-tools" className="w-full">
                      <Button className="w-full gradient-fire hover:shadow-glowOrange text-white font-semibold rounded-xl">
                        Access Career Tools
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Job Opportunities Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="glass-surface border-2 border-[#00E5FF]/30 hover:border-[#00E5FF]/60 hover:shadow-glowCyan transition-all h-full">
                  <CardHeader>
                    <div className="p-4 w-fit rounded-xl gradient-aqua mb-4">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-2xl mb-2">Job Opportunities</CardTitle>
                    <CardDescription className="text-[#B8A7E0]">
                      Tesla, Siemens, Apple, SpaceX & more
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-[#00E5FF]" />
                        <span className="text-white font-semibold">1,247 Listings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#00E5FF]" />
                        <span className="text-[#B8A7E0]">$118k Avg</span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {['Curated opportunities', 'Salary insights', 'Company reviews', 'Application tracking'].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/career?tab=job-board" className="w-full">
                      <Button className="w-full gradient-aqua hover:shadow-glowCyan text-white font-semibold rounded-xl">
                        Browse Jobs
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>

            {/* Stats Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="glass-surface border border-white/10 rounded-2xl p-8 mb-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Active Users', value: '12,500+', icon: Users },
                  { label: 'Success Rate', value: '87%', icon: Target },
                  { label: 'Certifications', value: '4', icon: Award },
                  { label: 'Job Listings', value: '1,247', icon: Briefcase },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <stat.icon className="h-8 w-8 text-[#FF6B00] mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-[#B8A7E0]">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link href="/career">
                <Button size="lg" className="gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl px-12 py-6 text-lg transition-all duration-300 hover:scale-105 uppercase tracking-wider">
                  Explore Career Center
                  <ChevronRight className="h-6 w-6 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Apps Carousel */}
      {(!searchQuery || filteredApps.length > 0) && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#FF6B00]/20 rounded-3xl p-8 glass-surface hover:border-[#FF6B00]/40 transition-all">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {searchQuery ? 'Matching Apps' : 'Featured Apps'}
                </h2>
                <p className="text-[#B8A7E0] mt-2">
                  {searchQuery 
                    ? `${filteredApps.length} app${filteredApps.length !== 1 ? 's' : ''} found`
                    : 'Explore our most popular electrical engineering tools'
                  }
                </p>
              </div>
              <Link href="/apps">
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-[#B8A7E0] hover:text-white hover:bg-white/10">
                  View All Apps
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {filteredApps.map((app) => (
                  <CarouselItem key={app.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all">
                      <CardHeader className="p-0">
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <img
                            src={app.image}
                            alt={app.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 gradient-fire opacity-20" />
                          {app.isPro && (
                            <Badge className="absolute top-3 right-3 gradient-violet text-white border-0">
                              Pro
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg text-white">{app.name}</CardTitle>
                        </div>
                        <CardDescription className="mb-3 text-[#B8A7E0]">{app.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                            <span className="font-medium text-white">{app.rating}</span>
                            <span className="text-[#B8A7E0]">({app.reviews})</span>
                          </div>
                          <Badge className="glass-surface text-[#B8A7E0] border-white/20">{app.category}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full gradient-fire hover:shadow-glowOrange text-white rounded-xl">
                          Launch App
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex border-white/20 text-white hover:bg-white/10" />
              <CarouselNext className="hidden md:flex border-white/20 text-white hover:bg-white/10" />
            </Carousel>

            <div className="md:hidden mt-6 text-center">
              <Link href="/apps">
                <Button variant="ghost" className="items-center gap-2 text-[#B8A7E0] hover:text-white hover:bg-white/10">
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
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-15 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#00E5FF]/20 rounded-3xl p-8 glass-surface hover:border-[#00E5FF]/40 transition-all">
            <h2 className="text-3xl font-bold text-white text-center mb-8 glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {searchQuery ? 'Quick Tools' : 'Quick Access Tools'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredQuickTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link href={tool.href}>
                      <Card className="glass-surface border-2 border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                          <Icon className="h-12 w-12 text-[#00E5FF] mb-3" />
                          <p className="font-semibold text-white">{tool.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {!searchQuery && (
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />
          
          <div className="container mx-auto max-w-6xl relative z-10 border-[3px] border-[#9C4AFF]/20 rounded-3xl p-8 glass-surface hover:border-[#9C4AFF]/40 transition-all">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                🚀 Interactive Project Builder
              </h2>
              <p className="text-lg text-[#B8A7E0] max-w-3xl mx-auto">
                Learn by doing! Build real electrical projects with step-by-step guided tutorials
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  title: 'Build a 3-Phase Motor Controller', 
                  difficulty: 'Intermediate',
                  time: '4 hours',
                  color: '#9C4AFF'
                },
                { 
                  title: 'Design a Solar Panel System', 
                  difficulty: 'Advanced',
                  time: '8 hours',
                  color: '#FF6B00'
                },
                { 
                  title: 'Create a Home Automation Circuit', 
                  difficulty: 'Beginner',
                  time: '2 hours',
                  color: '#00E5FF'
                },
              ].map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all h-full">
                    <CardHeader>
                      <CardTitle className="text-white">{project.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          style={{ 
                            background: `${project.color}33`,
                            color: project.color,
                            border: `1px solid ${project.color}66`
                          }}
                        >
                          {project.difficulty}
                        </Badge>
                        <span className="text-sm text-[#B8A7E0]">{project.time}</span>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/projects">
                <Button size="lg" className="gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl px-8 transition-all duration-300 hover:scale-105 uppercase tracking-wider">
                  Explore All Projects
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!searchQuery && (
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 gradient-violet opacity-50 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
          <div className="absolute top-0 left-0 w-full h-full bg-[#0A0014]/50" />
          
          <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#FF6B00] opacity-30 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#00E5FF] opacity-30 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />

          <div className="container mx-auto max-w-4xl text-center relative z-10 border-[3px] border-[#9C4AFF]/20 rounded-3xl p-12 glass-surface hover:border-[#9C4AFF]/40 transition-all">
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