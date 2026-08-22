# Real SPICE Simulation for EE Zone — Revised Plan (v2)

> This supersedes the draft plan titled "Replace Simulation Engine with Real ngspice (eecircuit-engine)."
> Paste this whole document into Antigravity as the build instruction. It answers every open question
> and review flag from the original draft, and changes the primary engine recommendation based on
> real measurements (below). ngspice-wasm is kept as a documented Phase 2 upgrade, not abandoned.

---

## 0. Decision — use `@spice-ts/core` as the primary engine, not `eecircuit-engine` (ngspice-wasm)

The original plan's biggest risk item was its own **[!IMPORTANT] COOP/COEP warning**: enabling
`SharedArrayBuffer` for ngspice-wasm requires `Cross-Origin-Opener-Policy: same-origin` +
`Cross-Origin-Embedder-Policy: require-corp` on the circuit-simulator route. That header pair
blocks any cross-origin resource that doesn't send back a matching CORP header — which is exactly
the failure mode for embedded iframes (your **Magic CAD / draw.io** embed), unpatched third-party
scripts, and some image/CDN loads. It's a real, measured web-platform constraint, not a hypothetical.

There's a second engine that solves the same problem — real SPICE netlist simulation, DC/AC/transient,
Newton-Raphson convergence for nonlinear devices — **without WASM, without SharedArrayBuffer, and
without any header changes**: [`@spice-ts/core`](https://github.com/mfiumara/spice-ts). Measured
comparison, both real packages pulled from the npm registry today:

| | `eecircuit-engine` (ngspice-wasm) | `@spice-ts/core` (spice-ts) |
|---|---|---|
| **What it is** | Real ngspice compiled to WASM | Pure TypeScript SPICE solver (Gilbert-Peierls sparse LU) |
| **Unpacked size** | **40.7 MB** | **1.4 MB** (29x smaller) |
| **Runtime deps** | WASM binary + JS glue, threaded | Zero deps, `node >=20` |
| **Cross-origin isolation** | **Required** (COOP+COEP on the route) | **Not required** |
| **Boot sequence** | `await sim.start()` async init, can fail | None — `simulate()` runs directly |
| **DC analysis speed** | baseline | **1.2×–5.5× faster** |
| **AC analysis speed** | baseline | **1.8×–3.1× faster** |
| **Transient speed** | baseline | parity to ~1.2× slower on large ladders |
| **Result API** | Undocumented shape — original plan flagged this as an open question requiring a throwaway validation script | **Fully typed**: `result.dc.voltage(node)`, `result.ac.magnitude(node)/phase(node)`, `result.transient.voltage(node)` returning `Float64Array` |
| **Device models** | Full ngspice (BSIM4, Gummel-Poon, etc.) | R, C, L, V, I, Diode (Shockley), BJT (Ebers-Moll NPN/PNP), MOSFET (Level 1 + BSIM3v3), VCVS/VCCS/CCVS/CCCS, `.subckt` |
| **Deployed on Vercel already** | Not confirmed | Yes — repo ships `vercel.json`, live demo at spice-ts.vercel.app |
| **Typed errors** | Not documented | `ConvergenceError`, `SingularMatrixError`, `ParseError`, `CycleError` |
| **License** | MIT | MIT |
| **Maturity** | 13★, 2 watchers, 5 forks | 20★, 1 watcher, 2 forks, CI + codecov + changesets |
| **Escape hatch** | — | `simulate(netlist, { simulator: 'ngspice-wasm' })` — literally swaps to eecircuit-engine internally, one line |

**Both are small, single/few-maintainer open-source projects** — that's the honest maturity picture
for browser-native SPICE in 2026, there isn't a large-team alternative. But spice-ts wins on every
axis that matters for *this* deployment: it's 29x lighter, it can't break your draw.io iframe, it's
faster for the two analysis modes (DC, AC) your simulator already exposes as first-class modes, and
its own SPICE-format netlist input is API-compatible with the mapping table the original plan
already designed — **none of that design work is wasted.**

The swappable backend means this isn't "spice-ts vs ngspice-wasm" as a permanent fork — it's
"spice-ts now, ngspice-wasm later if you specifically need BSIM4 or a vendor SPICE model," decided
with a config flag, not a rewrite.

---

## 1. Why this matters more than it looks — current engine audit

I read `src/lib/simulation-engine.ts` directly. Its `COMPONENT_MODELS` table only defines simulation
behavior for **8 of the 49 component types** in your component library (`src/lib/circuit-components.ts`):

**Currently simulated:** `resistor`, `capacitor`, `inductor`, `voltage_dc`, `battery`, `current_source`, `led`, `diode`

**Silently ignored today** (the `MNASolver.addComponent()` method does `console.warn` and skips them —
no error shown to the user, the component just does nothing in the simulation):
`voltage_ac`, `ground`, `transistor_npn`, `transistor_pnp`, `mosfet_n`, `mosfet_p`, `op_amp`,
`555_timer`, `zener_diode`, `transformer`, `potentiometer`, `voltage_regulator`, `comparator`, and
all digital/microcontroller/module types.

Also worth knowing: the current `diode`/`led` models are **not actually nonlinear**. They're a fixed
linear resistor stamp (`0.7V / 1mA` ⇒ constant 700Ω) regardless of operating point — there's no
Newton-Raphson iteration in `MNASolver` at all, just one-shot Gaussian elimination. So today's
"simulation" of a diode circuit is a linear approximation no matter what voltage or current you feed it.

**This means the real scope of this change isn't "improve accuracy" — it's "make transistors,
MOSFETs, op-amps, 555 timers, zener diodes, transformers, and potentiometers work in the simulator
at all, correctly, for the first time."** That's worth stating plainly wherever you pitch this
feature (Eureka!/UNESCO materials, changelog, etc.) — it's a bigger jump than a version bump.

---

## 2. Answering the original plan's open questions directly

**"AC source parameters — default to 60Hz or add a frequency field?"**
Add the field. Don't hardcode. Your `voltage_ac` component already defaults to 120V (`circuit-components.ts`),
which — together with the NEC/NFPA-70E-centric compliance tooling elsewhere in the app — signals the
platform's existing default assumption is US mains (120V/60Hz), not Indian mains (230V/50Hz). Keep
60Hz as the *default* for consistency with that existing choice, but expose `frequency` as an editable
component parameter (same pattern as your other params) so users can simulate 50Hz systems too. Don't
silently assume regional voltage/frequency — let the component carry it.

**"Result format exploration — Step 1 will experimentally determine it"**
Not needed with spice-ts — the shape is documented and stable: `result.dc`, `result.ac`, `result.transient`,
each with typed accessor methods. This removes the single biggest source of risk/rework the original
plan flagged. Validation in Step 1 (below) is now about *device-model coverage*, not *API shape*.

**"COOP/COEP header scoping — is this acceptable?"**
Moot for Phase 1 — not needed. If you adopt ngspice-wasm later (Phase 2, section 8), re-raise this
exact question then; the original plan's proposed scoping (route-specific headers on
`/tools/circuit-simulator` only, not global) is still the right call at that point.

