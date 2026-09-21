---
name: solid-control-flow-rendering
description: "Select and enforce SolidJS control-flow and rendering primitives with explicit branch semantics. Use for conditional/list rendering, suspense boundaries, and dynamic rendering choices."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: rendering-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/control-flow.md
  - references/control-flow-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-control-flow-rendering
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-control-flow-rendering

## Trigger

Use when deciding between SolidJS 1.x control flow primitives: `<Show>`, `<For>`, `<Index>`, `<Switch>/<Match>`, `<Portal>`, `<Dynamic>`, and `<Suspense>`.

## Required Inputs

- Branching conditions and list data structure (objects vs primitives).
- Reordering and mutation characteristics.
- Empty states, loading boundaries, and accessibility fallback expectations.

## Workflow

1. Map collection rendering by item type:
   - Use `<For>` for object arrays with unique IDs/identities (`(item, index) => ...`, where item is raw object, index is a signal).
   - Use `<Index>` for primitive arrays (`(item, index) => ...`, where item is a signal, index is raw number).
2. Replace JSX ternary conditions:
   - Use `<Show when={...} fallback={...}>` for binary conditionals.
   - Use `<Switch>` and `<Match>` for multi-case logic instead of nested ternaries.
3. Wrap asynchronous resource rendering in `<Suspense fallback={<Spinner />}>`.
4. Teleport overlays, dropdowns, and dialogs with `<Portal>` to ensure correct DOM stacking context.

## Failure Modes

- Nested ternaries used in JSX: reject as anti-pattern; enforce `<Switch>` / `<Match>`.
- Using `<Index>` for objects with persistent IDs or `<For>` for volatile primitive arrays without rationale.
- Async boundaries without explicit fallback UI.

## Output Contract

Return `DomainGuidanceOutput` with primitive decisions, handoff steps, and citations keyed by `doc_id`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-control-flow-rendering`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.components.show` — conditional rendering semantics
- `solid-core.reference.components.for` — keyed list rendering
- `solid-core.reference.components.index-component` — index-based list rendering
- `solid-core.reference.components.switch-and-match` — multi-branch conditional
- `solid-core.reference.components.suspense` — async boundary with fallback

## References

- `references/control-flow-guide.md`
- `../../references/solidjs/control-flow.md`
- `../../references/solidjs-normalized/docs/reference/components/show.md`
- `../../references/solidjs-normalized/docs/reference/components/for.md`
- `../../references/solidjs-normalized/docs/reference/components/switch-and-match.md`
- `../../references/solidjs-normalized/docs/reference/components/suspense.md`
