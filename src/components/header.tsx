'use client';

import Link from 'next/link';
import { Zap, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ onSearch, searchQuery, onSearchChange }: HeaderProps) {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/apps', label: 'Apps Library' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/tutorials', label: 'Tutorials' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-surface backdrop-blur-glass">
      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-20 w-40 h-40 bg-[#9C4AFF] rounded-full blur-[100px] opacity-20 animate-pulse-slow" />
        <div className="absolute -top-10 right-20 w-40 h-40 bg-[#FF6B00] rounded-full blur-[100px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto flex h-20 items-center justify-between px-4 relative z-10">
        <Link href="/" className="flex items-center space-x-3 group">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 gradient-violet rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative gradient-fire p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </motion.div>
          <span className="font-bold text-2xl text-white glow-text-violet" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            EE ZONE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="text-sm font-medium text-[#B8A7E0] hover:text-white transition-all relative group uppercase tracking-wider"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-fire group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button className="gradient-violet text-white hover:shadow-glowViolet font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20 uppercase tracking-wider">
              Go Pro
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-surface backdrop-blur-glass text-white border-white/10">
            {/* Mobile Ambient Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9C4AFF] rounded-full blur-[80px] opacity-20" />
            
            <nav className="flex flex-col space-y-6 mt-12 relative z-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-[#B8A7E0] hover:text-white transition-all uppercase tracking-wider"
                >
                  {link.label}
                </Link>
              ))}
              <Button className="gradient-violet text-white glow-violet font-semibold w-full rounded-xl py-3 uppercase tracking-wider">
                Go Pro
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default Header;