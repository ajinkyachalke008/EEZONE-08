"use client";
import { useState } from "react";
import * as math from "mathjs";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";

// BUG-05: VecEditor declared at module scope to prevent unmounting/focus loss on keystroke
interface VecEditorProps {
  vec: string[];
  setVec: (v: string[]) => void;
  dims: number;
  label: string;
}

function VecEditor({ vec, setVec, dims, label }: VecEditorProps) {
  const updateVec = (i: number, val: string) => {
    const newVec = [...vec];
    newVec[i] = val;
    setVec(newVec);
  };

  return (
    <div>
      <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 12, color: "#8A6A22", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: dims }, (_, i) => (
          <input
            key={i}
            value={vec[i] ?? "0"}
            onChange={(e) => updateVec(i, e.target.value)}
            style={{
              flex: 1,
              background: "#08090C",
              border: "1px solid #2A2E38",
              borderRadius: "4px",
              color: "#F5D785",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "13px",
              textAlign: "center",
              padding: "6px 2px",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#E8B93F")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2E38")}
          />
        ))}
      </div>
    </div>
  );
}

export function VectorModal() {
  const { activeModal, setActiveModal, setResults } = useCalcStore();
  const [vecA, setVecA] = useState<string[]>(["1", "0", "0", "0"]);
  const [vecB, setVecB] = useState<string[]>(["0", "1", "0", "0"]);
  const [dims, setDims] = useState(3);
  const [operation, setOperation] = useState<"dot" | "cross" | "norm" | "add" | "angle">("dot");
  const [resultText, setResultText] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (activeModal !== "vector") return null;

  const close = () => {
    setActiveModal(null);
    setResultText("");
    setError("");
  };

  const parseVec = (v: string[]): number[] => v.slice(0, dims).map((x) => parseFloat(x) || 0);

  const compute = () => {
    setError("");
    setResultText("");

    try {
      const A = parseVec(vecA);
      const B = parseVec(vecB);
      const matA = math.matrix(A);
      const matB = math.matrix(B);

      switch (operation) {
        case "dot": {
          const result = math.dot(matA, matB);
          setResultText(`A · B = ${typeof result === "number" ? result.toPrecision(10) : String(result)}`);
          setResults([{ label: "A·B", value: String(typeof result === "number" ? result.toPrecision(10) : result), numeric: typeof result === "number" ? result : null, raw: result }]);
          break;
        }
        case "cross": {
          if (dims !== 3) {
            setError("Cross product is only defined for 3D vectors");
            return;
          }
          const result = math.cross(matA, matB) as math.Matrix;
          const arr = result.toArray() as number[];
          const formatted = `[${arr.map((v) => (+v.toPrecision(6)).toString()).join(", ")}]`;
          setResultText(`A × B = ${formatted}`);
          setResults([{ label: "A×B", value: formatted, numeric: null, raw: arr }]);
          break;
        }
        case "norm": {
          const normA = math.norm(matA) as number;
          const normB = math.norm(matB) as number;
          setResultText(`|A| = ${(+normA.toPrecision(10)).toString()}\n|B| = ${(+normB.toPrecision(10)).toString()}`);
          setResults([
            { label: "|A|", value: (+normA.toPrecision(10)).toString(), numeric: normA, raw: normA },
            { label: "|B|", value: (+normB.toPrecision(10)).toString(), numeric: normB, raw: normB },
          ]);
          break;
        }
        case "add": {
          const result = math.add(matA, matB) as math.Matrix;
          const arr = result.toArray() as number[];
          const formatted = `[${arr.map((v) => (+v.toPrecision(6)).toString()).join(", ")}]`;
          setResultText(`A + B = ${formatted}`);
          setResults([{ label: "A+B", value: formatted, numeric: null, raw: arr }]);
          break;
        }
        case "angle": {
          const dotProd = math.dot(matA, matB) as number;
          const normA_ = math.norm(matA) as number;
          const normB_ = math.norm(matB) as number;
          if (normA_ === 0 || normB_ === 0) {
            setError("Cannot compute angle with zero vector");
            return;
          }
          const cosTheta = dotProd / (normA_ * normB_);
          const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta))) * (180 / Math.PI);
          setResultText(`Angle(A, B) = ${(+theta.toPrecision(8)).toString()}°`);
          setResults([{ label: "θ", value: `${(+theta.toPrecision(8)).toString()}°`, numeric: theta, raw: theta }]);
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
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <ChamferedPanel
        style={{ width: "100%", maxWidth: "380px", padding: "20px" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 13, color: "#E8B93F", letterSpacing: "0.08em" }}>
            ⊛ VECTOR ENGINE
          </span>
          <button onClick={close} style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {/* Dimension selector */}
        <div style={{ marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 12, color: "#8A6A22" }}>Dimensions:</span>
          {[2, 3, 4].map((d) => (
            <button
              key={d}
              onClick={() => setDims(d)}
              style={{
                padding: "3px 10px",
                borderRadius: "5px",
                border: `1px solid ${dims === d ? "#E8B93F" : "#2A2E38"}`,
                background: dims === d ? "rgba(232,185,63,0.15)" : "transparent",
                color: dims === d ? "#E8B93F" : "#8A6A22",
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {d}D
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          <VecEditor vec={vecA} setVec={setVecA} dims={dims} label="Vector A" />
          <VecEditor vec={vecB} setVec={setVecB} dims={dims} label="Vector B" />
        </div>

        {/* Operations */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
          {[
            { id: "dot", label: "A · B" },
            { id: "cross", label: "A × B" },
            { id: "norm", label: "|A|, |B|" },
            { id: "add", label: "A + B" },
            { id: "angle", label: "Angle" },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id as typeof operation)}
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "5px",
                border: `1px solid ${operation === op.id ? "#E8B93F" : "#2A2E38"}`,
                background: operation === op.id ? "rgba(232,185,63,0.15)" : "transparent",
                color: operation === op.id ? "#E8B93F" : "#8A6A22",
                cursor: "pointer",
              }}
            >
              {op.label}
            </button>
          ))}
        </div>

        <button
          onClick={compute}
          style={{
            width: "100%",
            padding: "10px",
            background: "linear-gradient(135deg, #E8B93F, #8A6A22)",
            border: "none",
            borderRadius: "8px",
            color: "#08090C",
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          COMPUTE
        </button>

        {resultText && (
          <div style={{
            marginTop: "12px",
            background: "#08090C",
            borderRadius: "8px",
            border: "1px solid #2A2E38",
            padding: "10px",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "13px",
            color: "#F5D785",
            whiteSpace: "pre",
          }}>
            {resultText}
          </div>
        )}
        {error && (
          <div style={{ marginTop: "8px", color: "#E1574B", fontFamily: '"Rajdhani", sans-serif', fontSize: "12px" }}>
            {error}
          </div>
        )}
      </ChamferedPanel>
    </div>
  );
}
