# SolidJS 2.0 Documentation (Release Candidate)

Welcome to the official documentation for **SolidJS 2.0 Release Candidate (`2.0.0-rc.9`)**.

Solid 2.0 is out of beta and represents the next major evolution of fine-grained reactive UI development. It introduces a first-class async reactive graph, a streamlined component and control flow model, a high-performance Rust/OXC compiler, and an integrated Vite plugin start mode.

> [!IMPORTANT]
> **Release Candidate Status**: Solid 2.0 is currently at `2.0.0-rc.9`. This hub documents the 2.0 API surface and architectural paradigms. If you are developing or maintaining an existing production application using SolidJS 1.x (`"solid-js": "^1.x"`), please refer to the standard [SolidJS 1.x Documentation Hub](/) to avoid API incompatibilities.

---

## What's New in Solid 2.0

Solid 2.0 unifies synchronous and asynchronous reactivity into a single, cohesive reactive graph without the need for manual waterfall plumbing or external cache layers.

### 1. First-Class Async Reactivity ("Fetch High, Block Low")
In Solid 1.x, asynchronous operations required specialized wrappers like `createResource` paired with `<Suspense>` boundaries. In Solid 2.0:
- **Async Signals and Computations**: Reading an async accessor (e.g. `createMemo(async () => ...)` or async signals) directly participates in the reactive graph.
- **`NotReadyError` Pipeline**: When an unready async value is accessed in a computation or JSX element, the reactive graph catches the `NotReadyError` and registers a resumption dependency automatically once resolved.
- **`<Loading>` and `<Errored>` Boundaries**: Fine-grained, decoupled boundary components replace the monolithic `<Suspense>` model, offering isolated fallback loading indicators and error states.

### 2. Streamlined Control Flow & Component Primitives
- **Unified `<For>` Iteration**: The `<Index>` component is removed. Use `<For keyed={true}>` (default) when items have unique identity and index changes, and `<For keyed={false}>` when elements are bound by position and the item value updates in-place.
- **Functional `dynamic()` Helper**: The `<Dynamic>` component is replaced by the `dynamic(component, props)` function, which supports build-time namespace (`xmlns`) resolution and faster compilation.
- **Separated Dependency Tracking in Effects**: `createEffect` explicitly decouples tracking dependencies from the effect execution body to cleanly support async scheduling.

### 3. Integrated Start Mode
SolidStart is no longer a standalone meta-framework CLI (`@solidjs/start`). Instead, full-stack SSR and server function support are delivered directly via a standard Vite plugin (`start mode`), providing a simpler, standard configuration workflow.

### 4. Performance Internals & rc.9 Refinements
The `2.0.0-rc.9` release incorporates deep internal optimizations:
- **Lazy Proxy Views for `merge()` and `omit()`**: Replaces eager object copying with O(1) proxy views over flattened sources, reducing memory consumption by 3–7× and accelerating SSR polymorphic attribute rendering by ~2.4×.
- **Direct Leaf Property Access**: `spread()` and `ssrElement()` read terminal values directly, bypassing proxy traps during effect re-executions.
- **Rust/OXC Compiler**: Solid 2.0 ships with `@solidjs/oxc-transform` by default, delivering sub-millisecond JSX transformations.

---

## Documentation Index

Explore the Solid 2.0 guides, concepts, and API references:

| Category | Document | Description |
| :--- | :--- | :--- |
| **Concepts** | [Async Reactivity](concepts/async-reactivity.md) | Deep dive into the unified async graph, `NotReadyError`, and avoidance of async waterfalls. |
| **Concepts** | [Control Flow & Rendering](concepts/control-flow.md) | Guide to `<For keyed={false}>`, conditional branches, and dynamic component mounting. |
| **Concepts** | [Vite Start Mode](concepts/start-mode.md) | Full-stack architecture, `"use server"` functions, and isomorphic data fetching. |
| **Migration** | [Migration Guide (1.x to 2.0-rc.9)](migration-guide.md) | Comprehensive step-by-step upgrade guide, breaking changes, and code diffs. |
| **Reference** | [createSignal](reference/basic-reactivity/create-signal.md) | Core reactive state primitive with signal properties and lazy accessor proxy views. |
| **Reference** | [createMemo](reference/basic-reactivity/create-memo.md) | Synchronous and asynchronous memoized computations. |
| **Reference** | [<For>](reference/components/for.md) | List rendering component supporting both keyed and non-keyed iteration. |
| **Reference** | [<Loading> and <Errored>](reference/components/loading-errored.md) | Boundary components for managing asynchronous state and failures. |
| **Reference** | [dynamic()](reference/rendering/dynamic.md) | Functional dynamic component mounting helper with namespace support. |
