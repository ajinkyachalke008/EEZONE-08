import { NextRequest, NextResponse } from "next/server";

// ── OpenSCAD Expert System Prompt ────────────────────────────
const SYSTEM_PROMPT = `You are an expert OpenSCAD programmer and parametric 3D CAD designer.
Your job is to convert natural language descriptions into valid, working OpenSCAD code.

STRICT OUTPUT RULES:
- Output ONLY valid OpenSCAD code. No explanations, no markdown, no code fences.
- Never start your response with text. The very first character must be either // or a variable assignment or an OpenSCAD keyword.

PARAMETRIC DESIGN RULES:
- Define all key dimensions as variables at the top of the file.
- Each variable must have a comment describing it (units in mm unless stated).
- Minimum 4 parametric variables.
- Use descriptive snake_case variable names.

VARIABLE FORMAT (top of file):
// ── Parameters ──────────────────────────────────────────────
width = 50;        // Width in mm
height = 30;       // Height in mm
depth = 20;        // Depth in mm
wall_thickness = 2; // Wall thickness in mm

CODE QUALITY:
- Use union(), difference(), intersection() for boolean operations.
- Use translate(), rotate(), scale() for transformations.
- Keep code clean, readable, modular with named modules where appropriate.
- Use $fn = 64; for smooth curves.
- Always produce a visible 3D object.

OUTPUT: Pure OpenSCAD code only. Start immediately with code.`;

// ── Extract Parameters from SCAD code ─────────────────────────
interface ScadParameter {
  name: string;
  value: number;
  comment: string;
}

function extractParameters(scadCode: string): ScadParameter[] {
  const params: ScadParameter[] = [];
  const lines = scadCode.split("\n");
  const RESERVED = new Set(["true", "false", "undef", "PI", "e"]);

  for (const line of lines) {
    const match = line.match(
      /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\d.]+)\s*;?\s*(?:\/\/\s*(.*))?/
    );
    if (match) {
      const [, name, rawValue, comment] = match;
      if (!RESERVED.has(name)) {
        params.push({
          name,
          value: parseFloat(rawValue),
          comment: comment?.trim() || name,
        });
      }
    }
  }

  return params;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, currentScad, paramName, paramValue } = body;

    // ── Mode A: Parameter Update (no AI call needed) ────────
    if (currentScad && paramName !== undefined && paramValue !== undefined) {
      const regex = new RegExp(
        `(${paramName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=\\s*)([\\d.]+)(\\s*;)`,
        "g"
      );
      const updatedScad = currentScad.replace(
        regex,
        `$1${paramValue}$3`
      );
      return NextResponse.json({
        scadCode: updatedScad,
        parameters: extractParameters(updatedScad),
        mode: "parameter_update",
      });
    }

    // ── Mode B: AI Generation ────────────────────────────────
    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required for AI generation." },
        { status: 400 }
      );
    }

    // Try OpenRouter first (user's key), fall back to OpenAI
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openrouterKey && !openaiKey) {
      return NextResponse.json(
        { error: "No API key found. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env" },
        { status: 500 }
      );
    }

    const useOpenRouter = !!openrouterKey;
    const apiKey = useOpenRouter ? openrouterKey : openaiKey;
    const apiUrl = useOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = useOpenRouter ? "google/gemma-3-27b-it:free" : "gpt-4o-mini";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    if (useOpenRouter) {
      headers["HTTP-Referer"] = "http://localhost:3000";
      headers["X-Title"] = "EE Zone Magic CAD";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: currentScad
              ? `Here is the current OpenSCAD code:\n\`\`\`\n${currentScad}\n\`\`\`\n\nUser request: ${prompt}\n\nPlease modify the code to fulfill the user's request. Output ONLY the complete updated OpenSCAD code.`
              : prompt,
          },
        ],
        max_tokens: 4096,
        temperature: 0.15,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      let errorMsg = `API HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errorMsg += `: ${errBody?.error?.message || JSON.stringify(errBody)}`;
      } catch {
        errorMsg += `: ${await response.text()}`;
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const data = await response.json();
    let rawContent: string =
      data?.choices?.[0]?.message?.content ?? "";

    if (!rawContent.trim()) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 500 }
      );
    }

    // Strip accidental markdown code fences
    rawContent = rawContent
      .replace(/^```(?:openscad|scad|javascript|typescript)?\n?/gi, "")
      .replace(/\n?```\s*$/gi, "")
      .trim();

    const parameters = extractParameters(rawContent);

    return NextResponse.json({
      scadCode: rawContent,
      parameters,
      mode: "ai_generation",
      provider: useOpenRouter ? "OpenRouter" : "OpenAI",
      model,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[magic-cad/generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
