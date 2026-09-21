# Control Flow in Solid 2.0

Solid 2.0 simplifies control flow primitives, providing a unified list iteration model and functional dynamic component rendering.

---

## Unified List Rendering: `<For>`

In Solid 1.x, developers chose between two distinct list components:
- `<For>`: Keyed by item value (element recycled based on object identity).
- `<Index>`: Keyed by array index (DOM node fixed by position, item wrapped in an accessor).

Solid 2.0 unifies both behaviors into a single component: **`<For>`**.

```tsx
import { For } from "solid-js";
```

### 1. Keyed Iteration (`keyed={true}` - Default)

When items have stable, unique identities (such as database IDs or distinct objects), use the default keyed mode:

```tsx
<For each={items()}>
  {(item, index) => (
    <li>
      {item.title} (position: {index()})
    </li>
  )}
</For>
```

- **Behavior**: When the array changes, items are reordered by identity. Existing DOM nodes are moved rather than destroyed and recreated.
- **Arguments**:
  - `item`: The raw item object.
  - `index`: An accessor function `() => number` representing the item's current position in the list.

### 2. Non-Keyed Iteration (`keyed={false}` - Replaces `<Index>`)

When rendering primitive values (strings, numbers) or lists where elements should not move, specify `keyed={false}`:

```tsx
<For each={tags()} keyed={false}>
  {(tag, index) => (
    <span>
      #{tag()} (index: {index})
    </span>
  )}
</For>
```

- **Behavior**: The DOM node is tied to its index position. If the array value at index `i` changes, only that node's contents update.
- **Arguments**:
  - `tag`: An accessor function `() => T` representing the current value at this position.
  - `index`: A fixed primitive `number`.

> [!TIP]
> In Solid 2.0, the `<Index>` component is deprecated and removed. Replace all `<Index each={...}>` occurrences with `<For each={...} keyed={false}>`.

---

## Dynamic Component Mounting: `dynamic()`

In Solid 1.x, dynamic component selection used the `<Dynamic component={...} />` component.

Solid 2.0 replaces `<Dynamic>` with the functional helper **`dynamic()`**:

```tsx
import { dynamic } from "solid-js";
import AdminPanel from "./AdminPanel";
import UserPanel from "./UserPanel";

function Dashboard(props: { role: string }) {
  const panel = () => (props.role === "admin" ? AdminPanel : UserPanel);

  return (
    <main>
      <h1>Dashboard</h1>
      {dynamic(panel(), { title: "Overview" })}
    </main>
  );
}
```

### XML Namespaces Support (`xmlns`)
In Solid 2.0 (`2.0.0-rc.9`), `dynamic()` correctly honors the `xmlns` prop at compile time via the Rust/OXC compiler, enabling seamless dynamic SVG and MathML element rendering.
