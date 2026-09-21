---
name: solid-animation-transitions
description: "Implement enter/exit animations, list transitions with solid-transition-group, and concurrent UI transitions with useTransition."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: domain-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/animation-transitions.md
  - ../../references/solidjs/reactivity-core.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-animation-transitions
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-animation-transitions

## Trigger

Use when implementing or debugging UI animations in SolidJS, including single element enter/exit animations, animated list reordering, route page transitions, and non-blocking state transitions with `useTransition`.

## Required Inputs

- Animation type (single element enter/exit, list item addition/removal, route transition, or gesture physics).
- Animation engine (CSS transitions, Web Animations API, or `@motionone/solid`).
- Trigger mechanism (reactive boolean signal, `<Show>`, `<For>` list changes, or route path change).
- Layout constraints (flex, grid, or absolute positioning).

## Workflow

1. Select animation primitive:
   - For single toggles (`<Show>` or dynamic conditions): `<Transition>` from `solid-transition-group`.
   - For collection updates (`<For>` lists): `<TransitionGroup>` from `solid-transition-group`.
   - For deferred async transitions: `useTransition` / `startTransition`.
   - For gesture or spring physics: `@motionone/solid`.
2. Configure animation lifecycle:
   - For CSS: define `.name-enter`, `.name-enter-active`, `.name-enter-to`, `.name-exit`, `.name-exit-active`, and `.name-exit-to`.
   - For JS: bind `onEnter={(el, done) => ...}` and `onExit={(el, done) => ...}` ensuring `done()` is invoked upon completion.
3. Coordinate route-level transitions:
   - Wrap router outlets in `<Transition>` to coordinate page unmount and mount animations without breaking layout flow.
4. Ensure fine-grained reactivity safety:
   - Ensure animation triggers use reactive accessors rather than stale values.

## Failure Modes

- Abrupt element removal: omitting `<Transition>` on conditional nodes destroys DOM before CSS exit animations can execute.
- Ghost DOM elements: omitting the `done()` callback in JS-driven `onExit` hooks prevents element removal.
- `<Transition>` on collections: using `<Transition>` instead of `<TransitionGroup>` on lists causes broken key tracking and layout collapse.
- Unnecessary re-renders: creating animation configurations inside tracking scopes rather than using static configurations.

## Output Contract

Return output matching `DomainGuidanceOutput` schema at `../../skills/contracts/domain-guidance-output.schema.json` with:

- `summary`: Architectural strategy for the animation or transition system.
- `decisions`: Key technical choices (CSS vs JS animation, transition primitive, router integration).
- `handoff`: Concrete implementation checklist for component styling and markup.
- `validation_commands`: List of validation and test commands.
- `citations`: Array of citation objects linking claims to normalized `doc_id` values.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-animation-transitions`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.reactive-utilities.use-transition` — concurrent transition hook for non-blocking updates
- `solid-core.reference.reactive-utilities.start-transition` — deferred reactive state setter execution
- `solid-core.reference.components.show` — conditional control flow for element entry and exit
- `solid-core.reference.components.for` — list rendering control flow for item animations
- `solid-core.concepts.control-flow.portal` — overlay and modal positioning for animated popups

## References

- `../../references/solidjs/animation-transitions.md`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs-normalized/manifest.jsonl`
