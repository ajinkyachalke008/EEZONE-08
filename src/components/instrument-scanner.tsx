'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Zap, Loader2, AlertCircle } from 'lucide-react';
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraMode(true);
        setIsScanning(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
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
    <Card className="overflow-hidden border-2 border-[#00C2D1]/20 bg-gradient-to-br from-[#071428] to-[#0a1d3a] text-white">
      <CardHeader className="relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[#00C2D1]/5 animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-[#00C2D1]" />
            <CardTitle className="text-2xl">Instrument Scanner</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Identify electrical & electronic instruments instantly with AI
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isScanning && !capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Button
              onClick={startCamera}
              className="h-32 bg-[#00C2D1] hover:bg-[#00C2D1]/90 text-[#071428] font-semibold text-lg flex flex-col gap-3 transition-all hover:scale-105"
            >
              <Camera className="h-10 w-10" />
              Open Camera
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-32 border-2 border-[#00C2D1] text-white hover:bg-[#00C2D1]/10 font-semibold text-lg flex flex-col gap-3 transition-all hover:scale-105"
            >
              <Upload className="h-10 w-10" />
              Upload Image
            </Button>
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
            <div className="relative rounded-lg overflow-hidden border-2 border-[#00C2D1] shadow-lg shadow-[#00C2D1]/20">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[500px] object-cover"
              />
              <div className="absolute inset-0 border-4 border-[#00C2D1] animate-pulse pointer-events-none" />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-[#00C2D1] hover:bg-[#00C2D1]/90 text-[#071428] font-semibold"
                size="lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Capture Photo
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                size="lg"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
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
              <div className="relative rounded-lg overflow-hidden border-2 border-[#00C2D1]">
                <img
                  src={capturedImage}
                  alt="Captured instrument"
                  className="w-full h-auto max-h-[400px] object-contain bg-black"
                />
              </div>

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3 py-8"
                >
                  <Loader2 className="h-8 w-8 text-[#00C2D1] animate-spin" />
                  <span className="text-lg">Analyzing instrument...</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200">{error}</p>
                </motion.div>
              )}

              {instrumentInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#00C2D1]">{instrumentInfo.name}</h3>
                    <Badge className="bg-[#00C2D1] text-[#071428]">{instrumentInfo.type}</Badge>
                  </div>

                  {instrumentInfo.specifications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#00C2D1]" />
                        Specifications
                      </h4>
                      <ul className="space-y-1 pl-4">
                        {instrumentInfo.specifications.map((spec, idx) => (
                          <li key={idx} className="text-gray-300 text-sm">• {spec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {instrumentInfo.applications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#00C2D1]" />
                        Practical Applications
                      </h4>
                      <ul className="space-y-1 pl-4">
                        {instrumentInfo.applications.map((app, idx) => (
                          <li key={idx} className="text-gray-300 text-sm">• {app}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {instrumentInfo.tutorials.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#00C2D1]" />
                        Tutorials & Resources
                      </h4>
                      <ul className="space-y-1 pl-4">
                        {instrumentInfo.tutorials.map((tutorial, idx) => (
                          <li key={idx} className="text-gray-300 text-sm">• {tutorial}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {instrumentInfo.safetyNotes && instrumentInfo.safetyNotes.length > 0 && (
                    <div className="space-y-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <h4 className="text-lg font-semibold flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="h-5 w-5" />
                        Safety Notes
                      </h4>
                      <ul className="space-y-1 pl-4">
                        {instrumentInfo.safetyNotes.map((note, idx) => (
                          <li key={idx} className="text-yellow-200 text-sm">• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              <Button
                onClick={resetScanner}
                variant="outline"
                className="w-full border-[#00C2D1] text-white hover:bg-[#00C2D1]/10"
              >
                Scan Another Instrument
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};
