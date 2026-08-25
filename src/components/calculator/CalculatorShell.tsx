"use client";
import { Header } from "./Header";
import { ModeBar } from "./ModeBar";
import { DisplayPanel } from "./DisplayPanel";
import { Keypad } from "./Keypad";
import { MatrixModal } from "./MatrixModal";
import { VectorModal } from "./VectorModal";
import { GraphModal } from "./GraphModal";
import { ScriptModal } from "./ScriptModal";
import { OCRModal } from "./OCRModal";
import { SettingsModal } from "./SettingsModal";
import { MemoryPickerModal } from "./MemoryPickerModal";
import { EEAssistantModal } from "./EEAssistantModal";
import { HistoryPanel } from "./HistoryPanel";
import { CASPanel } from "./CASPanel";
import { BaseNDisplay } from "./BaseNDisplay";
import { useCalcStore } from "@/store/calcStore";

export function CalculatorShell() {
  const { shiftActive, alphaActive } = useCalcStore();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#08090C",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px 12px",
        position: "relative",
      }}
    >
      {/* Background grid decoration */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(42,46,56,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42,46,56,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(232,185,63,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main calculator container */}
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Modifier state indicator bar */}
        {(shiftActive || alphaActive) && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "6px",
              padding: "4px 12px",
              background: shiftActive ? "rgba(232,185,63,0.1)" : "rgba(124,92,214,0.1)",
              border: `1px solid ${shiftActive ? "rgba(232,185,63,0.4)" : "rgba(124,92,214,0.4)"}`,
              borderRadius: "6px",
            }}
          >
            <span
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 700,
                fontSize: "11px",
                color: shiftActive ? "#E8B93F" : "#7C5CD6",
                letterSpacing: "0.1em",
              }}
            >
              {shiftActive ? "▲ SHIFT active — press secondary function" : "α ALPHA active — press variable/register key"}
            </span>
          </div>
        )}

        <Header />
        <ModeBar />
        <DisplayPanel />
        <CASPanel />
        <BaseNDisplay />
        <Keypad />
        <HistoryPanel />
      </div>

      {/* Modals */}
      <MatrixModal />
      <VectorModal />
      <GraphModal />
      <ScriptModal />
      <OCRModal />
      <SettingsModal />
      <MemoryPickerModal />
      <EEAssistantModal />
    </div>
  );
}
