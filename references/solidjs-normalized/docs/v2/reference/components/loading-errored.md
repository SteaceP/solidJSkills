# Loading and Errored

Boundary components in Solid 2.0 designed to isolate pending asynchronous states and handle runtime or async exceptions.

`<Loading>` and `<Errored>` replace the monolithic `<Suspense>` architecture from Solid 1.x with modular, fine-grained boundaries.

## Import

```typescript
import { Loading, Errored } from "solid-js";
```
## Type Signature

```typescript
function Loading(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;

function Errored(props: {
  fallback: JSX.Element | ((error: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): JSX.Element;
```
## Props

### `<Loading>`

#### `fallback`
- **Type:** `JSX.Element`
- Content displayed whenever a child computation or reactive accessor throws a `NotReadyError` (awaits an unfulfilled Promise).

#### `children`
- **Type:** `JSX.Element`
- The child subtree being monitored for asynchronous readiness.

### `<Errored>`

#### `fallback`
- **Type:** `JSX.Element | ((error: any, reset: () => void) => JSX.Element)`
- Content rendered when an exception or unhandled Promise rejection occurs within the subtree. The callback variant provides the error object and a `reset()` retry function.

#### `children`
- **Type:** `JSX.Element`
- The child subtree guarded against runtime exceptions.

## Examples

### Nested Boundary Isolation

```tsx
import { Loading, Errored, createMemo } from "solid-js";

async function fetchStats() {
  const res = await fetch("/api/stats");
  return res.json();
}

function AnalyticsDashboard() {
  const stats = createMemo(async () => fetchStats());

  return (
    <div class="dashboard">
      <h2>Analytics</h2>
      <Loading fallback={<div class="spinner">Fetching latest metrics...</div>}>
        <Errored
          fallback={(err, reset) => (
            <div class="alert">
              <p>Failed to load analytics: {err.message}</p>
              <button onClick={reset}>Try Again</button>
            </div>
          )}
        >
          <div class="metrics">
            <span>Users: {stats().totalUsers}</span>
            <span>Revenue: ${stats().revenue}</span>
          </div>
        </Errored>
      </Loading>
    </div>
  );
}
```
