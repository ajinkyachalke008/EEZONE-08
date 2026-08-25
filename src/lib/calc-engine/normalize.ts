/**
 * Centralized expression normalization for mathjs, nerdamer, and solver.
 * Fixes BUG-01, BUG-02, BUG-09.
 */

export type AngleUnit = "DEG" | "RAD" | "GRAD";

/**
 * Normalizes symbols (Unicode multiply/divide/minus, pi, infinity)
 * and resolves polar notation (r∠θ).
 */
export function normalizeExpr(expr: string, angleUnit: AngleUnit = "DEG"): string {
  if (!expr) return "";

  let processed = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-") // U+2212 to ASCII minus
    .replace(/\*\*/g, "^")
    .replace(/π/g, "pi")
    .replace(/∞/g, "Infinity");

  // Handle polar notation: r∠θ
  // Support forms like 5∠30, -5.2∠45, (2+3)∠(30*2)
  if (processed.includes("∠")) {
    processed = convertPolarNotation(processed, angleUnit);
  }

  return processed.trim();
}

/**
 * Convert polar notation expressions r∠θ to rectangular (r*cos(θ) + r*sin(θ)*i)
 */
function convertPolarNotation(expr: string, angleUnit: AngleUnit): string {
  // Regex to match r∠θ patterns.
  // Matches numeric or parenthesized terms for magnitude and angle
  const polarRegex = /((?:\([^()]+\)|[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?))\s*∠\s*((?:\([^()]+\)|[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?))/gi;

  let prev = "";
  let current = expr;

  // Repeat in case of nested or chained polar tokens
  while (current !== prev && current.includes("∠")) {
    prev = current;
    current = current.replace(polarRegex, (_, r, theta) => {
      const thetaVal = theta.trim();
      const rVal = r.trim();

      let thetaRadExpr: string;
      if (angleUnit === "RAD") {
        thetaRadExpr = `(${thetaVal})`;
      } else if (angleUnit === "GRAD") {
        thetaRadExpr = `((${thetaVal}) * pi / 200)`;
      } else {
        // DEG
        thetaRadExpr = `((${thetaVal}) * pi / 180)`;
      }

      return `((${rVal}) * cos(${thetaRadExpr}) + (${rVal}) * sin(${thetaRadExpr}) * i)`;
    });
  }

  return current;
}

/**
 * Centralized equation transformation for equation solver.
 * If expression has '=', transforms lhs = rhs -> (lhs) - (rhs)
 */
export function normalizeEquation(expr: string, angleUnit: AngleUnit = "DEG"): string {
  const normalized = normalizeExpr(expr, angleUnit);
  if (!normalized.includes("=")) {
    return normalized;
  }

  const parts = normalized.split("=");
  if (parts.length === 2) {
    const lhs = parts[0].trim();
    const rhs = parts[1].trim() || "0";
    return `(${lhs}) - (${rhs})`;
  }

  return normalized.replace(/=/g, "-");
}
