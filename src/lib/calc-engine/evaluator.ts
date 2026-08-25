/**
 * Main evaluator: routes expression strings to mathjs and sub-engines.
 * Fixes BUG-02, BUG-03, BUG-09, BUG-10, BUG-11, BUG-14, BUG-15.
 */
import * as math from "mathjs";
import { normalizeExpr, type AngleUnit } from "./normalize";
import { detectAndSolve, type SolveResult } from "./solver";

export type { AngleUnit };

export interface CalcResult {
  label: string;
  value: string;
  latex?: string;
  numeric?: number | null;
  isComplex?: boolean;
  raw?: number | { re: number; im: number } | number[][] | string | null;
}

export interface EvalResult {
  results: CalcResult[];
  error?: string;
  isComplex?: boolean;
}

export function toRadians(angle: number, unit: AngleUnit): number {
  if (unit === "RAD") return angle;
  if (unit === "DEG") return (angle * Math.PI) / 180;
  return (angle * Math.PI) / 200; // GRAD
}

export function fromRadians(angle: number, unit: AngleUnit): number {
  if (unit === "RAD") return angle;
  if (unit === "DEG") return (angle * 180) / Math.PI;
  return (angle * 200) / Math.PI; // GRAD
}

/**
 * Format numbers cleanly with scientific and engineering notation support.
 * Fixes BUG-14 (trailing zeros in exponent branch and -0).
 */
export function formatNumber(n: number): string {
  if (Object.is(n, -0) || Math.abs(n) < 1e-15 && n !== 0) {
    if (Math.abs(n) < 1e-15) return "0";
    return "0";
  }

  if (Number.isInteger(n) && Math.abs(n) < 1e14) {
    return String(n);
  }

  const str = n.toPrecision(10);

  // Exponential format
  if (str.includes("e") || str.includes("E")) {
    const [mantissa, exponent] = str.split(/[eE]/);
    const cleanMantissa = mantissa.includes(".") ? mantissa.replace(/\.?0+$/, "") : mantissa;
    return `${cleanMantissa}e${exponent}`;
  }

  // Decimal format
  if (str.includes(".")) {
    return str.replace(/\.?0+$/, "");
  }

  return str;
}

/**
 * Engineering notation formatter (exponents in multiples of 3 with optional SI prefix).
 */
export function formatEngineering(n: number, usePrefix = false): string {
  if (n === 0 || !isFinite(n)) return formatNumber(n);

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const exp = Math.floor(Math.log10(abs));
  const engExp = Math.floor(exp / 3) * 3;
  const mantissa = abs / Math.pow(10, engExp);
  const mantissaStr = (+mantissa.toPrecision(7)).toString();

  const siPrefixes: Record<number, string> = {
    [-15]: "f",
    [-12]: "p",
    [-9]: "n",
    [-6]: "µ",
    [-3]: "m",
    0: "",
    3: "k",
    6: "M",
    9: "G",
    12: "T",
  };

  if (usePrefix && siPrefixes[engExp] !== undefined) {
    const prefix = siPrefixes[engExp];
    return `${sign}${mantissaStr}${prefix ? " " + prefix : ""}`;
  }

  if (engExp === 0) {
    return `${sign}${mantissaStr}`;
  }

  return `${sign}${mantissaStr}e${engExp >= 0 ? "+" + engExp : engExp}`;
}

/**
 * Continued fraction expansion for exact fraction conversion.
 * Fixes BUG-15.
 */
export function toFraction(decimal: number, maxDenominator = 10000): string | null {
  if (Number.isInteger(decimal) || !isFinite(decimal)) return null;

  const sign = decimal < 0 ? -1 : 1;
  let x = Math.abs(decimal);

  let h1 = 1, h0 = 0;
  let k1 = 0, k0 = 1;
  let b = x;

  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b);
    const h = a * h1 + h0;
    const k = a * k1 + k0;

    if (k > maxDenominator) break;

    h0 = h1;
    h1 = h;
    k0 = k1;
    k1 = k;

    const currentFraction = h1 / k1;
    if (Math.abs(x - currentFraction) < 1e-9) {
      break;
    }

    const diff = b - a;
    if (Math.abs(diff) < 1e-12) break;
    b = 1 / diff;
  }

  if (k1 === 0 || k1 > maxDenominator) return null;
  const error = Math.abs(Math.abs(decimal) - h1 / k1);
  if (error > 1e-6) return null;

  return `${sign * h1}/${k1}`;
}

