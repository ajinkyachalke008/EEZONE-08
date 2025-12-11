'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Volume2, Copy, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Translation {
  english: string;
  spanish: string;
  mandarin: string;
  hindi: string;
}

const commonPhrases: Translation[] = [
  {
    english: 'Turn off the power at the breaker',
    spanish: 'Apaga la energía en el interruptor',
    mandarin: '在断路器处关闭电源',
    hindi: 'ब्रेकर पर बिजली बंद करें'
  },
  {
    english: 'Check the voltage with a multimeter',
    spanish: 'Verifica el voltaje con un multímetro',
    mandarin: '用万用表检查电压',
    hindi: 'मल्टीमीटर से वोल्टेज जांचें'
  },
  {
    english: 'Connect the ground wire to the green screw',
    spanish: 'Conecta el cable de tierra al tornillo verde',
    mandarin: '将接地线连接到绿色螺丝',
    hindi: 'ग्राउंड वायर को हरे स्क्रू से कनेक्ट करें'
  },
  {
    english: 'The circuit is overloaded',
    spanish: 'El circuito está sobrecargado',
    mandarin: '电路过载',
    hindi: 'सर्किट ओवरलोड है'
  },
  {
    english: 'Wear safety glasses and gloves',
    spanish: 'Usa gafas de seguridad y guantes',
    mandarin: '戴上安全眼镜和手套',
    hindi: 'सुरक्षा चश्मा और दस्ताने पहनें'
  }
];

const technicalTerms = [
  { term: 'Voltage', es: 'Voltaje', zh: '电压', hi: 'वोल्टेज' },
  { term: 'Current', es: 'Corriente', zh: '电流', hi: 'करंट' },
  { term: 'Resistance', es: 'Resistencia', zh: '电阻', hi: 'प्रतिरोध' },
  { term: 'Power', es: 'Potencia', zh: '功率', hi: 'शक्ति' },
  { term: 'Ground', es: 'Tierra', zh: '接地', hi: 'ग्राउंड' },
  { term: 'Neutral', es: 'Neutro', zh: '中性线', hi: 'न्यूट्रल' },
  { term: 'Circuit Breaker', es: 'Interruptor', zh: '断路器', hi: 'सर्किट ब्रेकर' },
  { term: 'Outlet', es: 'Toma', zh: '插座', hi: 'आउटलेट' }
];

export function MultiLanguageSupport() {
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [selectedCategory, setSelectedCategory] = useState('phrases');
  const [copied, setCopied] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const playAudio = (text: string) => {
    // Text-to-speech - silent for now (would use browser TTS API)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getTranslation = (phrase: Translation) => {
    switch (selectedLanguage) {
      case 'spanish':
        return phrase.spanish;
      case 'mandarin':
        return phrase.mandarin;
      case 'hindi':
        return phrase.hindi;
      default:
        return phrase.english;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Language Support</CardTitle>
          <CardDescription>
            Translate electrical terms and phrases - Spanish, Mandarin, and Hindi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spanish">🇪🇸 Spanish (Español)</SelectItem>
                  <SelectItem value="mandarin">🇨🇳 Mandarin (中文)</SelectItem>
                  <SelectItem value="hindi">🇮🇳 Hindi (हिन्दी)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phrases">Common Phrases</SelectItem>
                  <SelectItem value="terms">Technical Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Common Phrases */}
          {selectedCategory === 'phrases' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Common Electrical Phrases</h3>
              <div className="space-y-2">
                {commonPhrases.map((phrase, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">English:</div>
                            <p className="font-medium text-gray-900">{phrase.english}</p>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <Badge className="mb-2">
                                {selectedLanguage === 'spanish' && '🇪🇸 Spanish'}
                                {selectedLanguage === 'mandarin' && '🇨🇳 Mandarin'}
                                {selectedLanguage === 'hindi' && '🇮🇳 Hindi'}
                              </Badge>
                              <p className="text-lg font-semibold text-[#071428]">
                                {getTranslation(phrase)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playAudio(getTranslation(phrase))}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(getTranslation(phrase), idx)}
                              >
                                {copied === idx ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Technical Terms */}
          {selectedCategory === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Technical Terms Dictionary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {technicalTerms.map((term, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">English</div>
                          <p className="font-semibold text-gray-900">{term.term}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => playAudio(term.term)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              {selectedLanguage === 'spanish' && 'Spanish'}
                              {selectedLanguage === 'mandarin' && 'Mandarin'}
                              {selectedLanguage === 'hindi' && 'Hindi'}
                            </div>
                            <p className="text-lg font-semibold text-[#00C2D1]">
                              {selectedLanguage === 'spanish' && term.es}
                              {selectedLanguage === 'mandarin' && term.zh}
                              {selectedLanguage === 'hindi' && term.hi}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => playAudio(
                                selectedLanguage === 'spanish' ? term.es :
                                selectedLanguage === 'mandarin' ? term.zh : term.hi
                              )}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(
                                selectedLanguage === 'spanish' ? term.es :
                                selectedLanguage === 'mandarin' ? term.zh : term.hi,
                                idx
                              )}
                            >
                              {copied === idx ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Features Info */}
          <Card className="bg-gradient-to-br from-[#071428] to-[#0a1d38] text-white">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#00C2D1]" />
                Multi-Language Features
              </h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• 📱 Text-to-speech pronunciation guide</li>
                <li>• 📋 Copy translations instantly</li>
                <li>• 🌍 Support for Spanish, Mandarin, and Hindi</li>
                <li>• 🔧 Technical terminology dictionary</li>
                <li>• 💬 Common workplace phrases</li>
                <li>• 🎯 Field-ready communication tools</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}