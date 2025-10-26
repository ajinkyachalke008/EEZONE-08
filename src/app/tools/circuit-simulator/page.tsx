'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircuitBoard, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function CircuitSimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link href="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-2 flex items-center gap-3">
            <CircuitBoard className="h-10 w-10 text-[#00C2D1]" />
            Interactive Circuit Simulator
          </h1>
          <p className="text-gray-600 text-lg">
            Professional circuit simulation with real-time analysis and waveform display
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>Build and analyze your circuit in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="bg-[#071428] hover:bg-[#071428]/90"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsRunning(false)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Components</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">⚡ Voltage Source</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">🔌 Current Source</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">📊 Resistor</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">🔋 Capacitor</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">🧲 Inductor</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">💡 LED</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">⚙️ Diode</div>
                    <div className="p-2 border rounded hover:bg-gray-50 cursor-pointer">🔺 Transistor</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3 bg-[#071428] text-white">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-[#00C2D1]">Circuit Canvas</h3>
                  <div className="bg-white rounded-lg p-8 min-h-[400px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <CircuitBoard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-semibold text-gray-600">
                        🚧 Advanced Circuit Simulator Coming Soon
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Drag and drop components to build your circuit
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs font-semibold text-gray-700">Features:</p>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            <li>• SPICE Integration</li>
                            <li>• DC/AC Analysis</li>
                            <li>• Transient Simulation</li>
                            <li>• Virtual Oscilloscope</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs font-semibold text-gray-700">Analysis:</p>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            <li>• Node Voltages</li>
                            <li>• Branch Currents</li>
                            <li>• Power Dissipation</li>
                            <li>• Frequency Response</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Oscilloscope</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#071428] rounded p-4 h-40 flex items-center justify-center text-gray-400 text-sm">
                    <p>Waveform Display</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Multimeter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Voltage:</span>
                      <span className="font-bold">0.00 V</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Current:</span>
                      <span className="font-bold">0.00 A</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Resistance:</span>
                      <span className="font-bold">0.00 Ω</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Power:</span>
                      <span className="font-bold">0.00 W</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Click components to view properties</p>
                    <p>• Run simulation for analysis</p>
                    <p>• Export netlist for SPICE</p>
                    <p>• Save circuit designs</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="font-bold text-[#00C2D1]">1.</div>
                <div>
                  <p className="font-semibold">Select Components</p>
                  <p className="text-gray-600">Choose from the component library on the left</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="font-bold text-[#00C2D1]">2.</div>
                <div>
                  <p className="font-semibold">Build Circuit</p>
                  <p className="text-gray-600">Drag components to canvas and connect them</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="font-bold text-[#00C2D1]">3.</div>
                <div>
                  <p className="font-semibold">Run Simulation</p>
                  <p className="text-gray-600">Click Run to see real-time analysis</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="font-bold text-[#00C2D1]">4.</div>
                <div>
                  <p className="font-semibold">View Results</p>
                  <p className="text-gray-600">Check oscilloscope and multimeter readings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Analysis Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">⚡ DC Operating Point</p>
                <p className="text-gray-600 text-xs">Find steady-state voltages and currents</p>
              </div>
              <div>
                <p className="font-semibold">📈 AC Analysis</p>
                <p className="text-gray-600 text-xs">Frequency response and impedance</p>
              </div>
              <div>
                <p className="font-semibold">⏱️ Transient Analysis</p>
                <p className="text-gray-600 text-xs">Time-domain behavior and waveforms</p>
              </div>
              <div>
                <p className="font-semibold">🎯 Parameter Sweep</p>
                <p className="text-gray-600 text-xs">Vary component values automatically</p>
              </div>
              <div>
                <p className="font-semibold">📊 Fourier Analysis</p>
                <p className="text-gray-600 text-xs">Frequency spectrum analysis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
