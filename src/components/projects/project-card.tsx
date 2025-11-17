'use client';

import { Eye, Star, User, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  imageUrl?: string;
  views: number;
  userId: string;
  createdAt: string;
  featured?: boolean;
  averageRating?: number;
  totalRatings?: number;
}

const categoryColors: Record<string, string> = {
  motor_controller: 'bg-[#FF6B00] text-white',
  solar_panel: 'bg-[#00E5FF] text-[#0A0014]',
  home_automation: 'bg-[#9C4AFF] text-white',
  power_supply: 'bg-[#FF00C8] text-white',
  other: 'bg-[#B8A7E0] text-[#0A0014]',
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-[#00E5FF]',
  intermediate: 'text-[#FF6B00]',
  advanced: 'text-[#FF00C8]',
};

export function ProjectCard({
  id,
  title,
  description,
  category,
  difficulty,
  imageUrl,
  views,
  userId,
  createdAt,
  featured = false,
  averageRating = 0,
  totalRatings = 0,
}: ProjectCardProps) {
  const categoryLabel = category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/projects/${id}`}>
        <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all h-full cursor-pointer">
          {/* Image */}
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-violet flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0014] to-transparent opacity-60" />
            
            {/* Featured Badge */}
            {featured && (
              <Badge className="absolute top-3 right-3 gradient-fire text-white border-0">
                ⭐ Featured
              </Badge>
            )}

            {/* Category Badge */}
            <Badge className={`absolute top-3 left-3 ${categoryColors[category] || categoryColors.other}`}>
              {categoryLabel}
            </Badge>
          </div>

          <CardHeader>
            <CardTitle className="text-white line-clamp-2">{title}</CardTitle>
            <CardDescription className="text-[#B8A7E0] line-clamp-2">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#B8A7E0]">Difficulty:</span>
              <span className={`text-sm font-semibold ${difficultyColors[difficulty]}`}>
                {difficultyLabel}
              </span>
            </div>

            {/* Rating */}
            {totalRatings > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                  <span className="text-sm font-semibold text-white">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-[#B8A7E0]">({totalRatings} ratings)</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-[#B8A7E0]">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{userId}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 text-xs text-[#B8A7E0]">
                <Calendar className="h-3 w-3" />
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <Button size="sm" className="gradient-violet hover:shadow-glowViolet text-white">
                View Project
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
