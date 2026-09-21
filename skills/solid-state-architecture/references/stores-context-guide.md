# SolidJS State Architecture: Stores & Context Guide (v1.x Production)

This guide documents state management architecture in SolidJS 1.x, covering fine-grained stores (`createStore`), mutation patterns, and Context API composition.

---

## 1. Signals vs Stores: Architecture Decision

| Aspect | `createSignal` | `createStore` |
| :--- | :--- | :--- |
| **Data Shape** | Primitives, flat records, individual items | Deeply nested objects, collections, normalized entity tables |
| **Granularity** | Coarse: changing any field invalidates the whole signal | Fine-grained: individual property access is tracked independently |
| **Updating** | Full replacement `setSignal(newVal)` | Path-based fine-grained mutations `setStore("users", 0, "name", "Jane")` |
| **Performance** | Ideal for simple flags, counters, search inputs | Ideal for complex models, forms, application cache |

---

## 2. Store Creation & Mutation Syntax

```tsx
import { createStore, produce, reconcile } from "solid-js/store";

interface AppState {
  user: { name: string; preferences: { theme: string } };
  todos: { id: number; text: string; done: boolean }[];
}

const [state, setState] = createStore<AppState>({
  user: { name: "Alice", preferences: { theme: "dark" } },
  todos: [{ id: 1, text: "Ship Solid v2", done: false }]
});

// 1. Path-based update (targeted, zero clone overhead):
setState("user", "preferences", "theme", "light");

// 2. Functional update over array items matching a predicate:
setState("todos", (todo) => todo.id === 1, "done", true);

// 3. Immer-style mutations using `produce`:
setState("todos", produce((draft) => {
  draft.push({ id: 2, text: "Celebrate", done: false });
}));

// 4. Server-data diffing using `reconcile` (prevents unnecessary re-renders):
const newTodosFromServer = [...];
setState("todos", reconcile(newTodosFromServer, { key: "id" }));
```

---

## 3. Context API & Custom Hooks Pattern

To prevent prop-drilling without sacrificing fine-grained reactivity, wrap store creation in a dedicated Context Provider:

```tsx
// src/context/UserContext.tsx
import { createContext, useContext, JSX } from "solid-js";
import { createStore } from "solid-js/store";

interface UserContextValue {
  user: { name: string; loggedIn: boolean };
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue>();

export function UserProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore({
    name: "Guest",
    loggedIn: false
  });

  const value: UserContextValue = {
    user: state,
    login: (name) => setState({ name, loggedIn: true }),
    logout: () => setState({ name: "Guest", loggedIn: false })
  };

  return (
    <UserContext.Provider value={value}>
      {props.children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a <UserProvider>");
  }
  return context;
}
```

> [!TIP]
> Always expose custom hooks (`useUser()`) that throw helpful errors when consumed outside their Provider to make failures immediate and diagnostic.
