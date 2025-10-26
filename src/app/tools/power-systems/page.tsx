'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PowerSystemsPage() {
  // Three-Phase Power Calculator
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [powerFactor, setPowerFactor] = useState('');
  const [phaseType, setPhaseType] = useState('3phase');
  const [powerResult, setPowerResult] = useState<any>(null);

  // Short Circuit Calculator
  const [systemVoltage, setSystemVoltage] = useState('');
  const [transformerKVA, setTransformerKVA] = useState('');
  const [impedance, setImpedance] = useState('');
  const [shortCircuitResult, setShortCircuitResult] = useState<any>(null);

  // Voltage Drop Calculator
  const [wireLength, setWireLength] = useState('');
  const [loadCurrent, setLoadCurrent] = useState('');
  const [wireGauge, setWireGauge] = useState('12');
  const [systemVoltageVD, setSystemVoltageVD] = useState('120');
  const [voltageDropResult, setVoltageDropResult] = useState<any>(null);

  const calculateThreePhasePower = () => {
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const PF = parseFloat(powerFactor);

    if (isNaN(V) || isNaN(I) || isNaN(PF)) {
      alert('Please enter valid numbers');
      return;
    }

    let realPower, apparentPower, reactivePower;

    if (phaseType === '3phase') {
      apparentPower = Math.sqrt(3) * V * I;
      realPower = apparentPower * PF;
      reactivePower = apparentPower * Math.sin(Math.acos(PF));
    } else {
      apparentPower = V * I;
      realPower = apparentPower * PF;
      reactivePower = apparentPower * Math.sin(Math.acos(PF));
    }

    setPowerResult({
      realPower: realPower.toFixed(2),
      apparentPower: apparentPower.toFixed(2),
      reactivePower: reactivePower.toFixed(2),
      powerFactor: PF.toFixed(3),
    });
  };

  const calculateShortCircuit = () => {
    const V = parseFloat(systemVoltage);
    const kVA = parseFloat(transformerKVA);
    const Z = parseFloat(impedance) / 100;

    if (isNaN(V) || isNaN(kVA) || isNaN(Z)) {
      alert('Please enter valid numbers');
      return;
    }

    const fullLoadCurrent = (kVA * 1000) / (Math.sqrt(3) * V);
    const faultCurrent = fullLoadCurrent / Z;
    const faultMVA = (Math.sqrt(3) * V * faultCurrent) / 1000000;

    setShortCircuitResult({
      faultCurrent: faultCurrent.toFixed(0),
      faultMVA: faultMVA.toFixed(2),
      fullLoadCurrent: fullLoadCurrent.toFixed(2),
      recommendedBreakerAIC: (faultCurrent * 1.25).toFixed(0),
    });
  };

  const calculateVoltageDrop = () => {
    const length = parseFloat(wireLength);
    const I = parseFloat(loadCurrent);
    const V = parseFloat(systemVoltageVD);
    const gauge = parseInt(wireGauge);

    if (isNaN(length) || isNaN(I) || isNaN(V)) {
      alert('Please enter valid numbers');
      return;
    }

    // Resistance per 1000ft for copper wire (ohms/1000ft)
    const resistanceTable: { [key: number]: number } = {
      14: 3.07, 12: 1.93, 10: 1.21, 8: 0.764, 6: 0.491, 4: 0.308,
      2: 0.194, 1: 0.154, 0: 0.122, '00': 0.0967, '000': 0.0766,
    };

    const resistance = (resistanceTable[gauge] || 1.93) * (length / 1000);
    const voltageDrop = 2 * I * resistance; // 2 for round trip
    const voltageDropPercent = (voltageDrop / V) * 100;

    setVoltageDropResult({
      voltageDrop: voltageDrop.toFixed(2),
      voltageDropPercent: voltageDropPercent.toFixed(2),
      finalVoltage: (V - voltageDrop).toFixed(2),
      compliance: voltageDropPercent <= 3 ? 'NEC Compliant (≤3%)' : 'Exceeds NEC Limit (>3%)',
      recommendation: voltageDropPercent > 3 ? `Use larger wire (≥${gauge - 2} AWG)` : 'Wire size is adequate',
    });
  };

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
            <Zap className="h-10 w-10 text-[#00C2D1]" />
            Power Systems Tools
          </h1>
          <p className="text-gray-600 text-lg">
            Professional calculators for power analysis, fault calculations, and system design
          </p>
        </div>

        <Tabs defaultValue="three-phase" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="three-phase">Three-Phase Power</TabsTrigger>
            <TabsTrigger value="short-circuit">Short Circuit</TabsTrigger>
            <TabsTrigger value="voltage-drop">Voltage Drop</TabsTrigger>
          </TabsList>

          {/* Three-Phase Power Calculator */}
          <TabsContent value="three-phase">
            <Card>
              <CardHeader>
                <CardTitle>Three-Phase Power Calculator</CardTitle>
                <CardDescription>Calculate real, apparent, and reactive power for three-phase systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phase-type">System Type</Label>
                      <Select value={phaseType} onValueChange={setPhaseType}>
                        <SelectTrigger id="phase-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3phase">Three-Phase</SelectItem>
                          <SelectItem value="1phase">Single-Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="voltage">Voltage (V)</Label>
                      <Input
                        id="voltage"
                        type="number"
                        placeholder="480"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="current">Current (A)</Label>
                      <Input
                        id="current"
                        type="number"
                        placeholder="100"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="power-factor">Power Factor (0-1)</Label>
                      <Input
                        id="power-factor"
                        type="number"
                        step="0.01"
                        placeholder="0.85"
                        value={powerFactor}
                        onChange={(e) => setPowerFactor(e.target.value)}
                      />
                    </div>

                    <Button onClick={calculateThreePhasePower} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Power
                    </Button>
                  </div>

                  {powerResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Real Power (P):</span>
                          <span className="font-bold">{powerResult.realPower} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Apparent Power (S):</span>
                          <span className="font-bold">{powerResult.apparentPower} VA</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Reactive Power (Q):</span>
                          <span className="font-bold">{powerResult.reactivePower} VAR</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Power Factor:</span>
                          <span className="font-bold">{powerResult.powerFactor}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Short Circuit Calculator */}
          <TabsContent value="short-circuit">
            <Card>
              <CardHeader>
                <CardTitle>Short Circuit Analysis</CardTitle>
                <CardDescription>Calculate fault current and breaker requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="system-voltage">System Voltage (V)</Label>
                      <Input
                        id="system-voltage"
                        type="number"
                        placeholder="480"
                        value={systemVoltage}
                        onChange={(e) => setSystemVoltage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="transformer-kva">Transformer kVA</Label>
                      <Input
                        id="transformer-kva"
                        type="number"
                        placeholder="1000"
                        value={transformerKVA}
                        onChange={(e) => setTransformerKVA(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="impedance">Transformer Impedance (%)</Label>
                      <Input
                        id="impedance"
                        type="number"
                        step="0.1"
                        placeholder="5.75"
                        value={impedance}
                        onChange={(e) => setImpedance(e.target.value)}
                      />
                    </div>

                    <Button onClick={calculateShortCircuit} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Fault Current
                    </Button>
                  </div>

                  {shortCircuitResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Fault Current:</span>
                          <span className="font-bold">{shortCircuitResult.faultCurrent} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Fault MVA:</span>
                          <span className="font-bold">{shortCircuitResult.faultMVA} MVA</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Full Load Current:</span>
                          <span className="font-bold">{shortCircuitResult.fullLoadCurrent} A</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min. Breaker AIC:</span>
                          <span className="font-bold text-[#00C2D1]">{shortCircuitResult.recommendedBreakerAIC} A</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-4 pt-4 border-t border-white/20">
                        ⚠️ Breaker AIC rating includes 25% safety margin per NEC requirements
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voltage Drop Calculator */}
          <TabsContent value="voltage-drop">
            <Card>
              <CardHeader>
                <CardTitle>Voltage Drop Calculator</CardTitle>
                <CardDescription>Calculate voltage drop and NEC compliance for wire sizing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="system-voltage-vd">System Voltage (V)</Label>
                      <Select value={systemVoltageVD} onValueChange={setSystemVoltageVD}>
                        <SelectTrigger id="system-voltage-vd">
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

                    <div>
                      <Label htmlFor="wire-length">Wire Length (feet, one-way)</Label>
                      <Input
                        id="wire-length"
                        type="number"
                        placeholder="150"
                        value={wireLength}
                        onChange={(e) => setWireLength(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="load-current">Load Current (A)</Label>
                      <Input
                        id="load-current"
                        type="number"
                        placeholder="20"
                        value={loadCurrent}
                        onChange={(e) => setLoadCurrent(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="wire-gauge">Wire Gauge (AWG)</Label>
                      <Select value={wireGauge} onValueChange={setWireGauge}>
                        <SelectTrigger id="wire-gauge">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14">14 AWG</SelectItem>
                          <SelectItem value="12">12 AWG</SelectItem>
                          <SelectItem value="10">10 AWG</SelectItem>
                          <SelectItem value="8">8 AWG</SelectItem>
                          <SelectItem value="6">6 AWG</SelectItem>
                          <SelectItem value="4">4 AWG</SelectItem>
                          <SelectItem value="2">2 AWG</SelectItem>
                          <SelectItem value="1">1 AWG</SelectItem>
                          <SelectItem value="0">1/0 AWG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateVoltageDrop} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Voltage Drop
                    </Button>
                  </div>

                  {voltageDropResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Voltage Drop:</span>
                          <span className="font-bold">{voltageDropResult.voltageDrop} V</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Voltage Drop %:</span>
                          <span className="font-bold">{voltageDropResult.voltageDropPercent}%</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Final Voltage:</span>
                          <span className="font-bold">{voltageDropResult.finalVoltage} V</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NEC Compliance:</span>
                          <span className={`font-bold ${voltageDropResult.voltageDropPercent <= 3 ? 'text-green-400' : 'text-red-400'}`}>
                            {voltageDropResult.compliance}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-4 pt-4 border-t border-white/20">
                        💡 {voltageDropResult.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
