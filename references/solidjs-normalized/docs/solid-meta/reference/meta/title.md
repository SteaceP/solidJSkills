# Title

`Title` adds a [`<title>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title) element that sets the document title.

## Import

```tsx
import { Title } from "@solidjs/meta";
```
## Type

```tsx
const Title: Component<JSX.HTMLAttributes<HTMLTitleElement>>;
```
## Props

Accepts attributes for [`<title>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title).

### `children`

- **Type:** `JSX.Element`
- **Optional:** Yes

Content rendered inside the `title` element.

## Behavior

- Registers a `title` tag with `close: true` and `escape: true`.
- Cascading keeps the latest active `title` instance in the document head and restores the previous instance when the latest one is removed.
- Requires [`MetaProvider`](metaprovider.md) in the component tree.

## Examples

### Basic usage

```tsx
import { MetaProvider, Title } from "@solidjs/meta";

export default function Root() {
	return (
		<MetaProvider>
			<Title>Solid Docs</Title>
		</MetaProvider>
	);
}
```
## Related

- [`MetaProvider`](metaprovider.md)
- [`useHead`](use-head.md)
