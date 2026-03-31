'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Maximize2, Minimize2, Sparkles, FileCode, 
  Download, Layers, Zap, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiagramEditorPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTips, setShowTips] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Build the iframe URL with all features enabled
  const cacheBuster = Date.now();
  const drawioUrl = [
    '/drawio/index.html?',
    'local=1',         // Save files locally
    '&ui=dark',        // Dark theme
    '&spin=1',         // Show loading spinner
    '&libraries=1',    // Enable all shape libraries
    '&clibs=electrical', // Load electrical component library
    '&splash=0',       // Skip splash screen for faster loading
    '&noSaveBtn=0',    // Show save button
    `&_cb=${cacheBuster}`, // Cache buster
  ].join('');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0B0A11] text-white">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 md:px-6 py-3 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between border-b border-white/5 glass-surface backdrop-blur-glass"
      >
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#B8A7E0]">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <span className="opacity-40">/</span>
            <span className="text-white font-medium">Diagram Editor</span>
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="glow-text-violet">Pro Diagram Editor</span>
          </h1>
          <p className="text-xs text-[#B8A7E0] hidden md:block">
            Full-featured circuit &amp; schematic editor with AI Generate, Mermaid, Export &amp; more.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Feature badges */}
          <div className="hidden lg:flex items-center gap-1.5 mr-2">
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-[#9C4AFF]/20 text-[#9C4AFF] border border-[#9C4AFF]/30">
              <Sparkles className="w-3 h-3" /> AI Generate
            </span>
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
              <FileCode className="w-3 h-3" /> Mermaid
            </span>
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
              <Download className="w-3 h-3" /> Export
            </span>
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30">
              <Layers className="w-3 h-3" /> Templates
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-surface border border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all text-[#B8A7E0] hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </motion.button>

          <Link href="/tools">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-surface border border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all text-[#B8A7E0] hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Tips Banner */}
      <AnimatePresence>
        {showTips && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-[#9C4AFF]/10 via-[#FF6B00]/10 to-[#00E5FF]/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-[#B8A7E0] overflow-x-auto">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-[#9C4AFF]" />
                  <strong className="text-white">AI Generate:</strong> Extras → Plugins or use sparkle ✨ icon
                </span>
                <span className="hidden sm:inline text-white/20">|</span>
                <span className="hidden sm:flex items-center gap-1 whitespace-nowrap">
                  <FileCode className="w-3 h-3 text-[#FF6B00]" />
                  <strong className="text-white">Mermaid:</strong> + → Advanced → Mermaid
                </span>
                <span className="hidden md:inline text-white/20">|</span>
                <span className="hidden md:flex items-center gap-1 whitespace-nowrap">
                  <Download className="w-3 h-3 text-[#00E5FF]" />
                  <strong className="text-white">Export:</strong> File → Export as → PNG/SVG/PDF
                </span>
                <span className="hidden lg:inline text-white/20">|</span>
                <span className="hidden lg:flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3 h-3 text-[#00FF88]" />
                  <strong className="text-white">Electrical:</strong> Search &quot;battery&quot;, &quot;resistor&quot;, &quot;LED&quot; in shapes
                </span>
              </div>
              <button
                onClick={() => setShowTips(false)}
                className="ml-2 p-1 rounded hover:bg-white/10 transition-colors text-[#B8A7E0] hover:text-white flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Draw.io Iframe */}
      <div className="flex-1 w-full relative bg-[#111]">
        {isMounted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute inset-0"
          >
            <iframe
              title="EE Zone Pro Diagram Editor"
              src={drawioUrl}
              className="w-full h-full border-0"
              allow="fullscreen"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
            {/* Animated loader */}
            <div className="relative">
              <div className="w-20 h-20 border-4 border-[#9C4AFF]/20 rounded-full" />
              <div className="w-20 h-20 border-4 border-[#9C4AFF] border-t-transparent rounded-full animate-spin absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#9C4AFF] animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium">Loading Pro Diagram Engine</p>
              <p className="text-[#B8A7E0] text-sm animate-pulse">Initializing AI Generate, Mermaid, Export...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
