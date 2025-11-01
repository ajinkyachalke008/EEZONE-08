'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Award,
  MapPin,
  DollarSign,
  Star,
  Building2,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Zap,
  Brain,
  Sparkles,
  Download,
  Eye,
  Calendar,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  Palette,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { StudyPlanGenerator } from '@/components/career/study-plan-generator';
import { ResumeBuilder } from '@/components/career/resume-builder';
import { InterviewPrep } from '@/components/career/interview-prep';

const certifications = [
  {
    id: 'fe-electrical',
    title: 'FE Electrical Exam',
    description: 'Fundamentals of Engineering certification',
    level: 'Entry Level',
    duration: '8-12 weeks',
    questions: 110,
    icon: GraduationCap,
    color: 'violet',
    features: ['Full exam simulator', 'Video solutions', 'Progress tracking', 'Study schedule'],
  },
  {
    id: 'pe-power',
    title: 'PE Power Exam',
    description: 'Professional Engineer Power Systems',
    level: 'Professional',
    duration: '12-16 weeks',
    questions: 80,
    icon: Zap,
    color: 'orange',
    features: ['Real exam format', 'Expert guidance', 'Practice problems', 'Reference materials'],
  },
  {
    id: 'journeyman',
    title: 'Journeyman Electrician',
    description: 'State-level electrician certification',
    level: 'Intermediate',
    duration: '6-10 weeks',
    questions: 80,
    icon: Award,
    color: 'cyan',
    features: ['NEC code focus', 'State-specific prep', 'Hands-on scenarios', 'Mock exams'],
  },
  {
    id: 'master',
    title: 'Master Electrician',
    description: 'Advanced electrician certification',
    level: 'Advanced',
    duration: '10-14 weeks',
    questions: 100,
    icon: Target,
    color: 'violet',
    features: ['Advanced theory', 'Business practices', 'Code interpretation', 'Leadership skills'],
  },
];

const careerTools = [
  {
    id: 'resume-builder',
    title: 'EE Resume Builder',
    description: 'Industry-optimized templates for electrical engineers',
    icon: FileText,
    color: 'violet',
    features: ['ATS-friendly templates', 'Technical skills showcase', 'Project highlights', 'Export to PDF/DOCX'],
    action: 'Create Resume',
  },
  {
    id: 'portfolio',
    title: 'Portfolio Generator',
    description: 'Showcase your projects and achievements',
    icon: Palette,
    color: 'orange',
    features: ['Visual project cards', 'Schematic displays', 'GitHub integration', 'Custom domains'],
    action: 'Build Portfolio',
  },
  {
    id: 'interview-prep',
    title: 'Interview Prep',
    description: 'Common EE interview questions & answers',
    icon: MessageSquare,
    color: 'cyan',
    features: ['200+ technical questions', 'Behavioral scenarios', 'Video practice', 'Expert tips'],
    action: 'Start Practicing',
  },
];

const jobListings = [
  {
    id: 1,
    title: 'Senior Power Systems Engineer',
    company: 'Tesla Energy',
    location: 'Austin, TX',
    type: 'Full-time',
    category: 'Power',
    salary: '$120k - $160k',
    rating: 4.8,
    reviews: 1240,
    posted: '2 days ago',
    logo: '⚡',
    highlights: ['Remote options', 'Stock options', 'Health benefits'],
  },
  {
    id: 2,
    title: 'Controls Engineer',
    company: 'Siemens',
    location: 'Chicago, IL',
    type: 'Full-time',
    category: 'Controls',
    salary: '$95k - $130k',
    rating: 4.6,
    reviews: 890,
    posted: '5 days ago',
    logo: '🏭',
    highlights: ['Visa sponsorship', '401k matching', 'Career growth'],
  },
  {
    id: 3,
    title: 'Electronics Design Engineer',
    company: 'Apple',
    location: 'Cupertino, CA',
    type: 'Full-time',
    category: 'Electronics',
    salary: '$140k - $190k',
    rating: 4.9,
    reviews: 2103,
    posted: '1 week ago',
    logo: '📱',
    highlights: ['Top-tier compensation', 'Innovation focus', 'World-class team'],
  },
  {
    id: 4,
    title: 'Electrical Project Engineer',
    company: 'General Electric',
    location: 'Boston, MA',
    type: 'Full-time',
    category: 'Power',
    salary: '$100k - $135k',
    rating: 4.5,
    reviews: 756,
    posted: '3 days ago',
    logo: '⚙️',
    highlights: ['Relocation assistance', 'Training programs', 'Global projects'],
  },
  {
    id: 5,
    title: 'Embedded Systems Engineer',
    company: 'SpaceX',
    location: 'Hawthorne, CA',
    type: 'Full-time',
    category: 'Electronics',
    salary: '$130k - $170k',
    rating: 4.7,
    reviews: 534,
    posted: '4 days ago',
    logo: '🚀',
    highlights: ['Aerospace projects', 'Cutting-edge tech', 'Mission-driven'],
  },
  {
    id: 6,
    title: 'Automation Controls Specialist',
    company: 'ABB',
    location: 'Houston, TX',
    type: 'Full-time',
    category: 'Controls',
    salary: '$90k - $125k',
    rating: 4.4,
    reviews: 423,
    posted: '1 week ago',
    logo: '🤖',
    highlights: ['International exposure', 'Technical training', 'Competitive benefits'],
  },
];

