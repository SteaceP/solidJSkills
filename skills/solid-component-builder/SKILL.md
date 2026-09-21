---
name: solid-component-builder
description: "Build or improve SolidJS components with deterministic reactivity decisions and citation-backed guidance. Use when implementing a component, feature slice, or reusable UI primitive in SolidJS."
outputs:
  schema: ../../skills/contracts/component-build-output.schema.json
  format: markdown-checklist-plus-structured-json
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/component-authoring-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-component-builder
  - node tools/scripts/validate-output-contracts.mjs
---

# solid-component-builder

## Trigger

Use this skill for new or modified SolidJS components (defaulting to **SolidJS 1.x Production Stable**; applying 2.0 conventions when targeting **SolidJS 2.0-rc.9**) where component contract, props preservation (`mergeProps`/`splitProps`), children memoization (`children()`), accessibility, and SSR/hydration safety must be explicit.

## Required Inputs

- Component goal and user-facing behavior.
- Framework version target (SolidJS 1.x stable default, or 2.0-rc.9 when specified in `package.json`).
- Prop interface, default values, and forwarded DOM attributes.
- Data dependencies and async boundaries.
- Rendering context (client-only SPA vs SSR/SolidStart).
- Acceptance constraints (performance, accessibility, test expectations).

## Workflow

1. Define component contract: props interface, event callbacks, and state ownership.
2. Preserve props reactivity:
   - Use `mergeProps` for defaults (`const props = mergeProps({ defaultVal: 0 }, rawProps)`).
   - Use `splitProps` to separate component-specific props from forwarded HTML attributes (`const [local, rest] = splitProps(props, [...])`).
   - Wrap repeated `props.children` access with `children(() => props.children)` to avoid re-evaluating DOM nodes.
3. Choose reactive primitives:
   - Pure derivations with `createMemo`.
   - Side effects with `createEffect`.
   - Async loading with `createResource` (1.x) or native async memo (2.0-rc.9).
4. Select control-flow primitives intentionally:
   - Conditional rendering: `<Show>`, `<Switch>/<Match>`.
   - List rendering: `<For>` for keyed objects; `<Index>` for primitive arrays in 1.x, or `<For keyed={false}>` in 2.0-rc.9.
   - Boundaries: `<Suspense>` in 1.x, or `<Loading>` and `<Errored>` in 2.0-rc.9.
5. Add SSR/hydration guards: ensure no browser-only globals run before `onMount()`.
6. Produce validation checklist and commands.

## Failure Modes

- Prop destructuring detected in component signature or body: fail until converted to `splitProps` or property access.
- Reading `props.children` multiple times without `children()` wrapper: require `children()` helper.
- Missing async loading/error fallback states: require `<Suspense>` and `<ErrorBoundary>` (1.x) or `<Loading>` and `<Errored>` (2.0).
- Mixing v1 and v2 APIs in the same component: strictly prohibited.
- Hydration mismatch risk: require server/client render parity note before completion.

## Output Contract

Return output matching `ComponentBuildOutput` schema at `../../skills/contracts/component-build-output.schema.json` with:

- `summary`, `implementation_plan`, and `component_contract`.
- `reactivity_decisions`, `acceptance_checklist`, and `validation_commands`.
- `citations`: each item must include `doc_id` and `claim` sourced from normalized references.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-component-builder`
- `node tools/scripts/validate-output-contracts.mjs`

## References

- `references/component-authoring-guide.md`
- `../../references/solidjs-normalized/manifest.jsonl`
- `../../references/solidjs-normalized/taxonomy.json`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs/component-patterns.md`
- `../../references/solidjs/performance-ssr.md`
