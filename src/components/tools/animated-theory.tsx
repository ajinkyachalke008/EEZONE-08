'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Pause, RotateCcw, BookOpen, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface Theory {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
}

const theories: Theory[] = [
  {
    id: 'transformer',
    title: 'How Transformers Work',
    category: 'Power Systems',
    description: 'Electromagnetic induction and voltage transformation',
    difficulty: 'intermediate',
    duration: '5 min'
  },
  {
    id: 'ac-motor',
    title: 'AC Motor Operation',
    category: 'Motors',
    description: 'Rotating magnetic field and motor action',
    difficulty: 'intermediate',
    duration: '6 min'
  },
  {
    id: 'three-phase',
    title: 'Three-Phase Power',
    category: 'Power Systems',
    description: 'Phase relationships and power generation',
    difficulty: 'advanced',
    duration: '7 min'
  },
  {
    id: 'capacitor',
    title: 'Capacitor Behavior',
    category: 'Components',
    description: 'Charging, discharging, and energy storage',
    difficulty: 'beginner',
    duration: '4 min'
  },
  {
    id: 'rectifier',
    title: 'AC to DC Rectification',
    category: 'Power Electronics',
    description: 'Half-wave and full-wave rectifier operation',
    difficulty: 'intermediate',
    duration: '5 min'
  }
];

export function AnimatedTheory() {
  const [selectedTheory, setSelectedTheory] = useState<Theory>(theories[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Simulate animation progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev[0] + 2;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return [100];
          }
          return [newProgress];
        });
      }, 100 / playbackSpeed[0]);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress([0]);
  };

  const getDifficultyColor = (difficulty: Theory['difficulty']) => {
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
          <CardTitle>Animated Theory Explanations</CardTitle>
          <CardDescription>
            Learn how electrical concepts work through interactive animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theory Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theories.map((theory) => (
              <Card
                key={theory.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  selectedTheory.id === theory.id ? 'ring-2 ring-[#00C2D1]' : ''
                }`}
                onClick={() => {
                  setSelectedTheory(theory);
                  handleReset();
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <BookOpen className="h-8 w-8 text-[#00C2D1]" />
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(theory.difficulty)}>
                        {theory.difficulty}
                      </Badge>
                      <Badge variant="outline">{theory.duration}</Badge>
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{theory.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{theory.description}</p>
                  <Badge variant="secondary">{theory.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Animation Viewer */}
          <Card className="border-2 border-[#00C2D1]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedTheory.title}</CardTitle>
                  <CardDescription>{selectedTheory.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(selectedTheory.difficulty)}>
                  {selectedTheory.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Animation Canvas */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Zap className={`h-32 w-32 mx-auto mb-4 ${isPlaying ? 'text-[#00C2D1] animate-pulse' : 'text-gray-600'}`} />
                  <p className="text-gray-400">
                    {isPlaying ? 'Animation Playing...' : 'Click Play to Start Animation'}
                  </p>
                  {progress[0] > 0 && (
                    <div className="mt-4">
                      <Badge variant="secondary" className="bg-[#00C2D1] text-[#071428]">
                        {progress[0]}% Complete
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Progress Overlay */}
                {progress[0] > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div
                      className="h-full bg-[#00C2D1] transition-all"
                      style={{ width: `${progress[0]}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Playback Controls */}
              <div className="space-y-4">
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handlePlayPause}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Playback Speed</label>
                    <span className="text-sm font-semibold">{playbackSpeed[0]}x</span>
                  </div>
                  <Slider
                    value={playbackSpeed}
                    onValueChange={setPlaybackSpeed}
                    min={0.5}
                    max={2}
                    step={0.25}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Learning Content */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-yellow-900 mb-3">What You'll Learn</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {selectedTheory.id === 'transformer' && (
                      <>
                        <li>• Primary and secondary coil relationships</li>
                        <li>• Voltage transformation principles</li>
                        <li>• Current and power transfer</li>
                        <li>• Efficiency and losses</li>
                      </>
                    )}
                    {selectedTheory.id === 'ac-motor' && (
                      <>
                        <li>• Rotating magnetic field generation</li>
                        <li>• Rotor and stator interaction</li>
                        <li>• Starting torque and slip</li>
                        <li>• Speed control methods</li>
                      </>
                    )}
                    {selectedTheory.id === 'three-phase' && (
                      <>
                        <li>• 120° phase displacement</li>
                        <li>• Delta and Wye configurations</li>
                        <li>• Balanced vs unbalanced loads</li>
                        <li>• Power calculation methods</li>
                      </>
                    )}
                    {selectedTheory.id === 'capacitor' && (
                      <>
                        <li>• Charge storage mechanism</li>
                        <li>• Charging and discharging curves</li>
                        <li>• RC time constant</li>
                        <li>• Energy storage applications</li>
                      </>
                    )}
                    {selectedTheory.id === 'rectifier' && (
                      <>
                        <li>• Diode operation and characteristics</li>
                        <li>• Half-wave vs full-wave rectification</li>
                        <li>• Filtering and smoothing</li>
                        <li>• Ripple voltage analysis</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
