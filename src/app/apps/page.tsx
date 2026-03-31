'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Filter, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

const apps = [
  {
    id: 1,
    name: 'Circuit Simulator Pro',
    description: 'Advanced circuit simulation with real-time analysis and comprehensive component library',
    rating: 4.8,
    reviews: 2340,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'NEC Code Reference',
    description: 'Complete National Electrical Code database with search and bookmarks',
    rating: 4.9,
    reviews: 5678,
    category: 'Reference',
    isPro: false,
    purpose: 'Code Reference',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Load Calculator',
    description: 'Calculate electrical loads for residential & commercial installations',
    rating: 4.7,
    reviews: 1890,
    category: 'Calculator',
    isPro: false,
    purpose: 'Calculations',
    necVersion: '2020',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Power Quality Analyzer',
    description: 'Monitor and analyze power quality issues in real-time',
    rating: 4.6,
    reviews: 982,
    category: 'Analysis',
    isPro: true,
    purpose: 'Analysis & Testing',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    name: 'Wire Size Calculator',
    description: 'Determine proper wire gauge based on ampacity and voltage drop',
    rating: 4.8,
    reviews: 3421,
    category: 'Calculator',
    isPro: false,
    purpose: 'Calculations',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    name: 'Panel Schedule Builder',
    description: 'Create professional electrical panel schedules quickly',
    rating: 4.7,
    reviews: 1567,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2020',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
  },
  {
    id: 7,
    name: 'Fault Current Calculator',
    description: 'Calculate short circuit and fault currents for system protection',
    rating: 4.9,
    reviews: 2103,
    category: 'Calculator',
    isPro: false,
    purpose: 'Calculations',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  },
  {
    id: 8,
    name: 'Motor Control Designer',
    description: 'Design motor control circuits with protection and control logic',
    rating: 4.5,
    reviews: 876,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2020',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
  },
  {
    id: 9,
    name: 'Lighting Design Tool',
    description: 'Plan and calculate lighting layouts for optimal illumination',
    rating: 4.6,
    reviews: 1234,
    category: 'Design',
    isPro: false,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop',
  },
  {
    id: 10,
    name: 'Pro Diagram Editor',
    description: 'AI-powered circuit diagramming with Mermaid, export to PNG/SVG/PDF, and 1000+ electrical symbols',
    rating: 4.9,
    reviews: 4210,
    category: 'Design',
    isPro: true,
    purpose: 'Design & Simulation',
    necVersion: '2023',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    href: '/tools/diagram-editor',
  },
];

