'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ComplianceCheck {
  id: string;
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  article: string;
  details: string;
}

interface ProjectData {
  projectType: string;
  voltage: string;
  amperage: string;
  location: string;
  hasGFCI: boolean;
  hasAFCI: boolean;
  hasTROutlets: boolean;
  wireSize: string;
  conduitType: string;
}

export function ComplianceChecker() {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectType: 'residential',
    voltage: '120',
    amperage: '20',
    location: 'kitchen',
    hasGFCI: false,
    hasAFCI: false,
    hasTROutlets: false,
    wireSize: '12',
    conduitType: 'nm'
  });

  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runComplianceCheck = () => {
    setIsChecking(true);

    setTimeout(() => {
      const results: ComplianceCheck[] = [];

      // GFCI Check
      const needsGFCI = ['kitchen', 'bathroom', 'garage', 'outdoor', 'basement'].includes(projectData.location);
      results.push({
        id: '1',
        category: 'Protection',
        requirement: 'GFCI Protection Required',
        status: needsGFCI && projectData.hasGFCI ? 'pass' : needsGFCI && !projectData.hasGFCI ? 'fail' : 'pass',
        article: '210.8',
        details: needsGFCI 
          ? 'GFCI protection is required for ' + projectData.location + ' locations per NEC 210.8'
          : 'GFCI not required for this location'
      });

      // AFCI Check
      const needsAFCI = projectData.projectType === 'residential' && 
                        ['bedroom', 'living-room', 'family-room', 'den'].includes(projectData.location);
      results.push({
        id: '2',
        category: 'Protection',
        requirement: 'AFCI Protection Required',
        status: needsAFCI && projectData.hasAFCI ? 'pass' : needsAFCI && !projectData.hasAFCI ? 'fail' : 'pass',
        article: '210.12',
        details: needsAFCI
          ? 'AFCI protection required for dwelling unit ' + projectData.location + ' per NEC 210.12'
          : 'AFCI not required for this application'
      });

      // Tamper Resistant Check
      const needsTR = projectData.projectType === 'residential' && Number(projectData.voltage) <= 125;
      results.push({
        id: '3',
        category: 'Receptacles',
        requirement: 'Tamper-Resistant Receptacles',
        status: needsTR && projectData.hasTROutlets ? 'pass' : needsTR && !projectData.hasTROutlets ? 'fail' : 'pass',
        article: '406.12',
        details: needsTR
          ? 'Tamper-resistant receptacles required for all 125V, 15A & 20A outlets in dwelling units'
          : 'TR receptacles not required for commercial applications'
      });

      // Wire Size Check
      const minWireSize = Number(projectData.amperage) <= 15 ? 14 : 12;
      const actualWireSize = Number(projectData.wireSize);
      results.push({
        id: '4',
        category: 'Conductors',
        requirement: 'Adequate Wire Size',
        status: actualWireSize <= minWireSize ? 'pass' : 'fail',
        article: '310.15',
        details: `For ${projectData.amperage}A circuit, minimum wire size is ${minWireSize} AWG. You specified ${projectData.wireSize} AWG.`
      });

      // Voltage Rating Check
      const voltage = Number(projectData.voltage);
      results.push({
        id: '5',
        category: 'System',
        requirement: 'Proper Voltage Classification',
        status: voltage <= 600 ? 'pass' : 'warning',
        article: '310.15',
        details: voltage <= 600
          ? 'Voltage is within low voltage classification (≤600V)'
          : 'High voltage installation - special requirements apply'
      });

      // Amperage Rating Check
      const amperage = Number(projectData.amperage);
      results.push({
        id: '6',
        category: 'Circuit',
        requirement: 'Standard Amperage Rating',
        status: [15, 20, 30, 40, 50].includes(amperage) ? 'pass' : 'warning',
        article: '240.6',
        details: [15, 20, 30, 40, 50].includes(amperage)
          ? 'Standard overcurrent device rating'
          : 'Non-standard amperage - verify availability and requirements'
      });

      setChecks(results);
      setIsChecking(false);
    }, 1500);
  };

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  const exportReport = () => {
    const report = `
ELECTRICAL CODE COMPLIANCE REPORT
Generated: ${new Date().toLocaleString()}

PROJECT DETAILS:
- Type: ${projectData.projectType}
- Voltage: ${projectData.voltage}V
- Amperage: ${projectData.amperage}A
- Location: ${projectData.location}
- Wire Size: ${projectData.wireSize} AWG
- Conduit: ${projectData.conduitType}

COMPLIANCE CHECKS:
${checks.map((check, idx) => `
${idx + 1}. ${check.requirement}
   Status: ${check.status.toUpperCase()}
   Article: NEC ${check.article}
   ${check.details}
`).join('\n')}

SUMMARY:
- Passed: ${passCount}
- Failed: ${failCount}
- Warnings: ${warningCount}
- Total Checks: ${checks.length}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance_report.txt';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic Compliance Checker</CardTitle>
          <CardDescription>
            Verify your electrical design meets NEC requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Project Type</Label>
              <Select value={projectData.projectType} onValueChange={(value) => setProjectData({...projectData, projectType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location</Label>
              <Select value={projectData.location} onValueChange={(value) => setProjectData({...projectData, location: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="living-room">Living Room</SelectItem>
                  <SelectItem value="garage">Garage</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="basement">Basement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Voltage (V)</Label>
              <Input
                type="number"
                value={projectData.voltage}
                onChange={(e) => setProjectData({...projectData, voltage: e.target.value})}
              />
            </div>

            <div>
              <Label>Circuit Amperage (A)</Label>
              <Input
                type="number"
                value={projectData.amperage}
                onChange={(e) => setProjectData({...projectData, amperage: e.target.value})}
              />
            </div>

            <div>
              <Label>Wire Size (AWG)</Label>
              <Select value={projectData.wireSize} onValueChange={(value) => setProjectData({...projectData, wireSize: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">14 AWG</SelectItem>
                  <SelectItem value="12">12 AWG</SelectItem>
                  <SelectItem value="10">10 AWG</SelectItem>
                  <SelectItem value="8">8 AWG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Conduit Type</Label>
              <Select value={projectData.conduitType} onValueChange={(value) => setProjectData({...projectData, conduitType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nm">NM Cable</SelectItem>
                  <SelectItem value="emt">EMT</SelectItem>
                  <SelectItem value="pvc">PVC</SelectItem>
                  <SelectItem value="rigid">Rigid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-3">
              <Label>Protection & Safety Features</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectData.hasGFCI}
                    onChange={(e) => setProjectData({...projectData, hasGFCI: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">GFCI Protection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectData.hasAFCI}
                    onChange={(e) => setProjectData({...projectData, hasAFCI: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">AFCI Protection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectData.hasTROutlets}
                    onChange={(e) => setProjectData({...projectData, hasTROutlets: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Tamper-Resistant Outlets</span>
                </label>
              </div>
            </div>
          </div>

          <Button 
            onClick={runComplianceCheck}
            disabled={isChecking}
            className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
            size="lg"
          >
            <Scale className="h-5 w-5 mr-2" />
            {isChecking ? 'Checking Compliance...' : 'Run Compliance Check'}
          </Button>

          {/* Results */}
          {checks.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-400">{passCount}</div>
                      <div className="text-sm opacity-80">Passed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">{failCount}</div>
                      <div className="text-sm opacity-80">Failed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
                      <div className="text-sm opacity-80">Warnings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checks List */}
              <div className="space-y-3">
                {checks.map((check) => (
                  <Card key={check.id} className={`border-2 ${getStatusColor(check.status)}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(check.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-semibold text-lg">{check.requirement}</h4>
                            <Badge variant="outline">NEC {check.article}</Badge>
                          </div>
                          <Badge variant="secondary" className="mb-2">{check.category}</Badge>
                          <p className="text-sm mt-2">{check.details}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={exportReport} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Compliance Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
