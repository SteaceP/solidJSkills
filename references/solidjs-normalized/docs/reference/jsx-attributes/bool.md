# Bool

`bool:*` controls whether an attribute is present on an element.

:::note[Strong-Typing Custom Boolean Attributes]
Type definitions are required when using TypeScript.
See the [TypeScript](../../configuration/typescript.md#forcing-properties-and-custom-attributes) page for examples.
:::

## Syntax

```tsx
<my-element bool:status={value} />
```
## Value

- **Type:** any truthy or falsy value

Any JavaScript value is coerced by truthiness.

## Behavior

- `bool:name={value}` writes `name=""` when `value` is truthy.
- `bool:name={value}` removes `name` when `value` is falsy.
- SSR output follows the same presence-or-absence behavior.

## Examples

### Basic usage

```tsx
<my-element bool:status={props.value} />
```
### Resulting markup

```tsx
// props.value is truthy
<my-element status />

// props.value is falsy
<my-element />
```
## Related

- [`attr:*`](attr.md)
