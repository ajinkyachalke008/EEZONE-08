'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Box, RotateCw, ZoomIn, ZoomOut, Maximize, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface Installation {
  id: string;
  name: string;
  type: string;
  description: string;
  components: string[];
}

const installations: Installation[] = [
  {
    id: 'residential-panel',
    name: 'Residential Service Panel',
    type: 'Residential',
    description: '200A main panel with GFCI and AFCI breakers',
    components: ['Main Breaker 200A', 'Branch Breakers', 'Ground Bar', 'Neutral Bar', 'Service Entrance']
  },
  {
    id: 'commercial-transformer',
    name: 'Pad-Mount Transformer',
    type: 'Commercial',
    description: '500kVA transformer installation with primary and secondary connections',
    components: ['Transformer', 'Primary Disconnects', 'Secondary Metering', 'Grounding Grid', 'Concrete Pad']
  },
  {
    id: 'motor-control',
    name: 'Motor Control Center',
    type: 'Industrial',
    description: 'MCC with VFDs and motor starters',
    components: ['VFD Units', 'Motor Starters', 'Control Wiring', 'Power Distribution', 'HMI Panel']
  },
  {
    id: 'solar-array',
    name: 'Rooftop Solar Installation',
    type: 'Renewable',
    description: '10kW residential solar PV system',
    components: ['Solar Panels', 'Inverter', 'Combiner Box', 'DC Disconnect', 'AC Disconnect', 'Meter']
  }
];

export function ThreeDInstallationViewer() {
  const [selectedInstallation, setSelectedInstallation] = useState<Installation>(installations[0]);
  const [viewAngle, setViewAngle] = useState([45]);
  const [zoom, setZoom] = useState([50]);
  const [showLabels, setShowLabels] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>3D Installation Viewer</CardTitle>
          <CardDescription>
            Visualize electrical installations in interactive 3D
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Installation Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Installation</label>
            <Select 
              value={selectedInstallation.id} 
              onValueChange={(value) => {
                const installation = installations.find(i => i.id === value);
                if (installation) setSelectedInstallation(installation);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {installations.map(installation => (
                  <SelectItem key={installation.id} value={installation.id}>
                    {installation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Installation Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Box className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">{selectedInstallation.name}</h4>
                  <Badge className="mb-2">{selectedInstallation.type}</Badge>
                  <p className="text-sm text-gray-700">{selectedInstallation.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3D Viewer */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 aspect-video">
            {/* 3D Canvas Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Box className="h-32 w-32 mx-auto text-gray-600 mb-4 animate-pulse" />
                <p className="text-gray-400 text-sm">3D Model Viewer</p>
                <p className="text-gray-500 text-xs mt-2">
                  Rotate: Click + Drag | Zoom: Scroll | Pan: Right Click + Drag
                </p>
              </div>
            </div>

            {/* View Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setWireframeMode(!wireframeMode)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="secondary" className="bg-black/50 text-white">
                {wireframeMode ? 'Wireframe' : 'Solid'} | Labels: {showLabels ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </div>

          {/* View Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">View Angle</label>
              <div className="flex items-center gap-3">
                <Slider
                  value={viewAngle}
                  onValueChange={setViewAngle}
                  min={0}
                  max={360}
                  step={15}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12">{viewAngle[0]}°</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom Level</label>
              <div className="flex items-center gap-3">
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={10}
                  max={200}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12">{zoom[0]}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Show Component Labels</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wireframeMode}
                onChange={(e) => setWireframeMode(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Wireframe Mode</span>
            </label>
          </div>

          {/* Components List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Installation Components</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedInstallation.components.map((component, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#00C2D1] text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{component}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
