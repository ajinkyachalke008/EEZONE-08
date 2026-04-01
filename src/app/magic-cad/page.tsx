'use client';

import { useState, useRef, useEffect } from "react";

const CADAM_URL = process.env.NEXT_PUBLIC_MAGIC_CAD_URL || "http://localhost:5173";
type LoadState = "loading" | "ready" | "error";

export default function MagicCADPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [progress, setProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(timer.current!); return 90; }
        return p + Math.random() * 8;
      });
    }, 200);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const handleLoad = () => {
    if (timer.current) clearInterval(timer.current);
    setProgress(100);
    setTimeout(() => setLoadState("ready"), 400);
  };

  const handleError = () => {
    if (timer.current) clearInterval(timer.current);
    setLoadState("error");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 64px)", background: "#09090b", overflow: "hidden" }}>
      {/* Loading Overlay */}
      {loadState === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b", zIndex: 10, flexDirection: "column", gap: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: 64, height: 64 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} style={{ width: 16, height: 16, borderRadius: 3, background: "#3b82f6", animation: `pulse 1.2s ${i * 80}ms ease-in-out infinite alternate`, display: "block" }} />
            ))}
          </div>
          <h1 style={{ color: "#f4f4f5", fontSize: "2rem", margin: 0 }}>Magic<span style={{ color: "#3b82f6" }}> CAD</span></h1>
          <p style={{ color: "#52525b", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>NVIDIA NIM · OpenSCAD WASM · Three.js</p>
          <div style={{ width: 320, height: 2, background: "#27272a", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`, background: "linear-gradient(90deg, #1d4ed8, #3b82f6)", transition: "width 0.3s ease", boxShadow: "0 0 12px #3b82f680" }} />
          </div>
          <style>{`@keyframes pulse { 0% { opacity: 0.15; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
      )}

      {/* Error Overlay */}
      {loadState === "error" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b", zIndex: 10 }}>
          <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: 12, padding: "40px 32px", maxWidth: 460, textAlign: "center", fontFamily: "monospace" }}>
            <div style={{ color: "#ef4444", marginBottom: 12 }}>⚠</div>
            <h2 style={{ color: "#f4f4f5", marginBottom: 8 }}>Magic CAD Offline</h2>
            <p style={{ color: "#71717a", fontSize: "0.8rem", marginBottom: 16 }}>CADAM not reachable at <code style={{ color: "#a1a1aa" }}>{CADAM_URL}</code></p>
            <pre style={{ background: "#0c0c0e", border: "1px solid #27272a", borderRadius: 8, padding: 16, textAlign: "left", fontSize: "0.75rem", color: "#a1a1aa", overflow: "auto" }}>
{`cd apps/magic-cad
npx supabase start
npx supabase functions serve --no-verify-jwt
npm run dev`}
            </pre>
            <button onClick={() => { setLoadState("loading"); setProgress(0); if (iframeRef.current) iframeRef.current.src = CADAM_URL; }} style={{ marginTop: 16, padding: "10px 28px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* CADAM iframe */}
      <iframe
        ref={iframeRef}
        src={CADAM_URL}
        title="Magic CAD — CADAM"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", opacity: loadState === "ready" ? 1 : 0, transition: "opacity 0.5s ease" }}
        onLoad={handleLoad}
        onError={handleError}
        allow="clipboard-read; clipboard-write; camera; microphone"
      />
    </div>
  );
}
