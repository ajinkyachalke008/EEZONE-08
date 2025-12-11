'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Send, Loader2, CheckCircle, AlertCircle, FileText, Sparkles, Brain, Zap, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

type SolutionResult = {
  solution: string;
  model?: string;
};

export function ProblemSolver() {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [problemText, setProblemText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-problem.jpg', { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(canvas.toDataURL('image/jpeg'));
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSolve = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let requestBody: any = {};

      if (activeTab === 'text') {
        if (!problemText.trim()) {
          setError('Please enter a problem to solve');
          setIsLoading(false);
          return;
        }
        requestBody = { problem: problemText };
      } else {
        if (!imageFile) {
          setError('Please upload or capture an image');
          setIsLoading(false);
          return;
        }
        const base64Image = await convertToBase64(imageFile);
        requestBody = { image: base64Image };
      }

      const response = await fetch('/api/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to solve problem');
      }

      setResult({
        solution: data.solution,
        model: data.model,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to solve problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProblemText('');
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-full h-full"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300C2D1\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px',
            }}
          />
        </div>
      </div>

      <Card className="relative w-full overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-purple-500/10">
        {/* Animated Glow Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <CardHeader className="relative pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="p-2 bg-purple-500/20 rounded-lg"
                >
                  <Brain className="h-7 w-7 text-purple-400" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                    AI Problem Solver
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-6 w-6 text-purple-400" />
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-base mt-1">
                    Get detailed step-by-step solutions for electrical & electronics problems
                  </CardDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Analysis
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1">
              <BookOpen className="h-3 w-3 mr-1" />
              Step-by-Step Solutions
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/40 px-3 py-1">
              Multiple Input Methods
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'image')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 p-1 rounded-xl">
              <TabsTrigger 
                value="text" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Type/Paste Problem
              </TabsTrigger>
              <TabsTrigger 
                value="image"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan/Upload Image
              </TabsTrigger>
            </TabsList>

            {/* Text Input Tab */}
            <TabsContent value="text" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Textarea
                    placeholder="Type or paste your electrical/electronics numerical problem here...

Example: Calculate the current flowing through a 100Ω resistor when connected across a 12V battery using Ohm's Law."
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    className="min-h-[240px] bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-purple-500/50 transition-colors resize-none"
                    disabled={isLoading || !!result}
                  />
                  {problemText && !result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute bottom-4 right-4 text-sm text-gray-400"
                    >
                      {problemText.length} characters
                    </motion.div>
                  )}
                </div>

                {/* Quick Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Circuit Analysis</p>
                        <p className="text-gray-400 text-xs mt-1">Ohm's Law, KVL, KCL problems</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Power Calculations</p>
                        <p className="text-gray-400 text-xs mt-1">AC/DC, 3-phase systems</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Image Input Tab */}
            <TabsContent value="image" className="space-y-4">
              <AnimatePresence mode="wait">
                {!imagePreview && !isCameraActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={startCamera}
                          className="w-full h-36 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold text-lg rounded-2xl shadow-xl shadow-purple-500/30 border-2 border-purple-500/50 relative overflow-hidden group"
                          disabled={isLoading || !!result}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <div className="relative flex flex-col items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-full">
                              <Camera className="h-10 w-10" />
                            </div>
                            <span>Open Camera</span>
                            <span className="text-xs opacity-80">Capture problem directly</span>
                          </div>
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full h-36 border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-white font-semibold text-lg rounded-2xl shadow-xl relative overflow-hidden group"
                          disabled={isLoading || !!result}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <div className="relative flex flex-col items-center gap-3">
                            <div className="p-3 bg-purple-500/30 rounded-full">
                              <Upload className="h-10 w-10" />
                            </div>
                            <span>Upload Image</span>
                            <span className="text-xs opacity-80">Choose from gallery</span>
                          </div>
                        </Button>
                      </motion.div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </motion.div>
                )}

                {isCameraActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-purple-500 shadow-2xl shadow-purple-500/30">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto aspect-video object-cover"
                      />
                      {/* Scanning Overlay */}
                      <motion.div
                        className="absolute inset-0 border-4 border-purple-500 pointer-events-none"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      {/* Scan Line */}
                      <motion.div
                        className="absolute left-0 w-full h-1 bg-purple-500 shadow-lg shadow-purple-500"
                        animate={{
                          top: ['0%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      {/* Corner Markers */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-purple-400" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-purple-400" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-purple-400" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-purple-400" />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={captureImage} 
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold h-14 rounded-xl shadow-lg"
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        Capture & Analyze
                      </Button>
                      <Button 
                        onClick={stopCamera} 
                        variant="outline" 
                        className="border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 h-14 px-6 rounded-xl"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {imagePreview && !isCameraActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-purple-500/50 shadow-2xl">
                      <img src={imagePreview} alt="Problem preview" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                    {!result && (
                      <Button 
                        onClick={handleReset} 
                        variant="outline" 
                        className="w-full border-2 border-white/20 text-white hover:bg-white/10 rounded-xl h-12"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {!result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSolve}
                  disabled={isLoading || (!problemText.trim() && !imageFile)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold h-14 rounded-xl shadow-lg shadow-purple-500/30 text-lg relative overflow-hidden group"
                >
                  {!isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  )}
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="mr-2 h-6 w-6" />
                        </motion.div>
                        Solving Problem...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Get AI Solution
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-5 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-start gap-3 backdrop-blur-sm"
              >
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-semibold">Error</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Solution Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </motion.div>
                  <div>
                    <span className="text-green-300 font-semibold text-lg">Solution Generated Successfully</span>
                    {result.model && (
                      <p className="text-green-400 text-xs mt-1">Powered by {result.model}</p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-4 text-white">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                    <h3 className="font-semibold text-lg">Step-by-Step Solution</h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-gray-100 whitespace-pre-wrap leading-relaxed text-base">
                      {result.solution}
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 text-white hover:bg-purple-500/10 h-14 rounded-xl font-semibold"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Solve Another Problem
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}