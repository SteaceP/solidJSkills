---
name: solid-ssr-hydration-debugger
description: "Diagnose and prevent SolidJS SSR/hydration mismatches with deterministic reproduction and remediation steps. Use for server-client render inconsistencies, hydration errors, and browser-only boundary issues."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: ssr-hydration-debug-report
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/performance-ssr.md
  - references/hydration-debugging-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-ssr-hydration-debugger
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-ssr-hydration-debugger

## Trigger

Use when SSR HTML and client hydration diverge, hydration markers (`<!--#-->`) misalign, or browser-only APIs leak into server render paths. Targets SolidJS 1.x production applications.

## Required Inputs

- Reproduction steps and environment mode (`DEV` vs production).
- Affected route, component boundaries, and DOM hierarchy.
- Error logs, observed mismatch markers, or server stack traces.

## Workflow

1. Build deterministic reproduction path: run in `DEV` mode to enable verbose hydration warnings.
2. Isolate the specific mismatch class:
   - **Non-deterministic values**: `Math.random()`, `Date.now()`, or timezone differences.
   - **ID sequence drift**: `createUniqueId()` called conditionally or out of order.
   - **Direct JSX branching with `isServer`**: DOM element tag or structure differences.
   - **Browser-only APIs**: `window`, `document`, `localStorage` accessed in initial render instead of `onMount()`.
   - **HTML parser correction**: invalid tag hierarchies (e.g. nested `<p>` tags) rearranged by browser before hydration.
3. Apply targeted remediation:
   - Wrap non-reactive server-rendered subtrees with `<NoHydration>`.
   - Wrap interactive client-only islands with `clientOnly()` from `@solidjs/start`.
   - Move browser global access and client-only state into `onMount()`.
4. Provide verification checklist and `@solidjs/testing-library` hydration test recipe (`render(App, { hydrate: true })`).

## Failure Modes

- Non-reproducible issue report: request exact steps and route context.
- Fix without root-cause classification: mark invalid output.
- Browser API in server path unresolved: fail until guarded by `onMount` or `isServer`.
- Direct `isServer ? <A /> : <B />` markup used instead of `<NoHydration>` or `clientOnly`: reject as anti-pattern.

## Output Contract

Return `DomainGuidanceOutput` with root-cause decisions, remediation handoff, and citations referencing normalized `doc_id` values.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-ssr-hydration-debugger`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.rendering.hydrate` — client hydration attachment
- `solid-core.reference.rendering.is-server` — SSR guard constant
- `solid-core.reference.rendering.render-to-stream` — streaming SSR with Suspense
- `solid-core.reference.rendering.hydration-script` — hydration bootstrapper
- `solid-core.reference.components.no-hydration` — non-hydrating server subtree boundary
- `solid-router.solid-router.rendering-modes.ssr` — router SSR rendering mode

## References

- `references/hydration-debugging-guide.md`
- `../../references/solidjs/performance-ssr.md`
- `../../references/solidjs-normalized/docs/reference/rendering/hydrate.md`
- `../../references/solidjs-normalized/docs/reference/rendering/is-server.md`
- `../../references/solidjs-normalized/docs/reference/components/no-hydration.md`
- `../../references/solidjs-normalized/docs/solid-router/rendering-modes/ssr.md`
