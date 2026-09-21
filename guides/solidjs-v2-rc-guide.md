# SolidJS 2.0 Release Candidate (`2.0.0-rc.9`) Architectural Guide & Migration Reference

This guide documents the major architectural differences between **SolidJS 1.x (Production Stable)** and **SolidJS 2.0 (Release Candidate `2.0.0-rc.9`)**. 

> [!IMPORTANT]
> **Strict Version Separation Policy**:
> All skills in `solidJSkills` default to **SolidJS 1.x** to protect production codebases. Use this guide when a project targets `"solid-js": "^2.0.0-rc.9"` (or later) or when executing a migration from v1 to v2. Never mix v1 and v2 syntax in the same component.

---

## 1. Executive Summary of SolidJS 2.0 Breaking Changes

SolidJS 2.0 is a fundamental modernization of the framework focused on:
1. **First-class Async Reactive Graph**: Promises and async execution are natively understood by the reactive graph.
2. **Simplified Control Flow**: Removal of `<Index>` in favor of `<For keyed={false}>`.
3. **Boundary Restructuring**: Rework of `<Suspense>` into declarative `<Loading>` and `<Errored>` boundaries.
4. **Dynamic Element Syntax**: `<Dynamic component={...}>` component is replaced by the `dynamic()` helper.
5. **Mutation & Optimistic State Primitives**: Native `action()` and `createOptimisticStore()`.
6. **Modern Tooling & Start Mode**: A new Rust/Oxc-based compiler, and migration from the standalone `@solidjs/start` meta-framework to an integrated Vite plugin "start mode".

---

## 2. Side-by-Side Comparison: v1 vs v2.0-rc.9

| Feature / Domain | SolidJS 1.x (Stable) | SolidJS 2.0-rc.9 (Release Candidate) |
| :--- | :--- | :--- |
| **Async Data Fetching** | `createResource(source, fetcher)` + `<Suspense fallback={...}>` | Direct async reading in graph: `const data = async () => ...` or native promises in computations |
| **Async Boundaries** | `<Suspense fallback={<Spinner />}>` with `<ErrorBoundary fallback={...}>` | Redesigned boundaries: `<Loading fallback={<Spinner />}>` and `<Errored fallback={...}>` |
| **Keyed Lists** | `<For each={list()}>{(item, index) => ...}</For>` (item is value, index is signal) | `<For each={list()} keyed>{(item, index) => ...}</For>` (default is keyed) |
| **Non-Keyed (Index) Lists** | `<Index each={list()}>{(item, index) => ...}</Index>` (item is signal, index is value) | `<For each={list()} keyed={false}>{(item, index) => ...}</For>` (`<Index>` removed) |
| **Dynamic Components** | `<Dynamic component={Tag} {...props} />` | `const Element = dynamic(Tag); <Element {...props} />` (`<Dynamic>` deprecated) |
| **Effects** | `createEffect`, `createRenderEffect`, `createComputed` | Phased effect execution: explicit separation of render-phase, post-commit, and DOM effects |
| **Mutations** | Manual signals, `@solidjs/router` `action` / `createAction` | Core `action()` primitive with built-in status and `createOptimisticStore()` |
| **Compiler** | Babel-based JSX transform (`babel-preset-solid`) | Oxc / Rust-based high-performance compiler |
| **Meta-framework** | Standalone `@solidjs/start` package via Vinxi | Core Vite plugin "start mode" (`@solidjs/vite-plugin`) |

---

## 3. Detailed Architectural Changes

### 3.1 First-Class Async Reactive Graph

In Solid 1.x, reactivity was strictly synchronous. Any asynchronous operation required bridging via `createResource`:

```tsx
// Solid 1.x: createResource bridge
import { createResource, Suspense } from "solid-js";

const [user] = createResource(userId, fetchUser);

function Profile() {
  return (
    <Suspense fallback={<p>Loading user...</p>}>
      <h1>{user()?.name}</h1>
    </Suspense>
  );
}
```

In Solid 2.0-rc, promises are native members of the reactive graph. You can read promises directly, and dependent computations automatically suspend and resume:

```tsx
// Solid 2.0-rc.9: Native async graph with <Loading>
import { Loading, Errored } from "solid-js";

function Profile() {
  // Directly invoking an async function in reactive context
  const user = async () => await fetchUser(userId());

  return (
    <Errored fallback={(err) => <p>Failed: {err.message}</p>}>
      <Loading fallback={<p>Loading user...</p>}>
        <h1>{user().name}</h1>
      </Loading>
    </Errored>
  );
}
```

---

### 3.2 List Rendering: `<Index>` Replacement

In Solid 1.x:
- `<For>` keyed elements by item identity. If the array was reordered, DOM elements moved.
- `<Index>` keyed elements by array index. Useful for primitive values (strings, numbers) where identity doesn't matter.

In Solid 2.0-rc:
`<Index>` is completely removed. Instead, use `<For keyed={false}>`:

```tsx
// Solid 1.x Primitive List:
import { Index } from "solid-js";
<Index each={numbers()}>
  {(num, i) => <div>Index {i}: {num()}</div>}
</Index>

// Solid 2.0-rc.9 Equivalent:
import { For } from "solid-js";
<For each={numbers()} keyed={false}>
  {(num, i) => <div>Index {i}: {num()}</div>}
</For>
```

---

### 3.3 Dynamic Element Syntax: `dynamic()`

In Solid 1.x:
```tsx
import { Dynamic } from "solid-js/web";

function Heading(props) {
  return <Dynamic component={props.level || "h1"} class="title">{props.children}</Dynamic>;
}
```

In Solid 2.0-rc:
The component `<Dynamic>` is deprecated in favor of the `dynamic()` factory function:
```tsx
import { dynamic } from "solid-js/web";

function Heading(props) {
  const Tag = dynamic(() => props.level || "h1");
  return <Tag class="title">{props.children}</Tag>;
}
```

---

## 4. Migration Checklist: Upgrading from 1.x to 2.0-rc.9

When tasked with upgrading a 1.x application to 2.0-rc.9:

1. **Dependencies**:
   - Update `package.json`: `"solid-js": "^2.0.0-rc.9"`.
   - Update bundler/Vite plugin to the 2.0 release candidate.
2. **Replace `<Index>`**:
   - Search for `<Index each={...}>` across the codebase.
   - Replace with `<For keyed={false} each={...}>`.
3. **Update `<Suspense>` to `<Loading>` / `<Errored>`**:
   - Convert legacy `<Suspense fallback={...}>` to `<Loading fallback={...}>`.
   - Wrap in `<Errored fallback={...}>` to replace legacy error boundaries.
4. **Replace `<Dynamic>`**:
   - Replace `<Dynamic component={...} />` with `dynamic()`.
5. **Modernize Async Resources**:
   - Review `createResource` call sites; evaluate converting to native async functions where appropriate.
6. **SolidStart / Vite Configuration**:
   - If using SolidStart, review the migration from Vinxi-based `@solidjs/start` to the unified start mode in the Vite plugin.

---

## 5. Verification Commands

Verify package version and compatibility:

```bash
# Check installed solid-js version
npm list solid-js

# Run integration tests
npm test
```
