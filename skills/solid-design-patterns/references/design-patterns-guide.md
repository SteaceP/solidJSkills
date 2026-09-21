# SolidJS Design Patterns & Architectural Blueprint Guide

This guide details canonical architectural patterns, state ownership topologies, and design tradeoffs for SolidJS applications.

---

## 1. State Topology Decision Matrix

| State Scope | Recommended Primitive | SSR/Hydration Safe? | Primary Tradeoffs |
| :--- | :--- | :--- | :--- |
| **Component Local** | `createSignal`, `createMemo` | Yes | Zero overhead; scoped entirely to component lifecycle. |
| **Nested/Complex Local** | `createStore` | Yes | Fine-grained property mutations; avoid deep clone overhead. |
| **Component Subtree** | `createContext` + `createStore` | Yes | Scoped to subtree; isolated per request in SSR; mocks cleanly in tests. |
| **Application Global (Client-only)** | Module-level `createSignal` / `createStore` | **NO for user data in SSR** | Leaks across HTTP requests on server if storing per-user data. Safe for client-only SPA or static constants. |
| **Server/Universal Global** | Context Provider at Root (`App`) | Yes | Pure dependency injection; guaranteed fresh instance per SSR request. |

> [!WARNING]
> **SSR State Leakage**: In server runtimes (SolidStart, Node, Edge), never store per-user state in module-level `createSignal` or `createStore`. Module singletons persist across requests, causing catastrophic data leaks between different users. Always wrap global state in a `Context` provider mounted at the request root.

---

## 2. Canonical SolidJS Design Patterns

### Pattern 1: Primitive Factory Pattern (Custom Reactivity Primitives)
Encapsulate reactive logic, cleanup, and side effects in reusable functions returning tuples or reactive objects:

```typescript
// Best Practice: Primitives accept accessors or raw values, return reactive getters
import { createSignal, onCleanup, Accessor } from "solid-js";

export function createDebouncedSignal<T>(
  source: Accessor<T>,
  delayMs: number
): Accessor<T> {
  const [debounced, setDebounced] = createSignal<T>(source());

  let timer: ReturnType<typeof setTimeout> | undefined;
  createEffect(() => {
    const value = source();
    clearTimeout(timer);
    timer = setTimeout(() => setDebounced(() => value), delayMs);
  });

  onCleanup(() => clearTimeout(timer));
  return debounced;
}
```

### Pattern 2: Context + Store Provider Pattern
Split state into read-only accessors and intentional actions to prevent unbounded mutations:

```typescript
import { createContext, useContext, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

interface SessionState {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
}

interface SessionContextValue {
  state: SessionState;
  login: (name: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue>();

export function SessionProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<SessionState>({
    user: null,
    isAuthenticated: false,
  });

  const actions: SessionContextValue = {
    state,
    login: (name: string) => {
      setState(
        produce((s) => {
          s.user = { id: crypto.randomUUID(), name };
          s.isAuthenticated = true;
        })
      );
    },
    logout: () => {
      setState({ user: null, isAuthenticated: false });
    },
  };

  return (
    <SessionContext.Provider value={actions}>
      {props.children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
```

### Pattern 3: Compound Components Pattern
Coordinate multiple sub-components without prop drilling:

```typescript
import { createContext, useContext, createSignal, JSX, Show, Accessor } from "solid-js";

interface AccordionContextValue {
  activeId: Accessor<string | null>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue>();

export function Accordion(props: { children: JSX.Element }) {
  const [activeId, setActiveId] = createSignal<string | null>(null);
  const toggle = (id: string) => setActiveId((prev) => (prev === id ? null : id));

  return (
    <AccordionContext.Provider value={{ activeId, toggle }}>
      <div class="accordion">{props.children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem(props: { id: string; title: string; children: JSX.Element }) {
  const ctx = useContext(AccordionContext)!;
  const isOpen = () => ctx.activeId() === props.id;

  return (
    <div class="accordion-item">
      <button onClick={() => ctx.toggle(props.id)} aria-expanded={isOpen()}>
        {props.title}
      </button>
      <Show when={isOpen()}>
        <div class="accordion-content">{props.children}</div>
      </Show>
    </div>
  );
}
```

### Pattern 4: Reactive Event Bus / Signal Hub
When siblings must notify each other across disconnected trees without re-rendering intermediaries:

```typescript
// Fine-grained notification bus without React-style event listeners
import { createSignal } from "solid-js";

type ToastNotification = { id: string; message: string; type: "info" | "error" };

function createNotificationBus() {
  const [notifications, setNotifications] = createSignal<ToastNotification[]>([]);

  const push = (message: string, type: "info" | "error" = "info") => {
    const item: ToastNotification = { id: crypto.randomUUID(), message, type };
    setNotifications((prev) => [...prev, item]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    }, 4000);
  };

  return { notifications, push };
}

export const notificationBus = createNotificationBus();
```

---

## 3. SolidJS v1 vs SolidJS 2.0-rc.9 Architectural Tradeoffs

| Architecture Dimension | SolidJS 1.x Stable | SolidJS 2.0-rc.9 |
| :--- | :--- | :--- |
| **Async Graph** | `createResource` + `<Suspense>` | Native async derived signals (`createMemo(async () => ...)`) + `<Loading>` |
| **List Virtualization/Iteration** | `<For>` (keyed by value) vs `<Index>` (keyed by index) | Unified `<For>` (`keyed={true}` by default, `keyed={false}` replaces `<Index>`) |
| **Dynamic Component Mounting** | `<Dynamic component={comp()} />` | Functional `dynamic(comp, props)` |
| **Complex Domain Models** | `createStore` with `produce()` / `reconcile()` | Reactive classes / field decorators alongside stores |
| **Full-Stack Runtime** | `@solidjs/start` standalone CLI | SolidStart as a standard Vite plugin |

---

## 4. Anti-Patterns to Avoid

1. **Destructuring Props in Pattern Authorship**:
   - Destructuring strips the getter proxy. Always use `props.property` or `splitProps()`.
2. **Effects for Derived Architecture**:
   - Never synchronize two signals via `createEffect` when a `createMemo` expresses the relationship declaratively.
3. **Over-Contexting**:
   - Do not wrap every tiny signal in Context. Solid's reactivity graph is independent of the component tree; signals can be imported as simple JS modules where SSR multi-tenancy is not a concern.
