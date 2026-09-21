---
name: solid-router-data-navigation
description: "Apply Solid Router routing, navigation, and data APIs with deterministic loading/error and revalidation behavior. Use for route layout, params, query/action, and navigation flows."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: router-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/router-data-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-router-data-navigation
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-router-data-navigation

## Trigger

Use for Solid Router requests in SolidJS 1.x / SolidStart: route tree definition, nested layouts, params, query data fetching (`query`, `createAsync`), actions (`action`, `useSubmission`), and cache revalidation (`revalidate`).

## Required Inputs

- Route layout hierarchy and nesting structure.
- URL parameters (`params`) and search parameters (`searchParams`).
- Data loading queries and cache keys.
- Mutation requirements, form actions, and revalidation targets.

## Workflow

1. Configure route tree using `<Router root={Layout}>` and nested `<Route path="..." component={...} />`.
2. Implement data fetching using modern Solid Router primitives:
   - Define cacheable query functions with `query(fn, cacheKey)`.
   - Read queries inside components with `createAsync(() => queryFn(params.id))`.
   - Wrap route view with `<Suspense fallback={<Loading />}>`.
3. Implement mutations using `action(fn)` and track submissions with `useSubmission(actionFn)`.
4. Trigger cache revalidation on successful mutations via `revalidate(cacheKey)` to keep UI fresh without hard reloads.

## Failure Modes

- Route parameter ambiguity: require explicit path patterns (e.g. `users/:id`).
- Unkeyed data mutations: mutations executing without calling `revalidate(key)` leave client state stale.
- Unwrapped async routes: missing `<Suspense>` boundary around `createAsync()` calls causes layout freezing.

## Output Contract

Return `DomainGuidanceOutput` with router API decisions, handoff steps, and citations referencing normalized `doc_id` values.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-router-data-navigation`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-router.solid-router.reference.data-apis.query` — data loading with caching
- `solid-router.solid-router.reference.data-apis.action` — server mutations
- `solid-router.solid-router.reference.data-apis.revalidate` — cache invalidation
- `solid-router.solid-router.reference.primitives.use-navigate` — programmatic navigation
- `solid-router.solid-router.reference.primitives.use-params` — route parameter access

## References

- `references/router-data-guide.md`
- `../../references/solidjs-normalized/docs/solid-router/reference/components/router.md`
- `../../references/solidjs-normalized/docs/solid-router/reference/primitives/use-navigate.md`
- `../../references/solidjs-normalized/docs/solid-router/reference/data-apis/query.md`
- `../../references/solidjs-normalized/docs/solid-router/reference/data-apis/action.md`
- `../../references/solidjs-normalized/manifest.jsonl`
