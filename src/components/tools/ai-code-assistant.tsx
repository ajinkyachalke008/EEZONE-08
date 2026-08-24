'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Copy, Download, Sparkles, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuickExample {
  platform: string;
  prompt: string;
  label: string;
  icon: string;
}

const quickExamples: Record<string, QuickExample[]> = {
  arduino: [
    { platform: 'arduino', prompt: 'Blink an LED on pin 13 with timing control', label: 'LED Blink Controller', icon: '💡' },
    { platform: 'arduino', prompt: 'Temperature and humidity sensor DHT11 monitoring system', label: 'Temperature Monitor', icon: '🌡️' },
    { platform: 'arduino', prompt: 'DC Motor speed control with PWM and H-bridge L298N', label: 'Motor Speed Control', icon: '⚙️' },
    { platform: 'arduino', prompt: 'Servo motor angle position controller', label: 'Servo Controller', icon: '🔄' },
    { platform: 'arduino', prompt: 'LCD display I2C 16x2 showing sensor data', label: 'LCD Display', icon: '📺' },
    { platform: 'arduino', prompt: 'Ultrasonic distance measurement HC-SR04 sensor', label: 'Distance Sensor', icon: '📏' },
    { platform: 'arduino', prompt: 'Multi-channel relay control system for home automation', label: 'Relay Controller', icon: '🔌' },
    { platform: 'arduino', prompt: 'Button debounce with long press and double click detection', label: 'Button Handler', icon: '🔘' },
    { platform: 'arduino', prompt: 'IR infrared remote control receiver', label: 'IR Receiver', icon: '📡' },
    { platform: 'arduino', prompt: 'Stepper motor NEMA controller with A4988 driver', label: 'Stepper Motor', icon: '🔩' },
    { platform: 'arduino', prompt: 'Keypad 4x4 password access security lock system', label: 'Keypad Lock', icon: '🔐' },
  ],
  esp32: [
    { platform: 'esp32', prompt: 'WiFi web server with real-time sensor dashboard', label: 'WiFi Dashboard', icon: '🌐' },
    { platform: 'esp32', prompt: 'Bluetooth BLE controller for mobile app', label: 'BLE Controller', icon: '📱' },
    { platform: 'esp32', prompt: 'MQTT IoT client for smart home automation', label: 'MQTT IoT Client', icon: '🏠' },
    { platform: 'esp32', prompt: 'OLED SSD1306 display dashboard with graphs', label: 'OLED Dashboard', icon: '📊' },
    { platform: 'esp32', prompt: 'Energy power monitor with voltage current measurement', label: 'Energy Monitor', icon: '⚡' },
  ],
  plc: [
    { platform: 'plc', prompt: 'Motor start stop control circuit with overload protection', label: 'Motor Start/Stop', icon: '🏭' },
    { platform: 'plc', prompt: 'Traffic light signal sequence controller with pedestrian crossing', label: 'Traffic Lights', icon: '🚦' },
    { platform: 'plc', prompt: 'Conveyor belt controller with product counting and jam detection', label: 'Conveyor Control', icon: '🏗️' },
    { platform: 'plc', prompt: 'Tank water level controller with pump and valve automation', label: 'Tank Level Control', icon: '💧' },
  ],
};

