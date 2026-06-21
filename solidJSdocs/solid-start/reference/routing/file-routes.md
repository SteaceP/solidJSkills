`FileRoutes` is a component-like function that returns route definitions generated from filesystem routes.

## Import

```tsx
import { FileRoutes } from "@solidjs/start/router";
```

## Type

```tsx
const FileRoutes: () => any[];
```

## Parameters

`FileRoutes` takes no arguments.

## Return value

- **Type:** `any[]`

Returns generated route definitions.

## Behavior

- On the server, `FileRoutes` returns `getRequestEvent().routes`.
- Client routes are created from the generated page route config and cached in module scope.
- Generated route info includes `filesystem: true`.

## Examples

### Basic usage

```tsx
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

export default function App() {
	return (
		<Router>
			<FileRoutes />
		</Router>
	);
}
```
