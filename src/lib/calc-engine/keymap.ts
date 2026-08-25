/**
 * ClassWiz-style keymap definitions
 * Fixes BUG-06, BUG-07, BUG-08
 */

export type KeyVariant =
  | "default"
  | "modifier"
  | "numeral"
  | "operator"
  | "equals"
  | "delete"
  | "clear"
  | "function"
  | "icon"
  | "utility";

export interface KeyDef {
  id: string;
  primary: string;
  shift?: string;
  alpha?: string;
  variant: KeyVariant;
  wide?: boolean;
  tall?: boolean;
}

// Row 1: Modifiers
export const MODIFIER_ROW: KeyDef[] = [
  { id: "shift", primary: "SHIFT", variant: "modifier" },
  { id: "alpha", primary: "ALPHA", variant: "modifier" },
  { id: "left", primary: "←", shift: "INS", alpha: "", variant: "function" },
  { id: "right", primary: "→", shift: "", alpha: "", variant: "function" },
  { id: "mode", primary: "MODE", shift: "SETUP", alpha: "", variant: "modifier" },
  { id: "more", primary: "⋮", shift: "", alpha: "", variant: "function" },
];

// Row 2: OPTN/CALC row
export const OPTN_ROW: KeyDef[] = [
  { id: "optn", primary: "OPTN", shift: "CLR", alpha: "{", variant: "function" },
  { id: "calc", primary: "CALC", shift: "SOLVE", alpha: "}", variant: "function" },
  { id: "up", primary: "∧", shift: "∫dx", alpha: "A", variant: "function" },
  { id: "down", primary: "∨", shift: "d/dx", alpha: "B", variant: "function" },
  { id: "intdx", primary: "∫dx", shift: "Σ", alpha: "C", variant: "function" },
  { id: "xvar", primary: "x", shift: "Limit", alpha: "D", variant: "function" },
];

// Row 3: Fractions / Roots / Powers / Log
export const FRAC_ROW: KeyDef[] = [
  { id: "frac", primary: "a/b", shift: "a+b/c", alpha: "E", variant: "function" },
  { id: "sqrt", primary: "√", shift: "ⁿ√", alpha: "F", variant: "function" },
  { id: "square", primary: "x²", shift: "x³", alpha: "G", variant: "function" },
  { id: "power", primary: "xᵐ", shift: "x⁻¹", alpha: "H", variant: "function" },
  { id: "logax", primary: "log", shift: "10ˣ", alpha: "I", variant: "function" },
  { id: "ln", primary: "ln", shift: "eˣ", alpha: "J", variant: "function" },
];

// Row 4: Neg / Reciprocal / Inverse Trig / Trig
export const TRIG_ROW: KeyDef[] = [
  { id: "negate", primary: "(−)", shift: "∠", alpha: "K", variant: "function" },
  { id: "recip", primary: "1/x", shift: "x!", alpha: "i", variant: "function" },
  { id: "asin", primary: "sin⁻¹", shift: "sinh", alpha: "L", variant: "function" },
  { id: "sin", primary: "sin", shift: "sinh⁻¹", alpha: "M", variant: "function" },
  { id: "cos", primary: "cos", shift: "cosh", alpha: "N", variant: "function" },
  { id: "tan", primary: "tan", shift: "tanh", alpha: "O", variant: "function" },
];

// Row 5: STO / ENG / Parens / S⇔D / M+
export const STO_ROW: KeyDef[] = [
  { id: "sto", primary: "STO", shift: "RCL", alpha: "P", variant: "function" },
  { id: "eng", primary: "ENG", shift: "∠", alpha: "Q", variant: "function" },
  { id: "lparen", primary: "(", shift: "Limit", alpha: "R", variant: "function" },
  { id: "rparen", primary: ")", shift: "", alpha: "S", variant: "function" },
  { id: "sd", primary: "S⇔D", shift: "M⁻", alpha: "T", variant: "function" },
  { id: "mplus", primary: "M+", shift: "M−", alpha: "U", variant: "function" },
];

// Numeric block
export const NUMERIC_BLOCK: KeyDef[] = [
  { id: "n7", primary: "7", shift: "DEC", alpha: "V", variant: "numeral" },
  { id: "n8", primary: "8", shift: "HEX", alpha: "W", variant: "numeral" },
  { id: "n9", primary: "9", shift: "BIN", alpha: "X", variant: "numeral" },
  { id: "del", primary: "DEL", shift: "INS", alpha: "", variant: "delete" },
  { id: "ac", primary: "AC", shift: "OFF", alpha: "", variant: "clear" },
  { id: "n4", primary: "4", shift: "OCT", alpha: "Y", variant: "numeral" },
  { id: "n5", primary: "5", shift: "AND", alpha: "Z", variant: "numeral" },
  { id: "n6", primary: "6", shift: "OR", alpha: "=", variant: "numeral" },
  { id: "mul", primary: "×", shift: "XOR", alpha: ":", variant: "operator" },
  { id: "div", primary: "÷", shift: "XNOR", alpha: ";", variant: "operator" },
  { id: "n1", primary: "1", shift: "", alpha: "?", variant: "numeral" },
  { id: "n2", primary: "2", shift: "", alpha: "!", variant: "numeral" },
  { id: "n3", primary: "3", shift: "", alpha: '"', variant: "numeral" },
  { id: "add", primary: "+", shift: "", alpha: "·", variant: "operator" },
  { id: "sub", primary: "−", shift: "", alpha: "−", variant: "operator" },
  { id: "comma", primary: "CP", shift: "P(", alpha: ",", variant: "function" },
  { id: "n0", primary: "0", shift: "", alpha: "", variant: "numeral" },
  { id: "dot", primary: ".", shift: "", alpha: "", variant: "numeral" },
  { id: "exp", primary: "EXP", shift: "π", alpha: "e", variant: "function" },
  { id: "ans", primary: "Ans", shift: "PreAns", alpha: "%", variant: "function" },
  { id: "equals", primary: "=", shift: "EXEC", alpha: "", variant: "equals", wide: false },
];

