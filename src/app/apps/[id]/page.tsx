'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ArrowLeft, Download, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export interface AppData {
  id: number;
  name: string;
  description: string;
  rating: number;
  reviews: number;
  category: string;
  isPro: boolean;
  purpose: string;
  necVersion: string;
  image: string;
  href: string | null;
}

export default function AppDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/apps/${id}`);
        if (res.ok) {
          const data = await res.json();
          setApp(data.app);
        }
      } catch (error) {
        console.error('Failed to fetch app details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-depth flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4AFF]"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen gradient-depth flex flex-col justify-center items-center text-white">
        <h1 className="text-3xl font-bold mb-4">App not found</h1>
        <Button onClick={() => router.push('/apps')} variant="outline" className="border-white/20 hover:bg-white/10">
          Return to Apps Library
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto max-w-5xl py-8 px-4 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#B8A7E0] mb-8">
          <button onClick={() => router.push('/apps')} className="hover:text-white flex items-center transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Apps Library
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{app.name}</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden glass-surface border border-white/10 aspect-video shadow-glowViolet">
            <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
            {app.isPro && (
              <Badge className="absolute top-4 right-4 gradient-violet text-white border-0 text-sm py-1 px-3">
                <Zap className="h-4 w-4 mr-1" />
                Pro Edition
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {app.name}
            </h1>
            <p className="text-lg text-[#B8A7E0] mb-6">{app.description}</p>
            
            <div className="flex items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-[#FF6B00] text-[#FF6B00]" />
                <span className="font-bold text-white text-lg">{app.rating}</span>
                <span className="text-[#B8A7E0] ml-1">({app.reviews.toLocaleString()} reviews)</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <Badge className="glass-surface text-[#00E5FF] border-[#00E5FF]/30 px-3 py-1">
                NEC {app.necVersion}
              </Badge>
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="gradient-violet hover:shadow-glowViolet text-white flex-1 text-lg font-semibold"
                onClick={() => app.href ? router.push(app.href) : console.log('Launch App', app.id)}
              >
                {app.href ? 'Launch App' : 'Get Started'}
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-[#B8A7E0] hover:text-white hover:bg-white/10 w-14 p-0">
                <Download className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-3 gap-6"
        >
          <Card className="glass-surface border-white/10">
            <CardContent className="p-6">
              <h3 className="text-[#B8A7E0] text-sm font-semibold uppercase tracking-wider mb-2">Category</h3>
              <p className="text-xl font-medium text-white">{app.category}</p>
            </CardContent>
          </Card>
          <Card className="glass-surface border-white/10">
            <CardContent className="p-6">
              <h3 className="text-[#B8A7E0] text-sm font-semibold uppercase tracking-wider mb-2">Primary Purpose</h3>
              <p className="text-xl font-medium text-white">{app.purpose}</p>
            </CardContent>
          </Card>
          <Card className="glass-surface border-white/10">
            <CardContent className="p-6">
              <h3 className="text-[#B8A7E0] text-sm font-semibold uppercase tracking-wider mb-2">Access Level</h3>
              <p className="text-xl font-medium text-white flex items-center gap-2">
                {app.isPro ? (
                  <><Zap className="h-5 w-5 text-[#9C4AFF]" /> Pro Version</>
                ) : (
                  'Free Edition'
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
