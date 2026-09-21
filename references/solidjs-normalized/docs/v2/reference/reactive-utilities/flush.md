# `flush` (SolidJS 2.0)

Synchronously flushes all pending reactive updates that are queued in the microtask batch.

In SolidJS 2.0, reactive writes are **automatically batched on a microtask by default**. The explicit `batch()` primitive from Solid 1.x is removed. When you need to read freshly updated state synchronously (e.g. before measuring the DOM or in tests), call `flush()`.

---

## Import

```tsx
import { flush } from "solid-js";
```
## Signatures

```typescript
function flush(): void;
function flush<T>(fn: () => T): T;
```
---

## Microtask Auto-Batching Behavior

In Solid 1.x:
- Writes outside event handlers or across asynchronous boundaries would trigger intermediate computations unless wrapped in `batch(() => { ... })`.

In Solid 2.0:
- All signal writes automatically schedule an update on the current microtask.
- Subsequent signal mutations within the same tick coalesce without triggering intermediate renders or recomputations.
- `batch()` is no longer needed.

---

## Forcing Synchronous Execution with `flush`

When an immediate DOM measurement or synchronous assertion is required:

### 1. Standalone Flush
```typescript
import { createSignal, flush } from "solid-js";

const [count, setCount] = createSignal(0);

setCount(1);
// In Solid 2.0, reading count() immediately in the same microtask queue
// will read the scheduled state once flushed.
flush();
// At this point, DOM and downstream computations are guaranteed to be up to date.
```
### 2. Scoped Flush Callback
```typescript
import { flush } from "solid-js";

// Executes the callback and forces all mutations within it to drain before returning:
const result = flush(() => {
  setCount((c) => c + 1);
  setText("updated");
  return computeGeometry();
});
```
---

## Migration from Solid 1.x `batch`

- Replace `batch(() => { setA(1); setB(2); })` with plain calls: `setA(1); setB(2);` (auto-batched).
- If your code depended on immediate synchronous execution after a batch, add `flush()`.
