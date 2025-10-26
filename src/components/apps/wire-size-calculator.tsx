'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const WireSizeCalculator = () => {
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [voltage, setVoltage] = useState('120');
  const [voltageDrop, setVoltageDrop] = useState('3');
  const [wireType, setWireType] = useState('copper');
  const [result, setResult] = useState<any>(null);

  const wireGauges = [
    { awg: '14', copperAmpacity: 15, aluminumAmpacity: 0, diameter: 1.628 },
    { awg: '12', copperAmpacity: 20, aluminumAmpacity: 15, diameter: 2.053 },
    { awg: '10', copperAmpacity: 30, aluminumAmpacity: 25, diameter: 2.588 },
    { awg: '8', copperAmpacity: 50, aluminumAmpacity: 40, diameter: 3.264 },
    { awg: '6', copperAmpacity: 65, aluminumAmpacity: 50, diameter: 4.115 },
    { awg: '4', copperAmpacity: 85, aluminumAmpacity: 65, diameter: 5.189 },
    { awg: '2', copperAmpacity: 115, aluminumAmpacity: 90, diameter: 6.544 },
    { awg: '1', copperAmpacity: 130, aluminumAmpacity: 100, diameter: 7.348 },
    { awg: '1/0', copperAmpacity: 150, aluminumAmpacity: 120, diameter: 8.251 },
    { awg: '2/0', copperAmpacity: 175, aluminumAmpacity: 135, diameter: 9.266 },
    { awg: '3/0', copperAmpacity: 200, aluminumAmpacity: 155, diameter: 10.404 },
    { awg: '4/0', copperAmpacity: 230, aluminumAmpacity: 180, diameter: 11.684 },
  ];

  const calculateWireSize = () => {
    const I = parseFloat(current);
    const L = parseFloat(distance);
    const V = parseFloat(voltage);
    const dropPercent = parseFloat(voltageDrop);

    if (!I || !L || !V || !dropPercent) {
      return;
    }

    // Calculate maximum voltage drop
    const maxDrop = (V * dropPercent) / 100;

    // Calculate required wire resistance (Ohms)
    // R = V_drop / I
    const maxResistance = maxDrop / I;

    // Calculate circular mils needed
    // For single phase: CM = (2 × ρ × L × I) / V_drop
    // ρ (resistivity): Copper = 10.4, Aluminum = 17.0 (ohm-cmil/ft)
    const resistivity = wireType === 'copper' ? 10.4 : 17.0;
    const cmRequired = (2 * resistivity * L * I) / maxDrop;

    // Find suitable wire based on ampacity and voltage drop
    let selectedWire = null;
    for (const wire of wireGauges) {
      const ampacity = wireType === 'copper' ? wire.copperAmpacity : wire.aluminumAmpacity;
      
      // Calculate CM for this wire gauge (approximate)
      const wireCM = Math.pow(wire.diameter / 0.001, 2);
      
      if (ampacity >= I * 1.25 && wireCM >= cmRequired) {
        selectedWire = wire;
        break;
      }
    }

    if (!selectedWire) {
      selectedWire = wireGauges[wireGauges.length - 1];
    }

    // Calculate actual voltage drop with selected wire
    const wireCM = Math.pow(selectedWire.diameter / 0.001, 2);
    const actualDrop = (2 * resistivity * L * I) / wireCM;
    const actualDropPercent = (actualDrop / V) * 100;

    setResult({
      wireSize: selectedWire.awg,
      ampacity: wireType === 'copper' ? selectedWire.copperAmpacity : selectedWire.aluminumAmpacity,
      actualDrop: actualDrop.toFixed(2),
      actualDropPercent: actualDropPercent.toFixed(2),
      maxDrop: maxDrop.toFixed(2),
      isCompliant: actualDropPercent <= dropPercent,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">Wire Size Calculator</h2>
        <p className="text-gray-600">
          Calculate the proper wire gauge based on ampacity and voltage drop requirements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>Enter the circuit details below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current">Load Current (Amps)</Label>
              <Input
                id="current"
                type="number"
                placeholder="e.g., 20"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">One-Way Distance (Feet)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="e.g., 100"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voltage">System Voltage (V)</Label>
              <Select value={voltage} onValueChange={setVoltage}>
                <SelectTrigger id="voltage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="120">120V</SelectItem>
                  <SelectItem value="208">208V</SelectItem>
                  <SelectItem value="240">240V</SelectItem>
                  <SelectItem value="277">277V</SelectItem>
                  <SelectItem value="480">480V</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voltageDrop">Max Voltage Drop (%)</Label>
              <Select value={voltageDrop} onValueChange={setVoltageDrop}>
                <SelectTrigger id="voltageDrop">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2% (Branch Circuits)</SelectItem>
                  <SelectItem value="3">3% (Feeders)</SelectItem>
                  <SelectItem value="5">5% (Total System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wireType">Wire Material</Label>
              <Select value={wireType} onValueChange={setWireType}>
                <SelectTrigger id="wireType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copper">Copper</SelectItem>
                  <SelectItem value="aluminum">Aluminum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculateWireSize} className="w-full bg-[#071428] hover:bg-[#071428]/90">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Wire Size
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Alert className={result.isCompliant ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
          <AlertTitle className="text-lg font-semibold">
            Recommended Wire Size: {result.wireSize} AWG {wireType === 'copper' ? 'Copper' : 'Aluminum'}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Wire Ampacity:</p>
                <p className="text-xl">{result.ampacity} A</p>
              </div>
              <div>
                <p className="font-medium">Actual Voltage Drop:</p>
                <p className="text-xl">{result.actualDrop}V ({result.actualDropPercent}%)</p>
              </div>
              <div>
                <p className="font-medium">Maximum Allowed Drop:</p>
                <p className="text-xl">{result.maxDrop}V ({voltageDrop}%)</p>
              </div>
              <div>
                <p className="font-medium">NEC Compliance:</p>
                <p className="text-xl">{result.isCompliant ? '✓ Compliant' : '⚠ Check Required'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> This calculation assumes continuous load at 75°C. Always verify with NEC tables and consider ambient temperature, conduit fill, and other derating factors.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
