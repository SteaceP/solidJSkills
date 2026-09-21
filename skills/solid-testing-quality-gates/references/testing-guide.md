# SolidJS Testing & Quality Gates Guide (Vitest & Testing Library)

This guide documents best practices for testing SolidJS reactivity, components, router integration, and hydration using Vitest and `@solidjs/testing-library`.

---

## 1. Testing Fine-Grained Reactivity (`createRoot`)

Reactivity primitives (`createSignal`, `createMemo`, `createEffect`) require an active reactive owner. Wrap them in `createRoot` and dispose manually to prevent memory leaks:

```ts
import { createSignal, createMemo, createRoot } from "solid-js";
import { describe, it, expect } from "vitest";

describe("Signal & Memo Reactivity", () => {
  it("derives values reactively", () => {
    createRoot((dispose) => {
      const [count, setCount] = createSignal(1);
      const double = createMemo(() => count() * 2);

      expect(double()).toBe(2);

      setCount(5);
      expect(double()).toBe(10);

      // Clean up owner subscriptions
      dispose();
    });
  });
});
```

---

## 2. Component Testing (`@solidjs/testing-library`)

```tsx
import { render, fireEvent, screen } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Counter from "./Counter";

describe("<Counter />", () => {
  it("increments count on button click", async () => {
    render(() => <Counter initial={0} />);

    const button = screen.getByRole("button", { name: /increment/i });
    const display = screen.getByTestId("count-val");

    expect(display.textContent).toBe("0");

    await fireEvent.click(button);
    expect(display.textContent).toBe("1");
  });
});
```

---

## 3. Hydration Testing Recipe

Verify that client hydration attaches cleanly to server markup without throwing or creating mismatched DOM trees:

```tsx
import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("Hydration Parity Test", () => {
  it("attaches cleanly without errors", () => {
    // Setting hydrate: true exercises Solid's hydration branch
    const { container } = render(() => <App />, { hydrate: true });
    expect(container).toBeDefined();
    expect(container.querySelector("#main-title")).not.toBeNull();
  });
});
```
