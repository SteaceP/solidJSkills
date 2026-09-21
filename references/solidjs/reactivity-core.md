# SolidJS Reactivity Core

> [!NOTE]
> **Version Scope**: This reference documents **SolidJS 1.x (Production Stable)** reactivity primitives (`createResource`, `batch`).
> In **SolidJS 2.0-rc.9 (Release Candidate)**:
> - The reactive graph supports **first-class async** natively (`createMemo(async () => ...)`), superseding `createResource`.
> - Updates are **microtask auto-batched** by default; `batch()` is removed in favor of `flush()`.
> - Effects are split into **compute** (tracking) and **apply** (side-effect) phases.
> - Mutations use generator `action()` and `createOptimisticStore()`.
> See [`guides/solidjs-v2-rc-guide.md`](../../guides/solidjs-v2-rc-guide.md).

## Key primitives

| Primitive | Signature | Purpose |
| --- | --- | --- |
| `createSignal` | `createSignal(init, opts?)` → `[get, set]` | Local reactive state |
| `createMemo` | `createMemo(fn, init?, opts?)` → `get` | Cached derivation, recomputes only when deps change |
| `createEffect` | `createEffect(fn)` | Side effect that tracks deps automatically |
| `createResource` | `createResource(source, fetcher, opts?)` → `[data, {mutate, refetch}]` | Async data tied to reactive source (Solid 1.x) |
| `batch` | `batch(fn)` | Group updates into one flush (Solid 1.x) |
| `untrack` | `untrack(fn)` | Read reactive values without tracking |
| `on` | `on(deps, fn, opts?)` | Explicit dependency declaration for effects/memos |

## Decision rules

1. **Pure derivation** → `createMemo`, never `createEffect` with a setter.
2. **Side effect** (DOM mutation, logging, network) → `createEffect`.
3. **Async data** → `createResource` (1.x) or native async memo (2.0); wrap in boundaries for UX.
4. **Grouped updates** → `batch` (1.x) or automatic microtask batching with `flush()` when sync read is needed (2.0).
5. **Break tracking** → `untrack` to read without subscribing.

## Common pitfalls

- Using `createEffect` to derive state instead of `createMemo` causes unnecessary reruns.
- Forgetting `batch` in 1.x when updating several signals produces intermediate renders (auto-batched in 2.0).
- Nested effects can create ownership leaks — prefer flat reactive graphs.

## Corpus references

- `solid-core.reference.basic-reactivity.create-signal`
- `solid-core.reference.basic-reactivity.create-effect`
- `solid-core.reference.basic-reactivity.create-memo`
- `solid-core.reference.basic-reactivity.create-resource`
- `solid-core.reference.reactive-utilities.batch`
- `solid-core.reference.reactive-utilities.untrack`
- `solid-core.reference.reactive-utilities.on-util`
- `solid-v2.concepts.async-reactivity`
- `solid-v2.reference.reactive-utilities.flush`
- `solid-v2.reference.mutations.action-and-optimistic`