// Left icon rail
export const ICON_RAIL: KeyDef[] = [
  { id: "matrix", primary: "▦ MAT", shift: "", alpha: "", variant: "icon" },
  { id: "vector", primary: "⊛ VEC", shift: "", alpha: "", variant: "icon" },
  { id: "stat", primary: "▤ STAT", shift: "", alpha: "", variant: "icon" },
  { id: "script", primary: "</> PY", shift: "", alpha: "", variant: "icon" },
  { id: "ee_assistant", primary: "⚡ EE", shift: "", alpha: "", variant: "icon" },
];

// Utility row at the bottom
export const UTILITY_ROW: KeyDef[] = [
  { id: "pi", primary: "π", variant: "utility" },
  { id: "euler", primary: "e", variant: "utility" },
  { id: "percent", primary: "%", variant: "utility" },
  { id: "rnd", primary: "Rnd", variant: "utility" },
  { id: "ran", primary: "Ran#", variant: "utility" },
  { id: "preAns", primary: "PreAns", variant: "utility" },
  { id: "history", primary: "History⟲", variant: "utility" },
];

export interface KeyAction {
  insert?: string;
  command?: string;
  insertLatex?: string;
}

export function getKeyAction(
  keyId: string,
  modifier: "none" | "shift" | "alpha"
): KeyAction {
  const actions: Record<string, Record<"none" | "shift" | "alpha", KeyAction>> = {
    // Numerals
    n0: { none: { insert: "0" }, shift: { insert: "0" }, alpha: { insert: "0" } },
    n1: { none: { insert: "1" }, shift: { insert: "1" }, alpha: { insert: "?" } },
    n2: { none: { insert: "2" }, shift: { insert: "2" }, alpha: { insert: "!" } },
    n3: { none: { insert: "3" }, shift: { insert: "3" }, alpha: { insert: '"' } },
    n4: { none: { insert: "4" }, shift: { command: "base_oct" }, alpha: { insert: "Y" } },
    n5: { none: { insert: "5" }, shift: { command: "bitwise_and" }, alpha: { insert: "Z" } },
    n6: { none: { insert: "6" }, shift: { command: "bitwise_or" }, alpha: { insert: "=" } },
    n7: { none: { insert: "7" }, shift: { command: "base_dec" }, alpha: { insert: "V" } },
    n8: { none: { insert: "8" }, shift: { command: "base_hex" }, alpha: { insert: "W" } },
    n9: { none: { insert: "9" }, shift: { command: "base_bin" }, alpha: { insert: "X" } },
    dot: { none: { insert: "." }, shift: { insert: "." }, alpha: { insert: "." } },
    exp: { none: { insert: "×10^" }, shift: { insert: "π" }, alpha: { insert: "e" } },

    // Operators
    add: { none: { insert: "+" }, shift: { insert: "+" }, alpha: { insert: "·" } },
    sub: { none: { insert: "-" }, shift: { insert: "-" }, alpha: { insert: "-" } },
    mul: { none: { insert: "×" }, shift: { command: "bitwise_xor" }, alpha: { insert: ":" } },
    div: { none: { insert: "÷" }, shift: { command: "bitwise_xnor" }, alpha: { insert: ";" } },

    // Delete / Clear
    del: { none: { command: "delete" }, shift: { command: "insert_mode" }, alpha: { command: "delete" } },
    ac: { none: { command: "clear_all" }, shift: { command: "off" }, alpha: { command: "clear_all" } },

    // Equals
    equals: { none: { command: "evaluate" }, shift: { command: "evaluate" }, alpha: { command: "evaluate" } },

    // Functions
    frac: { none: { insert: "/", insertLatex: "\\frac{}{}" }, shift: { insert: "a+b/c" }, alpha: { insert: "E" } },
    sqrt: { none: { insert: "sqrt(", insertLatex: "\\sqrt{}" }, shift: { insert: "nthRoot(" }, alpha: { insert: "F" } },
    square: { none: { insert: "^2" }, shift: { insert: "^3" }, alpha: { insert: "G" } },
    power: { none: { insert: "^" }, shift: { insert: "^(-1)" }, alpha: { insert: "H" } },
    logax: { none: { insert: "log(" }, shift: { insert: "10^(" }, alpha: { insert: "I" } },
    ln: { none: { insert: "ln(" }, shift: { insert: "e^(" }, alpha: { insert: "J" } },
    sin: { none: { insert: "sin(" }, shift: { insert: "sinh(" }, alpha: { insert: "M" } },
    cos: { none: { insert: "cos(" }, shift: { insert: "cosh(" }, alpha: { insert: "N" } },
    tan: { none: { insert: "tan(" }, shift: { insert: "tanh(" }, alpha: { insert: "O" } },
    asin: { none: { insert: "asin(" }, shift: { insert: "asinh(" }, alpha: { insert: "L" } },
    recip: { none: { insert: "1÷(" }, shift: { insert: "factorial(" }, alpha: { insert: "i" } },
    negate: { none: { insert: "-" }, shift: { insert: "∠" }, alpha: { insert: "K" } },
    lparen: { none: { insert: "(" }, shift: { command: "cas_limit" }, alpha: { insert: "R" } },
    rparen: { none: { insert: ")" }, shift: { insert: ")" }, alpha: { insert: "S" } },
    xvar: { none: { insert: "x" }, shift: { command: "cas_limit" }, alpha: { insert: "D" } },
    intdx: {
      none: { command: "cas_integrate" },
      shift: { command: "cas_sum" },
      alpha: { insert: "C" },
    },
    // BUG-07: Navigation instead of calculus
    up: {
      none: { command: "history_prev" },
      shift: { command: "cas_integrate" },
      alpha: { insert: "A" },
    },
    down: {
      none: { command: "history_next" },
      shift: { command: "cas_diff" },
      alpha: { insert: "B" },
    },
    comma: { none: { insert: "," }, shift: { insert: "P(" }, alpha: { insert: "," } },
    // BUG-08: Fixed Shift+Ans to PreAns
    ans: { none: { insert: "Ans" }, shift: { insert: "PreAns" }, alpha: { insert: "%" } },

    // Modifiers
    shift: { none: { command: "toggle_shift" }, shift: { command: "toggle_shift" }, alpha: { command: "toggle_shift" } },
    alpha: { none: { command: "toggle_alpha" }, shift: { command: "toggle_alpha" }, alpha: { command: "toggle_alpha" } },
    left: { none: { command: "move_left" }, shift: { command: "move_left" }, alpha: { command: "move_left" } },
    right: { none: { command: "move_right" }, shift: { command: "move_right" }, alpha: { command: "move_right" } },
    mode: { none: { command: "mode_menu" }, shift: { command: "setup" }, alpha: { command: "mode_menu" } },
    more: { none: { command: "more_menu" }, shift: { command: "more_menu" }, alpha: { command: "more_menu" } },
    optn: { none: { command: "optn_menu" }, shift: { command: "clear" }, alpha: { insert: "{" } },
    calc: { none: { command: "calc_evaluate" }, shift: { command: "solve" }, alpha: { insert: "}" } },

    // Special
    sto: { none: { command: "sto_memory" }, shift: { command: "rcl_memory" }, alpha: { insert: "P" } },
    eng: { none: { command: "eng_notation" }, shift: { insert: "∠" }, alpha: { insert: "Q" } },
    sd: { none: { command: "toggle_sd" }, shift: { command: "toggle_sd" }, alpha: { insert: "T" } },
    mplus: { none: { command: "m_plus" }, shift: { command: "m_minus" }, alpha: { insert: "U" } },

    // Icon rail
    matrix: { none: { command: "open_matrix" }, shift: { command: "open_matrix" }, alpha: { command: "open_matrix" } },
    vector: { none: { command: "open_vector" }, shift: { command: "open_vector" }, alpha: { command: "open_vector" } },
    stat: { none: { command: "open_stat" }, shift: { command: "open_stat" }, alpha: { command: "open_stat" } },
    script: { none: { command: "open_script" }, shift: { command: "open_script" }, alpha: { command: "open_script" } },
    ee_assistant: { none: { command: "open_ee_assistant" }, shift: { command: "open_ee_assistant" }, alpha: { command: "open_ee_assistant" } },

    // Utility row
    pi: { none: { insert: "π" }, shift: { insert: "π" }, alpha: { insert: "π" } },
    euler: { none: { insert: "e" }, shift: { insert: "e" }, alpha: { insert: "e" } },
    percent: { none: { insert: "%" }, shift: { insert: "%" }, alpha: { insert: "%" } },
    rnd: { none: { command: "rnd" }, shift: { command: "rnd" }, alpha: { command: "rnd" } },
    ran: { none: { command: "ran" }, shift: { command: "ran" }, alpha: { command: "ran" } },
    preAns: { none: { insert: "PreAns" }, shift: { insert: "PreAns" }, alpha: { insert: "PreAns" } },
    history: { none: { command: "show_history" }, shift: { command: "show_history" }, alpha: { command: "show_history" } },
  };

  return actions[keyId]?.[modifier] ?? { insert: "" };
}
