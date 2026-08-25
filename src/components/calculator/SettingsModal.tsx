"use client";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";
import type { AngleUnit } from "@/store/calcStore";

export function SettingsModal() {
  const { activeModal, setActiveModal, angleUnit, setAngleUnit, clearHistory, showToast } = useCalcStore();

  if (activeModal !== "settings") return null;

  const angleUnits: { value: AngleUnit; label: string; desc: string }[] = [
    { value: "DEG", label: "Degrees", desc: "0–360° for full circle (standard for AC phasor analysis)" },
    { value: "RAD", label: "Radians", desc: "0–2π for full circle" },
    { value: "GRAD", label: "Gradians", desc: "0–400 grad for full circle" },
  ];

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
        style={{ width: "100%", maxWidth: "400px", padding: "20px" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 13, color: "#E8B93F", letterSpacing: "0.08em" }}>
            ⚙ CALCULATOR SETTINGS
          </span>
          <button
            onClick={() => setActiveModal(null)}
            style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
          >
            ×
          </button>
        </div>

        {/* Angle unit */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, fontSize: "13px", color: "#F4EFE4", marginBottom: "10px" }}>
            Trigonometric Angle Unit
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {angleUnits.map((u) => (
              <button
                key={u.value}
                onClick={() => {
                  setAngleUnit(u.value);
                  showToast(`Angle unit set to ${u.value}`);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: angleUnit === u.value ? "rgba(232,185,63,0.1)" : "transparent",
                  border: `1px solid ${angleUnit === u.value ? "#E8B93F" : "#2A2E38"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: "50%",
                  border: `2px solid ${angleUnit === u.value ? "#E8B93F" : "#2A2E38"}`,
                  background: angleUnit === u.value ? "#E8B93F" : "transparent",
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, fontSize: "13px", color: "#F4EFE4" }}>
                    {u.label}
                  </div>
                  <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "11px", color: "#8A6A22" }}>
                    {u.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{
          padding: "12px",
          background: "#08090C",
          borderRadius: "8px",
          border: "1px solid #2A2E38",
          marginBottom: "16px",
        }}>
          <div style={{ fontFamily: '"Orbitron", sans-serif', fontSize: "11px", color: "#E8B93F", marginBottom: "6px" }}>
            EE ZONE SCIENTIFIC CALCULATOR
          </div>
          <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "11px", color: "#8A6A22", lineHeight: 1.5 }}>
            • CAS: nerdamer symbolic engine<br />
            • Numerics: math.js & ml-matrix<br />
            • Phasors: Polar (r∠θ) & Rectangular notation<br />
            • Base-N: DEC/HEX/BIN/OCT with 2's complement
          </div>
        </div>

        {/* Clear History */}
        <button
          onClick={() => {
            clearHistory();
            showToast("History cleared");
            setActiveModal(null);
          }}
          style={{
            width: "100%",
            padding: "8px",
            background: "transparent",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "6px",
            color: "#EF4444",
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 600,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Clear History
        </button>
      </ChamferedPanel>
    </div>
  );
}
