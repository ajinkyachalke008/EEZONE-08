"use client";
import { useState } from "react";
import * as math from "mathjs";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";
import { complexToString } from "@/lib/calc-engine/solver";

type MatrixData = string[][];
const MATRIX_DISPLAY_PRECISION = 6;

function createEmptyMatrix(rows: number, cols: number): MatrixData {
  return Array.from({ length: rows }, () => Array(cols).fill("0"));
}

function parseMatrix(data: MatrixData): number[][] {
  return data.map((row) => row.map((cell) => parseFloat(cell) || 0));
}

// BUG-05: MatrixEditor declared at module scope to prevent unmounting/focus loss on keystroke
interface MatrixEditorProps {
  data: MatrixData;
  setData: (d: MatrixData) => void;
  rows: number;
  cols: number;
  label: string;
}

function MatrixEditor({ data, setData, rows, cols, label }: MatrixEditorProps) {
  const updateCell = (r: number, c: number, val: string) => {
    const newGrid = data.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    );
    setData(newGrid);
  };

  return (
    <div>
      <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 12, color: "#8A6A22", marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "4px",
        }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <input
              key={`${r}-${c}`}
              value={data[r]?.[c] ?? "0"}
              onChange={(e) => updateCell(r, c, e.target.value)}
              style={{
                width: "100%",
                background: "#08090C",
                border: "1px solid #2A2E38",
                borderRadius: "4px",
                color: "#F5D785",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "13px",
                textAlign: "center",
                padding: "4px 2px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#E8B93F")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2E38")}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function MatrixModal() {
  const { activeModal, setActiveModal, setResults } = useCalcStore();
  const [matA, setMatA] = useState<MatrixData>(createEmptyMatrix(4, 4));
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [operation, setOperation] = useState<"det" | "inv" | "transpose" | "eig" | "matmul">("det");

  // BUG-17: Independent dimensions for Matrix B
  const [matB, setMatB] = useState<MatrixData>(createEmptyMatrix(4, 4));
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);

  const [resultText, setResultText] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (activeModal !== "matrix") return null;

  const close = () => {
    setActiveModal(null);
    setResultText("");
    setError("");
  };

  const compute = () => {
    setError("");
    setResultText("");

    try {
      const A = parseMatrix(matA.slice(0, rowsA).map((r) => r.slice(0, colsA)));
      const matA_ = math.matrix(A);

      switch (operation) {
        case "det": {
          if (rowsA !== colsA) throw new Error("Determinant requires a square matrix");
          const result = math.det(matA_);
          const formatted = typeof result === "number" ? (+result.toPrecision(MATRIX_DISPLAY_PRECISION)).toString() : String(result);
          setResultText(`det(A) = ${formatted}`);
          setResults([{ label: "det(A)", value: formatted, numeric: typeof result === "number" ? result : null, raw: result }]);
          break;
        }
        case "inv": {
          if (rowsA !== colsA) throw new Error("Inverse requires a square matrix");
          const result = math.inv(matA_);
          const arr = (result as math.Matrix).toArray() as number[][];
          const formatted = arr.map((row) => row.map((v) => (+v.toPrecision(MATRIX_DISPLAY_PRECISION)).toString()).join("\t")).join("\n");
          setResultText(`A⁻¹ =\n${formatted}`);
          setResults([{ label: "A⁻¹", value: formatted, numeric: null, raw: arr }]);
          break;
        }
        case "transpose": {
          // BUG-16: Consistent formatting for transpose
          const result = math.transpose(matA_);
          const arr = (result as math.Matrix).toArray() as number[][];
          const formatted = arr.map((row) => row.map((v) => (+v.toPrecision(MATRIX_DISPLAY_PRECISION)).toString()).join("\t")).join("\n");
          setResultText(`Aᵀ =\n${formatted}`);
          setResults([{ label: "Aᵀ", value: formatted, numeric: null, raw: arr }]);
          break;
        }
        case "eig": {
          if (rowsA !== colsA) throw new Error("Eigenvalues require a square matrix");
          const eigs = math.eigs(matA_);
          const vals = (eigs.values as math.Matrix).toArray() as (number | math.Complex)[];

          // BUG-12: Unified complexToString formatter prevents double signs
          const eigenStr = vals
            .map((v, i) => {
              if (typeof v === "number") return `λ${i + 1} = ${+v.toPrecision(MATRIX_DISPLAY_PRECISION)}`;
              const c = v as math.Complex;
              return `λ${i + 1} = ${complexToString(c.re, c.im, MATRIX_DISPLAY_PRECISION)}`;
            })
            .join("\n");

          setResultText(`Eigenvalues:\n${eigenStr}`);
          setResults(
            vals.map((v, i) => ({
              label: `λ${i + 1}`,
              value: typeof v === "number" ? (+v.toPrecision(MATRIX_DISPLAY_PRECISION)).toString() : complexToString((v as math.Complex).re, (v as math.Complex).im, MATRIX_DISPLAY_PRECISION),
              numeric: typeof v === "number" ? v : null,
              raw: v,
            }))
          );
          break;
        }
        case "matmul": {
          if (colsA !== rowsB) throw new Error(`Matrix multiplication error: Cols of A (${colsA}) must equal Rows of B (${rowsB})`);
          const B = parseMatrix(matB.slice(0, rowsB).map((r) => r.slice(0, colsB)));
          const matB_ = math.matrix(B);
          const result = math.multiply(matA_, matB_) as math.Matrix;
          const arr = result.toArray() as number[][];
          const formatted = arr.map((row) => row.map((v) => (+v.toPrecision(MATRIX_DISPLAY_PRECISION)).toString()).join("\t")).join("\n");
          setResultText(`A × B =\n${formatted}`);
          setResults([{ label: "A×B", value: formatted, numeric: null, raw: arr }]);
          break;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Computation error");
    }
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
    >
      <ChamferedPanel
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "20px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 700, color: "#E8B93F", fontSize: 16 }}>
            MATRIX ENGINE
          </span>
          <button onClick={close} style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
            ✕
          </button>
        </div>

        {/* Operation selection */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          {[
            { id: "det", label: "det(A)" },
            { id: "inv", label: "A⁻¹" },
            { id: "transpose", label: "Aᵀ" },
            { id: "eig", label: "Eig(A)" },
            { id: "matmul", label: "A × B" },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id as typeof operation)}
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "6px",
                border: `1px solid ${operation === op.id ? "#E8B93F" : "#2A2E38"}`,
                background: operation === op.id ? "rgba(232,185,63,0.15)" : "#181B22",
                color: operation === op.id ? "#E8B93F" : "#F4EFE4",
                cursor: "pointer",
              }}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Dimension selector Matrix A */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 13, color: "#F4EFE4" }}>Matrix A Size:</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {[1, 2, 3, 4].map((r) => (
              <button
                key={r}
                onClick={() => setRowsA(r)}
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: rowsA === r ? "#E8B93F" : "#181B22",
                  color: rowsA === r ? "#08090C" : "#F4EFE4",
                  border: "1px solid #2A2E38",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {r}R
              </button>
            ))}
            <span style={{ color: "#8A6A22" }}>×</span>
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => setColsA(c)}
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: colsA === c ? "#E8B93F" : "#181B22",
                  color: colsA === c ? "#08090C" : "#F4EFE4",
                  border: "1px solid #2A2E38",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {c}C
              </button>
            ))}
          </div>
        </div>

        {/* Matrix A Editor */}
        <MatrixEditor
          data={matA}
          setData={setMatA}
          rows={rowsA}
          cols={colsA}
          label={`Matrix A (${rowsA}×${colsA})`}
        />

        {/* BUG-17: Matrix B configuration and Editor for Matmul */}
        {operation === "matmul" && (
          <div style={{ marginTop: "16px", borderTop: "1px solid #2A2E38", paddingTop: "12px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 13, color: "#F4EFE4" }}>Matrix B Size:</span>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {[1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRowsB(r)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: rowsB === r ? "#E8B93F" : "#181B22",
                      color: rowsB === r ? "#08090C" : "#F4EFE4",
                      border: "1px solid #2A2E38",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {r}R
                  </button>
                ))}
                <span style={{ color: "#8A6A22" }}>×</span>
                {[1, 2, 3, 4].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColsB(c)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: colsB === c ? "#E8B93F" : "#181B22",
                      color: colsB === c ? "#08090C" : "#F4EFE4",
                      border: "1px solid #2A2E38",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {c}C
                  </button>
                ))}
              </div>
            </div>

            <MatrixEditor
              data={matB}
              setData={setMatB}
              rows={rowsB}
              cols={colsB}
              label={`Matrix B (${rowsB}×${colsB})`}
            />
          </div>
        )}

        {/* Compute button */}
        <button
          onClick={compute}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "8px",
            background: "linear-gradient(135deg, #E8B93F, #8A6A22)",
            border: "none",
            borderRadius: "8px",
            color: "#08090C",
            fontWeight: 700,
            fontFamily: '"Rajdhani", sans-serif',
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          COMPUTE
        </button>

        {/* Error message */}
        {error && (
          <div style={{ marginTop: "12px", color: "#EF4444", fontSize: "13px", fontFamily: '"Rajdhani", sans-serif' }}>
            {error}
          </div>
        )}

        {/* Result text */}
        {resultText && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px",
              background: "#08090C",
              border: "1px solid #2A2E38",
              borderRadius: "6px",
              color: "#F5D785",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "12px",
              whiteSpace: "pre-wrap",
            }}
          >
            {resultText}
          </div>
        )}
      </ChamferedPanel>
    </div>
  );
}
