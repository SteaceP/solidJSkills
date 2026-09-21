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
3. **SSR / Hydration safety**: Direct access to `localStorage`, `window`, or `document` during server rendering throws `ReferenceError`. Use `cookieStorage` from `@solid-primitives/storage` in SSR (SolidStart) to persist state (e.g., theme or authentication) and prevent client-server content flashes.
4. **Timers & Listeners in SSR**: Wrap browser-specific primitives (e.g., `createTimer`, `createEventListener` on `window`) in `onMount` or guard with `!isServer` so background execution does not run during server render passes.
5. **Ownership and cleanup**: Primitives attach automatically to the active reactive owner. When used outside a component tree (e.g. singleton stores or background tasks), wrap inside `createRoot(dispose => ...)`.
6. **Debounce vs Throttle**: Use `debounce` for discrete completion events (e.g. search input, auto-save); use `throttle` for continuous streams (e.g. scroll position, window resize).

## Common pitfalls

- Accessing `window`, `localStorage`, or `document` during SSR without guarding with `isServer`, `cookieStorage`, or deferring to `onMount`.
- Running timers during SSR: `createTimer` or `setInterval` will run on the server if not deferred with `onMount` or `!isServer`, causing performance waste and memory leaks.
- Passing resolved values instead of accessors, which severs reactivity when upstream dependencies change.
- Creating unbound event listeners or intervals outside an active reactive scope, causing memory leaks.
- Reading client-only `localStorage` synchronously on initial render in SSR, leading to hydration mismatch flashes (use `cookieStorage` instead).

## Corpus references

- `solid-core.reference.lifecycle.on-cleanup`
- `solid-core.reference.lifecycle.on-mount`
- `solid-core.reference.reactive-utilities.create-root`
- `solid-core.reference.rendering.is-server`
- `solid-core.reference.basic-reactivity.create-signal`
- `solid-core.reference.basic-reactivity.create-memo`
