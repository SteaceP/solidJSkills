# On

`on*` attaches an event handler using Solid's delegated event system when the event is supported.

## Syntax

```tsx
<div onClick={handler} />
```
## Value

- **Type:** event handler function or `[handler, data]`

Event handler, or a handler/data pair for delegated binding.

## Behavior

- Events in Solid's delegated event set use document-level delegation; other `on*` handlers attach directly to the element.
- Event names are mapped to lower case, so `onClick` listens to `click`.
- The two-element array form passes the first item as bound data to the handler.
- Delegated bindings are not reactive and are not rebound automatically when the handler reference changes.
- `onInput` uses the native input event, and `onChange` uses the native change event.
- For direct element listeners, custom event casing, or listener options, use [`on:*`](on.md).

## Examples

### Basic usage

```tsx
<div onClick={(e) => console.log(e.currentTarget)} />
```
### Handler and bound data

```tsx
function handler(itemId, e) {
	console.log(itemId, e);
}

<For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>;
```
## Related

- [`on:*`](on.md)
