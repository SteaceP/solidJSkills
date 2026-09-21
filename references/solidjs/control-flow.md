# SolidJS Control Flow

> [!NOTE]
> **Version Scope**: This reference documents **SolidJS 1.x (Production Stable)** control flow primitives (`<Index>`, `<Dynamic>`).
> In **SolidJS 2.0-rc.9 (Release Candidate)**:
> - `<Index>` is removed &rarr; use `<For keyed={false}>`.
> - `<Dynamic>` JSX component is replaced &rarr; use functional `dynamic()`.
> - `<Suspense>` is decomposed &rarr; use `<Loading>` and `<Errored>`.
> - `<SuspenseList>` is replaced &rarr; use `<Reveal order="sequential"|"together">`.
> See [`guides/solidjs-v2-rc-guide.md`](../../guides/solidjs-v2-rc-guide.md) and corpus doc `solid-v2.concepts.control-flow`.

## Primitive decision table

| Primitive | Use when | Key behavior |
| --- | --- | --- |
| `<Show when={} fallback={}>` | Single boolean condition | Mounts/unmounts children; avoids falsy-path rendering |
| `<For each={} fallback={}>` | List with stable identity per item | Keyed by reference — updates items in place |
| `<Index each={} fallback={}>` | List keyed by index position | Recreates items when position changes; better for primitives |
| `<Switch>/<Match>` | Multi-branch conditions | First matching `<Match>` renders; replaces deep ternary nests |
| `<Suspense fallback={}>` | Async child content | Shows fallback while `createResource` resolves |
| `<ErrorBoundary fallback={}>` | Error containment | Catches thrown errors in child tree |
| `<Portal mount={}>` | Render outside DOM parent | Modals, tooltips, overlays |
| `<Dynamic component={}>` | Polymorphic rendering | Swaps rendered component by signal value |

## Decision rules

1. **Single condition** → `<Show>`. Never use `{cond && <X/>}` (evaluates both branches).
2. **List of objects** → `<For>`. Use `<Index>` only for primitive arrays.
3. **2+ exclusive branches** → `<Switch>/<Match>` over nested `<Show>`.
4. **Async data boundary** → wrap in `<Suspense>` with a meaningful fallback.
5. **Error boundary** → place `<ErrorBoundary>` around each async region.

## Common pitfalls

- Using ternaries instead of `<Show>` loses fine-grained reactivity.
- `<For>` with primitive arrays causes full list re-render — use `<Index>`.
- Missing `fallback` on `<Suspense>` leaves a blank flash during loading.

## Corpus references

- `solid-core.reference.components.show`
- `solid-core.reference.components.for`
- `solid-core.reference.components.index-component`
- `solid-core.reference.components.switch-and-match`
- `solid-core.reference.components.suspense`
- `solid-core.reference.components.error-boundary`
- `solid-core.reference.components.portal`
- `solid-core.reference.components.dynamic`
