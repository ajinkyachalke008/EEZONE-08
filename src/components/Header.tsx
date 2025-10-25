import Link from 'next/link';
import { Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/apps', label: 'Apps Library' },
    { href: '/calculators', label: 'Calculators' },
    { href: '/tutorials', label: 'Tutorials' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#071428] text-white backdrop-blur supports-[backdrop-filter]:bg-[#071428]/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-[#00C2D1] p-1.5 rounded">
            <Zap className="h-5 w-5 text-[#071428]" />
          </div>
          <span className="font-bold text-xl">EE Zone</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[#00C2D1]"
            >
              {link.label}
            </Link>
          ))}
          <Button className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
            Go Pro
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-[#071428] text-white border-gray-800">
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium transition-colors hover:text-[#00C2D1]"
                >
                  {link.label}
                </Link>
              ))}
              <Button className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold w-full">
                Go Pro
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
