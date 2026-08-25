"use client";
import { useState, useEffect, useRef } from "react";
import { useCalcStore } from "@/store/calcStore";
import { useEvaluate } from "@/lib/calc-engine/useEvaluate";

export function DisplayPanel() {
  const {
    inputLinear,
    setInputLinear,
    setInputLatex,
    results,
    shiftActive,
    alphaActive,
    isSolveMode,
    setIsSolveMode,
    isExactMode,
    toggleExactMode,
    setActiveModal,
    setGraphExpression,
    toastMessage,
  } = useCalcStore();

  const { doEvaluate } = useEvaluate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto-detect solve mode on equation
  useEffect(() => {
    if (inputLinear.includes("=") && !isSolveMode) {
      setIsSolveMode(true);
    }
  }, [inputLinear, isSolveMode, setIsSolveMode]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputLinear(val);
    setInputLatex(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doEvaluate();
    }
  };

  const copyResult = (value: string, index: number) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const plotResult = (value: string) => {
    setGraphExpression(value);
    setActiveModal("graph");
  };

  return (
    <div
      style={{
        background: "#111319",
        borderRadius: "16px",
        border: "1px solid #E8B93F",
        clipPath: "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 0% 100%)",
        boxShadow: isFocused
          ? "0 0 20px 4px rgba(232,185,63,0.35)"
          : "0 0 10px 2px rgba(232,185,63,0.2)",
        position: "relative",
        padding: "16px",
        marginBottom: "12px",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* Top-right chamfer glow points */}
      <span style={{ position: "absolute", top: 0, right: 20, width: 1, height: 1, background: "#FFD873", boxShadow: "0 0 8px 4px rgba(255,216,115,0.7)", pointerEvents: "none" }} />
      <span style={{ position: "absolute", top: 20, right: 0, width: 1, height: 1, background: "#FFD873", boxShadow: "0 0 8px 4px rgba(255,216,115,0.7)", pointerEvents: "none" }} />

      {/* Toast notification banner */}
      {toastMessage && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "32px",
            background: "rgba(220, 38, 38, 0.9)",
            color: "#FFF",
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
            zIndex: 10,
            fontFamily: '"Rajdhani", sans-serif',
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Status indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          fontFamily: '"Rajdhani", sans-serif',
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: "#8A6A22",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {shiftActive && (
            <span
              style={{
                color: "#E8B93F",
                fontWeight: 700,
                background: "rgba(232,185,63,0.15)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid #E8B93F",
              }}
            >
              SHIFT
            </span>
          )}
          {alphaActive && (
            <span
              style={{
                color: "#7C5CD6",
                fontWeight: 700,
                background: "rgba(124,92,214,0.15)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid #7C5CD6",
              }}
            >
              ALPHA
            </span>
          )}
          {isSolveMode && (
            <span
              style={{
                color: "#22D3EE",
                fontWeight: 700,
                background: "rgba(34,211,238,0.15)",
                padding: "1px 6px",
                borderRadius: "4px",
                border: "1px solid #22D3EE",
              }}
            >
              SOLVE MODE
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* S⇔D exact/decimal toggle */}
          {results.length > 0 && (
            <button
              onClick={toggleExactMode}
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "11px",
                color: isExactMode ? "#E8B93F" : "#8A6A22",
                background: isExactMode ? "rgba(232,185,63,0.12)" : "transparent",
                border: `1px solid ${isExactMode ? "#E8B93F" : "#2A2E38"}`,
                borderRadius: "4px",
                padding: "2px 8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
              title="Toggle exact fraction vs decimal (S⇔D) / Rectangular vs Polar"
            >
              {isExactMode ? "S⇔D [Exact]" : "S⇔D [Dec]"}
            </button>
          )}
        </div>
      </div>

      {/* Input area */}
      <div style={{ minHeight: "44px", position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={inputLinear}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter expression or equation (e.g. 2x+3=7, 5∠30, sin(45))..."
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#F4EFE4",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "20px",
            lineHeight: 1.3,
            resize: "none",
            caretColor: "#E8B93F",
          }}
        />
      </div>

      {/* Result list */}
      {results.length > 0 && (
        <div
          style={{
            borderTop: "1px solid #2A2E38",
            marginTop: "10px",
            paddingTop: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {results.map((res, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: '"Orbitron", sans-serif',
                  fontSize: "14px",
                  color: res.label === "Error" ? "#EF4444" : "#8A6A22",
                  fontWeight: 600,
                }}
              >
                {res.label}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: '"Orbitron", sans-serif',
                    fontWeight: 700,
                    fontSize: "22px",
                    color: res.label === "Error" ? "#EF4444" : "#F5D785",
                    letterSpacing: "0.03em",
                    textAlign: "right",
                    wordBreak: "break-all",
                  }}
                >
                  {res.value}
                </span>

                {/* Actions */}
                {res.label !== "Error" && (
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => copyResult(res.value, i)}
                      style={{
                        padding: "2px 6px",
                        background: "transparent",
                        border: "1px solid #2A2E38",
                        borderRadius: "4px",
                        color: copiedIndex === i ? "#22C55E" : "#8A6A22",
                        fontSize: "10px",
                        cursor: "pointer",
                      }}
                      title="Copy result"
                    >
                      {copiedIndex === i ? "✓" : "Copy"}
                    </button>
                    {res.numeric !== null && res.numeric !== undefined && (
                      <button
                        onClick={() => plotResult(res.value)}
                        style={{
                          padding: "2px 6px",
                          background: "transparent",
                          border: "1px solid #2A2E38",
                          borderRadius: "4px",
                          color: "#8A6A22",
                          fontSize: "10px",
                          cursor: "pointer",
                        }}
                        title="Plot in graph"
                      >
                        📈
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
