# No Hydration

`<NoHydration>` skips hydration for its subtree on the client.

## Import

```ts
import { NoHydration } from "solid-js/web";
```
## Type

```ts
function NoHydration(props: { children?: JSX.Element }): JSX.Element;
```
## Props

### `children`

- **Type:** `JSX.Element`

Content inside the boundary.

## Return value

- **Type:** `JSX.Element`

Returns the children during server and client-only rendering.

## Behavior

- During server rendering, children inside `<NoHydration>` render normally.
- During client hydration, Solid leaves the existing server-rendered DOM in place and does not hydrate that subtree.
- In client-only rendering, `<NoHydration>` renders its children normally.
- Interactive behavior inside the boundary does not hydrate on the client.

## Examples

### Basic usage

```tsx
function Example() {
	return (
		<div>
			<button onClick={() => console.log("hydrated")}>Hydrated button</button>
			<NoHydration>
				<div>
					<strong>Rendered on the server without hydration</strong>
				</div>
			</NoHydration>
		</div>
	);
}
```
