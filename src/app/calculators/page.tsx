'use client';

import { useState } from 'react';
import { Calculator, Zap, TrendingDown, Activity, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function CalculatorsPage() {
  // Ohm's Law Calculator
  const [ohmsVoltage, setOhmsVoltage] = useState('');
  const [ohmsCurrent, setOhmsCurrent] = useState('');
  const [ohmsResistance, setOhmsResistance] = useState('');
  const [ohmsPower, setOhmsPower] = useState('');

  // Voltage Drop Calculator
  const [vdCurrent, setVdCurrent] = useState('');
  const [vdLength, setVdLength] = useState('');
  const [vdWireSize, setVdWireSize] = useState('12');
  const [vdPhase, setVdPhase] = useState('single');
  const [vdVoltage, setVdVoltage] = useState('120');
  const [voltageDropResult, setVoltageDropResult] = useState<{
    drop: number;
    percentage: number;
    endVoltage: number;
  } | null>(null);

  // Power Factor Calculator
  const [pfRealPower, setPfRealPower] = useState('');
  const [pfApparentPower, setPfApparentPower] = useState('');
  const [pfReactivePower, setPfReactivePower] = useState('');
  const [powerFactorResult, setPowerFactorResult] = useState<{
    powerFactor: number;
    angle: number;
    realPower: number;
    apparentPower: number;
    reactivePower: number;
  } | null>(null);

  // Wire resistance per 1000ft (ohms) for copper at 75°C
  const wireResistance: { [key: string]: number } = {
    '14': 3.07,
    '12': 1.93,
    '10': 1.21,
    '8': 0.764,
    '6': 0.491,
    '4': 0.308,
    '2': 0.194,
    '1': 0.154,
    '1/0': 0.122,
    '2/0': 0.0967,
    '3/0': 0.0766,
    '4/0': 0.0608,
  };

  const calculateOhmsLaw = (type: 'voltage' | 'current' | 'resistance' | 'power') => {
    const V = parseFloat(ohmsVoltage) || 0;
    const I = parseFloat(ohmsCurrent) || 0;
    const R = parseFloat(ohmsResistance) || 0;
    const P = parseFloat(ohmsPower) || 0;

    switch (type) {
      case 'voltage':
        if (I && R) setOhmsVoltage((I * R).toFixed(2));
        else if (P && I) setOhmsVoltage((P / I).toFixed(2));
        else if (P && R) setOhmsVoltage(Math.sqrt(P * R).toFixed(2));
        break;
      case 'current':
        if (V && R) setOhmsCurrent((V / R).toFixed(2));
        else if (P && V) setOhmsCurrent((P / V).toFixed(2));
        else if (P && R) setOhmsCurrent(Math.sqrt(P / R).toFixed(2));
        break;
      case 'resistance':
        if (V && I) setOhmsResistance((V / I).toFixed(2));
        else if (V && P) setOhmsResistance((V * V / P).toFixed(2));
        else if (P && I) setOhmsResistance((P / (I * I)).toFixed(2));
        break;
      case 'power':
        if (V && I) setOhmsPower((V * I).toFixed(2));
        else if (V && R) setOhmsPower((V * V / R).toFixed(2));
        else if (I && R) setOhmsPower((I * I * R).toFixed(2));
        break;
    }
  };

  const calculateVoltageDrop = () => {
    const current = parseFloat(vdCurrent);
    const length = parseFloat(vdLength);
    const voltage = parseFloat(vdVoltage);
    const resistance = wireResistance[vdWireSize];

    if (!current || !length || !resistance) return;

    const multiplier = vdPhase === 'single' ? 2 : 1.732;
    const drop = (multiplier * current * resistance * length) / 1000;
    const percentage = (drop / voltage) * 100;
    const endVoltage = voltage - drop;

    setVoltageDropResult({
      drop: parseFloat(drop.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2)),
      endVoltage: parseFloat(endVoltage.toFixed(2)),
    });
  };

  const calculatePowerFactor = () => {
    const real = parseFloat(pfRealPower);
    const apparent = parseFloat(pfApparentPower);
    const reactive = parseFloat(pfReactivePower);

    let pf = 0;
    let angle = 0;
    let calcReal = real || 0;
    let calcApparent = apparent || 0;
    let calcReactive = reactive || 0;

    if (real && apparent) {
      pf = real / apparent;
      angle = Math.acos(pf) * (180 / Math.PI);
      calcReactive = Math.sqrt(apparent * apparent - real * real);
    } else if (real && reactive) {
      calcApparent = Math.sqrt(real * real + reactive * reactive);
      pf = real / calcApparent;
      angle = Math.atan(reactive / real) * (180 / Math.PI);
    } else if (apparent && reactive) {
      calcReal = Math.sqrt(apparent * apparent - reactive * reactive);
      pf = calcReal / apparent;
      angle = Math.acos(pf) * (180 / Math.PI);
    }

    setPowerFactorResult({
      powerFactor: parseFloat(pf.toFixed(4)),
      angle: parseFloat(angle.toFixed(2)),
      realPower: parseFloat(calcReal.toFixed(2)),
      apparentPower: parseFloat(calcApparent.toFixed(2)),
      reactivePower: parseFloat(calcReactive.toFixed(2)),
    });
  };

  const resetOhmsLaw = () => {
    setOhmsVoltage('');
    setOhmsCurrent('');
    setOhmsResistance('');
    setOhmsPower('');
  };

  const resetVoltageDrop = () => {
    setVdCurrent('');
    setVdLength('');
    setVdWireSize('12');
    setVdPhase('single');
    setVdVoltage('120');
    setVoltageDropResult(null);
  };

  const resetPowerFactor = () => {
    setPfRealPower('');
    setPfApparentPower('');
    setPfReactivePower('');
    setPowerFactorResult(null);
  };

  const exportResults = (calculatorName: string, data: any) => {
    const results = JSON.stringify(data, null, 2);
    const blob = new Blob([`${calculatorName}\n\n${results}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calculatorName.toLowerCase().replace(/\s+/g, '-')}-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#071428] mb-2">Calculators & Tools</h1>
          <p className="text-gray-600">Professional electrical engineering calculators for everyday use</p>
        </div>

        <Tabs defaultValue="ohms-law" className="space-y-6" id="calculators">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="ohms-law" id="ohms-law">
              <Zap className="h-4 w-4 mr-2" />
              Ohm's Law
            </TabsTrigger>
            <TabsTrigger value="voltage-drop" id="voltage-drop">
              <TrendingDown className="h-4 w-4 mr-2" />
              Voltage Drop
            </TabsTrigger>
            <TabsTrigger value="power-factor" id="power-factor">
              <Activity className="h-4 w-4 mr-2" />
              Power Factor
            </TabsTrigger>
          </TabsList>

          {/* Ohm's Law Calculator */}
          <TabsContent value="ohms-law">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Zap className="h-6 w-6 text-[#00C2D1]" />
                      Ohm's Law Calculator
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Calculate voltage, current, resistance, and power using Ohm's Law
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">V = I × R</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage (V)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="voltage"
                        type="number"
                        placeholder="Volts"
                        value={ohmsVoltage}
                        onChange={(e) => setOhmsVoltage(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => calculateOhmsLaw('voltage')}
                        title="Calculate Voltage"
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current">Current (I)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="current"
                        type="number"
                        placeholder="Amperes"
                        value={ohmsCurrent}
                        onChange={(e) => setOhmsCurrent(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => calculateOhmsLaw('current')}
                        title="Calculate Current"
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resistance">Resistance (R)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="resistance"
                        type="number"
                        placeholder="Ohms"
                        value={ohmsResistance}
                        onChange={(e) => setOhmsResistance(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => calculateOhmsLaw('resistance')}
                        title="Calculate Resistance"
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="power">Power (P)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="power"
                        type="number"
                        placeholder="Watts"
                        value={ohmsPower}
                        onChange={(e) => setOhmsPower(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => calculateOhmsLaw('power')}
                        title="Calculate Power"
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Formulas:</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• V = I × R (Voltage = Current × Resistance)</li>
                    <li>• I = V ÷ R (Current = Voltage ÷ Resistance)</li>
                    <li>• R = V ÷ I (Resistance = Voltage ÷ Current)</li>
                    <li>• P = V × I (Power = Voltage × Current)</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetOhmsLaw} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => exportResults('Ohms Law Calculator', {
                    voltage: ohmsVoltage,
                    current: ohmsCurrent,
                    resistance: ohmsResistance,
                    power: ohmsPower,
                  })}
                  className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Voltage Drop Calculator */}
          <TabsContent value="voltage-drop">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingDown className="h-6 w-6 text-[#00C2D1]" />
                  Voltage Drop Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate voltage drop for copper wire conductors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vd-current">Current (Amperes)</Label>
                    <Input
                      id="vd-current"
                      type="number"
                      placeholder="Amperes"
                      value={vdCurrent}
                      onChange={(e) => setVdCurrent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vd-length">One-Way Length (feet)</Label>
                    <Input
                      id="vd-length"
                      type="number"
                      placeholder="Feet"
                      value={vdLength}
                      onChange={(e) => setVdLength(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vd-wire">Wire Size (AWG)</Label>
                    <Select value={vdWireSize} onValueChange={setVdWireSize}>
                      <SelectTrigger id="vd-wire">
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
                        <SelectItem value="1/0">1/0 AWG</SelectItem>
                        <SelectItem value="2/0">2/0 AWG</SelectItem>
                        <SelectItem value="3/0">3/0 AWG</SelectItem>
                        <SelectItem value="4/0">4/0 AWG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vd-phase">Phase</Label>
                    <Select value={vdPhase} onValueChange={setVdPhase}>
                      <SelectTrigger id="vd-phase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Phase</SelectItem>
                        <SelectItem value="three">Three Phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vd-voltage">System Voltage</Label>
                    <Select value={vdVoltage} onValueChange={setVdVoltage}>
                      <SelectTrigger id="vd-voltage">
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
                </div>

                <Button onClick={calculateVoltageDrop} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate Voltage Drop
                </Button>

                {voltageDropResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Voltage Drop</p>
                        <p className="text-2xl font-bold">{voltageDropResult.drop}V</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Percentage Drop</p>
                        <p className="text-2xl font-bold">{voltageDropResult.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">End Voltage</p>
                        <p className="text-2xl font-bold">{voltageDropResult.endVoltage}V</p>
                      </div>
                    </div>
                    {voltageDropResult.percentage > 3 && (
                      <div className="bg-red-500/20 border border-red-500 p-3 rounded">
                        <p className="text-sm">⚠️ Warning: Voltage drop exceeds 3% NEC recommendation</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetVoltageDrop} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {voltageDropResult && (
                  <Button
                    onClick={() => exportResults('Voltage Drop Calculator', voltageDropResult)}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Power Factor Calculator */}
          <TabsContent value="power-factor">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="h-6 w-6 text-[#00C2D1]" />
                  Power Factor Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate power factor and power triangle values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pf-real">Real Power (kW)</Label>
                    <Input
                      id="pf-real"
                      type="number"
                      placeholder="Kilowatts"
                      value={pfRealPower}
                      onChange={(e) => setPfRealPower(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pf-apparent">Apparent Power (kVA)</Label>
                    <Input
                      id="pf-apparent"
                      type="number"
                      placeholder="Kilovolt-amperes"
                      value={pfApparentPower}
                      onChange={(e) => setPfApparentPower(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pf-reactive">Reactive Power (kVAR)</Label>
                    <Input
                      id="pf-reactive"
                      type="number"
                      placeholder="Kilovolt-amperes reactive"
                      value={pfReactivePower}
                      onChange={(e) => setPfReactivePower(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Enter any two values to calculate the power factor and remaining values.
                  </p>
                </div>

                <Button onClick={calculatePowerFactor} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate Power Factor
                </Button>

                {powerFactorResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-4">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-gray-400 text-sm">Power Factor</p>
                        <p className="text-3xl font-bold">{powerFactorResult.powerFactor}</p>
                        <p className="text-sm text-gray-400">({(powerFactorResult.powerFactor * 100).toFixed(1)}%)</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phase Angle</p>
                        <p className="text-2xl font-bold">{powerFactorResult.angle}°</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Real Power</p>
                        <p className="text-2xl font-bold">{powerFactorResult.realPower} kW</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Apparent Power</p>
                        <p className="text-2xl font-bold">{powerFactorResult.apparentPower} kVA</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Reactive Power</p>
                        <p className="text-2xl font-bold">{powerFactorResult.reactivePower} kVAR</p>
                      </div>
                    </div>
                    {powerFactorResult.powerFactor < 0.85 && (
                      <div className="bg-yellow-500/20 border border-yellow-500 p-3 rounded">
                        <p className="text-sm">⚠️ Low power factor detected. Consider power factor correction.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetPowerFactor} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {powerFactorResult && (
                  <Button
                    onClick={() => exportResults('Power Factor Calculator', powerFactorResult)}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
