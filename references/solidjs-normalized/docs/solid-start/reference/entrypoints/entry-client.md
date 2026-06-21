# Entry Client

`entry-client.tsx` is the client entry module.

## Import

```tsx
import { mount, StartClient } from "@solidjs/start/client";
```
## Type

```tsx
mount(() => <StartClient />, element);
```
## Parameters

`entry-client.tsx` passes a `StartClient` render function and DOM element to [`mount`](../client/mount.md).

## Return value

The entry module does not need to export a value.

## Behavior

- `defineConfig` uses `${appRoot}/entry-client${entryExtension}` as the client handler.
- The default `appRoot` is `"./src"`.
- Entry extension is `.jsx` when `${appRoot}/app.jsx` exists; otherwise it is `.tsx`.

## Examples

### Basic usage

```tsx
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
```
## Related

- [`mount`](../client/mount.md)
- [`StartClient`](../client/start-client.md)
