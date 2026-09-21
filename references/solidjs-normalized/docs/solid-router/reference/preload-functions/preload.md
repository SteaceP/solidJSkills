# Preload

`preload` is a [`Route`](../components/route.md) property for preparing route data before the route component renders or while a route is being preloaded.

## Import

```tsx
import { Route } from "@solidjs/router";
```
## Type

```tsx
type Intent = "initial" | "native" | "navigate" | "preload";

interface RoutePreloadFuncArgs {
	params: Params;
	location: Location;
	intent: Intent;
}

type RoutePreloadFunc<T = unknown> = (args: RoutePreloadFuncArgs) => T;
```
## Parameters

### `params`

- **Type:** `Params`
- **Required:** Yes

Route params for the matched route.
The value has the same shape as [`useParams`](../primitives/use-params.md).

### `location`

- **Type:** `Location`
- **Required:** Yes

[`Location`](../primitives/use-location.md) for the route being loaded or preloaded.

### `intent`

- **Type:** `"initial" | "native" | "navigate" | "preload"`
- **Required:** Yes

Reason the router called the preload function, such as initial render, router navigation, native history navigation, or route preloading.

## Return value

- **Type:** `T`

Returns the route data value.
During route context creation, Solid Router passes this value to the matched route component as `props.data`.

## Behavior

- During route context creation, Solid Router calls `preload` with the matched params, current location, and current router intent or `"initial"`.
- Manual route preloading calls `preload` with `intent: "preload"` only when `preloadData` is truthy.
- If a route definition has no `preload`, Solid Router uses the deprecated `load` property when one is present.
- The route component's static `preload` method runs before the route-level `preload` function.

## Examples

### Basic usage

```tsx
import { Route, query } from "@solidjs/router";

const getProduct = query(async (id: string) => {
	const response = await fetch(`/api/products/${id}`);
	return response.json();
}, "product");

function preloadProduct({ params }) {
	void getProduct(params.id);
}

function ProductPage(props) {
	return <h1>Product {props.params.id}</h1>;
}

export default function ProductRoutes() {
	return (
		<Route
			path="/products/:id"
			component={ProductPage}
			preload={preloadProduct}
		/>
	);
}
```
## Related

- [`Route`](../components/route.md)
- [`usePreloadRoute`](../primitives/use-preload-route.md)
