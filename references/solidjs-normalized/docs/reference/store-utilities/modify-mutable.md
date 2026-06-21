# Modify Mutable

`modifyMutable` applies a modifier to a mutable store inside a batch.

## Import

```ts
import { modifyMutable } from "solid-js/store";
```
## Type

```ts
function modifyMutable<T>(state: T, modifier: (state: T) => T): void;
```
## Parameters

### `state`

- **Type:** `T`

Mutable store to modify.

### `modifier`

- **Type:** `(state: T) => T`

Modifier applied to the mutable store. For direct mutation-style modifiers, the return value is ignored.

## Return value

- **Type:** `void`

## Behavior

- `modifyMutable` runs inside a [`batch`](../reactive-utilities/batch.md), so multiple changes notify dependents after the modifier completes, and the modifier receives the unwrapped underlying state object instead of the proxy.
- The modifier can be a function returned by helpers such as [`reconcile`](reconcile.md) or [`produce`](produce.md).

## Examples

### Basic usage

```tsx
import { createMutable, modifyMutable, produce } from "solid-js/store";

const state = createMutable({
	user: {
		firstName: "John",
		lastName: "Smith",
	},
});

modifyMutable(
	state,
	produce((state) => {
		state.user.firstName = "Jane";
		state.user.lastName = "Doe";
	})
);
```
## Related

- [`createMutable`](create-mutable.md)
- [`produce`](produce.md)
- [`reconcile`](reconcile.md)
