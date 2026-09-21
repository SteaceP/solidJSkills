# SolidJS Review Checklist

## Reactivity

- [ ] Primitives chosen intentionally (`createSignal` vs `createMemo` vs `createEffect`).
- [ ] No `createEffect` used as a derivation when `createMemo` would suffice.
- [ ] `batch` used when multiple signals are updated together.
- [ ] `untrack` applied where reactive reads should not create subscriptions.
- [ ] No props destructuring that would break reactivity.

## Control flow

- [ ] `<Show>`, `<For>`, `<Switch>/<Match>` used over ternaries and `.map()`.
- [ ] `<For>` for keyed objects, `<Index>` for primitive arrays.
- [ ] All `fallback` props provided on conditional/list components.

## Version-Specific Invariants

### SolidJS 1.x (Production Stable - Default)
- [ ] Primitive arrays use `<Index>`; object arrays use `<For>`.
- [ ] Async fetching uses `createResource` wrapped in `<Suspense fallback={...}>`.
- [ ] Multiple signal writes grouped in `batch(() => { ... })` where needed.
- [ ] Polymorphic components rendered with `<Dynamic component={...} />`.
- [ ] Multi-boundary coordination uses `<SuspenseList>`.

### SolidJS 2.0-rc.9 (Release Candidate)
- [ ] Non-keyed lists use `<For keyed={false}>` (`<Index>` is removed).
- [ ] Async derivations use native async graph (`createMemo(async () => ...)`); `createResource` is not used.
- [ ] Async boundaries use `<Loading fallback={...}>` and `<Errored fallback={...}>` (`<Suspense>` is removed).
- [ ] Polymorphic elements use `dynamic()` function (`<Dynamic>` is deprecated).
- [ ] Multi-boundary coordination uses `<Reveal order="sequential"|"together">` (`<SuspenseList>` is removed).
- [ ] Microtask auto-batching used; no `batch()` calls; `flush()` used only if synchronous reading is needed.
- [ ] Strictly verify that v1 and v2 APIs are NOT mixed in the same component.

## Async and data

- [ ] Async regions handle all four states: loading, success, empty, error.
- [ ] Optimistic updates use `mutate`/`refetch` (1.x) or `action()` / `createOptimisticStore()` (2.0).

## Component design

- [ ] Props interface typed and documented.
- [ ] State ownership clearly defined (local, lifted, or context).
- [ ] `splitProps`/`mergeProps` used instead of spreading or destructuring.
- [ ] Components are focused — no mega-components with unrelated concerns.

## Accessibility

- [ ] Semantic HTML elements used (`button`, `nav`, `main`, etc.).
- [ ] Interactive elements reachable via keyboard.
- [ ] ARIA attributes used where native semantics are insufficient.
- [ ] Dynamic content changes announced to screen readers.

## SSR/hydration

- [ ] Server and client initial renders produce identical output.
- [ ] Browser-only APIs guarded by `isServer` or `onMount`.
- [ ] `<HydrationScript>` included when using streaming SSR.
- [ ] Tested with `DEV` mode to catch hydration mismatch warnings.

## Validation commands

```bash
node tools/scripts/validate-skills.mjs
node tools/scripts/validate-solid-corpus.mjs
node tools/scripts/validate-output-contracts.mjs
```
