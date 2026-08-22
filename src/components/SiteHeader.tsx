'use client';

import Link from 'next/link';
import { Zap, Menu, Search, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function SiteHeader({ onSearch, searchQuery, onSearchChange }: HeaderProps = {}) {
  const [userStats, setUserStats] = useState<any>(null);
  const userId = 'demo_user'; // In production, get from auth

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/gamification/user-stats?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch {
      // Silent fail - user stats are optional
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/magic-cad-plus', label: 'Magic CAD +' },
    { href: '/apps', label: 'Apps' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/projects', label: 'Projects' },
    { href: '/assessments', label: 'Assessments' },
  ];

  const levelColors: Record<string, string> = {
    Beginner: '#00E5FF',
    Intermediate: '#9C4AFF',
    Advanced: '#FF6B00',
    Expert: '#FF00C8',
  };

  const levelIcons: Record<string, string> = {
    Beginner: '🌱',
    Intermediate: '⚡',
    Advanced: '🔥',
    Expert: '👑',
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-surface backdrop-blur-glass border-b border-white/10">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[200px] h-[100px] bg-[#9C4AFF] opacity-10 blur-[80px] rounded-full animate-pulse-slow" />
      <div className="absolute top-0 right-1/4 w-[200px] h-[100px] bg-[#FF6B00] opacity-10 blur-[80px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative z-10">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <motion.div 
            className="relative h-10 w-10 rounded-xl overflow-hidden border border-[#9C4AFF]/60 shadow-[0_0_20px_rgba(156,74,255,0.6)] group-hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(0,229,255,0.8)] transition-all flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src="/images/logo/ee-zone-app-icon.jpg" 
              alt="EE ZONE Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            className="relative px-3.5 py-1.5 border-2 border-[#9C4AFF]/50 rounded-xl glass-surface"
            whileHover={{ 
              boxShadow: "0 0 30px 5px rgba(156, 74, 255, 0.6), inset 0 0 20px rgba(156, 74, 255, 0.2)",
              borderColor: "rgba(156, 74, 255, 0.8)"
            }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: "0 0 20px 3px rgba(156, 74, 255, 0.4), inset 0 0 10px rgba(156, 74, 255, 0.1)"
            }}
          >
            <span 
              className="font-bold text-xl text-white glow-text-violet transition-all group-hover:glow-text-orange tracking-wider" 
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              EE ZONE
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center flex-shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-2 xl:px-3 py-2 text-[0.8rem] xl:text-sm font-medium text-[#B8A7E0] transition-all hover:text-white group whitespace-nowrap"
            >
              {link.label === 'Magic CAD +' ? (
                <motion.div 
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#76b900]/10 border border-[#76b900]/30 hover:bg-[#76b900]/20 transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-white font-bold text-xs xl:text-sm">Magic CAD +</span>
                  <span style={{ fontSize: "0.45rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#76b900", background: "#76b90020", border: "1px solid #76b90040", borderRadius: 3, padding: "1px 3px" }}>
                    CADAM
                  </span>
                </motion.div>
              ) : (
                link.label
              )}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 gradient-fire transition-all group-hover:w-full" />
            </Link>
          ))}
          
          {/* Gamification Stats Display - Compact */}
          {userStats && (
            <Link href="/gamification">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="ml-2 flex items-center gap-1.5 px-2 py-1 glass-surface border border-[#9C4AFF]/30 rounded-lg hover:border-[#9C4AFF]/60 transition-all cursor-pointer"
              >
                <span className="text-xs">
                  {levelIcons[userStats.level]}
                </span>
                <span className="text-xs font-bold text-white">{userStats.totalPoints.toLocaleString()} XP</span>
              </motion.div>
            </Link>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="ml-2 gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl transition-all animate-pulse-slow text-xs px-3">
              Go Pro
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-surface backdrop-blur-glass text-white border-white/10">
            {/* Ambient Orbs in Mobile Menu */}
            <div className="absolute top-10 right-10 w-[150px] h-[150px] bg-[#9C4AFF] opacity-20 blur-[60px] rounded-full" />
            <div className="absolute bottom-10 left-10 w-[150px] h-[150px] bg-[#FF6B00] opacity-20 blur-[60px] rounded-full" />
            
            <nav className="flex flex-col space-y-4 mt-8 relative z-10">
              {/* Gamification Stats in Mobile */}
              {userStats && (
                <Link href="/gamification">
                  <div className="mb-4 p-4 glass-surface border-2 border-[#9C4AFF]/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${levelColors[userStats.level]}33, ${levelColors[userStats.level]}66)`,
                          boxShadow: `0 0 15px ${levelColors[userStats.level]}66`
                        }}
                      >
                        {levelIcons[userStats.level]}
                      </div>
                      <div>
                        <p className="text-sm text-[#B8A7E0]">{userStats.level}</p>
                        <p className="text-lg font-bold text-white">{userStats.totalPoints.toLocaleString()} XP</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium transition-colors hover:text-[#9C4AFF] text-white"
                >
                  {link.label === 'Magic CAD +' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#76b900]/10 border border-[#76b900]/30">
                      <span className="text-white font-bold">Magic CAD +</span>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#76b900", background: "#76b90020", border: "1px solid #76b90040", borderRadius: 4, padding: "2px 6px" }}>
                        CADAM
                      </span>
                    </div>
                  ) : (
                    link.label
                  )}
                </Link>
              ))}
              <Button className="gradient-fire text-white hover:shadow-glowOrange font-semibold w-full rounded-xl mt-4">
                Go Pro
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default SiteHeader;
