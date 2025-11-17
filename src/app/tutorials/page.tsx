'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Video, Download, Clock, Users, Star, Play, FileText, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AIAssistantChat } from '@/components/ai-assistant-chat';
import { toast } from 'sonner';

interface VideoTutorial {
  id: number;
  title: string;
  description: string;
  duration: string;
  views: number;
  rating: number;
  category: string;
  level: string;
  thumbnailUrl: string;
  videoUrl: string;
  author: string;
  tags: string;
}

interface DownloadableResource {
  id: number;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  fileUrl: string;
  downloads: number;
  category: string;
  tags: string;
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  readTime: number;
  category: string;
  author: string;
  authorAvatar: string | null;
  views: number;
  likes: number;
  thumbnailUrl: string | null;
  tags: string;
}

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  
  // Videos state
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState<string | null>(null);
  
  // Resources state
  const [resources, setResources] = useState<DownloadableResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  
  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await fetch('/api/tutorials/videos');
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data);
        setVideosError(null);
      } catch (error) {
        setVideosError(error instanceof Error ? error.message : 'Failed to load videos');
        toast.error('Failed to load video tutorials');
      } finally {
        setVideosLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourcesLoading(true);
        const response = await fetch('/api/tutorials/resources');
        if (!response.ok) throw new Error('Failed to fetch resources');
        const data = await response.json();
        setResources(data);
        setResourcesError(null);
      } catch (error) {
        setResourcesError(error instanceof Error ? error.message : 'Failed to load resources');
        toast.error('Failed to load downloadable resources');
      } finally {
        setResourcesLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const response = await fetch('/api/tutorials/articles');
        if (!response.ok) throw new Error('Failed to fetch articles');
        const data = await response.json();
        setArticles(data);
        setArticlesError(null);
      } catch (error) {
        setArticlesError(error instanceof Error ? error.message : 'Failed to load articles');
        toast.error('Failed to load articles');
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoClick = async (video: VideoTutorial) => {
    setSelectedVideo(video);
    // Track view
    try {
      await fetch(`/api/tutorials/videos/${video.id}/view`, {
        method: 'POST',
      });
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, views: v.views + 1 } : v
      ));
    } catch (error) {
      console.error('Failed to track video view:', error);
    }
  };

  const handleDownload = async (resource: DownloadableResource) => {
    try {
      const response = await fetch(`/api/tutorials/resources/${resource.id}/download`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const data = await response.json();
      
      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resource.id ? { ...r, downloads: data.downloads } : r
      ));
      
      toast.success(`Downloading ${resource.title}`);
      
      // In a real application, this would trigger an actual download
      // For now, we'll just show a success message
    } catch (error) {
      toast.error('Failed to download resource');
      console.error('Download error:', error);
    }
  };

  const handleArticleView = async (articleId: number) => {
    try {
      await fetch(`/api/tutorials/articles/${articleId}/view`, {
        method: 'POST',
      });
      // Update local state
      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, views: a.views + 1 } : a
      ));
    } catch (error) {
      console.error('Failed to track article view:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* AI Assistant Chat Widget */}
      <AIAssistantChat context="User is browsing EE Zone tutorials and learning resources" />
      
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
            {selectedVideo && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
                <div className="bg-white rounded-lg max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)}>
                      ✕
                    </Button>
                  </div>
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <p className="text-white text-center px-4">
                      Video player would be integrated here with URL: {selectedVideo.videoUrl}
                    </p>
                  </div>
                  <div className="p-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">By {selectedVideo.author}</p>
                    <p className="text-gray-700">{selectedVideo.description}</p>
                  </div>
                </div>
              </div>
            )}

            {videosLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#00C2D1]" />
              </div>
            ) : videosError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-semibold mb-2">Failed to load videos</p>
                <p className="text-gray-600 text-sm">{videosError}</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">No videos found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#071428] to-[#0a1f3d]">
                          <Video className="h-16 w-16 text-[#00C2D1] opacity-50" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            className="h-16 w-16 rounded-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                            onClick={() => handleVideoClick(video)}
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
                          <span>{video.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-[#071428] hover:bg-[#071428]/90"
                        onClick={() => handleVideoClick(video)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Tutorial
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Downloadable Resources */}
          <TabsContent value="downloads" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#071428]">Downloadable Resources</h2>
              <p className="text-gray-600 mt-1">Free reference materials, templates, and calculation guides</p>
            </div>

            {resourcesLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#00C2D1]" />
              </div>
            ) : resourcesError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-semibold mb-2">Failed to load resources</p>
                <p className="text-gray-600 text-sm">{resourcesError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
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
                      <Button 
                        className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                        onClick={() => handleDownload(resource)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

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

            {articlesLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#00C2D1]" />
              </div>
            ) : articlesError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-semibold mb-2">Failed to load articles</p>
                <p className="text-gray-600 text-sm">{articlesError}</p>
              </div>
            ) : (
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
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                            <p>By {article.author}</p>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {article.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {article.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="bg-[#071428] hover:bg-[#071428]/90 whitespace-nowrap"
                          onClick={() => handleArticleView(article.id)}
                        >
                          Read Article
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

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