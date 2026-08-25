"use client";
import { useCalcStore } from "@/store/calcStore";
import { ChamferedPanel } from "./ChamferedPanel";

export function MemoryPickerModal() {
  const {
    activeModal,
    setActiveModal,
    memoryPickerMode,
    setMemoryPickerMode,
    memory,
    setMemory,
    appendToInput,
    ans,
    showToast,
  } = useCalcStore();

  if (activeModal !== "memory_picker" || !memoryPickerMode) return null;

  const registers = ["A", "B", "C", "D", "E", "F", "X", "Y", "M"];

  const handleSelect = (reg: string) => {
    if (memoryPickerMode === "sto") {
      const val = parseFloat(ans) || 0;
      setMemory(reg, val);
      showToast(`Stored ${val} into ${reg}`);
    } else {
      const val = memory[reg] ?? 0;
      const strVal = typeof val === "object" && "re" in val ? `${val.re}+${val.im}i` : String(val);
      appendToInput(strVal);
      showToast(`Recalled ${reg} (${strVal})`);
    }
    setActiveModal(null);
    setMemoryPickerMode(null);
  };

  const close = () => {
    setActiveModal(null);
    setMemoryPickerMode(null);
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
        style={{ width: "100%", maxWidth: "340px", padding: "20px" }}
        glowIntensity="high"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ fontFamily: '"Orbitron", sans-serif', fontSize: 13, color: "#E8B93F", letterSpacing: "0.08em" }}>
            {memoryPickerMode === "sto" ? "💾 STORE TO REGISTER" : "📥 RECALL REGISTER"}
          </span>
          <button onClick={close} style={{ color: "#8A6A22", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "12px", color: "#8A6A22", marginBottom: "12px" }}>
          {memoryPickerMode === "sto"
            ? `Store current Ans (${ans}) into:`
            : "Select register to insert value:"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {registers.map((reg) => {
            const currentVal = memory[reg] ?? 0;
            const displayVal = typeof currentVal === "object" && "re" in currentVal
              ? `${currentVal.re}+${currentVal.im}i`
              : String(currentVal);

            return (
              <button
                key={reg}
                onClick={() => handleSelect(reg)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px 4px",
                  background: "#181B22",
                  border: "1px solid #2A2E38",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E8B93F")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2E38")}
              >
                <span style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 700, fontSize: "14px", color: "#E8B93F" }}>
                  {reg}
                </span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "10px",
                    color: "#8A6A22",
                    maxWidth: "70px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayVal}
                </span>
              </button>
            );
          })}
        </div>
      </ChamferedPanel>
    </div>
  );
}
