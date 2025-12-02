'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Star, ChevronLeft, Loader2, Trash2, BookOpen,
  Battery, RotateCw, Zap, Cable, CircuitBoard, Activity, 
  Cpu, Plug, Gauge, FileCheck, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Bookmark {
  id: number;
  userId: string;
  contentType: string;
  contentId: number;
  createdAt: string;
  topic?: {
    id: number;
    slug: string;
    title: string;
    description: string;
    icon: string;
  };
}

interface Topic {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
}

const iconMap: { [key: string]: any } = {
  Battery, RotateCw, Zap, Cable, CircuitBoard, Activity, Cpu, Plug, Gauge, FileCheck
};

const getUserId = () => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('ee_zone_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('ee_zone_user_id', userId);
    }
    return userId;
  }
  return 'anonymous';
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    fetchData(id);
  }, []);

  const fetchData = async (uid: string) => {
    try {
      const [bookmarksRes, topicsRes] = await Promise.all([
        fetch(`/api/learn/bookmarks/${uid}`),
        fetch('/api/learn/topics')
      ]);
      
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData);
      }
      
      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTopics(topicsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    try {
      const res = await fetch(`/api/learn/bookmarks?id=${bookmarkId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        toast.success('Bookmark removed');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const getTopicDetails = (contentId: number) => {
    return topics.find(t => t.id === contentId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const topicBookmarks = bookmarks.filter(b => b.contentType === 'topic');

  if (loading) {
    return (
      <div className="min-h-screen gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#9C4AFF] mx-auto mb-4" />
          <p className="text-[#B8A7E0]">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-depth">
      {/* Header */}
      <section className="relative py-6 px-4 border-b border-white/10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#FF6B00] opacity-15 blur-[150px] rounded-full" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="text-[#B8A7E0] hover:text-white">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Learn
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-fire rounded-xl">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Bookmarks</h1>
              <p className="text-[#B8A7E0] text-sm">Your saved topics for quick access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bookmarks Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {topicBookmarks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Star className="h-20 w-20 text-[#FF6B00] mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">No Bookmarks Yet</h2>
              <p className="text-[#B8A7E0] mb-6 max-w-md mx-auto">
                Bookmark topics while studying to access them quickly later!
              </p>
              <Link href="/learn">
                <Button className="gradient-fire hover:shadow-glowOrange">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explore Topics
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Bookmarked Topics ({topicBookmarks.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicBookmarks.map((bookmark, index) => {
                  const topic = getTopicDetails(bookmark.contentId);
                  if (!topic) return null;
                  
                  const Icon = iconMap[topic.icon] || BookOpen;
                  
                  return (
                    <motion.div
                      key={bookmark.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 transition-all h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="p-2 gradient-fire rounded-lg">
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBookmark(bookmark.id)}
                              className="text-[#B8A7E0] hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-white text-lg mt-2">{topic.title}</CardTitle>
                          <CardDescription className="text-[#B8A7E0] line-clamp-2 text-sm">
                            {topic.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-xs text-[#B8A7E0] mb-4">
                            <Clock className="h-3 w-3" />
                            <span>Saved on {formatDate(bookmark.createdAt)}</span>
                          </div>
                          <Link href={`/learn/${topic.slug}`}>
                            <Button className="w-full gradient-fire hover:shadow-glowOrange text-white">
                              Continue Learning
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
