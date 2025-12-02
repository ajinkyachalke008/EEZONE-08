'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LightingEnergyPage() {
  // Lighting Design Calculator
  const [roomLength, setRoomLength] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomType, setRoomType] = useState('office');
  const [fixtureWattage, setFixtureWattage] = useState('');
  const [fixtureLumens, setFixtureLumens] = useState('');
  const [lightingResult, setLightingResult] = useState<any>(null);

  // Energy Cost Calculator
  const [deviceWattage, setDeviceWattage] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [electricityRate, setElectricityRate] = useState('0.12');
  const [energyResult, setEnergyResult] = useState<any>(null);

  // Solar PV Calculator
  const [dailyUsage, setDailyUsage] = useState('');
  const [sunHours, setSunHours] = useState('5');
  const [systemVoltage, setSystemVoltage] = useState('24');
  const [solarResult, setSolarResult] = useState<any>(null);

  const calculateLighting = () => {
    const length = parseFloat(roomLength);
    const width = parseFloat(roomWidth);
    const wattage = parseFloat(fixtureWattage);
    const lumens = parseFloat(fixtureLumens);

    if (isNaN(length) || isNaN(width) || isNaN(wattage) || isNaN(lumens)) {
      alert('Please enter valid values');
      return;
    }

    const area = length * width;

    // Recommended illuminance levels (foot-candles)
    const illuminanceTable: { [key: string]: number } = {
      office: 50,
      warehouse: 30,
      retail: 75,
      classroom: 50,
      hospital: 100,
      parking: 10,
    };

    const requiredFC = illuminanceTable[roomType] || 50;
    const requiredLumens = area * requiredFC;
    const fixturesNeeded = Math.ceil(requiredLumens / lumens);
    
    // Calculate spacing
    const spacing = Math.sqrt(area / fixturesNeeded);
    
    // Calculate total power
    const totalWattage = fixturesNeeded * wattage;
    const powerDensity = totalWattage / area;

    // Annual energy cost (assume 10 hours/day, 260 days/year)
    const annualKWh = (totalWattage * 10 * 260) / 1000;
    const annualCost = annualKWh * 0.12;

    setLightingResult({
      area: area.toFixed(0),
      requiredFC,
      requiredLumens: requiredLumens.toFixed(0),
      fixturesNeeded,
      spacing: spacing.toFixed(1),
      totalWattage: totalWattage.toFixed(0),
      powerDensity: powerDensity.toFixed(2),
      annualKWh: annualKWh.toFixed(0),
      annualCost: annualCost.toFixed(2),
    });
  };

  const calculateEnergyCost = () => {
    const wattage = parseFloat(deviceWattage);
    const hours = parseFloat(hoursPerDay);
    const rate = parseFloat(electricityRate);

    if (isNaN(wattage) || isNaN(hours) || isNaN(rate)) {
      alert('Please enter valid values');
      return;
    }

    const dailyKWh = (wattage * hours) / 1000;
    const dailyCost = dailyKWh * rate;
    const monthlyKWh = dailyKWh * 30;
    const monthlyCost = monthlyKWh * rate;
    const annualKWh = dailyKWh * 365;
    const annualCost = annualKWh * rate;

    // LED replacement savings (if applicable)
    const ledWattage = wattage * 0.15; // LED uses ~15% of incandescent
    const annualLEDKWh = (ledWattage * hours * 365) / 1000;
    const annualSavings = (annualKWh - annualLEDKWh) * rate;

    setEnergyResult({
      dailyKWh: dailyKWh.toFixed(2),
      dailyCost: dailyCost.toFixed(2),
      monthlyKWh: monthlyKWh.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2),
      annualKWh: annualKWh.toFixed(2),
      annualCost: annualCost.toFixed(2),
      ledSavings: annualSavings.toFixed(2),
      paybackMonths: annualSavings > 0 ? ((ledWattage * 2) / (annualSavings / 12)).toFixed(1) : '0',
    });
  };

  const calculateSolar = () => {
    const usage = parseFloat(dailyUsage);
    const sun = parseFloat(sunHours);
    const voltage = parseInt(systemVoltage);

    if (isNaN(usage) || isNaN(sun)) {
      alert('Please enter valid values');
      return;
    }

    // Calculate array size (with 25% safety margin)
    const arraySize = (usage * 1.25) / sun;
    
    // Calculate battery bank (3 days autonomy)
    const batteryAh = (usage * 3 * 1000) / voltage;
    
    // Number of panels (assuming 300W panels)
    const panelCount = Math.ceil(arraySize / 0.3);
    
    // System cost estimate ($3/watt installed)
    const systemCost = arraySize * 1000 * 3;
    
    // Annual savings (assume $0.12/kWh)
    const annualSavings = usage * 365 * 0.12;
    
    // Simple payback period
    const paybackYears = systemCost / annualSavings;

    setSolarResult({
      arraySize: arraySize.toFixed(2),
      panelCount,
      batteryAh: batteryAh.toFixed(0),
      systemCost: systemCost.toFixed(0),
      annualSavings: annualSavings.toFixed(2),
      paybackYears: paybackYears.toFixed(1),
      inverterSize: (arraySize * 1.2).toFixed(2),
      chargeController: Math.ceil(arraySize * 1000 / voltage),
    });
  };

  return (
    <div className="min-h-screen gradient-depth">
      {/* Ambient Background Orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
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
              <Lightbulb className="h-12 w-12 text-[#00E5FF] glow-text-cyan" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text-cyan" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Lighting & Energy Tools
            </h1>
          </div>
          <p className="text-xl text-[#B8A7E0]">
            Professional calculators for lighting design, energy analysis, and solar system sizing
          </p>
        </motion.div>

        <Tabs defaultValue="lighting" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 glass-surface backdrop-blur-glass border border-white/10 p-2">
            <TabsTrigger value="lighting" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]">Lighting Design</TabsTrigger>
            <TabsTrigger value="energy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]">Energy Cost</TabsTrigger>
            <TabsTrigger value="solar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E5FF] data-[state=active]:to-[#9C4AFF] data-[state=active]:text-white text-[#B8A7E0]">Solar PV</TabsTrigger>
          </TabsList>

          {/* Lighting Design Calculator */}
          <TabsContent value="lighting">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Lighting Design Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate fixture requirements, spacing, and energy costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="room-length" className="text-white">Room Length (ft)</Label>
                        <Input
                          id="room-length"
                          type="number"
                          placeholder="40"
                          value={roomLength}
                          onChange={(e) => setRoomLength(e.target.value)}
                          className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="room-width" className="text-white">Room Width (ft)</Label>
                        <Input
                          id="room-width"
                          type="number"
                          placeholder="30"
                          value={roomWidth}
                          onChange={(e) => setRoomWidth(e.target.value)}
                          className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="room-type" className="text-white">Room Type</Label>
                      <Select value={roomType} onValueChange={setRoomType}>
                        <SelectTrigger id="room-type" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office (50 FC)</SelectItem>
                          <SelectItem value="warehouse">Warehouse (30 FC)</SelectItem>
                          <SelectItem value="retail">Retail (75 FC)</SelectItem>
                          <SelectItem value="classroom">Classroom (50 FC)</SelectItem>
                          <SelectItem value="hospital">Hospital (100 FC)</SelectItem>
                          <SelectItem value="parking">Parking Lot (10 FC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fixture-wattage" className="text-white">Fixture Wattage (W)</Label>
                      <Input
                        id="fixture-wattage"
                        type="number"
                        placeholder="40"
                        value={fixtureWattage}
                        onChange={(e) => setFixtureWattage(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fixture-lumens" className="text-white">Fixture Output (Lumens)</Label>
                      <Input
                        id="fixture-lumens"
                        type="number"
                        placeholder="4000"
                        value={fixtureLumens}
                        onChange={(e) => setFixtureLumens(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <Button onClick={calculateLighting} className="w-full gradient-aqua text-white hover:shadow-glowCyan">
                      Calculate Lighting Design
                    </Button>
                  </div>

                  {lightingResult && (
                    <div className="gradient-aqua p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Design Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Room Area:</span>
                          <span className="font-bold text-white">{lightingResult.area} sq ft</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Required Illuminance:</span>
                          <span className="font-bold text-white">{lightingResult.requiredFC} FC</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Total Lumens Needed:</span>
                          <span className="font-bold text-white">{lightingResult.requiredLumens} lm</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Fixtures Required:</span>
                          <span className="font-bold text-[#00C2D1]">{lightingResult.fixturesNeeded}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Spacing:</span>
                          <span className="font-bold text-white">{lightingResult.spacing} ft</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Total Power:</span>
                          <span className="font-bold text-white">{lightingResult.totalWattage} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Power Density:</span>
                          <span className="font-bold text-white">{lightingResult.powerDensity} W/sq ft</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Annual Energy:</span>
                          <span className="font-bold text-white">{lightingResult.annualKWh} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Annual Cost:</span>
                          <span className="font-bold text-[#00C2D1]">${lightingResult.annualCost}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Energy Cost Calculator */}
          <TabsContent value="energy">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Energy Cost Calculator</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate electricity costs and LED replacement savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="device-wattage" className="text-white">Device Wattage (W)</Label>
                      <Input
                        id="device-wattage"
                        type="number"
                        placeholder="100"
                        value={deviceWattage}
                        onChange={(e) => setDeviceWattage(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hours-per-day" className="text-white">Hours Per Day</Label>
                      <Input
                        id="hours-per-day"
                        type="number"
                        placeholder="8"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="electricity-rate" className="text-white">Electricity Rate ($/kWh)</Label>
                      <Input
                        id="electricity-rate"
                        type="number"
                        step="0.01"
                        placeholder="0.12"
                        value={electricityRate}
                        onChange={(e) => setElectricityRate(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <Button onClick={calculateEnergyCost} className="w-full gradient-aqua text-white hover:shadow-glowCyan">
                      Calculate Energy Cost
                    </Button>
                  </div>

                  {energyResult && (
                    <div className="gradient-aqua p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">Energy Analysis</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Daily Energy:</span>
                          <span className="font-bold text-white">{energyResult.dailyKWh} kWh</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Daily Cost:</span>
                          <span className="font-bold text-white">${energyResult.dailyCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Monthly Energy:</span>
                          <span className="font-bold text-white">{energyResult.monthlyKWh} kWh</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Monthly Cost:</span>
                          <span className="font-bold text-white">${energyResult.monthlyCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Annual Energy:</span>
                          <span className="font-bold text-white">{energyResult.annualKWh} kWh</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Annual Cost:</span>
                          <span className="font-bold text-[#00C2D1] text-white">${energyResult.annualCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">LED Annual Savings:</span>
                          <span className="font-bold text-green-400 text-white">${energyResult.ledSavings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">LED Payback Period:</span>
                          <span className="font-bold text-white">{energyResult.paybackMonths} months</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solar PV Calculator */}
          <TabsContent value="solar">
            <Card className="glass-surface border-white/10 backdrop-blur-glass">
              <CardHeader>
                <CardTitle className="text-white">Solar PV System Designer</CardTitle>
                <CardDescription className="text-[#B8A7E0]">Calculate solar array sizing, battery requirements, and ROI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="daily-usage" className="text-white">Daily Energy Usage (kWh)</Label>
                      <Input
                        id="daily-usage"
                        type="number"
                        placeholder="30"
                        value={dailyUsage}
                        onChange={(e) => setDailyUsage(e.target.value)}
                        className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sun-hours" className="text-white">Peak Sun Hours/Day</Label>
                      <Select value={sunHours} onValueChange={setSunHours}>
                        <SelectTrigger id="sun-hours" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 hours (Poor)</SelectItem>
                          <SelectItem value="4">4 hours (Fair)</SelectItem>
                          <SelectItem value="5">5 hours (Good)</SelectItem>
                          <SelectItem value="6">6 hours (Excellent)</SelectItem>
                          <SelectItem value="7">7 hours (Optimal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="system-voltage" className="text-white">System Voltage (V)</Label>
                      <Select value={systemVoltage} onValueChange={setSystemVoltage}>
                        <SelectTrigger id="system-voltage" className="glass-surface border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12V</SelectItem>
                          <SelectItem value="24">24V</SelectItem>
                          <SelectItem value="48">48V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateSolar} className="w-full gradient-aqua text-white hover:shadow-glowCyan">
                      Design Solar System
                    </Button>
                  </div>

                  {solarResult && (
                    <div className="gradient-aqua p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-white">System Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Array Size:</span>
                          <span className="font-bold text-white">{solarResult.arraySize} kW</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Number of Panels:</span>
                          <span className="font-bold text-[#00C2D1]">{solarResult.panelCount} × 300W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Battery Bank:</span>
                          <span className="font-bold text-white">{solarResult.batteryAh} Ah</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Inverter Size:</span>
                          <span className="font-bold text-white">{solarResult.inverterSize} kW</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Charge Controller:</span>
                          <span className="font-bold text-white">{solarResult.chargeController} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">System Cost:</span>
                          <span className="font-bold text-white">${solarResult.systemCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span className="text-white/90">Annual Savings:</span>
                          <span className="font-bold text-green-400 text-white">${solarResult.annualSavings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90">Payback Period:</span>
                          <span className="font-bold text-white">{solarResult.paybackYears} years</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-4 pt-4 border-t border-white/20">
                        💡 Includes 25% safety margin and 3-day battery autonomy
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