export default function AppsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<string[]>([]);
  const [selectedNEC, setSelectedNEC] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('popular');

  const purposes = ['Design & Simulation', 'Calculations', 'Code Reference', 'Analysis & Testing'];
  const necVersions = ['2023', '2020', '2017'];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPricing = selectedPricing.length === 0 ||
                           (selectedPricing.includes('free') && !app.isPro) ||
                           (selectedPricing.includes('pro') && app.isPro);
    const matchesPurpose = selectedPurpose.length === 0 || selectedPurpose.includes(app.purpose);
    const matchesNEC = selectedNEC.length === 0 || selectedNEC.includes(app.necVersion);
    const matchesRating = app.rating >= minRating;

    return matchesSearch && matchesPricing && matchesPurpose && matchesNEC && matchesRating;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'popular') return b.reviews - a.reviews;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const toggleFilter = (filterArray: string[], setFilter: (arr: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(v => v !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearFilters = () => {
    setSelectedPricing([]);
    setSelectedPurpose([]);
    setSelectedNEC([]);
    setMinRating(0);
  };

  const handleLaunchApp = (appId: number) => {
    const app = apps.find(a => a.id === appId);
    if (app && 'href' in app && app.href) {
      router.push(app.href as string);
    } else {
      router.push(`/apps/${appId}`);
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3 text-white">Pricing</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="free"
              checked={selectedPricing.includes('free')}
              onCheckedChange={() => toggleFilter(selectedPricing, setSelectedPricing, 'free')}
            />
            <Label htmlFor="free" className="cursor-pointer text-[#B8A7E0]">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pro"
              checked={selectedPricing.includes('pro')}
              onCheckedChange={() => toggleFilter(selectedPricing, setSelectedPricing, 'pro')}
            />
            <Label htmlFor="pro" className="cursor-pointer text-[#B8A7E0]">Pro</Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3 text-white">Purpose</h3>
        <div className="space-y-2">
          {purposes.map((purpose) => (
            <div key={purpose} className="flex items-center space-x-2">
              <Checkbox
                id={purpose}
                checked={selectedPurpose.includes(purpose)}
                onCheckedChange={() => toggleFilter(selectedPurpose, setSelectedPurpose, purpose)}
              />
              <Label htmlFor={purpose} className="cursor-pointer text-sm text-[#B8A7E0]">{purpose}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3 text-white">NEC Version</h3>
        <div className="space-y-2">
          {necVersions.map((version) => (
            <div key={version} className="flex items-center space-x-2">
              <Checkbox
                id={version}
                checked={selectedNEC.includes(version)}
                onCheckedChange={() => toggleFilter(selectedNEC, setSelectedNEC, version)}
              />
              <Label htmlFor={version} className="cursor-pointer text-[#B8A7E0]">{version}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3 text-white">Minimum Rating</h3>
        <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger className="glass-surface text-white border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-surface border-white/20 text-white">
            <SelectItem value="0">All Ratings</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
            <SelectItem value="4.7">4.7+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full border-white/20 text-[#B8A7E0] hover:text-white hover:bg-white/10">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/2 w-[300px] h-[300px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto max-w-7xl py-8 px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-10 w-10 text-[#9C4AFF] glow-text-violet" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Apps Library
            </h1>
          </div>
          <p className="text-lg text-[#B8A7E0]">Discover professional electrical engineering applications</p>
        </motion.div>

        {/* Search and Sort */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8A7E0] h-5 w-5" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-surface backdrop-blur-glass text-white border-white/20 focus:border-[#9C4AFF] focus:ring-[#9C4AFF] placeholder:text-[#B8A7E0]"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] glass-surface text-white border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-surface border-white/20 text-white">
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden glass-surface border-white/20 text-white hover:bg-white/10">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-surface border-white/10">
              <SheetHeader>
                <SheetTitle className="text-white">Filter Apps</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:block w-64 flex-shrink-0"
          >
            <Card className="sticky top-20 glass-surface border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Filters</span>
                  {(selectedPricing.length > 0 || selectedPurpose.length > 0 || selectedNEC.length > 0 || minRating > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#B8A7E0] hover:text-white">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSidebar />
              </CardContent>
            </Card>
          </motion.aside>

          {/* Apps Grid */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mb-4 text-sm text-[#B8A7E0]"
            >
              Showing <span className="text-white font-semibold">{sortedApps.length}</span> of <span className="text-white font-semibold">{apps.length}</span> apps
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Card className="h-full glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all group">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                        <img
                          src={app.image}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        {app.isPro && (
                          <Badge className="absolute top-3 right-3 gradient-violet text-white border-0">
                            <Zap className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0014]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CardTitle className="text-lg mb-2 text-white">{app.name}</CardTitle>
                      <CardDescription className="mb-3 line-clamp-2 text-[#B8A7E0]">{app.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                          <span className="font-medium text-white">{app.rating}</span>
                          <span className="text-[#B8A7E0]">({app.reviews})</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="glass-surface text-[#B8A7E0] border-white/20">{app.category}</Badge>
                        <Badge className="glass-surface text-[#00E5FF] border-[#00E5FF]/30">NEC {app.necVersion}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1 gradient-violet hover:shadow-glowViolet text-white"
                        onClick={() => handleLaunchApp(app.id)}
                      >
                        Launch
                      </Button>
                      <Button variant="outline" size="icon" className="border-white/20 text-[#B8A7E0] hover:text-white hover:bg-white/10">
                        <Star className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {sortedApps.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glass-surface border border-white/10 rounded-2xl"
              >
                <Search className="h-16 w-16 text-[#9C4AFF] mx-auto mb-4" />
                <p className="text-[#B8A7E0] text-lg mb-4">No apps found matching your criteria</p>
                <Button onClick={clearFilters} className="gradient-fire text-white hover:shadow-glowOrange">
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}