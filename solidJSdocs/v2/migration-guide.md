# Migration Guide: SolidJS 1.x to SolidJS 2.0-rc.9

This guide outlines the breaking changes, deprecations, and upgrade steps for migrating an existing SolidJS 1.x codebase to **SolidJS 2.0 Release Candidate (`2.0.0-rc.9`)**.

---

## 1. Updating Dependencies

In your `package.json`, update `solid-js` to the 2.0 Release Candidate:

```json
{
  "dependencies": {
    "solid-js": "^2.0.0-rc.9"
  }
}
```

If using Vite, ensure your Vite plugin is upgraded to support the Rust/OXC transform compiler.

---

## 2. List Iteration: `<Index>` to `<For keyed={false}>`

In Solid 2.0, the `<Index>` component has been removed.

### Before (Solid 1.x)
```tsx
import { Index } from "solid-js";

<Index each={items()}>
  {(item, index) => <li>{item()} (Index: {index})</li>}
</Index>
```

### After (Solid 2.0)
```tsx
import { For } from "solid-js";

<For each={items()} keyed={false}>
  {(item, index) => <li>{item()} (Index: {index})</li>}
</For>
```

---

## 3. Async Data: `createResource` to Native Async

`createResource` is deprecated in favor of first-class asynchronous reactivity.

### Before (Solid 1.x)
```tsx
import { createResource, Suspense } from "solid-js";

const [user] = createResource(fetchUser);

<Suspense fallback={<p>Loading...</p>}>
  <h1>{user()?.name}</h1>
</Suspense>
```

### After (Solid 2.0)
```tsx
import { createMemo, Loading, Errored } from "solid-js";

const user = createMemo(async () => fetchUser());

<Loading fallback={<p>Loading...</p>}>
  <Errored fallback={(err) => <p>Error: {err.message}</p>}>
    <h1>{user().name}</h1>
  </Errored>
</Loading>
```

---

## 4. Dynamic Components: `<Dynamic>` to `dynamic()`

The `<Dynamic>` JSX element is replaced by a functional helper.

### Before (Solid 1.x)
```tsx
import { Dynamic } from "solid-js/web";

<Dynamic component={selectedComponent()} propA="value" />
```

### After (Solid 2.0)
```tsx
import { dynamic } from "solid-js";

{dynamic(selectedComponent(), { propA: "value" })}
```

---

## 5. Full-Stack Start Mode Migration

If you are using `@solidjs/start` 1.0 (with Vinxi and `app.config.ts`), migrate your configuration to standard Vite Start Mode:

### Before (Solid 1.x / `app.config.ts`)
```typescript
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({});
```

### After (Solid 2.0 / `vite.config.ts`)
```typescript
import { defineConfig } from "vite";
import solid from "solid-js/vite";

export default defineConfig({
  plugins: [
    solid({
      start: true,
    }),
  ],
});
```

---

## 6. Migration Verification Checklist

- [ ] Replaced all `<Index>` usages with `<For keyed={false}>`.
- [ ] Replaced `<Dynamic>` elements with `dynamic()` function calls.
- [ ] Replaced `createResource` and `<Suspense>` with native async memos and `<Loading>`/`<Errored>`.
- [ ] Validated tests with Vitest and updated test assertions for async reactivity.
- [ ] Verified that SSR builds run without hydration errors using Vite start mode.
