'use client';

import { useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const FaultCurrentCalculator = () => {
  const [voltage, setVoltage] = useState('480');
  const [transformerKVA, setTransformerKVA] = useState('');
  const [transformerZ, setTransformerZ] = useState('5.75');
  const [cableLength, setCableLength] = useState('');
  const [cableSize, setCableSize] = useState('500');
  const [systemType, setSystemType] = useState('3phase');
  const [result, setResult] = useState<any>(null);

  const cableSizes = [
    { awg: '14', resistance: 3.07 },
    { awg: '12', resistance: 1.93 },
    { awg: '10', resistance: 1.21 },
    { awg: '8', resistance: 0.764 },
    { awg: '6', resistance: 0.491 },
    { awg: '4', resistance: 0.308 },
    { awg: '2', resistance: 0.194 },
    { awg: '1', resistance: 0.154 },
    { awg: '1/0', resistance: 0.122 },
    { awg: '2/0', resistance: 0.0967 },
    { awg: '3/0', resistance: 0.0766 },
    { awg: '4/0', resistance: 0.0608 },
    { awg: '250', resistance: 0.0515 },
    { awg: '300', resistance: 0.0429 },
    { awg: '350', resistance: 0.0367 },
    { awg: '400', resistance: 0.0321 },
    { awg: '500', resistance: 0.0258 },
    { awg: '600', resistance: 0.0214 },
    { awg: '750', resistance: 0.0171 },
    { awg: '1000', resistance: 0.0129 },
  ];

  const calculateFaultCurrent = () => {
    const V = parseFloat(voltage);
    const kVA = parseFloat(transformerKVA);
    const Z_percent = parseFloat(transformerZ);
    const L = parseFloat(cableLength);
    const cableInfo = cableSizes.find(c => c.awg === cableSize);

    if (!V || !kVA || !Z_percent || !L || !cableInfo) {
      return;
    }

    // Calculate transformer impedance in ohms
    const kV = V / 1000;
    const baseZ = (kV * kV) / (kVA / 1000);
    const transformerZohms = baseZ * (Z_percent / 100);

    // Calculate cable impedance (resistance)
    // For 3-phase, use line-to-line; for single-phase, use line-to-neutral (2x length)
    const cableR = systemType === '3phase' 
      ? cableInfo.resistance * L / 1000  // per 1000 ft
      : 2 * cableInfo.resistance * L / 1000;

    // Total impedance (simplified - resistance only)
    const totalZ = Math.sqrt(Math.pow(transformerZohms, 2) + Math.pow(cableR, 2));

    // Calculate fault current
    let faultCurrent;
    if (systemType === '3phase') {
      // I_fault = V_L-L / (√3 × Z_total)
      faultCurrent = V / (Math.sqrt(3) * totalZ);
    } else {
      // I_fault = V_L-N / Z_total
      faultCurrent = (V / Math.sqrt(3)) / totalZ;
    }

    // Calculate available fault power (MVA)
    const faultMVA = (Math.sqrt(3) * V * faultCurrent) / 1000000;

    // Determine minimum interrupting rating
    const standardRatings = [10, 14, 18, 22, 25, 30, 35, 42, 50, 65, 100, 200];
    const minRating = standardRatings.find(rating => rating >= faultCurrent / 1000) || 200;

    setResult({
      transformerZ: transformerZohms.toFixed(4),
      cableZ: cableR.toFixed(4),
      totalZ: totalZ.toFixed(4),
      faultCurrent: faultCurrent.toFixed(0),
      faultCurrentKA: (faultCurrent / 1000).toFixed(2),
      faultMVA: faultMVA.toFixed(2),
      minAICR: minRating,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">Fault Current Calculator</h2>
        <p className="text-gray-600">
          Calculate short circuit and fault currents for proper protection device selection
        </p>
      </div>

      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertTitle>Safety Warning</AlertTitle>
        <AlertDescription>
          Fault current calculations are critical for safety. This is a simplified calculator. For actual installations, consult with a licensed professional engineer and use certified calculation software.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>System Parameters</CardTitle>
          <CardDescription>Enter the system configuration details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systemType">System Type</Label>
              <Select value={systemType} onValueChange={setSystemType}>
                <SelectTrigger id="systemType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3phase">3-Phase System</SelectItem>
                  <SelectItem value="1phase">Single Phase System</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="600">600V</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transformerKVA">Transformer Rating (kVA)</Label>
              <Input
                id="transformerKVA"
                type="number"
                placeholder="e.g., 1000"
                value={transformerKVA}
                onChange={(e) => setTransformerKVA(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transformerZ">Transformer Impedance (%Z)</Label>
              <Input
                id="transformerZ"
                type="number"
                step="0.01"
                placeholder="e.g., 5.75"
                value={transformerZ}
                onChange={(e) => setTransformerZ(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cableSize">Cable/Conductor Size</Label>
              <Select value={cableSize} onValueChange={setCableSize}>
                <SelectTrigger id="cableSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cableSizes.map(cable => (
                    <SelectItem key={cable.awg} value={cable.awg}>
                      {cable.awg} {cable.awg.includes('/') || parseInt(cable.awg) <= 4 ? 'AWG' : 'kcmil'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cableLength">Cable Length (Feet)</Label>
              <Input
                id="cableLength"
                type="number"
                placeholder="e.g., 100"
                value={cableLength}
                onChange={(e) => setCableLength(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={calculateFaultCurrent} className="w-full bg-[#071428] hover:bg-[#071428]/90">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Fault Current
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTitle className="text-lg font-semibold text-red-900">
            Fault Current Analysis Results
          </AlertTitle>
          <AlertDescription className="mt-3 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Transformer Impedance</p>
                <p className="text-xl font-bold text-[#071428]">{result.transformerZ} Ω</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Cable Impedance</p>
                <p className="text-xl font-bold text-[#071428]">{result.cableZ} Ω</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Total System Impedance</p>
                <p className="text-xl font-bold text-[#071428]">{result.totalZ} Ω</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Available Fault MVA</p>
                <p className="text-xl font-bold text-[#071428]">{result.faultMVA} MVA</p>
              </div>
            </div>

            <div className="bg-red-100 border-2 border-red-600 p-4 rounded-lg">
              <p className="font-medium text-red-900 mb-2">Maximum Fault Current</p>
              <p className="text-4xl font-bold text-red-900">{result.faultCurrent} A</p>
              <p className="text-2xl font-semibold text-red-900">({result.faultCurrentKA} kA)</p>
            </div>

            <div className="bg-[#00C2D1]/10 border border-[#00C2D1] p-4 rounded-lg">
              <p className="font-medium text-[#071428] mb-1">Minimum AIC Rating Required</p>
              <p className="text-3xl font-bold text-[#071428]">{result.minAICR} kA</p>
              <p className="text-sm text-gray-600 mt-2">
                All protective devices must have an interrupting capacity (AIC) rating equal to or greater than this value.
              </p>
            </div>

            <p className="text-sm text-gray-600">
              <strong>Important:</strong> This calculation uses simplified assumptions. Actual fault currents may be higher or lower depending on utility source impedance, motor contributions, and other factors. Always verify with detailed engineering analysis per IEEE 141 (Red Book) or IEEE 242 (Buff Book).
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
