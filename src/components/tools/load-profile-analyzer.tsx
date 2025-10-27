'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BarChart, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LoadData {
  hour: number;
  load: number;
}

export function LoadProfileAnalyzer() {
  const [loadData, setLoadData] = useState<LoadData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateSampleData = (pattern: 'commercial' | 'residential' | 'industrial') => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const data: LoadData[] = [];
      
      for (let hour = 0; hour < 24; hour++) {
        let load = 0;
        
        if (pattern === 'commercial') {
          // Peak during business hours
          if (hour >= 8 && hour <= 18) {
            load = 70 + Math.random() * 30;
          } else {
            load = 20 + Math.random() * 20;
          }
        } else if (pattern === 'residential') {
          // Morning and evening peaks
          if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 22)) {
            load = 60 + Math.random() * 40;
          } else {
            load = 15 + Math.random() * 25;
          }
        } else { // industrial
          // Steady load during shifts
          if (hour >= 7 && hour <= 23) {
            load = 75 + Math.random() * 20;
          } else {
            load = 40 + Math.random() * 15;
          }
        }
        
        data.push({ hour, load: Math.round(load) });
      }
      
      setLoadData(data);
      setIsAnalyzing(false);
    }, 1000);
  };

  const analyzeLoadProfile = () => {
    if (loadData.length === 0) return null;

    const loads = loadData.map(d => d.load);
    const peakLoad = Math.max(...loads);
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const minLoad = Math.min(...loads);
    const loadFactor = (avgLoad / peakLoad) * 100;
    
    const peakHour = loadData.find(d => d.load === peakLoad)?.hour || 0;
    const minHour = loadData.find(d => d.load === minLoad)?.hour || 0;

    return {
      peakLoad,
      avgLoad,
      minLoad,
      loadFactor,
      peakHour,
      minHour,
      demandCharge: peakLoad * 15, // $15 per kW
      energyCharge: avgLoad * 24 * 0.12 // $0.12 per kWh
    };
  };

  const getLoadFactorStatus = (loadFactor: number) => {
    if (loadFactor >= 70) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (loadFactor >= 50) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (loadFactor >= 30) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${ampm}`;
  };

  const analysis = analyzeLoadProfile();
  const maxBarHeight = 200;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Load Profile Analyzer</CardTitle>
          <CardDescription>
            Analyze electrical load patterns and optimize energy usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pattern Selection */}
          <div className="space-y-4">
            <Label>Load Sample Data (or upload meter data)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => generateSampleData('commercial')}
                disabled={isAnalyzing}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <div className="font-semibold">Commercial Building</div>
                  <div className="text-xs text-gray-500 mt-1">Peak: 8AM-6PM</div>
                </div>
              </Button>
              <Button
                onClick={() => generateSampleData('residential')}
                disabled={isAnalyzing}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <div className="font-semibold">Residential</div>
                  <div className="text-xs text-gray-500 mt-1">Morning/Evening Peaks</div>
                </div>
              </Button>
              <Button
                onClick={() => generateSampleData('industrial')}
                disabled={isAnalyzing}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <div className="font-semibold">Industrial Facility</div>
                  <div className="text-xs text-gray-500 mt-1">Steady Load</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Load Profile Chart */}
          {loadData.length > 0 && analysis && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">24-Hour Load Profile</h3>
                <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
                  <div className="flex items-end gap-1 min-w-max" style={{ height: maxBarHeight + 40 }}>
                    {loadData.map((data, idx) => {
                      const barHeight = (data.load / analysis.peakLoad) * maxBarHeight;
                      const isPeak = data.load === analysis.peakLoad;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 min-w-[30px]">
                          <div className="text-xs font-semibold mb-1 text-[#00C2D1]">
                            {data.load}
                          </div>
                          <div
                            className={`w-full rounded-t transition-all ${
                              isPeak ? 'bg-red-500' : 'bg-[#00C2D1]'
                            }`}
                            style={{ height: `${barHeight}px` }}
                            title={`${formatHour(data.hour)}: ${data.load} kW`}
                          />
                          <div className="text-xs text-gray-600 mt-1">
                            {formatHour(data.hour)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#00C2D1] rounded"></div>
                      <span>Normal Load</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Peak Load</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Results */}
              <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-[#00C2D1]" />
                    Load Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm opacity-80">Peak Load</div>
                      <div className="text-2xl font-bold text-[#00C2D1]">{analysis.peakLoad} kW</div>
                      <div className="text-xs opacity-60">at {formatHour(analysis.peakHour)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Average Load</div>
                      <div className="text-2xl font-bold">{analysis.avgLoad.toFixed(1)} kW</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Minimum Load</div>
                      <div className="text-2xl font-bold">{analysis.minLoad} kW</div>
                      <div className="text-xs opacity-60">at {formatHour(analysis.minHour)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Load Factor</div>
                      <div className="text-2xl font-bold text-[#00C2D1]">{analysis.loadFactor.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Load Factor Assessment */}
              <Card className={getLoadFactorStatus(analysis.loadFactor).bg}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <TrendingUp className={`h-8 w-8 ${getLoadFactorStatus(analysis.loadFactor).color}`} />
                    <div className="flex-1">
                      <h4 className={`font-semibold text-lg mb-2 ${getLoadFactorStatus(analysis.loadFactor).color}`}>
                        Load Factor: {getLoadFactorStatus(analysis.loadFactor).status}
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        {analysis.loadFactor >= 70 && 'Excellent load factor! Your facility has efficient and consistent energy usage.'}
                        {analysis.loadFactor >= 50 && analysis.loadFactor < 70 && 'Good load factor. Some opportunity for optimization exists.'}
                        {analysis.loadFactor >= 30 && analysis.loadFactor < 50 && 'Fair load factor. Consider load shifting strategies.'}
                        {analysis.loadFactor < 30 && 'Low load factor. Significant demand charges likely. Load management recommended.'}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Energy Charge</Badge>
                          <span className="font-semibold">${analysis.energyCharge.toFixed(2)}/day</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Demand Charge</Badge>
                          <span className="font-semibold">${analysis.demandCharge.toFixed(2)}/month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-2 border-[#00C2D1]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#00C2D1]" />
                    Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900 mb-1">Peak Shaving Opportunity</div>
                      <div className="text-gray-700">
                        Shift {((analysis.peakLoad - analysis.avgLoad) * 0.3).toFixed(1)} kW of non-critical loads 
                        away from {formatHour(analysis.peakHour)} to reduce demand charges by approximately 
                        ${(((analysis.peakLoad - analysis.avgLoad) * 0.3) * 15).toFixed(0)}/month.
                      </div>
                    </div>
                  </div>

                  {analysis.loadFactor < 50 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-semibold text-yellow-900 mb-1">Load Balancing</div>
                        <div className="text-gray-700">
                          Consider implementing energy storage or scheduling equipment operation during off-peak hours 
                          to improve load factor and reduce costs.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-green-900 mb-1">Time-of-Use Rate</div>
                      <div className="text-gray-700">
                        Review if your utility offers time-of-use rates. With your load profile, 
                        you could potentially save by optimizing usage during off-peak periods.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {loadData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BarChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select a load pattern to analyze or upload your meter data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
