# dynamic

A functional helper in Solid 2.0 for dynamically instantiating components or HTML/SVG elements based on reactive state.

In Solid 2.0, `dynamic()` replaces the legacy `<Dynamic>` JSX component from `solid-js/web`, offering improved compiler performance and automatic build-time XML namespace resolution.

## Import

```typescript
import { dynamic } from "solid-js";
```

## Type Signature

```typescript
function dynamic<T extends keyof JSX.IntrinsicElements | Component<any>>(
  component: T | undefined | null,
  props?: T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : ComponentProps<T>
): JSX.Element;
```

## Parameters

### `component`
- **Type:** `Component<P> | string | undefined | null`
- A component function or a native HTML/SVG tag name (e.g., `"div"`, `"circle"`, `"button"`).

### `props`
- **Type:** `object`
- The props object to forward to the dynamically instantiated component or element.

## XML Namespace Handling (`xmlns`)

In Solid 2.0 (`2.0.0-rc.9`), `dynamic()` resolves XML namespaces at build time using `@solidjs/oxc-transform`:
- When passing SVG tags (e.g. `"path"`, `"svg"`, `"rect"`), the compiler automatically injects the appropriate SVG namespace (`http://www.w3.org/2000/svg`).
- Custom `xmlns` attributes on the props object are preserved and correctly configured without runtime DOM namespace mismatches.

## Examples

### Switching Between Components

```tsx
import { dynamic, createSignal } from "solid-js";

function TabA() {
  return <div>Tab A Contents</div>;
}

function TabB() {
  return <div>Tab B Contents</div>;
}

function Tabs() {
  const [selected, setSelected] = createSignal<"a" | "b">("a");
  const currentTab = () => (selected() === "a" ? TabA : TabB);

  return (
    <div>
      <nav>
        <button onClick={() => setSelected("a")}>A</button>
        <button onClick={() => setSelected("b")}>B</button>
      </nav>
      <section>{dynamic(currentTab(), {})}</section>
    </div>
  );
}
```

### Dynamic SVG Rendering

```tsx
import { dynamic } from "solid-js";

function DynamicIcon(props: { tag: "circle" | "rect"; fill: string }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {dynamic(props.tag, {
        cx: 50,
        cy: 50,
        r: 40,
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        fill: props.fill,
      })}
    </svg>
  );
}
```
