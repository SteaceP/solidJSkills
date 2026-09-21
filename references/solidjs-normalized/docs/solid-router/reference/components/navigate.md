# Navigate

`Navigate` performs router navigation during render and returns no UI. It is the component form of a redirect, not an anchor link.

## Import

```tsx
import { Navigate } from "@solidjs/router";
```
## Type

```tsx
interface NavigateProps {
	href:
		| ((args: { navigate: Navigator; location: Location }) => string)
		| string;
	state?: unknown;
}

function Navigate(props: NavigateProps): null;
```
## Props

### `href`

- **Type:** `((args: { navigate: Navigator; location: Location }) => string) | string`
- **Optional:** No

Path to navigate to, or a function that receives the router navigator and current location and returns a path.

### `state`

- **Type:** `unknown`
- **Optional:** Yes

State passed to the router navigator.

## Behavior

- Calls `useNavigate` and `useLocation` when rendered.
- If `href` is a function, it receives `{ navigate, location }` before navigation.
- Navigation uses `{ replace: true, state }`.
- Renders `null`.

## Examples

### Basic usage

```tsx
import { Navigate, Route, Router } from "@solidjs/router";

export default function App() {
	return (
		<Router>
			<Route path="/old" component={() => <Navigate href="/new" />} />
		</Router>
	);
}
```
### Function href

```tsx
import { Navigate, Route, Router } from "@solidjs/router";

function getPath({ location }) {
	return location.pathname === "/old" ? "/new" : "/";
}

export default function App() {
	return (
		<Router>
			<Route path="/old" component={() => <Navigate href={getPath} />} />
		</Router>
	);
}
```
## Related

- [`A`](a.md)
- [`useNavigate`](../primitives/use-navigate.md)
- [`useLocation`](../primitives/use-location.md)
