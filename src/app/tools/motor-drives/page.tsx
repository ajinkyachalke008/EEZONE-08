'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MotorDrivesPage() {
  // Motor Starter Sizing
  const [motorHP, setMotorHP] = useState('');
  const [motorVoltage, setMotorVoltage] = useState('480');
  const [motorPhase, setMotorPhase] = useState('3');
  const [starterResult, setStarterResult] = useState<any>(null);

  // VFD Calculator
  const [vfdHP, setVfdHP] = useState('');
  const [vfdVoltage, setVfdVoltage] = useState('480');
  const [cableLength, setCableLength] = useState('');
  const [vfdResult, setVfdResult] = useState<any>(null);

  // Motor Selection Tool
  const [loadTorque, setLoadTorque] = useState('');
  const [loadSpeed, setLoadSpeed] = useState('');
  const [dutyCycle, setDutyCycle] = useState('continuous');
  const [motorSelectResult, setMotorSelectResult] = useState<any>(null);

  const calculateMotorStarter = () => {
    const hp = parseFloat(motorHP);
    const voltage = parseInt(motorVoltage);
    const phase = parseInt(motorPhase);

    if (isNaN(hp)) {
      alert('Please enter valid horsepower');
      return;
    }

    // Calculate Full Load Amperage (FLA)
    let fla;
    if (phase === 3) {
      fla = (hp * 746) / (voltage * Math.sqrt(3) * 0.85);
    } else {
      fla = (hp * 746) / (voltage * 0.85);
    }

    const overloadSetting = fla * 1.15;
    const disconnectAmpacity = fla * 1.15;
    const breakerRating = fla * 2.5;
    const conductorAmpacity = fla * 1.25;

    let wireSize = '14 AWG';
    if (conductorAmpacity > 15) wireSize = '12 AWG';
    if (conductorAmpacity > 20) wireSize = '10 AWG';
    if (conductorAmpacity > 30) wireSize = '8 AWG';
    if (conductorAmpacity > 40) wireSize = '6 AWG';
    if (conductorAmpacity > 55) wireSize = '4 AWG';
    if (conductorAmpacity > 70) wireSize = '2 AWG';
    if (conductorAmpacity > 95) wireSize = '1 AWG';
    if (conductorAmpacity > 110) wireSize = '1/0 AWG';

    setStarterResult({
      fla: fla.toFixed(2),
      overloadSetting: overloadSetting.toFixed(2),
      disconnectAmpacity: disconnectAmpacity.toFixed(2),
      breakerRating: breakerRating.toFixed(2),
      conductorAmpacity: conductorAmpacity.toFixed(2),
      recommendedWire: wireSize,
    });
  };

  const calculateVFD = () => {
    const hp = parseFloat(vfdHP);
    const voltage = parseInt(vfdVoltage);
    const length = parseFloat(cableLength);

    if (isNaN(hp) || isNaN(length)) {
      alert('Please enter valid values');
      return;
    }

    const outputCurrent = (hp * 746) / (voltage * Math.sqrt(3) * 0.9);

    let deratingFactor = 1.0;
    if (length > 50) deratingFactor = 0.95;
    if (length > 100) deratingFactor = 0.90;
    if (length > 150) deratingFactor = 0.85;

    const deratedHP = hp * deratingFactor;
    const recommendedVFD = Math.ceil(deratedHP);

    let cableType = 'Standard VFD Cable';
    let shielding = 'Recommended';
    if (length > 100) {
      cableType = 'Shielded VFD Cable (Required)';
      shielding = 'Required - Use line reactors';
    }

    setVfdResult({
      outputCurrent: outputCurrent.toFixed(2),
      deratingFactor: (deratingFactor * 100).toFixed(0),
      deratedHP: deratedHP.toFixed(1),
      recommendedVFD: recommendedVFD,
      cableType,
      shielding,
      carrierFrequency: length > 100 ? 'Reduce to 4-6 kHz' : 'Standard 8-12 kHz',
    });
  };

  const calculateMotorSelection = () => {
    const torque = parseFloat(loadTorque);
    const speed = parseFloat(loadSpeed);

    if (isNaN(torque) || isNaN(speed)) {
      alert('Please enter valid values');
      return;
    }

    const hp = (torque * speed) / 5252;

    let serviceFactor = 1.0;
    if (dutyCycle === 'intermittent') serviceFactor = 0.9;
    if (dutyCycle === 'heavy') serviceFactor = 1.15;

    const recommendedHP = Math.ceil(hp * serviceFactor);

    let motorType = 'NEMA Design B (Standard)';
    if (torque / speed > 2) motorType = 'NEMA Design C (High Starting Torque)';
    if (torque / speed > 3) motorType = 'NEMA Design D (Very High Starting Torque)';

    setMotorSelectResult({
      calculatedHP: hp.toFixed(2),
      serviceFactor: serviceFactor.toFixed(2),
      recommendedHP,
      motorType,
      efficiency: 'Premium Efficiency (IE3)',
      enclosure: dutyCycle === 'heavy' ? 'TEFC (Totally Enclosed Fan Cooled)' : 'ODP (Open Drip Proof)',
      mounting: 'Rigid Base',
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
              <Settings className="h-12 w-12 text-[#FF6B00] glow-text-orange" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Motor & Drive Systems
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Professional tools for motor sizing, VFD calculations, and drive system design
          </p>
        </motion.div>

        <Tabs defaultValue="starter" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 glass-surface backdrop-blur-glass border border-white/10 p-2">
            <TabsTrigger value="starter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">
              Motor Starter
            </TabsTrigger>
            <TabsTrigger value="vfd" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">
              VFD Calculator
            </TabsTrigger>
            <TabsTrigger value="selection" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF00C8] data-[state=active]:text-white text-[#B8A7E0]">
              Motor Selection
            </TabsTrigger>
          </TabsList>

          {/* Motor Starter Sizing */}
          <TabsContent value="starter">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Motor Starter Sizing Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate overload protection, disconnect, and breaker sizing per NEC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="motor-hp" className="text-white">Motor Horsepower (HP)</Label>
                      <Input
                        id="motor-hp"
                        type="number"
                        placeholder="10"
                        value={motorHP}
                        onChange={(e) => setMotorHP(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="motor-voltage" className="text-white">Voltage (V)</Label>
                      <Select value={motorVoltage} onValueChange={setMotorVoltage}>
                        <SelectTrigger id="motor-voltage" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="208">208V</SelectItem>
                          <SelectItem value="240">240V</SelectItem>
                          <SelectItem value="480">480V</SelectItem>
                          <SelectItem value="600">600V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="motor-phase" className="text-white">Phase</Label>
                      <Select value={motorPhase} onValueChange={setMotorPhase}>
                        <SelectTrigger id="motor-phase" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Single Phase</SelectItem>
                          <SelectItem value="3">Three Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateMotorStarter} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Calculate Starter Size
                    </Button>
                  </div>

                  {starterResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">NEC Requirements</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Full Load Amps:</span>
                          <span className="font-bold text-white">{starterResult.fla} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Overload Setting:</span>
                          <span className="font-bold text-white">{starterResult.overloadSetting} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Disconnect Size:</span>
                          <span className="font-bold text-white">{starterResult.disconnectAmpacity} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Breaker Rating:</span>
                          <span className="font-bold text-white">{starterResult.breakerRating} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Conductor Size:</span>
                          <span className="font-bold text-white">{starterResult.conductorAmpacity} A</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Wire Size:</span>
                          <span className="font-bold text-white">{starterResult.recommendedWire}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VFD Calculator */}
          <TabsContent value="vfd">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">VFD Derating Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate VFD sizing with cable length derating factors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vfd-hp" className="text-white">Motor Horsepower (HP)</Label>
                      <Input
                        id="vfd-hp"
                        type="number"
                        placeholder="25"
                        value={vfdHP}
                        onChange={(e) => setVfdHP(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vfd-voltage" className="text-white">Voltage (V)</Label>
                      <Select value={vfdVoltage} onValueChange={setVfdVoltage}>
                        <SelectTrigger id="vfd-voltage" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="208">208V</SelectItem>
                          <SelectItem value="240">240V</SelectItem>
                          <SelectItem value="480">480V</SelectItem>
                          <SelectItem value="600">600V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cable-length" className="text-white">Cable Length (feet)</Label>
                      <Input
                        id="cable-length"
                        type="number"
                        placeholder="150"
                        value={cableLength}
                        onChange={(e) => setCableLength(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <Button onClick={calculateVFD} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Calculate VFD Size
                    </Button>
                  </div>

                  {vfdResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">VFD Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Output Current:</span>
                          <span className="font-bold text-white">{vfdResult.outputCurrent} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Derating Factor:</span>
                          <span className="font-bold text-white">{vfdResult.deratingFactor}%</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Derated HP:</span>
                          <span className="font-bold text-white">{vfdResult.deratedHP} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Recommended VFD:</span>
                          <span className="font-bold text-white">{vfdResult.recommendedVFD} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Cable Type:</span>
                          <span className="font-bold text-sm text-white">{vfdResult.cableType}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Shielding:</span>
                          <span className="font-bold text-sm text-white">{vfdResult.shielding}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Carrier Frequency:</span>
                          <span className="font-bold text-sm text-white">{vfdResult.carrierFrequency}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Motor Selection */}
          <TabsContent value="selection">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Motor Selection Tool</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Match motor to load requirements and duty cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="load-torque" className="text-white">Load Torque (lb-ft)</Label>
                      <Input
                        id="load-torque"
                        type="number"
                        placeholder="100"
                        value={loadTorque}
                        onChange={(e) => setLoadTorque(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="load-speed" className="text-white">Operating Speed (RPM)</Label>
                      <Input
                        id="load-speed"
                        type="number"
                        placeholder="1750"
                        value={loadSpeed}
                        onChange={(e) => setLoadSpeed(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duty-cycle" className="text-white">Duty Cycle</Label>
                      <Select value={dutyCycle} onValueChange={setDutyCycle}>
                        <SelectTrigger id="duty-cycle" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continuous">Continuous Duty</SelectItem>
                          <SelectItem value="intermittent">Intermittent Duty</SelectItem>
                          <SelectItem value="heavy">Heavy Duty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateMotorSelection} className="w-full gradient-fire text-white hover:shadow-glowOrange">
                      Select Motor
                    </Button>
                  </div>

                  {motorSelectResult && (
                    <div className="gradient-fire p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Motor Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Calculated HP:</span>
                          <span className="font-bold text-white">{motorSelectResult.calculatedHP} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Service Factor:</span>
                          <span className="font-bold text-white">{motorSelectResult.serviceFactor}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Recommended HP:</span>
                          <span className="font-bold text-white">{motorSelectResult.recommendedHP} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Motor Type:</span>
                          <span className="font-bold text-sm text-white">{motorSelectResult.motorType}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Efficiency Class:</span>
                          <span className="font-bold text-sm text-white">{motorSelectResult.efficiency}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Enclosure:</span>
                          <span className="font-bold text-sm text-white">{motorSelectResult.enclosure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Mounting:</span>
                          <span className="font-bold text-sm text-white">{motorSelectResult.mounting}</span>
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