"use client";
import { useState } from "react";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";
import { rectToPolar, polarToRect, formatNumber, type AngleUnit } from "@/lib/calc-engine/evaluator";

export function EEAssistantModal() {
  const { activeModal, setActiveModal, appendToInput, angleUnit, showToast } = useCalcStore();
  const [activeTab, setActiveTab] = useState<"phasor" | "formulas" | "shortcuts">("phasor");

  // Phasor state
  const [phasorRe, setPhasorRe] = useState("10");
  const [phasorIm, setPhasorIm] = useState("5");
  const [phasorMag, setPhasorMag] = useState("11.18");
  const [phasorAng, setPhasorAng] = useState("26.56");

  if (activeModal !== "ee_assistant") return null;

  const close = () => setActiveModal(null);

  const convertRectToPolar = () => {
    const re = parseFloat(phasorRe) || 0;
    const im = parseFloat(phasorIm) || 0;
    const r = Math.sqrt(re * re + im * im);
    let ang = Math.atan2(im, re);
    if (angleUnit === "DEG") ang = (ang * 180) / Math.PI;
    else if (angleUnit === "GRAD") ang = (ang * 200) / Math.PI;
    setPhasorMag(formatNumber(r));
    setPhasorAng(formatNumber(ang));
  };

  const convertPolarToRect = () => {
    const r = parseFloat(phasorMag) || 0;
    const ang = parseFloat(phasorAng) || 0;
    let angRad = ang;
    if (angleUnit === "DEG") angRad = (ang * Math.PI) / 180;
    else if (angleUnit === "GRAD") angRad = (ang * Math.PI) / 200;
    const re = r * Math.cos(angRad);
    const im = r * Math.sin(angRad);
    setPhasorRe(formatNumber(re));
    setPhasorIm(formatNumber(im));
  };

  const insertPhasor = (type: "rect" | "polar") => {
    if (type === "polar") {
      appendToInput(`${phasorMag}∠${phasorAng}`);
      showToast(`Inserted ${phasorMag}∠${phasorAng}`);
    } else {
      const sign = parseFloat(phasorIm) >= 0 ? "+" : "-";
      appendToInput(`(${phasorRe} ${sign} ${Math.abs(parseFloat(phasorIm))}i)`);
      showToast(`Inserted (${phasorRe} ${sign} ${Math.abs(parseFloat(phasorIm))}i)`);
    }
    close();
  };

  const formulas = [
    { name: "Ohm's Law (Voltage)", formula: "V = I * R", insert: "I * R" },
    { name: "Electrical Power", formula: "P = V * I = I^2 * R = V^2 / R", insert: "V * I" },
    { name: "RC Cutoff Frequency", formula: "fc = 1 / (2 * π * R * C)", insert: "1 / (2 * π * R * C)" },
    { name: "RC Time Constant", formula: "τ = R * C", insert: "R * C" },
    { name: "RL Time Constant", formula: "τ = L / R", insert: "L / R" },
    { name: "LC Resonant Frequency", formula: "fr = 1 / (2 * π * sqrt(L * C))", insert: "1 / (2 * π * sqrt(L * C))" },
    { name: "Inductive Reactance (XL)", formula: "XL = 2 * π * f * L", insert: "2 * π * f * L" },
    { name: "Capacitive Reactance (XC)", formula: "XC = 1 / (2 * π * f * C)", insert: "1 / (2 * π * f * C)" },
    { name: "Parallel Impedance (Zp)", formula: "Zp = (Z1 * Z2) / (Z1 + Z2)", insert: "(Z1 * Z2) / (Z1 + Z2)" },
    { name: "Decibels (Power)", formula: "dB = 10 * log10(P2 / P1)", insert: "10 * log10(P2 / P1)" },
    { name: "Decibels (Voltage)", formula: "dB = 20 * log10(V2 / V1)", insert: "20 * log10(V2 / V1)" },
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
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <ChamferedPanel
        style={{ width: "100%", maxWidth: "520px", padding: "20px", maxHeight: "90vh", overflowY: "auto" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 13, color: "#E8B93F", letterSpacing: "0.08em" }}>
            ⚡ EE ZONE ASSISTANT & TOOLS
          </span>
          <button onClick={close} style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
          {[
            { id: "phasor", label: "Phasor & AC" },
            { id: "formulas", label: "Formulas & Ref" },
            { id: "shortcuts", label: "Keyboard Shortcuts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                flex: 1,
                padding: "6px 4px",
                borderRadius: "6px",
                border: `1px solid ${activeTab === tab.id ? "#E8B93F" : "#2A2E38"}`,
                background: activeTab === tab.id ? "rgba(232,185,63,0.15)" : "#181B22",
                color: activeTab === tab.id ? "#E8B93F" : "#F4EFE4",
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Phasor & AC */}
        {activeTab === "phasor" && (
          <div>
            <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "12px", color: "#8A6A22", marginBottom: "10px" }}>
              Phasor conversion & direct insertion (Angle mode: {angleUnit}):
            </div>

            {/* Rectangular form */}
            <div style={{ background: "#08090C", border: "1px solid #2A2E38", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#E8B93F", fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, marginBottom: "6px" }}>
                Rectangular Form (a + jb)
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  value={phasorRe}
                  onChange={(e) => setPhasorRe(e.target.value)}
                  placeholder="Real (a)"
                  style={{ flex: 1, background: "#111319", border: "1px solid #2A2E38", color: "#F5D785", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", textAlign: "center" }}
                />
                <span style={{ color: "#8A6A22" }}>+</span>
                <input
                  value={phasorIm}
                  onChange={(e) => setPhasorIm(e.target.value)}
                  placeholder="Imag (b)"
                  style={{ flex: 1, background: "#111319", border: "1px solid #2A2E38", color: "#F5D785", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", textAlign: "center" }}
                />
                <span style={{ color: "#E8B93F" }}>j</span>
                <button
                  onClick={convertRectToPolar}
                  style={{ padding: "4px 8px", background: "#1A1E27", border: "1px solid #E8B93F", color: "#E8B93F", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                >
                  → Polar
                </button>
                <button
                  onClick={() => insertPhasor("rect")}
                  style={{ padding: "4px 8px", background: "#E8B93F", border: "none", color: "#08090C", fontWeight: 700, borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                >
                  Insert
                </button>
              </div>
            </div>

            {/* Polar form */}
            <div style={{ background: "#08090C", border: "1px solid #2A2E38", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
              <div style={{ fontSize: "11px", color: "#E8B93F", fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, marginBottom: "6px" }}>
                Polar Form (r ∠ θ)
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  value={phasorMag}
                  onChange={(e) => setPhasorMag(e.target.value)}
                  placeholder="Magnitude (r)"
                  style={{ flex: 1, background: "#111319", border: "1px solid #2A2E38", color: "#F5D785", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", textAlign: "center" }}
                />
                <span style={{ color: "#E8B93F" }}>∠</span>
                <input
                  value={phasorAng}
                  onChange={(e) => setPhasorAng(e.target.value)}
                  placeholder={`Angle (${angleUnit})`}
                  style={{ flex: 1, background: "#111319", border: "1px solid #2A2E38", color: "#F5D785", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", textAlign: "center" }}
                />
                <button
                  onClick={convertPolarToRect}
                  style={{ padding: "4px 8px", background: "#1A1E27", border: "1px solid #E8B93F", color: "#E8B93F", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                >
                  → Rect
                </button>
                <button
                  onClick={() => insertPhasor("polar")}
                  style={{ padding: "4px 8px", background: "#E8B93F", border: "none", color: "#08090C", fontWeight: 700, borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                >
                  Insert
                </button>
              </div>
            </div>

            <div style={{ padding: "8px", background: "rgba(232,185,63,0.06)", border: "1px solid rgba(232,185,63,0.2)", borderRadius: "6px", fontSize: "11px", color: "#8A6A22" }}>
              💡 Tip: You can type polar notation directly into the calculator keypad using the <b style={{ color: "#E8B93F" }}>∠</b> key (SHIFT + (−)), e.g. <code style={{ color: "#F5D785" }}>5∠30 * 2∠-15</code>.
            </div>
          </div>
        )}

        {/* Tab 2: Formulas */}
        {activeTab === "formulas" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {formulas.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: "#181B22",
                  border: "1px solid #2A2E38",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <div style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, fontSize: "12px", color: "#F4EFE4" }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "11px", color: "#8A6A22" }}>
                    {item.formula}
                  </div>
                </div>
                <button
                  onClick={() => {
                    appendToInput(item.insert);
                    showToast(`Inserted ${item.name}`);
                    close();
                  }}
                  style={{
                    padding: "4px 8px",
                    background: "rgba(232,185,63,0.15)",
                    border: "1px solid #E8B93F",
                    borderRadius: "4px",
                    color: "#E8B93F",
                    fontFamily: '"Rajdhani", sans-serif',
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Insert
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Shortcuts */}
        {activeTab === "shortcuts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { key: "Enter", action: "Evaluate expression / solve equation" },
              { key: "Backspace", action: "Delete last character" },
              { key: "Arrow Up / Down", action: "Scroll calculation history" },
              { key: "Escape", action: "Clear all (AC)" },
              { key: "0-9, +, -, *, /, (, ), ^, =", action: "Direct math input" },
              { key: "S⇔D button", action: "Toggle Fraction ↔ Decimal / Rect ↔ Polar" },
              { key: "ENG button", action: "Toggle Engineering notation with SI prefixes" },
            ].map((sc, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  background: "#181B22",
                  border: "1px solid #2A2E38",
                  borderRadius: "6px",
                }}
              >
                <code style={{ color: "#E8B93F", fontFamily: '"JetBrains Mono", monospace', fontSize: "11px" }}>
                  {sc.key}
                </code>
                <span style={{ color: "#F4EFE4", fontFamily: '"Rajdhani", sans-serif', fontSize: "12px" }}>
                  {sc.action}
                </span>
              </div>
            ))}
          </div>
        )}
      </ChamferedPanel>
    </div>
  );
}
