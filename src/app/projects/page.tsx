'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Zap, Clock, Eye, Heart, Star, Wrench, Lightbulb, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/header';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  authorName: string;
  thumbnailUrl: string | null;
  viewsCount: number;
  likesCount: number;
  ratingAverage: number;
  ratingCount: number;
  tags: string;
}

const difficultyColors = {
  beginner: { bg: '#00E5FF', text: 'Beginner' },
  intermediate: { bg: '#9C4AFF', text: 'Intermediate' },
  advanced: { bg: '#FF6B00', text: 'Advanced' },
};

const categoryIcons: Record<string, any> = {
  motor_controller: Wrench,
  solar_panel: Lightbulb,
  home_automation: Home,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [categoryFilter, difficultyFilter, searchQuery]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);
      
      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();
      setProjects(data);
    } catch {
      // Silent fail - projects will show empty state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-depth">
      <Header 
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🚀 Interactive Project Builder
            </h1>
            <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
              Learn by doing! Build real electrical projects with step-by-step guided tutorials
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8A7E0] h-5 w-5" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-surface backdrop-blur-glass text-white border-white/20 focus:border-[#9C4AFF]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] glass-surface border-white/20 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass-surface border-white/20 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="motor_controller">Motor Controllers</SelectItem>
                <SelectItem value="solar_panel">Solar Systems</SelectItem>
                <SelectItem value="home_automation">Home Automation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-[200px] glass-surface border-white/20 text-white">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="glass-surface border-white/20 text-white">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9C4AFF]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => {
                const CategoryIcon = categoryIcons[project.category] || Wrench;
                const difficultyColor = difficultyColors[project.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                  >
                    <Link href={`/projects/${project.id}`}>
                      <Card className="h-full glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="p-3 gradient-violet rounded-lg">
                              <CategoryIcon className="h-6 w-6 text-white" />
                            </div>
                            <Badge 
                              style={{ 
                                background: `${difficultyColor.bg}33`,
                                color: difficultyColor.bg,
                                border: `1px solid ${difficultyColor.bg}66`
                              }}
                            >
                              {difficultyColor.text}
                            </Badge>
                          </div>
                          <CardTitle className="text-white">{project.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] line-clamp-2">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-[#B8A7E0] mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{project.estimatedTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{project.viewsCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{project.likesCount}</span>
                            </div>
                          </div>
                          {project.ratingCount > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                                <span className="text-white font-semibold">{project.ratingAverage.toFixed(1)}</span>
                              </div>
                              <span className="text-[#B8A7E0] text-sm">({project.ratingCount} reviews)</span>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t border-white/10 pt-4">
                          <div className="flex items-center justify-between w-full">
                            <p className="text-sm text-[#B8A7E0]">
                              by <span className="text-[#9C4AFF]">{project.authorName}</span>
                            </p>
                            <Button size="sm" className="gradient-fire text-white hover:shadow-glowOrange">
                              Start Building
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-20">
              <Zap className="h-16 w-16 text-[#9C4AFF] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Projects Found</h3>
              <p className="text-[#B8A7E0]">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}