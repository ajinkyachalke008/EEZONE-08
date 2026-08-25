"use client";
import { useCalcStore } from "@/store/calcStore";

export function Header() {
  const { setActiveModal } = useCalcStore();

  return (
    <div
      style={{
        background: "#111319",
        borderRadius: "16px",
        border: "1px solid #E8B93F",
        clipPath: "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 0% 100%)",
        boxShadow: "0 0 12px 2px rgba(232,185,63,0.2)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        marginBottom: "8px",
      }}
    >
      {/* Chamfer glow points */}
      <span style={{ position: "absolute", top: 0, right: 20, width: 1, height: 1, background: "#FFD873", boxShadow: "0 0 8px 4px rgba(255,216,115,0.7)", pointerEvents: "none" }} />
      <span style={{ position: "absolute", top: 20, right: 0, width: 1, height: 1, background: "#FFD873", boxShadow: "0 0 8px 4px rgba(255,216,115,0.7)", pointerEvents: "none" }} />

      {/* Center: wordmark */}
      <div className="flex items-center gap-2">
        <span
          style={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "0.08em",
            color: "#E8B93F",
          }}
        >
          ⚡ EE ZONE
        </span>
        <span
          style={{
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 500,
            fontSize: "12px",
            letterSpacing: "0.05em",
            color: "#8A6A22",
          }}
        >
          — SCIENTIFIC CALCULATOR
        </span>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {/* EE Reference / Formulas modal */}
        <button
          onClick={() => setActiveModal("ee_assistant")}
          className="px-2 py-1 rounded text-xs font-semibold bg-[#1A1E27] border border-[#8A6A22] text-[#F5D785] hover:bg-[#E8B93F] hover:text-[#08090C] transition-colors"
          title="EE Formulas, Phasor & Engineering Tools"
        >
          ⚡ EE Assistant
        </button>

        {/* Camera / OCR */}
        <button
          onClick={() => setActiveModal("ocr")}
          className="p-1 rounded text-[#8A6A22] hover:text-[#E8B93F] transition-colors"
          aria-label="Scan equation (OCR)"
          title="Scan equation (OCR)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveModal("settings")}
          className="p-1 rounded text-[#8A6A22] hover:text-[#E8B93F] transition-colors"
          aria-label="Settings"
          title="Calculator settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
