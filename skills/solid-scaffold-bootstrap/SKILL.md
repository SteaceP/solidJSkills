---
name: solid-scaffold-bootstrap
description: "Scaffold SolidJS projects or feature modules with deterministic production defaults and extension points. Use when creating new app layouts, modules, or foundational project structure."
outputs:
  schema: ../../skills/contracts/scaffold-output.schema.json
  format: layout-plan-checklist-and-command-sequence
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/scaffolding-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-scaffold-bootstrap
  - node tools/scripts/validate-output-contracts.mjs
---

# solid-scaffold-bootstrap

## Trigger

Use this skill when starting a SolidJS project or module: initializing Vite / SolidStart projects, configuring `tsconfig.json` (`jsxImportSource: "solid-js"`), establishing folder structures, and configuring baseline quality gates.

## Required Inputs

- Project archetype (Client SPA with Vite vs Full-stack SSR with SolidStart 1.0 vs Component library).
- Package manager (`npm`, `pnpm`, `bun`).
- Styling solution (Vanilla CSS, CSS Modules, Tailwind).
- Quality baseline (Vitest, ESLint, TypeScript).

## Workflow

1. Scaffold project structure using official templates:
   - Client SPA: `npm create vite@latest app -- --template solid-ts`.
   - Full-stack: `npm create solid@latest app`.
2. Configure TypeScript:
   - Ensure `"jsx": "preserve"` and `"jsxImportSource": "solid-js"` in `tsconfig.json`.
3. Establish folder architecture: `src/components`, `src/context`, `src/lib`, `src/routes`, `src/directives`.
4. Add automated test harness with Vitest and `@solidjs/testing-library`.
5. Attach validation commands and post-bootstrap acceptance checks.

## Failure Modes

- Missing project type: pause and request one concrete target shape.
- Missing `jsxImportSource: "solid-js"`: leads to React JSX conflicts; enforce in `tsconfig.json`.
- Over-scaffold risk: remove optional layers and keep deterministic minimum.
- SSR target without hydration guardrails: add SSR-specific checks before finalizing.

## Output Contract

Return output matching `ScaffoldOutput` schema at `../../skills/contracts/scaffold-output.schema.json` with:

- `summary`, `project_layout`, `baseline_conventions`, `bootstrap_steps`.
- `acceptance_checklist`, `validation_commands`.
- `citations`: include normalized `doc_id` references for major scaffolding decisions.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-scaffold-bootstrap`
- `node tools/scripts/validate-output-contracts.mjs`

## References

- `references/scaffolding-guide.md`
- `../../references/solidjs-normalized/manifest.jsonl`
- `../../references/solidjs-normalized/taxonomy.json`
- `../../references/solidjs/component-patterns.md`
- `../../references/solidjs/async-data.md`
- `../../references/solidjs/performance-ssr.md`
