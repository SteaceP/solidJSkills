# Solid Primitives Ecosystem Guide (`@solid-primitives/*`)

The `@solid-primitives` project is the official high-quality collection of reactive utility primitives for SolidJS applications.

---

## 1. Top Recommended Primitives

| Package | Purpose | Common Use Case |
| :--- | :--- | :--- |
| `@solid-primitives/event-listener` | Reactive window/DOM event attachment | `createEventListener(window, "keydown", handleKey)` |
| `@solid-primitives/storage` | Reactive LocalStorage / SessionStorage | `makePersisted(createSignal("dark"))` |
| `@solid-primitives/scheduled` | Debounce & throttle reactive computations | Debouncing search inputs: `debounce((v) => fetchResults(v), 300)` |
| `@solid-primitives/props` | Combine, filter, and chain component props | Merging event handlers, combining class names and styles |
| `@solid-primitives/keyed` | Keyed collections & map abstractions | Keyed array rendering and mapping |
| `@solid-primitives/resize-observer` | Observe DOM element dimensions | Dynamic responsive layouts and canvas resizing |

---

## 2. Practical Implementation Patterns

### 2.1 Auto-Cleaning Event Listeners
Automatically removes event listeners when the calling reactive owner is disposed:

```tsx
import { createEventListener } from "@solid-primitives/event-listener";

function ShortcutListener() {
  createEventListener(window, "keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  return <div>Press ESC to close</div>;
}
```

### 2.2 Debounced Search Input
```tsx
import { createSignal } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";

function SearchBox() {
  const [query, setQuery] = createSignal("");
  const triggerSearch = debounce((text: string) => {
    fetchSearchResults(text);
  }, 300);

  return (
    <input
      type="text"
      onInput={(e) => {
        setQuery(e.currentTarget.value);
        triggerSearch(e.currentTarget.value);
      }}
      placeholder="Search..."
    />
  );
}
```

### 2.3 Persisted State with Storage
```tsx
import { createSignal } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";

// Automatically syncs state to LocalStorage under "app_theme"
const [theme, setTheme] = makePersisted(createSignal("light"), {
  name: "app_theme"
});
```
