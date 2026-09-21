---
name: solid-reactivity-core-expert
description: "Apply SolidJS fine-grained reactivity primitives with strict derivation-vs-side-effect rules. Use for signal/memo/effect/resource decisions and dependency correctness."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: domain-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/reactivity-core.md
  - references/reactivity-rules-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-reactivity-core-expert
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-reactivity-core-expert

## Trigger

Use for fine-grained reactivity decisions in SolidJS 1.x: choosing between `createSignal`, `createMemo`, `createEffect`, `createResource`, `batch`, and `untrack`, and preventing reactive leaks.

## Required Inputs

- State ownership hierarchy and mutation frequency.
- Derived computations and dependency trees.
- External side-effect boundaries and async fetch operations.

## Workflow

1. Classify each reactive operation:
   - **State Source**: `createSignal()` (or `createStore()` for deep objects).
   - **Derived Value**: Pure function `() => a() + b()` for cheap math/strings; `createMemo()` for expensive calculations or referential stability.
   - **Side Effect**: `createEffect()` strictly for external sync (DOM mutation, logging, network).
   - **Async Boundary**: `createResource()` with Suspense integration.
2. Eliminate anti-patterns:
   - Refactor effect-driven signal setters (`createEffect(() => setX(y()))`) into pure derivations or memos.
   - Guard against prop destructuring (`const { val } = props` destroys reactivity; use `props.val` or `splitProps`).
   - Confirm signals inside JSX are invoked (`{count()}`).
3. Group multi-signal mutations in event handlers with `batch(() => { ... })`.
4. Produce validation checklist with normalized citations.

## Failure Modes

- Effect used to compute derived state: mark blocking anti-pattern and refactor to `createMemo`.
- Props destructuring detected: replace with `splitProps` or direct property access.
- Asynchronous untracked signal access: enforce synchronous reading before `await` points or encapsulate in `createResource`.

## Output Contract

Return `DomainGuidanceOutput` with decisions, handoff steps, validation commands, and citations containing `doc_id`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-reactivity-core-expert`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.basic-reactivity.create-signal` — signal creation and update semantics
- `solid-core.reference.basic-reactivity.create-memo` — derivation caching rules
- `solid-core.reference.basic-reactivity.create-effect` — side-effect tracking and cleanup
- `solid-core.reference.basic-reactivity.create-resource` — async reactive data loading
- `solid-core.reference.reactive-utilities.batch` — grouped signal updates

## References

- `references/reactivity-rules-guide.md`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs-normalized/manifest.jsonl`
- `../../references/solidjs-normalized/docs/reference/basic-reactivity/create-signal.md`
- `../../references/solidjs-normalized/docs/reference/basic-reactivity/create-memo.md`
- `../../references/solidjs-normalized/docs/reference/basic-reactivity/create-effect.md`