**"Silent fallback with a toast saying 'limited accuracy' — right UX?"**
Replaced with something more honest and more actionable, see section 5 (error handling). spice-ts
throws *typed* errors (`ConvergenceError`, `SingularMatrixError`, `ParseError`), so you can tell the
user *what's actually wrong with their circuit* instead of a generic degraded-mode notice.

---

## 3. Architecture — hybrid engine router, not a global on/off switch

The original plan's "try ngspice, else fall back to the whole old engine" is a reasonable shape, but
scope it by **component category**, not as a monolithic try/catch, because most of your library was
never SPICE-simulated in the first place and doesn't belong in a SPICE netlist:

| Category (from `ComponentDefinition.category`) | Route |
|---|---|
| `power`, `passive`, `semiconductor`, `analog`, `measurement` | → **spice-ts engine** (this plan) |
| `digital` (logic gates, counters, shift registers, 7-seg) | → unchanged; these were never MNA-simulated either. If you want them simulated, that's a separate, smaller task: a boolean-logic evaluator, not a SPICE concern. Don't conflate the two in this PR. |
| `microcontroller`, `module` (Arduino/ESP32/sensors/displays) | → unchanged; this is firmware/behavioral simulation territory, and you already have `code-generator.ts` and `serial-monitor.tsx` doing something adjacent for the AI Code Assistant. Out of scope here. |

