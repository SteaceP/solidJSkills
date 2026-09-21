# SolidJS Forms & Validation Guide (v1.x Production)

This guide documents controlled vs uncontrolled forms, action-driven form submissions, and schema validation in SolidJS 1.x.

---

## 1. Controlled vs Uncontrolled Inputs

### 1.1 Uncontrolled Inputs (High Performance Default)
In SolidJS, uncontrolled inputs use native DOM state without triggering component re-renders:

```tsx
function SimpleForm() {
  let nameInput!: HTMLInputElement;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    console.log("Submitted name:", nameInput.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameInput} type="text" placeholder="Your name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 1.2 Controlled Inputs (When Instant Reactive Feedback is Required)
Bind the `value` attribute to a signal and listen to `onInput`:

```tsx
import { createSignal } from "solid-js";

function ControlledSearch() {
  const [query, setQuery] = createSignal("");

  return (
    <div>
      <input
        type="text"
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
      />
      <p>Search preview: {query()}</p>
    </div>
  );
}
```

---

## 2. Action-Driven Forms (`@solidjs/router`)

Use Solid Router's `<Form>` and `action()` for declarative progressive enhancement:

```tsx
import { action, useSubmission } from "@solidjs/router";

const submitReview = action(async (formData: FormData) => {
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment"));
  await saveReview({ rating, comment });
});

function ReviewForm() {
  const submission = useSubmission(submitReview);

  return (
    <form action={submitReview} method="post">
      <label>Rating: <input type="number" name="rating" min="1" max="5" required /></label>
      <label>Comment: <textarea name="comment" required /></label>
      
      <button type="submit" disabled={submission.pending}>
        {submission.pending ? "Submitting..." : "Submit Review"}
      </button>

      {submission.error && <p class="error">{submission.error.message}</p>}
    </form>
  );
}
```

---

## 3. Schema Validation Integration (Zod / Valibot)

Integrate schema validation with reactive form stores:

```tsx
import { createStore } from "solid-js/store";
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export function LoginForm() {
  const [form, setForm] = createStore({ email: "", password: "" });
  const [errors, setErrors] = createStore<Record<string, string>>({});

  const validate = () => {
    const result = UserSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (validate()) {
      login(form);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={form.email}
        onInput={(e) => setForm("email", e.currentTarget.value)}
      />
      {errors.email && <span class="error">{errors.email}</span>}

      <input
        type="password"
        value={form.password}
        onInput={(e) => setForm("password", e.currentTarget.value)}
      />
      {errors.password && <span class="error">{errors.password}</span>}

      <button type="submit">Sign In</button>
    </form>
  );
}
```
