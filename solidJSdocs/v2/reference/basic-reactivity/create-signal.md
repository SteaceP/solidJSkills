# createSignal

Creates a reactive state primitive consisting of an accessor getter and a setter function that forms the foundation of Solid 2.0's fine-grained reactivity system.

In Solid 2.0, signals maintain their lightweight, pull-based architecture while seamlessly participating in the first-class asynchronous reactive graph.

## Import

```typescript
import { createSignal } from "solid-js";
```

## Type signature

```typescript
function createSignal<T>(): Signal<T | undefined>;
function createSignal<T>(value: T, options?: SignalOptions<T>): Signal<T>;

type Signal<T> = [get: Accessor<T>, set: Setter<T>];

type Accessor<T> = () => T;

type Setter<T> = {
	<U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U;
	<U extends T>(value: (prev: T) => U): U;
	<U extends T>(value: Exclude<U, Function>): U;
	<U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U;
};

interface SignalOptions<T> {
	name?: string;
	equals?: false | ((prev: T, next: T) => boolean);
	internal?: boolean;
}
```

## Parameters

### `value`

- **Type:** `T`
- **Default:** `undefined`

The initial value for the signal. If no initial value is provided, the signal's type is automatically unioned with `undefined`.

### `options`

- **Type:** `SignalOptions<T>`
- **Default:** `undefined`

Optional configuration object for customizing the signal's behavior.

#### `name`

- **Type:** `string`
- **Default:** `undefined`

An optional debug identifier used by development tools. Stripped in production builds.

#### `equals`

- **Type:** `false | ((prev: T, next: T) => boolean)`
- **Default:** Reference equality (`===`)

A custom comparison function determining when the signal triggers subscriber notifications. When set to `false`, every setter invocation notifies subscribers regardless of value change.

#### `internal`

- **Type:** `boolean`
- **Default:** `false`

When true, marks the signal as internal to framework operations.

## Return value

- **Type:** `Signal<T>`

Returns a tuple `[get, set]` where:
- **`get`**: An accessor function returning the current value. When called inside a reactive tracking context (such as an effect or memo), registers a subscription.
- **`set`**: A function updating the signal value and dispatching change notifications down the reactive graph.

## Solid 2.0 Performance Enhancements

In Solid 2.0 (`2.0.0-rc.9`):
1. **Direct Leaf Reads**: JSX property spreads and element creation (`spread()`, `ssrElement()`) read signal values directly, bypassing proxy traps during re-renders.
2. **Lazy Proxy Views**: When signals are passed through `merge()` or `omit()`, Solid 2.0 constructs O(1) lazy views rather than eager object copies, dramatically reducing GC overhead.
3. **Async Interoperability**: When a signal accessor returns a Promise, downstream computations and JSX blocks seamlessly await completion via the unified async graph without throwing uncaught rejection errors.

## Examples

### Basic Usage

```tsx
import { createSignal } from "solid-js";

function Counter() {
	const [count, setCount] = createSignal(0);

	return (
		<div>
			<button onClick={() => setCount((c) => c + 1)}>Increment</button>
			<span>Count: {count()}</span>
		</div>
	);
}
```

### Functional Updates

```tsx
const [todos, setTodos] = createSignal<string[]>([]);

// Append item using current previous state
setTodos((prev) => [...prev, "Learn Solid 2.0"]);
```
