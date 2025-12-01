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
  MessageSquare,
  ArrowRight,
  Trophy,
  Rocket
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0014] via-[#130026] to-[#0A0014]">
      <Header onSearch={() => {}} searchQuery="" onSearchChange={() => {}} />

      {/* Hero Section with Enhanced Design */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-[#FF6B00] opacity-20 blur-[180px] rounded-full animate-float" />
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#9C4AFF] opacity-20 blur-[180px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#00E5FF] opacity-15 blur-[180px] rounded-full animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div 
              className="flex items-center justify-center gap-4 mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#FF6B00] blur-xl opacity-60 rounded-full" />
                <Briefcase className="relative h-16 w-16 text-[#FF6B00]" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#FF6B00] via-[#9C4AFF] to-[#00E5FF] bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Career Center
              </h1>
            </motion.div>
            <motion.p 
              className="text-xl md:text-2xl text-[#B8A7E0] max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Accelerate your electrical engineering career with certifications, professional tools, and exclusive opportunities
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button size="lg" className="gradient-fire hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] text-white font-semibold rounded-xl px-8 py-6 text-lg group">
                Start Learning
                <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-[#9C4AFF] rounded-xl px-8 py-6 text-lg backdrop-blur-sm">
                Explore Jobs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Job Listings', value: '1,247', icon: Briefcase, color: 'orange', gradient: 'from-[#FF6B00] to-[#FF8C00]' },
              { label: 'Avg Salary', value: '$118k', icon: DollarSign, color: 'cyan', gradient: 'from-[#00E5FF] to-[#00C2D1]' },
              { label: 'Success Rate', value: '87%', icon: Trophy, color: 'violet', gradient: 'from-[#9C4AFF] to-[#7B3FCC]' },
              { label: 'Active Users', value: '12.5k', icon: Users, color: 'orange', gradient: 'from-[#FF6B00] to-[#9C4AFF]' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardContent className="p-4 md:p-6 text-center relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className={`h-8 w-8 md:h-10 w-10 mx-auto mb-3 ${
                        stat.color === 'violet' ? 'text-[#9C4AFF]' :
                        stat.color === 'orange' ? 'text-[#FF6B00]' : 'text-[#00E5FF]'
                      }`} />
                    </motion.div>
                    <div className="text-2xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-[#B8A7E0]">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content with Enhanced Tabs */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="certifications" className="space-y-8">
            <TabsList className="glass-surface border border-white/10 p-1.5 grid w-full grid-cols-3 rounded-2xl backdrop-blur-xl">
              <TabsTrigger 
                value="certifications" 
                className="data-[state=active]:gradient-violet data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-[0_0_20px_rgba(156,74,255,0.4)]"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Certifications</span>
                <span className="sm:hidden">Certs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="career-tools" 
                className="data-[state=active]:gradient-fire data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-[0_0_20px_rgba(255,107,0,0.4)]"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Career Tools</span>
                <span className="sm:hidden">Tools</span>
              </TabsTrigger>
              <TabsTrigger 
                value="job-board" 
                className="data-[state=active]:gradient-aqua data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Job Board</span>
                <span className="sm:hidden">Jobs</span>
              </TabsTrigger>
            </TabsList>

            {/* Certifications Tab - Enhanced */}
            <TabsContent value="certifications" className="space-y-8">
              {/* Certification Cards with Better Animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <Card className="glass-surface border-white/10 hover:border-[#9C4AFF]/50 transition-all duration-300 h-full overflow-hidden relative">
                      {/* Animated Background Gradient */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                        cert.color === 'violet' ? 'gradient-violet' :
                        cert.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                      }`} />
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div 
                            className={`p-4 rounded-2xl ${
                              cert.color === 'violet' ? 'gradient-violet' :
                              cert.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                            } shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <cert.icon className="h-7 w-7 text-white" />
                          </motion.div>
                          <Badge className={`${
                            cert.color === 'violet' ? 'gradient-violet' :
                            cert.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                          } text-white border-0 px-4 py-1.5`}>
                            {cert.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-xl mb-2">{cert.title}</CardTitle>
                        <CardDescription className="text-[#B8A7E0] text-base">
                          {cert.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5 relative">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1 p-3 glass-surface rounded-xl border border-white/5">
                            <div className="text-[#B8A7E0] text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Duration
                            </div>
                            <div className="text-white font-semibold">{cert.duration}</div>
                          </div>
                          <div className="space-y-1 p-3 glass-surface rounded-xl border border-white/5">
                            <div className="text-[#B8A7E0] text-sm flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Questions
                            </div>
                            <div className="text-white font-semibold">{cert.questions}</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-white font-medium text-sm">What's Included:</div>
                          <ul className="space-y-2">
                            {cert.features.map((feature, idx) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-center gap-2 text-[#B8A7E0] text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-[#00E5FF] flex-shrink-0" />
                                {feature}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter className="relative">
                        <Button className="w-full gradient-violet hover:shadow-[0_0_25px_rgba(156,74,255,0.5)] text-white font-semibold py-6 rounded-xl group">
                          Start Prep Course
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Study Plan Generator */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-7 w-7 text-[#9C4AFF]" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white">AI-Generated Study Plans</h2>
                </div>
                <StudyPlanGenerator />
              </motion.div>
            </TabsContent>

            {/* Career Tools Tab - Keep existing but add enhancements */}
            <TabsContent value="career-tools" className="space-y-8">
              {!activeCareerTool ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {careerTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="group"
                      >
                        <Card className="glass-surface border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 h-full overflow-hidden relative">
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 gradient-fire" />
                          <CardHeader className="relative">
                            <motion.div 
                              className={`p-4 w-fit rounded-2xl mb-4 ${
                                tool.color === 'violet' ? 'gradient-violet' :
                                tool.color === 'orange' ? 'gradient-fire' : 'gradient-aqua'
                              } shadow-lg`}
                              whileHover={{ scale: 1.1, rotate: -5 }}
                            >
                              <tool.icon className="h-7 w-7 text-white" />
                            </motion.div>
                            <CardTitle className="text-white text-xl mb-2">{tool.title}</CardTitle>
                            <CardDescription className="text-[#B8A7E0]">
                              {tool.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="relative">
                            <ul className="space-y-2">
                              {tool.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-[#B8A7E0] text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-[#00E5FF] flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                          <CardFooter className="relative">
                            <Button 
                              onClick={() => setActiveCareerTool(tool.id)}
                              className="w-full gradient-fire hover:shadow-[0_0_25px_rgba(255,107,0,0.5)] text-white font-semibold py-6 rounded-xl group"
                            >
                              {tool.action}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Feature Showcase - Enhanced */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="glass-surface border-2 border-[#9C4AFF]/30 overflow-hidden group">
                        <div className="relative h-56 gradient-violet flex items-center justify-center overflow-hidden">
                          <motion.div
                            className="absolute inset-0"
                            animate={{ 
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            style={{ 
                              background: 'linear-gradient(135deg, #2B0B4B 0%, #9C4AFF 50%, #2B0B4B 100%)',
                              backgroundSize: '200% 100%'
                            }}
                          />
                          <FileText className="h-24 w-24 text-white opacity-30 relative z-10" />
                          <div className="absolute bottom-4 left-4 z-10">
                            <h3 className="text-white font-bold text-2xl mb-1">Professional Templates</h3>
                            <p className="text-white/80">Industry-tested resume formats</p>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <ul className="space-y-3">
                            {['Modern & clean design', 'ATS-optimized layout', 'Technical skills section', 'Project showcase area'].map((item, idx) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-center gap-2 text-[#B8A7E0]"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-[#9C4AFF] flex-shrink-0" />
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="glass-surface border-2 border-[#FF6B00]/30 overflow-hidden group">
                        <div className="relative h-56 gradient-fire flex items-center justify-center overflow-hidden">
                          <motion.div
                            className="absolute inset-0"
                            animate={{ 
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            style={{ 
                              background: 'linear-gradient(135deg, #FF6B00 0%, #FF00C8 50%, #FF6B00 100%)',
                              backgroundSize: '200% 100%'
                            }}
                          />
                          <Brain className="h-24 w-24 text-white opacity-30 relative z-10" />
                          <div className="absolute bottom-4 left-4 z-10">
                            <h3 className="text-white font-bold text-2xl mb-1">Interview AI Coach</h3>
                            <p className="text-white/80">Practice with AI feedback</p>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <ul className="space-y-3">
                            {['Real-time feedback', 'Common EE questions', 'Behavioral scenarios', 'Video practice mode'].map((item, idx) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-center gap-2 text-[#B8A7E0]"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (idx * 0.1) }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-[#FF6B00] flex-shrink-0" />
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </>
              ) : (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setActiveCareerTool(null)}
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                  >
                    ← Back to Career Tools
                  </Button>
                  
                  {activeCareerTool === 'resume-builder' && <ResumeBuilder />}
                  {activeCareerTool === 'interview-prep' && <InterviewPrep />}
                  {activeCareerTool === 'portfolio' && (
                    <Card className="glass-surface border-2 border-[#9C4AFF]/30">
                      <CardContent className="p-12 text-center">
                        <Palette className="h-20 w-20 text-[#9C4AFF] mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Portfolio Generator</h3>
                        <p className="text-[#B8A7E0] mb-6">Coming Soon! Create stunning portfolios to showcase your projects.</p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </TabsContent>

            {/* Job Board Tab - Keep existing structure */}
            <TabsContent value="job-board" className="space-y-8">
              {/* Search & Filters - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="glass-surface border-white/10 backdrop-blur-xl">
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
                            className="pl-10 glass-surface border-white/20 text-white h-12 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="glass-surface border-white/20 text-white h-12 rounded-xl">
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
                          className="glass-surface border-white/20 text-white h-12 rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Button className="w-full h-12 gradient-aqua hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] text-white rounded-xl">
                          <Filter className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Job Listings - Enhanced with better animations */}
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                  >
                    <Card className="glass-surface border-white/10 hover:border-[#00E5FF]/50 transition-all duration-300 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/5 to-[#00E5FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
                          <div className="flex items-start gap-4 flex-1 w-full">
                            <motion.div 
                              className="text-5xl"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              transition={{ duration: 0.3 }}
                            >
                              {job.logo}
                            </motion.div>
                            <div className="flex-1 space-y-3 min-w-0">
                              <div>
                                <h3 className="text-white font-bold text-lg mb-1">{job.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-[#B8A7E0] text-sm">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{job.company}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{job.location}</span>
                                  </div>
                                  <Badge className="glass-surface text-[#B8A7E0] border-white/20">
                                    {job.category}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-[#00E5FF] flex-shrink-0" />
                                  <span className="text-white font-semibold">{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                                  <span className="text-white font-medium">{job.rating}</span>
                                  <span className="text-[#B8A7E0] text-sm">({job.reviews})</span>
                                </div>
                                <div className="text-[#B8A7E0] text-sm flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {job.posted}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {job.highlights.map((highlight, idx) => (
                                  <Badge key={idx} className="gradient-aqua text-white border-0 text-xs">
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                            <Button className="flex-1 lg:flex-none gradient-fire hover:shadow-[0_0_20px_rgba(255,107,0,0.5)] text-white font-semibold rounded-xl group">
                              Apply Now
                              <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                            <Button variant="outline" className="flex-1 lg:flex-none border-white/20 text-white hover:bg-white/10 rounded-xl">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
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
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8 py-6">
                  Load More Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-violet opacity-60 animate-gradient-move" style={{ backgroundSize: '400% 400%' }} />
        <div className="absolute top-0 left-0 w-full h-full bg-[#0A0014]/60" />
        
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#FF6B00] opacity-40 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#00E5FF] opacity-40 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <Trophy className="h-16 w-16 text-[#FF6B00] mx-auto" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Advance Your Career?
            </h2>
            <p className="text-xl text-[#B8A7E0] mb-10 max-w-2xl mx-auto">
              Join thousands of electrical engineers who've landed their dream jobs with EE Zone
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-fire text-white hover:shadow-[0_0_30px_rgba(255,107,0,0.6)] font-semibold rounded-xl px-10 py-7 text-lg group">
                Start Free Trial
                <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" className="glass-surface border-2 border-white/20 text-white hover:border-[#9C4AFF] hover:shadow-[0_0_30px_rgba(156,74,255,0.4)] rounded-xl px-10 py-7 text-lg backdrop-blur-sm">
                View All Resources
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}