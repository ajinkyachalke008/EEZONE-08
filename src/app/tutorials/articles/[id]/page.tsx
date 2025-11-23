'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Clock, Eye, Heart, Share2, Loader2, AlertCircle, GraduationCap, Building2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  readTime: number;
  category: string;
  author: string;
  authorAvatar: string | null;
  institution: string | null;
  views: number;
  likes: number;
  thumbnailUrl: string | null;
  tags: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tutorials/articles/${articleId}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        const data = await response.json();
        setArticle(data);
        setError(null);
        
        // Track view
        await fetch(`/api/tutorials/articles/${articleId}/view`, {
          method: 'POST',
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load article');
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleLike = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/tutorials/articles/${article.id}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to like article');
      
      const data = await response.json();
      setArticle({ ...article, likes: data.likes });
      setLiked(true);
      toast.success('Article liked!');
    } catch (error) {
      toast.error('Failed to like article');
      console.error('Like error:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <div className="ambient-orb ambient-orb-cyan w-96 h-96 top-20 -left-48 animate-float" />
        <div className="relative z-10">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 glow-cyan" />
          <div className="absolute inset-0 h-12 w-12 animate-ping text-cyan-500/30">
            <Loader2 className="h-12 w-12" />
          </div>
        </div>
        <p className="text-muted-foreground mt-4 relative z-10">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-32 text-center relative overflow-hidden">
        <div className="ambient-orb ambient-orb-orange w-96 h-96 top-20 right-0 animate-pulse-slow" />
        <div className="glass-surface border border-red-500/30 rounded-2xl p-12 max-w-md relative z-10">
          <AlertCircle className="h-16 w-16 text-red-400 mb-4 mx-auto glow-orange" />
          <p className="text-white font-semibold text-lg mb-2">Failed to load article</p>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.back()} className="bg-gradient-aqua glow-cyan">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const tags = article.tags ? article.tags.split(',').map(t => t.trim()) : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="ambient-orb ambient-orb-violet w-96 h-96 top-20 -left-48 animate-float" />
      <div className="ambient-orb ambient-orb-cyan w-80 h-80 top-1/3 right-0 animate-pulse-slow" />
      <div className="ambient-orb ambient-orb-orange w-72 h-72 bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto max-w-5xl px-4 py-12 relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 glass-surface border border-violet-500/30 hover:border-violet-500 hover:glow-violet"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>

        {/* Article Header */}
        <div className="glass-surface border border-cyan-500/30 rounded-2xl p-8 mb-8 glow-cyan">
          <div className="flex gap-2 mb-4">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">{article.category}</Badge>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime} min read
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {article.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-6">
            {article.excerpt}
          </p>

          {/* Author & Institution Box with Enhanced Glow */}
          <Card className="glass-surface border-2 border-violet-500/50 glow-violet mb-6 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 animate-gradient-move" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-violet rounded-xl glow-violet group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    {article.author}
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  </p>
                  {article.institution && (
                    <p className="text-lg text-violet-300 flex items-center gap-2 mb-3">
                      <Building2 className="h-5 w-5" />
                      {article.institution}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {article.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLike}
              disabled={liked}
              className={`${liked ? 'bg-gradient-fire' : 'glass-surface border border-orange-500/30'} hover:glow-orange transition-all`}
            >
              <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {article.likes} Likes
            </Button>
            <Button
              onClick={handleShare}
              className="glass-surface border border-cyan-500/30 hover:border-cyan-500 hover:glow-cyan"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <div className="glass-surface border border-violet-500/30 rounded-2xl p-8 mb-8">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="glass-surface border border-cyan-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-cyan-500/30 text-cyan-300">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-aqua hover:scale-105 transition-transform glow-cyan"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
}
