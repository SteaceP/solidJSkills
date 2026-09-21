# Style

`Style` adds a [`<style>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style) element for CSS rules that apply to the document.

## Import

```tsx
import { Style } from "@solidjs/meta";
```
## Type

```tsx
const Style: Component<JSX.StyleHTMLAttributes<HTMLStyleElement>>;
```
## Props

Accepts attributes for [`<style>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style).

### `children`

- **Type:** `JSX.Element`
- **Optional:** Yes

Content rendered inside the `style` element.

## Behavior

- Registers a `style` tag with `close: true`.
- Non-cascading tags can add one document-head element per active instance.
- Requires [`MetaProvider`](metaprovider.md) in the component tree.

## Examples

### Basic usage

```tsx
import { MetaProvider, Style } from "@solidjs/meta";

export default function Root() {
	return (
		<MetaProvider>
			<Style>{`
          p {
            color: #26b72b;
          }
        `}</Style>
		</MetaProvider>
	);
}
```
## Related

- [`MetaProvider`](metaprovider.md)
- [`useHead`](use-head.md)
