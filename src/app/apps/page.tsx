'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
    router.push(`/apps/${appId}`);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3">Pricing</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="free"
              checked={selectedPricing.includes('free')}
              onCheckedChange={() => toggleFilter(selectedPricing, setSelectedPricing, 'free')}
            />
            <Label htmlFor="free" className="cursor-pointer">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pro"
              checked={selectedPricing.includes('pro')}
              onCheckedChange={() => toggleFilter(selectedPricing, setSelectedPricing, 'pro')}
            />
            <Label htmlFor="pro" className="cursor-pointer">Pro</Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Purpose</h3>
        <div className="space-y-2">
          {purposes.map((purpose) => (
            <div key={purpose} className="flex items-center space-x-2">
              <Checkbox
                id={purpose}
                checked={selectedPurpose.includes(purpose)}
                onCheckedChange={() => toggleFilter(selectedPurpose, setSelectedPurpose, purpose)}
              />
              <Label htmlFor={purpose} className="cursor-pointer text-sm">{purpose}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">NEC Version</h3>
        <div className="space-y-2">
          {necVersions.map((version) => (
            <div key={version} className="flex items-center space-x-2">
              <Checkbox
                id={version}
                checked={selectedNEC.includes(version)}
                onCheckedChange={() => toggleFilter(selectedNEC, setSelectedNEC, version)}
              />
              <Label htmlFor={version} className="cursor-pointer">{version}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Minimum Rating</h3>
        <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Ratings</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
            <SelectItem value="4.7">4.7+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-2">Apps Library</h1>
          <p className="text-gray-600">Discover professional electrical engineering applications</p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Apps</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  {(selectedPricing.length > 0 || selectedPurpose.length > 0 || selectedNEC.length > 0 || minRating > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Apps Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-600">
              Showing {sortedApps.length} of {apps.length} apps
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApps.map((app) => (
                <Card key={app.id} className="h-full hover:shadow-xl transition-all hover:scale-105 group">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={app.image}
                        alt={app.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {app.isPro && (
                        <Badge className="absolute top-3 right-3 bg-[#00C2D1] text-[#071428]">
                          Pro
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg mb-2">{app.name}</CardTitle>
                    <CardDescription className="mb-3 line-clamp-2">{app.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{app.rating}</span>
                        <span className="text-gray-500">({app.reviews})</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{app.category}</Badge>
                      <Badge variant="outline">NEC {app.necVersion}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      className="flex-1 bg-[#071428] hover:bg-[#071428]/90"
                      onClick={() => handleLaunchApp(app.id)}
                    >
                      Launch
                    </Button>
                    <Button variant="outline" size="icon">
                      <Star className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {sortedApps.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No apps found matching your criteria</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}