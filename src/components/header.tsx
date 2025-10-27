'use client';

import { useState } from 'react';
import Link from 'link';
import { Search, Menu, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ onSearch, searchQuery = '', onSearchChange }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Apps', href: '/apps' },
    { name: 'Calculators', href: '/calculators' },
    { name: 'Tools', href: '/tools/power-systems' },
    { name: 'Tutorials', href: '/tutorials' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#071428] text-white backdrop-blur supports-[backdrop-filter]:bg-[#071428]/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 bg-[#00C2D1] rounded-lg">
            <Zap className="h-6 w-6 text-[#071428]" fill="currentColor" />
          </div>
          <span className="text-xl font-bold">
            EE <span className="text-[#00C2D1]">Zone</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium hover:text-[#00C2D1] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 h-9 bg-white/10 text-white border-white/20 placeholder:text-gray-400 focus:bg-white/20"
            />
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="text-white hover:text-[#00C2D1] hover:bg-white/10">
            Sign In
          </Button>
          <Button className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-[#071428] text-white border-white/20">
            <SheetHeader>
              <SheetTitle className="text-left text-white flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-[#00C2D1] rounded-lg">
                  <Zap className="h-5 w-5 text-[#071428]" fill="currentColor" />
                </div>
                EE Zone
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 h-10 bg-white/10 text-white border-white/20 placeholder:text-gray-400"
                  />
                </div>
              </form>

              {/* Mobile Nav Items */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-[#00C2D1] transition-colors py-2"
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-t border-white/20 my-4" />

              {/* Mobile CTA Buttons */}
              <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                Sign In
              </Button>
              <Button className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                Get Started
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