const studyPlans = [
  {
    title: 'FE Electrical - 8 Week Plan',
    weeks: 8,
    hours: '15-20 hrs/week',
    topics: ['Circuit Analysis', 'Power Systems', 'Electronics', 'Digital Systems', 'Controls'],
    difficulty: 'Intermediate',
  },
  {
    title: 'PE Power - 12 Week Plan',
    weeks: 12,
    hours: '20-25 hrs/week',
    topics: ['Transmission', 'Distribution', 'Protection', 'Analysis', 'Codes & Standards'],
    difficulty: 'Advanced',
  },
  {
    title: 'Journeyman - 6 Week Plan',
    weeks: 6,
    hours: '10-15 hrs/week',
    topics: ['NEC Code', 'Wiring Methods', 'Load Calculations', 'Safety', 'Practical Skills'],
    difficulty: 'Intermediate',
  },
];

export default function CareerPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCareerTool, setActiveCareerTool] = useState<string | null>(null);

  const filteredJobs = jobListings.filter(job => {
    const matchesCategory = selectedCategory === 'all' || job.category.toLowerCase() === selectedCategory;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen gradient-depth">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Ambient Background Orbs */}
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#FF6B00] opacity-20 blur-[150px] rounded-full animate-float" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#9C4AFF] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '4s' }} />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Briefcase className="h-14 w-14 text-[#FF6B00] glow-text-orange" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-white glow-text-orange" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Certifications & Career Center
              </h1>
            </div>
            <p className="text-xl text-[#B8A7E0] max-w-3xl mx-auto">
              Advance your electrical engineering career with certification prep, professional tools, and curated job opportunities
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Job Listings', value: '1,247', icon: Briefcase, color: 'orange' },
              { label: 'Avg Salary', value: '$118k', icon: DollarSign, color: 'cyan' },
              { label: 'Success Rate', value: '87%', icon: Target, color: 'violet' },
              { label: 'Active Users', value: '12.5k', icon: Users, color: 'orange' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${
                      stat.color === 'violet' ? 'text-[#9C4AFF]' :
                      stat.color === 'orange' ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                    }`} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-[#B8A7E0]">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="certifications" className="space-y-8">
            <TabsList className="glass-surface border border-white/10 p-1 grid w-full grid-cols-3">
              <TabsTrigger value="certifications" className="data-[state=active]:gradient-violet data-[state=active]:text-white">
                <GraduationCap className="h-4 w-4 mr-2" />
                Certifications
              </TabsTrigger>
              <TabsTrigger value="career-tools" className="data-[state=active]:gradient-fire data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Career Tools
              </TabsTrigger>
              <TabsTrigger value="job-board" className="data-[state=active]:gradient-aqua data-[state=active]:text-white">
                <Briefcase className="h-4 w-4 mr-2" />
                Job Board
              </TabsTrigger>
            </TabsList>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-8">
              {/* Certification Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 hover:shadow-glowViolet transition-all h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl ${
                            cert.color === 'violet' ? 'gradient-violet' :
                            cert.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                          }`}>
                            <cert.icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={`${
                            cert.color === 'violet' ? 'gradient-violet' :
                            cert.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                          } text-white border-0`}>
                            {cert.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-white">{cert.title}</CardTitle>
                        <CardDescription className="text-[#B8A7E0]">
                          {cert.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-[#B8A7E0] text-sm">Duration</div>
                            <div className="text-white font-semibold">{cert.duration}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[#B8A7E0] text-sm">Questions</div>
                            <div className="text-white font-semibold">{cert.questions}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-white font-medium text-sm">What's Included:</div>
                          <ul className="space-y-1">
                            {cert.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                                <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full gradient-violet hover:shadow-glowViolet text-white font-semibold">
                          Start Prep Course
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Study Plan Generator */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-[#9C4AFF]" />
                  <h2 className="text-2xl font-bold text-white">AI-Generated Study Plans</h2>
                </div>
                <StudyPlanGenerator />
              </div>
            </TabsContent>

            {/* Career Tools Tab */}
            <TabsContent value="career-tools" className="space-y-8">
              {!activeCareerTool ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {careerTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 hover:shadow-glowOrange transition-all h-full">
                          <CardHeader>
                            <div className={`p-3 w-fit rounded-xl mb-4 ${
                              tool.color === 'violet' ? 'gradient-violet' :
                              tool.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                            }`}>
                              <tool.icon className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle className="text-white">{tool.title}</CardTitle>
                            <CardDescription className="text-[#B8A7E0]">
                              {tool.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {tool.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={() => setActiveCareerTool(tool.id)}
                              className="w-full gradient-fire hover:shadow-glowOrange text-white font-semibold"
                            >
                              {tool.action}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Feature Showcase */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <Card className="glass-surface border-2 border-[#9C4AFF]/30 overflow-hidden">
                      <div className="relative h-48 gradient-violet flex items-center justify-center">
                        <FileText className="h-20 w-20 text-white opacity-20" />
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white font-bold text-xl">Professional Templates</h3>
                          <p className="text-white/80 text-sm">Industry-tested resume formats</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <ul className="space-y-3">
                          {['Modern & clean design', 'ATS-optimized layout', 'Technical skills section', 'Project showcase area'].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[#B8A7E0]">
                              <CheckCircle2 className="h-4 w-4 text-[#9C4AFF]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="glass-surface border-2 border-[#FF6B00]/30 overflow-hidden">
                      <div className="relative h-48 gradient-fire flex items-center justify-center">
                        <Brain className="h-20 w-20 text-white opacity-20" />
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white font-bold text-xl">Interview AI Coach</h3>
                          <p className="text-white/80 text-sm">Practice with AI feedback</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <ul className="space-y-3">
                          {['Real-time feedback', 'Common EE questions', 'Behavioral scenarios', 'Video practice mode'].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[#B8A7E0]">
                              <CheckCircle2 className="h-4 w-4 text-[#FF6B00]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveCareerTool(null)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    ← Back to Career Tools
                  </Button>
                  
                  {activeCareerTool === 'resume-builder' && <ResumeBuilder />}
                  {activeCareerTool === 'interview-prep' && <InterviewPrep />}
                  {activeCareerTool === 'portfolio' && (
                    <Card className="glass-surface border-2 border-[#9C4AFF]/30">
                      <CardContent className="p-12 text-center">
                        <Palette className="h-16 w-16 text-[#9C4AFF] mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Portfolio Generator</h3>
                        <p className="text-[#B8A7E0] mb-6">Coming Soon! Create stunning portfolios to showcase your projects.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Job Board Tab */}
            <TabsContent value="job-board" className="space-y-8">
              {/* Search & Filters */}
              <Card className="glass-surface border-white/10">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8A7E0] h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Search jobs, companies..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 glass-surface border-white/20 text-white"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="glass-surface border-white/20 text-white">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="glass-surface border-white/20">
                          <SelectItem value="all" className="text-white">All Categories</SelectItem>
                          <SelectItem value="power" className="text-white">Power Systems</SelectItem>
                          <SelectItem value="controls" className="text-white">Controls</SelectItem>
                          <SelectItem value="electronics" className="text-white">Electronics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        type="text"
                        placeholder="Location"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="glass-surface border-white/20 text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Button className="w-full gradient-aqua hover:shadow-glowCyan text-white">
                        <Filter className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Listings */}
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="glass-surface border-white/10 hover:border-[#00E5FF]/50 hover:shadow-glowCyan transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-4xl">{job.logo}</div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-white font-bold text-lg mb-1">{job.title}</h3>
                                <div className="flex items-center gap-4 text-[#B8A7E0] text-sm">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {job.company}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                  </div>
                                  <Badge className="glass-surface text-[#B8A7E0] border-white/20">
                                    {job.category}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-[#00E5FF]" />
                                  <span className="text-white font-semibold">{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                                  <span className="text-white font-medium">{job.rating}</span>
                                  <span className="text-[#B8A7E0] text-sm">({job.reviews} reviews)</span>
                                </div>
                                <div className="text-[#B8A7E0] text-sm">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  {job.posted}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {job.highlights.map((highlight, idx) => (
                                  <Badge key={idx} className="gradient-aqua text-white border-0">
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button className="gradient-fire hover:shadow-glowOrange text-white font-semibold">
                              Apply Now
                              <ArrowUpRight className="h-4 w-4 ml-2" />
                            </Button>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Load More Jobs
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-violet opacity-50 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
        <div className="absolute top-0 left-0 w-full h-full bg-[#0A0014]/50" />
        
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#FF6B00] opacity-30 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#00E5FF] opacity-30 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-white glow-text-violet"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Ready to Advance Your Career?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-[#B8A7E0] mb-8"
          >
            Join thousands of electrical engineers who've landed their dream jobs with EE Zone
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="gradient-fire text-white hover:shadow-glowOrange font-semibold rounded-xl px-8">
              Start Free Trial
            </Button>
            <Button size="lg" className="glass-surface border-2 border-white/20 text-white hover:border-[#9C4AFF] hover:shadow-glowViolet rounded-xl px-8">
              View All Resources
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}