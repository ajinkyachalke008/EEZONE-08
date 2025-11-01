'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Award,
  Briefcase,
  GraduationCap,
  Code,
} from 'lucide-react';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  certifications: string[];
}

const templates = [
  { id: 'modern', name: 'Modern Tech', color: 'violet', preview: '📄' },
  { id: 'professional', name: 'Professional', color: 'cyan', preview: '📋' },
  { id: 'minimalist', name: 'Minimalist', color: 'orange', preview: '📝' },
];

export function ResumeBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  });

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { title: '', company: '', duration: '', description: '' },
      ],
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { degree: '', institution: '', year: '' },
      ],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="glass-surface border-2 border-[#9C4AFF]/30 shadow-glowViolet">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#9C4AFF]" />
              Resume Builder
            </CardTitle>
            <CardDescription className="text-[#B8A7E0]">
              Create an ATS-optimized resume tailored for electrical engineering positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="glass-surface border border-white/10 p-1 grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="data-[state=active]:gradient-violet data-[state=active]:text-white">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="experience" className="data-[state=active]:gradient-fire data-[state=active]:text-white">
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:gradient-aqua data-[state=active]:text-white">
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:gradient-violet data-[state=active]:text-white">
                  Skills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                      })}
                      className="glass-surface border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                      })}
                      className="glass-surface border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Phone</Label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                      })}
                      className="glass-surface border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Location</Label>
                    <Input
                      placeholder="San Francisco, CA"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                      })}
                      className="glass-surface border-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Professional Summary</Label>
                  <Textarea
                    placeholder="Experienced electrical engineer with expertise in..."
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="glass-surface border-white/20 text-white min-h-[120px]"
                  />
                  <Button variant="ghost" size="sm" className="text-[#9C4AFF] hover:text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <Card key={index} className="glass-surface border-white/10">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold">Experience #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExp = [...resumeData.experience];
                            newExp.splice(index, 1);
                            setResumeData({ ...resumeData, experience: newExp });
                          }}
                          className="text-[#FF6B00] hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Job Title"
                          className="glass-surface border-white/20 text-white"
                        />
                        <Input
                          placeholder="Company"
                          className="glass-surface border-white/20 text-white"
                        />
                      </div>
                      <Input
                        placeholder="Duration (e.g., Jan 2020 - Present)"
                        className="glass-surface border-white/20 text-white"
                      />
                      <Textarea
                        placeholder="• Designed and implemented..."
                        className="glass-surface border-white/20 text-white"
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addExperience} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <Card key={index} className="glass-surface border-white/10">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold">Education #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newEdu = [...resumeData.education];
                            newEdu.splice(index, 1);
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          className="text-[#FF6B00] hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Degree (e.g., B.S. Electrical Engineering)"
                        className="glass-surface border-white/20 text-white"
                      />
                      <Input
                        placeholder="Institution"
                        className="glass-surface border-white/20 text-white"
                      />
                      <Input
                        placeholder="Graduation Year"
                        className="glass-surface border-white/20 text-white"
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addEducation} variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-white">Technical Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Circuit Design', 'PLC Programming', 'AutoCAD', 'MATLAB', 'Python', 'Power Systems', 'NEC Codes', 'PCB Design'].map((skill) => (
                      <Badge key={skill} className="gradient-aqua text-white border-0 cursor-pointer">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add custom skill..."
                    className="glass-surface border-white/20 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-white">Certifications</Label>
                  <div className="space-y-2">
                    {['Professional Engineer (PE)', 'FE Electrical', 'Master Electrician'].map((cert) => (
                      <div key={cert} className="flex items-center gap-2 p-3 glass-surface rounded-lg border border-white/10">
                        <Award className="h-5 w-5 text-[#9C4AFF]" />
                        <span className="text-white">{cert}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Templates Section */}
      <div className="space-y-6">
        {/* Template Selection */}
        <Card className="glass-surface border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Choose Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-2 border-[#9C4AFF] shadow-glowViolet gradient-violet'
                      : 'glass-surface border-white/10 hover:border-[#9C4AFF]/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-3xl">{template.preview}</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${selectedTemplate === template.id ? 'text-white' : 'text-white'}`}>
                        {template.name}
                      </h4>
                      {selectedTemplate === template.id && (
                        <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Selected
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="glass-surface border-2 border-[#00E5FF]/30 shadow-glowCyan">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#00E5FF]" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[8.5/11] bg-white rounded-lg p-6 overflow-auto">
              <div className="space-y-4 text-black">
                <div className="border-b-2 border-gray-300 pb-4">
                  <h1 className="text-2xl font-bold">{resumeData.personalInfo.name || 'Your Name'}</h1>
                  <p className="text-sm text-gray-600">
                    {resumeData.personalInfo.email || 'email@example.com'} | 
                    {resumeData.personalInfo.phone || ' +1 (555) 123-4567'}
                  </p>
                </div>
                {resumeData.summary && (
                  <div>
                    <h2 className="text-lg font-bold mb-2">Professional Summary</h2>
                    <p className="text-sm">{resumeData.summary}</p>
                  </div>
                )}
                <div className="text-xs text-gray-400 text-center">
                  Preview updates in real-time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="glass-surface border-white/10">
          <CardContent className="p-4 space-y-3">
            <Button className="w-full gradient-fire hover:shadow-glowOrange text-white font-semibold">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize with AI
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="glass-surface border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#FF6B00]" />
              Resume Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#B8A7E0]">
            <p>✓ Use action verbs (Designed, Implemented, Optimized)</p>
            <p>✓ Quantify achievements with numbers</p>
            <p>✓ Tailor for each job application</p>
            <p>✓ Keep it to 1-2 pages maximum</p>
            <p>✓ Include relevant keywords from job posting</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
