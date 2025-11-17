'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RatingSystemProps {
  projectId: number;
  currentRating?: number;
  onRate?: (rating: number) => void;
  userId: string;
}

export function RatingSystem({ projectId, currentRating = 0, onRate, userId }: RatingSystemProps) {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (selectedRating: number) => {
    if (!userId) {
      toast.error('Please log in to rate this project');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects-new/${projectId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          rating: selectedRating,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      setRating(selectedRating);
      toast.success('Rating submitted successfully!');
      
      if (onRate) {
        onRate(selectedRating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-[#B8A7E0]">Rate this project</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isSubmitting}
            className="transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-[#FF6B00] text-[#FF6B00]'
                  : 'text-[#B8A7E0]'
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-sm text-[#9C4AFF]">
          You rated this project {rating} star{rating !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
