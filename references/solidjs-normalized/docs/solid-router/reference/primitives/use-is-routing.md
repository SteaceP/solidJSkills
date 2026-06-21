# Use Is Routing

`useIsRouting` returns an accessor for whether a route transition is in progress.

## Import

```ts
import { useIsRouting } from "@solidjs/router";
```
## Type

```ts
function useIsRouting(): () => boolean;
```
## Parameters

`useIsRouting` takes no arguments.

## Return value

- **Type:** `() => boolean`

Returns an accessor that reads the current route transition state.

## Behavior

- The accessor becomes `true` when a transition target starts and `false` after the active transition finishes.

## Examples

### Basic usage

```tsx
import { Show } from "solid-js";
import { useIsRouting } from "@solidjs/router";

function PendingRoute() {
	const isRouting = useIsRouting();

	return <Show when={isRouting()}>Loading route...</Show>;
}
```
## Related

- [`Router`](../components/router.md)
- [`useNavigate`](use-navigate.md)
