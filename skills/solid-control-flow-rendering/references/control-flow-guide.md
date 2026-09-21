# SolidJS Control Flow & Rendering Primitives Guide (v1.x Production)

SolidJS replaces virtual DOM diffing with dedicated, fine-grained control flow components that manage DOM nodes directly without recreating entire element trees.

---

## 1. `<For>` vs `<Index>`: The Crucial Difference

| Feature | `<For>` | `<Index>` |
| :--- | :--- | :--- |
| **Best Used For** | Lists of **Objects** with persistent identity (IDs, models) | Lists of **Primitives** (strings, numbers, booleans) or fixed-length slots |
| **Callback Signature** | `(item, indexSignal) => JSX` | `(itemSignal, indexValue) => JSX` |
| **Item Argument** | Raw object value (referentially stable) | Reactive accessor `item()` (signal) |
| **Index Argument** | Reactive accessor `index()` (signal) | Raw number value `0, 1, 2...` |
| **DOM Behavior on Reorder** | Moves existing DOM nodes; updates index signal | Reuses DOM nodes in place; updates item signals |

### Example: `<For>` for Objects
```tsx
import { For } from "solid-js";

interface Todo {
  id: string;
  text: string;
}

function TodoList(props: { todos: Todo[] }) {
  return (
    <ul>
      <For each={props.todos} fallback={<li>No tasks found.</li>}>
        {(todo, index) => (
          <li>
            #{index() + 1}: {todo.text} (ID: {todo.id})
          </li>
        )}
      </For>
    </ul>
  );
}
```

### Example: `<Index>` for Primitives
```tsx
import { Index } from "solid-js";

function TagList(props: { tags: string[] }) {
  return (
    <div class="tags">
      <Index each={props.tags} fallback={<p>No tags.</p>}>
        {(tag, i) => (
          <span class="badge">
            [{i}] {tag()}
          </span>
        )}
      </Index>
    </div>
  );
}
```

> [!NOTE]
> **SolidJS 2.0-rc Note**: In Solid 2.0-rc.9, `<Index>` has been replaced by `<For keyed={false}>`.

---

## 2. Conditional Rendering: `<Show>` and `<Switch>` / `<Match>`

### `<Show>`
Replaces ternary operators in JSX to avoid recreating DOM when the condition toggles:

```tsx
import { Show } from "solid-js";

function UserProfile(props: { user?: { name: string } }) {
  return (
    <Show
      when={props.user}
      fallback={<button onClick={login}>Log In</button>}
    >
      {(user) => <h1>Welcome back, {user().name}!</h1>}
    </Show>
  );
}
```
*(Notice the keyed function child pattern: `{(user) => ...}` passes the non-null typed accessor).*

### `<Switch>` and `<Match>`
Replaces complex nested ternary operators (`a ? x : b ? y : z`):

```tsx
import { Switch, Match } from "solid-js";

function StatusBadge(props: { status: "idle" | "loading" | "success" | "error" }) {
  return (
    <Switch fallback={<span class="badge">Unknown</span>}>
      <Match when={props.status === "idle"}><span class="badge gray">Idle</span></Match>
      <Match when={props.status === "loading"}><span class="badge blue">Loading...</span></Match>
      <Match when={props.status === "success"}><span class="badge green">Success!</span></Match>
      <Match when={props.status === "error"}><span class="badge red">Error</span></Match>
    </Switch>
  );
}
```

---

## 3. Dynamic & Boundary Primitives

- `<Portal mount={document.body}>`: Teleports modal, tooltip, or dropdown DOM outside the parent layout without losing context.
- `<Dynamic component={tag}>`: Renders dynamic HTML tags or component constructors.
- `<Suspense fallback={<Spinner />}>`: Coordinates async resources and keeps previous content visible until transition completes.
