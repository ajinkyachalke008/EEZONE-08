'use client';

import { useState } from 'react';
import { Send, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Comment {
  id: number;
  userId: string;
  comment: string;
  createdAt: string;
}

interface CommentSectionProps {
  projectId: number;
  comments: Comment[];
  userId: string;
  onCommentAdded?: () => void;
}

export function CommentSection({ projectId, comments: initialComments, userId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Please log in to comment');
      return;
    }

    if (newComment.trim().length === 0) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects-new/${projectId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          comment: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const addedComment = await response.json();
      setComments([addedComment, ...comments]);
      setNewComment('');
      toast.success('Comment posted successfully!');
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch {
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-surface border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this project..."
            className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0] min-h-[100px]"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="gradient-violet hover:shadow-glowViolet text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#B8A7E0]">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="glass-surface border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full gradient-violet">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">{comment.userId}</span>
                          <span className="text-xs text-[#B8A7E0] flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#B8A7E0] text-sm leading-relaxed">{comment.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}