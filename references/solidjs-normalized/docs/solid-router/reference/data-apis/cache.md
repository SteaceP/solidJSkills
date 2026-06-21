# Cache

`cache` is a deprecated alias for [`query`](query.md).

## Import

```tsx
import { cache } from "@solidjs/router";
```
## Type

```tsx
const cache: typeof query;
```
## Parameters

`cache` has the same parameters as [`query`](query.md).

## Return value

- **Type:** `CachedFunction<T>`

`cache` returns the same value as [`query`](query.md).

## Behavior

- `cache` and `query` reference the same function.
- Cache keys, reuse behavior, static methods, and revalidation behavior are the same as [`query`](query.md).

## Examples

### Basic usage

```tsx
import { cache } from "@solidjs/router";

const getUser = cache(async (id: string) => {
	const response = await fetch(`/api/users/${id}`);
	return response.json();
}, "user");
```
## Related

- [`query`](query.md)
