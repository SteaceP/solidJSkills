# Solid Router: Data APIs & Navigation Guide (v1.x Production)

This guide documents routing, data loading (`query`, `createAsync`), mutations (`action`, `useSubmission`), and cache revalidation in `@solidjs/router` (v0.8+ / v0.14+).

---

## 1. Route Setup & Nested Layouts

Define route hierarchies with `<Router>` and `<Route>`:

```tsx
import { Router, Route } from "@solidjs/router";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";

export default function App() {
  return (
    <Router root={AppLayout}>
      <Route path="/" component={Home} />
      <Route path="/users" component={Users} />
      <Route path="/users/:id" component={UserDetail} />
    </Router>
  );
}
```

Inside layout components, render children using `props.children`:
```tsx
export default function AppLayout(props) {
  return (
    <div class="layout">
      <nav>
        <A href="/" end activeClass="active">Home</A>
        <A href="/users" activeClass="active">Users</A>
      </nav>
      <main>{props.children}</main>
    </div>
  );
}
```

---

## 2. Data Loading with `query` and `createAsync`

The modern data-fetching paradigm in Solid Router replaces `RouteDataFunc` with `query()` + `createAsync()`:

```tsx
// src/data/users.ts
import { query } from "@solidjs/router";

export const fetchUser = query(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("User not found");
  return (await res.json()) as { id: string; name: string; email: string };
}, "users"); // Cache key
```

```tsx
// src/pages/UserDetail.tsx
import { useParams, createAsync } from "@solidjs/router";
import { Suspense, Show } from "solid-js";
import { fetchUser } from "../data/users";

export default function UserDetail() {
  const params = useParams();
  // Reads the query reactively when params.id changes
  const user = createAsync(() => fetchUser(params.id));

  return (
    <Suspense fallback={<p>Loading user profile...</p>}>
      <Show when={user()}>
        {(u) => (
          <div>
            <h1>{u().name}</h1>
            <p>Email: {u().email}</p>
          </div>
        )}
      </Show>
    </Suspense>
  );
}
```

---

## 3. Mutations with `action` and `revalidate`

```tsx
import { action, useSubmission, revalidate } from "@solidjs/router";

// 1. Define action
export const updateUser = action(async (formData: FormData) => {
  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  await api.updateUser(id, { name });
  // 2. Invalidate cache key to trigger re-fetching
  await revalidate("users");
});

// 3. Consume in component
export function EditUserForm(props: { id: string; currentName: string }) {
  const submission = useSubmission(updateUser);

  return (
    <form action={updateUser} method="post">
      <input type="hidden" name="id" value={props.id} />
      <input type="text" name="name" value={props.currentName} />
      
      <button type="submit" disabled={submission.pending}>
        {submission.pending ? "Saving..." : "Save Changes"}
      </button>

      {submission.error && <p class="error">{submission.error.message}</p>}
    </form>
  );
}
```

---

## 4. Programmatic Navigation & Search Params

```tsx
import { useNavigate, useSearchParams } from "@solidjs/router";

function SearchFilter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (category: string) => {
    // Update URL query string: /items?category=books
    setSearchParams({ category });
  };

  const handleDone = () => {
    navigate("/checkout", { replace: true });
  };

  return (
    <div>
      <p>Current category: {searchParams.category || "all"}</p>
      <button onClick={() => handleFilterChange("electronics")}>Electronics</button>
      <button onClick={handleDone}>Proceed</button>
    </div>
  );
}
```
