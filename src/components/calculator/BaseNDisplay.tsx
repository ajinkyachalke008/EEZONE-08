"use client";
import { useState } from "react";
import { useCalcStore } from "@/store/calcStore";
import { allBaseRepresentations, type WordSize } from "@/lib/calc-engine/basen";

export function BaseNDisplay() {
  const { results, base, setBase, appendToInput } = useCalcStore();
  const [twosComplement, setTwosComplement] = useState(true);
  const [wordSize, setWordSize] = useState<WordSize>(32);

  const bases = ["DEC", "HEX", "BIN", "OCT"] as const;

  if (base === "DEC") return null;

  const numericVal = results[0]?.numeric ?? (results[0]?.raw && typeof results[0].raw === "number" ? results[0].raw : null);
  const representations =
    numericVal !== null && typeof numericVal === "number" && isFinite(numericVal)
      ? allBaseRepresentations(numericVal, wordSize, twosComplement)
      : { DEC: "0", HEX: "0x0", BIN: "0b0", OCT: "0o0" };

  return (
    <div
      style={{
        background: "#111319",
        border: "1px solid rgba(232,185,63,0.3)",
        borderRadius: "10px",
        padding: "10px 12px",
        marginBottom: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 700,
            fontSize: "11px",
            color: "#E8B93F",
            letterSpacing: "0.08em",
          }}
        >
          BASE-N PROGRAMMER MODE ({base})
        </span>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* Word size selector */}
          <div style={{ display: "flex", gap: "2px" }}>
            {([8, 16, 32, 64] as WordSize[]).map((ws) => (
              <button
                key={ws}
                onClick={() => setWordSize(ws)}
                style={{
                  fontSize: "10px",
                  padding: "1px 4px",
                  borderRadius: "3px",
                  background: wordSize === ws ? "#E8B93F" : "#1A1E27",
                  color: wordSize === ws ? "#08090C" : "#8A6A22",
                  border: "1px solid #2A2E38",
                  cursor: "pointer",
                }}
              >
                {ws}b
              </button>
            ))}
          </div>

          {/* 2's Complement Toggle */}
          <button
            onClick={() => setTwosComplement(!twosComplement)}
            style={{
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "3px",
              background: twosComplement ? "rgba(232,185,63,0.15)" : "#1A1E27",
              color: twosComplement ? "#E8B93F" : "#8A6A22",
              border: `1px solid ${twosComplement ? "#E8B93F" : "#2A2E38"}`,
              cursor: "pointer",
            }}
            title="Toggle Two's Complement display for negative values"
          >
            2's Compl: {twosComplement ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Base representations list */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px" }}>
        {bases.map((b) => (
          <div
            key={b}
            onClick={() => setBase(b)}
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              background: base === b ? "rgba(232,185,63,0.12)" : "#181B22",
              border: `1px solid ${base === b ? "#E8B93F" : "#2A2E38"}`,
            }}
          >
            <span
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 700,
                fontSize: "11px",
                color: base === b ? "#E8B93F" : "#8A6A22",
                minWidth: "26px",
              }}
            >
              {b}
            </span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "11px",
                color: base === b ? "#F5D785" : "#F4EFE4",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {representations[b]}
            </span>
          </div>
        ))}
      </div>

      {/* Bitwise Quick Insertion Buttons */}
      <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
        {[
          { label: "AND", insert: " & " },
          { label: "OR", insert: " | " },
          { label: "XOR", insert: " ^ " },
          { label: "NOT", insert: " ~" },
          { label: "<<", insert: " << " },
          { label: ">>", insert: " >> " },
        ].map((op) => (
          <button
            key={op.label}
            onClick={() => appendToInput(op.insert)}
            style={{
              flex: 1,
              padding: "3px 0",
              background: "#181B22",
              border: "1px solid #2A2E38",
              borderRadius: "4px",
              color: "#F5D785",
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
