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
      fla = (hp * 746) / (voltage * Math.sqrt(3) * 0.85); // Assuming 85% efficiency
    } else {
      fla = (hp * 746) / (voltage * 0.85);
    }

    // NEC 430.52 - Maximum Overload Protection
    const overloadSetting = fla * 1.15; // 115% for continuous duty
    
    // Disconnect sizing (NEC 430.110)
    const disconnectAmpacity = fla * 1.15;

    // Branch circuit breaker (NEC 430.52)
    const breakerRating = fla * 2.5; // For inverse time breakers

    // Conductor sizing (NEC 430.22) - 125% of FLA
    const conductorAmpacity = fla * 1.25;

    // Determine recommended wire size
    let wireSize = '14 AWG';
    if (conductorAmpacity > 15) wireSize = '12 AWG';
    if (conductorAmpacity > 20) wireSize = '10 AWG';
    if (conductorAmpacity > 30) wireSize = '8 AWG';
    if (conductorAmpacity > 40) wireSize = '6 AWG';
    if (conductorAmpacity > 55) wireSize = '4 AWG';
    if (conductorAmpacity > 70) wireSize = '2 AWG';
    if (conductorAmpacity > 95) wireSize = '1 AWG';

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

    // Calculate output current
    const outputCurrent = (hp * 746) / (voltage * Math.sqrt(3) * 0.9);

    // Derating factors
    let deratingFactor = 1.0;
    if (length > 50) deratingFactor = 0.95;
    if (length > 100) deratingFactor = 0.90;
    if (length > 150) deratingFactor = 0.85;

    const derated HP = hp * deratingFactor;
    const recommendedVFD = Math.ceil(deratedHP);

    // Cable recommendations
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

    // Calculate required power (HP)
    // HP = (Torque × Speed) / 5252
    const hp = (torque * speed) / 5252;

    // Service factor based on duty cycle
    let serviceFactor = 1.0;
    if (dutyCycle === 'intermittent') serviceFactor = 0.9;
    if (dutyCycle === 'heavy') serviceFactor = 1.15;

    const recommendedHP = Math.ceil(hp * serviceFactor);

    // Motor type recommendations
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
            <Settings className="h-10 w-10 text-[#00C2D1]" />
            Motor & Drive Systems
          </h1>
          <p className="text-gray-600 text-lg">
            Professional tools for motor sizing, VFD calculations, and drive system design
          </p>
        </div>

        <Tabs defaultValue="starter" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="starter">Motor Starter</TabsTrigger>
            <TabsTrigger value="vfd">VFD Calculator</TabsTrigger>
            <TabsTrigger value="selection">Motor Selection</TabsTrigger>
          </TabsList>

          {/* Motor Starter Sizing */}
          <TabsContent value="starter">
            <Card>
              <CardHeader>
                <CardTitle>Motor Starter Sizing Calculator</CardTitle>
                <CardDescription>Calculate overload protection, disconnect, and breaker sizing per NEC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="motor-hp">Motor Horsepower (HP)</Label>
                      <Input
                        id="motor-hp"
                        type="number"
                        placeholder="10"
                        value={motorHP}
                        onChange={(e) => setMotorHP(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="motor-voltage">Voltage (V)</Label>
                      <Select value={motorVoltage} onValueChange={setMotorVoltage}>
                        <SelectTrigger id="motor-voltage">
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
                      <Label htmlFor="motor-phase">Phase</Label>
                      <Select value={motorPhase} onValueChange={setMotorPhase}>
                        <SelectTrigger id="motor-phase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Single Phase</SelectItem>
                          <SelectItem value="3">Three Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateMotorStarter} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Starter Size
                    </Button>
                  </div>

                  {starterResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">NEC Requirements</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Full Load Amps:</span>
                          <span className="font-bold">{starterResult.fla} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Overload Setting:</span>
                          <span className="font-bold">{starterResult.overloadSetting} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Disconnect Size:</span>
                          <span className="font-bold">{starterResult.disconnectAmpacity} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Breaker Rating:</span>
                          <span className="font-bold">{starterResult.breakerRating} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Conductor Size:</span>
                          <span className="font-bold">{starterResult.conductorAmpacity} A</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wire Size:</span>
                          <span className="font-bold text-[#00C2D1]">{starterResult.recommendedWire}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>VFD Derating Calculator</CardTitle>
                <CardDescription>Calculate VFD sizing with cable length derating factors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vfd-hp">Motor Horsepower (HP)</Label>
                      <Input
                        id="vfd-hp"
                        type="number"
                        placeholder="25"
                        value={vfdHP}
                        onChange={(e) => setVfdHP(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="vfd-voltage">Voltage (V)</Label>
                      <Select value={vfdVoltage} onValueChange={setVfdVoltage}>
                        <SelectTrigger id="vfd-voltage">
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
                      <Label htmlFor="cable-length">Cable Length (feet)</Label>
                      <Input
                        id="cable-length"
                        type="number"
                        placeholder="150"
                        value={cableLength}
                        onChange={(e) => setCableLength(e.target.value)}
                      />
                    </div>

                    <Button onClick={calculateVFD} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate VFD Size
                    </Button>
                  </div>

                  {vfdResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">VFD Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Output Current:</span>
                          <span className="font-bold">{vfdResult.outputCurrent} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Derating Factor:</span>
                          <span className="font-bold">{vfdResult.deratingFactor}%</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Derated HP:</span>
                          <span className="font-bold">{vfdResult.deratedHP} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Recommended VFD:</span>
                          <span className="font-bold text-[#00C2D1]">{vfdResult.recommendedVFD} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Cable Type:</span>
                          <span className="font-bold text-sm">{vfdResult.cableType}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Shielding:</span>
                          <span className="font-bold text-sm">{vfdResult.shielding}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carrier Frequency:</span>
                          <span className="font-bold text-sm">{vfdResult.carrierFrequency}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Motor Selection Tool</CardTitle>
                <CardDescription>Match motor to load requirements and duty cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="load-torque">Load Torque (lb-ft)</Label>
                      <Input
                        id="load-torque"
                        type="number"
                        placeholder="100"
                        value={loadTorque}
                        onChange={(e) => setLoadTorque(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="load-speed">Operating Speed (RPM)</Label>
                      <Input
                        id="load-speed"
                        type="number"
                        placeholder="1750"
                        value={loadSpeed}
                        onChange={(e) => setLoadSpeed(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="duty-cycle">Duty Cycle</Label>
                      <Select value={dutyCycle} onValueChange={setDutyCycle}>
                        <SelectTrigger id="duty-cycle">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continuous">Continuous Duty</SelectItem>
                          <SelectItem value="intermittent">Intermittent Duty</SelectItem>
                          <SelectItem value="heavy">Heavy Duty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateMotorSelection} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Select Motor
                    </Button>
                  </div>

                  {motorSelectResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Motor Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Calculated HP:</span>
                          <span className="font-bold">{motorSelectResult.calculatedHP} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Service Factor:</span>
                          <span className="font-bold">{motorSelectResult.serviceFactor}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Recommended HP:</span>
                          <span className="font-bold text-[#00C2D1]">{motorSelectResult.recommendedHP} HP</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Motor Type:</span>
                          <span className="font-bold text-sm">{motorSelectResult.motorType}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Efficiency Class:</span>
                          <span className="font-bold text-sm">{motorSelectResult.efficiency}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Enclosure:</span>
                          <span className="font-bold text-sm">{motorSelectResult.enclosure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mounting:</span>
                          <span className="font-bold text-sm">{motorSelectResult.mounting}</span>
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
