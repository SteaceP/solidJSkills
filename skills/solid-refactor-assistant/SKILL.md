---
name: solid-refactor-assistant
description: "Plan and execute SolidJS refactors with explicit invariants, rollback-safe sequencing, and citation-backed verification. Use when changing boundaries, state shape, rendering flow, or public props interfaces."
outputs:
  schema: ../../skills/contracts/refactor-plan-output.schema.json
  format: ordered-refactor-plan-plus-regression-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/migration-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-refactor-assistant
  - node tools/scripts/validate-output-contracts.mjs
---

# solid-refactor-assistant

## Trigger

Use this skill when existing code needs refactoring: converting React hooks to Solid fine-grained signals, upgrading SolidJS 1.x to 2.0-rc.9, or restructuring component reactivity boundaries with low regression risk.

## Required Inputs

- Source framework or version (React vs SolidJS 1.x vs SolidJS 2.0-rc.9).
- Current behavior and invariants to preserve.
- Public interfaces that cannot break (props/events/routes/contracts).
- Validation surface: tests, manual scenarios, and performance constraints.

## Workflow

1. Identify target transformation path:
   - **React to Solid 1.x**: Replace `useState` with `createSignal()`, remove dependency arrays, convert `useMemo` to `createMemo`, eliminate `useCallback`, and wrap lists in `<For>`.
   - **Solid 1.x to 2.0-rc.9**: Replace `<Index>` with `<For keyed={false}>`, convert `<Suspense>` to `<Loading>` / `<Errored>`, replace `<Dynamic>` with `dynamic()`.
2. Capture baseline invariants as pass/fail statements.
3. Break refactor into rollback-safe increments; each step must be independently verifiable.
4. Preserve reactivity semantics: avoid effect-driven derivations and accidental dependency widening.
5. Provide regression checklist and validation commands.

## Failure Modes

- Invariants undefined: fail early and request explicit invariant list.
- Mixing React mental model (e.g. adding dependency arrays or destructuring props in Solid).
- Conflating Solid 1.x and 2.0 syntax in the same refactor step.
- Missing rollback path: output is invalid until rollback instructions exist.

## Output Contract

Return output matching `RefactorPlanOutput` schema at `../../skills/contracts/refactor-plan-output.schema.json` with:

- `summary`, `invariants`, `stepwise_plan`, `risk_controls`, and `rollback_strategy`.
- `verification_checklist`, `validation_commands`.
- `citations`: each claim must cite normalized `doc_id` entries.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-refactor-assistant`
- `node tools/scripts/validate-output-contracts.mjs`

## References

- `references/migration-guide.md`
- `../../references/solidjs-normalized/manifest.jsonl`
- `../../references/solidjs-normalized/taxonomy.json`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs/performance-ssr.md`
- `../../references/solidjs/async-data.md`
