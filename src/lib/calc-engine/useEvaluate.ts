"use client";
import { useCallback } from "react";
import { useCalcStore } from "@/store/calcStore";
import { evaluate, formatEngineering } from "./evaluator";
import { detectAndSolve } from "./solver";

/**
 * Unified evaluation hook for both DisplayPanel and Keypad.
 * Fixes BUG-04 and BUG-13.
 */
export function useEvaluate() {
  const {
    inputLinear,
    angleUnit,
    memory,
    ans,
    isSolveMode,
    isEngMode,
    setResults,
    addHistory,
    setAns,
    setGraphExpression,
    clearModifiers,
    showToast,
  } = useCalcStore();

  const doEvaluate = useCallback(() => {
    if (!inputLinear || !inputLinear.trim()) return;

    const memNumeric: Record<string, number | { re: number; im: number } | string> = {};
    for (const [k, v] of Object.entries(memory)) {
      if (typeof v === "number") {
        memNumeric[k] = v;
      } else if (typeof v === "object" && v !== null && "re" in v) {
        memNumeric[k] = v as { re: number; im: number };
      } else {
        memNumeric[k] = String(v);
      }
    }

    // Try solver first if explicitly in solve mode or if expression has '=' and variable
    if (isSolveMode || (inputLinear.includes("=") && /[xX]/.test(inputLinear))) {
      const solveResult = detectAndSolve(inputLinear);
      if (solveResult && solveResult.length > 0) {
        setResults(solveResult);
        addHistory({ inputLatex: inputLinear, inputLinear, results: solveResult });

        // Update Ans with the first root (BUG-13)
        const first = solveResult[0];
        if (first.numeric !== null && first.numeric !== undefined) {
          setAns(String(first.numeric), first.numeric);
        } else if (first.raw && typeof first.raw === "object" && "re" in first.raw) {
          const c = first.raw as { re: number; im: number };
          setAns(`${c.re} + ${c.im}i`, c);
        } else {
          setAns(first.value, null);
        }

        // Set graph expression
        const cleanForGraph = inputLinear.includes("=")
          ? inputLinear.split("=")[0].trim()
          : inputLinear;
        setGraphExpression(cleanForGraph);

        clearModifiers();
        return;
      }
    }

    const result = evaluate(inputLinear, angleUnit, memNumeric, ans);

    if (result.error) {
      // Fallback: check if equation can be solved
      const solveResult = detectAndSolve(inputLinear);
      if (solveResult && solveResult.length > 0) {
        setResults(solveResult);
        addHistory({ inputLatex: inputLinear, inputLinear, results: solveResult });
        const first = solveResult[0];
        if (first.numeric !== null && first.numeric !== undefined) {
          setAns(String(first.numeric), first.numeric);
        }
        setGraphExpression(inputLinear.replace(/=/g, ""));
        clearModifiers();
        return;
      }

      showToast(`Syntax error: ${result.error}`);
      setResults([{ label: "Error", value: result.error, numeric: null, raw: null }]);
      clearModifiers();
      return;
    }

    if (result.results.length > 0) {
      let finalResults = result.results;

      // If engineering mode is active, format numeric results with engineering notation
      if (isEngMode) {
        finalResults = finalResults.map((r) => {
          if (r.numeric !== null && r.numeric !== undefined) {
            return { ...r, value: formatEngineering(r.numeric, true) };
          }
          return r;
        });
      }

      setResults(finalResults);

      // BUG-03: Update Ans cleanly without corrupting with display Unicode minus
      const first = finalResults[0];
      if (first.numeric !== null && first.numeric !== undefined) {
        setAns(String(first.numeric), first.numeric);
      } else if (first.raw && typeof first.raw === "object" && "re" in first.raw) {
        const c = first.raw as { re: number; im: number };
        // Store as ASCII for safe mathjs substitution
        const sign = c.im >= 0 ? "+" : "-";
        setAns(`${c.re} ${sign} ${Math.abs(c.im)}i`, c);
      } else {
        const sanitized = first.value.replace(/−/g, "-");
        setAns(sanitized, null);
      }

      addHistory({ inputLatex: inputLinear, inputLinear, results: finalResults });
      setGraphExpression(inputLinear.replace(/=/g, ""));
    }

    clearModifiers();
  }, [
    inputLinear,
    angleUnit,
    memory,
    ans,
    isSolveMode,
    isEngMode,
    setResults,
    addHistory,
    setAns,
    setGraphExpression,
    clearModifiers,
    showToast,
  ]);

  return { doEvaluate };
}
