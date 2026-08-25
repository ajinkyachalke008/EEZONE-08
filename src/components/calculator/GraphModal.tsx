"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";
import { normalizeExpr } from "@/lib/calc-engine/normalize";

export function GraphModal() {
  const { activeModal, setActiveModal, graphExpression } = useCalcStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [expression, setExpression] = useState(graphExpression);
  const [expr2, setExpr2] = useState("");
  const [error, setError] = useState<string>("");
  const [showAnnotations, setShowAnnotations] = useState(true);

  // GAP-04: Viewport domain controls
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);

  useEffect(() => {
    if (activeModal === "graph") {
      setExpression(graphExpression);
    }
  }, [activeModal, graphExpression]);

  const renderPlot = useCallback(async () => {
    if (!containerRef.current) return;
    setError("");

    try {
      const functionPlot = (await import("function-plot")).default;
      containerRef.current.innerHTML = "";

      const processExpr = (e: string) => {
        let normalized = normalizeExpr(e);
        // Replace math constants and powers for JS function-plot
        return normalized
          .replace(/\bpi\b/g, "Math.PI")
          .replace(/\be\b/g, "Math.E")
          .replace(/\^/g, "**");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const datasets: any[] = [];

      if (expression.trim()) {
        datasets.push({
          fn: processExpr(expression),
          color: "#F0B93A",
          graphType: "polyline",
          nSamples: 400,
        });
      }

      if (expr2.trim()) {
        datasets.push({
          fn: processExpr(expr2),
          color: "#7C5CD6",
          graphType: "polyline",
          nSamples: 400,
        });
      }

      const width = containerRef.current.offsetWidth || 380;
      const height = Math.min(width * 0.7, 300);

      // Annotations if enabled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const annotations: any[] = [];
      if (showAnnotations) {
        annotations.push({ x: 0, text: "x=0" }, { y: 0, text: "y=0" });
      }

      functionPlot({
        target: containerRef.current,
        width,
        height,
        xAxis: { domain: [xMin, xMax], label: "x" },
        yAxis: { domain: [yMin, yMax], label: "y" },
        grid: true,
        data: datasets,
        annotations,
      });

      // Apply dark styling to rendered svg
      const svg = containerRef.current.querySelector("svg");
      if (svg) {
        svg.style.background = "#08090C";
        svg.style.borderRadius = "8px";
        svg.querySelectorAll(".grid line, .grid path").forEach((el) => {
          (el as SVGElement).style.stroke = "#2A2E38";
        });
        svg.querySelectorAll(".axis path, .axis line").forEach((el) => {
          (el as SVGElement).style.stroke = "#8A6A22";
        });
        svg.querySelectorAll(".axis text").forEach((el) => {
          (el as SVGElement).style.fill = "#8A6A22";
          (el as SVGElement).style.fontSize = "10px";
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Graphing error");
    }
  }, [expression, expr2, xMin, xMax, yMin, yMax, showAnnotations]);

  useEffect(() => {
    if (activeModal !== "graph" || !containerRef.current) return;
    renderPlot();
  }, [activeModal, renderPlot]);

  if (activeModal !== "graph") return null;

  const setPreset = (name: "default" | "trig" | "wide") => {
    if (name === "default") {
      setXMin(-10); setXMax(10); setYMin(-10); setYMax(10);
    } else if (name === "trig") {
      setXMin(-6.28); setXMax(6.28); setYMin(-2); setYMax(2);
    } else if (name === "wide") {
      setXMin(-100); setXMax(100); setYMin(-100); setYMax(100);
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
      onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
    >
      <ChamferedPanel
        style={{ width: "100%", maxWidth: "480px", padding: "20px", maxHeight: "90vh", overflowY: "auto" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 14, color: "#E8B93F", letterSpacing: "0.08em" }}>
            📈 2D FUNCTION GRAPH
          </span>
          <button
            onClick={() => setActiveModal(null)}
            style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
          >
            ×
          </button>
        </div>

        {/* Function Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          <div>
            <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "11px", color: "#F0B93A", fontWeight: 600 }}>
              f₁(x) =
            </span>
            <input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. sin(x), x^2 - 4, exp(-x)*cos(2x)"
              style={{
                width: "100%",
                background: "#08090C",
                border: "1px solid #2A2E38",
                borderRadius: "6px",
                padding: "6px 8px",
                color: "#F5D785",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "13px",
                marginTop: "2px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "11px", color: "#7C5CD6", fontWeight: 600 }}>
              f₂(x) =
            </span>
            <input
              value={expr2}
              onChange={(e) => setExpr2(e.target.value)}
              placeholder="e.g. 2*x + 1, cos(x)"
              style={{
                width: "100%",
                background: "#08090C",
                border: "1px solid #2A2E38",
                borderRadius: "6px",
                padding: "6px 8px",
                color: "#9B7FE8",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "13px",
                marginTop: "2px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Viewport Range Controls (GAP-04) */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "11px", color: "#8A6A22" }}>Window:</span>
          <input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
            style={{ width: "46px", background: "#08090C", border: "1px solid #2A2E38", borderRadius: "4px", color: "#F4EFE4", fontSize: "11px", textAlign: "center", padding: "2px" }}
            title="X Min"
          />
          <span style={{ color: "#8A6A22", fontSize: "11px" }}>to</span>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
            style={{ width: "46px", background: "#08090C", border: "1px solid #2A2E38", borderRadius: "4px", color: "#F4EFE4", fontSize: "11px", textAlign: "center", padding: "2px" }}
            title="X Max"
          />

          {/* Presets */}
          <button
            onClick={() => setPreset("default")}
            style={{ padding: "2px 6px", background: "#181B22", border: "1px solid #2A2E38", borderRadius: "4px", color: "#8A6A22", fontSize: "10px", cursor: "pointer" }}
          >
            [-10, 10]
          </button>
          <button
            onClick={() => setPreset("trig")}
            style={{ padding: "2px 6px", background: "#181B22", border: "1px solid #2A2E38", borderRadius: "4px", color: "#8A6A22", fontSize: "10px", cursor: "pointer" }}
          >
            [-2π, 2π]
          </button>
          <button
            onClick={() => setPreset("wide")}
            style={{ padding: "2px 6px", background: "#181B22", border: "1px solid #2A2E38", borderRadius: "4px", color: "#8A6A22", fontSize: "10px", cursor: "pointer" }}
          >
            [-100, 100]
          </button>

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            style={{
              marginLeft: "auto",
              padding: "2px 6px",
              background: showAnnotations ? "rgba(232,185,63,0.15)" : "#181B22",
              border: `1px solid ${showAnnotations ? "#E8B93F" : "#2A2E38"}`,
              borderRadius: "4px",
              color: showAnnotations ? "#E8B93F" : "#8A6A22",
              fontSize: "10px",
              cursor: "pointer",
            }}
          >
            Axes: {showAnnotations ? "ON" : "OFF"}
          </button>
        </div>

        {/* Plot Container */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            minHeight: "240px",
            background: "#08090C",
            borderRadius: "8px",
            border: "1px solid #2A2E38",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        {error && (
          <div style={{ marginTop: "8px", color: "#EF4444", fontSize: "12px", fontFamily: '"Rajdhani", sans-serif' }}>
            {error}
          </div>
        )}
      </ChamferedPanel>
    </div>
  );
}
