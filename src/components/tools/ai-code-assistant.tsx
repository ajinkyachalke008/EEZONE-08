'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Copy, Download, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CodeExample {
  platform: string;
  language: string;
  code: string;
  description: string;
}

const codeTemplates: Record<string, CodeExample[]> = {
  plc: [
    {
      platform: 'PLC',
      language: 'Ladder Logic (Text)',
      code: `// Motor Start/Stop Circuit
START_BUTTON := I:0/0
STOP_BUTTON := I:0/1
MOTOR_RUN := O:0/0
OVERLOAD := I:0/2

// Latch Motor Run when Start pressed
XIC START_BUTTON
XIO STOP_BUTTON
XIO OVERLOAD
OTE MOTOR_RUN

// Seal-in circuit
XIC MOTOR_RUN
XIO STOP_BUTTON
XIO OVERLOAD
OTE MOTOR_RUN`,
      description: 'Basic motor control with start/stop and overload protection'
    }
  ],
  arduino: [
    {
      platform: 'Arduino',
      language: 'C++',
      code: `// LED PWM Dimmer with Button Control
const int ledPin = 9;
const int buttonUp = 2;
const int buttonDown = 3;
int brightness = 128;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonUp, INPUT_PULLUP);
  pinMode(buttonDown, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(buttonUp) == LOW) {
    brightness = min(255, brightness + 5);
    delay(50);
  }
  
  if (digitalRead(buttonDown) == LOW) {
    brightness = max(0, brightness - 5);
    delay(50);
  }
  
  analogWrite(ledPin, brightness);
}`,
      description: 'PWM LED dimming with button control'
    }
  ],
  esp32: [
    {
      platform: 'ESP32',
      language: 'C++',
      code: `// ESP32 WiFi Energy Monitor
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

WebServer server(80);
const int currentSensorPin = 34;
const int voltageSensorPin = 35;

float voltage = 0;
float current = 0;
float power = 0;

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.begin();
}

void loop() {
  server.handleClient();
  readSensors();
  delay(100);
}

void readSensors() {
  int voltageRaw = analogRead(voltageSensorPin);
  int currentRaw = analogRead(currentSensorPin);
  
  voltage = (voltageRaw / 4095.0) * 250.0;
  current = (currentRaw / 4095.0) * 30.0;
  power = voltage * current;
}

void handleRoot() {
  String html = "<h1>Energy Monitor</h1>";
  html += "<p>Voltage: " + String(voltage) + " V</p>";
  html += "<p>Current: " + String(current) + " A</p>";
  html += "<p>Power: " + String(power) + " W</p>";
  server.send(200, "text/html", html);
}

void handleData() {
  String json = "{\\"voltage\\":" + String(voltage);
  json += ",\\"current\\":" + String(current);
  json += ",\\"power\\":" + String(power) + "}";
  server.send(200, "application/json", json);
}`,
      description: 'WiFi-enabled power monitoring system'
    }
  ]
};

export function AICodeAssistant() {
  const [platform, setPlatform] = useState('arduino');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setGeneratedCode('');
    
    try {
      const response = await fetch('/api/ai-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }
      
      let code = data.code || '';
      code = code.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
      setGeneratedCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExample = (example: CodeExample) => {
    setGeneratedCode(example.code);
    setPrompt(example.description);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const extensions: Record<string, string> = {
      plc: 'txt',
      arduino: 'ino',
      esp32: 'ino'
    };
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}_code.${extensions[platform] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-surface border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="h-6 w-6 text-[#FF00C8]" />
            AI Code Assistant
          </CardTitle>
          <CardDescription className="text-[#B8A7E0]">
            Generate PLC, Arduino, and ESP32 code with AI assistance powered by OpenRouter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block text-white">Target Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="glass-surface border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plc">PLC (Ladder Logic / Structured Text)</SelectItem>
                <SelectItem value="arduino">Arduino</SelectItem>
                <SelectItem value="esp32">ESP32</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Quick Examples</label>
            <div className="grid grid-cols-1 gap-2">
              {(codeTemplates[platform] || []).map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => loadExample(example)}
                  className="justify-start text-left h-auto py-3 glass-surface border-white/20 text-white hover:bg-white/10"
                >
                  <div className="flex-1">
                    <div className="font-medium">{example.description}</div>
                    <div className="text-xs text-[#B8A7E0] mt-1">{example.language}</div>
                  </div>
                  <Code className="h-4 w-4 text-[#FF00C8]" />
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                  <Code className="h-5 w-5 text-[#FF00C8]" />
                  Generated Code
                </h3>
                <div className="flex gap-2">
                  <Button onClick={copyCode} variant="outline" size="sm" className="glass-surface border-white/20 text-white hover:bg-white/10">
                    {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button onClick={downloadCode} variant="outline" size="sm" className="glass-surface border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Card className="bg-[#0a0a1a] border-[#9C4AFF]/30">
                <CardContent className="pt-6">
                  <pre className="text-sm overflow-x-auto text-green-400 font-mono">
                    <code>{generatedCode}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {!generatedCode && !isGenerating && (
            <div className="text-center py-12 text-[#B8A7E0]">
              <Code className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Describe your project or select an example to generate code</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}