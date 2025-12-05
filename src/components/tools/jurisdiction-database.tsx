'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, AlertCircle, Phone, Globe, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Jurisdiction {
  id: string;
  name: string;
  state: string;
  county: string;
  necVersion: string;
  amendments: string[];
  permitRequired: boolean;
  inspectionRequired: boolean;
  electricianLicenseRequired: boolean;
  contactPhone: string;
  website: string;
  notes: string;
}

const jurisdictions: Jurisdiction[] = [
  {
    id: '1',
    name: 'Los Angeles County',
    state: 'California',
    county: 'Los Angeles',
    necVersion: '2020',
    amendments: [
      'Solar PV installations require additional permits',
      'EV charging stations must meet CA Title 24',
      'Enhanced seismic requirements for electrical equipment'
    ],
    permitRequired: true,
    inspectionRequired: true,
    electricianLicenseRequired: true,
    contactPhone: '(213) 974-2541',
    website: 'lacounty.gov/building',
    notes: 'All permits must be filed online. Expect 2-3 week processing time.'
  },
  {
    id: '2',
    name: 'Cook County',
    state: 'Illinois',
    county: 'Cook',
    necVersion: '2023',
    amendments: [
      'GFCI required for all garages (no exceptions)',
      'Surge protection mandatory for all services',
      'Additional requirements for high-rise buildings'
    ],
    permitRequired: true,
    inspectionRequired: true,
    electricianLicenseRequired: true,
    contactPhone: '(312) 603-3456',
    website: 'cookcountyil.gov/permits',
    notes: 'Chicago has additional city-specific requirements beyond county code.'
  },
  {
    id: '3',
    name: 'Miami-Dade County',
    state: 'Florida',
    county: 'Miami-Dade',
    necVersion: '2020',
    amendments: [
      'Hurricane-rated equipment required',
      'Enhanced grounding for coastal installations',
      'Underground service entrance mandatory in flood zones'
    ],
    permitRequired: true,
    inspectionRequired: true,
    electricianLicenseRequired: true,
    contactPhone: '(786) 315-2000',
    website: 'miamidade.gov/permits',
    notes: 'Special wind load requirements per Florida Building Code.'
  },
  {
    id: '4',
    name: 'King County',
    state: 'Washington',
    county: 'King',
    necVersion: '2023',
    amendments: [
      'EV-ready requirements for new construction',
      'Enhanced energy efficiency standards',
      'Smart home pre-wiring encouraged'
    ],
    permitRequired: true,
    inspectionRequired: true,
    electricianLicenseRequired: true,
    contactPhone: '(206) 296-6600',
    website: 'kingcounty.gov/permits',
    notes: 'Green building incentives available for qualifying projects.'
  },
  {
    id: '5',
    name: 'Harris County',
    state: 'Texas',
    county: 'Harris',
    necVersion: '2020',
    amendments: [
      'Generator installations require special permits',
      'Pool and spa bonding enhanced requirements',
      'Temporary power restrictions during events'
    ],
    permitRequired: true,
    inspectionRequired: true,
    electricianLicenseRequired: true,
    contactPhone: '(713) 274-2000',
    website: 'hctx.net/permits',
    notes: 'Houston city limits have different requirements - verify location.'
  }
];

