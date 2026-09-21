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

Use when deciding between SolidJS control flow primitives (defaulting to **SolidJS 1.x**: `<Show>`, `<For>`, `<Index>`, `<Switch>/<Match>`, `<Portal>`, `<Dynamic>`, `<Suspense>`, `<SuspenseList>`; or **SolidJS 2.0-rc.9**: `<For keyed={false}>`, `dynamic()`, `<Loading>`, `<Errored>`, `<Reveal>`).

## Required Inputs

- Framework version target (SolidJS 1.x stable default, or 2.0-rc.9 when `"solid-js": "^2.0.0-rc"` is specified).
- Branching conditions and list data structure (objects vs primitives).
- Reordering and mutation characteristics.
- Empty states, loading boundaries, and accessibility fallback expectations.

## Workflow

1. Map collection rendering by item type and framework version:
   - **SolidJS 1.x**: Use `<For>` for object arrays with unique IDs; use `<Index>` for primitive arrays.
   - **SolidJS 2.0-rc.9**: Use `<For each={...}>` (keyed by default); use `<For each={...} keyed={false}>` for non-keyed or primitive arrays (`<Index>` is removed).
2. Replace JSX ternary conditions:
   - Use `<Show when={...} fallback={...}>` for binary conditionals.
   - Use `<Switch>` and `<Match>` for multi-case logic instead of nested ternaries.
3. Manage async boundaries:
   - **SolidJS 1.x**: Wrap asynchronous resource rendering in `<Suspense fallback={<Spinner />}>`; coordinate with `<SuspenseList>`.
   - **SolidJS 2.0-rc.9**: Wrap in `<Loading fallback={<Spinner />}>` and `<Errored fallback={...}>`; coordinate reveals with `<Reveal order="sequential"|"together">`.
4. Dynamic components:
   - **SolidJS 1.x**: `<Dynamic component={...} />`.
   - **SolidJS 2.0-rc.9**: `dynamic(...)` factory function.
5. Teleport overlays, dropdowns, and dialogs with `<Portal>` to ensure correct DOM stacking context.

## Failure Modes

- Nested ternaries used in JSX: reject as anti-pattern; enforce `<Switch>` / `<Match>`.
- Using `<Index>` in a Solid 2.0-rc codebase or `<For keyed={false}>` in Solid 1.x: fail with clear migration guidance.
- Mixing v1 and v2 control flow primitives in the same component.
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
