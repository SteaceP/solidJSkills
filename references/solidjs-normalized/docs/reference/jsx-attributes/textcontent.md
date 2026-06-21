# Textcontent

`textContent` sets an element's `textContent` property with plain text content.

## Syntax

```tsx
<div textContent={value} />
```
## Value

- **Type:** `string | number`

Text written to the element without parsing markup.

## Behavior

- `textContent` replaces the element's existing child content instead of merging with JSX children.
- On the client, the value is written through the DOM `textContent` property. During SSR, it is emitted as escaped text instead of raw HTML.

## Examples

### Basic usage

```tsx
<div textContent={"<strong>Hello</strong>"} />
```
## Related

- [`innerHTML`](innerhtml.md)
