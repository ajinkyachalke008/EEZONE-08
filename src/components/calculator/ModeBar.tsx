"use client";
import { useCalcStore } from "@/store/calcStore";
import type { AngleUnit, DisplayMode } from "@/store/calcStore";

export function ModeBar() {
  const { angleUnit, displayMode, base, isEngMode, setAngleUnit, setDisplayMode, toggleEngMode } = useCalcStore();

  const angleUnits: AngleUnit[] = ["DEG", "RAD", "GRAD"];
  const displayModes: DisplayMode[] = ["MATH", "FRAC"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 12px",
        background: "#111319",
        borderRadius: "10px",
        border: "1px solid #2A2E38",
        marginBottom: "8px",
        gap: "8px",
      }}
    >
      {/* Angle unit control */}
      <div className="seg-control" style={{ flex: 1 }}>
        {angleUnits.map((u) => (
          <button
            key={u}
            onClick={() => setAngleUnit(u)}
            className={angleUnit === u ? "active" : ""}
            style={{ fontFamily: '"Rajdhani", sans-serif' }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Engineering notation toggle */}
      <button
        onClick={toggleEngMode}
        style={{
          fontFamily: '"Rajdhani", sans-serif',
          fontSize: "11px",
          color: isEngMode ? "#E8B93F" : "#8A6A22",
          background: isEngMode ? "rgba(232,185,63,0.15)" : "transparent",
          border: `1px solid ${isEngMode ? "#E8B93F" : "#2A2E38"}`,
          borderRadius: "6px",
          padding: "2px 6px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        title="Toggle Engineering Notation (SI prefixes)"
      >
        ENG {isEngMode ? "ON" : "OFF"}
      </button>

      {/* Base display */}
      <div
        style={{
          fontFamily: '"Rajdhani", sans-serif',
          fontSize: "11px",
          color: base !== "DEC" ? "#E8B93F" : "#5A6072",
          fontWeight: 600,
          letterSpacing: "0.05em",
          minWidth: 28,
          textAlign: "center",
        }}
      >
        {base}
      </div>

      {/* Display mode control */}
      <div className="seg-control" style={{ flex: 0.8 }}>
        {displayModes.map((m) => (
          <button
            key={m}
            onClick={() => setDisplayMode(m)}
            className={displayMode === m ? "active" : ""}
            style={{ fontFamily: '"Rajdhani", sans-serif' }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
