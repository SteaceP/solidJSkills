# SolidJS Reactivity Rules & Primitives Guide (v1.x Production)

This guide documents the foundational fine-grained reactivity rules of SolidJS 1.x, optimal derivation patterns, and anti-patterns.

---

## 1. The Core Invariants of Fine-Grained Reactivity

1. **Components Run Once**: Unlike React, Solid component functions execute only once when created. They do NOT re-run when state updates.
2. **Signals are Functions**: A signal is a tuple `[get, set]`:
   - Read: `count()` (accessor function).
   - Write: `setCount(5)` or `setCount(c => c + 1)`.
3. **Tracking is Synchronous & Contextual**: A signal tracks a dependency only when read synchronously inside an active tracking context (`createEffect`, `createMemo`, or inside JSX template expressions).

---

## 2. Primitives Decision Matrix

| Primitive | Tracking Context? | Execution Timing | Primary Purpose |
| :--- | :--- | :--- | :--- |
| `createSignal` | No | Immediate on write | Primary source of state. |
| `createMemo` | Yes (reads) | Lazy / Cached derivation | Pure derivations that require caching or prevent redundant recomputation. |
| `createEffect` | Yes (reads) | Post-render commit | Side effects that sync to the external world (DOM, network, logging). |
| `createRenderEffect` | Yes (reads) | During DOM render | Internal DOM synchronization (rarely needed in app code). |
| `createComputed` | Yes (reads) | Pre-render commit | Synchronous computation that updates before downstream reactions. |
| `batch` | No | Synchronous grouping | Groups multi-signal updates into a single recomputation step. |
| `untrack` | Suspends tracking | Immediate | Reads a signal value without adding it as a dependency. |
| `createRoot` | Creates detached owner | Immediate | Runs code outside reactive lifecycle; returns manual `dispose()` function. |

---

## 3. Derivations vs Effects (The #1 Rule)

> [!IMPORTANT]
> **Never write to a signal inside an effect to compute derived state.**
> Use simple functions or `createMemo`.

```tsx
// ❌ ANTI-PATTERN: Effect-driven derivation (causes cascading renders & glitching)
const [first, setFirst] = createSignal("Jane");
const [last, setLast] = createSignal("Doe");
const [full, setFull] = createSignal("");

createEffect(() => {
  setFull(`${first()} ${last()}`); // BAD!
});

// ✅ CORRECT: Pure function derivation (for cheap computations)
const fullName = () => `${first()} ${last()}`;

// ✅ CORRECT: createMemo derivation (for expensive operations or referential caching)
const filteredList = createMemo(() => {
  return items().filter(item => item.name.includes(query()));
});
```

---

## 4. Common Reactivity Traps

### Trap 1: Destructuring Props
Destructuring props breaks getter tracking:
```tsx
// ❌ BROKEN: Destructuring props loses reactivity
function Card({ title, count }) {
  return <h1>{title} ({count})</h1>; // Static! Never updates.
}

// ✅ FIXED: Read via props object or splitProps
import { splitProps } from "solid-js";

function Card(props) {
  const [local, others] = splitProps(props, ["title", "count"]);
  return <h1>{local.title} ({local.count})</h1>;
}
```

### Trap 2: Missing Accessor Invocation in JSX
Passing the function itself rather than calling it:
```tsx
// ❌ WRONG: Renders "[Function]" or doesn't react
<div>Count: {count}</div>

// ✅ FIXED: Invoke the accessor
<div>Count: {count()}</div>
```

### Trap 3: Asynchronous Untracked Access
Reading signals after `await` loses the tracking context:
```tsx
createEffect(async () => {
  const id = userId(); // TRACKED (synchronous)
  const res = await fetch(`/api/user/${id}`);
  const extra = extraFilter(); // ❌ UNTRACKED! Execution resumed outside reactive scope.
});
```

---

## 5. SolidJS 2.0 Evolution Note
In SolidJS 2.0-rc.9, the reactive graph supports first-class async tracking natively, but 1.x requires wrapping async calls in `createResource` or reading signals synchronously before async pauses.
