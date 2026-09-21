# SolidJS Accessibility and Headless UI

## Key patterns and primitives

| Approach | Primitives / Tools | Best Use Case |
| --- | --- | --- |
| **Complete Headless Primitives** | Kobalte (`@kobalte/core`) | Full accessible design systems (Dialog, Dropdown, Combobox, Tabs, Accordion) |
| **Composable A11y Utilities** | Corvu (`corvu`) | Standalone utilities (`createFocusTrap`, `createPreventScroll`, `createPresence`) |
| **Hydration-Safe Element IDs** | `createUniqueId()` (Solid Core) | Unique `id`, `aria-labelledby`, and `aria-describedby` associations |
| **Overlay Portals** | `<Portal mount={...}>` (Solid Core) | Rendering accessible dialogs and popovers outside normal DOM tree flow |
| **Reactive ARIA Attributes** | JSX bindings (`aria-expanded={isOpen()}`) | Dynamic state reflection without manual DOM manipulation |

## Decision rules

1. **Headless Library Selection**:
   - Use **Kobalte** when building comprehensive design systems, component libraries, or "copy-paste" component architectures (similar to shadcn/ui).
   - Use **Corvu** when needing isolated, unopinionated utilities (e.g. standalone focus traps, scroll prevention) or specialized primitives with deep SSR optimization.
2. **Deterministic IDs**: Always generate IDs for form inputs and ARIA descriptors with `createUniqueId()`. Never use hardcoded strings or random `Math.random()` numbers, which cause SSR hydration mismatches.
3. **Focus Trapping & Restoration**: Modal dialogs must trap keyboard tab focus within the modal container while open and restore focus to the originating trigger element upon dismissal.
4. **Reactive ARIA Binding**: Bind ARIA attributes directly to reactive signals/memos (e.g., `aria-expanded={isOpen()}`, `aria-hidden={!isOpen()}`). Solid compiles these directly into DOM attribute updates.
5. **Keyboard Navigation**: Interactive lists (menus, dropdowns, tablists) must implement standard keyboard behaviors (Arrow keys, Home, End, Escape, Enter, Space) following WAI-ARIA Authoring Practices.

## Common pitfalls

- Hardcoded element IDs: Using static IDs causes ID collisions when components repeat and hydration mismatches between server and client renders.
- Focus loss on close: Closing a modal without explicitly returning focus to the trigger element leaves keyboard and screen reader users lost at the top of the body document.
- Unlabeled interactive elements: Icon buttons and custom inputs missing `aria-label`, `aria-labelledby`, or text content.
- Using `div` with click handlers: Using non-semantic elements without `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers prevents keyboard users from activating elements.

## Corpus references

- `solid-core.reference.component-apis.create-unique-id`
- `solid-core.reference.components.portal`
- `solid-core.reference.component-apis.children`
- `solid-core.reference.jsx-attributes.ref`
- `solid-core.concepts.refs`
