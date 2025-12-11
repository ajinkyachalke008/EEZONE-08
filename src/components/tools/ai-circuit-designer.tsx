'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CircuitBoard, Download, Sparkles, Zap, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Component {
  id: string;
  type: string;
  label: string;
  value?: string;
}

interface Circuit {
  title: string;
  description: string;
  components: Component[];
  schematicDescription: string;
  calculations?: string;
  notes?: string[];
}

export function AICircuitDesigner() {
  const [prompt, setPrompt] = useState('');
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [error, setError] = useState('');

  const designCircuit = async () => {
    if (!prompt.trim()) return;
    
    setIsDesigning(true);
    setError('');
    setCircuit(null);
    
    try {
      const response = await fetch('/api/ai-circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to design circuit');
      }
      
      setCircuit(data.circuit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to design circuit');
    } finally {
      setIsDesigning(false);
    }
  };

  const examplePrompts = [
    'Design a simple LED circuit with 9V battery',
    'Create a motor speed controller using PWM',
    'Build a temperature sensor circuit with alarm',
    'Design a power supply with 5V regulation'
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CircuitBoard className="h-6 w-6 text-[#FF00C8]" />
            AI Circuit Designer
          </CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Describe your circuit needs and get AI-powered schematic suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Example Circuits</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePrompts.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => setPrompt(example)}
                  className="justify-start text-left h-auto py-3 glass-surface border-white/20 text-white hover:bg-white/10"
                >
                  <div className="flex-1 text-sm">{example}</div>
                  <CircuitBoard className="h-4 w-4 text-[#FF00C8] flex-shrink-0" />
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Describe your circuit requirements</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: I need a circuit to flash an LED at 1Hz using a 555 timer with 9V power supply"
              rows={4}
              className="glass-surface border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <Button 
            onClick={designCircuit}
            disabled={isDesigning || !prompt.trim()}
            className="w-full bg-gradient-to-r from-[#9C4AFF] to-[#FF00C8] text-white hover:opacity-90"
            size="lg"
          >
            {isDesigning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Designing Circuit...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Design Circuit
              </>
            )}
          </Button>

          {circuit && (
            <div className="space-y-4">
              <Card className="border-2 border-[#9C4AFF]/50 glass-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CircuitBoard className="h-5 w-5 text-[#FF00C8]" />
                    {circuit.title}
                  </CardTitle>
                  <CardDescription className="text-[#B8A7E0]">{circuit.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-white">Bill of Materials</h4>
                    <div className="space-y-2">
                      {circuit.components.map((component) => (
                        <div key={component.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-[#9C4AFF] text-[#9C4AFF]">{component.label}</Badge>
                            <span className="font-medium text-white">{component.type}</span>
                          </div>
                          <span className="text-sm text-[#B8A7E0]">{component.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#9C4AFF]/10 border border-[#9C4AFF]/30 rounded-lg">
                    <h4 className="font-semibold text-[#9C4AFF] mb-2">Circuit Connections</h4>
                    <p className="text-sm text-[#B8A7E0] whitespace-pre-wrap">{circuit.schematicDescription}</p>
                  </div>

                  {circuit.calculations && (
                    <div className="p-4 bg-[#FF00C8]/10 border border-[#FF00C8]/30 rounded-lg">
                      <h4 className="font-semibold text-[#FF00C8] mb-2">Calculations</h4>
                      <p className="text-sm text-[#B8A7E0] whitespace-pre-wrap font-mono">{circuit.calculations}</p>
                    </div>
                  )}

                  {circuit.notes && circuit.notes.length > 0 && (
                    <Card className="bg-yellow-500/10 border-yellow-500/30">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Design Notes
                        </h4>
                        <ul className="text-sm text-[#B8A7E0] space-y-1">
                          {circuit.notes.map((note, idx) => (
                            <li key={idx}>• {note}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Button className="w-full glass-surface border-white/20 text-white hover:bg-white/10" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Design (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {!circuit && !isDesigning && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <CircuitBoard className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Describe your circuit requirements to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}