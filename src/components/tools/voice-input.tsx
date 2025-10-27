'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Calculator, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VoiceCommand {
  command: string;
  result: string;
  timestamp: string;
}

export function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);

  const simulateVoiceRecognition = () => {
    setIsListening(true);
    
    setTimeout(() => {
      const sampleCommands = [
        'Calculate voltage drop for 100 feet of 12 AWG wire at 20 amps',
        'What is the ampacity of 10 AWG copper wire?',
        'Search for GFCI requirements in bathrooms'
      ];
      
      const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
      setTranscript(randomCommand);
      
      setTimeout(() => {
        const newCommand: VoiceCommand = {
          command: randomCommand,
          result: 'Processing your request...',
          timestamp: new Date().toLocaleTimeString()
        };
        setCommands([newCommand, ...commands]);
        setIsListening(false);
        setTranscript('');
      }, 1000);
    }, 2000);
  };

  const exampleCommands = [
    'Calculate wire size for 50 amp circuit',
    'What is Ohm\'s law?',
    'Search for motor protection requirements',
    'Convert 240 volts to kilovolts',
    'Show me conduit fill calculations'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Input Assistant</CardTitle>
          <CardDescription>
            Hands-free queries for field work - ask questions using your voice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Control */}
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#071428] to-[#0a1d38] rounded-lg text-white">
            <div className="relative mb-6">
              <button
                onClick={simulateVoiceRecognition}
                disabled={isListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-[#00C2D1] hover:bg-[#00C2D1]/90'
                }`}
              >
                {isListening ? (
                  <Mic className="h-12 w-12" />
                ) : (
                  <MicOff className="h-12 w-12 text-[#071428]" />
                )}
              </button>
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping" />
              )}
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">
                {isListening ? 'Listening...' : 'Tap to Speak'}
              </h3>
              <p className="text-sm opacity-80">
                {isListening 
                  ? 'Say your question or command' 
                  : 'Ask about calculations, codes, or procedures'
                }
              </p>
            </div>

            {transcript && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg w-full">
                <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                  <Volume2 className="h-4 w-4" />
                  <span>You said:</span>
                </div>
                <p className="text-lg">{transcript}</p>
              </div>
            )}
          </div>

          {/* Example Commands */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Example Voice Commands</label>
            <div className="grid grid-cols-1 gap-2">
              {exampleCommands.map((command, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Volume2 className="h-4 w-4 text-[#00C2D1] flex-shrink-0" />
                  <span className="text-sm">{command}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Commands */}
          {commands.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Recent Commands</h3>
              <div className="space-y-2">
                {commands.map((cmd, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <Volume2 className="h-5 w-5 text-[#00C2D1] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-[#071428] mb-1">{cmd.command}</p>
                            <p className="text-sm text-gray-600">{cmd.result}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{cmd.timestamp}</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-blue-900 mb-3">Voice Command Tips</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Works best in quiet environments</li>
                <li>• Try to be specific with your questions</li>
                <li>• Wait for the listening indicator before speaking</li>
                <li>• Perfect for hands-free operation in the field</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
