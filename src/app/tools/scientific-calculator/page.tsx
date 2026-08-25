import type { Metadata } from "next";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";

export const metadata: Metadata = {
  title: "Scientific Calculator — EE Zone",
  description: "Advanced engineering scientific calculator with CAS, phasor arithmetic, 2D plotting, matrix/vector engine, Python scripting, and OCR equation scanning.",
};

export default function ScientificCalculatorPage() {
  return <CalculatorShell />;
}
