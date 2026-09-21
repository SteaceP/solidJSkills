# Base

`Base` adds a [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) element that sets the document base URL for resolving relative URLs.

## Import

```tsx
import { Base } from "@solidjs/meta";
```
## Type

```tsx
const Base: Component<JSX.BaseHTMLAttributes<HTMLBaseElement>>;
```
## Props

Accepts attributes for [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base).

## Behavior

- Registers a self-closing `base` tag.
- Non-cascading tags can add one document-head element per active instance.
- Requires [`MetaProvider`](metaprovider.md) in the component tree.

## Examples

### Basic usage

```tsx
import { MetaProvider, Base } from "@solidjs/meta";

function App() {
	return (
		<MetaProvider>
			<Base href="https://docs.solidjs.com/" />
		</MetaProvider>
	);
}
```
## Related

- [`MetaProvider`](metaprovider.md)
- [`useHead`](use-head.md)
