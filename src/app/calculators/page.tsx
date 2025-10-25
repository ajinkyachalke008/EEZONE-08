'use client';

import { useState } from 'react';
import { Calculator, Zap, TrendingDown, Activity, Download, RotateCcw, Radio, Gauge, Lightbulb, Timer, Cpu } from 'lucide-react';
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

  // Capacitor Calculator
  const [capCapacitance, setCapCapacitance] = useState('');
  const [capCapacitanceUnit, setCapCapacitanceUnit] = useState('uF');
  const [capFrequency, setCapFrequency] = useState('');
  const [capVoltage, setCapVoltage] = useState('');
  const [capacitorResult, setCapacitorResult] = useState<{
    reactance: number;
    charge: number;
    energy: number;
  } | null>(null);

  // Inductor Calculator
  const [indInductance, setIndInductance] = useState('');
  const [indInductanceUnit, setIndInductanceUnit] = useState('mH');
  const [indFrequency, setIndFrequency] = useState('');
  const [indCurrent, setIndCurrent] = useState('');
  const [inductorResult, setInductorResult] = useState<{
    reactance: number;
    energy: number;
  } | null>(null);

  // LED Resistor Calculator
  const [ledSourceVoltage, setLedSourceVoltage] = useState('');
  const [ledForwardVoltage, setLedForwardVoltage] = useState('');
  const [ledForwardCurrent, setLedForwardCurrent] = useState('');
  const [ledResult, setLedResult] = useState<{
    resistance: number;
    power: number;
    standardResistor: number;
  } | null>(null);

  // RC Time Constant Calculator
  const [rcResistance, setRcResistance] = useState('');
  const [rcResistanceUnit, setRcResistanceUnit] = useState('kΩ');
  const [rcCapacitance, setRcCapacitance] = useState('');
  const [rcCapacitanceUnit, setRcCapacitanceUnit] = useState('uF');
  const [rcResult, setRcResult] = useState<{
    timeConstant: number;
    charge63: number;
    charge95: number;
    charge99: number;
  } | null>(null);

  // Transformer Calculator
  const [transPrimaryVoltage, setTransPrimaryVoltage] = useState('');
  const [transSecondaryVoltage, setTransSecondaryVoltage] = useState('');
  const [transPrimaryTurns, setTransPrimaryTurns] = useState('');
  const [transSecondaryTurns, setTransSecondaryTurns] = useState('');
  const [transPower, setTransPower] = useState('');
  const [transformerResult, setTransformerResult] = useState<{
    turnsRatio: number;
    primaryCurrent: number;
    secondaryCurrent: number;
    voltage: number;
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

  const calculateCapacitor = () => {
    const capacitance = parseFloat(capCapacitance);
    const frequency = parseFloat(capFrequency);
    const voltage = parseFloat(capVoltage);

    if (!capacitance || !frequency) return;

    // Convert capacitance to Farads
    const capMultiplier: { [key: string]: number } = {
      'pF': 1e-12,
      'nF': 1e-9,
      'uF': 1e-6,
      'mF': 1e-3,
      'F': 1
    };
    const capInFarads = capacitance * capMultiplier[capCapacitanceUnit];

    // Calculate reactance: Xc = 1 / (2 * π * f * C)
    const reactance = 1 / (2 * Math.PI * frequency * capInFarads);

    // Calculate charge: Q = C * V (if voltage provided)
    const charge = voltage ? capInFarads * voltage : 0;

    // Calculate energy: E = 0.5 * C * V^2 (if voltage provided)
    const energy = voltage ? 0.5 * capInFarads * voltage * voltage : 0;

    setCapacitorResult({
      reactance: parseFloat(reactance.toFixed(2)),
      charge: parseFloat((charge * 1e6).toFixed(6)), // Convert to microCoulombs
      energy: parseFloat((energy * 1e6).toFixed(6)), // Convert to microJoules
    });
  };

  const calculateInductor = () => {
    const inductance = parseFloat(indInductance);
    const frequency = parseFloat(indFrequency);
    const current = parseFloat(indCurrent);

    if (!inductance || !frequency) return;

    // Convert inductance to Henries
    const indMultiplier: { [key: string]: number } = {
      'uH': 1e-6,
      'mH': 1e-3,
      'H': 1
    };
    const indInHenries = inductance * indMultiplier[indInductanceUnit];

    // Calculate reactance: XL = 2 * π * f * L
    const reactance = 2 * Math.PI * frequency * indInHenries;

    // Calculate energy: E = 0.5 * L * I^2 (if current provided)
    const energy = current ? 0.5 * indInHenries * current * current : 0;

    setInductorResult({
      reactance: parseFloat(reactance.toFixed(2)),
      energy: parseFloat((energy * 1e3).toFixed(6)), // Convert to milliJoules
    });
  };

  const calculateLEDResistor = () => {
    const sourceV = parseFloat(ledSourceVoltage);
    const forwardV = parseFloat(ledForwardVoltage);
    const forwardI = parseFloat(ledForwardCurrent);

    if (!sourceV || !forwardV || !forwardI) return;

    // Calculate resistance: R = (Vs - Vf) / I
    const resistance = (sourceV - forwardV) / (forwardI / 1000); // Convert mA to A

    // Calculate power: P = (Vs - Vf) * I
    const power = (sourceV - forwardV) * (forwardI / 1000);

    // Find standard resistor value (E12 series)
    const e12Series = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
    let standardResistor = resistance;
    let multiplier = 1;
    while (resistance / multiplier > 100) multiplier *= 10;
    const normalized = resistance / multiplier;
    const closest = e12Series.reduce((prev, curr) => 
      Math.abs(curr - normalized) < Math.abs(prev - normalized) ? curr : prev
    );
    standardResistor = closest * multiplier;

    setLedResult({
      resistance: parseFloat(resistance.toFixed(2)),
      power: parseFloat(power.toFixed(3)),
      standardResistor: parseFloat(standardResistor.toFixed(0)),
    });
  };

  const calculateRCTimeConstant = () => {
    const resistance = parseFloat(rcResistance);
    const capacitance = parseFloat(rcCapacitance);

    if (!resistance || !capacitance) return;

    // Convert to base units
    const resMultiplier: { [key: string]: number } = {
      'Ω': 1,
      'kΩ': 1e3,
      'MΩ': 1e6
    };
    const capMultiplier: { [key: string]: number } = {
      'pF': 1e-12,
      'nF': 1e-9,
      'uF': 1e-6,
      'mF': 1e-3
    };

    const resInOhms = resistance * resMultiplier[rcResistanceUnit];
    const capInFarads = capacitance * capMultiplier[rcCapacitanceUnit];

    // Calculate time constant: τ = R * C
    const timeConstant = resInOhms * capInFarads;

    setRcResult({
      timeConstant: parseFloat((timeConstant * 1e3).toFixed(6)), // Convert to ms
      charge63: parseFloat((timeConstant * 1e3).toFixed(6)), // 1τ = 63.2%
      charge95: parseFloat((timeConstant * 3 * 1e3).toFixed(6)), // 3τ = 95%
      charge99: parseFloat((timeConstant * 5 * 1e3).toFixed(6)), // 5τ = 99%
    });
  };

  const calculateTransformer = () => {
    const vp = parseFloat(transPrimaryVoltage);
    const vs = parseFloat(transSecondaryVoltage);
    const np = parseFloat(transPrimaryTurns);
    const ns = parseFloat(transSecondaryTurns);
    const power = parseFloat(transPower);

    let turnsRatio = 0;
    let primaryCurrent = 0;
    let secondaryCurrent = 0;
    let voltage = 0;

    // Calculate turns ratio
    if (np && ns) {
      turnsRatio = np / ns;
    } else if (vp && vs) {
      turnsRatio = vp / vs;
    }

    // Calculate missing voltage
    if (vp && turnsRatio) {
      voltage = vp / turnsRatio;
    } else if (vs && turnsRatio) {
      voltage = vs * turnsRatio;
    }

    // Calculate currents
    if (power && vp) {
      primaryCurrent = power / vp;
    }
    if (power && (vs || voltage)) {
      secondaryCurrent = power / (vs || voltage);
    }

    setTransformerResult({
      turnsRatio: parseFloat(turnsRatio.toFixed(4)),
      primaryCurrent: parseFloat(primaryCurrent.toFixed(3)),
      secondaryCurrent: parseFloat(secondaryCurrent.toFixed(3)),
      voltage: parseFloat((vs || voltage).toFixed(2)),
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

  const resetCapacitor = () => {
    setCapCapacitance('');
    setCapFrequency('');
    setCapVoltage('');
    setCapacitorResult(null);
  };

  const resetInductor = () => {
    setIndInductance('');
    setIndFrequency('');
    setIndCurrent('');
    setInductorResult(null);
  };

  const resetLEDResistor = () => {
    setLedSourceVoltage('');
    setLedForwardVoltage('');
    setLedForwardCurrent('');
    setLedResult(null);
  };

  const resetRCTimeConstant = () => {
    setRcResistance('');
    setRcCapacitance('');
    setRcResult(null);
  };

  const resetTransformer = () => {
    setTransPrimaryVoltage('');
    setTransSecondaryVoltage('');
    setTransPrimaryTurns('');
    setTransSecondaryTurns('');
    setTransPower('');
    setTransformerResult(null);
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
            <TabsTrigger value="ohms-law">
              <Zap className="h-4 w-4 mr-2" />
              Ohm's Law
            </TabsTrigger>
            <TabsTrigger value="voltage-drop">
              <TrendingDown className="h-4 w-4 mr-2" />
              Voltage Drop
            </TabsTrigger>
            <TabsTrigger value="power-factor">
              <Activity className="h-4 w-4 mr-2" />
              Power Factor
            </TabsTrigger>
            <TabsTrigger value="capacitor">
              <Radio className="h-4 w-4 mr-2" />
              Capacitor
            </TabsTrigger>
            <TabsTrigger value="inductor">
              <Gauge className="h-4 w-4 mr-2" />
              Inductor
            </TabsTrigger>
            <TabsTrigger value="led-resistor">
              <Lightbulb className="h-4 w-4 mr-2" />
              LED Resistor
            </TabsTrigger>
            <TabsTrigger value="rc-time">
              <Timer className="h-4 w-4 mr-2" />
              RC Time
            </TabsTrigger>
            <TabsTrigger value="transformer">
              <Cpu className="h-4 w-4 mr-2" />
              Transformer
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

          {/* Capacitor Calculator */}
          <TabsContent value="capacitor">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Radio className="h-6 w-6 text-[#00C2D1]" />
                  Capacitor Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate capacitive reactance, charge, and energy storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cap-capacitance">Capacitance</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cap-capacitance"
                        type="number"
                        placeholder="Value"
                        value={capCapacitance}
                        onChange={(e) => setCapCapacitance(e.target.value)}
                      />
                      <Select value={capCapacitanceUnit} onValueChange={setCapCapacitanceUnit}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pF">pF</SelectItem>
                          <SelectItem value="nF">nF</SelectItem>
                          <SelectItem value="uF">µF</SelectItem>
                          <SelectItem value="mF">mF</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cap-frequency">Frequency (Hz)</Label>
                    <Input
                      id="cap-frequency"
                      type="number"
                      placeholder="Hertz"
                      value={capFrequency}
                      onChange={(e) => setCapFrequency(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cap-voltage">Voltage (V) - Optional</Label>
                    <Input
                      id="cap-voltage"
                      type="number"
                      placeholder="Volts"
                      value={capVoltage}
                      onChange={(e) => setCapVoltage(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={calculateCapacitor} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate
                </Button>

                {capacitorResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Reactance (Xc)</p>
                        <p className="text-2xl font-bold">{capacitorResult.reactance} Ω</p>
                      </div>
                      {capacitorResult.charge > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm">Charge (Q)</p>
                          <p className="text-2xl font-bold">{capacitorResult.charge} µC</p>
                        </div>
                      )}
                      {capacitorResult.energy > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm">Energy (E)</p>
                          <p className="text-2xl font-bold">{capacitorResult.energy} µJ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetCapacitor} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {capacitorResult && (
                  <Button
                    onClick={() => exportResults('Capacitor Calculator', capacitorResult)}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Inductor Calculator */}
          <TabsContent value="inductor">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gauge className="h-6 w-6 text-[#00C2D1]" />
                  Inductor Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate inductive reactance and energy storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ind-inductance">Inductance</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ind-inductance"
                        type="number"
                        placeholder="Value"
                        value={indInductance}
                        onChange={(e) => setIndInductance(e.target.value)}
                      />
                      <Select value={indInductanceUnit} onValueChange={setIndInductanceUnit}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uH">µH</SelectItem>
                          <SelectItem value="mH">mH</SelectItem>
                          <SelectItem value="H">H</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ind-frequency">Frequency (Hz)</Label>
                    <Input
                      id="ind-frequency"
                      type="number"
                      placeholder="Hertz"
                      value={indFrequency}
                      onChange={(e) => setIndFrequency(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ind-current">Current (A) - Optional</Label>
                    <Input
                      id="ind-current"
                      type="number"
                      placeholder="Amperes"
                      value={indCurrent}
                      onChange={(e) => setIndCurrent(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={calculateInductor} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate
                </Button>

                {inductorResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Reactance (XL)</p>
                        <p className="text-2xl font-bold">{inductorResult.reactance} Ω</p>
                      </div>
                      {inductorResult.energy > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm">Energy (E)</p>
                          <p className="text-2xl font-bold">{inductorResult.energy} mJ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetInductor} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {inductorResult && (
                  <Button
                    onClick={() => exportResults('Inductor Calculator', inductorResult)}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* LED Resistor Calculator */}
          <TabsContent value="led-resistor">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-[#00C2D1]" />
                  LED Current Limiting Resistor Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate the required resistor for LED circuits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="led-source">Source Voltage (V)</Label>
                    <Input
                      id="led-source"
                      type="number"
                      placeholder="e.g., 9"
                      value={ledSourceVoltage}
                      onChange={(e) => setLedSourceVoltage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="led-forward">LED Forward Voltage (V)</Label>
                    <Input
                      id="led-forward"
                      type="number"
                      placeholder="e.g., 2.1"
                      value={ledForwardVoltage}
                      onChange={(e) => setLedForwardVoltage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="led-current">LED Forward Current (mA)</Label>
                    <Input
                      id="led-current"
                      type="number"
                      placeholder="e.g., 20"
                      value={ledForwardCurrent}
                      onChange={(e) => setLedForwardCurrent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Typical LED Values:</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Red LED: 1.8-2.2V, 20mA</li>
                    <li>• Green LED: 2.0-3.0V, 20mA</li>
                    <li>• Blue/White LED: 3.0-3.6V, 20mA</li>
                  </ul>
                </div>

                <Button onClick={calculateLEDResistor} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate
                </Button>

                {ledResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Required Resistance</p>
                        <p className="text-2xl font-bold">{ledResult.resistance} Ω</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Standard Resistor</p>
                        <p className="text-2xl font-bold">{ledResult.standardResistor} Ω</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Power Dissipation</p>
                        <p className="text-2xl font-bold">{ledResult.power} W</p>
                      </div>
                    </div>
                    <div className="bg-[#00C2D1]/20 border border-[#00C2D1] p-3 rounded">
                      <p className="text-sm">💡 Use a resistor rated for at least {(ledResult.power * 2).toFixed(2)}W for safety margin</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetLEDResistor} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {ledResult && (
                  <Button
                    onClick={() => exportResults('LED Resistor Calculator', ledResult)}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* RC Time Constant Calculator */}
          <TabsContent value="rc-time">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Timer className="h-6 w-6 text-[#00C2D1]" />
                  RC Time Constant Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate time constant and charging times for RC circuits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rc-resistance">Resistance</Label>
                    <div className="flex gap-2">
                      <Input
                        id="rc-resistance"
                        type="number"
                        placeholder="Value"
                        value={rcResistance}
                        onChange={(e) => setRcResistance(e.target.value)}
                      />
                      <Select value={rcResistanceUnit} onValueChange={setRcResistanceUnit}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ω">Ω</SelectItem>
                          <SelectItem value="kΩ">kΩ</SelectItem>
                          <SelectItem value="MΩ">MΩ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rc-capacitance">Capacitance</Label>
                    <div className="flex gap-2">
                      <Input
                        id="rc-capacitance"
                        type="number"
                        placeholder="Value"
                        value={rcCapacitance}
                        onChange={(e) => setRcCapacitance(e.target.value)}
                      />
                      <Select value={rcCapacitanceUnit} onValueChange={setRcCapacitanceUnit}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pF">pF</SelectItem>
                          <SelectItem value="nF">nF</SelectItem>
                          <SelectItem value="uF">µF</SelectItem>
                          <SelectItem value="mF">mF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Time Constant (τ):</strong> The time it takes for the capacitor to charge to 63.2% of the supply voltage.
                  </p>
                </div>

                <Button onClick={calculateRCTimeConstant} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate
                </Button>

                {rcResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Time Constant (τ)</p>
                        <p className="text-2xl font-bold">{rcResult.timeConstant} ms</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">63.2% Charge Time</p>
                        <p className="text-2xl font-bold">{rcResult.charge63} ms</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">95% Charge Time (3τ)</p>
                        <p className="text-2xl font-bold">{rcResult.charge95} ms</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">99% Charge Time (5τ)</p>
                        <p className="text-2xl font-bold">{rcResult.charge99} ms</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetRCTimeConstant} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {rcResult && (
                  <Button
                    onClick={() => exportResults('RC Time Constant Calculator', rcResult)}
                    className="bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Transformer Calculator */}
          <TabsContent value="transformer">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Cpu className="h-6 w-6 text-[#00C2D1]" />
                  Transformer Calculator
                </CardTitle>
                <CardDescription className="mt-2">
                  Calculate transformer turns ratio, voltages, and currents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="trans-primary-v">Primary Voltage (V)</Label>
                    <Input
                      id="trans-primary-v"
                      type="number"
                      placeholder="Volts"
                      value={transPrimaryVoltage}
                      onChange={(e) => setTransPrimaryVoltage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trans-secondary-v">Secondary Voltage (V)</Label>
                    <Input
                      id="trans-secondary-v"
                      type="number"
                      placeholder="Volts"
                      value={transSecondaryVoltage}
                      onChange={(e) => setTransSecondaryVoltage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trans-primary-turns">Primary Turns</Label>
                    <Input
                      id="trans-primary-turns"
                      type="number"
                      placeholder="Number of turns"
                      value={transPrimaryTurns}
                      onChange={(e) => setTransPrimaryTurns(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trans-secondary-turns">Secondary Turns</Label>
                    <Input
                      id="trans-secondary-turns"
                      type="number"
                      placeholder="Number of turns"
                      value={transSecondaryTurns}
                      onChange={(e) => setTransSecondaryTurns(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trans-power">Power Rating (VA)</Label>
                    <Input
                      id="trans-power"
                      type="number"
                      placeholder="Volt-Amperes"
                      value={transPower}
                      onChange={(e) => setTransPower(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Enter either voltages OR turns (or both) to calculate the turns ratio.
                  </p>
                </div>

                <Button onClick={calculateTransformer} className="w-full bg-[#071428] hover:bg-[#071428]/90">
                  Calculate
                </Button>

                {transformerResult && (
                  <div className="bg-[#071428] text-white p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-lg text-[#00C2D1]">Results:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Turns Ratio</p>
                        <p className="text-2xl font-bold">{transformerResult.turnsRatio.toFixed(2)}:1</p>
                      </div>
                      {transformerResult.voltage > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm">Secondary Voltage</p>
                          <p className="text-2xl font-bold">{transformerResult.voltage} V</p>
                        </div>
                      )}
                      {transformerResult.primaryCurrent > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm">Primary Current</p>
                          <p className="text-2xl font-bold">{transformerResult.primaryCurrent} A</p>
                        </div>
                      )}
                      {transformerResult.secondaryCurrent > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm">Secondary Current</p>
                          <p className="text-2xl font-bold">{transformerResult.secondaryCurrent} A</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button onClick={resetTransformer} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {transformerResult && (
                  <Button
                    onClick={() => exportResults('Transformer Calculator', transformerResult)}
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