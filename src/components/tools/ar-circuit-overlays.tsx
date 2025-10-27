'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Camera, Zap, Info, ScanLine, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ARMode {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: string[];
}

const arModes: ARMode[] = [
  {
    id: 'voltage-detector',
    name: 'Live Voltage Detector',
    description: 'Visualize electrical fields and voltage presence',
    icon: Zap,
    features: [
      'Non-contact voltage detection',
      'Visual field strength indicators',
      'Audio warnings for high voltage',
      'Safe working distance markers'
    ]
  },
  {
    id: 'wire-tracer',
    name: 'Wire Path Tracer',
    description: 'Track and visualize wire routes in walls',
    icon: ScanLine,
    features: [
      'Trace wire paths through walls',
      'Identify wire locations before drilling',
      'Show junction box positions',
      'Mark breaker associations'
    ]
  },
  {
    id: 'circuit-info',
    name: 'Circuit Information Overlay',
    description: 'Display circuit details when scanning panels',
    icon: Info,
    features: [
      'Scan breaker labels for info',
      'Show circuit load and capacity',
      'Display connected devices',
      'View load percentage in real-time'
    ]
  }
];

export function ARCircuitOverlays() {
  const [selectedMode, setSelectedMode] = useState<ARMode>(arModes[0]);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResults, setScanResults] = useState<string[]>([]);

  const startCamera = () => {
    setCameraActive(true);
    
    // Simulate AR detection
    setTimeout(() => {
      setScanResults([
        'Detected: 120V circuit',
        'Circuit #: 14',
        'Load: 8.5A / 20A (42.5%)',
        'Status: Normal operation'
      ]);
    }, 2000);
  };

  const stopCamera = () => {
    setCameraActive(false);
    setScanResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AR Circuit Overlays</CardTitle>
          <CardDescription>
            Augmented reality visualization for electrical systems (Mobile device with camera required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AR Mode Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select AR Mode</h3>
            <div className="grid grid-cols-1 gap-4">
              {arModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode.id === mode.id;
                
                return (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      isSelected ? 'ring-2 ring-[#00C2D1]' : ''
                    }`}
                    onClick={() => {
                      setSelectedMode(mode);
                      stopCamera();
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Icon className="h-10 w-10 text-[#00C2D1] flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{mode.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
                          <div className="space-y-1">
                            {mode.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <Badge className="bg-[#00C2D1] text-[#071428]">Active</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Camera View */}
          <Card className="border-2 border-[#00C2D1]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#00C2D1]" />
                AR Camera View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                {!cameraActive ? (
                  <div className="text-center">
                    <Camera className="h-24 w-24 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">Camera not active</p>
                    <Button onClick={startCamera} className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                      <Camera className="h-4 w-4 mr-2" />
                      Start AR Camera
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Simulated Camera Feed */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Smartphone className="h-32 w-32 text-[#00C2D1] animate-pulse" />
                          <p className="text-[#00C2D1] mt-4">Scanning...</p>
                        </div>
                      </div>

                      {/* AR Overlay Elements */}
                      <div className="absolute top-4 left-4 right-4 space-y-2">
                        <Badge className="bg-[#00C2D1] text-[#071428]">
                          {selectedMode.name} Active
                        </Badge>
                      </div>

                      {/* Scan Results */}
                      {scanResults.length > 0 && (
                        <div className="absolute bottom-4 left-4 right-4 space-y-2">
                          {scanResults.map((result, idx) => (
                            <div key={idx} className="bg-black/70 text-white p-3 rounded-lg text-sm backdrop-blur-sm">
                              {result}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Targeting Reticle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-4 border-[#00C2D1] rounded-lg opacity-50">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#00C2D1]"></div>
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00C2D1]"></div>
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#00C2D1]"></div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#00C2D1]"></div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={stopCamera}
                      variant="destructive"
                      size="sm"
                      className="absolute top-4 right-4 z-10"
                    >
                      Stop Camera
                    </Button>
                  </>
                )}
              </div>

              {/* Instructions */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-yellow-900 mb-3">How to Use AR Features</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>1. Allow camera access</strong> when prompted by your browser</li>
                    <li><strong>2. Point camera</strong> at electrical equipment or panels</li>
                    <li><strong>3. Hold steady</strong> while AR system analyzes the scene</li>
                    <li><strong>4. View overlays</strong> showing voltage, circuit info, or wire paths</li>
                    <li><strong>5. Tap markers</strong> for detailed information</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Browser Compatibility */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Requirements</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Modern smartphone or tablet with camera</li>
                        <li>• Browser with WebRTC support (Chrome, Safari, Firefox)</li>
                        <li>• Good lighting conditions for best results</li>
                        <li>• Stable internet connection</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
