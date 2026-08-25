/**
 * Closed-form polynomial solvers: quadratic -> quartic
 * Linear system solver via math.js lusolve
 * Fixes BUG-01, BUG-12
 */
import * as math from "mathjs";
import { normalizeEquation } from "./normalize";

export interface SolveResult {
  label: string;
  value: string;
  numeric: number | null;
  isComplex?: boolean;
  raw?: number | { re: number; im: number } | null;
  latex?: string;
}

export function complexToString(re: number, im: number, precision = 10): string {
  const reVal = +re.toPrecision(precision);
  if (Math.abs(im) < 1e-12) return String(reVal);
  const sign = im >= 0 ? "+" : "−";
  const imVal = +Math.abs(im).toPrecision(precision);
  return `${reVal} ${sign} ${imVal}i`;
}

/**
 * Quadratic: ax² + bx + c = 0
 */
export function solveQuadratic(a: number, b: number, c: number): SolveResult[] {
  const disc = b * b - 4 * a * c;
  if (disc >= 0) {
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);
    const x2 = (-b - Math.sqrt(disc)) / (2 * a);
    return [
      { label: "X₁", value: String(+x1.toPrecision(10)), numeric: x1, raw: x1 },
      { label: "X₂", value: String(+x2.toPrecision(10)), numeric: x2, raw: x2 },
    ];
  } else {
    const re = -b / (2 * a);
    const im = Math.sqrt(-disc) / (2 * a);
    return [
      {
        label: "X₁",
        value: complexToString(re, im),
        numeric: null,
        isComplex: true,
        raw: { re, im },
        latex: `${re} + ${im}i`,
      },
      {
        label: "X₂",
        value: complexToString(re, -im),
        numeric: null,
        isComplex: true,
        raw: { re, im: -im },
        latex: `${re} - ${Math.abs(im)}i`,
      },
    ];
  }
}

/**
 * Cubic: ax³ + bx² + cx + d = 0 (Cardano's formula)
 */
export function solveCubic(a: number, b: number, c: number, d: number): SolveResult[] {
  const A = b / a,
    B = c / a,
    C = d / a;
  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;
  const disc = (q / 2) * (q / 2) + (p / 3) * (p / 3) * (p / 3);

  if (disc > 1e-12) {
    const u = Math.cbrt(-q / 2 + Math.sqrt(disc));
    const v = Math.cbrt(-q / 2 - Math.sqrt(disc));
    const x1 = u + v - A / 3;
    const re2 = -(u + v) / 2 - A / 3;
    const im2 = (Math.sqrt(3) / 2) * (u - v);
    return [
      { label: "X₁", value: String(+x1.toPrecision(10)), numeric: x1, raw: x1 },
      {
        label: "X₂",
        value: complexToString(re2, im2),
        numeric: null,
        isComplex: true,
        raw: { re: re2, im: im2 },
      },
      {
        label: "X₃",
        value: complexToString(re2, -im2),
        numeric: null,
        isComplex: true,
        raw: { re: re2, im: -im2 },
      },
    ];
  } else if (Math.abs(disc) <= 1e-12) {
    const u = Math.cbrt(-q / 2);
    const x1 = 2 * u - A / 3;
    const x2 = -u - A / 3;
    return [
      { label: "X₁", value: String(+x1.toPrecision(10)), numeric: x1, raw: x1 },
      { label: "X₂", value: String(+x2.toPrecision(10)), numeric: x2, raw: x2 },
      { label: "X₃", value: String(+x2.toPrecision(10)), numeric: x2, raw: x2 },
    ];
  } else {
    const r = Math.sqrt(-((p / 3) * (p / 3) * (p / 3)));
    const theta = Math.acos(-q / (2 * r));
    const m = 2 * Math.cbrt(r);
    const x1 = m * Math.cos(theta / 3) - A / 3;
    const x2 = m * Math.cos((theta + 2 * Math.PI) / 3) - A / 3;
    const x3 = m * Math.cos((theta + 4 * Math.PI) / 3) - A / 3;
    return [
      { label: "X₁", value: String(+x1.toPrecision(10)), numeric: x1, raw: x1 },
      { label: "X₂", value: String(+x2.toPrecision(10)), numeric: x2, raw: x2 },
      { label: "X₃", value: String(+x3.toPrecision(10)), numeric: x3, raw: x3 },
    ];
  }
}

/**
 * Quartic: ax⁴ + bx³ + cx² + dx + e = 0 (Ferrari's method)
 */
