# Batch

`batch` groups multiple reactive updates so downstream computations run once after the batch completes instead of after each individual update.

## Import

```ts
import { batch } from "solid-js";
```
## Type

```ts
function batch<T>(fn: () => T): T;
```
## Parameters

### `fn`

- **Type:** `() => T`
- **Required:** Yes

Function executed inside the batch.

## Return value

- **Type:** `T`

Returns the value produced by `fn`.

## Behavior

- Downstream computations are deferred until the batch completes.
- Nested `batch` calls behave like a single larger batch.
- If you read a stale memo or signal inside the batch, Solid updates it on demand before returning the value.
- If `fn` is asynchronous, batching applies only to updates before the first `await` or other async suspension point.

## Automatic batching

Solid automatically batches updates in several cases, including:

- inside [`createEffect`](../basic-reactivity/create-effect.md) and [`onMount`](../lifecycle/on-mount.md)
- inside the setter returned by [`createStore`](../store-utilities/create-store.md)
- inside array mutation methods on [`createMutable`](../store-utilities/create-mutable.md)

## Examples

### Basic usage

```ts
const [count, setCount] = createSignal(0);
const [total, setTotal] = createSignal(0);

const summary = createMemo(() => `${count()} / ${total()}`);
createEffect(() => console.log(summary())); // logs "0 / 0"
```
Outside `batch`:

```ts
setCount(1); // logs "1 / 0"
setTotal(5); // logs "1 / 5"
```
Inside `batch`:

```ts
batch(() => {
	setCount(1);
	setTotal(5);
}); // logs "1 / 5"
```
### Read inside a batch

```ts
batch(() => {
	setCount(2);
	console.log(summary()); // logs "2 / 5"
	setTotal(10);
}); // logs "2 / 10"
```
## Related

- [`createEffect`](../basic-reactivity/create-effect.md)
- [`createStore`](../store-utilities/create-store.md)
- [`createMutable`](../store-utilities/create-mutable.md)
