'use client';

/**
 * EE Zone Web Audio Acoustic Physics Synthesizer Engine
 * Generates realistic physical sounds for DC Motors, AC Transformers,
 * Relays, Switches, Piezo Buzzers, and Overload Circuit Breakers.
 */
class LabSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Motor Sound Nodes
  private motorOsc1: OscillatorNode | null = null;
  private motorOsc2: OscillatorNode | null = null;
  private motorNoise: AudioBufferSourceNode | null = null;
  private motorGain: GainNode | null = null;
  private motorRunning: boolean = false;

  // Transformer Sound Nodes
  private xfmrOsc50: OscillatorNode | null = null;
  private xfmrOsc100: OscillatorNode | null = null;
  private xfmrOsc150: OscillatorNode | null = null;
  private xfmrGain: GainNode | null = null;
  private xfmrRunning: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('ee_zone_sound_muted');
      this.isMuted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ee_zone_sound_muted', String(muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // === 1. TACTILE KEY CLICK ===
  public playKeyClick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // === 2. ROTARY SWITCH / RELAY SNAP ===
  public playRelaySnap() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // === 3. DC MOTOR ACOUSTIC SYNTHESIZER ===
  public setMotorRPM(rpm: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (rpm <= 10) {
      this.stopMotorSound();
      return;
    }

    const now = this.ctx.currentTime;
    const shaftFreq = Math.max(10, rpm / 60); // Fundamental Hz
    const commutatorFreq = shaftFreq * 12; // 12-slot commutator whine

    if (!this.motorRunning) {
      this.motorOsc1 = this.ctx.createOscillator();
      this.motorOsc2 = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc1.type = 'sawtooth';
      this.motorOsc2.type = 'triangle';

      this.motorGain.gain.setValueAtTime(0.001, now);
      this.motorGain.gain.linearRampToValueAtTime(0.12, now + 0.2);

      this.motorOsc1.connect(this.motorGain);
      this.motorOsc2.connect(this.motorGain);
      this.motorGain.connect(this.masterGain);

      this.motorOsc1.start();
      this.motorOsc2.start();
      this.motorRunning = true;
    }

    if (this.motorOsc1 && this.motorOsc2) {
      this.motorOsc1.frequency.setTargetAtTime(shaftFreq, now, 0.1);
      this.motorOsc2.frequency.setTargetAtTime(commutatorFreq, now, 0.1);
    }
  }

  public stopMotorSound() {
    if (this.motorRunning && this.motorGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.motorGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      setTimeout(() => {
        try {
          this.motorOsc1?.stop();
          this.motorOsc2?.stop();
        } catch (e) {}
        this.motorRunning = false;
      }, 250);
    }
  }

  // === 4. AC TRANSFORMER MAGNETOSTRICTION HUM (50Hz + Harmonics) ===
  public setTransformerLoad(loadPercentage: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (loadPercentage <= 0) {
      this.stopTransformerSound();
      return;
    }

    const now = this.ctx.currentTime;
    const targetGain = Math.min(0.2, (loadPercentage / 100) * 0.15 + 0.02);

    if (!this.xfmrRunning) {
      this.xfmrOsc50 = this.ctx.createOscillator();
      this.xfmrOsc100 = this.ctx.createOscillator();
      this.xfmrOsc150 = this.ctx.createOscillator();
      this.xfmrGain = this.ctx.createGain();

      this.xfmrOsc50.type = 'sine';
      this.xfmrOsc50.frequency.setValueAtTime(50, now);

      this.xfmrOsc100.type = 'sine';
      this.xfmrOsc100.frequency.setValueAtTime(100, now);

      this.xfmrOsc150.type = 'triangle';
      this.xfmrOsc150.frequency.setValueAtTime(150, now);

      this.xfmrGain.gain.setValueAtTime(0.001, now);
      this.xfmrGain.gain.linearRampToValueAtTime(targetGain, now + 0.3);

      this.xfmrOsc50.connect(this.xfmrGain);
      this.xfmrOsc100.connect(this.xfmrGain);
      this.xfmrOsc150.connect(this.xfmrGain);
      this.xfmrGain.connect(this.masterGain);

      this.xfmrOsc50.start();
      this.xfmrOsc100.start();
      this.xfmrOsc150.start();
      this.xfmrRunning = true;
    } else if (this.xfmrGain) {
      this.xfmrGain.gain.setTargetAtTime(targetGain, now, 0.2);
    }
  }

  public stopTransformerSound() {
    if (this.xfmrRunning && this.xfmrGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.xfmrGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      setTimeout(() => {
        try {
          this.xfmrOsc50?.stop();
          this.xfmrOsc100?.stop();
          this.xfmrOsc150?.stop();
        } catch (e) {}
        this.xfmrRunning = false;
      }, 250);
    }
  }

  // === 5. ARDUINO PIEZO BUZZER TONE ===
  public playArduinoTone(freq: number, durationMs: number = 200) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || freq <= 20) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + durationMs / 1000);
  }

  // === 6. CIRCUIT BREAKER OVERLOAD TRIP ===
  public playOverloadTrip() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const soundEngine = new LabSoundEngine();
