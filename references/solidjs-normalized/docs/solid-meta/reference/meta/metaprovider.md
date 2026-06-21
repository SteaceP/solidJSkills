# Metaprovider

`MetaProvider` supplies the context that Solid Meta components and [`useHead`](use-head.md) use to add head tags.

## Import

```tsx
import { MetaProvider } from "@solidjs/meta";
```
## Type

```tsx
const MetaProvider: ParentComponent;
```
## Props

### `children`

- **Type:** `JSX.Element`
- **Optional:** Yes

Content rendered inside the provider.

## Behavior

- Creates a `MetaContext.Provider` for its children.
- On the client, active head tags are appended to `document.head` and removed during cleanup.
- During server rendering, rendered head tags are registered through `useAssets`.
- Solid Meta components and [`useHead`](use-head.md) throw if they run without a `MetaProvider` in the component tree.

## Examples

### Basic usage

```tsx
import { MetaProvider, Title, Meta } from "@solidjs/meta";

export default function Root() {
	return (
		<MetaProvider>
			<Title>Solid Docs</Title>
			<Meta name="description" content="Solid documentation" />
		</MetaProvider>
	);
}
```
## Related

- [`Title`](title.md)
- [`Meta`](meta.md)
- [`Link`](link.md)
- [`Style`](style.md)
- [`Base`](base.md)
- [`useHead`](use-head.md)
