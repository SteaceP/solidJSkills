# Use Location

`useLocation` returns the current location object.

## Import

```ts
import { useLocation } from "@solidjs/router";
```
## Type

```ts
function useLocation<S = unknown>(): Location<S>;

interface Location<S = unknown> extends Path {
	query: SearchParams;
	state: Readonly<Partial<S>> | null;
	key: string;
}

interface Path {
	pathname: string;
	search: string;
	hash: string;
}
```
## Parameters

`useLocation` takes no arguments.

## Return value

`useLocation` returns an object with the following properties:

### `pathname`

- **Type:** `string`

Current URL pathname.

### `search`

- **Type:** `string`

Current URL search string.

### `hash`

- **Type:** `string`

The hash fragment of the URL, including the leading `#` character if a hash exists.

### `query`

- **Type:** `SearchParams`

A reactive object containing the parsed query parameters from the URL.

### `state`

- **Type:** `Readonly<Partial<S>> | null`

Custom state passed from [`useNavigate`](use-navigate.md).

### `key`

- **Type:** `string`

Location key.

## Behavior

- The location object updates when location state changes.
- The `query` object is derived from `search`.

## Examples

### Basic usage

```tsx
import { useLocation } from "@solidjs/router";

function ProductFilter() {
	const location = useLocation();

	const category = () => location.query.category || "all";
	const page = () => location.query.page || "1";

	return (
		<div>
			<p>
				Filtering by: {category()}, Page {page()}
			</p>
		</div>
	);
}
```
## Related

- [`useNavigate`](use-navigate.md)
- [`useParams`](use-params.md)
- [`useSearchParams`](use-search-params.md)
