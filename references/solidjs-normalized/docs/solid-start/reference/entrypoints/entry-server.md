# Entry Server

`entry-server.tsx` is the server entry module.

## Import

```tsx
import { createHandler, StartServer } from "@solidjs/start/server";
```
## Type

```tsx
export default createHandler((event) => <StartServer document={Document} />);
```
## Parameters

The handler callback receives a `PageEvent`.

## Return value

The default export is the event handler returned by [`createHandler`](../server/create-handler.md).

## Behavior

- `defineConfig` uses `${appRoot}/entry-server${entryExtension}` as the server handler.
- The default `appRoot` is `"./src"`.
- Entry extension is `.jsx` when `${appRoot}/app.jsx` exists; otherwise it is `.tsx`.
- For setting different SSR modes (sync | async | stream), see [`createHandler`](../server/create-handler.md).

## Examples

### Basic usage

```tsx
import { createHandler, StartServer } from "@solidjs/start/server";

function Document(props) {
	return (
		<html>
			<head>{props.assets}</head>
			<body>
				<div id="app">{props.children}</div>
				{props.scripts}
			</body>
		</html>
	);
}

export default createHandler((event) => <StartServer document={Document} />);
```
## Related

- [`createHandler`](../server/create-handler.md)
- [`StartServer`](../server/start-server.md)
