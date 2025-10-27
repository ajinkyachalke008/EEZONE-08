'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Camera, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiagnosisStep {
  step: number;
  title: string;
  action: string;
  expectedResult: string;
}

interface Diagnosis {
  problem: string;
  likelyCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  diagnosticSteps: DiagnosisStep[];
  solution: string;
  preventiveMeasures: string[];
}

export function AITroubleshooting() {
  const [problemType, setProblemType] = useState('electrical');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeProblem = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      // Simulate AI diagnosis
      const sampleDiagnosis: Diagnosis = {
        problem: 'Circuit Breaker Tripping',
        likelyCause: 'Overload condition or short circuit',
        severity: 'high',
        diagnosticSteps: [
          {
            step: 1,
            title: 'Check Load',
            action: 'Measure total connected load on the circuit',
            expectedResult: 'Load should be below breaker rating (e.g., 16A for 20A breaker)'
          },
          {
            step: 2,
            title: 'Inspect Connections',
            action: 'Visually inspect all wire connections for loose or damaged wiring',
            expectedResult: 'All connections tight, no signs of overheating or damage'
          },
          {
            step: 3,
            title: 'Test for Short Circuit',
            action: 'Disconnect loads and test insulation resistance with megger',
            expectedResult: 'Insulation resistance > 1 MΩ between conductors and ground'
          },
          {
            step: 4,
            title: 'Verify Breaker',
            action: 'Test breaker operation with known good load',
            expectedResult: 'Breaker holds with proper load, trips at rated current'
          }
        ],
        solution: 'Based on symptoms, most likely cause is circuit overload. Redistribute loads across multiple circuits or upgrade circuit capacity if needed. If breaker still trips with reduced load, replace the breaker as it may be defective.',
        preventiveMeasures: [
          'Perform regular load assessments',
          'Avoid daisy-chaining power strips',
          'Label circuit breakers clearly',
          'Schedule preventive maintenance checks',
          'Monitor for signs of overheating'
        ]
      };

      setDiagnosis(sampleDiagnosis);
      setIsAnalyzing(false);
    }, 2500);
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
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Troubleshooting Assistant</CardTitle>
          <CardDescription>
            Upload error photos or describe symptoms for diagnostic help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Problem Category</label>
            <Select value={problemType} onValueChange={setProblemType}>
              <SelectTrigger>
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

          {/* Common Issues Quick Select */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Common Issues</label>
            <div className="grid grid-cols-1 gap-2">
              {commonIssues.map((issue) => (
                <Button
                  key={issue.value}
                  variant="outline"
                  onClick={() => setSymptoms(issue.label)}
                  className="justify-start text-left"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                  {issue.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Photo Upload Simulation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Photo (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">Take a photo of the problem area</p>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>

          {/* Symptoms Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe the symptoms</label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe what's happening: When did it start? What were you doing? Any unusual sounds, smells, or visual indicators?"
              rows={5}
            />
          </div>

          <Button 
            onClick={analyzeProblem}
            disabled={isAnalyzing || !symptoms}
            className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
            size="lg"
          >
            <Wrench className="h-5 w-5 mr-2" />
            {isAnalyzing ? 'Analyzing Problem...' : 'Diagnose Problem'}
          </Button>

          {/* Diagnosis Results */}
          {diagnosis && (
            <div className="space-y-4">
              {/* Problem Summary */}
              <Card className="border-2 border-[#00C2D1]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#00C2D1]" />
                        {diagnosis.problem}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <strong>Likely Cause:</strong> {diagnosis.likelyCause}
                      </CardDescription>
                    </div>
                    <Badge className={getSeverityColor(diagnosis.severity)}>
                      {diagnosis.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Diagnostic Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Step-by-Step Diagnostic</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diagnosis.diagnosticSteps.map((step) => (
                    <div key={step.step} className="p-4 border-2 border-gray-200 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#071428] text-white flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#071428] mb-2">{step.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong className="text-gray-700">Action:</strong>
                              <p className="text-gray-600 mt-1">{step.action}</p>
                            </div>
                            <div>
                              <strong className="text-gray-700">Expected Result:</strong>
                              <p className="text-gray-600 mt-1">{step.expectedResult}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Solution */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Recommended Solution
                  </h4>
                  <p className="text-sm text-gray-700">{diagnosis.solution}</p>
                </CardContent>
              </Card>

              {/* Preventive Measures */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Preventive Measures
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {diagnosis.preventiveMeasures.map((measure, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{measure}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Safety Warning */}
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Safety Warning</h4>
                      <p className="text-sm text-gray-700">
                        Always turn off power at the breaker before working on electrical systems. 
                        If you're not comfortable performing these diagnostics, contact a licensed electrician.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!diagnosis && (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Describe your problem or upload a photo to get diagnostic help</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
