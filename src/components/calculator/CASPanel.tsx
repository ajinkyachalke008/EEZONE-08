"use client";
import { useState } from "react";
import { useCalcStore } from "@/store/calcStore";
import { differentiate, integrate, symbolicSolve, simplify, expand, factor } from "@/lib/calc-engine/cas";

type CASOperation = "diff" | "integrate" | "solve" | "simplify" | "expand" | "factor";

export function CASPanel() {
  const { inputLinear, setResults } = useCalcStore();
  const [loading, setLoading] = useState<CASOperation | null>(null);
  const [open, setOpen] = useState(false);
  const [variable, setVariable] = useState("x");

  const operations: { id: CASOperation; label: string; icon: string }[] = [
    { id: "diff", label: "d/dx", icon: "∂" },
    { id: "integrate", label: "∫dx", icon: "∫" },
    { id: "solve", label: "Solve", icon: "=" },
    { id: "simplify", label: "Simplify", icon: "≡" },
    { id: "expand", label: "Expand", icon: "→" },
    { id: "factor", label: "Factor", icon: "÷" },
  ];

  const run = async (op: CASOperation) => {
    if (!inputLinear.trim()) return;
    setLoading(op);

    try {
      let results;
      switch (op) {
        case "diff": {
          const r = await differentiate(inputLinear, variable);
          results = [{ label: `d/d${variable}`, value: r.text, numeric: null, raw: r.text }];
          break;
        }
        case "integrate": {
          const r = await integrate(inputLinear, variable);
          results = [{ label: `∫d${variable}`, value: r.text, numeric: null, raw: r.text }];
          break;
        }
        case "solve": {
          const arr = await symbolicSolve(inputLinear, variable);
          results = arr.map((r, i) => ({ label: `X${i + 1}`, value: r.text, numeric: null, raw: r.text }));
          break;
        }
        case "simplify": {
          const r = await simplify(inputLinear);
          results = [{ label: "=", value: r.text, numeric: null, raw: r.text }];
          break;
        }
        case "expand": {
          const r = await expand(inputLinear);
          results = [{ label: "expand", value: r.text, numeric: null, raw: r.text }];
          break;
        }
        case "factor": {
          const r = await factor(inputLinear);
          results = [{ label: "factor", value: r.text, numeric: null, raw: r.text }];
          break;
        }
      }
      if (results) setResults(results);
    } catch (e) {
      setResults([{ label: "Error", value: String(e), numeric: null, raw: null }]);
    } finally {
      setLoading(null);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "5px",
          background: "transparent",
          border: "1px solid #2A2E38",
          borderRadius: "8px",
          color: "#7C5CD6",
          fontFamily: '"Rajdhani", sans-serif',
          fontWeight: 600,
          fontSize: "11px",
          cursor: "pointer",
          letterSpacing: "0.05em",
          marginBottom: "4px",
        }}
      >
        CAS — Symbolic Math ▾
      </button>
    );
  }

  return (
    <div
      style={{
        background: "#111319",
        border: "1px solid rgba(124,92,214,0.3)",
        borderRadius: "10px",
        padding: "10px",
        marginBottom: "4px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: "11px", color: "#7C5CD6", letterSpacing: "0.05em" }}>
          ∑ CAS — SYMBOLIC MATH
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "11px", color: "#8A6A22" }}>var:</span>
          <input
            value={variable}
            onChange={(e) => setVariable(e.target.value.slice(0, 2) || "x")}
            style={{
              width: 32,
              background: "#08090C",
              border: "1px solid #2A2E38",
              borderRadius: "4px",
              color: "#F5D785",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "12px",
              textAlign: "center",
              padding: "2px",
              outline: "none",
            }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "#8A6A22", cursor: "pointer", fontSize: "14px" }}
          >
            ×
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => run(op.id)}
            disabled={loading !== null}
            style={{
              padding: "6px 4px",
              background: loading === op.id ? "rgba(124,92,214,0.2)" : "rgba(124,92,214,0.08)",
              border: "1px solid rgba(124,92,214,0.3)",
              borderRadius: "6px",
              color: "#7C5CD6",
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 600,
              fontSize: "11px",
              cursor: loading !== null ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "13px" }}>{loading === op.id ? "⌛" : op.icon}</span>
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
