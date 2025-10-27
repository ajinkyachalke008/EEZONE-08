'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, Play, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface Experiment {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

const experiments: Experiment[] = [
  {
    id: 'ohms-law',
    name: "Ohm's Law Verification",
    description: 'Verify the relationship between voltage, current, and resistance',
    difficulty: 'beginner',
    duration: '10 min'
  },
  {
    id: 'series-parallel',
    name: 'Series vs Parallel Circuits',
    description: 'Compare voltage and current in series and parallel configurations',
    difficulty: 'beginner',
    duration: '15 min'
  },
  {
    id: 'capacitor-charging',
    name: 'Capacitor Charging/Discharging',
    description: 'Observe capacitor behavior in RC circuits',
    difficulty: 'intermediate',
    duration: '20 min'
  },
  {
    id: 'transformer',
    name: 'Transformer Operation',
    description: 'Study voltage transformation and turns ratio',
    difficulty: 'intermediate',
    duration: '25 min'
  },
  {
    id: 'three-phase',
    name: 'Three-Phase Power Systems',
    description: 'Analyze balanced and unbalanced three-phase loads',
    difficulty: 'advanced',
    duration: '30 min'
  }
];

export function VirtualLabExperiments() {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [voltage, setVoltage] = useState([12]);
  const [resistance, setResistance] = useState([100]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ voltage: number; current: number; power: number } | null>(null);

  const startExperiment = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      // Simulate Ohm's Law calculation
      const v = voltage[0];
      const r = resistance[0];
      const current = v / r;
      const power = v * current;
      
      setResults({
        voltage: v,
        current: current,
        power: power
      });
      setIsRunning(false);
    }, 2000);
  };

  const resetExperiment = () => {
    setResults(null);
    setVoltage([12]);
    setResistance([100]);
  };

  const getDifficultyColor = (difficulty: Experiment['difficulty']) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Virtual Lab Experiments</CardTitle>
          <CardDescription>
            Hands-on electrical experiments without physical equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Experiment Selection */}
          {!selectedExperiment && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Choose an Experiment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiments.map((exp) => (
                  <Card
                    key={exp.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedExperiment(exp)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <Beaker className="h-8 w-8 text-[#00C2D1]" />
                        <Badge className={getDifficultyColor(exp.difficulty)}>
                          {exp.difficulty}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{exp.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{exp.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Duration: {exp.duration}</span>
                        <Button size="sm" variant="outline">Start</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Active Experiment */}
          {selectedExperiment && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">{selectedExperiment.name}</h3>
                  <p className="text-sm text-gray-600">{selectedExperiment.description}</p>
                </div>
                <Button variant="outline" onClick={() => {
                  setSelectedExperiment(null);
                  resetExperiment();
                }}>
                  Change Experiment
                </Button>
              </div>

              {/* Experiment Interface (Ohm's Law Demo) */}
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardContent className="pt-6 space-y-6">
                  <h4 className="font-semibold text-lg">Experiment Parameters</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm">Voltage (V)</label>
                        <span className="font-semibold">{voltage[0]} V</span>
                      </div>
                      <Slider
                        value={voltage}
                        onValueChange={setVoltage}
                        min={1}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm">Resistance (Ω)</label>
                        <span className="font-semibold">{resistance[0]} Ω</span>
                      </div>
                      <Slider
                        value={resistance}
                        onValueChange={setResistance}
                        min={10}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={startExperiment}
                      disabled={isRunning}
                      className="flex-1 bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? 'Running...' : 'Run Experiment'}
                    </Button>
                    <Button onClick={resetExperiment} variant="outline" className="text-white border-white hover:bg-white/10">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {results && (
                <Card className="border-2 border-[#00C2D1]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Experiment Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Voltage</div>
                        <div className="text-2xl font-bold text-[#071428]">{results.voltage} V</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Current</div>
                        <div className="text-2xl font-bold text-[#071428]">{results.current.toFixed(3)} A</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Power</div>
                        <div className="text-2xl font-bold text-[#071428]">{results.power.toFixed(2)} W</div>
                      </div>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-blue-900 mb-3">Analysis</h4>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>• <strong>Ohm's Law Verified:</strong> I = V / R = {results.voltage} / {resistance[0]} = {results.current.toFixed(3)} A</li>
                          <li>• <strong>Power Calculation:</strong> P = V × I = {results.voltage} × {results.current.toFixed(3)} = {results.power.toFixed(2)} W</li>
                          <li>• <strong>Observation:</strong> Current is inversely proportional to resistance</li>
                          <li>• <strong>Conclusion:</strong> Results confirm Ohm's Law relationship</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {/* Learning Points */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Key Learning Points</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Voltage and current have a linear relationship</li>
                        <li>• Increasing resistance decreases current (at constant voltage)</li>
                        <li>• Power dissipation increases with both voltage and current</li>
                        <li>• These relationships are fundamental to circuit design</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
