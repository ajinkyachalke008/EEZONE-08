'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, FileText, Settings, ArrowRight, Download, Bot } from 'lucide-react';
import Link from 'next/link';

export function ProDiagramEditorDetails() {
  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PenTool className="h-6 w-6 text-[#00E5FF]" />
            Pro Diagram Editor
          </CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Professional-grade circuit and schematic editor powered by Draw.io with advanced AI capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <img 
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=600&fit=crop" 
              alt="Pro Diagram Editor" 
              className="w-full h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0014] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-surface border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <CardContent className="p-4 space-y-2">
                <Bot className="h-5 w-5 text-[#FF00C8]" />
                <h3 className="font-semibold text-white">AI Generate</h3>
                <p className="text-sm text-[#B8A7E0]">Simply describe your circuit and watch the AI build it instantly. Perfect for prototyping ideas.</p>
              </CardContent>
            </Card>

            <Card className="glass-surface border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <CardContent className="p-4 space-y-2">
                <Settings className="h-5 w-5 text-[#FF6B00]" />
                <h3 className="font-semibold text-white">1000+ Electrical Symbols</h3>
                <p className="text-sm text-[#B8A7E0]">A comprehensive library of standard components for professional, industry-compliant schematics.</p>
              </CardContent>
            </Card>

            <Card className="glass-surface border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <CardContent className="p-4 space-y-2">
                <FileText className="h-5 w-5 text-[#00E5FF]" />
                <h3 className="font-semibold text-white">Mermaid Integration</h3>
                <p className="text-sm text-[#B8A7E0]">Convert text-based Mermaid code directly into beautiful diagrams with just a few clicks.</p>
              </CardContent>
            </Card>

            <Card className="glass-surface border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <CardContent className="p-4 space-y-2">
                <Download className="h-5 w-5 text-[#9C4AFF]" />
                <h3 className="font-semibold text-white">Export Anywhere</h3>
                <p className="text-sm text-[#B8A7E0]">Quickly export your high-resolution designs to PNG, SVG, or high-quality PDF formats.</p>
              </CardContent>
            </Card>
          </div>

          <Link href="/tools/diagram-editor" className="block mt-6">
            <Button 
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#9C4AFF] text-white hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]"
              size="lg"
            >
              Launch Pro Diagram Editor
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
