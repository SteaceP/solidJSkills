# SolidJS Animation & Transitions Guide (`solid-transition-group`)

This guide documents CSS transitions, FLIP list animations, and enter/exit transition orchestration in SolidJS 1.x using `solid-transition-group`.

---

## 1. Single Element Transitions (`<Transition>`)

Wrap conditional elements in `<Transition>` from `solid-transition-group`:

```tsx
import { createSignal, Show } from "solid-js";
import { Transition } from "solid-transition-group";

function FadeBox() {
  const [show, setShow] = createSignal(true);

  return (
    <div>
      <button onClick={() => setShow(!show())}>Toggle</button>
      
      <Transition name="fade">
        <Show when={show()}>
          <div class="box">Fading Content</div>
        </Show>
      </Transition>
    </div>
  );
}
```

```css
/* CSS Transition classes automatically applied by <Transition name="fade"> */
.fade-enter-active,
.fade-exit-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-exit-to {
  opacity: 0;
}
```

---

## 2. List Animations (`<TransitionGroup>`)

When animating items entering, exiting, or reordering inside a list:

```tsx
import { For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";

function AnimatedList(props: { items: { id: string; text: string }[] }) {
  return (
    <ul>
      <TransitionGroup name="slide">
        <For each={props.items}>
          {(item) => (
            <li class="list-item">{item.text}</li>
          )}
        </For>
      </TransitionGroup>
    </ul>
  );
}
```

```css
.slide-enter-active,
.slide-exit-active {
  transition: all 0.3s ease;
}

.slide-enter {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-exit-to {
  opacity: 0;
  transform: translateX(20px);
}

/* FLIP animation for remaining elements shifting position */
.slide-move {
  transition: transform 0.3s ease;
}
```

---

## 3. JavaScript Hook Animations

For GSAP, Web Animations API (WAAPI), or Motion One, use JS hooks:

```tsx
<Transition
  onEnter={(el, done) => {
    const a = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    a.finished.then(done);
  }}
  onExit={(el, done) => {
    const a = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
    a.finished.then(done);
  }}
>
  <Show when={isOpen()}>
    <div class="modal">Content</div>
  </Show>
</Transition>
```
