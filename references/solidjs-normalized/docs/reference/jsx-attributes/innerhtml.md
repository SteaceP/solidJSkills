# Innerhtml

`innerHTML` sets an element's `innerHTML` property.

## Syntax

```tsx
<div innerHTML={html} />
```
## Value

- **Type:** `string`

HTML string inserted as raw markup into the element.

## Behavior

- Setting `innerHTML` replaces the element's existing children with nodes parsed from the string.
- The value is written through the DOM `innerHTML` property.
- In SSR output, the HTML string is emitted as child content without escaping.
- Unlike [`textContent`](textcontent.md), `innerHTML` parses markup instead of inserting plain text.

:::caution
Using `innerHTML` with unsanitized user-supplied data can introduce security vulnerabilities.
:::

## Examples

### Basic usage

```tsx
<div innerHTML={"<strong>Hello</strong>"} />
```
## Related

- [`textContent`](textcontent.md)