**Pre-flight validation, not silent failure:** you already have `validateCircuit()` in
`circuit-validator.ts` (checks short circuits, floating nodes, polarity, unconnected pins, missing
ground). Run it *before* calling the SPICE engine, not just as a separate manual "Validate" button.
Most `ConvergenceError`/`SingularMatrixError` cases in SPICE are caused by exactly the conditions
this validator already detects (floating nodes, missing ground reference). Catching them pre-flight
means the user gets "you have a floating node at R3" instead of an opaque numerical error.

---

## 4. Component → SPICE mapping (all 49 types, categorized, confidence-flagged)

Building on the original plan's table with your actual component IDs from `circuit-components.ts`,
and flagging what needs Step 1 validation because spice-ts's README doesn't explicitly confirm it:

| EE Zone `type` | SPICE element | Confidence | Notes |
|---|---|---|---|
| `voltage_dc`, `battery` | `V` | ✅ confirmed | `V1 n1 0 DC 12` |
| `voltage_ac` | `V` | ✅ confirmed | `V1 n1 0 AC 1 SIN(0 {amplitude} {frequency})` — add `frequency` param (§2) |
| `current_source` | `I` | ✅ confirmed | `I1 n1 n2 1` |
| `ground` | implicit node `0` | ✅ confirmed | map component's node to `"0"` in netlist |
| `resistor` | `R` | ✅ confirmed | `R1 n1 n2 1k` |
| `capacitor` | `C` | ✅ confirmed | supports ESR/ESL/leakage via `.model` if you want parasitics later |
| `inductor` | `L` | ✅ confirmed | supports DCR/core-loss via `.model` if you want parasitics later |
| `diode` | `D` + `.model D(...)` | ✅ confirmed | Shockley model |
| `led` | `D` + `.model` | ✅ confirmed | `.model LED D(IS=1e-20 N=1.8)`, same as original plan |
| `zener_diode` | `D` + `.model D(BV=...)` | ⚠️ verify in Step 1 | Standard SPICE diode model supports `BV`/`IBV`; spice-ts's README doesn't explicitly list which diode parameters are implemented. Test before relying on it — fallback is a 2-diode clamper subcircuit (D1 forward + DZ reverse, see AllAboutCircuits SPICE zener pattern) if `BV` isn't supported. |
| `transistor_npn`/`transistor_pnp` | `Q` + `.model Q(NPN/PNP)` | ✅ confirmed | Ebers-Moll |
| `mosfet_n`/`mosfet_p` | `M` + `.model M(NMOS/PMOS)` | ✅ confirmed | Level 1 or BSIM3v3 |
| `op_amp` | `E` (VCVS), high gain | ✅ confirmed | VCVS explicitly supported |
| `comparator` | `E` (VCVS), very high gain + output clamp | ✅ confirmed | same primitive as op-amp, gain ~1e6 |
| `voltage_regulator` | Behavioral: fixed-output `V` + series `R` for dropout, or `.subckt` | ⚠️ verify in Step 1 | Not a stock SPICE primitive; original plan didn't cover this type either — build as a small subcircuit |
| `555_timer` | `.subckt` | ⚠️ verify in Step 1 | Standard 555 macro model — spice-ts supports `.subckt`/`X` instantiation per README; the macro itself needs porting/testing, same as original plan intended |
| `potentiometer` | Two `R` in series with shared wiper node | ✅ confirmed | Plain resistors — will always work regardless of engine |
| `transformer` | Coupled inductors + `K` statement | ⚠️ verify in Step 1 | Standard technique is `K1 L1 L2 0.99`; spice-ts's README lists inductor parasitics support but doesn't explicitly confirm the `K` mutual-coupling statement. Fallback if unsupported: model as ideal turns-ratio via a controlled-source pair (VCVS + CCCS), which spice-ts *does* confirm. |
| `ammeter`, `voltmeter`, `probe` | Not devices — measurement points | ✅ confirmed | Map to `.print`/result-accessor calls on the relevant node/branch, not to a netlist element |
| digital logic, microcontrollers, modules (17 types) | — | out of scope | See §3 — not part of this change |