export function JurisdictionDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null);

  const filteredJurisdictions = jurisdictions.filter(j => 
    j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.county.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10 backdrop-blur-glass">
        <CardHeader>
          <CardTitle className="text-white">Jurisdiction Database</CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Find local code requirements and contact information by location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8A7E0] h-5 w-5" />
              <Input
                placeholder="Search by city, county, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
              />
            </div>
            <Button className="gradient-aqua text-white hover:shadow-glowCyan">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Results Grid */}
          {searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJurisdictions.map((jurisdiction) => (
                <Card
                  key={jurisdiction.id}
                  className="cursor-pointer glass-surface border-white/10 backdrop-blur-glass hover:border-[#00E5FF]/50 transition-all"
                  onClick={() => setSelectedJurisdiction(jurisdiction)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg text-white">{jurisdiction.name}</CardTitle>
                        <p className="text-sm text-[#B8A7E0] mt-1">
                          {jurisdiction.county} County, {jurisdiction.state}
                        </p>
                      </div>
                      <Badge className="bg-[#9C4AFF]/20 text-[#9C4AFF] border-[#9C4AFF]/30">
                        NEC {jurisdiction.necVersion}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {jurisdiction.permitRequired ? (
                          <Badge className="bg-green-500/20 text-green-300 text-xs border-green-500/30">Permit Required</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300 text-xs border-gray-500/30">No Permit</Badge>
                        )}
                        {jurisdiction.inspectionRequired && (
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs border-blue-500/30">Inspection Required</Badge>
                        )}
                      </div>
                      <p className="text-[#B8A7E0]">
                        {jurisdiction.amendments.length} local amendments
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selected Jurisdiction Details */}
          {selectedJurisdiction && (
            <Card className="border-2 border-[#00E5FF]/50 glass-surface backdrop-blur-glass">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white">{selectedJurisdiction.name}</CardTitle>
                    <p className="text-[#B8A7E0] mt-1">
                      {selectedJurisdiction.county} County, {selectedJurisdiction.state}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedJurisdiction(null)}
                    className="text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 p-4 glass-surface border border-white/10 rounded-lg">
                  <div>
                    <Label className="text-sm text-[#B8A7E0]">NEC Version</Label>
                    <p className="font-semibold text-white">NEC {selectedJurisdiction.necVersion}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#B8A7E0]">License Required</Label>
                    <p className="font-semibold text-white">
                      {selectedJurisdiction.electricianLicenseRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                    <Phone className="h-5 w-5 text-[#00E5FF]" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#B8A7E0]" />
                      <a href={`tel:${selectedJurisdiction.contactPhone}`} className="text-[#00E5FF] hover:underline">
                        {selectedJurisdiction.contactPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[#B8A7E0]" />
                      <a
                        href={`https://${selectedJurisdiction.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00E5FF] hover:underline"
                      >
                        {selectedJurisdiction.website}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Local Amendments */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5 text-[#00E5FF]" />
                    Local Amendments & Requirements
                  </h3>
                  <div className="space-y-2">
                    {selectedJurisdiction.amendments.map((amendment, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/90">{amendment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedJurisdiction.notes && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-yellow-300 mb-1">Important Note</h4>
                        <p className="text-sm text-white/90">{selectedJurisdiction.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Requirements Summary */}
                <Card className="bg-gradient-to-br from-[#2B0B4B]/80 to-[#1A0033]/90 border-[#00E5FF]/30">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-[#00E5FF]">
                          {selectedJurisdiction.permitRequired ? 'YES' : 'NO'}
                        </div>
                        <div className="text-sm text-white/80">Permit Required</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#00E5FF]">
                          {selectedJurisdiction.inspectionRequired ? 'YES' : 'NO'}
                        </div>
                        <div className="text-sm text-white/80">Inspection Required</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#00E5FF]">
                          {selectedJurisdiction.electricianLicenseRequired ? 'YES' : 'NO'}
                        </div>
                        <div className="text-sm text-white/80">License Required</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!searchQuery && !selectedJurisdiction && (
            <Card className="bg-gradient-to-br from-[#2B0B4B]/80 to-[#1A0033]/90 border-[#00E5FF]/30">
              <CardContent className="py-12">
                <MapPin className="h-16 w-16 text-[#00E5FF] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center mb-3 text-white">
                  Search for Your Jurisdiction
                </h3>
                <p className="text-[#B8A7E0] text-center max-w-2xl mx-auto">
                  Find local electrical code requirements, amendments, and contact information
                  for building departments across the United States
                </p>
              </CardContent>
            </Card>
          )}

          {searchQuery && filteredJurisdictions.length === 0 && (
            <Card className="border-2 border-dashed border-white/20 glass-surface backdrop-blur-glass">
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 text-[#B8A7E0] mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-lg text-white mb-2">
                  No jurisdictions found
                </h3>
                <p className="text-[#B8A7E0]">
                  Try searching with different keywords
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}