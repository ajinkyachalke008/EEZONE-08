// Browser-native Speech Recognition & Synthesis Engine for AI Viva Examiner

export interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

export type SpeechState = 'idle' | 'listening' | 'speaking' | 'processing' | 'error';

class SpeechController {
  private recognition: any = null;
  private isRecognitionSupported = false;
  private isSynthesisSupported = false;
  private voices: SpeechSynthesisVoice[] = [];
  private isListening = false;
  private isSpeaking = false;
  private silenceTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isRecognitionSupported = true;
      }

      if ('speechSynthesis' in window) {
        this.isSynthesisSupported = true;
        this.loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getSupported(): { recognition: boolean; synthesis: boolean } {
    return {
      recognition: this.isRecognitionSupported,
      synthesis: this.isSynthesisSupported,
    };
  }

  public startListening(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (err: string) => void,
    onStateChange: (state: SpeechState) => void
  ) {
    if (!this.recognition) {
      onError('Speech Recognition is not supported on this browser. Please type your response.');
      return;
    }

    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    try {
      this.isListening = true;
      onStateChange('listening');

      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          onInterim(interimTranscript);
          // Reset silence timer on new speech activity
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.isListening) {
              this.stopListening();
            }
          }, 3000);
        }

        if (finalTranscript) {
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          onFinal(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onStateChange('idle');
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onStateChange('idle');
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onStateChange('idle');
      onError(e.message || 'Failed to start microphone');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
  }

  public speak(
    text: string,
    persona: 'strict' | 'supportive' = 'strict',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stopSpeaking();
    this.stopListening();

    // Clean text of markdown formatting (backticks, asterisks, hash signs) for speech
    const cleanText = text
      .replace(/[*#`_~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (this.voices.length === 0) {
      this.loadVoices();
    }

    // Select suitable natural voice based on persona
    if (persona === 'strict') {
      utterance.pitch = 0.92;
      utterance.rate = 1.0;
      const maleVoice = this.voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('guy') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('george') ||
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('alex'))
      );
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      utterance.pitch = 1.08;
      utterance.rate = 1.04;
      const femaleVoice = this.voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('victoria') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('google us english'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }
}

export const speechController = new SpeechController();