Everything marked ⚠️ gets a 20-line throwaway test in Step 1, same spirit as the original plan's
validation step, just aimed at model coverage instead of API shape (which is now known).

---

## 5. File plan

### [NEW] `src/lib/spice-netlist-generator.ts`
Converts canvas state → SPICE netlist string. Reuses `buildNetlist()` from `circuit-validator.ts`
(already does the wire→net graph traversal — don't rebuild that logic).

```typescript
import { buildNetlist } from './circuit-validator';
import type { Component, Wire } from './circuit-validator'; // adjust import path to actual types
import type { SimulationSettings } from './simulation-engine';

const SPICE_ELIGIBLE_CATEGORIES = ['power', 'passive', 'semiconductor', 'analog', 'measurement'];

export function isSpiceEligible(components: Component[]): boolean {
  return components.every(c => SPICE_ELIGIBLE_CATEGORIES.includes(getCategoryForType(c.type)));
}

export function generateSpiceNetlist(
  components: Component[],
  wires: Wire[],
  settings: SimulationSettings
): string {
  const nets = buildNetlist(components, wires);
  const nodeIdFor = buildNodeIdMap(nets); // component:terminal -> "1", "2", ... ; ground -> "0"

  const lines: string[] = ['EE Zone circuit'];

  for (const comp of components) {
    switch (comp.type) {
      case 'resistor':
        lines.push(`R${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${comp.value}`);
        break;
      case 'capacitor':
        lines.push(`C${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${comp.value}`);
        break;
      case 'inductor':
        lines.push(`L${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${comp.value}`);
        break;
      case 'voltage_dc':
      case 'battery':
        lines.push(`V${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} DC ${comp.value}`);
        break;
      case 'voltage_ac': {
        const freq = comp.params?.frequency ?? 60;
        lines.push(`V${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} AC ${comp.value} SIN(0 ${comp.value} ${freq})`);
        break;
      }
      case 'current_source':
        lines.push(`I${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${comp.value}`);
        break;
      case 'diode':
        lines.push(`D${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} DMOD${comp.id}`);
        lines.push(`.model DMOD${comp.id} D`);
        break;
      case 'led':
        lines.push(`D${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} LEDMOD${comp.id}`);
        lines.push(`.model LEDMOD${comp.id} D(IS=1e-20 N=1.8)`);
        break;
      case 'zener_diode':
        lines.push(`D${comp.id} ${nodeIdFor(comp, 1)} ${nodeIdFor(comp, 0)} ZMOD${comp.id}`); // reversed per convention
        lines.push(`.model ZMOD${comp.id} D(BV=${comp.value} IBV=1e-3)`);
        break;
      case 'transistor_npn':
        lines.push(`Q${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${nodeIdFor(comp, 2)} NPNMOD${comp.id}`);
        lines.push(`.model NPNMOD${comp.id} NPN`);
        break;
      case 'transistor_pnp':
        lines.push(`Q${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${nodeIdFor(comp, 2)} PNPMOD${comp.id}`);
        lines.push(`.model PNPMOD${comp.id} PNP`);
        break;
      case 'mosfet_n':
        lines.push(`M${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${nodeIdFor(comp, 2)} ${nodeIdFor(comp, 2)} NMOSMOD${comp.id}`);
        lines.push(`.model NMOSMOD${comp.id} NMOS`);
        break;
      case 'mosfet_p':
        lines.push(`M${comp.id} ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} ${nodeIdFor(comp, 2)} ${nodeIdFor(comp, 2)} PMOSMOD${comp.id}`);
        lines.push(`.model PMOSMOD${comp.id} PMOS`);
        break;
      case 'op_amp':
        // Ideal op-amp: high-gain VCVS between output and (V+ - V-)
        lines.push(`E${comp.id} ${nodeIdFor(comp, 2)} 0 ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 1)} 1e6`);
        break;
      case 'potentiometer': {
        const ratio = comp.params?.wiperRatio ?? 0.5;
        lines.push(`R${comp.id}a ${nodeIdFor(comp, 0)} ${nodeIdFor(comp, 2)} ${comp.value * ratio}`);
        lines.push(`R${comp.id}b ${nodeIdFor(comp, 2)} ${nodeIdFor(comp, 1)} ${comp.value * (1 - ratio)}`);
        break;
      }
      // zener/555/transformer/voltage_regulator: fill in after Step 1 validation confirms the approach
    }
  }

  lines.push(analysisCommandFor(settings));
  lines.push('.end');
  return lines.join('\n');
}

function analysisCommandFor(settings: SimulationSettings): string {
  switch (settings.mode) {
    case 'dc': return '.op';
    case 'ac': return `.ac dec ${settings.acPointsPerDecade ?? 10} ${settings.acStartFreq ?? 1} ${settings.acStopFreq ?? 1e6}`;
    case 'transient': return `.tran ${settings.transientTimeStep ?? 1e-6} ${settings.transientStopTime ?? 1e-3}`;
  }
}

export function downloadNetlist(netlist: string, filename = 'eezone-circuit.cir'): void {
  const blob = new Blob([netlist], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
```

*(This is a working skeleton — Antigravity should fill in `getCategoryForType`/`buildNodeIdMap` against
the real `Component`/`Wire` types already in the codebase, and complete `zener_diode`'s node order,
`555_timer`, `transformer`, and `voltage_regulator` after the Step 1 checks in §4 resolve.)*

### [NEW] `src/lib/spice-runner.ts`
Much simpler than the original plan's `ngspice-runner.ts` — no `initialize()`/`isAvailable` lifecycle
needed, spice-ts has no async boot step:

```typescript
import { simulate, ConvergenceError, SingularMatrixError, ParseError } from '@spice-ts/core';
import type { SimulationResult, SimulationSettings } from './simulation-engine';

export async function runSpiceSimulation(
  netlist: string,
  settings: SimulationSettings
): Promise<SimulationResult> {
  try {
    const result = await simulate(netlist);
    return mapToSimulationResult(result, settings); // adapt spice-ts's typed result to your existing SimulationResult interface
  } catch (err) {
    if (err instanceof ConvergenceError) {
      return { success: false, mode: settings.mode, timestamp: Date.now(), nodes: [], componentData: {},
        error: 'Simulation did not converge — check for a missing ground reference or an unstable feedback loop.' };
    }
    if (err instanceof SingularMatrixError) {
      return { success: false, mode: settings.mode, timestamp: Date.now(), nodes: [], componentData: {},
        error: 'Circuit has a floating node or short circuit — run Validate Circuit to locate it.' };
    }
    if (err instanceof ParseError) {
      return { success: false, mode: settings.mode, timestamp: Date.now(), nodes: [], componentData: {},
        error: 'Internal netlist generation error — this is a bug, not a circuit problem.' };
    }
    throw err; // unexpected — let the caller fall back to the legacy engine
  }
}
```

### [MODIFY] `src/app/tools/circuit-simulator/page.tsx`
Same surgical touch points the original plan identified — imports, `runEnhancedSimulation` becomes
async, "Export .cir" button, engine indicator — but the run path is:

```typescript
async function runEnhancedSimulation() {
  const validationErrors = validateCircuit(components, wires);
  const blockingErrors = validationErrors.filter(e => e.severity === 'error');
  if (blockingErrors.length > 0) {
    // surface these directly — don't even attempt spice-ts, same pre-flight logic as §3
    setSimulationErrors(blockingErrors);
    return;
  }

  if (isSpiceEligible(components)) {
    const netlist = generateSpiceNetlist(components, wires, simulationSettings);
    const result = await runSpiceSimulation(netlist, simulationSettings);
    if (result.success) { setSimulationResult(result); setEngineUsed('spice-ts'); return; }
    // typed error already has a specific message — show it, THEN offer legacy fallback as a choice, not silent
  }

  // legacy MNA engine — used for out-of-scope categories or as an explicit fallback after a spice-ts error
  const legacyResult = runSimulation(simComponents, nodes, simulationSettings);
  setSimulationResult(legacyResult); setEngineUsed('legacy-mna');
}
```

Engine indicator (line ~1745 area, Circuit Status card): show `spice-ts (SPICE)` vs
`Legacy (linearized)` — call the old engine what it actually is now that you know its diode/LED
models are fixed-resistor approximations, not "limited accuracy," so the label is honest.

### [KEEP — NO CHANGES] `src/lib/simulation-engine.ts`
Kept as last-resort fallback, same as original plan.

### [KEEP — NO CHANGES] `src/lib/circuit-validator.ts`
No changes — reused as-is for both `buildNetlist()` and the new pre-flight `validateCircuit()` call.

### [NOT NEEDED] `next.config.ts` COOP/COEP headers
Skip this entirely for Phase 1 — this is the concrete win from switching engines.

---

## 6. Install

```bash
npm install @spice-ts/core --legacy-peer-deps
```

No `eecircuit-engine` install needed for Phase 1.

---

## 7. Verification plan

### Step 1 — Model coverage validation (replaces the original's "API shape" validation)
Throwaway script, `src/lib/spice-validation-test.ts`, delete after:
1. Basic RLC `.op` — confirm `result.dc.voltage()` works as documented
2. Zener diode with `BV` param — confirm reverse breakdown behavior appears in results
3. Two coupled inductors with a `K` statement — confirm it parses; if not, note the controlled-source fallback
4. `.subckt` with a nested `X` instantiation — confirm before porting the full 555 macro
5. BJT common-emitter `.op` — confirm bias point matches hand-calculated expectation

### Step 2 — Build the mapping + runner + UI wiring per §5

### Manual verification (same circuits as the original plan)
1. `/tools/circuit-simulator` — resistor + DC source + ground → confirm 12V/1kΩ → 12mA
2. Transient RC step response → confirm waveform in oscilloscope
3. NPN common-emitter amp → confirm nonzero, sensible collector current (this is the concrete
   "new capability that didn't exist before" test — old engine had no `transistor_npn` model at all)
4. Deliberately float a node → confirm the pre-flight validator catches it before spice-ts runs,
   with a specific error message, not a generic failure
5. Export `.cir` → confirm valid file downloads
6. Confirm zero COOP/COEP-related console warnings, and confirm the Magic CAD `/magic-cad` iframe
   still loads normally in the same session (this is the regression test the original plan couldn't
   have written, since it would have introduced the risk)

---

## 8. Phase 2 (optional, later) — upgrading to ngspice-wasm

If you later need a device model spice-ts doesn't have (BSIM4, vendor-supplied SPICE models, a
transmission-line element), the swap is one config value:

```typescript
const result = await simulate(netlist, { simulator: 'ngspice-wasm' });
```

This pulls in `eecircuit-engine` internally. *At that point*, revisit the original plan's COOP/COEP
section — its proposed scoping (`/tools/circuit-simulator` only) is still the right approach, and its
fallback-toast UX question is worth re-asking then, since at that point you *would* have a real
"WASM failed to load" failure mode that spice-ts alone doesn't have.

---

## 9. Summary of what changed vs. the original draft

| Original draft | This revision |
|---|---|
| Primary engine: eecircuit-engine (ngspice-wasm) | Primary: `@spice-ts/core`; ngspice-wasm demoted to optional Phase 2 |
| Requires COOP/COEP headers | Not required |
| 40.7 MB payload | 1.4 MB payload |
| Result shape unknown, needs experimental validation | Documented, typed API |
| Generic "fallback engine" toast on failure | Typed errors → specific, actionable messages; pre-flight validation via existing `circuit-validator.ts` |
| Fallback = whole-engine switch | Hybrid router by component category; digital/MCU/module types explicitly out of scope, not silently mishandled |
| Mapping table: components the original plan happened to think of | Full audit against all 49 actual component types in `circuit-components.ts`, cross-checked against what the *current* engine does and doesn't simulate |
