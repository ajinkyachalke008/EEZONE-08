import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LucideProps } from 'lucide-react';

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

// TypeScript Interfaces
export interface FeatureCardProps {
  icon: LucideIcon | React.ReactNode;
  featureTitle: string;
  tag?: 'Pro' | 'Free' | 'New' | string;
  shortDescription: string;
  ctaLabel?: string;
  ctaLink?: string;
  image?: string;
}

export interface SectionFeaturesProps {
  sectionTitle: string;
  sectionSubtitle: string;
  features: FeatureCardProps[];
}

// Helper function to check if something is a React component (function or forwardRef)
const isReactComponent = (obj: unknown): obj is LucideIcon => {
  return (
    typeof obj === 'function' ||
    (typeof obj === 'object' &&
      obj !== null &&
      '$$typeof' in obj &&
      typeof (obj as { render?: unknown }).render === 'function')
  );
};

// FeatureCard Component
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  featureTitle,
  tag,
  shortDescription,
  ctaLabel = 'Learn More',
  ctaLink,
  image,
}) => {
  // Render the icon based on its type
  const renderIcon = () => {
    // If it's already a React element, render it directly
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement, {
        className: 'h-8 w-8 text-white',
      });
    }
    // If it's a component (function or forwardRef), render it as a component
    if (isReactComponent(icon)) {
      const IconComponent = icon;
      return <IconComponent className="h-8 w-8 text-white" />;
    }
    // Fallback for primitives (strings, numbers, etc.)
    return <span className="h-8 w-8 text-white flex items-center justify-center">{icon as React.ReactNode}</span>;
  };

  const cardContent = (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={`
          relative h-full overflow-hidden
          bg-gradient-to-br from-[#2B0B4B]/80 via-[#1A0033]/90 to-[#0A0014]/80
          border-[3px] border-transparent
          rounded-[1.5rem]
          transition-all duration-300
          hover:shadow-[0_0_40px_rgba(156,74,255,0.6),0_0_60px_rgba(255,107,0,0.4),0_0_80px_rgba(0,229,255,0.3)]
          ${ctaLink ? 'cursor-pointer' : ''}
        `}
        style={{
          backgroundImage: `
            linear-gradient(135deg, 
              rgba(156, 74, 255, 0.15) 0%, 
              rgba(255, 107, 0, 0.1) 50%, 
              rgba(0, 229, 255, 0.15) 100%
            )
          `,
        }}
      >
        {/* Animated flowing border gradient */}
        <div
          className="absolute inset-0 rounded-[1.5rem] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #FF00C8 0%, #9C4AFF 25%, #00E5FF 50%, #FF6B00 75%, #FF00C8 100%)',
            padding: '3px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'rotate-gradient 4s linear infinite',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Feature Image */}
        {image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-[1.35rem]">
            <img
              src={image}
              alt={featureTitle}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(10, 0, 20, 0) 0%, rgba(43, 11, 75, 0.4) 100%)'
              }}
            />
          </div>
        )}

        {/* Tag Badge */}
        {tag && (
          <Badge
            className={`
              absolute ${image ? 'top-52' : 'top-4'} right-4 z-10
              px-3 py-1
              text-white font-semibold text-xs uppercase tracking-wider
              border-0 rounded-full
              ${
                tag === 'Pro'
                  ? 'bg-gradient-to-r from-[#FF00C8] to-[#FF6B00]'
                  : tag === 'Free'
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#9C4AFF]'
                  : tag === 'New'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#9C4AFF]'
                  : 'bg-gradient-to-r from-[#9C4AFF] to-[#00E5FF]'
              }
              shadow-[0_0_20px_rgba(156,74,255,0.6)]
            `}
          >
            {tag}
          </Badge>
        )}

        <CardHeader className={`pb-3 ${image ? 'pt-6' : 'pt-8'} px-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="p-3 rounded-xl bg-gradient-to-br from-[#9C4AFF]/30 to-[#FF6B00]/20 
                         border border-[#9C4AFF]/40 shadow-[0_0_20px_rgba(156,74,255,0.4)]"
            >
              {renderIcon()}
            </div>
          </div>
          <CardTitle
            className="text-white text-xl font-bold mb-2"
            style={{
              textShadow: '0 0 15px rgba(156, 74, 255, 0.6)',
            }}
          >
            {featureTitle}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          <p
            className="text-[#d0c7ff] text-sm leading-relaxed"
            style={{
              textShadow: '0 0 10px rgba(208, 199, 255, 0.3)',
            }}
          >
            {shortDescription}
          </p>

          {ctaLabel && (
            <Button
              className="w-full mt-4 
                bg-gradient-to-r from-[#9C4AFF] to-[#FF6B00] 
                hover:from-[#FF00C8] hover:to-[#00E5FF]
                text-white font-semibold
                border-0 rounded-xl
                shadow-[0_0_20px_rgba(156,74,255,0.5)]
                hover:shadow-[0_0_30px_rgba(156,74,255,0.8)]
                transition-all duration-300"
            >
              {ctaLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // If ctaLink is provided, wrap in Link
  if (ctaLink) {
    return <Link href={ctaLink}>{cardContent}</Link>;
  }

  return cardContent;
};

// SectionFeatures Wrapper Component
export const SectionFeatures: React.FC<SectionFeaturesProps> = ({
  sectionTitle,
  sectionSubtitle,
  features,
}) => {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
      <div
        className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-pulse-slow"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center lg:text-left mb-12"
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text-violet"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {sectionTitle}
          </h2>
          <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto lg:mx-0">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Add keyframes for rotating gradient animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rotate-gradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;
  document.head.appendChild(style);
}