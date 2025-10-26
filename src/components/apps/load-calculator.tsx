'use client';

import { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Load = {
  id: number;
  name: string;
  type: string;
  watts: number;
  quantity: number;
};

export const LoadCalculator = () => {
  const [installationType, setInstallationType] = useState('residential');
  const [loads, setLoads] = useState<Load[]>([
    { id: 1, name: 'General Lighting', type: 'lighting', watts: 3, quantity: 1500 },
  ]);
  const [result, setResult] = useState<any>(null);

  const loadTypes = [
    { value: 'lighting', label: 'General Lighting', demandFactor: 1.0 },
    { value: 'receptacles', label: 'Receptacle Outlets', demandFactor: 1.0 },
    { value: 'appliance', label: 'Small Appliances', demandFactor: 1.0 },
    { value: 'laundry', label: 'Laundry', demandFactor: 1.0 },
    { value: 'range', label: 'Electric Range', demandFactor: 0.8 },
    { value: 'dryer', label: 'Electric Dryer', demandFactor: 1.0 },
    { value: 'hvac', label: 'HVAC System', demandFactor: 1.0 },
    { value: 'water_heater', label: 'Water Heater', demandFactor: 1.0 },
    { value: 'motor', label: 'Motor Load', demandFactor: 1.25 },
    { value: 'other', label: 'Other Load', demandFactor: 1.0 },
  ];

  const addLoad = () => {
    const newId = loads.length > 0 ? Math.max(...loads.map(l => l.id)) + 1 : 1;
    setLoads([...loads, { id: newId, name: '', type: 'other', watts: 0, quantity: 1 }]);
  };

  const removeLoad = (id: number) => {
    setLoads(loads.filter(l => l.id !== id));
  };

  const updateLoad = (id: number, field: keyof Load, value: any) => {
    setLoads(loads.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const calculateLoad = () => {
    let totalConnectedLoad = 0;
    let totalDemandLoad = 0;

    loads.forEach(load => {
      const connectedLoad = load.watts * load.quantity;
      totalConnectedLoad += connectedLoad;

      const loadType = loadTypes.find(lt => lt.value === load.type);
      const demandFactor = loadType?.demandFactor || 1.0;
      totalDemandLoad += connectedLoad * demandFactor;
    });

    // Apply diversity factors for residential
    let diversifiedLoad = totalDemandLoad;
    if (installationType === 'residential') {
      // Simplified diversity - first 3000W at 100%, remainder at 35%
      if (totalDemandLoad > 3000) {
        diversifiedLoad = 3000 + (totalDemandLoad - 3000) * 0.35;
      }
    }

    // Calculate current at 240V
    const voltage = installationType === 'residential' ? 240 : 208;
    const current = diversifiedLoad / voltage;

    // Recommended service size (next standard size up)
    const serviceSizes = [100, 125, 150, 200, 225, 320, 400, 600, 800, 1000];
    const recommendedService = serviceSizes.find(size => size >= current) || serviceSizes[serviceSizes.length - 1];

    setResult({
      connectedLoad: totalConnectedLoad.toFixed(0),
      demandLoad: totalDemandLoad.toFixed(0),
      diversifiedLoad: diversifiedLoad.toFixed(0),
      current: current.toFixed(2),
      voltage,
      recommendedService,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#071428] mb-2">Load Calculator</h2>
        <p className="text-gray-600">
          Calculate electrical loads for residential and commercial installations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installation Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={installationType} onValueChange={setInstallationType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential (NEC Article 220.82)</SelectItem>
              <SelectItem value="commercial">Commercial (Standard Method)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Electrical Loads</CardTitle>
          <CardDescription>Add all loads in the installation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loads.map((load, index) => (
            <div key={load.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Load #{index + 1}</span>
                {loads.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLoad(load.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Load Name</Label>
                  <Input
                    placeholder="e.g., Kitchen Outlets"
                    value={load.name}
                    onChange={(e) => updateLoad(load.id, 'name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Load Type</Label>
                  <Select
                    value={load.type}
                    onValueChange={(value) => updateLoad(load.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {loadTypes.map(lt => (
                        <SelectItem key={lt.value} value={lt.value}>
                          {lt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Watts per Unit</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 180"
                    value={load.watts || ''}
                    onChange={(e) => updateLoad(load.id, 'watts', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity / Sq Ft</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={load.quantity || ''}
                    onChange={(e) => updateLoad(load.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                Total: {(load.watts * load.quantity).toFixed(0)} watts
              </div>
            </div>
          ))}

          <Button onClick={addLoad} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Load
          </Button>

          <Button onClick={calculateLoad} className="w-full bg-[#071428] hover:bg-[#071428]/90">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Total Load
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Alert className="border-green-500 bg-green-50">
          <AlertTitle className="text-lg font-semibold">Load Calculation Results</AlertTitle>
          <AlertDescription className="mt-3 space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Total Connected Load</p>
                <p className="text-2xl font-bold text-[#071428]">{result.connectedLoad} W</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Demand Load</p>
                <p className="text-2xl font-bold text-[#071428]">{result.demandLoad} W</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Diversified Load</p>
                <p className="text-2xl font-bold text-[#071428]">{result.diversifiedLoad} W</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Calculated Current @ {result.voltage}V</p>
                <p className="text-2xl font-bold text-[#071428]">{result.current} A</p>
              </div>
            </div>

            <div className="bg-[#00C2D1]/10 border border-[#00C2D1] p-4 rounded-lg">
              <p className="font-medium text-[#071428] mb-1">Recommended Service Size</p>
              <p className="text-3xl font-bold text-[#071428]">{result.recommendedService} Amp</p>
            </div>

            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This calculation uses NEC standard load calculation methods. Always verify calculations with local codes and consider future expansion needs. The recommended service size includes a safety factor.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
