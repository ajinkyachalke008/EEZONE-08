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
import { motion } from 'framer-motion';

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
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" />
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto max-w-6xl px-4 py-12 relative z-10">
        <Link href="/">
          <Button variant="outline" className="mb-6 glass-surface border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="h-12 w-12 text-[#9C4AFF] glow-text-violet" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-violet" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Power Systems Tools
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Professional calculators for power analysis, fault calculations, and system design
          </p>
        </motion.div>

        <Tabs defaultValue="three-phase" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 glass-surface backdrop-blur-glass border border-white/10 p-2">
            <TabsTrigger value="three-phase" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]">Three-Phase Power</TabsTrigger>
            <TabsTrigger value="short-circuit" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]">Short Circuit</TabsTrigger>
            <TabsTrigger value="voltage-drop" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9C4AFF] data-[state=active]:to-[#FF6B00] data-[state=active]:text-white text-[#B8A7E0]">Voltage Drop</TabsTrigger>
          </TabsList>

          {/* Three-Phase Power Calculator */}
          <TabsContent value="three-phase">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Three-Phase Power Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate real, apparent, and reactive power for three-phase systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phase-type" className="text-white">System Type</Label>
                      <Select value={phaseType} onValueChange={setPhaseType} className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20">
                        <SelectTrigger id="phase-type" className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3phase" className="text-white hover:bg-white/20">Three-Phase</SelectItem>
                          <SelectItem value="1phase" className="text-white hover:bg-white/20">Single-Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="voltage" className="text-white">Voltage (V)</Label>
                      <Input
                        id="voltage"
                        type="number"
                        placeholder="480"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="current" className="text-white">Current (A)</Label>
                      <Input
                        id="current"
                        type="number"
                        placeholder="100"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="power-factor" className="text-white">Power Factor (0-1)</Label>
                      <Input
                        id="power-factor"
                        type="number"
                        step="0.01"
                        placeholder="0.85"
                        value={powerFactor}
                        onChange={(e) => setPowerFactor(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <Button onClick={calculateThreePhasePower} className="w-full gradient-violet text-white hover:shadow-glowViolet">
                      Calculate Power
                    </Button>
                  </div>

                  {powerResult && (
                    <div className="gradient-violet p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Results</h3>
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
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Short Circuit Analysis</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate fault current and breaker requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="system-voltage" className="text-white">System Voltage (V)</Label>
                      <Input
                        id="system-voltage"
                        type="number"
                        placeholder="480"
                        value={systemVoltage}
                        onChange={(e) => setSystemVoltage(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="transformer-kva" className="text-white">Transformer kVA</Label>
                      <Input
                        id="transformer-kva"
                        type="number"
                        placeholder="1000"
                        value={transformerKVA}
                        onChange={(e) => setTransformerKVA(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="impedance" className="text-white">Transformer Impedance (%)</Label>
                      <Input
                        id="impedance"
                        type="number"
                        step="0.1"
                        placeholder="5.75"
                        value={impedance}
                        onChange={(e) => setImpedance(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <Button onClick={calculateShortCircuit} className="w-full gradient-violet text-white hover:shadow-glowViolet">
                      Calculate Fault Current
                    </Button>
                  </div>

                  {shortCircuitResult && (
                    <div className="gradient-violet p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Results</h3>
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
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Voltage Drop Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate voltage drop and NEC compliance for wire sizing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="system-voltage-vd" className="text-white">System Voltage (V)</Label>
                      <Select value={systemVoltageVD} onValueChange={setSystemVoltageVD} className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20">
                        <SelectTrigger id="system-voltage-vd" className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="120" className="text-white hover:bg-white/20">120V</SelectItem>
                          <SelectItem value="208" className="text-white hover:bg-white/20">208V</SelectItem>
                          <SelectItem value="240" className="text-white hover:bg-white/20">240V</SelectItem>
                          <SelectItem value="277" className="text-white hover:bg-white/20">277V</SelectItem>
                          <SelectItem value="480" className="text-white hover:bg-white/20">480V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="wire-length" className="text-white">Wire Length (feet, one-way)</Label>
                      <Input
                        id="wire-length"
                        type="number"
                        placeholder="150"
                        value={wireLength}
                        onChange={(e) => setWireLength(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="load-current" className="text-white">Load Current (A)</Label>
                      <Input
                        id="load-current"
                        type="number"
                        placeholder="20"
                        value={loadCurrent}
                        onChange={(e) => setLoadCurrent(e.target.value)}
                        className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="wire-gauge" className="text-white">Wire Gauge (AWG)</Label>
                      <Select value={wireGauge} onValueChange={setWireGauge} className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20">
                        <SelectTrigger id="wire-gauge" className="glass-surface text-white bg-white/10 backdrop-blur-glass border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14" className="text-white hover:bg-white/20">14 AWG</SelectItem>
                          <SelectItem value="12" className="text-white hover:bg-white/20">12 AWG</SelectItem>
                          <SelectItem value="10" className="text-white hover:bg-white/20">10 AWG</SelectItem>
                          <SelectItem value="8" className="text-white hover:bg-white/20">8 AWG</SelectItem>
                          <SelectItem value="6" className="text-white hover:bg-white/20">6 AWG</SelectItem>
                          <SelectItem value="4" className="text-white hover:bg-white/20">4 AWG</SelectItem>
                          <SelectItem value="2" className="text-white hover:bg-white/20">2 AWG</SelectItem>
                          <SelectItem value="1" className="text-white hover:bg-white/20">1 AWG</SelectItem>
                          <SelectItem value="0" className="text-white hover:bg-white/20">1/0 AWG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateVoltageDrop} className="w-full gradient-violet text-white hover:shadow-glowViolet">
                      Calculate Voltage Drop
                    </Button>
                  </div>

                  {voltageDropResult && (
                    <div className="gradient-violet p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Results</h3>
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