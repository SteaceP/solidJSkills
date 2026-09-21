# SolidJS Animation and Transitions

## Key patterns and primitives

| Approach | Primitives / Tools | Best Use Case |
| --- | --- | --- |
| **Element Transitions** | `<Transition name="fade">` (`solid-transition-group`) | Enter and exit animations for single elements inside `<Show>` or dynamic conditions |
| **List Transitions** | `<TransitionGroup name="list">` (`solid-transition-group`) | Animated addition, removal, and reordering of list items in `<For>` |
| **Concurrent Transitions** | `useTransition()`, `startTransition()` | Non-blocking pending states during tab switches, data fetching, or route changes |
| **Spring & Physics Motion** | Motion One (`@motionone/solid`) | Complex gesture-driven animations, spring physics, layout shifts, keyframes |
| **Micro-interactions** | CSS transitions with reactive class/classlist | Hover effects, accordion expands, button state changes |

## Decision rules

1. **DOM Exit Animation**: Solid immediately detaches DOM nodes when conditional branches switch. Wrap conditional nodes in `<Transition>` from `solid-transition-group` so exit animations complete before nodes are unmounted.
2. **Transition CSS Class Lifecycle**: Use the standard class states:
   - Enter: `.name-enter` → `.name-enter-active` → `.name-enter-to`
   - Exit: `.name-exit` → `.name-exit-active` → `.name-exit-to`
3. **No Extra Wrapper Elements**: `<Transition>` does not inject extraneous wrapper `<div>` tags, preserving CSS grid and flex layouts.
4. **JS Animation Hooks**: When integrating Web Animations API or GSAP, use explicit JS lifecycle hooks on `<Transition>` (`onEnter`, `onExit`) with `done` callbacks.
5. **Pending UI with `useTransition`**: When updating state that causes heavy recalculation or asynchronous resource fetching, wrap the setter in `startTransition(() => setTab(next))` and inspect `isPending()` to show non-intrusive loading indicators without destroying active DOM.

## Common pitfalls

- Animating `<Show>` without `<Transition>`: Elements vanish abruptly on exit because Solid tears down unmounted nodes without waiting for CSS animations to finish.
- Forgetting `onExit` callback: When using JavaScript hooks instead of CSS classes, forgetting to invoke the `done()` callback in `onExit` causes elements to remain in the DOM indefinitely.
- Using `<Transition>` for dynamic lists: Use `<TransitionGroup>` instead of `<Transition>` for `<For>` lists; `<Transition>` is only designed for single element toggles.
- Uncoordinated Router Transitions: Placing `<Transition>` inside a route component rather than wrapping the `<Route>` outlet in the router root layout breaks page enter/exit coordination.

## Corpus references

- `solid-core.reference.reactive-utilities.start-transition`
- `solid-core.reference.reactive-utilities.use-transition`
- `solid-core.reference.components.show`
- `solid-core.reference.components.for`
- `solid-core.concepts.control-flow.portal`
