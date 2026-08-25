"use client";
import { useCallback, useEffect } from "react";
import { useCalcStore } from "@/store/calcStore";
import {
  MODIFIER_ROW,
  OPTN_ROW,
  FRAC_ROW,
  TRIG_ROW,
  STO_ROW,
  NUMERIC_BLOCK,
  ICON_RAIL,
  UTILITY_ROW,
  getKeyAction,
} from "@/lib/calc-engine/keymap";
import { CalcKey } from "./CalcKey";
import { useEvaluate } from "@/lib/calc-engine/useEvaluate";
import { differentiate, integrate, symbolicSum } from "@/lib/calc-engine/cas";

export function Keypad() {
  const {
    inputLinear,
    setInputLinear,
    setInputLatex,
    shiftActive,
    alphaActive,
    toggleShift,
    toggleAlpha,
    clearModifiers,
    clearAll,
    setActiveModal,
    setMemoryPickerMode,
    toggleExactMode,
    toggleEngMode,
    setBase,
    setResults,
    appendToInput,
    ans,
    addToMemory,
    navigateHistory,
    showToast,
  } = useCalcStore();

  const { doEvaluate } = useEvaluate();
  const modifier = shiftActive ? "shift" : alphaActive ? "alpha" : "none";

  const handleCommand = useCallback(
    async (command: string) => {
      switch (command) {
        case "toggle_shift":
          toggleShift();
          return;
        case "toggle_alpha":
          toggleAlpha();
          return;
        case "evaluate":
          doEvaluate();
          return;
        case "clear_all":
          clearAll();
          return;
        case "delete": {
          const newVal = inputLinear.slice(0, -1);
          setInputLinear(newVal);
          setInputLatex(newVal);
          clearModifiers();
          return;
        }
        case "move_left":
        case "move_right":
          clearModifiers();
          return;
        case "history_prev":
          navigateHistory("prev");
          clearModifiers();
          return;
        case "history_next":
          navigateHistory("next");
          clearModifiers();
          return;
        case "open_matrix":
          setActiveModal("matrix");
          clearModifiers();
          return;
        case "open_vector":
          setActiveModal("vector");
          clearModifiers();
          return;
        case "open_stat":
          setActiveModal("stat");
          clearModifiers();
          return;
        case "open_script":
          setActiveModal("script");
          clearModifiers();
          return;
        case "open_ee_assistant":
          setActiveModal("ee_assistant");
          clearModifiers();
          return;
        case "show_history":
          setActiveModal("stat"); // or history panel in stat
          clearModifiers();
          return;
        case "toggle_sd":
          toggleExactMode();
          clearModifiers();
          return;
        case "base_dec":
          setBase("DEC");
          clearModifiers();
          return;
        case "base_hex":
          setBase("HEX");
          clearModifiers();
          return;
        case "base_bin":
          setBase("BIN");
          clearModifiers();
          return;
        case "base_oct":
          setBase("OCT");
          clearModifiers();
          return;

        // BUG-06: Memory STO / RCL / M+ / M-
        case "sto_memory":
          setMemoryPickerMode("sto");
          setActiveModal("memory_picker");
          clearModifiers();
          return;
        case "rcl_memory":
          setMemoryPickerMode("rcl");
          setActiveModal("memory_picker");
          clearModifiers();
          return;
        case "m_plus": {
          const val = parseFloat(ans) || 0;
          addToMemory("M", val);
          showToast(`M + ${val} stored`);
          clearModifiers();
          return;
        }
        case "m_minus": {
          const val = parseFloat(ans) || 0;
          addToMemory("M", -val);
          showToast(`M - ${val} stored`);
          clearModifiers();
          return;
        }

        // GAP-02: Engineering notation
        case "eng_notation":
          toggleEngMode();
          clearModifiers();
          return;

        // GAP-02: Bitwise commands
        case "bitwise_and":
          appendToInput(" & ");
          return;
        case "bitwise_or":
          appendToInput(" | ");
          return;
        case "bitwise_xor":
          appendToInput(" ^ ");
          return;
        case "bitwise_xnor":
          appendToInput(" ~^ ");
          return;

        // CAS Commands
        case "cas_diff": {
          const expr = inputLinear.trim();
          if (!expr) return;
          const res = await differentiate(expr);
          setResults([{ label: "d/dx", value: res.text, numeric: null, raw: res.text }]);
          clearModifiers();
          return;
        }
        case "cas_integrate": {
          const expr = inputLinear.trim();
          if (!expr) return;
          const res = await integrate(expr);
          setResults([{ label: "∫dx", value: res.text, numeric: null, raw: res.text }]);
          clearModifiers();
          return;
        }
        case "cas_sum": {
          const expr = inputLinear.trim();
          if (!expr) return;
          const res = await symbolicSum(expr, "x", "1", "10");
          setResults([{ label: "Σ", value: res.text, numeric: null, raw: res.text }]);
          clearModifiers();
          return;
        }

        case "rnd": {
          const rndVal = String(Math.round(parseFloat(ans) || 0));
          appendToInput(rndVal);
          return;
        }
        case "ran": {
          const ranVal = Math.random().toFixed(9);
          appendToInput(ranVal);
          return;
        }
        case "solve":
        case "calc_evaluate": {
          doEvaluate();
          return;
        }

        default:
          clearModifiers();
          return;
      }
    },
    [
      toggleShift,
      toggleAlpha,
      doEvaluate,
      clearAll,
      inputLinear,
      setInputLinear,
      setInputLatex,
      clearModifiers,
      navigateHistory,
      setActiveModal,
      setMemoryPickerMode,
      toggleExactMode,
      toggleEngMode,
      setBase,
      ans,
      addToMemory,
      showToast,
      appendToInput,
      setResults,
    ]
  );

  const handleKeyPress = useCallback(
    async (keyId: string) => {
      const action = getKeyAction(keyId, modifier);

      if (action.insert !== undefined && action.insert !== "") {
        appendToInput(action.insert);
      } else if (action.command) {
        await handleCommand(action.command);
      }
    },
    [modifier, appendToInput, handleCommand]
  );

  // Physical keyboard support
  useEffect(() => {
    const handlePhysicalKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (e.key === "Enter") {
        e.preventDefault();
        doEvaluate();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        const newVal = inputLinear.slice(0, -1);
        setInputLinear(newVal);
        setInputLatex(newVal);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateHistory("prev");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateHistory("next");
      } else if (e.key === "Escape") {
        clearAll();
      } else if (/^[0-9+\-*/().^=]$/.test(e.key)) {
        e.preventDefault();
        appendToInput(e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key);
      }
    };

    window.addEventListener("keydown", handlePhysicalKey);
    return () => window.removeEventListener("keydown", handlePhysicalKey);
  }, [doEvaluate, inputLinear, setInputLinear, setInputLatex, navigateHistory, clearAll, appendToInput]);

  return (
    <div style={{ display: "flex", gap: "10px", width: "100%" }}>
      {/* Left Icon Rail */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          width: "56px",
          flexShrink: 0,
        }}
      >
        {ICON_RAIL.map((k) => (
          <CalcKey
            key={k.id}
            keyDef={k}
            shiftActive={shiftActive}
            alphaActive={alphaActive}
            onPress={handleKeyPress}
            size="sm"
          />
        ))}
      </div>

      {/* Main Keypad Grid */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {/* Modifier row (6 cols) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "5px" }}>
          {MODIFIER_ROW.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="sm"
            />
          ))}
        </div>

        {/* OPTN / CALC row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "5px" }}>
          {OPTN_ROW.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="sm"
            />
          ))}
        </div>

        {/* Fraction / Root / Power / Log row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "5px" }}>
          {FRAC_ROW.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="sm"
            />
          ))}
        </div>

        {/* Trig row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "5px" }}>
          {TRIG_ROW.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="sm"
            />
          ))}
        </div>

        {/* STO row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "5px" }}>
          {STO_ROW.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="sm"
            />
          ))}
        </div>

        {/* Numeric block (5 cols × 4 rows) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "5px",
            marginTop: "2px",
          }}
        >
          {NUMERIC_BLOCK.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="md"
            />
          ))}
        </div>

        {/* Utility bottom row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "3px",
            marginTop: "4px",
          }}
        >
          {UTILITY_ROW.map((k) => (
            <CalcKey
              key={k.id}
              keyDef={k}
              shiftActive={shiftActive}
              alphaActive={alphaActive}
              onPress={handleKeyPress}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
