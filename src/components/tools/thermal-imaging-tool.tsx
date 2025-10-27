'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Thermometer, AlertTriangle, Camera, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HotSpot {
  id: string;
  location: string;
  temperature: number;
  ambient: number;
  deltaT: number;
  severity: 'normal' | 'elevated' | 'high' | 'critical';
  recommendation: string;
}

export function ThermalImagingTool() {
  const [equipmentType, setEquipmentType] = useState('panel');
  const [ambientTemp, setAmbientTemp] = useState(25);
  const [hotSpots, setHotSpots] = useState<HotSpot[]>([]);
  
  const [newSpot, setNewSpot] = useState({
    location: '',
    temperature: 25
  });

  const equipmentTypes = [
    { value: 'panel', label: 'Electrical Panel', normal: 10, elevated: 20, high: 40 },
    { value: 'breaker', label: 'Circuit Breaker', normal: 15, elevated: 30, high: 50 },
    { value: 'connection', label: 'Connection/Terminal', normal: 10, elevated: 20, high: 35 },
    { value: 'motor', label: 'Motor', normal: 20, elevated: 40, high: 60 },
    { value: 'transformer', label: 'Transformer', normal: 30, elevated: 50, high: 70 },
    { value: 'cable', label: 'Cable/Conductor', normal: 15, elevated: 25, high: 40 }
  ];

  const getCurrentThresholds = () => {
    return equipmentTypes.find(e => e.value === equipmentType) || equipmentTypes[0];
  };

  const getSeverity = (deltaT: number): HotSpot['severity'] => {
    const thresholds = getCurrentThresholds();
    if (deltaT >= thresholds.high) return 'critical';
    if (deltaT >= thresholds.elevated) return 'high';
    if (deltaT >= thresholds.normal) return 'elevated';
    return 'normal';
  };

  const getRecommendation = (severity: HotSpot['severity'], location: string) => {
    switch (severity) {
      case 'critical':
        return `IMMEDIATE ACTION REQUIRED: ${location} shows critical overheating. Shut down and inspect immediately. Likely loose connection or overload.`;
      case 'high':
        return `PRIORITY: Schedule immediate inspection of ${location}. Tighten connections and verify loading within ratings.`;
      case 'elevated':
        return `ATTENTION: ${location} temperature is elevated. Schedule inspection during next maintenance window.`;
      case 'normal':
        return `${location} temperature within normal operating range.`;
    }
  };

  const addHotSpot = () => {
    if (!newSpot.location || newSpot.temperature <= 0) return;

    const deltaT = newSpot.temperature - ambientTemp;
    const severity = getSeverity(deltaT);

    const spot: HotSpot = {
      id: Date.now().toString(),
      location: newSpot.location,
      temperature: newSpot.temperature,
      ambient: ambientTemp,
      deltaT,
      severity,
      recommendation: getRecommendation(severity, newSpot.location)
    };

    setHotSpots([...hotSpots, spot]);
    setNewSpot({ location: '', temperature: 25 });
  };

  const removeHotSpot = (id: string) => {
    setHotSpots(hotSpots.filter(s => s.id !== id));
  };

  const getSeverityBadge = (severity: HotSpot['severity']) => {
    const styles = {
      normal: 'bg-green-100 text-green-800 border-green-300',
      elevated: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    };
    return <Badge className={styles[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const exportReport = () => {
    const thresholds = getCurrentThresholds();
    const report = `
THERMAL IMAGING INSPECTION REPORT

INSPECTION DETAILS:
Date: ${new Date().toLocaleDateString()}
Equipment Type: ${thresholds.label}
Ambient Temperature: ${ambientTemp}°C

TEMPERATURE THRESHOLDS:
Normal: ΔT < ${thresholds.normal}°C
Elevated: ΔT ${thresholds.normal}-${thresholds.elevated}°C
High: ΔT ${thresholds.elevated}-${thresholds.high}°C
Critical: ΔT > ${thresholds.high}°C

HOT SPOTS DETECTED:
${hotSpots.map((spot, idx) => `
${idx + 1}. ${spot.location}
   Temperature: ${spot.temperature}°C
   Delta T: ${spot.deltaT}°C
   Severity: ${spot.severity.toUpperCase()}
   Recommendation: ${spot.recommendation}
`).join('\n')}

SUMMARY:
Total Hot Spots: ${hotSpots.length}
Critical: ${hotSpots.filter(s => s.severity === 'critical').length}
High: ${hotSpots.filter(s => s.severity === 'high').length}
Elevated: ${hotSpots.filter(s => s.severity === 'elevated').length}
Normal: ${hotSpots.filter(s => s.severity === 'normal').length}

OVERALL ASSESSMENT:
${hotSpots.filter(s => s.severity === 'critical').length > 0 
  ? 'CRITICAL ISSUES DETECTED - IMMEDIATE ACTION REQUIRED' 
  : hotSpots.filter(s => s.severity === 'high').length > 0
  ? 'HIGH PRIORITY ISSUES - SCHEDULE IMMEDIATE INSPECTION'
  : 'No critical issues detected. Continue routine monitoring.'}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thermal_report_${Date.now()}.txt`;
    a.click();
  };

  const thresholds = getCurrentThresholds();
  const criticalCount = hotSpots.filter(s => s.severity === 'critical').length;
  const highCount = hotSpots.filter(s => s.severity === 'high').length;
  const elevatedCount = hotSpots.filter(s => s.severity === 'elevated').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thermal Imaging Analysis Tool</CardTitle>
          <CardDescription>
            Analyze thermal imaging data and identify electrical hot spots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Equipment Type</Label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ambient Temperature (°C)</Label>
              <Input
                type="number"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Thresholds Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Thermometer className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-900 mb-2">Temperature Rise Thresholds for {thresholds.label}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Badge className="bg-green-100 text-green-800 mb-1">Normal</Badge>
                      <div className="text-gray-700">&lt; {thresholds.normal}°C</div>
                    </div>
                    <div>
                      <Badge className="bg-yellow-100 text-yellow-800 mb-1">Elevated</Badge>
                      <div className="text-gray-700">{thresholds.normal}-{thresholds.elevated}°C</div>
                    </div>
                    <div>
                      <Badge className="bg-orange-100 text-orange-800 mb-1">High</Badge>
                      <div className="text-gray-700">{thresholds.elevated}-{thresholds.high}°C</div>
                    </div>
                    <div>
                      <Badge className="bg-red-100 text-red-800 mb-1">Critical</Badge>
                      <div className="text-gray-700">&gt; {thresholds.high}°C</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Hot Spot */}
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#00C2D1]" />
              Record Hot Spot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label>Location/Component</Label>
                <Input
                  value={newSpot.location}
                  onChange={(e) => setNewSpot({ ...newSpot, location: e.target.value })}
                  placeholder="e.g., Main Breaker Phase A"
                />
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newSpot.temperature}
                  onChange={(e) => setNewSpot({ ...newSpot, temperature: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div>ΔT: <strong>{(newSpot.temperature - ambientTemp).toFixed(1)}°C</strong></div>
              <div>Severity: {getSeverityBadge(getSeverity(newSpot.temperature - ambientTemp))}</div>
            </div>
            <Button onClick={addHotSpot} className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
              Record Hot Spot
            </Button>
          </div>

          {/* Hot Spots List */}
          {hotSpots.length > 0 && (
            <>
              {/* Summary */}
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
                      <div className="text-sm opacity-80">Critical</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-400">{highCount}</div>
                      <div className="text-sm opacity-80">High</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-400">{elevatedCount}</div>
                      <div className="text-sm opacity-80">Elevated</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#00C2D1]">{hotSpots.length}</div>
                      <div className="text-sm opacity-80">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hot Spots Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Detected Hot Spots</h3>
                  <Button onClick={exportReport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                <div className="space-y-3">
                  {hotSpots.sort((a, b) => {
                    const severityOrder = { critical: 0, high: 1, elevated: 2, normal: 3 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                  }).map((spot) => (
                    <Card key={spot.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Thermometer className={`h-6 w-6 flex-shrink-0 ${
                            spot.severity === 'critical' ? 'text-red-600' :
                            spot.severity === 'high' ? 'text-orange-600' :
                            spot.severity === 'elevated' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <h4 className="font-semibold text-lg text-[#071428]">{spot.location}</h4>
                              {getSeverityBadge(spot.severity)}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <div className="text-sm text-gray-600">Temperature</div>
                                <div className="text-xl font-bold text-[#071428]">{spot.temperature}°C</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Delta T (ΔT)</div>
                                <div className="text-xl font-bold text-[#00C2D1]">{spot.deltaT.toFixed(1)}°C</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Ambient</div>
                                <div className="text-xl font-bold text-gray-600">{spot.ambient}°C</div>
                              </div>
                            </div>

                            <div className={`p-3 rounded-lg text-sm ${
                              spot.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                              spot.severity === 'high' ? 'bg-orange-50 border border-orange-200' :
                              spot.severity === 'elevated' ? 'bg-yellow-50 border border-yellow-200' :
                              'bg-green-50 border border-green-200'
                            }`}>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                                  spot.severity === 'critical' ? 'text-red-600' :
                                  spot.severity === 'high' ? 'text-orange-600' :
                                  spot.severity === 'elevated' ? 'text-yellow-600' : 'text-green-600'
                                }`} />
                                <div className="text-gray-700">{spot.recommendation}</div>
                              </div>
                            </div>

                            <Button
                              onClick={() => removeHotSpot(spot.id)}
                              variant="outline"
                              size="sm"
                              className="mt-3"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {hotSpots.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Thermometer className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Record thermal hot spots to begin analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
