'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Download, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WireSizeCalculator } from '@/components/apps/wire-size-calculator';
import { LoadCalculator } from '@/components/apps/load-calculator';
import { FaultCurrentCalculator } from '@/components/apps/fault-current-calculator';

const apps = [
  {
    id: 1,
    name: 'Circuit Simulator Pro',
    description: 'Advanced circuit simulation with real-time analysis and comprehensive component library',
    longDescription: 'Professional-grade circuit simulation tool for electrical engineers. Features include real-time circuit analysis, comprehensive component library, schematic capture, and detailed simulation results.',
    rating: 4.8,
    reviews: 2340,
    category: 'Design',
    isPro: true,
    features: ['Real-time Analysis', 'Component Library', 'Schematic Capture', 'Export Results'],
  },
  {
    id: 2,
    name: 'NEC Code Reference',
    description: 'Complete National Electrical Code database with search and bookmarks',
    longDescription: 'Access the complete National Electrical Code database with advanced search, bookmarks, and quick reference tools. Stay compliant with the latest electrical standards.',
    rating: 4.9,
    reviews: 5678,
    category: 'Reference',
    isPro: false,
    features: ['Full NEC Database', 'Advanced Search', 'Bookmarks', 'Quick Reference'],
  },
  {
    id: 3,
    name: 'Load Calculator',
    description: 'Calculate electrical loads for residential & commercial installations',
    longDescription: 'Calculate electrical loads accurately for residential and commercial installations. Supports NEC requirements and provides detailed load analysis.',
    rating: 4.7,
    reviews: 1890,
    category: 'Calculator',
    isPro: false,
    features: ['Residential Load Calc', 'Commercial Load Calc', 'NEC Compliant', 'Detailed Reports'],
    component: LoadCalculator,
  },
  {
    id: 4,
    name: 'Power Quality Analyzer',
    description: 'Monitor and analyze power quality issues in real-time',
    longDescription: 'Professional power quality analysis tool for monitoring harmonics, voltage sags, swells, and other power quality issues in electrical systems.',
    rating: 4.6,
    reviews: 982,
    category: 'Analysis',
    isPro: true,
    features: ['Harmonic Analysis', 'Voltage Monitoring', 'Real-time Data', 'Report Generation'],
  },
  {
    id: 5,
    name: 'Wire Size Calculator',
    description: 'Determine proper wire gauge based on ampacity and voltage drop',
    longDescription: 'Calculate the correct wire size based on ampacity, voltage drop, and installation conditions. Ensures safe and compliant electrical installations.',
    rating: 4.8,
    reviews: 3421,
    category: 'Calculator',
    isPro: false,
    features: ['Ampacity Calculations', 'Voltage Drop Analysis', 'Multiple Wire Types', 'NEC Tables'],
    component: WireSizeCalculator,
  },
  {
    id: 6,
    name: 'Panel Schedule Builder',
    description: 'Create professional electrical panel schedules quickly',
    longDescription: 'Build professional panel schedules with drag-and-drop interface. Export to PDF or Excel for documentation and project submissions.',
    rating: 4.7,
    reviews: 1567,
    category: 'Design',
    isPro: true,
    features: ['Drag & Drop', 'Custom Templates', 'PDF Export', 'Load Balancing'],
  },
  {
    id: 7,
    name: 'Fault Current Calculator',
    description: 'Calculate short circuit and fault currents for system protection',
    longDescription: 'Calculate short circuit currents and fault levels for proper protection device selection and coordination. Essential for electrical system design.',
    rating: 4.9,
    reviews: 2103,
    category: 'Calculator',
    isPro: false,
    features: ['Short Circuit Calc', 'Fault Analysis', 'Protection Coordination', 'IEEE Standards'],
    component: FaultCurrentCalculator,
  },
  {
    id: 8,
    name: 'Motor Control Designer',
    description: 'Design motor control circuits with protection and control logic',
    longDescription: 'Design motor control circuits with proper protection, control logic, and sizing. Supports various motor types and control schemes.',
    rating: 4.5,
    reviews: 876,
    category: 'Design',
    isPro: true,
    features: ['Motor Sizing', 'Protection Design', 'Control Logic', 'Schematic Export'],
  },
  {
    id: 9,
    name: 'Lighting Design Tool',
    description: 'Plan and calculate lighting layouts for optimal illumination',
    longDescription: 'Professional lighting design tool for calculating illumination levels, fixture placement, and energy consumption. Meets IES standards.',
    rating: 4.6,
    reviews: 1234,
    category: 'Design',
    isPro: false,
    features: ['Illumination Calc', 'Fixture Library', 'Energy Analysis', 'IES Standards'],
  },
];

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = parseInt(params.id as string);
  const app = apps.find(a => a.id === appId);

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>App Not Found</CardTitle>
            <CardDescription>The app you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/apps')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Apps Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const AppComponent = app.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#071428] text-white py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80 hover:bg-white/10 mb-4"
            onClick={() => router.push('/apps')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apps
          </Button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{app.name}</h1>
                {app.isPro && (
                  <Badge className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">Pro</Badge>
                )}
              </div>
              <p className="text-gray-300 mb-4 text-lg">{app.description}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-[#00C2D1] text-[#00C2D1]" />
                  <span className="font-medium text-lg">{app.rating}</span>
                  <span className="text-gray-400">({app.reviews.toLocaleString()} reviews)</span>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">{app.category}</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* App Content */}
      <div className="container mx-auto max-w-7xl py-8 px-4">
        {AppComponent ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <AppComponent />
          </div>
        ) : (
          <div className="space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About {app.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{app.longDescription}</p>
                <div className="flex flex-wrap gap-2">
                  {app.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Section */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Demo</CardTitle>
                <CardDescription>
                  Experience the full power of {app.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <ExternalLink className="h-16 w-16 text-[#00C2D1] mb-4" />
                  <h3 className="text-xl font-semibold text-[#071428] mb-2">
                    Full App Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    This app is currently under development. Check back soon for the complete interactive experience!
                  </p>
                  <Button className="bg-[#071428] hover:bg-[#071428]/90">
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {app.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#00C2D1]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-[#00C2D1]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#071428]">{feature}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
