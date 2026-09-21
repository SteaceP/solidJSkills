# `action` and `createOptimisticStore` (SolidJS 2.0)

Primitives for managing mutations, async side-effects, and optimistic user interfaces.

SolidJS 2.0 introduces native support for mutations through generator-based `action()` functions, coupled with `createOptimisticStore()` for instant local state feedback and `refresh()` for background reconciliation.

---

## Imports

```tsx
import { action, createOptimisticStore, refresh } from "solid-js";
```
---

## 1. The `action` Generator Pattern

Mutations in Solid 2.0 use generator functions (`function*`). The `yield` operator pauses the action while an asynchronous operation is in flight, allowing the reactive engine to track pending states and manage transitions cleanly.

```typescript
import { action, refresh } from "solid-js";

const updateTodo = action(function* (id: string, completed: boolean) {
  // 1. Optimistic updates happen synchronously before the yield
  setTodos(id, "completed", completed);

  // 2. Yield the async network call
  yield api.patchTodo(id, { completed });

  // 3. Revalidate and sync with server data
  refresh(todos);
});
```
---

## 2. `createOptimisticStore`

`createOptimisticStore` maintains both an optimistic local state and the canonical server-reconciled state. While an `action` is running, the UI renders the optimistic value. If the server request fails, the store automatically rolls back to the verified state.

```tsx
import { createOptimisticStore, action, refresh } from "solid-js";

interface Message {
  id: string;
  text: string;
}

function Chat() {
  const [messages, setMessages] = createOptimisticStore<Message[]>(() => api.loadMessages());

  const sendMessage = action(function* (newText: string) {
    const tempId = `temp-${Date.now()}`;
    
    // 1. Optimistic: immediately visible to user
    setMessages((prev) => [...prev, { id: tempId, text: newText }]);

    // 2. Yield network request
    const confirmedMessage = yield api.postMessage({ text: newText });

    // 3. Sync with authoritative server response
    refresh(messages);
  });

  return (
    <div>
      <ul>
        {messages().map((msg) => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>
      <button onClick={() => sendMessage("Hello world")}>Send</button>
    </div>
  );
}
```
---

## 3. `refresh`

`refresh(accessor)` marks an asynchronous computation or store as stale and initiates a background revalidation without clearing the existing DOM or triggering a disruptive fallback.
