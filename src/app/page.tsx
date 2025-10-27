'use client';

import { useState, useMemo } from 'react';
import { Search, Briefcase, GraduationCap, Wrench, ChevronRight, Star, Zap, Calculator, BookOpen, Cpu, Settings, Lightbulb, CircuitBoard, FileText, Gauge, GraduationCap as EducationIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { InstrumentScanner } from '@/components/instrument-scanner';
import { ProblemSolver } from '@/components/problem-solver';
import { Header } from '@/components/header';
import Link from 'next/link';

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
    href: '/tutorials',
    icon: FileText,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e24d0c9e-e4fc-4077-96b8-bf644fe969e3/generated_images/electrical-schematic-editor-and-wiring-d-edc888a6-20251026042846.jpg',
  },
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
    <div className="min-h-screen">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Search Results Section */}
      {hasSearchResults && (
        <section className="bg-gray-50 py-8 px-4 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#071428]">
                Search Results for "{searchQuery}"
              </h2>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="text-gray-600 hover:text-[#071428]"
              >
                Clear Search
              </Button>
            </div>
            <p className="text-gray-600">
              Found {filteredApps.length + filteredTools.length + filteredQuickTools.length} results
            </p>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {hasNoResults && (
        <section className="bg-gray-50 py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#071428] mb-2">
              No results found for "{searchQuery}"
            </h2>
            <p className="text-gray-600 mb-6">
              Try searching with different keywords or browse our categories below
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
            >
              Clear Search
            </Button>
          </div>
        </section>
      )}

      {/* Hero Section - Hidden when searching */}
      {!searchQuery && (
        <section className="bg-[#071428] text-white py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Your Complete <span className="text-[#00C2D1]">Electrical & Electronics</span> Platform
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                Access professional tools, calculators, tutorials, and resources designed for EEE professionals, students, and technicians.
              </p>

              {/* Search Bar */}
              <form onSubmit={(e) => { e.preventDefault(); }} className="max-w-2xl mx-auto mt-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search apps, calculators, tutorials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-white text-black border-none"
                    />
                  </div>
                  <Button type="button" onClick={() => handleSearch(searchQuery)} className="h-12 px-6 bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
                    Search
                  </Button>
                </div>
              </form>

              {/* Role Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.type;
                  return (
                    <Card
                      key={role.type}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        isSelected
                          ? 'bg-[#00C2D1] border-[#00C2D1] text-[#071428]'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                      onClick={() => setSelectedRole(role.type)}
                    >
                      <CardHeader>
                        <Icon className="h-10 w-10 mb-2" />
                        <CardTitle className={isSelected ? 'text-[#071428]' : 'text-white'}>
                          {role.title}
                        </CardTitle>
                        <CardDescription className={isSelected ? 'text-[#071428]/80' : 'text-gray-300'}>
                          {role.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Instrument Scanner Section - Hidden when searching */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-[#071428]">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">AI-Powered Instrument Scanner</h2>
              <p className="text-gray-300">Instantly identify any electrical or electronic instrument with advanced AI</p>
            </div>
            <InstrumentScanner />
          </div>
        </section>
      )}

      {/* Problem Solver Section - Hidden when searching */}
      {!searchQuery && (
        <section className="py-16 px-4 bg-gradient-to-b from-[#071428] to-[#0a1d38]">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">AI Problem Solver</h2>
              <p className="text-gray-300">Get detailed step-by-step solutions for electrical & electronics numerical problems</p>
            </div>
            <ProblemSolver />
          </div>
        </section>
      )}

      {/* Advanced Calculators & Tools */}
      {(!searchQuery || filteredTools.length > 0) && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#071428] mb-4">
                {searchQuery ? 'Tool Categories' : 'Advanced Calculators & Tools'}
              </h2>
              {!searchQuery && (
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  High-level design and analysis tools for power systems, motors, drives, and energy management
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {filteredTools.slice(0, 3).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card key={tool.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-[#00C2D1]" />
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ul className="text-sm text-gray-600 space-y-1">
                        {tool.description.split(', ').map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href={tool.href} className="w-full">
                        <Button className="w-full bg-[#071428] hover:bg-[#071428]/90">
                          Explore Tools
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

      {/* CTA Section - Hidden when searching */}
      {!searchQuery && (
        <section className="bg-[#071428] text-white py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Level Up Your EE Skills?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of professionals using EE Zone for their daily electrical engineering needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Explore Features
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}