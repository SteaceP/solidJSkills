# For

A control flow component for iterating over arrays in Solid 2.0.

In Solid 2.0, `<For>` unifies both keyed and non-keyed list iteration modes, replacing the legacy `<Index>` primitive.

## Import

```typescript
import { For } from "solid-js";
```

## Type Signature

```typescript
function For<T, U extends JSX.Element>(props: {
  each: readonly T[] | undefined | null | false;
  fallback?: JSX.Element;
  keyed?: true;
  children: (item: T, index: Accessor<number>) => U;
}): JSX.Element;

function For<T, U extends JSX.Element>(props: {
  each: readonly T[] | undefined | null | false;
  fallback?: JSX.Element;
  keyed: false;
  children: (item: Accessor<T>, index: number) => U;
}): JSX.Element;
```

## Props

### `each`
- **Type:** `readonly T[] | undefined | null | false`
- The list of items to render.

### `fallback`
- **Type:** `JSX.Element`
- Optional content rendered when the `each` list is empty or falsy.

### `keyed`
- **Type:** `boolean`
- **Default:** `true`
- When `true` (default), iteration is keyed by item identity. Existing DOM nodes are preserved and moved when elements reorder. The children callback receives `(item: T, index: Accessor<number>)`.
- When `false`, iteration is fixed by array index (replaces `<Index>`). DOM nodes stay in position, and individual items update their content. The children callback receives `(item: Accessor<T>, index: number)`.

## Examples

### Keyed List (Default)

```tsx
import { For } from "solid-js";

interface Todo {
  id: string;
  text: string;
}

function TodoList(props: { todos: Todo[] }) {
  return (
    <ul>
      <For each={props.todos} fallback={<li>No todos yet!</li>}>
        {(todo, index) => (
          <li>
            #{index()} - {todo.text}
          </li>
        )}
      </For>
    </ul>
  );
}
```

### Non-Keyed List (`keyed={false}`)

```tsx
import { For } from "solid-js";

function ColorTags(props: { tags: string[] }) {
  return (
    <div class="tags">
      <For each={props.tags} keyed={false}>
        {(tag, index) => (
          <span class="tag">
            Tag {index}: {tag()}
          </span>
        )}
      </For>
    </div>
  );
}
```
