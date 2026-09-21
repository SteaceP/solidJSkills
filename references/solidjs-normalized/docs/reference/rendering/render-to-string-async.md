# Render To String Async

`renderToStringAsync` renders HTML to a string after async suspense boundaries settle.

## Import

```ts
import { renderToStringAsync } from "solid-js/web";
```
## Type

```ts
function renderToStringAsync<T>(
	fn: () => T,
	options?: {
		timeoutMs?: number;
		nonce?: string;
		renderId?: string;
	}
): Promise<string>;
```
## Parameters

### `fn`

- **Type:** `() => T`

Function that returns the root output to render.

### `options`

#### `timeoutMs`

- **Type:** `number`

Maximum wait time before the returned promise rejects.

#### `nonce`

- **Type:** `string`

Nonce applied to inline scripts emitted during rendering.

#### `renderId`

- **Type:** `string`

Identifier used to namespace the render output.

## Return value

- **Type:** `Promise<string>`

Promise that resolves to the rendered HTML string.

## Behavior

- `renderToStringAsync` is a server rendering API and is unsupported in browser bundles.
- It waits for server suspense boundaries to settle before resolving the final HTML string.
- `timeoutMs` limits how long the render waits for async suspense work to finish.
- Resource data is serialized for client hydration.
- `renderId` namespaces the render output when multiple top-level roots are present.

## Examples

### Basic usage

```tsx
import { renderToStringAsync } from "solid-js/web";

const html = await renderToStringAsync(() => <App />);
```
## Related

- [`renderToString`](render-to-string.md)
- [`renderToStream`](render-to-stream.md)
