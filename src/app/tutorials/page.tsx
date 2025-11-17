'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Video, Download, Clock, Users, Star, Play, FileText, ExternalLink, Loader2, AlertCircle, Search, TrendingUp, Award, Sparkles, X, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AIAssistantChat } from '@/components/ai-assistant-chat';
import { YouTubePlayer } from '@/components/youtube-player';
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

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  
  // YouTube videos state
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [selectedYouTubeVideo, setSelectedYouTubeVideo] = useState<YouTubeVideo | null>(null);
  
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

  const fetchYouTubeVideos = async (query: string) => {
    setYoutubeLoading(true);
    setYoutubeError(null);
    setYoutubeVideos([]);
    
    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query + ' electrical engineering tutorial')}&maxResults=12`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch YouTube videos');
      }

      const data = await response.json();
      setYoutubeVideos(data.videos);

      if (data.videos.length === 0) {
        setYoutubeError('No related YouTube videos found');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load YouTube videos';
      setYoutubeError(message);
      toast.error(message);
    } finally {
      setYoutubeLoading(false);
    }
  };

  const handleVideoClick = async (video: VideoTutorial) => {
    setSelectedVideo(video);
    setSelectedYouTubeVideo(null);
    
    // Fetch related YouTube videos
    const searchQuery = `${video.title} ${video.category}`;
    await fetchYouTubeVideos(searchQuery);
    
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

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setYoutubeVideos([]);
    setYoutubeError(null);
    setSelectedYouTubeVideo(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb ambient-orb-violet w-96 h-96 top-20 -left-48 animate-float" />
      <div className="ambient-orb ambient-orb-orange w-80 h-80 top-1/3 right-0 animate-pulse-slow" />
      <div className="ambient-orb ambient-orb-cyan w-72 h-72 bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }} />
      
      {/* AI Assistant Chat Widget */}
      <AIAssistantChat context="User is browsing EE Zone tutorials and learning resources" />
      
      <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
        {/* Header with Glow Effect */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-surface border border-violet-500/30 mb-6">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Learn & Master Electrical Engineering</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Tutorials & Learning
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expand your electrical engineering knowledge with our comprehensive resources and expert-led courses
          </p>
        </div>

        <Tabs defaultValue="videos" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="glass-surface border border-violet-500/30 p-1.5 h-auto">
              <TabsTrigger 
                value="videos" 
                className="data-[state=active]:bg-gradient-violet data-[state=active]:text-white data-[state=active]:glow-violet px-6 py-3 rounded-lg transition-all"
              >
                <Video className="h-4 w-4 mr-2" />
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger 
                value="downloads"
                className="data-[state=active]:bg-gradient-fire data-[state=active]:text-white data-[state=active]:glow-orange px-6 py-3 rounded-lg transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger 
                value="articles"
                className="data-[state=active]:bg-gradient-aqua data-[state=active]:text-white data-[state=active]:glow-cyan px-6 py-3 rounded-lg transition-all"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Video Tutorials */}
          <TabsContent value="videos" className="space-y-8">
            <div className="glass-surface border border-violet-500/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Video Tutorials
                  </h2>
                  <p className="text-muted-foreground">Professional electrical engineering video courses</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-surface border-violet-500/30 focus:border-violet-500 focus:glow-violet"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Video Modal with YouTube Integration */}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={closeVideoModal}>
                <div className="glass-surface border border-violet-500/50 rounded-2xl max-w-7xl w-full glow-violet my-8" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="p-6 border-b border-violet-500/30 flex justify-between items-center bg-gradient-violet/20 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <Youtube className="h-6 w-6 text-red-500 glow-orange" />
                      <h3 className="font-semibold text-xl text-white">{selectedVideo.title}</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeVideoModal} className="hover:bg-violet-500/20">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    {/* Tutorial Info */}
                    <div className="mb-6 glass-surface border border-violet-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">{selectedVideo.category}</Badge>
                        <Badge variant="outline" className="border-orange-500/30 text-orange-300">{selectedVideo.level}</Badge>
                        <span className="text-sm text-muted-foreground">By {selectedVideo.author}</span>
                      </div>
                      <p className="text-foreground/90">{selectedVideo.description}</p>
                    </div>

                    {/* YouTube Player Section */}
                    {selectedYouTubeVideo ? (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Play className="h-5 w-5 text-violet-400" />
                            Now Playing
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedYouTubeVideo(null)}
                            className="border-violet-500/30 hover:bg-violet-500/20"
                          >
                            ← Back to Results
                          </Button>
                        </div>
                        <YouTubePlayer videoId={selectedYouTubeVideo.id} title={selectedYouTubeVideo.title} />
                        <div className="mt-4 glass-surface border border-violet-500/30 rounded-xl p-4">
                          <h5 className="font-semibold text-white mb-2">{selectedYouTubeVideo.title}</h5>
                          <p className="text-sm text-muted-foreground mb-2">Channel: {selectedYouTubeVideo.channelTitle}</p>
                          <p className="text-sm text-foreground/80 line-clamp-3">{selectedYouTubeVideo.description}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Related YouTube Videos Section */}
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Youtube className="h-5 w-5 text-red-500" />
                            Related YouTube Videos
                          </h4>
                        </div>

                        {youtubeLoading ? (
                          <div className="flex flex-col justify-center items-center py-20">
                            <div className="relative">
                              <Loader2 className="h-12 w-12 animate-spin text-violet-500 glow-violet" />
                              <div className="absolute inset-0 h-12 w-12 animate-ping text-violet-500/30">
                                <Loader2 className="h-12 w-12" />
                              </div>
                            </div>
                            <p className="text-muted-foreground mt-4">Searching YouTube videos...</p>
                          </div>
                        ) : youtubeError ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center glass-surface border border-red-500/30 rounded-xl">
                            <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
                            <p className="text-white font-semibold mb-2">Unable to load YouTube videos</p>
                            <p className="text-muted-foreground text-sm">{youtubeError}</p>
                          </div>
                        ) : youtubeVideos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {youtubeVideos.map((ytVideo) => (
                              <Card 
                                key={ytVideo.id}
                                className="glass-surface border-violet-500/30 hover:border-red-500 hover:glow-orange transition-all duration-300 cursor-pointer group"
                                onClick={() => setSelectedYouTubeVideo(ytVideo)}
                              >
                                <CardHeader className="p-0">
                                  <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                                    <img 
                                      src={ytVideo.thumbnail} 
                                      alt={ytVideo.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                      <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center glow-orange">
                                        <Play className="h-7 w-7 text-white ml-1" />
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                  <h5 className="font-semibold text-sm text-white line-clamp-2 mb-2 group-hover:text-violet-300 transition-colors">
                                    {ytVideo.title}
                                  </h5>
                                  <p className="text-xs text-muted-foreground">{ytVideo.channelTitle}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {videosLoading ? (
              <div className="flex flex-col justify-center items-center py-32">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-500 glow-violet" />
                  <div className="absolute inset-0 h-12 w-12 animate-ping text-violet-500/30">
                    <Loader2 className="h-12 w-12" />
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">Loading video tutorials...</p>
              </div>
            ) : videosError ? (
              <div className="flex flex-col items-center justify-center py-32 text-center glass-surface border border-red-500/30 rounded-2xl">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4 glow-orange" />
                <p className="text-white font-semibold text-lg mb-2">Failed to load videos</p>
                <p className="text-muted-foreground">{videosError}</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-32 glass-surface border border-violet-500/30 rounded-2xl">
                <Video className="h-16 w-16 mx-auto mb-4 text-violet-400 opacity-50" />
                <p className="text-muted-foreground">No videos found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="glass-surface border-violet-500/30 hover:border-violet-500 hover:glow-violet transition-all duration-300 group overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-depth relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-orange-500/20" />
                          <Video className="h-16 w-16 text-violet-400 opacity-50 relative z-10" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="icon"
                            className="h-16 w-16 rounded-full bg-gradient-violet text-white hover:scale-110 transition-transform glow-violet"
                            onClick={() => handleVideoClick(video)}
                          >
                            <Play className="h-8 w-8 ml-1" />
                          </Button>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-violet-500/30 text-violet-300">
                          <Clock className="h-3 w-3 mr-1" />
                          {video.duration}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex gap-2 mb-3">
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">{video.category}</Badge>
                        <Badge variant="outline" className="border-orange-500/30 text-orange-300">{video.level}</Badge>
                      </div>
                      <CardTitle className="text-lg mb-2 text-white group-hover:text-violet-300 transition-colors">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mb-3 text-muted-foreground">{video.description}</CardDescription>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{video.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400">{video.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full bg-gradient-violet hover:scale-105 transition-transform glow-violet border-0"
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
          <TabsContent value="downloads" className="space-y-8">
            <div className="glass-surface border border-orange-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-fire rounded-xl glow-orange">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Downloadable Resources
                  </h2>
                  <p className="text-muted-foreground">Free reference materials, templates, and calculation guides</p>
                </div>
              </div>
            </div>

            {resourcesLoading ? (
              <div className="flex flex-col justify-center items-center py-32">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500 glow-orange" />
                  <div className="absolute inset-0 h-12 w-12 animate-ping text-orange-500/30">
                    <Loader2 className="h-12 w-12" />
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">Loading resources...</p>
              </div>
            ) : resourcesError ? (
              <div className="flex flex-col items-center justify-center py-32 text-center glass-surface border border-red-500/30 rounded-2xl">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4 glow-orange" />
                <p className="text-white font-semibold text-lg mb-2">Failed to load resources</p>
                <p className="text-muted-foreground">{resourcesError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <Card key={resource.id} className="glass-surface border-orange-500/30 hover:border-orange-500 hover:glow-orange transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-gradient-fire rounded-xl glow-orange group-hover:scale-110 transition-transform">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">{resource.fileType}</Badge>
                      </div>
                      <CardTitle className="text-lg text-white group-hover:text-orange-300 transition-colors">{resource.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-muted-foreground">{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {resource.fileSize}
                        </span>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>{resource.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/30">{resource.category}</Badge>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-gradient-fire hover:scale-105 transition-transform glow-orange border-0"
                        onClick={() => handleDownload(resource)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            <Card className="glass-surface border border-violet-500/30 overflow-hidden relative group hover:border-violet-500 hover:glow-violet transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-orange-500/10" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-violet mb-4 glow-violet">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Need More Resources?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Upgrade to Pro for access to our complete library of professional templates and advanced calculators
                </p>
                <Button className="bg-gradient-fire hover:scale-105 transition-transform glow-orange font-semibold border-0">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles */}
          <TabsContent value="articles" className="space-y-8">
            <div className="glass-surface border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-aqua rounded-xl glow-cyan">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Articles & Guides
                  </h2>
                  <p className="text-muted-foreground">In-depth articles on electrical engineering topics</p>
                </div>
              </div>
            </div>

            {articlesLoading ? (
              <div className="flex flex-col justify-center items-center py-32">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-cyan-500 glow-cyan" />
                  <div className="absolute inset-0 h-12 w-12 animate-ping text-cyan-500/30">
                    <Loader2 className="h-12 w-12" />
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">Loading articles...</p>
              </div>
            ) : articlesError ? (
              <div className="flex flex-col items-center justify-center py-32 text-center glass-surface border border-red-500/30 rounded-2xl">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4 glow-orange" />
                <p className="text-white font-semibold text-lg mb-2">Failed to load articles</p>
                <p className="text-muted-foreground">{articlesError}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article) => (
                  <Card key={article.id} className="glass-surface border-cyan-500/30 hover:border-cyan-500 hover:glow-cyan transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-3">
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">{article.category}</Badge>
                            <Badge variant="outline" className="border-violet-500/30 text-violet-300 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.readTime} min
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl mb-3 text-white group-hover:text-cyan-300 transition-colors">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="text-base text-muted-foreground mb-4">
                            {article.excerpt}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gradient-aqua" />
                              {article.author}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {article.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-cyan-400" />
                                {article.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="bg-gradient-aqua hover:scale-105 transition-transform glow-cyan whitespace-nowrap border-0"
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

            <Card className="glass-surface border border-violet-500/30 overflow-hidden relative group hover:border-violet-500 hover:glow-violet transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-orange-500/10 to-cyan-500/10 animate-gradient-move" />
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-violet rounded-xl glow-violet">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Want to Contribute?
                      </h3>
                      <p className="text-muted-foreground">
                        Share your knowledge with the EE Zone community. Submit your articles and tutorials.
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-aqua hover:scale-105 transition-transform glow-cyan font-semibold whitespace-nowrap border-0">
                    <FileText className="h-4 w-4 mr-2" />
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