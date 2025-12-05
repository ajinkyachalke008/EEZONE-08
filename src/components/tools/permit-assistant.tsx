'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermitApplication {
  projectType: string;
  location: string;
  scopeOfWork: string;
  ownerName: string;
  ownerAddress: string;
  contractorName: string;
  contractorLicense: string;
  estimatedCost: string;
  serviceSize: string;
  panelUpgrade: boolean;
  newCircuits: string;
  additionalInfo: string;
}

interface RequiredDocument {
  name: string;
  required: boolean;
  description: string;
}

export function PermitAssistant() {
  const [application, setApplication] = useState<PermitApplication>({
    projectType: 'residential',
    location: '',
    scopeOfWork: '',
    ownerName: '',
    ownerAddress: '',
    contractorName: '',
    contractorLicense: '',
    estimatedCost: '',
    serviceSize: '200',
    panelUpgrade: false,
    newCircuits: '',
    additionalInfo: ''
  });

  const [showChecklist, setShowChecklist] = useState(false);

  const getRequiredDocuments = (): RequiredDocument[] => {
    const docs: RequiredDocument[] = [
      {
        name: 'Site Plan / Plot Plan',
        required: true,
        description: 'Shows property boundaries, structures, and service entrance location'
      },
      {
        name: 'Single Line Diagram',
        required: true,
        description: 'Electrical system diagram showing main service, panels, and major circuits'
      },
      {
        name: 'Load Calculation',
        required: application.projectType === 'commercial' || application.panelUpgrade,
        description: 'NEC Article 220 compliant load calculation worksheet'
      },
      {
        name: 'Equipment Specifications',
        required: true,
        description: 'Cut sheets for panels, breakers, and major equipment'
      },
      {
        name: 'Contractor License',
        required: true,
        description: 'Valid electrical contractor license and insurance certificate'
      },
      {
        name: 'Manufacturer Certifications',
        required: application.projectType === 'commercial',
        description: 'UL listings and certifications for commercial equipment'
      },
      {
        name: 'Energy Compliance Forms',
        required: application.projectType === 'commercial',
        description: 'Title 24 or local energy code compliance documentation'
      },
      {
        name: 'Structural Calculations',
        required: application.panelUpgrade && application.projectType === 'commercial',
        description: 'For heavy equipment installations or seismic requirements'
      }
    ];

    return docs;
  };

  const generateChecklist = () => {
    setShowChecklist(true);
  };

  const exportApplication = () => {
    const docs = getRequiredDocuments();
    const application_text = `
ELECTRICAL PERMIT APPLICATION
Generated: ${new Date().toLocaleString()}

PROJECT INFORMATION:
- Project Type: ${application.projectType.toUpperCase()}
- Location: ${application.location}
- Estimated Cost: $${application.estimatedCost}

OWNER INFORMATION:
- Name: ${application.ownerName}
- Address: ${application.ownerAddress}

CONTRACTOR INFORMATION:
- Name: ${application.contractorName}
- License #: ${application.contractorLicense}

SCOPE OF WORK:
${application.scopeOfWork}

SERVICE DETAILS:
- Service Size: ${application.serviceSize} Amperes
- Panel Upgrade: ${application.panelUpgrade ? 'YES' : 'NO'}
- New Circuits: ${application.newCircuits}

ADDITIONAL INFORMATION:
${application.additionalInfo || 'None'}

REQUIRED DOCUMENTS CHECKLIST:
${docs.map((doc, idx) => `
${idx + 1}. ${doc.name} ${doc.required ? '[REQUIRED]' : '[Optional]'}
   ${doc.description}
`).join('\n')}

NOTES:
- All documents must be submitted with the application
- Plans must be signed and stamped by a licensed professional (if required)
- Permit must be posted on site during construction
- Inspections required at: rough-in, final, and any special conditions
    `.trim();

    const blob = new Blob([application_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permit_application.txt';
    a.click();
  };

  const requiredDocs = getRequiredDocuments();
  const requiredCount = requiredDocs.filter(d => d.required).length;
  const completionPercentage = application.ownerName && application.location && application.scopeOfWork ? 60 : 30;

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10 backdrop-blur-glass">
        <CardHeader>
          <CardTitle className="text-white">Permit Application Assistant</CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Prepare electrical permit applications with guided assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <Card className="bg-gradient-to-br from-[#2B0B4B]/80 to-[#1A0033]/90 border-[#00E5FF]/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Application Progress</span>
                <span className="font-semibold text-white">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-[#00E5FF] h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Project Type</Label>
                <Select value={application.projectType} onValueChange={(value) => setApplication({...application, projectType: value})}>
                  <SelectTrigger className="glass-surface border-white/20 text-white">
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
                <Label className="text-white">Service Size (Amperes)</Label>
                <Select value={application.serviceSize} onValueChange={(value) => setApplication({...application, serviceSize: value})}>
                  <SelectTrigger className="glass-surface border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100A</SelectItem>
                    <SelectItem value="200">200A</SelectItem>
                    <SelectItem value="400">400A</SelectItem>
                    <SelectItem value="600">600A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">Project Location/Address</Label>
                <Input
                  value={application.location}
                  onChange={(e) => setApplication({...application, location: e.target.value})}
                  placeholder="123 Main St, City, State ZIP"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>

              <div>
                <Label className="text-white">Estimated Project Cost</Label>
                <Input
                  type="number"
                  value={application.estimatedCost}
                  onChange={(e) => setApplication({...application, estimatedCost: e.target.value})}
                  placeholder="5000"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>

              <div>
                <Label className="text-white">Number of New Circuits</Label>
                <Input
                  value={application.newCircuits}
                  onChange={(e) => setApplication({...application, newCircuits: e.target.value})}
                  placeholder="e.g., 4"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-white">Scope of Work</Label>
                <Textarea
                  value={application.scopeOfWork}
                  onChange={(e) => setApplication({...application, scopeOfWork: e.target.value})}
                  placeholder="Describe the electrical work to be performed..."
                  rows={3}
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={application.panelUpgrade}
                    onChange={(e) => setApplication({...application, panelUpgrade: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-white">Panel Upgrade / Service Change</span>
                </label>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Owner Name</Label>
                <Input
                  value={application.ownerName}
                  onChange={(e) => setApplication({...application, ownerName: e.target.value})}
                  placeholder="John Doe"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>

              <div>
                <Label className="text-white">Owner Address</Label>
                <Input
                  value={application.ownerAddress}
                  onChange={(e) => setApplication({...application, ownerAddress: e.target.value})}
                  placeholder="123 Owner St, City, State ZIP"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>
            </div>
          </div>

          {/* Contractor Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Contractor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Contractor Name</Label>
                <Input
                  value={application.contractorName}
                  onChange={(e) => setApplication({...application, contractorName: e.target.value})}
                  placeholder="ABC Electrical Services"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>

              <div>
                <Label className="text-white">Contractor License Number</Label>
                <Input
                  value={application.contractorLicense}
                  onChange={(e) => setApplication({...application, contractorLicense: e.target.value})}
                  placeholder="EC-12345"
                  className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Additional Information</h3>
            <Textarea
              value={application.additionalInfo}
              onChange={(e) => setApplication({...application, additionalInfo: e.target.value})}
              placeholder="Any special conditions, requirements, or notes..."
              rows={3}
              className="glass-surface border-white/20 text-white placeholder:text-[#B8A7E0]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={generateChecklist}
              className="flex-1 gradient-aqua text-white hover:shadow-glowCyan"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Generate Document Checklist
            </Button>
            <Button onClick={exportApplication} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              <Download className="h-4 w-4 mr-2" />
              Export Application
            </Button>
          </div>

          {/* Document Checklist */}
          {showChecklist && (
            <div className="space-y-4">
              <Card className="border-2 border-[#00E5FF]/50 glass-surface backdrop-blur-glass">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Required Documents Checklist</CardTitle>
                  <CardDescription className="text-[#B8A7E0]">
                    {requiredCount} required documents for your {application.projectType} project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requiredDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 glass-surface border border-white/10 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {doc.required ? (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h4 className="font-semibold text-white">{doc.name}</h4>
                          {doc.required ? (
                            <Badge className="bg-red-500/20 text-red-300 text-xs border-red-500/30">Required</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20">Optional</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#B8A7E0]">{doc.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card className="bg-yellow-500/10 border-yellow-500/30 glass-surface backdrop-blur-glass">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <h4 className="font-semibold text-yellow-300">Important Reminders</h4>
                      <ul className="space-y-1 text-white/90 list-disc list-inside">
                        <li>All plans must be signed and sealed by a licensed professional (where required)</li>
                        <li>Permit must be posted at the job site in a visible location</li>
                        <li>Schedule inspections at proper stages: rough-in, final, and special conditions</li>
                        <li>Keep permit card accessible for inspector</li>
                        <li>Verify local amendments and additional requirements with your AHJ</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}