/**
 * CAS wrapper using nerdamer for symbolic math:
 * derivatives, integrals, limits, summations, algebraic simplification.
 * Fixes BUG-02.
 */
import { normalizeExpr } from "./normalize";

let nerdamerLoaded = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nerdamerInstance: any = null;

async function getNerdamer() {
  if (nerdamerLoaded && nerdamerInstance) return nerdamerInstance;
  try {
    const nm = await import("nerdamer");
    await import("nerdamer/Calculus");
    await import("nerdamer/Algebra");
    await import("nerdamer/Solve");
    nerdamerInstance = (nm as { default?: unknown }).default ?? nm;
    nerdamerLoaded = true;
    return nerdamerInstance;
  } catch (e) {
    console.error("Failed to load nerdamer:", e);
    throw new Error("CAS engine unavailable");
  }
}

export interface CASResult {
  latex: string;
  text: string;
  numeric?: number;
}

/**
 * Compute symbolic derivative d/dx of expression
 */
export async function differentiate(expr: string, variable = "x"): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const nerdamer = await getNerdamer();
    const result = nerdamer.diff(normalized, variable);
    return {
      latex: result.toTeX ? result.toTeX() : result.toString(),
      text: result.toString(),
    };
  } catch (e) {
    return { latex: "", text: "Error: " + String(e) };
  }
}

/**
 * Compute symbolic indefinite integral ∫ expr dx
 */
export async function integrate(expr: string, variable = "x"): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const nerdamer = await getNerdamer();
    const result = nerdamer.integrate(normalized, variable);
    return {
      latex: result.toTeX ? result.toTeX() : result.toString(),
      text: result.toString() + " + C",
    };
  } catch {
    return { latex: "", text: "No closed form found" };
  }
}

/**
 * Compute definite integral ∫_a^b expr dx
 */
export async function definiteIntegral(
  expr: string,
  variable: string,
  lower: string,
  upper: string
): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const normLower = normalizeExpr(lower);
    const normUpper = normalizeExpr(upper);
    const nerdamer = await getNerdamer();
    const result = nerdamer.defint(normalized, normLower, normUpper, variable);
    return {
      latex: result.toTeX ? result.toTeX() : result.toString(),
      text: result.toString(),
    };
  } catch {
    return { latex: "", text: "No closed form found" };
  }
}

/**
 * Symbolic solve for variable
 */
export async function symbolicSolve(expr: string, variable = "x"): Promise<CASResult[]> {
  try {
    const normalized = normalizeExpr(expr);
    const nerdamer = await getNerdamer();
    const result = nerdamer.solve(normalized, variable);
    const str = result.toString().replace(/[\[\]]/g, "");
    const arr = str ? str.split(",") : [];
    return arr.map((sol: unknown) => ({
      latex: String(sol).trim(),
      text: String(sol).trim(),
    }));
  } catch (e) {
    return [{ latex: "", text: "Error: " + String(e) }];
  }
}

/**
 * Simplify expression
 */
export async function simplify(expr: string): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const nerdamer = await getNerdamer();
    const result = nerdamer(normalized);
    return {
      latex: result.toTeX ? result.toTeX() : result.toString(),
      text: result.toString(),
    };
  } catch (e) {
    return { latex: "", text: "Error: " + String(e) };
  }
}

/**
 * Expand expression
 */
export async function expand(expr: string): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const nerdamer = await getNerdamer();
    const result = nerdamer.expand(normalized);
    return {
      latex: result.toTeX ? result.toTeX() : result.toString(),
      text: result.toString(),
    };
  } catch (e) {
    return { latex: "", text: "Error: " + String(e) };
  }
}

/**
 * Factor expression
 */
export async function factor(expr: string): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const nerdamer = await getNerdamer();
    const result = nerdamer.factor(normalized);
    return {
      latex: result.toTeX ? result.toTeX() : result.toString(),
      text: result.toString(),
    };
  } catch (e) {
    return { latex: "", text: "Error: " + String(e) };
  }
}

/**
 * Symbolic summation Σ
 */
export async function symbolicSum(
  expr: string,
  variable: string,
  lower: string,
  upper: string
): Promise<CASResult> {
  try {
    const normalized = normalizeExpr(expr);
    const normLower = normalizeExpr(lower);
    const normUpper = normalizeExpr(upper);
    const nerdamer = await getNerdamer();
    if (nerdamer.sum) {
      const result = nerdamer.sum(normalized, variable, normLower, normUpper);
      return {
        latex: result.toTeX ? result.toTeX() : result.toString(),
        text: result.toString(),
      };
    }
    return { latex: "", text: "Summation not supported in this build" };
  } catch (e) {
    return { latex: "", text: "Error: " + String(e) };
  }
}
