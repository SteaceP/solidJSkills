# Vite Start Mode in Solid 2.0

Solid 2.0 unifies client-side single-page applications and full-stack server-side rendering into a standard Vite architecture termed **Start Mode**.

---

## Retirement of the Standalone Framework

In Solid 1.x, full-stack applications were managed through a separate package ecosystem (`@solidjs/start` and Vinxi).

In Solid 2.0:
- The standalone meta-framework CLI is retired.
- Full-stack capabilities are powered directly by a first-party **Vite plugin**: `start mode`.
- Developers configure their application in a standard `vite.config.ts`, retaining full compatibility with the broader Vite ecosystem (plugins, rollups, and dev servers).

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import solid from "solid-js/vite";

export default defineConfig({
  plugins: [
    solid({
      start: true, // Enables full-stack start mode
    }),
  ],
});
```

---

## "One Graph, Two Machines"

Solid 2.0's full-stack philosophy treats the client and server not as disconnected environments exchanging JSON blobs, but as **two execution nodes of a single reactive graph**.

### Server Functions (`"use server"`)
Define server-executed functions seamlessly inside your application code:

```typescript
// api/todos.ts
"use server";

import db from "~/server/db";

export async function getTodos() {
  return await db.todos.findMany();
}

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title"));
  return await db.todos.create({ data: { title, completed: false } });
}
```

When called from the client, the compiler automatically converts the invocation into a type-safe RPC request. When called on the server during initial SSR, the function executes directly in-process without network overhead.

---

## Streaming and Suspense-free Server Rendering

Because Solid 2.0's reactive graph natively tracks asynchronous dependencies:
1. **Server Stream Pipelining**: When a computation hits an unresolved Promise, the server immediately flushes the surrounding HTML skeleton and streams down the deferred chunks as they resolve.
2. **Resumption Without Re-execution**: During client hydration, the browser attaches directly to the server-emitted HTML without needing to duplicate initial data queries.
