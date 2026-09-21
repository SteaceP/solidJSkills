# Async Reactivity in Solid 2.0

Solid 2.0 unifies synchronous and asynchronous computations into a single, seamless reactive graph.

In Solid 1.x, handling asynchronous data required dedicated abstractions like `createResource` paired with `<Suspense>` boundaries. While effective, this separation created mental overhead, waterfall hazards, and edge cases around derived states.

Solid 2.0 introduces **First-Class Async Reactivity**, built on the architectural principle of **"Fetch High, Block Low"**.

---

## "Fetch High, Block Low"

The guiding principle of Solid 2.0's async model is:
- **Fetch High**: Initiate asynchronous data requests as early as possible in your data flow (at the router, parent computation, or route module).
- **Block Low**: Only suspend or display loading indicators at the specific DOM nodes that directly depend on the resolved data, rather than blocking the entire component tree.

```tsx
import { createSignal, createMemo } from "solid-js";
import { Loading, Errored } from "solid-js";

async function fetchUserProfile(id: string) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

function UserCard(props: { userId: string }) {
  // 1. Fetch High: computation initiates async operation immediately
  const user = createMemo(async () => fetchUserProfile(props.userId));

  return (
    <div class="card">
      <header>User Information</header>
      {/* 2. Block Low: only the dynamic details suspend */}
      <Loading fallback={<p class="skeleton">Loading profile...</p>}>
        <Errored fallback={(err) => <p class="error">Error: {err.message}</p>}>
          <h3>{user().name}</h3>
          <p>{user().email}</p>
        </Errored>
      </Loading>
    </div>
  );
}
```
---

## How It Works: The `NotReadyError` Pipeline

When an asynchronous accessor or memo is read before its underlying Promise resolves, the reactive engine throws a special internal `NotReadyError`.

1. **Tracking Interception**: The active reactive context (computation or JSX element) catches the `NotReadyError`.
2. **Subscription Registration**: The context attaches itself as a listener to the Promise's resolution handler.
3. **Suspension**: The nearest parent `<Loading>` boundary intercepts the signal and mounts its `fallback` UI without tearing down the parent component tree.
4. **Resolution & Re-execution**: When the Promise resolves, the reactive graph resumes the suspended computation and patches the DOM in-place.

---

## Avoiding Waterfall Cascades

In older async paradigms, chaining asynchronous dependencies caused sequential network roundtrips:

```typescript
// ❌ Solid 1.x / Waterfall hazard: sequential awaits
const [user] = createResource(fetchUser);
const [posts] = createResource(() => user()?.id, fetchPosts);
```
In Solid 2.0, asynchronous derivations can start eagerly or be coordinated at the route level:

```typescript
// ✅ Solid 2.0: Eager initiation with fine-grained dependencies
const user = createMemo(async () => fetchUser(props.id));
const posts = createMemo(async () => {
  // user() can be read within the async execution context
  const u = await user();
  return fetchPosts(u.id);
});
```
---

## Boundary Decomposition: `<Loading>` and `<Errored>`

Solid 2.0 deprecates the monolithic `<Suspense>` component in favor of modular boundaries:

- **`<Loading>`**: Intercepts unready async accessors and renders a pending fallback.
- **`<Errored>`**: Intercepts unhandled async rejections or runtime exceptions within child computations and renders an error fallback.

This decomposition allows you to handle loading states and error recovery independently at whatever granularity your UI demands.
