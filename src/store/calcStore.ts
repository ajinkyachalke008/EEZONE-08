"use client";
import { create } from "zustand";
import { toggleExactDecimal, type AngleUnit, type CalcResult } from "@/lib/calc-engine/evaluator";

export type DisplayMode = "MATH" | "FRAC";
export type Base = "DEC" | "HEX" | "BIN" | "OCT";

export type { AngleUnit, CalcResult };

export interface HistoryEntry {
  id: string;
  inputLatex: string;
  inputLinear: string;
  results: CalcResult[];
  timestamp: number;
}

export interface ComplexValue {
  re: number;
  im: number;
}

export type MemoryValue = number | ComplexValue | string;

export interface CalcState {
  // Input
  inputLatex: string;
  inputLinear: string;

  // Modes
  angleUnit: AngleUnit;
  displayMode: DisplayMode;
  base: Base;
  isEngMode: boolean; // Engineering notation toggle (Priority 4)
  historyIndex: number; // for up/down navigation

  // Modifier keys
  shiftActive: boolean;
  alphaActive: boolean;

  // Results
  results: CalcResult[];
  isExactMode: boolean; // S⇔D toggle

  // Memory
  memory: Record<string, MemoryValue>;
  ans: string;
  ansRaw: number | ComplexValue | null;
  preAns: string;

  // History
  history: HistoryEntry[];

  // Toast
  toastMessage: string | null;

  // UI state
  isSolveMode: boolean;
  showGraph: boolean;
  activeModal:
    | "matrix"
    | "vector"
    | "stat"
    | "graph"
    | "script"
    | "ocr"
    | "settings"
    | "ee_assistant"
    | "memory_picker"
    | null;
  memoryPickerMode: "sto" | "rcl" | null;
  graphExpression: string;

  // Actions
  setInputLatex: (latex: string) => void;
  setInputLinear: (linear: string) => void;
  appendToInput: (text: string) => void;
  setAngleUnit: (unit: AngleUnit) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setBase: (base: Base) => void;
  toggleEngMode: () => void;
  toggleShift: () => void;
  toggleAlpha: () => void;
  clearModifiers: () => void;
  setResults: (results: CalcResult[]) => void;
  toggleExactMode: () => void;
  setMemory: (key: string, value: MemoryValue) => void;
  addToMemory: (key: string, delta: number) => void;
  setAns: (ans: string, raw?: number | ComplexValue | null) => void;
  addHistory: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  navigateHistory: (direction: "prev" | "next") => void;
  setIsSolveMode: (v: boolean) => void;
  setShowGraph: (v: boolean) => void;
  setActiveModal: (modal: CalcState["activeModal"]) => void;
  setMemoryPickerMode: (mode: "sto" | "rcl" | null) => void;
  setGraphExpression: (expr: string) => void;
  showToast: (msg: string) => void;
  clearAll: () => void;
}

export const useCalcStore = create<CalcState>((set, get) => ({
  inputLatex: "",
  inputLinear: "",
  angleUnit: "DEG",
  displayMode: "MATH",
  base: "DEC",
  isEngMode: false,
  historyIndex: -1,
  shiftActive: false,
  alphaActive: false,
  results: [],
  isExactMode: true,
  memory: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 },
  ans: "0",
  ansRaw: 0,
  preAns: "0",
  history: [],
  toastMessage: null,
  isSolveMode: false,
  showGraph: false,
  activeModal: null,
  memoryPickerMode: null,
  graphExpression: "",

  setInputLatex: (latex) => set({ inputLatex: latex }),
  setInputLinear: (linear) => set({ inputLinear: linear }),
  appendToInput: (text) =>
    set((s) => {
      const next = s.inputLinear + text;
      return {
        inputLinear: next,
        inputLatex: next,
        shiftActive: false,
        alphaActive: false,
      };
    }),
  setAngleUnit: (unit) => set({ angleUnit: unit }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setBase: (base) => set({ base }),
  toggleEngMode: () => set((s) => ({ isEngMode: !s.isEngMode })),
  toggleShift: () => set((s) => ({ shiftActive: !s.shiftActive, alphaActive: false })),
  toggleAlpha: () => set((s) => ({ alphaActive: !s.alphaActive, shiftActive: false })),
  clearModifiers: () => set({ shiftActive: false, alphaActive: false }),
  setResults: (results) => set({ results }),

  // BUG-11: S⇔D toggle recomputed from raw values
  toggleExactMode: () =>
    set((s) => {
      const nextExact = !s.isExactMode;
      const updatedResults = s.results.map((res) =>
        toggleExactDecimal(res, nextExact, s.angleUnit)
      );
      return {
        isExactMode: nextExact,
        results: updatedResults,
      };
    }),

  setMemory: (key, value) =>
    set((s) => ({
      memory: { ...s.memory, [key.toUpperCase()]: value },
    })),

  addToMemory: (key, delta) =>
    set((s) => {
      const k = key.toUpperCase();
      const current = typeof s.memory[k] === "number" ? (s.memory[k] as number) : 0;
      return {
        memory: { ...s.memory, [k]: current + delta },
      };
    }),

  setAns: (ans, raw) =>
    set((s) => ({
      preAns: s.ans,
      ans,
      ansRaw: raw !== undefined ? raw : parseFloat(ans) || 0,
    })),

  addHistory: (entry) =>
    set((s) => {
      const item: HistoryEntry = {
        ...entry,
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        timestamp: Date.now(),
      };
      const nextHistory = [item, ...s.history].slice(0, 100);

      // Also persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("ee_calc_history", JSON.stringify(nextHistory));
        } catch {
          // ignore
        }
      }

      return {
        history: nextHistory,
        historyIndex: -1,
      };
    }),

  clearHistory: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ee_calc_history");
      } catch {
        // ignore
      }
    }
    set({ history: [], historyIndex: -1 });
  },

  navigateHistory: (direction) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return;

    let nextIdx = historyIndex;
    if (direction === "prev") {
      nextIdx = Math.min(history.length - 1, historyIndex + 1);
    } else {
      nextIdx = Math.max(-1, historyIndex - 1);
    }

    if (nextIdx === -1) {
      set({ historyIndex: -1, inputLinear: "", inputLatex: "" });
    } else {
      const item = history[nextIdx];
      set({
        historyIndex: nextIdx,
        inputLinear: item.inputLinear,
        inputLatex: item.inputLatex,
        results: item.results,
      });
    }
  },

  setIsSolveMode: (v) => set({ isSolveMode: v }),
  setShowGraph: (v) => set({ showGraph: v }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setMemoryPickerMode: (mode) => set({ memoryPickerMode: mode }),
  setGraphExpression: (expr) => set({ graphExpression: expr }),
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) set({ toastMessage: null });
    }, 2500);
  },
  clearAll: () =>
    set({
      inputLatex: "",
      inputLinear: "",
      results: [],
      isSolveMode: false,
      shiftActive: false,
      alphaActive: false,
      historyIndex: -1,
    }),
}));
