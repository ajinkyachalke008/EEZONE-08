export type Base = "DEC" | "HEX" | "BIN" | "OCT";
export type WordSize = 8 | 16 | 32 | 64;

const BASE_MAP: Record<Base, number> = {
  DEC: 10,
  HEX: 16,
  BIN: 2,
  OCT: 8,
};

const PREFIX_MAP: Record<Base, string> = {
  DEC: "",
  HEX: "0x",
  BIN: "0b",
  OCT: "0o",
};

/**
 * Convert a number string from one base to another base.
 */
export function convertBase(value: string, fromBase: Base, toBase: Base): string {
  try {
    let stripped = value.trim();
    if (stripped.startsWith("0x") || stripped.startsWith("0X")) stripped = stripped.slice(2);
    else if (stripped.startsWith("0b") || stripped.startsWith("0B")) stripped = stripped.slice(2);
    else if (stripped.startsWith("0o") || stripped.startsWith("0O")) stripped = stripped.slice(2);

    if (!stripped) return "0";
    const bigVal = BigInt(parseInt(stripped, BASE_MAP[fromBase]));
    return bigVal.toString(BASE_MAP[toBase]).toUpperCase();
  } catch {
    return "Error";
  }
}

/**
 * Format a number in a given base with prefix and optional two's complement bit mask.
 */
export function formatInBase(
  value: number | bigint,
  base: Base,
  wordSize: WordSize = 32,
  twosComplement = true
): string {
  try {
    let bigVal = typeof value === "bigint" ? value : BigInt(Math.trunc(value));

    if (twosComplement && bigVal < BigInt(0)) {
      const mask = (BigInt(1) << BigInt(wordSize)) - BigInt(1);
      bigVal = bigVal & mask;
    }

    const prefix = PREFIX_MAP[base];
    const str = bigVal.toString(BASE_MAP[base]).toUpperCase();
    return prefix + str;
  } catch {
    return "Error";
  }
}

/**
 * Parse a value string in given base to a BigInt
 */
export function parseBaseN(value: string, base: Base): bigint {
  let stripped = value.trim();
  if (stripped.startsWith("0x") || stripped.startsWith("0X")) stripped = stripped.slice(2);
  else if (stripped.startsWith("0b") || stripped.startsWith("0B")) stripped = stripped.slice(2);
  else if (stripped.startsWith("0o") || stripped.startsWith("0O")) stripped = stripped.slice(2);
  if (!stripped) return BigInt(0);
  return BigInt(parseInt(stripped, BASE_MAP[base]));
}

// Bitwise operations using BigInt
export function bitwiseAND(a: bigint, b: bigint): bigint { return a & b; }
export function bitwiseOR(a: bigint, b: bigint): bigint { return a | b; }
export function bitwiseXOR(a: bigint, b: bigint): bigint { return a ^ b; }
export function bitwiseNOT(a: bigint, wordSize: WordSize = 32): bigint {
  const mask = (BigInt(1) << BigInt(wordSize)) - BigInt(1);
  return (~a) & mask;
}
export function bitwiseLSHIFT(a: bigint, n: bigint): bigint { return a << n; }
export function bitwiseRSHIFT(a: bigint, n: bigint): bigint { return a >> n; }

/**
 * Display representations of a value in all bases with optional two's complement.
 */
export function allBaseRepresentations(
  value: number,
  wordSize: WordSize = 32,
  twosComplement = false
): Record<Base, string> {
  let n = BigInt(Math.trunc(value));
  if (twosComplement && n < BigInt(0)) {
    const mask = (BigInt(1) << BigInt(wordSize)) - BigInt(1);
    n = n & mask;
  }

  return {
    DEC: typeof value === "number" ? Math.trunc(value).toString(10) : n.toString(10),
    HEX: "0x" + n.toString(16).toUpperCase(),
    BIN: "0b" + n.toString(2),
    OCT: "0o" + n.toString(8),
  };
}
