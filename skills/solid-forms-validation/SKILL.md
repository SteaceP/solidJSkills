---
name: solid-forms-validation
description: "Architect reactive form state, input validation with Zod/Valibot, and progressive enhancement form actions in SolidJS and SolidStart."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: domain-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/forms-validation.md
  - ../../references/solidjs/reactivity-core.md
  - references/forms-validation-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-forms-validation
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-forms-validation

## Trigger

Use when designing, building, or refactoring forms in SolidJS, including reactive field inputs, validation schemas (Zod, Valibot), submission state management, and Solid Router / SolidStart form actions.

## Required Inputs

- Form schema or field structure (fields, initial values, validation rules).
- Application runtime context (client-only SPA vs full-stack SolidStart).
- Submission target (REST API, RPC, server action, or local callback).
- UX requirements for error timing (on blur, on input, or on submit).

## Workflow

1. Determine state strategy:
   - For 1-3 fields: isolated `createSignal` accessors.
   - For multi-field or dynamic arrays: unified `createStore` with path updates.
   - For full-stack mutations: Solid Router `action` with `<form action={...}>`.
2. Configure event handling:
   - Bind `onInput={(e) => updateField(e.currentTarget.value)}` ensuring `currentTarget` is used for event delegation safety.
3. Establish validation pipeline:
   - Define schema (Zod/Valibot) and derive errors reactively via `createMemo`.
   - Track `touched` state per field to avoid premature validation errors.
4. Manage submission lifecycle:
   - For client forms: prevent default event on submit and manage `isSubmitting` signal.
   - For router actions: bind `useSubmission(action)` to surface `pending`, `error`, and `result`.
5. Render feedback with Solid control flow:
   - Wrap error messages and status alerts in `<Show when={...}>`.

## Failure Modes

- `e.target` usage instead of `e.currentTarget`: causes subtle bugs due to Solid event delegation.
- Effect-driven error syncing: syncing validation errors via `createEffect` leads to redundant cycles; use `createMemo`.
- Full page refresh on submit: client forms omitting `e.preventDefault()`.
- Unguarded submission re-trigger: failing to disable buttons during in-flight submissions.

## Output Contract

Return output matching `DomainGuidanceOutput` schema at `../../skills/contracts/domain-guidance-output.schema.json` with:

- `summary`: Architectural approach for the form and validation pipeline.
- `decisions`: Key technical choices (state primitive, validation timing, action integration).
- `handoff`: Concrete implementation checklist for component construction.
- `validation_commands`: List of validation and test commands.
- `citations`: Array of citation objects linking claims to normalized `doc_id` values.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-forms-validation`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.concepts.components.event-handlers` — event delegation and currentTarget mechanics
- `solid-core.concepts.stores` — multi-field and nested form state management
- `solid-core.reference.components.show` — conditional display of validation errors
- `solid-router.solid-router.concepts.actions` — progressive enhancement form actions
- `solid-router.solid-router.reference.data-apis.action` — action primitive and options
- `solid-router.solid-router.reference.data-apis.use-submission` — submission lifecycle tracking

## References

- `references/forms-validation-guide.md`
- `../../references/solidjs/forms-validation.md`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs-normalized/manifest.jsonl`
