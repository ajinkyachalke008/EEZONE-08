"use client";
import { useState } from "react";
import { useCalcStore } from "@/store/calcStore";

export function HistoryPanel() {
  const { history, setInputLinear, setInputLatex, clearHistory } = useCalcStore();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "6px",
          background: "transparent",
          border: "1px solid #2A2E38",
          borderRadius: "8px",
          color: "#8A6A22",
          fontFamily: '"Rajdhani", sans-serif',
          fontWeight: 600,
          fontSize: "11px",
          cursor: "pointer",
          letterSpacing: "0.05em",
          display: history.length > 0 ? "block" : "none",
          marginTop: "4px",
        }}
      >
        Calculation History ⟲ ({history.length})
      </button>
    );
  }

  return (
    <div
      style={{
        background: "#111319",
        border: "1px solid #2A2E38",
        borderRadius: "12px",
        padding: "12px",
        marginTop: "4px",
        maxHeight: "260px",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: "12px", color: "#E8B93F" }}>
          CALCULATION HISTORY
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={clearHistory}
            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "11px", fontFamily: '"Rajdhani", sans-serif' }}
          >
            Clear All
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "#8A6A22", cursor: "pointer", fontSize: "14px" }}
          >
            ×
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{ color: "#5A6072", fontFamily: '"Rajdhani", sans-serif', fontSize: "12px", textAlign: "center", padding: "16px" }}>
          No past calculations
        </div>
      ) : (
        history.map((entry) => (
          <div
            key={entry.id}
            onClick={() => {
              setInputLinear(entry.inputLinear);
              setInputLatex(entry.inputLatex);
              setOpen(false);
            }}
            style={{
              padding: "6px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              borderBottom: "1px solid #2A2E38",
              marginBottom: "4px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#181B22")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "12px", color: "#F5D785", marginBottom: "2px" }}>
              {entry.inputLinear}
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "11px", color: "#8A6A22" }}>
              {entry.results.map((r) => `${r.label}: ${r.value}`).join("   ")}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
