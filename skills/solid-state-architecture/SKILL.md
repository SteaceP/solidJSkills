---
name: solid-state-architecture
description: "Define SolidJS state ownership across signals, stores, and context with explicit coupling boundaries. Use for shared-state and context architecture decisions."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: state-architecture-guidance
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/stores-context.md
  - references/stores-context-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-state-architecture
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-state-architecture

## Trigger

Use when designing SolidJS state ownership: choosing between local signals, fine-grained nested stores (`createStore`), mutation patterns (`produce`, `reconcile`), and Context API boundaries.

## Required Inputs

- State shape, nesting depth, and collection sizes.
- Update pathways (local UI toggle vs shared cross-tree cache).
- Consumer components and provider tree boundaries.

## Workflow

1. Assign state scope:
   - Use `createSignal` for local primitives, flags, counters, and single form inputs.
   - Use `createStore` for deep objects, models, and array collections requiring fine-grained property updates.
   - Use `createContext` + Custom Hook (`useDomain()`) for cross-tree shared state.
2. Select store mutation strategy:
   - Use path-based updates for targeted field mutations: `setState("path", "to", "key", val)`.
   - Use `produce` for complex array alterations.
   - Use `reconcile` when updating stores from external API responses to minimize DOM churn.
3. Validate context ergonomics: enforce custom hooks that throw if consumed outside their provider.

## Failure Modes

- Using Context for ephemeral local state: mark anti-pattern; recommend local signal.
- In-place store mutation without `setState` or `produce`: reject as non-reactive.
- Shared context without explicit consumer boundary or error handling.

## Output Contract

Return `DomainGuidanceOutput` with scope decisions, handoff actions, and citations with `doc_id`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-state-architecture`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.store-utilities.create-store` — nested reactive state
- `solid-core.reference.store-utilities.produce` — immer-style store mutation
- `solid-core.reference.store-utilities.reconcile` — diffed store replacement
- `solid-core.reference.component-apis.create-context` — context creation
- `solid-core.concepts.stores` — store concepts and patterns

## References

- `references/stores-context-guide.md`
- `../../references/solidjs/stores-context.md`
- `../../references/solidjs-normalized/docs/concepts/stores.md`
- `../../references/solidjs-normalized/docs/reference/store-utilities/create-store.md`
- `../../references/solidjs-normalized/docs/reference/component-apis/create-context.md`
