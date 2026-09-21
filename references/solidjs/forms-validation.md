# SolidJS Forms and Validation

## Key patterns and primitives

| Approach | Primitives / Tools | Best Use Case |
| --- | --- | --- |
| **Native `<form>` + Router Action** | `action()`, `useSubmission()`, `<form action={...}>` | Full-stack SolidStart mutations, progressive enhancement, auto-revalidation |
| **Controlled Signals** | `createSignal()`, `onInput={(e) => setVal(e.currentTarget.value)}` | Simple 1-3 field forms, isolated inputs, search bars |
| **Form Store** | `createStore({ fields: {}, errors: {}, touched: {} })` | Multi-field forms, dynamic form arrays, nested data structures |
| **Schema Validation** | Zod, Valibot, Standard Schema | Type-safe schema validation, shared client/server validation rules |
| **Ecosystem Libraries** | Modular Forms (`@modular-forms/solid`), Felte | Complex enterprise forms, multi-step wizards, deep nested field arrays |

## Decision rules

1. **Full-stack & Progressive Enhancement**: In SolidStart or Solid Router apps, use `action` and `useSubmission`. This allows forms to work before/without JavaScript and automatically invalidates route data loaders.
2. **Structured Action Results vs Throwing**: Return structured objects (e.g. `{ success: false, errors: { field: "..." } }`) from actions rather than throwing errors. `submission.error` is intended for uncaught exceptions, whereas `submission.result` holds type-safe, reactive validation feedback.
3. **Single vs Multiple Submissions**: Use `useSubmission(action)` for standard single forms. Use `useSubmissions(action)` when tracking multiple simultaneous submissions (e.g. inline table row edits, multi-file uploads).
4. **Event binding (`e.currentTarget`)**: Always read `e.currentTarget.value` in event handlers rather than `e.target.value` because Solid delegates events to the document root.
5. **Derived Validation Errors**: Prefer deriving errors reactively with `createMemo` over syncing error state via `createEffect`.
6. **Validation timing**: Only display validation errors for fields that are `touched` or after the initial form submit attempt to prevent poor user experience.
7. **Reactivity preservation**: When using `createStore`, pass path setters (e.g. `setForm("fields", "email", value)`) rather than cloning the whole object.

## Common pitfalls

- Throwing validation errors in actions: Causes error boundaries or uncaught exceptions rather than clean in-form feedback; return structured objects via `submission.result`.
- Using `e.target` instead of `e.currentTarget`: Event delegation in Solid means `e.target` can refer to an internal child element, not the input itself.
- Forgetting `e.preventDefault()`: Submitting a client-only form without calling `e.preventDefault()` causes a full page reload.
- Desynchronized validation effects: Setting error signals inside effects when validating on input can trigger extra recomputations or infinite loops; derive with `createMemo` instead.
- Ignoring submission pending state: Failing to disable submit buttons or show pending indicators while async actions are in flight (`submission.pending`).

## Corpus references

- `solid-core.concepts.components.event-handlers`
- `solid-core.concepts.stores`
- `solid-core.reference.components.show`
- `solid-router.solid-router.concepts.actions`
- `solid-router.solid-router.reference.data-apis.action`
- `solid-router.solid-router.reference.data-apis.use-submission`
- `solid-router.solid-router.reference.data-apis.use-submissions`
