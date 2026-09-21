# Performance and SSR/Hydration

> [!NOTE]
> **Version Scope**: This reference documents **SolidJS 1.x (Production Stable)** performance and SSR patterns (`batch`, `<Index>`, `<Suspense>`).
> In **SolidJS 2.0-rc.9 (Release Candidate)**:
> - Auto-batching on microtasks replaces manual `batch()` calls.
> - `<For keyed={false}>` replaces `<Index>`.
> - `<Loading>` and `<Errored>` replace `<Suspense>`.
> - `<Reveal>` coordinates loading boundaries instead of `<SuspenseList>`.
> - SSR is powered by standard Vite plugin start mode.
> See [`guides/solidjs-v2-rc-guide.md`](../../guides/solidjs-v2-rc-guide.md).

## Performance checklist

- [ ] No `createEffect` used where `createMemo` suffices.
- [ ] Multi-signal updates batched (`batch` in 1.x; automatic on microtasks in 2.0).
- [ ] `<For>` used for keyed object lists; `<Index>` (1.x) or `<For keyed={false}>` (2.0) for primitive lists.
- [ ] `lazy()` applied at route/feature boundaries for code splitting.
- [ ] Large lists use virtual scrolling or pagination, not unbounded `<For>`.
- [ ] `untrack` used where reads are intentionally non-reactive.

## SSR/hydration checklist

- [ ] Initial render output is identical on server and client.
- [ ] Browser-only APIs (`window`, `document`, `localStorage`) guarded by `isServer` or `onMount`.
- [ ] `<Suspense>` boundaries placed around every `createResource`.
- [ ] `<HydrationScript>` included in the HTML head for streaming SSR.
- [ ] No conditional rendering differences between SSR and client (mismatch = broken hydration).

## Key SSR APIs

| API | Purpose |
| --- | --- |
| `renderToString(fn)` | Synchronous SSR for simple pages |
| `renderToStringAsync(fn)` | Waits for all resources before returning HTML |
| `renderToStream(fn)` | Streaming SSR with Suspense-aware progressive rendering |
| `isServer` | Boolean constant — tree-shaken in client builds |
| `hydrate(fn, el)` | Attach client reactivity to server-rendered DOM |
| `<HydrationScript>` | Injects hydration bootstrapper into HTML |

## Common pitfalls

- Using `renderToString` with resources causes empty output — use async or streaming variant.
- Accessing `window` at top-level of a module breaks SSR even if the component is client-only.
- Hydration mismatches are silent in production — test with `DEV` mode enabled.

## Corpus references

- `solid-core.reference.rendering.render-to-string`
- `solid-core.reference.rendering.render-to-string-async`
- `solid-core.reference.rendering.render-to-stream`
- `solid-core.reference.rendering.hydrate`
- `solid-core.reference.rendering.hydration-script`
- `solid-core.reference.rendering.is-server`
- `solid-core.reference.component-apis.lazy`
