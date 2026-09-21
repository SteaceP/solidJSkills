# `<Reveal>` (SolidJS 2.0)

Coordinates the reveal order and loading transitions of multiple child `<Loading>` boundaries.

In SolidJS 2.0, `<Reveal>` replaces the experimental `<SuspenseList>` component from Solid 1.x.

---

## Import

```tsx
import { Reveal } from "solid-js";
```
## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `order` | `"sequential" \| "together" \| "natural"` | `"sequential"` | Controls how child `<Loading>` boundaries are revealed. |
| `collapsed` | `boolean` | `false` | When `true`, suppresses rendering all pending fallbacks simultaneously, showing only the next pending boundary's fallback. |

---

## Reveal Strategies

1. **`"sequential"`**: Child `<Loading>` boundaries reveal in DOM order. Even if item 2 resolves before item 1, item 2 stays hidden until item 1 resolves.
2. **`"together"`**: Waits until all child `<Loading>` boundaries have resolved before revealing any of them simultaneously.
3. **`"natural"`**: Children reveal as soon as each finishes loading, but `<Reveal>` coordinates fallbacks when `collapsed` is true.

---

## Example Usage

```tsx
import { Reveal, Loading, Errored, createMemo } from "solid-js";

function Dashboard() {
  const profile = createMemo(async () => fetchProfile());
  const notifications = createMemo(async () => fetchNotifications());
  const activity = createMemo(async () => fetchActivity());

  return (
    <Reveal order="sequential" collapsed>
      <Loading fallback={<p>Loading profile...</p>}>
        <UserProfile data={profile()} />
      </Loading>

      <Loading fallback={<p>Loading notifications...</p>}>
        <Notifications data={notifications()} />
      </Loading>

      <Loading fallback={<p>Loading activity...</p>}>
        <ActivityFeed data={activity()} />
      </Loading>
    </Reveal>
  );
}
```
---

## Migration from Solid 1.x `<SuspenseList>`

- Replace `<SuspenseList revealOrder="forwards">` with `<Reveal order="sequential">`.
- Replace `<SuspenseList revealOrder="together">` with `<Reveal order="together">`.
- Replace `<SuspenseList tail="collapsed">` with `<Reveal collapsed>`.
- Replace child `<Suspense>` components with `<Loading>` boundaries.
