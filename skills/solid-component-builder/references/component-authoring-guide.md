# SolidJS Component Authoring Guide (v1.x Production)

This guide covers component architecture, prop helpers (`mergeProps`, `splitProps`), reactive children handling (`children()`), and custom directives in SolidJS 1.x.

---

## 1. Props Contract & Preservation

Solid component props are reactive proxy objects. **Never destructure props directly**:
```tsx
// ❌ BROKEN: Destructuring destroys the reactive proxy
export function Badge({ text, count = 0 }) {
  return <span>{text}: {count}</span>;
}
```

### 1.1 Default Props with `mergeProps`
`mergeProps` defines default values while preserving getter access:

```tsx
import { mergeProps, Component } from "solid-js";

interface ButtonProps {
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  children: any;
}

export const Button: Component<ButtonProps> = (rawProps) => {
  const props = mergeProps({ variant: "primary", disabled: false }, rawProps);

  return (
    <button class={`btn btn-${props.variant}`} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  );
};
```

### 1.2 Splitting Props with `splitProps`
Separate local component props from HTML element attributes to forward:

```tsx
import { splitProps, JSX } from "solid-js";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextInput(props: InputProps) {
  // 1st array: keys for local consumption
  // 2nd object: all remaining HTML attributes to forward to <input>
  const [local, others] = splitProps(props, ["label", "error", "class"]);

  return (
    <div class={`form-group ${local.class || ""}`}>
      <label>{local.label}</label>
      <input {...others} class={local.error ? "has-error" : ""} />
      {local.error && <span class="error-msg">{local.error}</span>}
    </div>
  );
}
```

---

## 2. Handling Reactive Children (`children()`)

If you read `props.children` multiple times in JSX or inside logic, Solid will re-evaluate or duplicate the child DOM nodes. Wrap `props.children` with the `children()` helper:

```tsx
import { children, JSX } from "solid-js";

export function FancyCard(props: { header?: JSX.Element; children: JSX.Element }) {
  // Memoizes the resolved children DOM nodes
  const resolved = children(() => props.children);

  return (
    <div class="card">
      {props.header && <header>{props.header}</header>}
      <main>{resolved()}</main>
      <footer>Item count: {Array.isArray(resolved()) ? (resolved() as any[]).length : 1}</footer>
    </div>
  );
}
```

---

## 3. Directives (`use:*`)

Directives let you attach reusable behavior to DOM elements at creation time:

```tsx
// src/directives/clickOutside.ts
import { onCleanup } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties {
      clickOutside: (e: MouseEvent) => void;
    }
  }
}

export function clickOutside(el: HTMLElement, accessor: () => (e: MouseEvent) => void) {
  const onClick = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) {
      accessor()?.(e);
    }
  };
  document.addEventListener("click", onClick);
  onCleanup(() => document.removeEventListener("click", onClick));
}

// Usage in JSX:
// <div use:clickOutside={() => closeDropdown()} />
```