export function AICodeAssistant() {
  const [platform, setPlatform] = useState('arduino');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeTitle, setCodeTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [useOnline, setUseOnline] = useState(true);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('eezone_openrouter_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('eezone_openrouter_key', val);
  };

  const generateCode = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setGeneratedCode('');
    setCodeTitle('');
    
    try {
      const response = await fetch('/api/ai-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, prompt: prompt.trim(), useOnlineAI: useOnline, apiKey }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }
      
      let code = data.code || '';
      // Clean up markdown code block wrappers
      const codeMatch = code.match(/```(?:[a-zA-Z0-9_+\-]*\n)?([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        code = codeMatch[1].trim();
      } else {
        code = code.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
      }
      setGeneratedCode(code);
      setCodeTitle(data.title || `${platform.toUpperCase()} Generated Code`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExample = (example: QuickExample) => {
    setPlatform(example.platform);
    setPrompt(example.prompt);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const extensions: Record<string, string> = {
      plc: 'st',
      arduino: 'ino',
      esp32: 'ino'
    };
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eezone_${platform}_code.${extensions[platform] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentExamples = quickExamples[platform] || [];

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="h-6 w-6 text-[#FF00C8]" />
            AI Code Assistant
            <Badge className={useOnline ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs ml-2 cursor-pointer transition-all" : "bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-2 cursor-pointer transition-all"} onClick={() => setUseOnline(!useOnline)}>
              {useOnline ? <Zap className="h-3 w-3 mr-1" /> : <Code className="h-3 w-3 mr-1" />}
              {useOnline ? 'Online (AI Powered)' : 'Offline (Local Templates)'}
            </Badge>
          </CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Generate production-ready PLC, Arduino, and ESP32 code instantly — powered by OpenRouter AI & EE ZONE code engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-white">Target Platform</label>
              <Select value={platform} onValueChange={(val) => { setPlatform(val); setGeneratedCode(''); setCodeTitle(''); }}>
                <SelectTrigger className="glass-surface border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plc">🏭 PLC (IEC 61131-3 Structured Text)</SelectItem>
                  <SelectItem value="arduino">🔌 Arduino (C++)</SelectItem>
                  <SelectItem value="esp32">📡 ESP32 (WiFi/BLE IoT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-white">Generation Engine</label>
              <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setUseOnline(true)}
                  className={`flex-1 flex items-center justify-center text-sm py-1.5 rounded-md transition-all ${useOnline ? 'bg-green-500/20 text-green-400 font-medium' : 'text-white/60 hover:text-white'}`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Online AI (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setUseOnline(false)}
                  className={`flex-1 flex items-center justify-center text-sm py-1.5 rounded-md transition-all ${!useOnline ? 'bg-[#9C4AFF]/20 text-[#FF00C8] font-medium' : 'text-white/60 hover:text-white'}`}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Local Templates
                </button>
              </div>
            </div>
          </div>

          {useOnline && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-green-400" />
                  Custom OpenRouter API Key <span className="text-xs text-white/50">(Optional — server key is active)</span>
                </span>
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-xs text-[#00D4FF] hover:underline">Get a key &rarr;</a>
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Leave blank to use server API key or enter sk-or-v1-..."
                className="glass-surface border-white/20 text-white placeholder:text-white/30 font-mono"
              />
              <p className="text-xs text-[#B8A7E0]">By default, requests use the platform&apos;s configured AI key. You can also provide your own personal key.</p>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Quick Examples — click to load</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentExamples.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => loadExample(example)}
                  className="justify-start text-left h-auto py-2.5 px-3 glass-surface border-white/20 text-white hover:bg-white/10 hover:border-[#9C4AFF]/50 transition-all"
                >
                  <span className="mr-2 text-lg">{example.icon}</span>
                  <span className="text-sm truncate">{example.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Describe what you want to code</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a temperature monitoring system with LCD display and alarm when temperature exceeds 50°C"
              rows={4}
              className="glass-surface border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <Button 
            onClick={generateCode}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-[#9C4AFF] to-[#FF00C8] text-white hover:opacity-90"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Code
              </>
            )}
          </Button>

          {generatedCode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                    <Code className="h-5 w-5 text-[#FF00C8]" />
                    {codeTitle || 'Generated Code'}
                  </h3>
                  <p className="text-xs text-[#B8A7E0] mt-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Generated by EE ZONE Code Engine • {platform.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyCode} variant="outline" size="sm" className="glass-surface border-white/20 text-white hover:bg-white/10">
                    {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button onClick={downloadCode} variant="outline" size="sm" className="glass-surface border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Download .{platform === 'plc' ? 'st' : 'ino'}
                  </Button>
                </div>
              </div>

              <Card className="bg-[#0a0a1a] border-[#9C4AFF]/30">
                <CardContent className="pt-6">
                  <pre className="text-sm overflow-x-auto text-green-400 font-mono whitespace-pre-wrap" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <code>{generatedCode}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {!generatedCode && !isGenerating && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <Code className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select a platform, choose an example or describe your project, then click Generate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}