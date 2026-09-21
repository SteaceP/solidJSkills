# SolidStart 1.0 Server Runtime Architecture Guide (v1.x Production)

This guide documents the runtime architecture, request lifecycles, and server boundaries in SolidStart 1.0 (built on Vinxi/Nitro).

---

## 1. Core Entrypoints

A production SolidStart 1.0 application relies on four primary entrypoints:

```text
src/
├── app.config.ts        # Vinxi & Nitro bundler configuration
├── app.tsx              # Root component tree & global providers
├── entry-client.tsx     # Client-side hydration mount
└── entry-server.tsx     # Server-side request handler
```

### `entry-client.tsx`
Mounts the client-side app to the server-rendered DOM:
```tsx
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
```

### `entry-server.tsx`
Handles incoming HTTP requests, wraps request events, and streams the HTML response:
```tsx
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
```

---

## 2. Server Functions (`"use server"`)

Server functions provide end-to-end type-safe RPC from client components to the backend.

```tsx
// src/lib/api.ts
import { getRequestEvent } from "solid-js/web";

export async function getUser(id: string) {
  "use server";
  const event = getRequestEvent();
  const sessionToken = event?.request.headers.get("Authorization");

  if (!sessionToken) {
    throw new Error("Unauthorized");
  }

  return await db.user.findUnique({ where: { id } });
}
```

### Key Server Function Rules
1. **Scope**: Place `"use server"` at the very top of a function or at the top of a file.
2. **Arguments & Return Values**: All arguments and return values must be serializable (JSON or FormData).
3. **Context**: Access the current HTTP request via `getRequestEvent()`.

---

## 3. Middleware Composition

Middleware runs sequentially before route rendering:

```tsx
// src/middleware.ts
import { createMiddleware } from "@solidjs/start/server";

export default createMiddleware({
  onRequest: [
    async (event) => {
      // 1. Authenticate or inspect headers
      event.locals.userId = await verifySession(event.request);
    },
    async (event) => {
      // 2. Logging or header injection
      console.log(`[${event.request.method}] ${event.request.url}`);
    }
  ]
});
```

---

## 4. SolidJS 2.0 Evolution Note

In SolidJS 2.0-rc, the standalone `@solidjs/start` package is being retired in favor of an integrated "start mode" provided directly by `@solidjs/vite-plugin`. Core server function concepts (`"use server"`) and `getRequestEvent()` remain consistent conceptually.
