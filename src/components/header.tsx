'use client';

import Link from 'next/link';
import { Zap, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ onSearch, searchQuery, onSearchChange }: HeaderProps) {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/apps', label: 'Apps' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/assessments', label: 'Assessments' },
    { href: '/career', label: 'Career' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-surface backdrop-blur-glass border-b border-white/10">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[200px] h-[100px] bg-[#9C4AFF] opacity-10 blur-[80px] rounded-full animate-pulse-slow" />
      <div className="absolute top-0 right-1/4 w-[200px] h-[100px] bg-[#FF6B00] opacity-10 blur-[80px] rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative z-10">
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.div 
            className="gradient-violet p-1.5 rounded-lg shadow-glowViolet"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Zap className="h-5 w-5 text-white" />
          </motion.div>
          <span 
            className="font-bold text-xl text-white glow-text-violet transition-all group-hover:glow-text-orange" 
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            EE ZONE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-[#B8A7E0] transition-all hover:text-white group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 gradient-fire transition-all group-hover:w-full" />
            </Link>
          ))}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="ml-4 gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl transition-all animate-pulse-slow">
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
            {/* Ambient Orbs in Mobile Menu */}
            <div className="absolute top-10 right-10 w-[150px] h-[150px] bg-[#9C4AFF] opacity-20 blur-[60px] rounded-full" />
            <div className="absolute bottom-10 left-10 w-[150px] h-[150px] bg-[#FF6B00] opacity-20 blur-[60px] rounded-full" />
            
            <nav className="flex flex-col space-y-4 mt-8 relative z-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium transition-colors hover:text-[#9C4AFF] text-white"
                >
                  {link.label}
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

export default Header;