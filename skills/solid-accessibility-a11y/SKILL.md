---
name: solid-accessibility-a11y
description: "Architect accessible SolidJS interfaces using Kobalte, Corvu, WAI-ARIA authoring practices, and focus management."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: domain-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs/accessibility-a11y.md
  - ../../references/solidjs/reactivity-core.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-accessibility-a11y
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-accessibility-a11y

## Trigger

Use when designing, implementing, or auditing accessible UI components in SolidJS, including headless primitives (Kobalte, Corvu), keyboard navigation, focus trapping, screen reader announcements, and WAI-ARIA compliance.

## Required Inputs

- Target component pattern (e.g. Dialog, DropdownMenu, Combobox, Tabs, Accordion, Tooltip).
- Design system integration approach (unstyled headless Kobalte/Corvu vs custom primitives).
- Rendering environment (client-only SPA vs full-stack SolidStart with SSR).
- Keyboard and screen reader requirements (roving tabIndex, escape to dismiss, focus return).

## Workflow

1. Select headless primitive strategy:
   - For full design systems and compound components: Kobalte (`@kobalte/core`).
   - For standalone utilities (focus trap, scroll lock, presence): Corvu (`corvu`).
   - For lightweight built-ins: Solid core primitives (`createUniqueId`, `<Portal>`).
2. Generate hydration-safe identifiers:
   - Use `createUniqueId()` for label-input associations and `aria-labelledby` / `aria-describedby` IDs.
3. Establish focus management:
   - Ensure modals trap tab focus within container and return focus to triggering element on close.
4. Implement WAI-ARIA keyboard interactions:
   - Bind Arrow keys, Escape, Enter, and Space in compliance with WAI-ARIA Authoring Practices.
5. Bind reactive state to ARIA attributes:
   - Use declarative reactive attributes (e.g. `aria-expanded={isOpen()}`, `aria-busy={isLoading()}`).

## Failure Modes

- Static or random IDs: using static strings or `Math.random()` breaks SSR hydration and causes duplicate DOM IDs.
- Focus trapping leaks: failing to restore focus to trigger element disorients keyboard users.
- Non-semantic clickable elements: using `<div>` for interactive elements without proper `role`, `tabIndex`, and keyboard handlers.
- Imperative ARIA manipulation: manually querying DOM to set attributes instead of declarative JSX bindings.

## Output Contract

Return output matching `DomainGuidanceOutput` schema at `../../skills/contracts/domain-guidance-output.schema.json` with:

- `summary`: Architectural strategy for accessible component construction.
- `decisions`: Key technical choices (headless library, focus management pattern, ARIA mapping).
- `handoff`: Concrete implementation checklist for component development and styling.
- `validation_commands`: List of validation and test commands.
- `citations`: Array of citation objects linking claims to normalized `doc_id` values.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-accessibility-a11y`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.component-apis.create-unique-id` — hydration-safe unique IDs for ARIA associations
- `solid-core.reference.components.portal` — overlay and dialog rendering outside main DOM tree
- `solid-core.reference.component-apis.children` — reactive children helper for compound components
- `solid-core.reference.jsx-attributes.ref` — DOM node references for focus management
- `solid-core.concepts.refs` — forwarded refs and directives for DOM interaction

## References

- `../../references/solidjs/accessibility-a11y.md`
- `../../references/solidjs/reactivity-core.md`
- `../../references/solidjs-normalized/manifest.jsonl`
