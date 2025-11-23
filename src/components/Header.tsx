import Link from 'next/link';
import { Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/apps', label: 'Apps' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/tutorials', label: 'Tutorials' },
    { href: '/projects', label: 'Projects' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-surface backdrop-blur-glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-br from-[#9C4AFF] to-[#FF6B00] p-1.5 rounded-lg group-hover:shadow-glowViolet transition-all">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            EE Zone
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#B8A7E0] transition-colors hover:text-white hover:glow-text-violet"
            >
              {link.label}
            </Link>
          ))}
          <Button className="gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            Go Pro
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-surface border-white/20 backdrop-blur-glass">
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-[#B8A7E0] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Button className="gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl w-full">
                Go Pro
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}