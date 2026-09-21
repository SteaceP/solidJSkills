# Create Reaction

`createReaction` creates a reaction that invalidates once for each call to the returned tracking function.

## Import

```ts
import { createReaction } from "solid-js";
```
## Type

```ts
function createReaction(
	onInvalidate: () => void,
	options?: { name?: string }
): (tracking: () => void) => void;
```
## Parameters

### `onInvalidate`

- **Type:** `() => void`
- **Required:** Yes

Callback invoked when the tracked computation is invalidated.

### `options`

#### `name`

- **Type:** `string`

Debug name used by development tooling.

## Return value

- **Type:** `(tracking: () => void) => void`

Returns a function that executes `tracking` and records its dependencies for a single invalidation.

## Behavior

- Each call to the returned function records dependencies read during `tracking`.
- `onInvalidate` runs untracked on the first change to any recorded dependency.
- On the server, the returned function just executes `tracking`.

## Examples

### Track a signal for one invalidation

```ts
import { createReaction, createSignal } from "solid-js";

const [value, setValue] = createSignal("start");

const track = createReaction(() => console.log("changed"));

track(() => value());

setValue("end"); // logs "changed"
setValue("final"); // no-op until track() runs again
```
## Related

- [`createEffect`](../basic-reactivity/create-effect.md)
- [`createComputed`](create-computed.md)
