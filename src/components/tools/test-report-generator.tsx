'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Printer, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  testPoint: string;
  expectedValue: string;
  actualValue: string;
  status: 'pass' | 'fail';
  notes: string;
}

export function TestReportGenerator() {
  const [reportType, setReportType] = useState('insulation');
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    location: '',
    testDate: new Date().toISOString().split('T')[0],
    technicianName: '',
    equipmentTested: ''
  });

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const [newTest, setNewTest] = useState({
    testPoint: '',
    expectedValue: '',
    actualValue: '',
    notes: ''
  });

  const reportTypes = [
    { value: 'insulation', label: 'Insulation Resistance (Megger)' },
    { value: 'continuity', label: 'Continuity Test' },
    { value: 'ground', label: 'Ground Resistance' },
    { value: 'voltage', label: 'Voltage Verification' },
    { value: 'load', label: 'Load Test' }
  ];

  const getTestCriteria = (type: string) => {
    switch (type) {
      case 'insulation':
        return {
          unit: 'MΩ',
          passCriteria: '≥1 MΩ',
          examples: ['Phase to Ground', 'Phase to Phase', 'Phase to Neutral']
        };
      case 'continuity':
        return {
          unit: 'Ω',
          passCriteria: '< 1 Ω',
          examples: ['Ground Wire', 'Neutral', 'Equipment Bond']
        };
      case 'ground':
        return {
          unit: 'Ω',
          passCriteria: '< 25 Ω',
          examples: ['Ground Rod', 'Ground Grid', 'Building Ground']
        };
      case 'voltage':
        return {
          unit: 'V',
          passCriteria: '±5% nominal',
          examples: ['L1-N', 'L2-N', 'L1-L2']
        };
      case 'load':
        return {
          unit: 'A',
          passCriteria: 'Within rated',
          examples: ['Full Load', '50% Load', 'No Load']
        };
      default:
        return { unit: '', passCriteria: '', examples: [] };
    }
  };

  const addTestResult = () => {
    if (!newTest.testPoint || !newTest.actualValue) return;

    const criteria = getTestCriteria(reportType);
    let status: 'pass' | 'fail' = 'pass';

    if (reportType === 'insulation') {
      status = parseFloat(newTest.actualValue) >= 1 ? 'pass' : 'fail';
    } else if (reportType === 'continuity') {
      status = parseFloat(newTest.actualValue) < 1 ? 'pass' : 'fail';
    } else if (reportType === 'ground') {
      status = parseFloat(newTest.actualValue) < 25 ? 'pass' : 'fail';
    }

    const result: TestResult = {
      ...newTest,
      status
    };

    setTestResults([...testResults, result]);
    setNewTest({
      testPoint: '',
      expectedValue: criteria.passCriteria,
      actualValue: '',
      notes: ''
    });
  };

  const removeTest = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  const generateReport = () => {
    const criteria = getTestCriteria(reportType);
    const reportLabel = reportTypes.find(t => t.value === reportType)?.label || '';
    
    const report = `
ELECTRICAL TEST REPORT
${reportLabel.toUpperCase()}

PROJECT INFORMATION:
Project Name: ${projectInfo.projectName}
Location: ${projectInfo.location}
Test Date: ${projectInfo.testDate}
Technician: ${projectInfo.technicianName}
Equipment Tested: ${projectInfo.equipmentTested}

TEST CRITERIA:
Pass Criteria: ${criteria.passCriteria}
Unit of Measurement: ${criteria.unit}

TEST RESULTS:
${testResults.map((result, idx) => `
Test Point ${idx + 1}: ${result.testPoint}
  Expected: ${result.expectedValue}
  Actual: ${result.actualValue} ${criteria.unit}
  Status: ${result.status.toUpperCase()}
  ${result.notes ? `Notes: ${result.notes}` : ''}
`).join('\n')}

SUMMARY:
Total Tests: ${testResults.length}
Passed: ${testResults.filter(r => r.status === 'pass').length}
Failed: ${testResults.filter(r => r.status === 'fail').length}
Pass Rate: ${testResults.length > 0 ? ((testResults.filter(r => r.status === 'pass').length / testResults.length) * 100).toFixed(1) : 0}%

CONCLUSION:
${testResults.filter(r => r.status === 'fail').length === 0 
  ? 'All tests passed. Equipment meets requirements.' 
  : 'Some tests failed. Further investigation required.'}

Technician Signature: _____________________
Date: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_test_report_${projectInfo.testDate}.txt`;
    a.click();
  };

  const printReport = () => {
    window.print();
  };

  const criteria = getTestCriteria(reportType);
  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Test Report Generator</CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Generate professional electrical test reports (Megger, Insulation, Ground tests)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <Label className="text-white">Test Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-surface border-white/20">
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-lg text-sm">
              <div className="font-semibold text-[#00E5FF]">Pass Criteria: {criteria.passCriteria}</div>
              <div className="text-[#B8A7E0]">Unit: {criteria.unit}</div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4 p-4 glass-surface border border-white/10 rounded-lg">
            <h3 className="font-semibold text-white">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Project Name</Label>
                <Input
                  value={projectInfo.projectName}
                  onChange={(e) => setProjectInfo({ ...projectInfo, projectName: e.target.value })}
                  placeholder="Building Renovation"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Location</Label>
                <Input
                  value={projectInfo.location}
                  onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
                  placeholder="123 Main St"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Test Date</Label>
                <Input
                  type="date"
                  value={projectInfo.testDate}
                  onChange={(e) => setProjectInfo({ ...projectInfo, testDate: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Technician Name</Label>
                <Input
                  value={projectInfo.technicianName}
                  onChange={(e) => setProjectInfo({ ...projectInfo, technicianName: e.target.value })}
                  placeholder="Your Name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-white">Equipment Tested</Label>
                <Input
                  value={projectInfo.equipmentTested}
                  onChange={(e) => setProjectInfo({ ...projectInfo, equipmentTested: e.target.value })}
                  placeholder="Main Distribution Panel"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
            </div>
          </div>

          {/* Add Test Result */}
          <div className="space-y-4 p-4 border-2 border-dashed border-[#9C4AFF]/40 rounded-lg glass-surface">
            <h3 className="font-semibold text-lg text-white">Add Test Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-white">Test Point</Label>
                <Input
                  value={newTest.testPoint}
                  onChange={(e) => setNewTest({ ...newTest, testPoint: e.target.value })}
                  placeholder={criteria.examples[0] || 'Test location'}
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Expected Value</Label>
                <Input
                  value={newTest.expectedValue}
                  onChange={(e) => setNewTest({ ...newTest, expectedValue: e.target.value })}
                  placeholder={criteria.passCriteria}
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Actual Value ({criteria.unit})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTest.actualValue}
                  onChange={(e) => setNewTest({ ...newTest, actualValue: e.target.value })}
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
              <div>
                <Label className="text-white">Notes</Label>
                <Input
                  value={newTest.notes}
                  onChange={(e) => setNewTest({ ...newTest, notes: e.target.value })}
                  placeholder="Optional"
                  className="bg-white/5 border-white/20 text-white placeholder:text-[#B8A7E0]/50"
                />
              </div>
            </div>
            <Button onClick={addTestResult} className="w-full gradient-violet text-white hover:shadow-glowViolet">
              Add Test Result
            </Button>
          </div>

          {/* Test Results Table */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white">Test Results ({testResults.length})</h3>
                <div className="flex gap-2">
                  <Button onClick={printReport} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={generateReport} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-gradient-to-br from-[#9C4AFF]/20 to-[#FF6B00]/20 border border-[#9C4AFF]/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-400">{passCount}</div>
                      <div className="text-sm text-[#B8A7E0]">Passed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">{failCount}</div>
                      <div className="text-sm text-[#B8A7E0]">Failed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#00E5FF]">
                        {((passCount / testResults.length) * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-[#B8A7E0]">Pass Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="gradient-violet text-white">
                      <th className="p-3 text-left rounded-tl-lg">#</th>
                      <th className="p-3 text-left">Test Point</th>
                      <th className="p-3 text-left">Expected</th>
                      <th className="p-3 text-left">Actual</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Notes</th>
                      <th className="p-3 rounded-tr-lg"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, idx) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-3 text-[#B8A7E0]">{idx + 1}</td>
                        <td className="p-3 font-medium text-white">{result.testPoint}</td>
                        <td className="p-3 text-[#B8A7E0]">{result.expectedValue}</td>
                        <td className="p-3 text-white">{result.actualValue} {criteria.unit}</td>
                        <td className="p-3">
                          {result.status === 'pass' ? (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              PASS
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                              <XCircle className="h-3 w-3" />
                              FAIL
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-[#B8A7E0]">{result.notes || '-'}</td>
                        <td className="p-3">
                          <Button
                            onClick={() => removeTest(idx)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {testResults.length === 0 && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add test results to generate your report</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}