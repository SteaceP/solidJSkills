# createMemo

Creates a read-only derived reactive computation that caches its result and notifies downstream subscribers only when the computed output changes.

In Solid 2.0, `createMemo` natively supports asynchronous computations, allowing async values to participate directly in the reactive graph.

## Import

```typescript
import { createMemo } from "solid-js";
```
## Type Signature

```typescript
function createMemo<T>(
  fn: (prev: T) => T,
  value?: T,
  options?: MemoOptions<T>
): Accessor<T>;

function createMemo<T>(
  fn: (prev: T | undefined) => Promise<T>,
  value?: T,
  options?: MemoOptions<T>
): Accessor<T>;

interface MemoOptions<T> {
  name?: string;
  equals?: false | ((prev: T, next: T) => boolean);
}
```
## Parameters

### `fn`
- **Type:** `(prev: T) => T | Promise<T>`
- The calculation function. When returning a `Promise`, the computation participates in the async graph: accessing the accessor while pending throws `NotReadyError` caught by parent `<Loading>` boundaries.

### `value`
- **Type:** `T`
- **Default:** `undefined`
- Initial seed value passed to the first execution of `fn`.

### `options`
- **Type:** `MemoOptions<T>`
- Configuration options (`name` for devtools, `equals` for equality checking).

## Return Value

- **Type:** `Accessor<T>`
- A read-only getter function returning the cached computed value.

## Examples

### Synchronous Derived State

```tsx
import { createSignal, createMemo } from "solid-js";

const [count, setCount] = createSignal(1);
const double = createMemo(() => count() * 2);

console.log(double()); // 2
setCount(5);
console.log(double()); // 10
```
### Asynchronous Derived State

```tsx
import { createSignal, createMemo, Loading } from "solid-js";

const [userId, setUserId] = createSignal("user_123");

const profile = createMemo(async () => {
  const res = await fetch(`/api/users/${userId()}`);
  return res.json();
});

function UserView() {
  return (
    <Loading fallback={<p>Fetching user details...</p>}>
      <h2>{profile().name}</h2>
      <p>{profile().bio}</p>
    </Loading>
  );
}
```
