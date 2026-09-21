# SolidJS Accessibility (a11y) Guide & Headless UI Patterns (v1.x Production)

This guide documents accessibility standards, ARIA pattern implementation, and headless UI primitive integration (`@kobalte/core`, Corvu) in SolidJS 1.x.

---

## 1. Core Accessibility Requirements in SolidJS

1. **Semantic HTML First**: Always prefer native semantic elements (`<button>`, `<dialog>`, `<nav>`, `<main>`, `<input>`) over generic `<div>` with click handlers.
2. **Focus Management**: Explicitly restore focus to trigger elements when closing modals, drawers, or dropdown menus.
3. **Keyboard Navigation**: Ensure custom interactive widgets support `Enter`, `Space`, `ArrowUp`, `ArrowDown`, `Home`, `End`, and `Escape`.
4. **Live Regions & Announcements**: Announce dynamic route transitions and asynchronous operations via `aria-live="polite"`.

---

## 2. Headless Accessible Components (`@kobalte/core`)

For complex interactive primitives (Dialogs, Dropdowns, Tabs, Tooltips, Accordions), use `@kobalte/core` (the leading accessible component library for SolidJS):

```tsx
import { Dialog } from "@kobalte/core/dialog";

export function AccessibleModal(props) {
  return (
    <Dialog>
      <Dialog.Trigger class="dialog-trigger">Open Modal</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="dialog-overlay" />
        <div class="dialog-positioner">
          <Dialog.Content class="dialog-content">
            <Dialog.Title class="dialog-title">Edit Profile</Dialog.Title>
            <Dialog.Description class="dialog-description">
              Make changes to your profile here. Click save when done.
            </Dialog.Description>
            <Dialog.CloseButton aria-label="Close">✕</Dialog.CloseButton>
            {props.children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
```
*Benefits: Automatically handles focus trapping, scroll locking, ARIA labeling, and keyboard Escape dismissal.*

---

## 3. Screen Reader Live Announcements

Announce dynamic updates in single-page apps:

```tsx
import { createSignal } from "solid-js";

export function RouteAnnouncer(props: { message: () => string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {props.message()}
    </div>
  );
}
```

```css
/* Screen-reader-only utility class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
