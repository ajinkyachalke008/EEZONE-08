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
            <Lightbulb className="h-10 w-10 text-[#00C2D1]" />
            Lighting & Energy Tools
          </h1>
          <p className="text-gray-600 text-lg">
            Professional calculators for lighting design, energy analysis, and solar system sizing
          </p>
        </div>

        <Tabs defaultValue="lighting" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="lighting">Lighting Design</TabsTrigger>
            <TabsTrigger value="energy">Energy Cost</TabsTrigger>
            <TabsTrigger value="solar">Solar PV</TabsTrigger>
          </TabsList>

          {/* Lighting Design Calculator */}
          <TabsContent value="lighting">
            <Card>
              <CardHeader>
                <CardTitle>Lighting Design Calculator</CardTitle>
                <CardDescription>Calculate fixture requirements, spacing, and energy costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="room-length">Room Length (ft)</Label>
                        <Input
                          id="room-length"
                          type="number"
                          placeholder="40"
                          value={roomLength}
                          onChange={(e) => setRoomLength(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="room-width">Room Width (ft)</Label>
                        <Input
                          id="room-width"
                          type="number"
                          placeholder="30"
                          value={roomWidth}
                          onChange={(e) => setRoomWidth(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="room-type">Room Type</Label>
                      <Select value={roomType} onValueChange={setRoomType}>
                        <SelectTrigger id="room-type">
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
                      <Label htmlFor="fixture-wattage">Fixture Wattage (W)</Label>
                      <Input
                        id="fixture-wattage"
                        type="number"
                        placeholder="40"
                        value={fixtureWattage}
                        onChange={(e) => setFixtureWattage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fixture-lumens">Fixture Output (Lumens)</Label>
                      <Input
                        id="fixture-lumens"
                        type="number"
                        placeholder="4000"
                        value={fixtureLumens}
                        onChange={(e) => setFixtureLumens(e.target.value)}
                      />
                    </div>

                    <Button onClick={calculateLighting} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Lighting Design
                    </Button>
                  </div>

                  {lightingResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Design Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Room Area:</span>
                          <span className="font-bold">{lightingResult.area} sq ft</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Required Illuminance:</span>
                          <span className="font-bold">{lightingResult.requiredFC} FC</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Total Lumens Needed:</span>
                          <span className="font-bold">{lightingResult.requiredLumens} lm</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Fixtures Required:</span>
                          <span className="font-bold text-[#00C2D1]">{lightingResult.fixturesNeeded}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Spacing:</span>
                          <span className="font-bold">{lightingResult.spacing} ft</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Total Power:</span>
                          <span className="font-bold">{lightingResult.totalWattage} W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Power Density:</span>
                          <span className="font-bold">{lightingResult.powerDensity} W/sq ft</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Annual Energy:</span>
                          <span className="font-bold">{lightingResult.annualKWh} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Cost:</span>
                          <span className="font-bold">${lightingResult.annualCost}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Energy Cost Calculator</CardTitle>
                <CardDescription>Calculate electricity costs and LED replacement savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="device-wattage">Device Wattage (W)</Label>
                      <Input
                        id="device-wattage"
                        type="number"
                        placeholder="100"
                        value={deviceWattage}
                        onChange={(e) => setDeviceWattage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="hours-per-day">Hours Per Day</Label>
                      <Input
                        id="hours-per-day"
                        type="number"
                        placeholder="8"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="electricity-rate">Electricity Rate ($/kWh)</Label>
                      <Input
                        id="electricity-rate"
                        type="number"
                        step="0.01"
                        placeholder="0.12"
                        value={electricityRate}
                        onChange={(e) => setElectricityRate(e.target.value)}
                      />
                    </div>

                    <Button onClick={calculateEnergyCost} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Calculate Energy Cost
                    </Button>
                  </div>

                  {energyResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">Energy Analysis</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Daily Energy:</span>
                          <span className="font-bold">{energyResult.dailyKWh} kWh</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Daily Cost:</span>
                          <span className="font-bold">${energyResult.dailyCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Monthly Energy:</span>
                          <span className="font-bold">{energyResult.monthlyKWh} kWh</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Monthly Cost:</span>
                          <span className="font-bold">${energyResult.monthlyCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Annual Energy:</span>
                          <span className="font-bold">{energyResult.annualKWh} kWh</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Annual Cost:</span>
                          <span className="font-bold text-[#00C2D1]">${energyResult.annualCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>LED Annual Savings:</span>
                          <span className="font-bold text-green-400">${energyResult.ledSavings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>LED Payback Period:</span>
                          <span className="font-bold">{energyResult.paybackMonths} months</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Solar PV System Designer</CardTitle>
                <CardDescription>Calculate solar array sizing, battery requirements, and ROI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="daily-usage">Daily Energy Usage (kWh)</Label>
                      <Input
                        id="daily-usage"
                        type="number"
                        placeholder="30"
                        value={dailyUsage}
                        onChange={(e) => setDailyUsage(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sun-hours">Peak Sun Hours/Day</Label>
                      <Select value={sunHours} onValueChange={setSunHours}>
                        <SelectTrigger id="sun-hours">
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
                      <Label htmlFor="system-voltage">System Voltage (V)</Label>
                      <Select value={systemVoltage} onValueChange={setSystemVoltage}>
                        <SelectTrigger id="system-voltage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12V</SelectItem>
                          <SelectItem value="24">24V</SelectItem>
                          <SelectItem value="48">48V</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={calculateSolar} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                      Design Solar System
                    </Button>
                  </div>

                  {solarResult && (
                    <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                      <h3 className="text-xl font-bold mb-4 text-[#00C2D1]">System Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Array Size:</span>
                          <span className="font-bold">{solarResult.arraySize} kW</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Number of Panels:</span>
                          <span className="font-bold text-[#00C2D1]">{solarResult.panelCount} × 300W</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Battery Bank:</span>
                          <span className="font-bold">{solarResult.batteryAh} Ah</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Inverter Size:</span>
                          <span className="font-bold">{solarResult.inverterSize} kW</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Charge Controller:</span>
                          <span className="font-bold">{solarResult.chargeController} A</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>System Cost:</span>
                          <span className="font-bold">${solarResult.systemCost}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/20 pb-2">
                          <span>Annual Savings:</span>
                          <span className="font-bold text-green-400">${solarResult.annualSavings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payback Period:</span>
                          <span className="font-bold">{solarResult.paybackYears} years</span>
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
