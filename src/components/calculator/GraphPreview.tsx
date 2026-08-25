"use client";
import { useEffect, useRef, useCallback } from "react";
import { useCalcStore } from "@/store/calcStore";
import { normalizeExpr } from "@/lib/calc-engine/normalize";

export function GraphPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotInstanceRef = useRef<unknown>(null);
  const { graphExpression, setActiveModal } = useCalcStore();

  const initPlot = useCallback(async () => {
    if (!containerRef.current || !graphExpression.trim()) return;

    try {
      const functionPlot = (await import("function-plot")).default;
      containerRef.current.innerHTML = "";

      let expr = normalizeExpr(graphExpression);
      expr = expr
        .replace(/\bpi\b/g, "Math.PI")
        .replace(/\be\b/g, "Math.E")
        .replace(/\^/g, "**");

      plotInstanceRef.current = functionPlot({
        target: containerRef.current,
        width: 120,
        height: 80,
        xAxis: { domain: [-5, 5] },
        yAxis: { domain: [-5, 5] },
        grid: true,
        data: [
          {
            fn: expr,
            color: "#F0B93A",
            graphType: "polyline",
          },
        ],
      });

      const svg = containerRef.current.querySelector("svg");
      if (svg) {
        svg.style.background = "transparent";
        svg.querySelectorAll(".grid line").forEach((el) => {
          (el as SVGElement).style.stroke = "#2A2E38";
        });
        svg.querySelectorAll(".axis path, .axis line").forEach((el) => {
          (el as SVGElement).style.stroke = "#8A6A22";
        });
        svg.querySelectorAll(".axis text").forEach((el) => {
          (el as SVGElement).style.fill = "#8A6A22";
          (el as SVGElement).style.fontSize = "8px";
        });
      }
    } catch (e) {
      console.warn("Graph preview error:", e);
    }
  }, [graphExpression]);

  useEffect(() => {
    if (graphExpression) {
      initPlot();
    }
  }, [graphExpression, initPlot]);

  if (!graphExpression) return null;

  return (
    <div
      onClick={() => setActiveModal("graph")}
      title="Tap to expand graph"
      style={{
        width: 120,
        height: 80,
        background: "#08090C",
        borderRadius: "8px",
        border: "1px solid #2A2E38",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          bottom: 2,
          right: 4,
          fontSize: "8px",
          color: "#8A6A22",
          fontFamily: '"Rajdhani", sans-serif',
        }}
      >
        ⤢
      </div>
    </div>
  );
}