export function solveQuartic(a: number, b: number, c: number, d: number, e: number): SolveResult[] {
  const A = b / a,
    B = c / a,
    C = d / a,
    D = e / a;
  const p = B - (3 * A * A) / 8;
  const q = (A * A * A) / 8 - (A * B) / 2 + C;
  const r = (-3 * A * A * A * A) / 256 + (A * A * B) / 16 - (A * C) / 4 + D;

  // Resolvent cubic
  const cubicRoots = solveCubic(1, (5 / 2) * p, 2 * p * p - r, (p * p * p) / 2 - (p * r) / 2 - (q * q) / 8);
  const realCubicRoots = cubicRoots.filter((cr) => !cr.isComplex && cr.numeric !== null);
  const z0 = realCubicRoots.length > 0 ? (realCubicRoots[0].numeric as number) : 0;

  const R2 = 2 * z0 + p;
  const R = R2 > 0 ? Math.sqrt(R2) : 0;

  const results: SolveResult[] = [];
  const addRoots = (subDisc: number, subRe: number) => {
    if (subDisc >= 0) {
      const s = Math.sqrt(subDisc);
      const r1 = subRe + s - A / 4;
      const r2 = subRe - s - A / 4;
      results.push({ label: `X${results.length + 1}`, value: String(+r1.toPrecision(10)), numeric: r1, raw: r1 });
      results.push({ label: `X${results.length + 1}`, value: String(+r2.toPrecision(10)), numeric: r2, raw: r2 });
    } else {
      const im = Math.sqrt(-subDisc);
      const re = subRe - A / 4;
      results.push({
        label: `X${results.length + 1}`,
        value: complexToString(re, im),
        numeric: null,
        isComplex: true,
        raw: { re, im },
      });
      results.push({
        label: `X${results.length + 1}`,
        value: complexToString(re, -im),
        numeric: null,
        isComplex: true,
        raw: { re, im: -im },
      });
    }
  };

  if (Math.abs(R) < 1e-12) {
    const disc1 = z0 * z0 - r;
    const s1 = disc1 >= 0 ? Math.sqrt(disc1) : 0;
    addRoots(-p - 2 * s1, 0);
    addRoots(-p + 2 * s1, 0);
  } else {
    const disc1 = -2 * z0 - p - (2 * q) / R;
    const disc2 = -2 * z0 - p + (2 * q) / R;
    addRoots(disc1 / 4, R / 2);
    addRoots(disc2 / 4, -R / 2);
  }

  return results.slice(0, 4);
}

/**
 * Detect equation type and solve. Normalizes '=' into lhs - rhs (BUG-01)
 */
export function detectAndSolve(expr: string): SolveResult[] | null {
  try {
    const normalized = normalizeEquation(expr);
    const coefficients = extractPolynomialCoeffs(normalized);
    if (!coefficients) return null;

    const deg = coefficients.length - 1;
    if (deg === 1) {
      const x = -coefficients[1] / coefficients[0];
      return [{ label: "X₁", value: String(+x.toPrecision(10)), numeric: x, raw: x }];
    } else if (deg === 2) {
      return solveQuadratic(coefficients[0], coefficients[1], coefficients[2]);
    } else if (deg === 3) {
      return solveCubic(coefficients[0], coefficients[1], coefficients[2], coefficients[3]);
    } else if (deg === 4) {
      return solveQuartic(coefficients[0], coefficients[1], coefficients[2], coefficients[3], coefficients[4]);
    }
    return null;
  } catch {
    return null;
  }
}

function extractPolynomialCoeffs(expr: string): number[] | null {
  const cleanExpr = expr.trim().replace(/\s+/g, "");
  if (!/[xX]/.test(cleanExpr)) return null;

  try {
    const points = [-2, -1, 0, 1, 2, 3, 4, 5];
    const values: number[] = [];

    for (const x of points) {
      const val = math.evaluate(cleanExpr, { x, X: x });
      if (typeof val !== "number" || !isFinite(val)) return null;
      values.push(val);
    }

    for (let deg = 1; deg <= 4; deg++) {
      const xPoints = points.slice(0, deg + 1);
      const yPoints = values.slice(0, deg + 1);
      const coeffs = vandermondeSolve(xPoints, yPoints, deg);
      if (coeffs) {
        let valid = true;
        for (let i = deg + 1; i < points.length; i++) {
          const predicted = evalPoly(coeffs, points[i]);
          if (Math.abs(predicted - values[i]) > 1e-5) {
            valid = false;
            break;
          }
        }
        if (valid) return coeffs;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function vandermondeSolve(xs: number[], ys: number[], deg: number): number[] | null {
  const n = deg + 1;
  const A: number[][] = xs.map((x) =>
    Array.from({ length: n }, (_, j) => Math.pow(x, deg - j))
  );
  try {
    const mat = math.matrix(A);
    const rhs = math.matrix(ys.map((y) => [y]));
    const solution = math.lusolve(mat, rhs);
    const arr = (solution as math.Matrix).toArray() as number[][];
    return arr.map((row) => row[0]);
  } catch {
    return null;
  }
}

function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  const deg = coeffs.length - 1;
  for (let i = 0; i <= deg; i++) {
    result += coeffs[i] * Math.pow(x, deg - i);
  }
  return result;
}

/**
 * Solve a linear system Ax = b using math.js lusolve
 */
export function solveLinearSystem(A: number[][], b: number[]): SolveResult[] {
  try {
    const matA = math.matrix(A);
    const vecB = math.matrix(b.map((v) => [v]));
    const solution = math.lusolve(matA, vecB);
    const arr = (solution as math.Matrix).toArray() as number[][];
    return arr.map((row, i) => ({
      label: `X${i + 1}`,
      value: String(+row[0].toPrecision(10)),
      numeric: row[0],
      raw: row[0],
    }));
  } catch {
    return [{ label: "Error", value: "No unique solution", numeric: null, raw: null }];
  }
}
