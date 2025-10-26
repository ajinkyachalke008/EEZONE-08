'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function QuickUtilitiesPage() {
  // Fuse/Breaker Selector
  const [loadCurrent, setLoadCurrent] = useState('');
  const [protectionType, setProtectionType] = useState('breaker');
  const [applicationVoltage, setApplicationVoltage] = useState('120');
  const [protectionResult, setProtectionResult] = useState<any>(null);

  // Voltage Divider Calculator
  const [inputVoltage, setInputVoltage] = useState('');
  const [outputVoltage, setOutputVoltage] = useState('');
  const [r1Value, setR1Value] = useState('');
  const [dividerResult, setDividerResult] = useState<any>(null);

  // 555 Timer Designer
  const [frequency, setFrequency] = useState('');
  const [dutyCycle, setDutyCycle] = useState('50');
  const [timerMode, setTimerMode] = useState('astable');
  const [timerResult, setTimerResult] = useState<any>(null);

  // OpAmp Calculator
  const [opampConfig, setOpampConfig] = useState('noninverting');
  const [inputVolt, setInputVolt] = useState('');
  const [desiredGain, setDesiredGain] = useState('');
  const [opampResult, setOpampResult] = useState<any>(null);

  const calculateProtection = () => {
    const current = parseFloat(loadCurrent);
    if (isNaN(current)) {
      alert('Please enter valid current');
      return;
    }

    // NEC 240.4 - Standard sizes for fuses and breakers
    const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000];
    
    // Select next standard size above 125% of load (NEC 240.4)
    const requiredRating = current * 1.25;
    const selectedSize = standardSizes.find(size => size >= requiredRating) || standardSizes[standardSizes.length - 1];
    
    // Wire sizing based on breaker size
    let wireSize = '14 AWG';
    if (selectedSize > 15) wireSize = '12 AWG';
    if (selectedSize > 20) wireSize = '10 AWG';
    if (selectedSize > 30) wireSize = '8 AWG';
    if (selectedSize > 40) wireSize = '6 AWG';
    if (selectedSize > 55) wireSize = '4 AWG';
    if (selectedSize > 70) wireSize = '2 AWG';
    if (selectedSize > 95) wireSize = '1 AWG';
    if (selectedSize > 110) wireSize = '1/0 AWG';

    // Interrupt rating requirements
    let interruptRating = '10,000 AIC';
    const voltage = parseInt(applicationVoltage);
    if (voltage >= 480) interruptRating = '25,000 AIC';
    if (selectedSize >= 100) interruptRating = '22,000 AIC';

    setProtectionResult({
      loadCurrent: current.toFixed(2),
      requiredRating: requiredRating.toFixed(2),
      selectedSize,
      wireSize,
      interruptRating,
      necArticle: 'NEC 240.4, 240.6',
      type: protectionType === 'breaker' ? 'Circuit Breaker' : 'Time-Delay Fuse',
    });
  };

  const calculateVoltageDivider = () => {
    const vin = parseFloat(inputVoltage);
    const vout = parseFloat(outputVoltage);
    const r1 = parseFloat(r1Value);

    if (isNaN(vin) || isNaN(vout)) {
      alert('Please enter valid voltages');
      return;
    }

    if (r1 && !isNaN(r1)) {
      // Calculate R2 from given R1
      const r2 = (vout * r1) / (vin - vout);
      const current = vin / (r1 + r2);
      const power = vin * current;

      setDividerResult({
        r1: r1.toFixed(0),
        r2: r2.toFixed(0),
        current: (current * 1000).toFixed(2),
        power: power.toFixed(3),
        r1Power: (current * current * r1).toFixed(3),
        r2Power: (current * current * r2).toFixed(3),
      });
    } else {
      // Suggest standard values (use 10kΩ as R1)
      const r1Suggested = 10000;
      const r2 = (vout * r1Suggested) / (vin - vout);
      const current = vin / (r1Suggested + r2);
      const power = vin * current;

      setDividerResult({
        r1: r1Suggested.toFixed(0),
        r2: r2.toFixed(0),
        current: (current * 1000).toFixed(2),
        power: power.toFixed(3),
        r1Power: (current * current * r1Suggested).toFixed(3),
        r2Power: (current * current * r2).toFixed(3),
      });
    }
  };

  const calculate555Timer = () => {
    const freq = parseFloat(frequency);
    const duty = parseFloat(dutyCycle);

    if (isNaN(freq)) {
      alert('Please enter valid frequency');
      return;
    }

    if (timerMode === 'astable') {
      // Astable mode (oscillator)
      // Choose C = 0.1µF for audio range, 10µF for low freq
      const C = freq > 100 ? 0.0000001 : 0.00001; // in Farads
      
      // For astable: f = 1.44 / ((R1 + 2*R2) * C)
      // duty cycle = (R1 + R2) / (R1 + 2*R2)
      // Solving: R1 = (2.88 * duty - 1.44) / (f * C * 2)
      //          R2 = (1.44 - R1 * f * C) / (f * C * 2)
      
      const R2 = (1.44 / (freq * C)) * ((100 - duty) / 200);
      const R1 = (1.44 / (freq * C)) - 2 * R2;

      const tHigh = 0.693 * (R1 + R2) * C * 1000; // in ms
      const tLow = 0.693 * R2 * C * 1000; // in ms
      const period = tHigh + tLow;

      setTimerResult({
        mode: 'Astable (Oscillator)',
        r1: R1 > 1000 ? `${(R1/1000).toFixed(1)}kΩ` : `${R1.toFixed(0)}Ω`,
        r2: R2 > 1000 ? `${(R2/1000).toFixed(1)}kΩ` : `${R2.toFixed(0)}Ω`,
        c: C >= 0.000001 ? `${(C*1000000).toFixed(2)}µF` : `${(C*1000000000).toFixed(0)}nF`,
        frequency: freq.toFixed(2),
        dutyCycle: ((tHigh / period) * 100).toFixed(1),
        tHigh: tHigh.toFixed(3),
        tLow: tLow.toFixed(3),
      });
    } else {
      // Monostable mode (one-shot)
      const C = 0.00001; // 10µF
      const R = 1.1 / (freq * C);
      const pulseWidth = 1.1 * R * C * 1000; // in ms

      setTimerResult({
        mode: 'Monostable (One-Shot)',
        r1: R > 1000 ? `${(R/1000).toFixed(1)}kΩ` : `${R.toFixed(0)}Ω`,
        r2: 'N/A',
        c: `${(C*1000000).toFixed(2)}µF`,
        frequency: (1000 / pulseWidth).toFixed(2),
        dutyCycle: 'Single Pulse',
        tHigh: pulseWidth.toFixed(3),
        tLow: 'Until Triggered',
      });
    }
  };

  const calculateOpAmp = () => {
    const vin = parseFloat(inputVolt);
    const gain = parseFloat(desiredGain);

    if (isNaN(vin) || isNaN(gain)) {
      alert('Please enter valid values');
      return;
    }

    let r1, r2, vout;

    if (opampConfig === 'noninverting') {
      // Non-inverting: Vout = Vin * (1 + R2/R1)
      // Gain = 1 + R2/R1, so R2/R1 = Gain - 1
      r1 = 10000; // 10kΩ standard
      r2 = r1 * (gain - 1);
      vout = vin * gain;

      setOpampResult({
        config: 'Non-Inverting Amplifier',
        r1: `${(r1/1000).toFixed(1)}kΩ`,
        r2: `${(r2/1000).toFixed(1)}kΩ`,
        gain: gain.toFixed(2),
        inputImpedance: '> 1MΩ (Very High)',
        outputVoltage: vout.toFixed(2),
        phase: '0° (In-Phase)',
      });
    } else if (opampConfig === 'inverting') {
      // Inverting: Vout = -Vin * (R2/R1)
      // Gain = -R2/R1, so R2 = R1 * |Gain|
      r1 = 10000; // 10kΩ standard
      r2 = r1 * Math.abs(gain);
      vout = -vin * gain;

      setOpampResult({
        config: 'Inverting Amplifier',
        r1: `${(r1/1000).toFixed(1)}kΩ`,
        r2: `${(r2/1000).toFixed(1)}kΩ`,
        gain: `-${gain.toFixed(2)}`,
        inputImpedance: `${(r1/1000).toFixed(1)}kΩ`,
        outputVoltage: vout.toFixed(2),
        phase: '180° (Inverted)',
      });
    } else {
      // Summing amplifier (2 inputs)
      r1 = 10000;
      r2 = 10000;
      const rf = r1 * gain;
      vout = -gain * vin; // Assuming both inputs same

      setOpampResult({
        config: 'Summing Amplifier',
        r1: `${(r1/1000).toFixed(1)}kΩ (both inputs)`,
        r2: `${(rf/1000).toFixed(1)}kΩ (feedback)`,
        gain: `-${gain.toFixed(2)} (per input)`,
        inputImpedance: `${(r1/1000).toFixed(1)}kΩ`,
        outputVoltage: `${vout.toFixed(2)} (sum)`,
        phase: '180° (Inverted Sum)',
      });
    }
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
            <Gauge className="h-10 w-10 text-[#00C2D1]" />
            Quick-Access Utilities
          </h1>
          <p className="text-gray-600 text-lg">
            Essential everyday calculators for component selection and circuit design
          </p>
        </div>

        <Tabs defaultValue="protection" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="protection">Protection</TabsTrigger>
            <TabsTrigger value="divider">Voltage Divider</TabsTrigger>
            <TabsTrigger value="555">555 Timer</TabsTrigger>
            <TabsTrigger value="opamp">OpAmp</TabsTrigger>
          </TabsList>

          {/* Fuse/Breaker Selector */}
          <TabsContent value="protection">
            <Card>
              <CardHeader>
                <CardTitle>Fuse & Breaker Selector</CardTitle>
                <CardDescription>NEC-compliant overcurrent protection sizing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="load-current">Load Current (A)</Label>
                      <Input
                        id="load-current"
                        type="number"
                        placeholder="15"
                        value={loadCurrent}
                        onChange={(e) => setLoadCurrent(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="protection-type">Protection Type</Label>
                      <Select value={protectionType} onValueChange={setProtectionType}>
                        <SelectTrigger id="protection-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breaker">Circuit Breaker</SelectItem>
                          <SelectItem value="fuse">Time-Delay Fuse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="application-voltage">Voltage (V)</Label>
                      <Select value={applicationVoltage} onValueChange={setApplicationVoltage}>
                        <SelectTrigger id="application-voltage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="120">120V</SelectItem>
                          <SelectItem value="240">240V</SelectItem>
                          <SelectItem value="277">277V</SelectItem>
                          <SelectItem value="480">480V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateProtection} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Select Protection
                    </Button>
                  </div>

                  {protectionResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Recommendations</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Load Current:</span>
                          <span className="font-bold">{protectionResult.loadCurrent} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Required Rating:</span>
                          <span className="font-bold">{protectionResult.requiredRating} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Selected Size:</span>
                          <span className="font-bold text-[#00C2D1]">{protectionResult.selectedSize} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Type:</span>
                          <span className="font-bold">{protectionResult.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Wire Size:</span>
                          <span className="font-bold">{protectionResult.wireSize}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Interrupt Rating:</span>
                          <span className="font-bold">{protectionResult.interruptRating}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NEC Reference:</span>
                          <span className="font-bold text-sm">{protectionResult.necArticle}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voltage Divider */}
          <TabsContent value="divider">
            <Card>
              <CardHeader>
                <CardTitle>Voltage Divider Calculator</CardTitle>
                <CardDescription>Calculate resistor values for specific voltage ratios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="input-voltage">Input Voltage (V)</Label>
                      <Input
                        id="input-voltage"
                        type="number"
                        placeholder="12"
                        value={inputVoltage}
                        onChange={(e) => setInputVoltage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="output-voltage">Output Voltage (V)</Label>
                      <Input
                        id="output-voltage"
                        type="number"
                        placeholder="5"
                        value={outputVoltage}
                        onChange={(e) => setOutputVoltage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="r1-value">R1 Value (Ω) - Optional</Label>
                      <Input
                        id="r1-value"
                        type="number"
                        placeholder="10000"
                        value={r1Value}
                        onChange={(e) => setR1Value(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank for automatic calculation</p>
                    </div>

                    <Button onClick={calculateVoltageDivider} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Divider
                    </Button>
                  </div>

                  {dividerResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Resistor Values</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R1 (Top):</span>
                          <span className="font-bold text-[#00C2D1]">{dividerResult.r1} Ω</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R2 (Bottom):</span>
                          <span className="font-bold text-[#00C2D1]">{dividerResult.r2} Ω</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Current Draw:</span>
                          <span className="font-bold">{dividerResult.current} mA</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Total Power:</span>
                          <span className="font-bold">{dividerResult.power} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R1 Power:</span>
                          <span className="font-bold">{dividerResult.r1Power} W</span>
                        </div>
                        <div className="flex justify-between">
                          <span>R2 Power:</span>
                          <span className="font-bold">{dividerResult.r2Power} W</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-4 pt-4 border-t border-white/20">
                        💡 Use 1/4W resistors for ≤ 0.125W, 1/2W for ≤ 0.25W
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 555 Timer */}
          <TabsContent value="555">
            <Card>
              <CardHeader>
                <CardTitle>555 Timer Designer</CardTitle>
                <CardDescription>Calculate component values for astable/monostable configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timer-mode">Timer Mode</Label>
                      <Select value={timerMode} onValueChange={setTimerMode}>
                        <SelectTrigger id="timer-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="astable">Astable (Oscillator)</SelectItem>
                          <SelectItem value="monostable">Monostable (One-Shot)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="frequency">Frequency (Hz)</Label>
                      <Input
                        id="frequency"
                        type="number"
                        placeholder="1000"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                    </div>

                    {timerMode === 'astable' && (
                      <div>
                        <Label htmlFor="duty-cycle">Duty Cycle (%)</Label>
                        <Input
                          id="duty-cycle"
                          type="number"
                          placeholder="50"
                          value={dutyCycle}
                          onChange={(e) => setDutyCycle(e.target.value)}
                        />
                      </div>
                    )}

                    <Button onClick={calculate555Timer} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Design Timer
                    </Button>
                  </div>

                  {timerResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Component Values</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Mode:</span>
                          <span className="font-bold">{timerResult.mode}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R1:</span>
                          <span className="font-bold text-[#00C2D1]">{timerResult.r1}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R2:</span>
                          <span className="font-bold text-[#00C2D1]">{timerResult.r2}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Capacitor:</span>
                          <span className="font-bold text-[#00C2D1]">{timerResult.c}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Frequency:</span>
                          <span className="font-bold">{timerResult.frequency} Hz</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Duty Cycle:</span>
                          <span className="font-bold">{timerResult.dutyCycle}%</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Time High:</span>
                          <span className="font-bold">{timerResult.tHigh} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Low:</span>
                          <span className="font-bold">{timerResult.tLow}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OpAmp Calculator */}
          <TabsContent value="opamp">
            <Card>
              <CardHeader>
                <CardTitle>OpAmp Circuit Calculator</CardTitle>
                <CardDescription>Calculate gain, resistor values, and output voltage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="opamp-config">Configuration</Label>
                      <Select value={opampConfig} onValueChange={setOpampConfig}>
                        <SelectTrigger id="opamp-config">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="noninverting">Non-Inverting Amplifier</SelectItem>
                          <SelectItem value="inverting">Inverting Amplifier</SelectItem>
                          <SelectItem value="summing">Summing Amplifier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="input-volt">Input Voltage (V)</Label>
                      <Input
                        id="input-volt"
                        type="number"
                        placeholder="1"
                        value={inputVolt}
                        onChange={(e) => setInputVolt(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="desired-gain">Desired Gain</Label>
                      <Input
                        id="desired-gain"
                        type="number"
                        placeholder="10"
                        value={desiredGain}
                        onChange={(e) => setDesiredGain(e.target.value)}
                      />
                    </div>

                    <Button onClick={calculateOpAmp} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate OpAmp
                    </Button>
                  </div>

                  {opampResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Circuit Design</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Configuration:</span>
                          <span className="font-bold text-sm">{opampResult.config}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R1:</span>
                          <span className="font-bold text-[#00C2D1]">{opampResult.r1}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>R2 / Rf:</span>
                          <span className="font-bold text-[#00C2D1]">{opampResult.r2}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Gain:</span>
                          <span className="font-bold">{opampResult.gain}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Input Impedance:</span>
                          <span className="font-bold">{opampResult.inputImpedance}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Output Voltage:</span>
                          <span className="font-bold">{opampResult.outputVoltage} V</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phase Shift:</span>
                          <span className="font-bold">{opampResult.phase}</span>
                        </div>
                      </div>
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
