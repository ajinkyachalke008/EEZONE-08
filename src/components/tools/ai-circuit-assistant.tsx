'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  Calculator,
  Wand2,
  Brain,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AICircuitAssistantProps {
  onGenerateCircuit?: (circuit: any) => void;
  currentComponents?: any[];
  currentWires?: any[];
  validationErrors?: any[];
}

interface AIResponse {
  success: boolean;
  data?: any;
  suggestions?: string[];
  explanation?: string;
  components?: any[];
  connections?: any[];
  issues?: any[];
  fixes?: any[];
}

export function AICircuitAssistant({ 
  onGenerateCircuit, 
  currentComponents = [],
  currentWires = [],
  validationErrors = []
}: AICircuitAssistantProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'suggest' | 'diagnose' | 'calculate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  // Text-to-Circuit Generation
  const handleGenerateCircuit = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your circuit');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-circuit',
          prompt: prompt.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        
        if (data.success && data.components) {
          toast.success('Circuit generated successfully!', {
            description: `${data.components.length} components, ${data.connections?.length || 0} connections`,
          });
        } else {
          toast.error('Failed to generate circuit');
        }
      } else {
        toast.error('AI service error');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Component Suggestions
  const handleGetSuggestions = async () => {
    if (currentComponents.length === 0) {
      toast.error('Add components to get suggestions');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-components',
          components: currentComponents,
          wires: currentWires,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        toast.success('AI suggestions generated!');
      } else {
        toast.error('AI service error');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fault Diagnosis
  const handleDiagnose = async () => {
    if (currentComponents.length === 0) {
      toast.error('Build a circuit first to diagnose');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnose-circuit',
          components: currentComponents,
          wires: currentWires,
          errors: validationErrors,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        
        if (data.issues && data.issues.length > 0) {
          toast.warning(`Found ${data.issues.length} potential issue(s)`);
        } else {
          toast.success('Circuit looks good!');
        }
      } else {
        toast.error('AI service error');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-Calculate Values
  const handleCalculateValues = async () => {
    if (!prompt.trim()) {
      toast.error('Describe what you want to calculate');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate-values',
          prompt: prompt.trim(),
          components: currentComponents,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        toast.success('Calculations complete!');
      } else {
        toast.error('AI service error');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyGenerated = () => {
    if (response?.components) {
      onGenerateCircuit?.(response);
      toast.success('Circuit applied to canvas!');
      setResponse(null);
      setPrompt('');
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#9C4AFF]" />
          AI Circuit Assistant
          <Badge className="bg-[#9C4AFF]/20 text-[#9C4AFF] border-[#9C4AFF]/30">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-4 bg-white/10">
            <TabsTrigger value="generate" className="data-[state=active]:bg-[#9C4AFF]">
              <Wand2 className="h-4 w-4 mr-1" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="suggest" className="data-[state=active]:bg-[#00E5FF]">
              <Lightbulb className="h-4 w-4 mr-1" />
              Suggest
            </TabsTrigger>
            <TabsTrigger value="diagnose" className="data-[state=active]:bg-[#FF6B00]">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Diagnose
            </TabsTrigger>
            <TabsTrigger value="calculate" className="data-[state=active]:bg-[#00E5FF]">
              <Calculator className="h-4 w-4 mr-1" />
              Calculate
            </TabsTrigger>
          </TabsList>

          {/* Generate Circuit Tab */}
          <TabsContent value="generate" className="space-y-4 mt-4">
            <Card className="bg-[#9C4AFF]/10 border-[#9C4AFF]/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Wand2 className="h-5 w-5 text-[#9C4AFF] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Text-to-Circuit Generation</p>
                    <p className="text-gray-300 text-sm">
                      Describe your circuit in plain English and AI will generate a complete schematic with components and connections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a blinking LED circuit using 555 timer at 1Hz with a 9V battery"
              className="bg-white/10 border-white/20 text-white min-h-[120px]"
              disabled={loading}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateCircuit}
                disabled={loading || !prompt.trim()}
                className="flex-1 bg-[#9C4AFF] text-white hover:bg-[#9C4AFF]/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Circuit
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPrompt('');
                  setResponse(null);
                }}
                className="bg-white/10 border-white/20 text-white"
              >
                Clear
              </Button>
            </div>

            {/* Example Prompts */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold">Example Prompts:</p>
              {[
                'LED blink circuit with 555 timer at 2Hz',
                'Arduino-based temperature sensor with LCD display',
                'RC low-pass filter with 1kHz cutoff frequency',
                'H-bridge motor driver with direction control',
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="block w-full text-left text-xs text-[#00E5FF] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded transition-colors"
                >
                  💡 {example}
                </button>
              ))}
            </div>

            {/* Generated Result */}
            <AnimatePresence>
              {response && response.components && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            Circuit Generated!
                          </p>
                          <Button
                            size="sm"
                            onClick={applyGenerated}
                            className="bg-[#9C4AFF] text-white hover:bg-[#9C4AFF]/90"
                          >
                            Apply to Canvas
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-300">
                          <p>• {response.components.length} components</p>
                          <p>• {response.connections?.length || 0} connections</p>
                        </div>

                        {response.explanation && (
                          <div className="p-3 bg-white/5 rounded border border-white/20">
                            <p className="text-xs text-gray-300">{response.explanation}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Component Suggestions Tab */}
          <TabsContent value="suggest" className="space-y-4 mt-4">
            <Card className="bg-[#00E5FF]/10 border-[#00E5FF]/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Smart Component Recommendations</p>
                    <p className="text-gray-300 text-sm">
                      AI analyzes your current circuit and suggests compatible components, modules, and improvements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-white/5 rounded-lg border border-white/20">
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong className="text-white">Current Circuit:</strong></p>
                <p>• {currentComponents.length} components placed</p>
                <p>• {currentWires.length} connections made</p>
              </div>
            </div>

            <Button
              onClick={handleGetSuggestions}
              disabled={loading || currentComponents.length === 0}
              className="w-full bg-[#00E5FF] text-[#071428] hover:bg-[#00E5FF]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Suggestions
                </>
              )}
            </Button>

            {/* Suggestions Result */}
            <AnimatePresence>
              {response && response.suggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-[#00E5FF]" />
                    AI Recommendations:
                  </p>
                  {response.suggestions.map((suggestion, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-4 w-4 text-[#00E5FF] mt-0.5" />
                          <p className="text-sm text-gray-300">{suggestion}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Diagnose Tab */}
          <TabsContent value="diagnose" className="space-y-4 mt-4">
            <Card className="bg-[#FF6B00]/10 border-[#FF6B00]/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Circuit Troubleshooting</p>
                    <p className="text-gray-300 text-sm">
                      AI analyzes your circuit for potential issues, explains problems, and provides step-by-step fixes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-white/5 rounded-lg border border-white/20">
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong className="text-white">Circuit Status:</strong></p>
                <p>• {currentComponents.length} components</p>
                <p>• {currentWires.length} connections</p>
                <p>• {validationErrors.length} validation issues</p>
              </div>
            </div>

            <Button
              onClick={handleDiagnose}
              disabled={loading || currentComponents.length === 0}
              className="w-full bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Diagnosing...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Diagnose Circuit
                </>
              )}
            </Button>

            {/* Diagnosis Result */}
            <AnimatePresence>
              {response && (response.issues || response.fixes) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {response.issues && response.issues.length > 0 ? (
                    <>
                      <p className="text-white font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#FF6B00]" />
                        Issues Found:
                      </p>
                      {response.issues.map((issue: any, idx: number) => (
                        <Card key={idx} className="bg-red-500/10 border-red-500/30">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <p className="text-white font-semibold text-sm">{issue.title}</p>
                              <p className="text-gray-300 text-xs">{issue.description}</p>
                              {issue.fix && (
                                <div className="p-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded">
                                  <p className="text-xs text-[#00E5FF]">
                                    💡 <strong>Fix:</strong> {issue.fix}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Card className="bg-green-500/10 border-green-500/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          <p className="text-white text-sm">No issues detected! Your circuit looks good.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Calculate Tab */}
          <TabsContent value="calculate" className="space-y-4 mt-4">
            <Card className="bg-[#00E5FF]/10 border-[#00E5FF]/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Calculator className="h-5 w-5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Auto-Calculate Component Values</p>
                    <p className="text-gray-300 text-sm">
                      Specify your requirements and AI will calculate optimal component values with explanations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Calculate resistor for LED with 10mA current, 9V supply, 2V LED forward voltage"
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
              disabled={loading}
            />

            <Button
              onClick={handleCalculateValues}
              disabled={loading || !prompt.trim()}
              className="w-full bg-[#00E5FF] text-[#071428] hover:bg-[#00E5FF]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Values
                </>
              )}
            </Button>

            {/* Example Calculations */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold">Example Calculations:</p>
              {[
                'LED current-limiting resistor for 20mA, 5V supply',
                'RC filter cutoff frequency with 10kΩ and 100nF',
                '555 timer frequency with 10kΩ resistors and 10µF capacitor',
                'Voltage divider to get 3.3V from 5V supply',
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="block w-full text-left text-xs text-[#00E5FF] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded transition-colors"
                >
                  📐 {example}
                </button>
              ))}
            </div>

            {/* Calculation Result */}
            <AnimatePresence>
              {response && response.data && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <p className="text-white font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          Calculation Results:
                        </p>
                        
                        {response.explanation && (
                          <div className="p-3 bg-white/5 rounded border border-white/20">
                            <p className="text-sm text-gray-300 whitespace-pre-line">{response.explanation}</p>
                          </div>
                        )}

                        {response.data.values && (
                          <div className="space-y-2">
                            {Object.entries(response.data.values).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between p-2 bg-white/5 rounded">
                                <span className="text-gray-300 text-sm capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-[#00E5FF] font-bold text-sm">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
