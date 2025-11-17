'use client';

import Link from 'next/link';
import { Zap, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    alert(`Newsletter signup: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-[#071428] text-white border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-[#00C2D1] p-1.5 rounded">
                <Zap className="h-5 w-5 text-[#071428]" />
              </div>
              <span className="font-bold text-xl">EE Zone</span>
            </Link>
            <p className="text-sm text-gray-400">
              Your digital hub for Electrical & Electronics knowledge, tools, and resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/apps" className="hover:text-[#00C2D1] transition-colors">Apps Library</Link></li>
              <li><Link href="/calculators" className="hover:text-[#00C2D1] transition-colors">Calculators</Link></li>
              <li><Link href="/tutorials" className="hover:text-[#00C2D1] transition-colors">Tutorials</Link></li>
              <li><Link href="#" className="hover:text-[#00C2D1] transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-[#00C2D1] transition-colors">Forums</Link></li>
              <li><Link href="#" className="hover:text-[#00C2D1] transition-colors">Discord</Link></li>
              <li><Link href="#" className="hover:text-[#00C2D1] transition-colors">Contributors</Link></li>
              <li><Link href="#" className="hover:text-[#00C2D1] transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
              <Button type="submit" className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            © 2025 EE Zone. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-gray-400 hover:text-[#00C2D1] transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-[#00C2D1] transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-[#00C2D1] transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-[#00C2D1] transition-colors">
              <Youtube className="h-5 w-5" />
            </Link>
          </div>

          {/* Pro CTA */}
          <Link href="#" className="text-[#00C2D1] hover:underline text-sm font-medium">
            Upgrade to Pro →
          </Link>
        </div>

        {/* Developer Credit */}
        <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Developer Box */}
            <div className="glass-surface border-2 border-[#00E5FF]/30 rounded-xl px-6 py-3 shadow-glowCyan hover:border-[#00E5FF]/60 hover:shadow-[0_0_30px_5px_rgba(0,229,255,0.6)] transition-all duration-300">
              <p className="text-sm text-[#B8A7E0]">
                <span className="text-white font-semibold">Developer:</span>{' '}
                <span className="text-[#00E5FF] font-medium glow-text-cyan">AJINKYA CHALKE</span>
              </p>
            </div>

            {/* College Box */}
            <div className="glass-surface border-2 border-[#9C4AFF]/30 rounded-xl px-6 py-3 shadow-glowViolet hover:border-[#9C4AFF]/60 hover:shadow-[0_0_30px_5px_rgba(156,74,255,0.6)] transition-all duration-300">
              <p className="text-sm text-[#B8A7E0]">
                <span className="text-white font-semibold">College:</span>{' '}
                <span className="text-[#9C4AFF] font-medium glow-text-violet">Government College of Engineering, Karad</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}