'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CodeChange {
  id: string;
  article: string;
  title: string;
  changeType: 'new' | 'revised' | 'deleted';
  oldVersion: string;
  newVersion: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

const codeChanges: CodeChange[] = [
  {
    id: '1',
    article: '210.8(F)',
    title: 'GFCI Protection for Indoor Damp Locations',
    changeType: 'new',
    oldVersion: '',
    newVersion: 'GFCI protection required for all 125V, 15A & 20A receptacles in indoor damp and wet locations',
    summary: 'New requirement extends GFCI protection to indoor damp and wet locations beyond traditional areas',
    impact: 'high',
    category: 'Protection'
  },
  {
    id: '2',
    article: '210.12(D)',
    title: 'AFCI Protection for Dormitories',
    changeType: 'revised',
    oldVersion: 'AFCI only for dwelling units',
    newVersion: 'AFCI now required for dormitory units in addition to dwelling units',
    summary: 'Extended AFCI requirements to include dormitory installations',
    impact: 'high',
    category: 'Protection'
  },
  {
    id: '3',
    article: '210.52(C)(5)',
    title: 'Kitchen Island Receptacles',
    changeType: 'revised',
    oldVersion: 'One receptacle required for islands 12" x 24" or larger',
    newVersion: 'One receptacle required for islands 9" x 18" or larger, plus additional requirements for larger islands',
    summary: 'Lower threshold and additional requirements for kitchen island receptacles',
    impact: 'medium',
    category: 'Receptacles'
  },
  {
    id: '4',
    article: '230.67',
    title: 'Surge Protection Device (SPD)',
    changeType: 'new',
    oldVersion: '',
    newVersion: 'Surge protection device required for all dwelling unit services',
    summary: 'Mandatory surge protection at service entrance for residential installations',
    impact: 'high',
    category: 'Service Equipment'
  },
  {
    id: '5',
    article: '250.122',
    title: 'Equipment Grounding Conductor Size',
    changeType: 'revised',
    oldVersion: 'Based on overcurrent device rating',
    newVersion: 'Clarified sizing requirements with updated table and exceptions',
    summary: 'Updated grounding conductor sizing table with clearer guidance',
    impact: 'medium',
    category: 'Grounding'
  },
  {
    id: '6',
    article: '314.27(C)',
    title: 'Ceiling Fan Support Boxes',
    changeType: 'revised',
    oldVersion: 'Boxes must support 50 lbs',
    newVersion: 'Boxes must support 70 lbs for ceiling fan installations',
    summary: 'Increased weight requirement for ceiling fan support boxes',
    impact: 'medium',
    category: 'Boxes & Enclosures'
  },
  {
    id: '7',
    article: '406.12',
    title: 'Tamper-Resistant Receptacles',
    changeType: 'revised',
    oldVersion: 'Required in dwelling units',
    newVersion: 'Expanded to include child care facilities, preschools, and elementary education',
    summary: 'TR receptacle requirements extended to educational and child care facilities',
    impact: 'high',
    category: 'Receptacles'
  },
  {
    id: '8',
    article: '422.5',
    title: 'GFCI for Appliances',
    changeType: 'new',
    oldVersion: '',
    newVersion: 'GFCI protection required for appliances in outdoor locations',
    summary: 'New GFCI requirement for outdoor appliance installations',
    impact: 'medium',
    category: 'Appliances'
  }
];

export function CodeChangeTracker() {
  const [compareFrom, setCompareFrom] = useState('2020');
  const [compareTo, setCompareTo] = useState('2023');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterImpact, setFilterImpact] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const categories = ['all', ...Array.from(new Set(codeChanges.map(c => c.category)))];
  
  const filteredChanges = codeChanges.filter(change => {
    if (filterCategory !== 'all' && change.category !== filterCategory) return false;
    if (filterImpact !== 'all' && change.impact !== filterImpact) return false;
    if (filterType !== 'all' && change.changeType !== filterType) return false;
    return true;
  });

  const getChangeTypeBadge = (type: CodeChange['changeType']) => {
    const styles = {
      new: 'bg-green-100 text-green-800 border-green-300',
      revised: 'bg-blue-100 text-blue-800 border-blue-300',
      deleted: 'bg-red-100 text-red-800 border-red-300'
    };
    return (
      <Badge className={styles[type]}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const getImpactBadge = (impact: CodeChange['impact']) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={styles[impact]}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Change Tracker</CardTitle>
          <CardDescription>
            Track updates and changes in NEC editions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">From Version</label>
              <Select value={compareFrom} onValueChange={setCompareFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2017">NEC 2017</SelectItem>
                  <SelectItem value="2020">NEC 2020</SelectItem>
                  <SelectItem value="2023">NEC 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Version</label>
              <Select value={compareTo} onValueChange={setCompareTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2020">NEC 2020</SelectItem>
                  <SelectItem value="2023">NEC 2023</SelectItem>
                  <SelectItem value="2026">NEC 2026 (Draft)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Impact Level</label>
              <Select value={filterImpact} onValueChange={setFilterImpact}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Change Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="revised">Revised</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Stats */}
          <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#00C2D1]">{filteredChanges.length}</div>
                  <div className="text-sm opacity-80">Total Changes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {filteredChanges.filter(c => c.changeType === 'new').length}
                  </div>
                  <div className="text-sm opacity-80">New Requirements</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">
                    {filteredChanges.filter(c => c.changeType === 'revised').length}
                  </div>
                  <div className="text-sm opacity-80">Revisions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400">
                    {filteredChanges.filter(c => c.impact === 'high').length}
                  </div>
                  <div className="text-sm opacity-80">High Impact</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Code Changes: NEC {compareFrom} → {compareTo}
              </h3>
              <Badge variant="outline">{filteredChanges.length} changes</Badge>
            </div>

            <div className="space-y-3">
              {filteredChanges.map((change) => (
                <Card key={change.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className="bg-[#071428] text-white">
                            Article {change.article}
                          </Badge>
                          {getChangeTypeBadge(change.changeType)}
                          {getImpactBadge(change.impact)}
                          <Badge variant="outline">{change.category}</Badge>
                        </div>
                        <CardTitle className="text-lg text-[#071428]">
                          {change.title}
                        </CardTitle>
                      </div>
                      <FileText className="h-5 w-5 text-[#00C2D1] flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <p className="text-gray-700">{change.summary}</p>
                    </div>

                    {change.changeType === 'revised' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-xs font-semibold text-red-800 mb-1">
                            NEC {compareFrom}
                          </div>
                          <p className="text-sm text-gray-700">{change.oldVersion}</p>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-xs font-semibold text-green-800 mb-1">
                            NEC {compareTo}
                          </div>
                          <p className="text-sm text-gray-700">{change.newVersion}</p>
                        </div>
                      </div>
                    )}

                    {change.changeType === 'new' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                        <div className="text-xs font-semibold text-green-800 mb-1">
                          NEW in NEC {compareTo}
                        </div>
                        <p className="text-sm text-gray-700">{change.newVersion}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredChanges.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  No changes found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