/**
 * Type-safe angle conversion wrapper for DEG/GRAD modes.
 * Fixes BUG-10.
 */
function createTrigScope(angleUnit: AngleUnit): Record<string, unknown> {
  if (angleUnit === "RAD") return {};

  const convFactor = angleUnit === "DEG" ? Math.PI / 180 : Math.PI / 200;
  const invFactor = angleUnit === "DEG" ? 180 / Math.PI : 200 / Math.PI;

  const toRad = (arg: unknown): unknown => {
    if (typeof arg === "number") {
      return arg * convFactor;
    }
    // math.Complex or Matrix/Array
    try {
      return math.multiply(arg as math.MathType, convFactor);
    } catch {
      return arg;
    }
  };

  const fromRad = (arg: unknown): unknown => {
    if (typeof arg === "number") {
      return arg * invFactor;
    }
    try {
      return math.multiply(arg as math.MathType, invFactor);
    } catch {
      return arg;
    }
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sin: (x: unknown) => math.sin(toRad(x) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cos: (x: unknown) => math.cos(toRad(x) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tan: (x: unknown) => math.tan(toRad(x) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sec: (x: unknown) => math.sec(toRad(x) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    csc: (x: unknown) => math.csc(toRad(x) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cot: (x: unknown) => math.cot(toRad(x) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asin: (x: unknown) => fromRad(math.asin(x as any)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acos: (x: unknown) => fromRad(math.acos(x as any)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    atan: (x: unknown) => fromRad(math.atan(x as any)),
    atan2: (y: unknown, x: unknown) => {
      if (typeof y === "number" && typeof x === "number") {
        return Math.atan2(y, x) * invFactor;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return fromRad(math.atan2(y as any, x as any));
    },
  };
}

/**
 * Evaluate a mathematical expression string.
 */
export function evaluate(
  expr: string,
  angleUnit: AngleUnit = "DEG",
  memory: Record<string, number | { re: number; im: number } | string> = {},
  ans = "0"
): EvalResult {
  if (!expr || !expr.trim()) return { results: [] };

  try {
    // Normalization & substitution
    let processed = normalizeExpr(expr, angleUnit);

    // Sanitize Ans before substituting
    let sanitizedAns = ans;
    if (typeof ans === "string") {
      sanitizedAns = ans.replace(/−/g, "-").trim();
    }
    // Wrap Ans in parens if it contains operators
    if (/[+\-*/^]/.test(sanitizedAns)) {
      sanitizedAns = `(${sanitizedAns})`;
    }
    processed = processed.replace(/\bAns\b/g, sanitizedAns);

    // Scope creation
    const scope: Record<string, unknown> = {
      pi: Math.PI,
      e: Math.E,
      i: math.complex(0, 1),
      Ans: 0,
      ans: 0,
      ...createTrigScope(angleUnit),
    };

    // Parse Ans into scope if numeric
    const parsedAnsNum = parseFloat(ans);
    if (!isNaN(parsedAnsNum)) {
      scope.Ans = parsedAnsNum;
      scope.ans = parsedAnsNum;
    }

    // Add memory registers
    for (const [k, v] of Object.entries(memory)) {
      if (typeof v === "number") {
        scope[k] = v;
      } else if (typeof v === "object" && v !== null && "re" in v) {
        scope[k] = math.complex((v as { re: number; im: number }).re, (v as { re: number; im: number }).im);
      } else if (typeof v === "string") {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) scope[k] = parsed;
      }
    }

    const result = math.evaluate(processed, scope);
    return formatResult(result);
  } catch (err) {
    // Fallback: try solving as an equation
    if (/[xX]/.test(expr)) {
      const solveResults = detectAndSolve(expr);
      if (solveResults && solveResults.length > 0) {
        return { results: solveResults as CalcResult[] };
      }
    }
    return {
      results: [],
      error: err instanceof Error ? err.message : "Syntax Error",
    };
  }
}

export function formatResult(result: unknown): EvalResult {
  if (result === undefined || result === null) {
    return { results: [{ label: "=", value: "undefined", numeric: null, raw: null }] };
  }

  // Complex number
  if (math.typeOf(result) === "Complex") {
    const c = result as math.Complex;
    const re = c.re;
    const im = c.im;

    if (Math.abs(im) < 1e-12) {
      const val = formatNumber(re);
      return { results: [{ label: "=", value: val, numeric: re, raw: re }] };
    }

    const sign = im >= 0 ? "+" : "−";
    const imAbs = Math.abs(im);
    const reStr = formatNumber(re);
    const imStr = formatNumber(imAbs);

    return {
      results: [
        {
          label: "=",
          value: `${reStr} ${sign} ${imStr}i`,
          numeric: null,
          isComplex: true,
          raw: { re, im },
          latex: `${re} ${im >= 0 ? "+" : "-"} ${imAbs}i`,
        },
      ],
      isComplex: true,
    };
  }

  // Matrix or Array
  if (math.typeOf(result) === "Matrix" || Array.isArray(result)) {
    const arr = Array.isArray(result) ? result : (result as math.Matrix).toArray();
    const formatted = formatMatrix(arr as unknown[]);
    return {
      results: [{ label: "=", value: formatted, numeric: null, raw: arr as number[][] }],
    };
  }

  // Number
  if (typeof result === "number") {
    if (!isFinite(result)) {
      return {
        results: [
          {
            label: "=",
            value: result > 0 ? "∞" : result < 0 ? "-∞" : "NaN",
            numeric: result,
            raw: result,
          },
        ],
      };
    }
    const val = formatNumber(result);
    return { results: [{ label: "=", value: val, numeric: result, raw: result }] };
  }

  // Boolean
  if (typeof result === "boolean") {
    return { results: [{ label: "=", value: result ? "1" : "0", numeric: result ? 1 : 0, raw: result ? 1 : 0 }] };
  }

  // Fallback string
  return { results: [{ label: "=", value: String(result), numeric: null, raw: String(result) }] };
}

function formatMatrix(arr: unknown[]): string {
  if (!Array.isArray(arr) || arr.length === 0) return "[]";
  if (!Array.isArray(arr[0])) {
    return "[" + (arr as number[]).map(formatNumber).join(", ") + "]";
  }
  const rows = (arr as number[][]).map(
    (row) => "[" + row.map(formatNumber).join(", ") + "]"
  );
  return "[" + rows.join("; ") + "]";
}

/**
 * Lossless exact/decimal (S⇔D) toggle.
 * Fixes BUG-11.
 */
export function toggleExactDecimal(
  result: CalcResult,
  isExact: boolean,
  angleUnit: AngleUnit = "DEG"
): CalcResult {
  if (result.isComplex && result.raw && typeof result.raw === "object" && "re" in result.raw) {
    const c = result.raw as { re: number; im: number };
    if (isExact) {
      // Toggle to polar
      const polarStr = rectToPolar(c.re, c.im, angleUnit);
      return { ...result, value: polarStr };
    } else {
      // Toggle to rectangular
      const sign = c.im >= 0 ? "+" : "−";
      const rectStr = `${formatNumber(c.re)} ${sign} ${formatNumber(Math.abs(c.im))}i`;
      return { ...result, value: rectStr };
    }
  }

  const num = typeof result.raw === "number" ? result.raw : parseFloat(result.value);
  if (isNaN(num)) return result;

  if (isExact) {
    const frac = toFraction(num);
    return { ...result, value: frac || formatNumber(num) };
  } else {
    return { ...result, value: formatNumber(num) };
  }
}

export function rectToPolar(re: number, im: number, angleUnit: AngleUnit): string {
  const r = Math.sqrt(re * re + im * im);
  const thetaRad = Math.atan2(im, re);
  const thetaConverted = fromRadians(thetaRad, angleUnit);
  const unit = angleUnit === "RAD" ? " rad" : angleUnit === "DEG" ? "°" : " grad";
  return `${formatNumber(r)}∠${formatNumber(thetaConverted)}${unit}`;
}

export function polarToRect(r: number, theta: number, angleUnit: AngleUnit): string {
  const thetaRad = toRadians(theta, angleUnit);
  const re = r * Math.cos(thetaRad);
  const im = r * Math.sin(thetaRad);
  const sign = im >= 0 ? "+" : "−";
  return `${formatNumber(re)} ${sign} ${formatNumber(Math.abs(im))}i`;
}
