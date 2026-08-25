"use client";
import { useState, useRef, useEffect } from "react";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";

interface ConsoleLine {
  type: "input" | "output" | "error" | "info";
  text: string;
}

export function ScriptModal() {
  const { activeModal, setActiveModal } = useCalcStore();
  const [script, setScript] = useState(`# Python script (Pyodide)
# EE Example: Parallel impedance Zp = (Z1 * Z2) / (Z1 + Z2)
import math

r1, l1_mH, f_Hz = 100, 10, 1000
xl = 2 * math.pi * f_Hz * (l1_mH * 1e-3)
z1 = complex(r1, xl)
z2 = complex(50, -50) # 50 ohm resistor + capacitor

zp = (z1 * z2) / (z1 + z2)
print(f"Z1: {z1:.2f} Ω")
print(f"Z2: {z2:.2f} Ω")
print(f"Z_parallel: {zp.real:.2f} + {zp.imag:.2f}j Ω (Magnitude: {abs(zp):.2f} Ω)")
`);
  const [output, setOutput] = useState<ConsoleLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef<unknown>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const loadPyodide = async () => {
    if (pyodideRef.current) return;
    setIsLoading(true);
    addLine("info", "Loading Pyodide (Python WASM)... please wait");

    try {
      const scriptElem = document.createElement("script");
      scriptElem.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
      document.head.appendChild(scriptElem);

      await new Promise<void>((resolve, reject) => {
        scriptElem.onload = () => resolve();
        scriptElem.onerror = () => reject(new Error("Failed to load Pyodide script"));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });
      pyodideRef.current = pyodide;
      setPyodideReady(true);
      addLine("info", "✓ Pyodide ready. Python 3.x environment loaded.");
    } catch (e) {
      addLine("error", `Failed to load Pyodide: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addLine = (type: ConsoleLine["type"], text: string) => {
    setOutput((prev) => [...prev, { type, text }]);
  };

  const runScript = async () => {
    if (!pyodideRef.current) {
      await loadPyodide();
      if (!pyodideRef.current) return;
    }

    addLine("input", `>>> Executing Python script...`);
    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = pyodideRef.current as any;

      let capturedOutput = "";
      pyodide.setStdout({
        batched: (text: string) => { capturedOutput += text + "\n"; },
      });
      pyodide.setStderr({
        batched: (text: string) => { capturedOutput += "STDERR: " + text + "\n"; },
      });

      await pyodide.runPythonAsync(script);

      if (capturedOutput.trim()) {
        capturedOutput.split("\n").filter(Boolean).forEach((line) => {
          addLine("output", line);
        });
      } else {
        addLine("output", "(no output)");
      }
    } catch (e) {
      addLine("error", e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const clearOutput = () => setOutput([]);

  if (activeModal !== "script") return null;

  const lineColors = {
    input: "#8A6A22",
    output: "#F5D785",
    error: "#EF4444",
    info: "#7C5CD6",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
    >
      <ChamferedPanel
        style={{ width: "100%", maxWidth: "520px", padding: "20px" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 13, color: "#E8B93F", letterSpacing: "0.08em" }}>
            {"</>"} PYTHON CONSOLE
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: 10,
              color: pyodideReady ? "#22C55E" : "#8A6A22",
            }}>
              {pyodideReady ? "● READY" : "○ NOT LOADED"}
            </span>
            <button
              onClick={() => setActiveModal(null)}
              style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
            >
              ×
            </button>
          </div>
        </div>

        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            background: "#08090C",
            border: "1px solid #2A2E38",
            borderRadius: "8px",
            color: "#F5D785",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "12px",
            padding: "10px",
            resize: "vertical",
            outline: "none",
            marginBottom: "8px",
          }}
          spellCheck={false}
        />

        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          <button
            onClick={runScript}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "8px",
              background: isLoading ? "#2A2E38" : "linear-gradient(135deg, #E8B93F, #8A6A22)",
              border: "none",
              borderRadius: "6px",
              color: "#08090C",
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 700,
              fontSize: "13px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "⌛ Running..." : "▶ RUN"}
          </button>
          {!pyodideReady && !isLoading && (
            <button
              onClick={loadPyodide}
              style={{
                padding: "8px 12px",
                background: "rgba(124,92,214,0.15)",
                border: "1px solid #7C5CD6",
                borderRadius: "6px",
                color: "#7C5CD6",
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Load Python
            </button>
          )}
          <button
            onClick={clearOutput}
            style={{
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid #2A2E38",
              borderRadius: "6px",
              color: "#8A6A22",
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 600,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>

        <div
          style={{
            background: "#08090C",
            border: "1px solid #2A2E38",
            borderRadius: "8px",
            padding: "10px",
            maxHeight: "180px",
            overflowY: "auto",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "11px",
            lineHeight: 1.5,
          }}
        >
          {output.length === 0 && (
            <span style={{ color: "#2A2E38" }}>Output will appear here...</span>
          )}
          {output.map((line, i) => (
            <div key={i} style={{ color: lineColors[line.type] }}>
              {line.text}
            </div>
          ))}
          <div ref={outputEndRef} />
        </div>
      </ChamferedPanel>
    </div>
  );
}
