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
import { motion } from 'framer-motion';

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
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2B0B4B] to-[#0A0014]" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#FF6B00] opacity-20 blur-[120px] rounded-full" />
      
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
              <Gauge className="h-12 w-12 text-[#FF6B00] glow-text-orange" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🔥 Quick-Access Utilities
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Essential everyday calculators for component selection and circuit design
          </p>
        </motion.div>

        <Tabs defaultValue="protection" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 glass-surface backdrop-blur-glass border border-white/10 p-2">
            <TabsTrigger value="protection" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">Protection</TabsTrigger>
            <TabsTrigger value="divider" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">Voltage Divider</TabsTrigger>
            <TabsTrigger value="555" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">555 Timer</TabsTrigger>
            <TabsTrigger value="opamp" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">OpAmp</TabsTrigger>
          </TabsList>

          {/* Fuse/Breaker Selector */}
          <TabsContent value="protection">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Fuse & Breaker Selector</CardTitle>
                <CardDescription className="text-[#B8A7E0]">NEC-compliant overcurrent protection sizing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="load-current" className="text-white">Load Current (A)</Label>
                      <Input
                        id="load-current"
                        type="number"
                        placeholder="15"
                        value={loadCurrent}
                        onChange={(e) => setLoadCurrent(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="protection-type" className="text-white">Protection Type</Label>
                      <Select value={protectionType} onValueChange={setProtectionType}>
                        <SelectTrigger id="protection-type" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breaker">Circuit Breaker</SelectItem>
                          <SelectItem value="fuse">Time-Delay Fuse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="application-voltage" className="text-white">Voltage (V)</Label>
                      <Select value={applicationVoltage} onValueChange={setApplicationVoltage}>
                        <SelectTrigger id="application-voltage" className="glass-surface border-white/20 text-white">
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

                    <Button onClick={calculateProtection} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Select Protection
                    </Button>
                  </div>

                  {protectionResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Recommendations</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Load Current:</span>
                          <span className="font-bold text-white">{protectionResult.loadCurrent} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Required Rating:</span>
                          <span className="font-bold text-white">{protectionResult.requiredRating} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Selected Size:</span>
                          <span className="font-bold text-white">{protectionResult.selectedSize} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Type:</span>
                          <span className="font-bold text-white">{protectionResult.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Wire Size:</span>
                          <span className="font-bold text-white">{protectionResult.wireSize}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Interrupt Rating:</span>
                          <span className="font-bold text-white">{protectionResult.interruptRating}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">NEC Reference:</span>
                          <span className="font-bold text-sm text-white">{protectionResult.necArticle}</span>
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
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Voltage Divider Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate resistor values for specific voltage ratios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="input-voltage" className="text-white">Input Voltage (V)</Label>
                      <Input
                        id="input-voltage"
                        type="number"
                        placeholder="12"
                        value={inputVoltage}
                        onChange={(e) => setInputVoltage(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="output-voltage" className="text-white">Output Voltage (V)</Label>
                      <Input
                        id="output-voltage"
                        type="number"
                        placeholder="5"
                        value={outputVoltage}
                        onChange={(e) => setOutputVoltage(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="r1-value" className="text-white">R1 Value (Ω) - Optional</Label>
                      <Input
                        id="r1-value"
                        type="number"
                        placeholder="10000"
                        value={r1Value}
                        onChange={(e) => setR1Value(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                      <p className="text-xs text-[#B8A7E0] mt-1">Leave blank for automatic calculation</p>
                    </div>

                    <Button onClick={calculateVoltageDivider} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Calculate Divider
                    </Button>
                  </div>

                  {dividerResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Resistor Values</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R1 (Top):</span>
                          <span className="font-bold text-white">{dividerResult.r1} Ω</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R2 (Bottom):</span>
                          <span className="font-bold text-white">{dividerResult.r2} Ω</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Current Draw:</span>
                          <span className="font-bold text-white">{dividerResult.current} mA</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Total Power:</span>
                          <span className="font-bold text-white">{dividerResult.power} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R1 Power:</span>
                          <span className="font-bold text-white">{dividerResult.r1Power} W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">R2 Power:</span>
                          <span className="font-bold text-white">{dividerResult.r2Power} W</span>
                        </div>
                      </div>
                      <p className="text-sm text-white/80 mt-4 pt-4 border-t border-white/20">
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
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">555 Timer Designer</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate component values for astable/monostable configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timer-mode" className="text-white">Timer Mode</Label>
                      <Select value={timerMode} onValueChange={setTimerMode}>
                        <SelectTrigger id="timer-mode" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="astable">Astable (Oscillator)</SelectItem>
                          <SelectItem value="monostable">Monostable (One-Shot)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="frequency" className="text-white">
                        {timerMode === 'astable' ? 'Frequency (Hz)' : 'Pulse Frequency (Hz)'}
                      </Label>
                      <Input
                        id="frequency"
                        type="number"
                        placeholder="1000"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                      <p className="text-xs text-[#B8A7E0] mt-1">
                        {timerMode === 'astable' ? 'Output oscillation frequency' : 'Rate of trigger pulses'}
                      </p>
                    </div>

                    {timerMode === 'astable' && (
                      <div>
                        <Label htmlFor="duty-cycle" className="text-white">Duty Cycle (%)</Label>
                        <Input
                          id="duty-cycle"
                          type="number"
                          placeholder="50"
                          value={dutyCycle}
                          onChange={(e) => setDutyCycle(e.target.value)}
                          className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                        />
                        <p className="text-xs text-[#B8A7E0] mt-1">
                          Percentage of time output is HIGH (50-99%)
                        </p>
                      </div>
                    )}

                    <Button onClick={calculate555Timer} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Calculate Components
                    </Button>

                    <div className="glass-surface border border-[#00E5FF]/30 rounded-lg p-4 mt-4">
                      <p className="text-sm text-[#00E5FF] mb-2 font-semibold">💡 Quick Guide:</p>
                      <ul className="text-xs text-[#B8A7E0] space-y-1">
                        <li>• <span className="text-white">Astable:</span> Continuous square wave output</li>
                        <li>• <span className="text-white">Monostable:</span> Single pulse on trigger</li>
                        <li>• Use standard resistor values (1%, 5%)</li>
                        <li>• Add 0.01µF bypass cap on pin 5</li>
                      </ul>
                    </div>
                  </div>

                  {timerResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Component Values</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Mode:</span>
                          <span className="font-bold text-white">{timerResult.mode}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R1 (Timing):</span>
                          <span className="font-bold text-white">{timerResult.r1}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R2 (Timing):</span>
                          <span className="font-bold text-white">{timerResult.r2}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">C (Timing):</span>
                          <span className="font-bold text-white">{timerResult.c}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Frequency:</span>
                          <span className="font-bold text-white">{timerResult.frequency} Hz</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Duty Cycle:</span>
                          <span className="font-bold text-white">{timerResult.dutyCycle}%</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Time HIGH:</span>
                          <span className="font-bold text-white">{timerResult.tHigh} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Time LOW:</span>
                          <span className="font-bold text-white">{timerResult.tLow}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm text-white/80 mb-2">📌 Pin Connections:</p>
                        <ul className="text-xs text-white/70 space-y-1">
                          <li>• Pin 1: GND | Pin 8: Vcc (+5-15V)</li>
                          <li>• Pin 2: Trigger | Pin 3: Output</li>
                          <li>• Pin 4: Reset (to Vcc) | Pin 5: Control (0.01µF to GND)</li>
                          <li>• Pin 6: Threshold | Pin 7: Discharge</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OpAmp Calculator */}
          <TabsContent value="opamp">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">OpAmp Circuit Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate gain, resistor values, and output voltage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="opamp-config" className="text-white">Configuration</Label>
                      <Select value={opampConfig} onValueChange={setOpampConfig}>
                        <SelectTrigger id="opamp-config" className="glass-surface border-white/20 text-white">
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
                      <Label htmlFor="input-volt" className="text-white">Input Voltage (V)</Label>
                      <Input
                        id="input-volt"
                        type="number"
                        placeholder="1.0"
                        value={inputVolt}
                        onChange={(e) => setInputVolt(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                      <p className="text-xs text-[#B8A7E0] mt-1">
                        Input signal voltage
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="desired-gain" className="text-white">Desired Gain</Label>
                      <Input
                        id="desired-gain"
                        type="number"
                        placeholder="10"
                        value={desiredGain}
                        onChange={(e) => setDesiredGain(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                      <p className="text-xs text-[#B8A7E0] mt-1">
                        {opampConfig === 'noninverting' 
                          ? 'Gain must be ≥ 1 (1 = unity gain/buffer)'
                          : 'Absolute gain value (magnitude)'}
                      </p>
                    </div>

                    <Button onClick={calculateOpAmp} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Calculate Circuit
                    </Button>

                    <div className="glass-surface border border-[#9C4AFF]/30 rounded-lg p-4 mt-4">
                      <p className="text-sm text-[#9C4AFF] mb-2 font-semibold">💡 Configuration Notes:</p>
                      <ul className="text-xs text-[#B8A7E0] space-y-1">
                        <li>• <span className="text-white">Non-Inverting:</span> High input impedance, no phase shift</li>
                        <li>• <span className="text-white">Inverting:</span> 180° phase shift, gain can be &lt;1</li>
                        <li>• <span className="text-white">Summing:</span> Adds multiple inputs (inverted)</li>
                        <li>• Use 1% metal film resistors for precision</li>
                      </ul>
                    </div>
                  </div>

                  {opampResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Circuit Design</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Configuration:</span>
                          <span className="font-bold text-sm text-white">{opampResult.config}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R1 (Input):</span>
                          <span className="font-bold text-white">{opampResult.r1}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">R2 (Feedback):</span>
                          <span className="font-bold text-white">{opampResult.r2}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Calculated Gain:</span>
                          <span className="font-bold text-white">{opampResult.gain}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Input Impedance:</span>
                          <span className="font-bold text-white">{opampResult.inputImpedance}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Output Voltage:</span>
                          <span className="font-bold text-white">{opampResult.outputVoltage} V</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Phase Shift:</span>
                          <span className="font-bold text-white">{opampResult.phase}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm text-white/80 mb-2">📌 Design Tips:</p>
                        <ul className="text-xs text-white/70 space-y-1">
                          <li>• Use ±15V or ±12V dual supply for audio</li>
                          <li>• Add 0.1µF bypass caps on power pins</li>
                          <li>• Keep resistors in 1kΩ-100kΩ range</li>
                          <li>• Check op-amp GBW for high-freq signals</li>
                          <li>• TL072/TL082 good for audio, LM358 for general use</li>
                        </ul>
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