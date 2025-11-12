'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Zap, Loader2, AlertCircle, ScanLine, CircuitBoard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface InstrumentInfo {
  name: string;
  type: string;
  specifications: string[];
  applications: string[];
  tutorials: string[];
  safetyNotes?: string[];
}

export const InstrumentScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [instrumentInfo, setInstrumentInfo] = useState<InstrumentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraMode(true);
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video metadata to load and then play
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error('Video play error:', err);
            setError('Failed to start video stream. Please try again.');
            stopCamera();
          });
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      setIsCameraMode(false);
      setIsScanning(false);
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
    setIsCameraMode(false);
    setIsScanning(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setCapturedImage(imageData);
        setIsScanning(true);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    setInstrumentInfo(null);

    try {
      const response = await fetch('/api/analyze-instrument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setInstrumentInfo(data.instrumentInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze instrument. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setInstrumentInfo(null);
    setError(null);
    setIsScanning(false);
    setIsCameraMode(false);
    setIsAnalyzing(false);
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

      <Card className="relative overflow-hidden border-2 border-[#00C2D1]/30 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-[#00C2D1]/10">
        {/* Animated Glow Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00C2D1] to-transparent"
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
                  className="p-2 bg-[#00C2D1]/20 rounded-lg"
                >
                  <CircuitBoard className="h-7 w-7 text-[#00C2D1]" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                    AI Instrument Scanner
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-6 w-6 text-[#00C2D1]" />
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-base mt-1">
                    Advanced AI-powered instrument identification & analysis
                  </CardDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-[#00C2D1]/20 text-[#00C2D1] border border-[#00C2D1]/40 px-3 py-1">
              <ScanLine className="h-3 w-3 mr-1" />
              Real-time Analysis
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/40 px-3 py-1">
              Instant Results
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isScanning && !capturedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={startCamera}
                    className="w-full h-40 bg-gradient-to-br from-[#00C2D1] to-[#00A8B5] hover:from-[#00A8B5] hover:to-[#00C2D1] text-white font-semibold text-lg rounded-2xl shadow-xl shadow-[#00C2D1]/30 border-2 border-[#00C2D1]/50 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-full">
                        <Camera className="h-10 w-10" />
                      </div>
                      <span>Open Camera</span>
                      <span className="text-xs opacity-80">Scan instrument in real-time</span>
                    </div>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-40 border-2 border-[#00C2D1] bg-[#00C2D1]/10 hover:bg-[#00C2D1]/20 text-white font-semibold text-lg rounded-2xl shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00C2D1]/0 via-[#00C2D1]/20 to-[#00C2D1]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative flex flex-col items-center gap-3">
                      <div className="p-3 bg-[#00C2D1]/30 rounded-full">
                        <Upload className="h-10 w-10" />
                      </div>
                      <span>Upload Image</span>
                      <span className="text-xs opacity-80">Choose from gallery</span>
                    </div>
                  </Button>
                </motion.div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <ScanLine className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Auto Detection</p>
                      <p className="text-gray-400 text-xs">Instant recognition</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Smart Analysis</p>
                      <p className="text-gray-400 text-xs">AI-powered insights</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CircuitBoard className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Complete Info</p>
                      <p className="text-gray-400 text-xs">Full specifications</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.div>
          )}

          {isCameraMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#00C2D1] shadow-2xl shadow-[#00C2D1]/30">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto max-h-[500px] object-cover"
                />
                {/* Scanning Overlay */}
                <motion.div
                  className="absolute inset-0 border-4 border-[#00C2D1] pointer-events-none"
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
                  className="absolute left-0 w-full h-1 bg-[#00C2D1] shadow-lg shadow-[#00C2D1]"
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
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#00C2D1]" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#00C2D1]" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#00C2D1]" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#00C2D1]" />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-[#00C2D1] to-[#00A8B5] hover:from-[#00A8B5] hover:to-[#00C2D1] text-white font-semibold h-14 rounded-xl shadow-lg"
                  size="lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture & Analyze
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="lg"
                  className="border-2 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 h-14 px-6 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {capturedImage && !isCameraMode && (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#00C2D1]/50 shadow-2xl">
                  <img
                    src={capturedImage}
                    alt="Captured instrument"
                    className="w-full h-auto max-h-[400px] object-contain bg-gradient-to-br from-gray-900 to-gray-800"
                  />
                </div>

                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-4 py-12 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="h-12 w-12 text-[#00C2D1]" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-[#00C2D1]/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">Analyzing Instrument...</p>
                      <p className="text-sm text-gray-400 mt-1">AI processing in progress</p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 backdrop-blur-sm"
                  >
                    <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-200 font-semibold">Analysis Error</p>
                      <p className="text-red-300 text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                {instrumentInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                  >
                    <div className="space-y-3">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-[#00C2D1] flex items-center gap-2"
                      >
                        {instrumentInfo.name}
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          <CircuitBoard className="h-6 w-6" />
                        </motion.div>
                      </motion.h3>
                      <Badge className="bg-gradient-to-r from-[#00C2D1] to-[#00A8B5] text-white border-0 px-4 py-1 text-sm">
                        {instrumentInfo.type}
                      </Badge>
                    </div>

                    {instrumentInfo.specifications.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3 bg-white/5 rounded-xl p-5 border border-white/10"
                      >
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00C2D1]" />
                          Technical Specifications
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {instrumentInfo.specifications.map((spec, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + idx * 0.05 }}
                              className="text-gray-300 text-sm flex items-start gap-2"
                            >
                              <Zap className="h-4 w-4 text-[#00C2D1] flex-shrink-0 mt-0.5" />
                              {spec}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {instrumentInfo.applications.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3 bg-white/5 rounded-xl p-5 border border-white/10"
                      >
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          Practical Applications
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {instrumentInfo.applications.map((app, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + idx * 0.05 }}
                              className="text-gray-300 text-sm flex items-start gap-2"
                            >
                              <CircuitBoard className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                              {app}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {instrumentInfo.tutorials.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3 bg-white/5 rounded-xl p-5 border border-white/10"
                      >
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          Tutorials & Resources
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {instrumentInfo.tutorials.map((tutorial, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.05 }}
                              className="text-gray-300 text-sm flex items-start gap-2"
                            >
                              <ScanLine className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              {tutorial}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {instrumentInfo.safetyNotes && instrumentInfo.safetyNotes.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3 p-5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 rounded-xl backdrop-blur-sm"
                      >
                        <h4 className="text-lg font-semibold flex items-center gap-2 text-yellow-300">
                          <AlertCircle className="h-5 w-5" />
                          Safety Guidelines
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {instrumentInfo.safetyNotes.map((note, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + idx * 0.05 }}
                              className="text-yellow-200 text-sm flex items-start gap-2"
                            >
                              <span className="text-yellow-400 font-bold">⚠</span>
                              {note}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={resetScanner}
                    variant="outline"
                    className="w-full h-14 border-2 border-[#00C2D1]/50 text-white hover:bg-[#00C2D1]/10 font-semibold rounded-xl"
                  >
                    <ScanLine className="mr-2 h-5 w-5" />
                    Scan Another Instrument
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};