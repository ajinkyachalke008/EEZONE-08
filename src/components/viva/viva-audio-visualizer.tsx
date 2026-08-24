'use client';

import React, { useEffect, useRef } from 'react';
import { SpeechState } from '@/lib/audio/speech-controller';

interface VivaAudioVisualizerProps {
  state: SpeechState;
  persona: 'strict' | 'supportive';
}

export const VivaAudioVisualizer: React.FC<VivaAudioVisualizerProps> = ({
  state,
  persona,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Dark background grid
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Oscilloscope grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Dynamic waveform based on SpeechState
      const primaryColor = persona === 'strict' ? '#06b6d4' : '#a855f7'; // Cyan for Dr. Sharma, Purple for Prof. Chen
      const secondaryColor = state === 'listening' ? '#10b981' : state === 'speaking' ? '#f59e0b' : '#38bdf8';

      let amplitude = 4;
      let frequency = 0.02;
      let speed = 0.04;

      if (state === 'speaking') {
        amplitude = 24 + Math.sin(phase * 3) * 10;
        frequency = 0.04;
        speed = 0.12;
      } else if (state === 'listening') {
        amplitude = 18 + Math.sin(phase * 4) * 8;
        frequency = 0.035;
        speed = 0.09;
      } else if (state === 'processing') {
        amplitude = 12;
        frequency = 0.06;
        speed = 0.15;
      }

      // Glow effect
      ctx.shadowBlur = 12;
      ctx.shadowColor = secondaryColor;

      // Draw primary wave
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * frequency + phase) * amplitude * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw harmonic overlay wave
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * frequency * 1.6 - phase * 1.2) * (amplitude * 0.6) * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0; // Reset shadow

      phase += speed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, persona]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
      <canvas
        ref={canvasRef}
        width={480}
        height={85}
        className="w-full h-[85px] block select-none"
      />
      <div className="absolute top-2 right-3 font-mono text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            state === 'speaking'
              ? 'bg-amber-400 animate-pulse'
              : state === 'listening'
              ? 'bg-emerald-400 animate-ping'
              : state === 'processing'
              ? 'bg-cyan-400 animate-spin'
              : 'bg-slate-600'
          }`}
        />
        <span>
          {state === 'speaking'
            ? 'EXAMINER SPEAKING'
            : state === 'listening'
            ? 'LISTENING TO MIC...'
            : state === 'processing'
            ? 'EVALUATING RUBRIC...'
            : 'READY'}
        </span>
      </div>
    </div>
  );
};
