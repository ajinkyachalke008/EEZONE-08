"use client";
import { type KeyDef } from "@/lib/calc-engine/keymap";

interface CalcKeyProps {
  keyDef: KeyDef;
  shiftActive: boolean;
  alphaActive: boolean;
  onPress: (keyId: string) => void;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  default: { background: "#181B22", borderColor: "#2A2E38", color: "#F4EFE4" },
  modifier: { background: "#111319", borderColor: "#E8B93F", color: "#E8B93F" },
  numeral: { background: "#1A1E27", borderColor: "#2A2E38", color: "#F5D785" },
  operator: { background: "#181B22", borderColor: "#2A2E38", color: "#F4EFE4" },
  equals: {
    background: "linear-gradient(135deg, #E8B93F, #8A6A22)",
    borderColor: "#E8B93F",
    color: "#08090C",
    fontWeight: 700,
    boxShadow: "0 0 12px rgba(232,185,63,0.4)",
  },
  delete: { background: "#181B22", borderColor: "#E8B93F", color: "#E8B93F" },
  clear: { background: "#181B22", borderColor: "#E8B93F", color: "#E8B93F" },
  function: { background: "#181B22", borderColor: "#2A2E38", color: "#F4EFE4" },
  icon: {
    background: "#111319",
    borderColor: "#2A2E38",
    color: "#8A6A22",
    fontSize: "11px",
    flexDirection: "column",
    gap: "1px",
  },
  utility: { background: "transparent", borderColor: "transparent", color: "#8A6A22", fontSize: "11px" },
};

export function CalcKey({ keyDef, shiftActive, alphaActive, onPress, size = "md", style }: CalcKeyProps) {
  const baseStyle = VARIANT_STYLES[keyDef.variant] ?? VARIANT_STYLES.default;

  const isShiftHighlight = shiftActive && keyDef.shift;
  const isAlphaHighlight = alphaActive && keyDef.alpha;

  const borderColor = isShiftHighlight
    ? "rgba(232,185,63,0.7)"
    : isAlphaHighlight
    ? "rgba(124,92,214,0.7)"
    : (baseStyle.borderColor as string) ?? "#2A2E38";

  const sizeStyles: React.CSSProperties =
    size === "sm"
      ? { minHeight: 36, padding: "2px 4px" }
      : size === "lg"
      ? { minHeight: 54, padding: "6px 4px" }
      : { minHeight: 44, padding: "4px 4px" };

  return (
    <button
      onClick={() => onPress(keyDef.id)}
      className="calc-key"
      style={{
        ...baseStyle,
        ...sizeStyles,
        ...style,
        borderColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Rajdhani", sans-serif',
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.1s ease",
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        gap: "1px",
      }}
      aria-label={`${keyDef.primary}${keyDef.shift ? `, SHIFT: ${keyDef.shift}` : ""}${keyDef.alpha ? `, ALPHA: ${keyDef.alpha}` : ""}`}
    >
      {/* SHIFT caption (top, gold) */}
      {keyDef.shift && (
        <span
          style={{
            fontSize: "8px",
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 600,
            color: isShiftHighlight ? "#F5D785" : "#8A6A22",
            lineHeight: 1,
            letterSpacing: "0.03em",
            height: "10px",
            display: "flex",
            alignItems: "center",
            opacity: keyDef.shift ? 1 : 0,
            transition: "color 0.15s",
          }}
        >
          {keyDef.shift}
        </span>
      )}

      {/* Primary label */}
      <span
        style={{
          fontSize: keyDef.variant === "numeral" ? "16px" : keyDef.variant === "equals" ? "18px" : keyDef.variant === "icon" ? "10px" : "13px",
          fontFamily: '"Rajdhani", sans-serif',
          fontWeight: keyDef.variant === "numeral" ? 600 : keyDef.variant === "icon" ? 700 : 500,
          color: isShiftHighlight
            ? "#E8B93F"
            : isAlphaHighlight
            ? "#7C5CD6"
            : (baseStyle.color as string) ?? "#F4EFE4",
          lineHeight: 1.1,
          letterSpacing: keyDef.variant === "icon" ? "0.04em" : "0.03em",
          transition: "color 0.15s",
          textAlign: "center" as const,
        }}
      >
        {keyDef.primary}
      </span>

      {/* ALPHA caption (bottom, violet) */}
      {keyDef.alpha && (
        <span
          style={{
            fontSize: "8px",
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 600,
            color: isAlphaHighlight ? "#9B7FE8" : "#3D3060",
            lineHeight: 1,
            letterSpacing: "0.03em",
            height: "10px",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
        >
          {keyDef.alpha}
        </span>
      )}
    </button>
  );
}
