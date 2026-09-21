# SolidJS Code Review & Static Auditing Guide (AGENTS.md Alignment)

This guide documents the systematic inspection criteria for reviewing SolidJS code against official standards and [`AGENTS.md`](file:///c:/mcpserver/solidJSkills/AGENTS.md).

---

## 1. Top Review Heuristics Checklist

### 1.1 Reactivity Preservation (Priority 1)
- [ ] **No Props Destructuring**: Ensure `props` is not destructured in signatures (`function Comp({ a })`) or bodies (`const { b } = props;`). Use `splitProps` or `props.b`.
- [ ] **Signal Accessor Invocation**: Verify signals are called as functions in JSX (`<div>{count()}</div>`, NOT `{count}`).
- [ ] **Derivations vs Effects**: Flag any `createEffect` that calls a signal setter to compute derived state. Replace with `createMemo` or pure functions.
- [ ] **Batching**: Confirm multiple signal writes in event callbacks are wrapped in `batch(() => { ... })` if intermediate renders cause flicker.

### 1.2 Control Flow & Performance (Priority 2)
- [ ] **`<For>` vs `<Index>` Correctness**:
  - `<For>` must be used for object lists with unique IDs (`(item, index) => ...`, where index is a signal).
  - `<Index>` must be used for primitive lists (`(item, index) => ...`, where item is a signal).
- [ ] **No Nested Ternaries in JSX**: Convert multi-branch ternaries to `<Switch>` and `<Match>`.
- [ ] **Children Memoization**: Check if `props.children` is evaluated more than once. If so, enforce `children(() => props.children)`.

### 1.3 SSR & Hydration Safety (Priority 3)
- [ ] **No Browser Globals at Root**: `window`, `document`, and `localStorage` must never be accessed during initial module or component execution. Must be moved to `onMount()`.
- [ ] **Deterministic ID Ordering**: Verify `createUniqueId()` calls are not conditionally skipped.
- [ ] **Valid Semantic HTML**: Check that `<p>` tags do not contain `<div>` tags, and table rows are wrapped in `<tbody>`.

### 1.4 Accessibility (Priority 4)
- [ ] **Semantic Elements**: Check for interactive `<div>` elements missing `role`, `tabIndex`, or keyboard listeners.
- [ ] **ARIA Bindings**: Confirm dynamic states (`aria-expanded`, `aria-busy`) are bound to reactive signals.

---

## 2. Review Severity Matrix

| Severity | Issue Type | Action |
| :--- | :--- | :--- |
| **P0 (Blocker)** | Props destructuring, effect-driven signal loop, server crash on `window` access | Immediate rewrite required before merge |
| **P1 (High)** | Missing `<Suspense>` fallback, `<For>` on primitive arrays without memoization, missing `batch` | Remediate before production deploy |
| **P2 (Medium)** | Nested ternaries in JSX, repeated `props.children` access without helper | Clean up for readability and performance |
| **P3 (Low)** | Code style, minor variable naming | Optional polish |
