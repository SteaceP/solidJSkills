# SolidJS Primitives Ecosystem

## Key packages and primitives

| Package | Primitives / Utilities | Purpose |
| --- | --- | --- |
| `@solid-primitives/storage` | `makePersisted(signal, opts)`, `createStorage(storage, opts)` | Reactive synchronization with `localStorage`, `sessionStorage`, or custom adapters |
| `@solid-primitives/media` | `createMediaQuery(query)`, `createBreakpoints(breakpoints)` | Reactive CSS media queries and responsive breakpoint matching |
| `@solid-primitives/event-listener` | `createEventListener(target, event, handler)`, `createEventSignal` | Declarative, memory-safe DOM and window event listeners with automatic cleanup |
| `@solid-primitives/resize-observer` | `createResizeObserver(targets, onResize)` | Reactive element bounding and size tracking |
| `@solid-primitives/intersection-observer` | `createIntersectionObserver(elements, onIntersect)` | Reactive viewport visibility and scroll-based triggers |
| `@solid-primitives/timer` | `createTimer(fn, delay, timerFn)`, `createInterval`, `createTimeout` | Pausable, reactive timers synchronized with the component lifecycle |
| `@solid-primitives/scheduled` | `debounce(fn, delay)`, `throttle(fn, delay)`, `scheduleIdle` | Non-blocking execution control and call frequency limiting |
| `@solid-primitives/keyed` | `<Keyed each={items}>`, `createKeyedMap` | Stable keyed rendering and identity preservation for dynamic collections |

## Decision rules

1. **Standard browser APIs**: Use `@solid-primitives/*` instead of rolling custom `createEffect` + manual `addEventListener` / `removeEventListener` boilerplate.
2. **Reactive parameters**: Pass accessor functions (e.g. `() => condition()`) rather than static values when options should dynamically re-evaluate.
3. **SSR / Hydration safety**: Always provide safe initial or fallback values for storage and media queries when rendering in SSR (SolidStart/Node) to avoid hydration mismatch.
4. **Ownership and cleanup**: Primitives attach automatically to the active reactive owner. When used outside a component tree (e.g. singleton stores or background tasks), wrap inside `createRoot(dispose => ...)`.
5. **Debounce vs Throttle**: Use `debounce` for discrete completion events (e.g. search input, auto-save); use `throttle` for continuous streams (e.g. scroll position, window resize).

## Common pitfalls

- Accessing `window`, `localStorage`, or `document` during SSR without guarding with `isServer` or deferring to `onMount`.
- Passing resolved values instead of accessors, which severs reactivity when upstream dependencies change.
- Creating unbound event listeners or intervals outside an active reactive scope, causing memory leaks.
- Reading persisted storage synchronously on server render, leading to client-server hydration mismatch flashes.

## Corpus references

- `solid-core.reference.lifecycle.on-cleanup`
- `solid-core.reference.lifecycle.on-mount`
- `solid-core.reference.reactive-utilities.create-root`
- `solid-core.reference.rendering.is-server`
- `solid-core.reference.basic-reactivity.create-signal`
- `solid-core.reference.basic-reactivity.create-memo`
