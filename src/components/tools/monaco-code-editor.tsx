'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Upload, 
  Code2, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface MonacoCodeEditorProps {
  onRun?: (code: string) => void;
  onStop?: () => void;
  defaultCode?: string;
  className?: string;
}

// Arduino code snippets
const arduinoSnippets = [
  {
    name: 'Blink LED',
    category: 'Basic',
    code: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`,
  },
  {
    name: 'Serial Print',
    category: 'Communication',
    code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("Hello World!");
  delay(1000);
}`,
  },
  {
    name: 'Analog Read',
    category: 'Sensors',
    code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(A0);
  Serial.println(sensorValue);
  delay(100);
}`,
  },
  {
    name: 'PWM Output',
    category: 'Output',
    code: `const int pwmPin = 9;

void setup() {
  pinMode(pwmPin, OUTPUT);
}

void loop() {
  for (int brightness = 0; brightness <= 255; brightness++) {
    analogWrite(pwmPin, brightness);
    delay(10);
  }
  for (int brightness = 255; brightness >= 0; brightness--) {
    analogWrite(pwmPin, brightness);
    delay(10);
  }
}`,
  },
  {
    name: 'Button Input',
    category: 'Input',
    code: `const int buttonPin = 2;
const int ledPin = 13;
int buttonState = 0;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

void loop() {
  buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,
  },
  {
    name: 'Ultrasonic Sensor',
    category: 'Sensors',
    code: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2;
  
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  delay(100);
}`,
  },
  {
    name: 'Servo Motor',
    category: 'Output',
    code: `#include <Servo.h>

Servo myservo;

void setup() {
  myservo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos++) {
    myservo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos--) {
    myservo.write(pos);
    delay(15);
  }
}`,
  },
  {
    name: 'LCD Display',
    category: 'Output',
    code: `#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  lcd.begin(16, 2);
  lcd.print("Hello World!");
}

void loop() {
  lcd.setCursor(0, 1);
  lcd.print(millis() / 1000);
}`,
  },
];

// Board configurations
const boardConfigs = [
  { name: 'Arduino Uno', value: 'uno', cpu: 'ATmega328P' },
  { name: 'Arduino Mega', value: 'mega', cpu: 'ATmega2560' },
  { name: 'Arduino Nano', value: 'nano', cpu: 'ATmega328P' },
  { name: 'ESP32', value: 'esp32', cpu: 'ESP32-WROOM' },
  { name: 'ESP8266', value: 'esp8266', cpu: 'ESP8266' },
];

export function MonacoCodeEditor({
  onRun,
  onStop,
  defaultCode = '// Arduino Code\nvoid setup() {\n  // Initialize\n}\n\nvoid loop() {\n  // Main code\n}',
  className,
}: MonacoCodeEditorProps) {
  const [code, setCode] = useState(defaultCode);
  const [selectedBoard, setSelectedBoard] = useState('uno');
  const [isRunning, setIsRunning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const editorRef = useRef<any>(null);

  // Basic code validation
  const validateCode = (code: string) => {
    const errors: string[] = [];
    
    if (!code.includes('void setup()')) {
      errors.push('Missing setup() function');
    }
    if (!code.includes('void loop()')) {
      errors.push('Missing loop() function');
    }
    
    // Check for common mistakes
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('digitalWrite') && !line.includes('pinMode')) {
        // This is a simplified check - in real code, we'd need more context
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Arduino-like syntax highlighting
    monaco.languages.register({ id: 'arduino' });
    monaco.languages.setMonarchTokensProvider('arduino', {
      keywords: [
        'void', 'int', 'float', 'double', 'char', 'boolean', 'byte',
        'setup', 'loop', 'if', 'else', 'for', 'while', 'do', 'switch',
        'case', 'break', 'continue', 'return', 'pinMode', 'digitalWrite',
        'digitalRead', 'analogWrite', 'analogRead', 'delay', 'millis',
        'Serial', 'begin', 'print', 'println', 'HIGH', 'LOW', 'INPUT',
        'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN', 'true', 'false',
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
      ],
      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          { include: '@whitespace' },
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\/\*/, 'comment', '@push'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
      },
    });
  };

  const handleRun = () => {
    if (validateCode(code)) {
      setIsRunning(true);
      onRun?.(code);
      toast.success('Code compiled and running', {
        description: `Board: ${boardConfigs.find(b => b.value === selectedBoard)?.name}`,
      });
    } else {
      toast.error('Code validation failed', {
        description: validationErrors.join(', '),
      });
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop?.();
    toast.info('Program stopped');
  };

  const handleReset = () => {
    setCode(defaultCode);
    setValidationErrors([]);
    toast.info('Code reset to default');
  };

  const handleLoadSnippet = (snippet: string) => {
    setCode(snippet);
    validateCode(snippet);
    toast.success('Snippet loaded');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arduino_${Date.now()}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ino,.cpp,.c';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setCode(content);
          validateCode(content);
          toast.success('Code uploaded');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  useEffect(() => {
    validateCode(code);
  }, [code]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <Card className="glass-surface border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#9C4AFF]" />
              Arduino Code Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              {isRunning && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Running
                </Badge>
              )}
              {validationErrors.length === 0 ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* Board Selection */}
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="w-[200px] glass-surface border-white/20 text-white">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent className="glass-surface border-white/20">
                {boardConfigs.map((board) => (
                  <SelectItem key={board.value} value={board.value} className="text-white">
                    {board.name}
                    <span className="text-xs text-[#B8A7E0] ml-2">({board.cpu})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRun}
                disabled={isRunning || validationErrors.length > 0}
                className="gradient-violet hover:shadow-glowViolet text-white"
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? 'Running...' : 'Compile & Run'}
              </Button>
              {isRunning && (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="sm"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              )}
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* File Operations */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={handleUpload}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor and Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Code Editor */}
        <Card className="glass-surface border-white/10 lg:col-span-3">
          <CardContent className="p-0">
            <Editor
              height="500px"
              defaultLanguage="arduino"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </CardContent>
        </Card>

        {/* Code Snippets */}
        <Card className="glass-surface border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#00E5FF]" />
              Code Snippets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="Basic" className="w-full">
              <TabsList className="grid grid-cols-2 glass-surface">
                <TabsTrigger value="Basic" className="text-xs">Basic</TabsTrigger>
                <TabsTrigger value="Sensors" className="text-xs">Sensors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="Basic" className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
                {arduinoSnippets
                  .filter((s) => s.category === 'Basic' || s.category === 'Communication' || s.category === 'Input' || s.category === 'Output')
                  .map((snippet, index) => (
                    <Button
                      key={index}
                      onClick={() => handleLoadSnippet(snippet.code)}
                      variant="outline"
                      className="w-full justify-start text-xs border-white/20 text-white hover:bg-white/10"
                      size="sm"
                    >
                      {snippet.name}
                    </Button>
                  ))}
              </TabsContent>
              
              <TabsContent value="Sensors" className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
                {arduinoSnippets
                  .filter((s) => s.category === 'Sensors')
                  .map((snippet, index) => (
                    <Button
                      key={index}
                      onClick={() => handleLoadSnippet(snippet.code)}
                      variant="outline"
                      className="w-full justify-start text-xs border-white/20 text-white hover:bg-white/10"
                      size="sm"
                    >
                      {snippet.name}
                    </Button>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="glass-surface border-red-500/30 bg-red-500/10">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-400">Code Validation Errors:</p>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-300">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
