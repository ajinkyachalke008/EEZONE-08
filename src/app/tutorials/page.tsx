'use client';

import { useState } from 'react';
import { BookOpen, Video, Download, Clock, Users, Star, Play, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const videoTutorials = [
  {
    id: 1,
    title: 'Understanding Three-Phase Power Systems',
    description: 'Comprehensive guide to three-phase electrical systems, including delta and wye configurations',
    duration: '24:15',
    views: 45600,
    rating: 4.9,
    category: 'Power Systems',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 2,
    title: 'NEC Code Basics for Beginners',
    description: 'Essential National Electrical Code requirements every electrician should know',
    duration: '18:42',
    views: 67800,
    rating: 4.8,
    category: 'Code & Safety',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 3,
    title: 'Motor Control Circuits Explained',
    description: 'Learn how to design and troubleshoot motor control circuits with practical examples',
    duration: '31:20',
    views: 32400,
    rating: 4.7,
    category: 'Motor Controls',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 4,
    title: 'Grounding and Bonding Fundamentals',
    description: 'Master the concepts of grounding and bonding for safe electrical installations',
    duration: '22:35',
    views: 54200,
    rating: 4.9,
    category: 'Code & Safety',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 5,
    title: 'PLC Programming for Electricians',
    description: 'Introduction to programmable logic controllers and ladder logic programming',
    duration: '42:18',
    views: 28900,
    rating: 4.8,
    category: 'Automation',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 6,
    title: 'Residential Wiring Best Practices',
    description: 'Step-by-step guide to proper residential electrical installation techniques',
    duration: '27:45',
    views: 89300,
    rating: 4.9,
    category: 'Installation',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

const downloadableResources = [
  {
    id: 1,
    title: 'Complete Wire Ampacity Chart',
    description: 'Comprehensive reference for conductor ampacity ratings per NEC standards',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    downloads: 15600,
    category: 'Reference',
  },
  {
    id: 2,
    title: 'Electrical Symbols Library',
    description: 'Standard electrical schematic symbols for circuit diagrams',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    downloads: 23400,
    category: 'Design',
  },
  {
    id: 3,
    title: 'Conduit Fill Tables',
    description: 'NEC Chapter 9 conduit and tubing fill tables for easy reference',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    downloads: 18900,
    category: 'Reference',
  },
  {
    id: 4,
    title: 'Motor Full-Load Current Tables',
    description: 'Quick reference for motor full-load amperage calculations',
    fileType: 'PDF',
    fileSize: '950 KB',
    downloads: 12300,
    category: 'Reference',
  },
  {
    id: 5,
    title: 'Panel Schedule Template',
    description: 'Professional electrical panel schedule template in Excel format',
    fileType: 'XLSX',
    fileSize: '125 KB',
    downloads: 34500,
    category: 'Templates',
  },
  {
    id: 6,
    title: 'Voltage Drop Calculation Guide',
    description: 'Detailed guide with examples for calculating voltage drop',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    downloads: 21700,
    category: 'Calculations',
  },
];

const articles = [
  {
    id: 1,
    title: 'Understanding Arc Flash Hazards',
    excerpt: 'Learn about arc flash hazards, PPE requirements, and how to perform risk assessments',
    readTime: 8,
    category: 'Safety',
    author: 'John Martinez',
  },
  {
    id: 2,
    title: 'Sizing Transformers for Commercial Buildings',
    excerpt: 'A practical guide to selecting and sizing transformers for commercial electrical systems',
    readTime: 12,
    category: 'Design',
    author: 'Sarah Johnson',
  },
  {
    id: 3,
    title: 'Solar Panel System Design Basics',
    excerpt: 'Introduction to designing photovoltaic systems including sizing and component selection',
    readTime: 15,
    category: 'Renewable Energy',
    author: 'Michael Chen',
  },
  {
    id: 4,
    title: 'Troubleshooting Common Electrical Faults',
    excerpt: 'Systematic approach to diagnosing and resolving electrical system problems',
    readTime: 10,
    category: 'Troubleshooting',
    author: 'Lisa Anderson',
  },
];

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const filteredVideos = videoTutorials.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-2">Tutorials & Learning</h1>
          <p className="text-gray-600">Expand your electrical engineering knowledge with our comprehensive resources</p>
        </div>

        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="downloads">
              <Download className="h-4 w-4 mr-2" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="articles">
              <BookOpen className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
          </TabsList>

          {/* Video Tutorials */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#071428]">Video Tutorials</h2>
                <p className="text-gray-600 mt-1">Professional electrical engineering video courses</p>
              </div>
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:w-80"
              />
            </div>

            {/* Video Modal */}
            {selectedVideo !== null && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
                <div className="bg-white rounded-lg max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{videoTutorials[selectedVideo - 1]?.title}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)}>
                      ✕
                    </Button>
                  </div>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={videoTutorials[selectedVideo - 1]?.videoUrl}
                      title={videoTutorials[selectedVideo - 1]?.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          className="h-16 w-16 rounded-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                          onClick={() => setSelectedVideo(video.id)}
                        >
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                      </div>
                      <Badge className="absolute top-3 right-3 bg-[#071428]">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{video.category}</Badge>
                      <Badge variant="outline">{video.level}</Badge>
                    </div>
                    <CardTitle className="text-lg mb-2">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">{video.description}</CardDescription>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{video.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{video.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-[#071428] hover:bg-[#071428]/90"
                      onClick={() => setSelectedVideo(video.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Tutorial
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Downloadable Resources */}
          <TabsContent value="downloads" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#071428]">Downloadable Resources</h2>
              <p className="text-gray-600 mt-1">Free reference materials, templates, and calculation guides</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloadableResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="bg-[#00C2D1]/10 p-3 rounded-lg">
                        <FileText className="h-8 w-8 text-[#00C2D1]" />
                      </div>
                      <Badge>{resource.fileType}</Badge>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{resource.fileSize}</span>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{resource.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-3">{resource.category}</Badge>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="bg-[#071428] text-white border-none">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Need More Resources?</h3>
                <p className="text-gray-300 mb-4">
                  Upgrade to Pro for access to our complete library of professional templates and calculators
                </p>
                <Button className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles */}
          <TabsContent value="articles" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#071428]">Articles & Guides</h2>
              <p className="text-gray-600 mt-1">In-depth articles on electrical engineering topics</p>
            </div>

            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{article.category}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min read
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                        <CardDescription className="text-base">{article.excerpt}</CardDescription>
                        <p className="text-sm text-gray-500 mt-2">By {article.author}</p>
                      </div>
                      <Button className="bg-[#071428] hover:bg-[#071428]/90 whitespace-nowrap">
                        Read Article
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-[#071428] to-[#0a1f3d] text-white border-none">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Want to Contribute?</h3>
                    <p className="text-gray-300">
                      Share your knowledge with the EE Zone community. Submit your articles and tutorials.
                    </p>
                  </div>
                  <Button className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold whitespace-nowrap">
                    Submit Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
