'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Camera, AlertTriangle, CheckCircle2, Lightbulb, Loader2, Clock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiagnosisStep {
  step: number;
  title: string;
  action: string;
  expectedResult: string;
  tools?: string;
}

interface Diagnosis {
  problem: string;
  likelyCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  diagnosticSteps: DiagnosisStep[];
  solution: string;
  preventiveMeasures: string[];
  safetyWarnings?: string[];
  estimatedTime?: string;
  partsNeeded?: string[];
}

export function AITroubleshooting() {
  const [problemType, setProblemType] = useState('electrical');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyzeProblem = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    setDiagnosis(null);
    
    try {
      const response = await fetch('/api/ai-troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemType, symptoms }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to diagnose problem');
      }
      
      setDiagnosis(data.diagnosis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze problem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const commonIssues = [
    { value: 'breaker-trip', label: 'Circuit Breaker Keeps Tripping' },
    { value: 'no-power', label: 'No Power at Outlet' },
    { value: 'motor-overheat', label: 'Motor Overheating' },
    { value: 'voltage-drop', label: 'Low Voltage Issues' },
    { value: 'flickering', label: 'Lights Flickering' }
  ];

  const getSeverityColor = (severity: Diagnosis['severity']) => {
    const colors = {
      low: 'bg-green-500/20 text-green-400 border-green-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      critical: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return colors[severity];
  };

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#FF00C8]" />
            AI Troubleshooting Assistant
          </CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Describe symptoms for AI-powered diagnostic help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block text-white">Problem Category</label>
            <Select value={problemType} onValueChange={setProblemType}>
              <SelectTrigger className="glass-surface border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrical">Electrical System</SelectItem>
                <SelectItem value="motor">Motor/Drive</SelectItem>
                <SelectItem value="panel">Panel/Breaker</SelectItem>
                <SelectItem value="wiring">Wiring/Connection</SelectItem>
                <SelectItem value="lighting">Lighting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Common Issues</label>
            <div className="grid grid-cols-1 gap-2">
              {commonIssues.map((issue) => (
                <Button
                  key={issue.value}
                  variant="outline"
                  onClick={() => setSymptoms(issue.label)}
                  className="justify-start text-left glass-surface border-white/20 text-white hover:bg-white/10"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-400" />
                  {issue.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Describe the symptoms</label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe what's happening: When did it start? What were you doing? Any unusual sounds, smells, or visual indicators?"
              rows={5}
              className="glass-surface border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <Button 
            onClick={analyzeProblem}
            disabled={isAnalyzing || !symptoms.trim()}
            className="w-full bg-gradient-to-r from-[#9C4AFF] to-[#FF00C8] text-white hover:opacity-90"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Problem...
              </>
            ) : (
              <>
                <Wrench className="h-5 w-5 mr-2" />
                Diagnose Problem
              </>
            )}
          </Button>

          {diagnosis && (
            <div className="space-y-4">
              <Card className="border-2 border-[#9C4AFF]/50 glass-surface">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <AlertTriangle className="h-5 w-5 text-[#FF00C8]" />
                        {diagnosis.problem}
                      </CardTitle>
                      <CardDescription className="mt-2 text-[#B8A7E0]">
                        <strong>Likely Cause:</strong> {diagnosis.likelyCause}
                      </CardDescription>
                    </div>
                    <Badge className={getSeverityColor(diagnosis.severity)}>
                      {diagnosis.severity.toUpperCase()}
                    </Badge>
                  </div>
                  {(diagnosis.estimatedTime || diagnosis.partsNeeded) && (
                    <div className="flex gap-4 mt-4 text-sm text-[#B8A7E0]">
                      {diagnosis.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {diagnosis.estimatedTime}
                        </div>
                      )}
                      {diagnosis.partsNeeded && diagnosis.partsNeeded.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {diagnosis.partsNeeded.length} parts may be needed
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
              </Card>

              <Card className="glass-surface border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Step-by-Step Diagnostic</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diagnosis.diagnosticSteps.map((step) => (
                    <div key={step.step} className="p-4 border-2 border-white/10 rounded-lg bg-white/5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#9C4AFF] to-[#FF00C8] text-white flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong className="text-[#9C4AFF]">Action:</strong>
                              <p className="text-[#B8A7E0] mt-1">{step.action}</p>
                            </div>
                            <div>
                              <strong className="text-[#9C4AFF]">Expected Result:</strong>
                              <p className="text-[#B8A7E0] mt-1">{step.expectedResult}</p>
                            </div>
                            {step.tools && (
                              <div>
                                <strong className="text-[#9C4AFF]">Tools:</strong>
                                <p className="text-[#B8A7E0] mt-1">{step.tools}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Recommended Solution
                  </h4>
                  <p className="text-sm text-[#B8A7E0]">{diagnosis.solution}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#9C4AFF]/10 border-[#9C4AFF]/30">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-[#9C4AFF] mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Preventive Measures
                  </h4>
                  <ul className="space-y-2 text-sm text-[#B8A7E0]">
                    {diagnosis.preventiveMeasures.map((measure, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#9C4AFF] flex-shrink-0 mt-0.5" />
                        <span>{measure}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Safety Warning</h4>
                      {diagnosis.safetyWarnings && diagnosis.safetyWarnings.length > 0 ? (
                        <ul className="text-sm text-[#B8A7E0] space-y-1">
                          {diagnosis.safetyWarnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[#B8A7E0]">
                          Always turn off power at the breaker before working on electrical systems. 
                          If you&apos;re not comfortable performing these diagnostics, contact a licensed electrician.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!diagnosis && !isAnalyzing && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <Wrench className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Describe your problem to get diagnostic help</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}