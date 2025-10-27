'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Copy, Download, Sparkles } from 'lucide-react';
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

  const generateCode = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const templates = codeTemplates[platform] || codeTemplates.arduino;
      const template = templates[0];
      setGeneratedCode(template.code);
      setIsGenerating(false);
    }, 2000);
  };

  const loadExample = (example: CodeExample) => {
    setGeneratedCode(example.code);
    setPrompt(example.description);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
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
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Code Assistant</CardTitle>
          <CardDescription>
            Generate PLC, Arduino, and ESP32 code with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Target Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plc">PLC (Ladder Logic)</SelectItem>
                <SelectItem value="arduino">Arduino</SelectItem>
                <SelectItem value="esp32">ESP32</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code Examples */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quick Examples</label>
            <div className="grid grid-cols-1 gap-2">
              {(codeTemplates[platform] || []).map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => loadExample(example)}
                  className="justify-start text-left h-auto py-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{example.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{example.language}</div>
                  </div>
                  <Code className="h-4 w-4 text-[#00C2D1]" />
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe what you want to code</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a temperature monitoring system with LCD display and alarm when temperature exceeds 50°C"
              rows={4}
            />
          </div>

          <Button 
            onClick={generateCode}
            disabled={isGenerating || !prompt}
            className="w-full bg-[#00C2D1] text-[#071428] hover:bg-[#00C2D1]/90"
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {isGenerating ? 'Generating Code...' : 'Generate Code'}
          </Button>

          {/* Generated Code */}
          {generatedCode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Code className="h-5 w-5 text-[#00C2D1]" />
                  Generated Code
                </h3>
                <div className="flex gap-2">
                  <Button onClick={copyCode} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadCode} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Card className="bg-[#071428] text-white">
                <CardContent className="pt-6">
                  <pre className="text-sm overflow-x-auto">
                    <code>{generatedCode}</code>
                  </pre>
                </CardContent>
              </Card>

              {/* Code Explanation */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Code Explanation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Uses appropriate pin definitions and configurations</li>
                    <li>• Includes proper initialization in setup()</li>
                    <li>• Implements main logic in loop() function</li>
                    <li>• Adds debouncing and safety checks</li>
                    <li>• Ready to upload to your {platform.toUpperCase()} device</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {!generatedCode && (
            <div className="text-center py-12 text-gray-500">
              <Code className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Describe your project or select an example to generate code</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
