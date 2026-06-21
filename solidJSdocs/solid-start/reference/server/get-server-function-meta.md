`getServerFunctionMeta` reads server function metadata from the current request event locals.

## Import

```tsx
import { getServerFunctionMeta } from "@solidjs/start";
```

## Type

```tsx
interface ServerFunctionMeta {
	id: string;
}

function getServerFunctionMeta(): ServerFunctionMeta | undefined;
```

## Parameters

`getServerFunctionMeta` takes no arguments.

## Return value

- **Type:** `ServerFunctionMeta | undefined`

Returns `getRequestEvent()?.locals.serverFunctionMeta`.

## Behavior

- When there is no request event, `getServerFunctionMeta` returns `undefined`.

## Examples

### Basic usage

```tsx
import { getServerFunctionMeta } from "@solidjs/start";

const meta = getServerFunctionMeta();
```
