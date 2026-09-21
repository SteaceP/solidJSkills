---
name: solid-primitives-ecosystem
description: "Evaluate, select, and integrate @solid-primitives ecosystem packages for reactive storage, media queries, event listeners, resize observers, and timers with SSR safety."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: domain-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/primitives-ecosystem.md
  - ../../references/solidjs/reactivity-core.md
  - references/primitives-ecosystem-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-primitives-ecosystem
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-primitives-ecosystem

## Trigger

Use when selecting, configuring, or refactoring code to use community `@solid-primitives/*` packages (storage, media, event-listener, resize/intersection observers, timers, scheduled, keyed collections) with fine-grained reactivity and SSR safety.

## Required Inputs

- Target functionality or browser API to integrate (e.g. localStorage persistence, window resize, media query, debounce).
- Execution environment constraints (client-only SPA vs SSR/SolidStart).
- Component or module reactive scope (inside component lifecycle vs root/store singleton).
- Desired fallback or hydration behavior.

## Workflow

1. Match requested capability to the corresponding official `@solid-primitives` package.
2. Verify reactive scope: ensure primitive will be called within an active owner or wrap in `createRoot` if used in a standalone store.
3. Validate reactivity preservation: ensure options and target elements use reactive accessors `() => signal()` rather than static values.
4. Enforce SSR and hydration safety: guard window/document calls with `isServer` checks and provide initial fallback states.
5. Provide actionable guidance output adhering to `DomainGuidanceOutput` contract.

## Failure Modes

- Missing reactive owner: primitive cleanup cannot register; require `createRoot` or component boundary.
- Hydration mismatch risk: reading client-only storage/media query during SSR without server default values.
- Unwrapped reactive accessors: passing non-reactive references causing lost updates; wrap in getter function.
- Package non-existence: evaluate if feature should be written as core primitive (`createSignal` + `onCleanup`) rather than non-existent primitive package.

## Output Contract

Return output matching `DomainGuidanceOutput` schema at `../../skills/contracts/domain-guidance-output.schema.json` with:

- `summary`: High-level architectural decision and package recommendation.
- `decisions`: Array of specific technical decisions (package choice, SSR guard strategy, accessor bindings).
- `handoff`: Implementation steps for component builder or refactor assistant.
- `validation_commands`: List of validation and test commands.
- `citations`: Array of citation objects where each entry contains a `doc_id` from the normalized corpus and a `claim`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-primitives-ecosystem`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.lifecycle.on-cleanup` — automatic disposal and listener detachment
- `solid-core.reference.lifecycle.on-mount` — deferred client-side setup
- `solid-core.reference.rendering.is-server` — SSR environment detection and branching
- `solid-core.reference.reactive-utilities.create-root` — owner hierarchy for standalone primitives
- `solid-core.reference.basic-reactivity.create-signal` — underlying state container

## References

- `references/primitives-ecosystem-guide.md`
- `../../references/solidjs/primitives-ecosystem.md`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs-normalized/manifest.jsonl`
