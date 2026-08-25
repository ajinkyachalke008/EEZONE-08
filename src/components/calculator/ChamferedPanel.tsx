"use client";
import { type ReactNode } from "react";

interface ChamferedPanelProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowIntensity?: "low" | "medium" | "high";
}

export function ChamferedPanel({
  children,
  className = "",
  style,
  glowIntensity = "medium",
}: ChamferedPanelProps) {
  const glowSizes = {
    low: "0 0 6px 2px rgba(232, 185, 63, 0.2)",
    medium: "0 0 10px 3px rgba(232, 185, 63, 0.3), 0 0 1px 0px rgba(232, 185, 63, 0.8)",
    high: "0 0 20px 6px rgba(232, 185, 63, 0.4), 0 0 2px 1px rgba(232, 185, 63, 1)",
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: "#111319",
        borderRadius: "16px",
        border: "1px solid #E8B93F",
        clipPath:
          "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 0% 100%)",
        boxShadow: glowSizes[glowIntensity],
        ...style,
      }}
    >
      {/* Top-right chamfer glow points */}
      <span
        style={{
          position: "absolute",
          top: 0,
          right: 20,
          width: 1,
          height: 1,
          background: "#FFD873",
          boxShadow: "0 0 8px 4px rgba(255, 216, 115, 0.7)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 20,
          right: 0,
          width: 1,
          height: 1,
          background: "#FFD873",
          boxShadow: "0 0 8px 4px rgba(255, 216, 115, 0.7)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}
