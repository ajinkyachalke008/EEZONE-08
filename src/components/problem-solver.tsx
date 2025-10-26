'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Send, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      console.error('Solve error:', err);
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
    <Card className="w-full bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#00C2D1]" />
          Problem Solver
        </CardTitle>
        <CardDescription className="text-gray-300">
          Submit your electrical/electronics numerical problem and get detailed step-by-step solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'image')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="text">Type/Paste Problem</TabsTrigger>
            <TabsTrigger value="image">Scan/Upload Image</TabsTrigger>
          </TabsList>

          {/* Text Input Tab */}
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Paste or type your numerical problem here... 

Example: Calculate the current flowing through a 100Ω resistor when connected across a 12V battery."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              disabled={isLoading || !!result}
            />
          </TabsContent>

          {/* Image Input Tab */}
          <TabsContent value="image" className="space-y-4">
            {!imagePreview && !isCameraActive && (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={startCamera}
                  className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
                  disabled={isLoading || !!result}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Open Camera
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  disabled={isLoading || !!result}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {isCameraActive && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-[#00C2D1] pointer-events-none animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={captureImage} className="flex-1 bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90">
                    <Camera className="mr-2 h-5 w-5" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <img src={imagePreview} alt="Problem preview" className="w-full h-auto" />
                </div>
                {!result && (
                  <Button 
                    onClick={handleReset} 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Change Image
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        {!result && (
          <div className="mt-6">
            <Button
              onClick={handleSolve}
              disabled={isLoading || (!problemText.trim() && !imageFile)}
              className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90 font-semibold h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Solving Problem...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Get Solution
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Solution Display */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-[#00C2D1]">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Solution Generated</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {result.solution}
                </div>
              </div>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Solve Another Problem
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
