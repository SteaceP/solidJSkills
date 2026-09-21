---
name: solid-testing-quality-gates
description: "Define and enforce SolidJS testing and quality gates with deterministic pass/fail criteria. Use when specifying validation strategy for components, routing, SSR, and regressions."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: test-gate-plan
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/review-checklist.md
  - references/testing-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-testing-quality-gates
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-testing-quality-gates

## Trigger

Use when defining validation strategy, test suites (Vitest, `@solidjs/testing-library`), and CI quality gates for SolidJS applications (reactivity scopes with `createRoot`, component DOM assertions, routing transitions, and SSR hydration checks).

## Required Inputs

- Change scope (reactivity primitives, component UI, routing, SSR/hydration, or full-stack API).
- Testing framework (Vitest, Jest) and test environment (jsdom, happy-dom, node).
- Regression thresholds and acceptance criteria.

## Workflow

1. Select test architecture:
   - For isolated signals/memos/effects: wrap assertions inside `createRoot((dispose) => { ... dispose(); })`.
   - For UI components: use `render()` from `@solidjs/testing-library` with `screen` and `fireEvent`.
   - For SSR hydration testing: call `render(() => <App />, { hydrate: true })`.
2. Define minimum automated test scripts (`npm test`, `npm run test:coverage`).
3. Enforce accessibility and semantic testing with `getByRole` selectors.
4. Establish CI gates: fail builds on lint errors, unhandled promise rejections, or hydration warnings.

## Failure Modes

- Testing reactivity outside `createRoot`: causes memory leaks or missed subscriptions.
- Async test without awaiting reactive transitions or Suspense boundaries.
- Missing explicit pass/fail command assertions.

## Output Contract

Return `DomainGuidanceOutput` with quality-gate decisions, handoff actions, validation commands, and `citations` with `doc_id`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-testing-quality-gates`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.guides.testing` — SolidJS testing patterns and setup
- `solid-core.reference.rendering.render-to-string` — SSR output for test assertions
- `solid-router.solid-router.data-fetching.how-to.handle-error-and-loading-states` — error state testing
- `solid-core.reference.rendering.render` — client render for component tests
- `solid-core.reference.rendering.dev` — DEV mode for catching hydration warnings

## References

- `references/testing-guide.md`
- `../../references/solidjs/review-checklist.md`
- `../../references/solidjs-normalized/docs/guides/testing.md`
- `../../references/solidjs-normalized/docs/solid-router/data-fetching/how-to/handle-error-and-loading-states.md`
- `../../references/solidjs-normalized/docs/reference/rendering/render-to-string.md`
- `../../references/solidjs-normalized/manifest.jsonl`
