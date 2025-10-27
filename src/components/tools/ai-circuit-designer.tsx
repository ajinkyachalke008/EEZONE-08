'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CircuitBoard, Download, Sparkles, Zap } from 'lucide-react';
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
}

export function AICircuitDesigner() {
  const [prompt, setPrompt] = useState('');
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);

  const designCircuit = () => {
    setIsDesigning(true);

    setTimeout(() => {
      // Simulate AI circuit design
      const sampleCircuit: Circuit = {
        title: 'LED Flasher Circuit',
        description: 'Simple 555 timer-based LED flasher with adjustable frequency',
        components: [
          { id: '1', type: 'IC', label: 'U1', value: '555 Timer' },
          { id: '2', type: 'Resistor', label: 'R1', value: '10kΩ' },
          { id: '3', type: 'Resistor', label: 'R2', value: '47kΩ' },
          { id: '4', type: 'Capacitor', label: 'C1', value: '10µF' },
          { id: '5', type: 'Capacitor', label: 'C2', value: '100µF' },
          { id: '6', type: 'LED', label: 'D1', value: 'Red LED' },
          { id: '7', type: 'Resistor', label: 'R3', value: '330Ω' },
          { id: '8', type: 'Battery', label: 'V1', value: '9V' }
        ],
        schematicDescription: 'Connect 555 in astable mode with R1 and R2 forming timing network. C1 sets oscillation frequency. Output (pin 3) drives LED through current-limiting resistor R3. C2 provides power supply decoupling.'
      };

      setCircuit(sampleCircuit);
      setIsDesigning(false);
    }, 2500);
  };

  const examplePrompts = [
    'Design a simple LED circuit with 9V battery',
    'Create a motor speed controller using PWM',
    'Build a temperature sensor circuit with alarm',
    'Design a power supply with 5V regulation'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Circuit Designer</CardTitle>
          <CardDescription>
            Describe your circuit needs and get schematic suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example Prompts */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Example Circuits</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePrompts.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => setPrompt(example)}
                  className="justify-start text-left h-auto py-3"
                >
                  <div className="flex-1 text-sm">{example}</div>
                  <CircuitBoard className="h-4 w-4 text-[#00C2D1] flex-shrink-0" />
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your circuit requirements</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: I need a circuit to flash an LED at 1Hz using a 555 timer with 9V power supply"
              rows={4}
            />
          </div>

          <Button 
            onClick={designCircuit}
            disabled={isDesigning || !prompt}
            className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {isDesigning ? 'Designing Circuit...' : 'Design Circuit'}
          </Button>

          {/* Circuit Design Result */}
          {circuit && (
            <div className="space-y-4">
              <Card className="border-2 border-[#00C2D1]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircuitBoard className="h-5 w-5 text-[#00C2D1]" />
                    {circuit.title}
                  </CardTitle>
                  <CardDescription>{circuit.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Components List */}
                  <div>
                    <h4 className="font-semibold mb-3">Bill of Materials</h4>
                    <div className="space-y-2">
                      {circuit.components.map((component) => (
                        <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{component.label}</Badge>
                            <span className="font-medium">{component.type}</span>
                          </div>
                          <span className="text-sm text-gray-600">{component.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schematic Description */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Circuit Connections</h4>
                    <p className="text-sm text-gray-700">{circuit.schematicDescription}</p>
                  </div>

                  {/* Visual Representation */}
                  <div className="p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <CircuitBoard className="h-24 w-24 mx-auto text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">
                        Schematic diagram would appear here
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Export to your preferred CAD software for detailed design
                      </p>
                    </div>
                  </div>

                  {/* Design Notes */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Design Notes
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Use polarized capacitors with correct orientation</li>
                        <li>• Verify component voltage ratings for your power supply</li>
                        <li>• Add heat sink to voltage regulators if necessary</li>
                        <li>• Test on breadboard before final assembly</li>
                        <li>• Double-check all connections before powering on</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Design (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {!circuit && (
            <div className="text-center py-12 text-gray-500">
              <CircuitBoard className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Describe your circuit requirements to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
