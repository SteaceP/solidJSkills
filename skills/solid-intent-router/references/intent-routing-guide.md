# SolidJS Intent Routing & Macro/Subskill Dispatch Guide

This guide documents the deterministic decision trees used to route coding prompts to the appropriate SolidJS macro skills, domain subskills, and reference documentation.

---

## 1. Primary Macro Skill Classification

Every request maps to exactly one primary macro skill:

| User Intent / Keywords | Primary Macro Skill | Output Format |
| :--- | :--- | :--- |
| "build", "create", "implement", "new component", "UI feature" | `solid-component-builder` | Component plan, skeleton, acceptance checklist |
| "refactor", "migrate", "convert React to Solid", "upgrade to v2" | `solid-refactor-assistant` | Ordered refactor plan, regression checklist |
| "review", "audit", "find bugs", "check PR", "code quality" | `solid-reviewer` | Severity-ordered findings with fixes |
| "scaffold", "bootstrap", "init project", "template", "setup" | `solid-scaffold-bootstrap` | Project layout, tooling choices, setup commands |
| "pattern", "architecture", "tradeoff", "anti-pattern", "design" | `solid-design-patterns` | Architectural decision record, tradeoffs |

---

## 2. Secondary Domain Subskill Precedence

When a prompt contains specialized domain requirements, route to the highest-priority matching subskill:

1. **Hydration / SSR Issues** ("hydration error", "SSR mismatch", "isServer", "window is not defined"):
   -> `solid-ssr-hydration-debugger`
2. **Server Runtime & RPC** ("SolidStart", "use server", "middleware", "entry-server", "getRequestEvent"):
   -> `solid-start-server-runtime`
3. **Routing & Navigation** ("routes", "params", "createAsync", "query", "action", "useNavigate"):
   -> `solid-router-data-navigation`
4. **Form Handling & Validation** ("form", "Zod", "Valibot", "inputs", "validation", "submit"):
   -> `solid-forms-validation`
5. **Accessibility & Headless UI** ("a11y", "ARIA", "Kobalte", "focus", "screen reader", "modal"):
   -> `solid-accessibility-a11y`
6. **Animations & Transitions** ("animation", "transition", "TransitionGroup", "CSS classes"):
   -> `solid-animation-transitions`
7. **Head & Metadata** ("meta tags", "title", "SEO", "MetaProvider", "OpenGraph"):
   -> `solid-meta-head-management`
8. **Testing & CI Gates** ("test", "vitest", "testing-library", "quality gate", "createRoot test"):
   -> `solid-testing-quality-gates`
9. **State & Stores** ("store", "createStore", "Context", "produce", "reconcile"):
   -> `solid-state-architecture`
10. **Core Reactivity** ("signal", "memo", "effect", "batch", "untrack", "reactivity"):
    -> `solid-reactivity-core-expert`
