'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PowerQualityData {
  parameter: string;
  value: number;
  unit: string;
  ideal: string;
  status: 'good' | 'warning' | 'critical';
  impact: string;
}

export function PowerQualityReporter() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityData, setQualityData] = useState<PowerQualityData[]>([]);

  const generatePowerQualityReport = (scenario: 'good' | 'issues' | 'critical') => {
    setIsAnalyzing(true);

    setTimeout(() => {
      let data: PowerQualityData[] = [];

      if (scenario === 'good') {
        data = [
          {
            parameter: 'Voltage Level (L1-N)',
            value: 120.2,
            unit: 'V',
            ideal: '120V ±5%',
            status: 'good',
            impact: 'Within acceptable range'
          },
          {
            parameter: 'Voltage Level (L2-N)',
            value: 119.8,
            unit: 'V',
            ideal: '120V ±5%',
            status: 'good',
            impact: 'Within acceptable range'
          },
          {
            parameter: 'Frequency',
            value: 60.0,
            unit: 'Hz',
            ideal: '60Hz ±0.1Hz',
            status: 'good',
            impact: 'Stable frequency'
          },
          {
            parameter: 'Total Harmonic Distortion (THD)',
            value: 2.8,
            unit: '%',
            ideal: '<5%',
            status: 'good',
            impact: 'Minimal harmonic distortion'
          },
          {
            parameter: 'Power Factor',
            value: 0.95,
            unit: '',
            ideal: '>0.90',
            status: 'good',
            impact: 'Excellent power factor'
          },
          {
            parameter: 'Voltage Unbalance',
            value: 0.8,
            unit: '%',
            ideal: '<2%',
            status: 'good',
            impact: 'Well balanced'
          }
        ];
      } else if (scenario === 'issues') {
        data = [
          {
            parameter: 'Voltage Level (L1-N)',
            value: 126.5,
            unit: 'V',
            ideal: '120V ±5%',
            status: 'warning',
            impact: 'Slightly high - may reduce equipment life'
          },
          {
            parameter: 'Voltage Level (L2-N)',
            value: 118.2,
            unit: 'V',
            ideal: '120V ±5%',
            status: 'good',
            impact: 'Within acceptable range'
          },
          {
            parameter: 'Frequency',
            value: 59.95,
            unit: 'Hz',
            ideal: '60Hz ±0.1Hz',
            status: 'good',
            impact: 'Stable frequency'
          },
          {
            parameter: 'Total Harmonic Distortion (THD)',
            value: 7.2,
            unit: '%',
            ideal: '<5%',
            status: 'warning',
            impact: 'Moderate harmonics - check non-linear loads'
          },
          {
            parameter: 'Power Factor',
            value: 0.82,
            unit: '',
            ideal: '>0.90',
            status: 'warning',
            impact: 'Low PF - consider power factor correction'
          },
          {
            parameter: 'Voltage Unbalance',
            value: 2.5,
            unit: '%',
            ideal: '<2%',
            status: 'warning',
            impact: 'Moderate imbalance - check phase loading'
          }
        ];
      } else { // critical
        data = [
          {
            parameter: 'Voltage Level (L1-N)',
            value: 132.4,
            unit: 'V',
            ideal: '120V ±5%',
            status: 'critical',
            impact: 'Overvoltage - immediate attention required'
          },
          {
            parameter: 'Voltage Level (L2-N)',
            value: 112.1,
            unit: 'V',
            ideal: '120V ±5%',
            status: 'critical',
            impact: 'Undervoltage - equipment may not operate properly'
          },
          {
            parameter: 'Frequency',
            value: 59.82,
            unit: 'Hz',
            ideal: '60Hz ±0.1Hz',
            status: 'warning',
            impact: 'Frequency deviation detected'
          },
          {
            parameter: 'Total Harmonic Distortion (THD)',
            value: 12.5,
            unit: '%',
            ideal: '<5%',
            status: 'critical',
            impact: 'High harmonics - equipment damage risk'
          },
          {
            parameter: 'Power Factor',
            value: 0.68,
            unit: '',
            ideal: '>0.90',
            status: 'critical',
            impact: 'Very low PF - utility penalties likely'
          },
          {
            parameter: 'Voltage Unbalance',
            value: 4.2,
            unit: '%',
            ideal: '<2%',
            status: 'critical',
            impact: 'High imbalance - motor overheating risk'
          }
        ];
      }

      setQualityData(data);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getStatusIcon = (status: PowerQualityData['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: PowerQualityData['status']) => {
    switch (status) {
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
    }
  };

  const goodCount = qualityData.filter(d => d.status === 'good').length;
  const warningCount = qualityData.filter(d => d.status === 'warning').length;
  const criticalCount = qualityData.filter(d => d.status === 'critical').length;

  const getOverallStatus = () => {
    if (criticalCount > 0) return { status: 'Critical Issues Detected', color: 'text-red-600', icon: AlertTriangle };
    if (warningCount > 0) return { status: 'Warnings Detected', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'Good Power Quality', color: 'text-green-600', icon: CheckCircle2 };
  };

  const overall = getOverallStatus();
  const OverallIcon = overall.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Power Quality Reporter</CardTitle>
          <CardDescription>
            Analyze and interpret power quality measurements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Data Selection */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Analyze Power Quality Data</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => generatePowerQualityReport('good')}
                disabled={isAnalyzing}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Good Quality</div>
                  <div className="text-xs text-gray-500 mt-1">No issues</div>
                </div>
              </Button>
              <Button
                onClick={() => generatePowerQualityReport('issues')}
                disabled={isAnalyzing}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="font-semibold">Minor Issues</div>
                  <div className="text-xs text-gray-500 mt-1">Some warnings</div>
                </div>
              </Button>
              <Button
                onClick={() => generatePowerQualityReport('critical')}
                disabled={isAnalyzing}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="font-semibold">Critical Issues</div>
                  <div className="text-xs text-gray-500 mt-1">Needs attention</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Results */}
          {qualityData.length > 0 && (
            <>
              {/* Overall Status */}
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <OverallIcon className="h-8 w-8 text-[#00C2D1]" />
                      <div>
                        <div className="text-2xl font-bold">{overall.status}</div>
                        <div className="text-sm opacity-80">Power Quality Assessment</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-400">{goodCount}</div>
                      <div className="text-sm opacity-80">Good</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
                      <div className="text-sm opacity-80">Warnings</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
                      <div className="text-sm opacity-80">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parameter Cards */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Detailed Parameters</h3>
                {qualityData.map((data, idx) => (
                  <Card key={idx} className={`border-2 ${getStatusColor(data.status)}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(data.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-semibold text-lg">{data.parameter}</h4>
                            <Badge variant="outline" className="flex-shrink-0">
                              Ideal: {data.ideal}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-600">Measured Value</div>
                              <div className="text-2xl font-bold text-[#071428]">
                                {data.value} {data.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Status</div>
                              <div className={`text-lg font-semibold capitalize ${
                                data.status === 'good' ? 'text-green-600' :
                                data.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {data.status}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 p-3 bg-white rounded-lg">
                            <strong>Impact:</strong> {data.impact}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              {(warningCount > 0 || criticalCount > 0) && (
                <Card className="border-2 border-[#00C2D1]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[#00C2D1]" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {criticalCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-red-900 mb-1">Immediate Action Required</div>
                          <div className="text-gray-700 space-y-1">
                            <div>• Contact utility company to address voltage issues</div>
                            <div>• Inspect and test sensitive equipment</div>
                            <div>• Consider installing voltage regulators or UPS systems</div>
                            <div>• Implement harmonic filtering solutions</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {warningCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-yellow-900 mb-1">Preventive Measures</div>
                          <div className="text-gray-700 space-y-1">
                            <div>• Schedule power quality audit</div>
                            <div>• Review and balance phase loading</div>
                            <div>• Consider power factor correction capacitors</div>
                            <div>• Monitor trends for early detection of issues</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Gauge className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-semibold text-blue-900 mb-1">General Recommendations</div>
                        <div className="text-gray-700 space-y-1">
                          <div>• Install continuous power quality monitoring</div>
                          <div>• Maintain detailed logs of power quality events</div>
                          <div>• Conduct quarterly power quality assessments</div>
                          <div>• Train staff on power quality awareness</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {qualityData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Gauge className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select a scenario to generate power quality report</p>
              <p className="text-sm mt-2">Or upload your power quality meter data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
