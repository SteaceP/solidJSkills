# SolidJS Migration & Refactoring Guide: React to Solid 1.x & Solid 1.x to 2.0-rc.9

This guide provides deterministic transformation recipes for refactoring React codebases to SolidJS 1.x, as well as upgrading existing SolidJS 1.x codebases to SolidJS 2.0-rc.9.

---

## 1. React to SolidJS 1.x Transformation Table

| React Concept | SolidJS 1.x Equivalent | Key Difference |
| :--- | :--- | :--- |
| `useState(val)` | `createSignal(val)` | Returns `[getter, setter]`. Getter must be called as function: `val()`. |
| `useMemo(() => fn, [deps])` | `createMemo(() => fn)` | No dependency array! Automatic dependency tracking. |
| `useCallback(fn, [deps])` | Plain function `const fn = () => ...` | Components run once; no recreated function references. |
| `useEffect(fn, [deps])` | `createEffect(fn)` | Runs after render when dependencies change. No manual dependency array. |
| `useRef(initialVal)` | `let el!: HTMLElement; <div ref={el} />` | Native JSX `ref` variable assignment. For mutable non-reactive values, use standard JS `let`. |
| `items.map(item => ...)` | `<For each={items()}>` | `<For>` prevents recreating DOM elements on array changes. |
| `condition ? <A /> : <B />` | `<Show when={...} fallback={<B />}>` | Prevents mounting and unmounting DOM subtrees unnecessarily. |
| `useContext(Ctx)` | `useContext(Ctx)` | Context works similarly, but consumed signals preserve fine-grained reactivity. |

### React to Solid Conversion Recipe
```tsx
// React (re-renders entire component on state change):
import React, { useState, useMemo } from "react";
export function SearchReact({ items }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => items.filter(i => i.includes(query)), [items, query]);
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(i => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}

// SolidJS 1.x (component runs ONCE; only DOM text & list updates):
import { createSignal, createMemo, For } from "solid-js";
export function SearchSolid(props) {
  const [query, setQuery] = createSignal("");
  const filtered = createMemo(() => (props.items || []).filter(i => i.includes(query())));
  return (
    <div>
      <input value={query()} onInput={e => setQuery(e.currentTarget.value)} />
      <ul>
        <For each={filtered()}>
          {(item) => <li>{item}</li>}
        </For>
      </ul>
    </div>
  );
}
```

---

## 2. SolidJS 1.x to SolidJS 2.0-rc.9 Upgrade Guide

When upgrading existing SolidJS 1.x codebases to `2.0.0-rc.9`:

### 2.1 Replace `<Index>` with `<For keyed={false}>`
In Solid 2.0-rc, `<Index>` is removed:
```tsx
// Solid 1.x:
<Index each={names()}>{(name, i) => <li>{i}: {name()}</li>}</Index>

// Solid 2.0-rc.9:
<For each={names()} keyed={false}>{(name, i) => <li>{i}: {name()}</li>}</For>
```

### 2.2 Modernize `<Suspense>` to `<Loading>` and `<Errored>`
Solid 2.0 decouples loading state from error state:
```tsx
// Solid 1.x:
<ErrorBoundary fallback={<div>Error</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <UserProfile />
  </Suspense>
</ErrorBoundary>

// Solid 2.0-rc.9:
<Errored fallback={(err) => <div>Error: {err.message}</div>}>
  <Loading fallback={<div>Loading...</div>}>
    <UserProfile />
  </Loading>
</Errored>
```

### 2.3 Deprecation of `<Dynamic>` in favor of `dynamic()`
```tsx
// Solid 1.x:
import { Dynamic } from "solid-js/web";
<Dynamic component={props.tag} class="heading">{props.children}</Dynamic>

// Solid 2.0-rc.9:
import { dynamic } from "solid-js/web";
const Tag = dynamic(() => props.tag);
<Tag class="heading">{props.children}</Tag>
```
