'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

const materialCategories = [
  'Wire & Cable',
  'Conduit & Fittings',
  'Boxes & Enclosures',
  'Breakers & Panels',
  'Lighting Fixtures',
  'Switches & Outlets',
  'Transformers',
  'Motors',
  'Other'
];

const units = ['ft', 'pcs', 'box', 'roll', 'lb', 'each'];

export function MaterialCostEstimator() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projectName, setProjectName] = useState('');
  const [laborRate, setLaborRate] = useState(75);
  const [markup, setMarkup] = useState(20);
  const [contingency, setContingency] = useState(10);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: 'Wire & Cable',
    quantity: 1,
    unit: 'ft',
    unitCost: 0
  });

  const addMaterial = () => {
    if (!newMaterial.name || newMaterial.unitCost <= 0) return;

    const material: Material = {
      id: Date.now().toString(),
      ...newMaterial,
      total: newMaterial.quantity * newMaterial.unitCost
    };

    setMaterials([...materials, material]);
    setNewMaterial({
      name: '',
      category: 'Wire & Cable',
      quantity: 1,
      unit: 'ft',
      unitCost: 0
    });
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = materials.reduce((sum, m) => sum + m.total, 0);
    const markupAmount = subtotal * (markup / 100);
    const contingencyAmount = subtotal * (contingency / 100);
    const total = subtotal + markupAmount + contingencyAmount;
    
    return { subtotal, markupAmount, contingencyAmount, total };
  };

  const exportToCSV = () => {
    const totals = calculateTotals();
    const csv = [
      ['Project:', projectName],
      [],
      ['Category', 'Item', 'Quantity', 'Unit', 'Unit Cost', 'Total'],
      ...materials.map(m => [m.category, m.name, m.quantity, m.unit, `$${m.unitCost.toFixed(2)}`, `$${m.total.toFixed(2)}`]),
      [],
      ['', '', '', '', 'Subtotal:', `$${totals.subtotal.toFixed(2)}`],
      ['', '', '', '', `Markup (${markup}%):`, `$${totals.markupAmount.toFixed(2)}`],
      ['', '', '', '', `Contingency (${contingency}%):`, `$${totals.contingencyAmount.toFixed(2)}`],
      ['', '', '', '', 'Total:', `$${totals.total.toFixed(2)}`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'estimate'}_cost_estimate.csv`;
    a.click();
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Material Cost Estimator</CardTitle>
          <CardDescription>
            Calculate component and material costs for your electrical projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
              <Input
                id="laborRate"
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="markup">Markup (%)</Label>
              <Input
                id="markup"
                type="number"
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="contingency">Contingency (%)</Label>
              <Input
                id="contingency"
                type="number"
                value={contingency}
                onChange={(e) => setContingency(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Add Material Form */}
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#00C2D1]" />
              Add Material
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <Label>Item Name</Label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="12/2 NM-B Cable"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newMaterial.category} onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({ ...newMaterial, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newMaterial.unitCost}
                  onChange={(e) => setNewMaterial({ ...newMaterial, unitCost: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={addMaterial} className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>

          {/* Materials List */}
          {materials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Materials List ({materials.length} items)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                      <div className="md:col-span-2">
                        <div className="font-semibold text-[#071428]">{material.name}</div>
                        <Badge variant="secondary" className="text-xs mt-1">{material.category}</Badge>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">{material.quantity}</span> {material.unit}
                      </div>
                      <div className="text-gray-600">
                        ${material.unitCost.toFixed(2)} / {material.unit}
                      </div>
                      <div className="font-semibold text-[#00C2D1]">
                        ${material.total.toFixed(2)}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Summary */}
          {materials.length > 0 && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#00C2D1]" />
                    Cost Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Markup ({markup}%):</span>
                    <span>${totals.markupAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Contingency ({contingency}%):</span>
                    <span>${totals.contingencyAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between text-2xl font-bold">
                    <span className="text-[#00C2D1]">Total Estimate:</span>
                    <span className="text-[#00C2D1]">${totals.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={exportToCSV} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          )}

          {materials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add materials to start estimating project costs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
