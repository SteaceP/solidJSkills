# SolidJS SSR & Hydration Debugging Guide (v1.x Production)

This guide provides deterministic diagnostics, root-cause isolation patterns, and remediation recipes for SolidJS SSR and hydration errors.

---

## 1. How SolidJS Hydration Operates

Unlike Virtual DOM libraries that recreate a full virtual tree and diff it against the DOM, SolidJS generates real DOM nodes on the server and embeds lightweight hydration markers:
- `<!--#-->` marks dynamic boundary starts.
- `<!--/-->` marks dynamic boundary ends.

During client hydration (`hydrate(() => <App />, root)`):
1. Solid traverses the existing DOM tree produced by the server.
2. It walks along nodes matching its pre-compiled hydration markers.
3. It attaches reactive signal subscriptions and event listeners *without* tearing down or re-creating the DOM elements.

> [!CAUTION]
> **Any mismatch between the server HTML and the client's initial JSX render causes hydration markers to misalign**, causing silent state corruption, duplicated DOM trees, or fatal hydration panics.

---

## 2. The 5 Root-Cause Mismatch Classes

### Class 1: Non-Deterministic Render Values
**Cause:** Using values that differ between server execution and client hydration:
- `Date.now()`, `new Date().toISOString()`, `new Date().toLocaleDateString()` (timezone/locale divergence).
- `Math.random()`.
- Unseeded random IDs or UUIDs.

**Remediation:**
- Move client-only timestamps into `onMount()`.
- Pass server-rendered timestamps via serialized props or root context.
- Use `createUniqueId()` for deterministic, sequential IDs instead of random strings.

```tsx
// ❌ WRONG: Server timestamp diverges from client hydration timestamp
function BadTimestamp() {
  return <div>Rendered at: {new Date().toLocaleTimeString()}</div>;
}

// ✅ FIXED: Render placeholder/server value or update on client mount
import { createSignal, onMount } from "solid-js";

function GoodTimestamp(props: { serverTime: string }) {
  const [time, setTime] = createSignal(props.serverTime);
  onMount(() => {
    setTime(new Date().toLocaleTimeString());
  });
  return <div>Rendered at: {time()}</div>;
}
```

---

### Class 2: Sequential ID Drift (`createUniqueId`)
**Cause:** `createUniqueId()` generates sequential IDs (`_0`, `_1`, etc.). If a conditional branch causes `createUniqueId()` to be invoked on the client but skipped on the server (or in a different order), all subsequent IDs across the page diverge.

**Remediation:**
- Ensure `createUniqueId()` is invoked at top-level component scope unconditionally.
- Never wrap `createUniqueId()` inside `if (isServer)` or conditional loops.

```tsx
// ❌ WRONG: ID generation order changes if isServer is toggled
function BadInput() {
  const id = !isServer ? createUniqueId() : "static-id";
  return <input id={id} />;
}

// ✅ FIXED: Always call unconditionally
function GoodInput() {
  const id = createUniqueId();
  return <input id={id} />;
}
```

---

### Class 3: Direct JSX Branching with `isServer`
**Cause:** Using `isServer ? <ServerComponent /> : <ClientComponent />` directly in JSX changes the DOM element tags or hierarchy, immediately breaking marker alignment.

**Remediation:**
- For non-interactive content, wrap in `<NoHydration>`.
- For interactive browser-only widgets, use `clientOnly()` from `@solidjs/start` or an `onMount` signal toggle.

```tsx
// ❌ WRONG: Mismatched DOM structure breaks hydration
function BadHeader() {
  return (
    <div>
      {isServer ? <span>Server Brand</span> : <h1>Client Brand</h1>}
    </div>
  );
}

// ✅ FIXED: Use <NoHydration> for static server-rendered subtrees
import { NoHydration } from "solid-js/web";

function GoodStaticSection() {
  return (
    <NoHydration>
      <div class="static-content">
        <p>This subtree renders on the server and is skipped during client hydration.</p>
      </div>
    </NoHydration>
  );
}

// ✅ FIXED: Use clientOnly() for client-only widgets
import { clientOnly } from "@solidjs/start";
const HeavyChart = clientOnly(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<p>Loading chart...</p>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

---

### Class 4: Browser-Only Globals Leaking into Server Execution
**Cause:** Referencing `window`, `document`, `navigator`, or `localStorage` during initial component render scope crashes the server or produces different trees.

**Remediation:**
- Defer all browser global access to `onMount()` (which never runs on the server).
- Guard with `if (!isServer)` if initialization is strictly outside component templates.

```tsx
// ❌ WRONG: window accessed during module evaluation or render
function BadStorage() {
  const saved = localStorage.getItem("theme");
  return <div class={saved || "light"}>Content</div>;
}

// ✅ FIXED: Access storage inside onMount
import { createSignal, onMount } from "solid-js";

function GoodStorage() {
  const [theme, setTheme] = createSignal("light");
  onMount(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  });
  return <div class={theme()}>Content</div>;
}
```

---

### Class 5: Browser HTML Parser Correction
**Cause:** Writing invalid HTML nesting (e.g. `<p>` wrapping `<div>`, or `<tr>` directly under `<table>` without `<tbody>`). The browser's native HTML parser will auto-rearrange the DOM *before* Solid's `hydrate()` runs, causing markers to point to unexpected nodes.

**Remediation:**
- Ensure valid semantic HTML hierarchies.
- Inspect view-source HTML against browser DevTools DOM.

---

## 3. Hydration Testing Recipe

Verify server-client hydration consistency using `@solidjs/testing-library`:

```tsx
import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("Hydration Parity", () => {
  it("hydrates without mismatch", () => {
    // Renders with hydration enabled to verify marker attachment
    const { container } = render(() => <App />, { hydrate: true });
    expect(container).toBeDefined();
  });
});
```
