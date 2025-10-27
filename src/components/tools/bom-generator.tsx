'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Plus, Trash2, Download, FileText } from 'lucide-react';

interface BOMItem {
  id: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

const units = ['pcs', 'ft', 'box', 'roll', 'each', 'lb', 'kg', 'm'];

export function BOMGenerator() {
  const [items, setItems] = useState<BOMItem[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [preparedBy, setPreparedBy] = useState('');

  const [newItem, setNewItem] = useState({
    partNumber: '',
    description: '',
    manufacturer: '',
    quantity: 1,
    unit: 'pcs',
    unitPrice: 0,
    notes: ''
  });

  const addItem = () => {
    if (!newItem.description) return;

    const item: BOMItem = {
      id: Date.now().toString(),
      ...newItem,
      totalPrice: newItem.quantity * newItem.unitPrice
    };

    setItems([...items, item]);
    setNewItem({
      partNumber: '',
      description: '',
      manufacturer: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      notes: ''
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BOMItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = updated.quantity * updated.unitPrice;
      }
      return updated;
    }));
  };

  const getTotalCost = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const exportToCSV = () => {
    const csv = [
      ['Bill of Materials'],
      ['Project:', projectName],
      ['Project #:', projectNumber],
      ['Prepared By:', preparedBy],
      ['Date:', new Date().toLocaleDateString()],
      [],
      ['Item #', 'Part Number', 'Description', 'Manufacturer', 'Quantity', 'Unit', 'Unit Price', 'Total Price', 'Notes'],
      ...items.map((item, idx) => [
        idx + 1,
        item.partNumber,
        item.description,
        item.manufacturer,
        item.quantity,
        item.unit,
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.totalPrice.toFixed(2)}`,
        item.notes
      ]),
      [],
      ['', '', '', '', '', '', 'TOTAL:', `$${getTotalCost().toFixed(2)}`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectNumber || 'project'}_BOM.csv`;
    a.click();
  };

  const exportToPDF = () => {
    // Create a printable HTML version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill of Materials - ${projectName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #071428; border-bottom: 3px solid #00C2D1; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .header-item { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #071428; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:hover { background: #f5f5f5; }
            .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Bill of Materials</h1>
          <div class="header">
            <div class="header-item"><strong>Project:</strong> ${projectName}</div>
            <div class="header-item"><strong>Project #:</strong> ${projectNumber}</div>
            <div class="header-item"><strong>Prepared By:</strong> ${preparedBy}</div>
            <div class="header-item"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Part Number</th>
                <th>Description</th>
                <th>Manufacturer</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.partNumber}</td>
                  <td>${item.description}</td>
                  <td>${item.manufacturer}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">TOTAL: $${getTotalCost().toFixed(2)}</div>
          <br><br>
          <button onclick="window.print()">Print / Save as PDF</button>
          <button onclick="window.close()">Close</button>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill of Materials (BOM) Generator</CardTitle>
          <CardDescription>
            Create detailed bills of materials for electrical projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Commercial Building Retrofit"
              />
            </div>
            <div>
              <Label htmlFor="projectNumber">Project Number</Label>
              <Input
                id="projectNumber"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                placeholder="PRJ-2025-001"
              />
            </div>
            <div>
              <Label htmlFor="preparedBy">Prepared By</Label>
              <Input
                id="preparedBy"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Your Name"
              />
            </div>
          </div>

          {/* Add Item Form */}
          <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#00C2D1]" />
              Add BOM Item
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Part Number</Label>
                <Input
                  value={newItem.partNumber}
                  onChange={(e) => setNewItem({ ...newItem, partNumber: e.target.value })}
                  placeholder="ABC-123"
                />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input
                  value={newItem.manufacturer}
                  onChange={(e) => setNewItem({ ...newItem, manufacturer: e.target.value })}
                  placeholder="Schneider Electric"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="20A Circuit Breaker, 1-Pole"
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
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
              <div className="md:col-span-2">
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Special requirements or specifications"
                />
              </div>
            </div>
            <Button onClick={addItem} className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Item to BOM
            </Button>
          </div>

          {/* BOM Table */}
          {items.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">BOM Items ({items.length})</h3>
                <div className="flex gap-2">
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={exportToPDF} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#071428] text-white">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Part #</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Mfr.</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-left">Unit</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3 font-mono text-sm">{item.partNumber}</td>
                        <td className="p-3">
                          <div className="font-medium">{item.description}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                          )}
                        </td>
                        <td className="p-3 text-sm">{item.manufacturer}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3">{item.unit}</td>
                        <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold text-[#00C2D1]">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={7} className="p-3 text-right">TOTAL:</td>
                      <td className="p-3 text-right text-lg text-[#00C2D1]">
                        ${getTotalCost().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add items to create your Bill of Materials</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
