# AGENTS.md (SolidJS Repository Standard)

Scope: entire repository.

## Repository Intent

Treat this repository as a deterministic SolidJS AI Skill and Model Context Protocol (MCP) platform. Prefer creating, updating, and referencing SolidJS skills, normalized corpus documentation, MCP tools/prompts, and verification tooling over generic AI meta-guidance.

## Operating Priorities

1. **Preserve Fine-Grained Reactivity Correctness**: Ensure reactive signals, memos, and stores maintain subscription chains without accidental destructuring, premature reads, or effect loops.
2. **Enforce Framework Version Standards**: Strictly separate SolidJS 1.x (Production Stable) from SolidJS 2.0-rc.9 (Release Candidate). Zero version mixing.
3. **Ground Truth Over Speculation**: Use the live MCP server tools (`read_corpus_doc`, `search_corpus`, `resolve_solid_api`) and the 233-doc normalized corpus rather than guessing API contracts.
4. **Deterministic Workflows & Contracts**: Favor structured schemas in `skills/contracts/` and deterministic validation scripts in `tools/scripts/`.
5. **Lean Skill Entrypoints**: Keep `SKILL.md` concise and trigger-oriented; maintain deep domain knowledge in `references/` and normalized docs.

---

## SolidJS Coding & Design Standards

### Framework Version Standards
- **Default Target**: **SolidJS 1.x (Production Stable)**. Check `package.json` for `"solid-js"`:
  - If `^1.x` (or unspecified): strictly enforce 1.x conventions (`createSignal` accessor calls `count()`, tuple setters, `createResource`, `<Index>` for primitive arrays, `<Suspense fallback={...}>`, `<Dynamic component={...}>`, `batch()`).
  - If `^2.0.0-rc` / `^2.0.0`: apply 2.0-rc conventions (first-class async graph, `<For keyed={false}>`, `<Loading>`/`<Errored>`, `<Reveal>`, `dynamic()`, microtask auto-batching and `flush()`, generator `action()`, `createOptimisticStore()`).
  - **Zero Version Mixing**: Prohibit mixing v1 and v2 APIs in the same component or guidance output. Refer to [guides/solidjs-v2-rc-guide.md](guides/solidjs-v2-rc-guide.md).

### Reactivity & State Management
- **Never Destructure Props**: Props in Solid are reactive proxies (`props.foo`). Destructuring strips reactivity. Use `props.propName` directly or use `splitProps`/`mergeProps`.
- **Derivation Over Effects**: Never use `createEffect` to synchronize or duplicate state into another signal. Use `createMemo` for all derived computations.
- **Isolate Side Effects**: Keep `createEffect` exclusively for real DOM mutations, logging, analytics, or external subscriptions.
- **Children Handling**: Use `children(() => props.children)` when interacting with or memoizing children JSX to avoid repeatedly re-evaluating DOM elements.

### Control Flow & Rendering
- **Use Solid Control Flow Primitives**: Never use JavaScript ternaries (`cond ? <A/> : <B/>`) or array `.map()` in JSX. Always use `<Show>`, `<For>`, `<Index>` (v1), `<Switch>`, `<Match>`, and `<Portal>`.
- **Keyed vs Non-Keyed Lists**:
  - In 1.x: Use `<For>` for object arrays keyed by item reference; use `<Index>` for primitive arrays where array index is stable.
  - In 2.0: Default `<For>` is keyed; use `<For keyed={false}>` for non-keyed index lists.

### Full-Stack, SSR & Hydration Safety
- **No Client Globals at Root**: Never access `window`, `document`, or `localStorage` during initial module evaluation or top-level component setup.
- **Hydration Boundaries**: Guard browser-only logic inside `onMount` or behind `isServer` checks from `solid-js/web`.

---

## Skill Architecture & Layers (18 Specialized Skills)

Skills are organized into three distinct tiers:

1. **Macro Skills (5)**:
   - `solid-component-builder`: New component creation, contract design, accessibility, and props preservation.
   - `solid-refactor-assistant`: Safe refactoring, React-to-Solid conversion, and 1.x-to-2.0 upgrades.
   - `solid-reviewer`: Static inspection, performance audits, and AGENTS.md verification.
   - `solid-scaffold-bootstrap`: Folder structures, build tooling (Vite/TS/SolidStart), and starter configuration.
   - `solid-design-patterns`: Architecture tradeoffs, stores/context composition, and state machine patterns.

2. **Domain Subskills (12)**:
   - `solid-intent-router`: Deterministic user prompt routing to primary and secondary skills.
   - `solid-reactivity-core-expert`: Fine-grained primitives (`createSignal`, `createMemo`, `untrack`, `batch`).
   - `solid-control-flow-rendering`: Advanced `<Show>`, `<For>`, `<Index>`, `<Switch>`, and portal management.
   - `solid-state-architecture`: Nested stores (`createStore`), mutation patterns, and context providers.
   - `solid-primitives-ecosystem`: Community primitives integration (`@solid-primitives/*`).
   - `solid-forms-validation`: Controlled/uncontrolled forms, validation schemas (Zod/Valibot), and action submissions.
   - `solid-accessibility-a11y`: ARIA compliance, focus management, and headless UI (`@kobalte/core`, Corvu).
   - `solid-animation-transitions`: CSS transitions, FLIP animations, and `solid-transition-group`.
   - `solid-router-data-navigation`: Nested routes, layouts, route parameters, actions, and loaders.
   - `solid-start-server-runtime`: Server functions (`"use server"`), middleware, session, and RPC endpoints.
   - `solid-ssr-hydration-debugger`: Solving hydration mismatches, marker misalignment, and isomorphic state leaks.
   - `solid-meta-head-management`: Reactive document head management (`<Title>`, `<Meta>`, `<Link>`).

3. **Quality & Testing (1)**:
   - `solid-testing-quality-gates`: Unit testing (Vitest), reactivity tracking tests, testing-library, and CI gates.

---

## MCP Server Capabilities & Agent Tooling

When interacting with the repository or answering SolidJS questions, prioritize using the live MCP tools exposed by `solidjskills`:

- **Skill Routing**: Call `route_solid_intent` to determine the primary skill, domain subskill, confidence score, and rationale for any prompt.
- **Framework Version Detection**: Call `detect_solid_version` with `package.json` or code snippet to verify targeted version conventions (1.x vs 2.0-rc.9), approved/forbidden primitives, and detect prohibited version mixing.
- **Static Code Auditing**: Call `audit_solid_code` to detect prop destructuring, effect writing to signals, uncalled accessors, memo mutations, untracked prop copies, SSR client globals, async effect tracking loss, self-looping effects, missing memo returns, direct store mutations, and mixed v1/v2 syntax.
- **API Resolution**: Call `resolve_solid_api` with symbol names (e.g. `createSignal`, `createAsync`, `dynamic`) for direct, authoritative documentation links.
- **Corpus Retrieval**: Call `search_corpus` (supports `full_text: true`) or `read_corpus_doc` by `doc_id` to read normalized SolidJS documentation.
- **Repository Checklists**: Call `get_solid_checklist` (`type='review'` or `type='contracts'`) for live evaluation criteria.

---

## Normalized Corpus & Citation Standard

- All authoritative documentation is normalized and indexed in `references/solidjs-normalized/manifest.jsonl`.
- Five packages are indexed: `solid-core`, `solid-router`, `solid-start`, `solid-meta`, and `solid-v2`.
- **Citation Requirement**: All non-trivial technical claims, skill workflows, and review outputs must cite normalized `doc_id` values (e.g. `solid-core.reference.basic-reactivity.create-signal`, `solid-v2.concepts.async-reactivity`).

---

## Contract-Enforced Output Schemas

Guidance and plans generated by skills must conform to the JSON schemas defined in `skills/contracts/`:
- `component-build-output.schema.json`
- `refactor-plan-output.schema.json`
- `review-output.schema.json`
- `scaffold-output.schema.json`
- `design-decision-output.schema.json`
- `domain-guidance-output.schema.json`
- `intent-routing-output.schema.json`

Validate schema compliance using `npm run validate:contracts`.

---

## Required Review Checklist for SolidJS Artifacts

Every SolidJS review or generated component must satisfy the 9 verification criteria from `get_solid_checklist('review')`:

1. **Framework Version Standards**: Default to SolidJS 1.x; apply 2.0-rc.9 only when specified; never mix v1 and v2 APIs.
2. **Reactivity Correctness**: Props are NOT destructured; fine-grained primitives used intentionally.
3. **Computation Optimization**: Derived state uses `createMemo` rather than effects writing to signals.
4. **Control Flow Primitives**: `<Show>`, `<For>`, `<Index>`, `<Switch>` used instead of JS ternaries or `.map()`.
5. **Async & Loading States**: Resources and loading boundaries (`<Suspense>`, `<Loading>`, `<ErrorBoundary>`) are explicit.
6. **Accessibility & Semantics**: Semantic HTML, ARIA attributes, keyboard navigation, and headless primitives included.
7. **SSR & Hydration**: Module setup is isomorphic; client globals guarded by `onMount` or `isServer`.
8. **Validation Commands**: Execution commands (`npm test`, `npm run validate`) provided for verification.
9. **Citation Integrity**: Normalized `doc_id` values cited from `manifest.jsonl`.

---

## Quality Gates & Verification Suite

All changes to skills, references, code, or documentation must pass the repository quality suite before committing:

```bash
# Run full quality test suite
npm test

# Run individual verification gates
npm run validate:corpus     # Validates 233 normalized docs in manifest.jsonl
npm run validate:skills     # Validates all 18 SolidJS skill definitions and frontmatter
npm run validate:contracts  # Validates JSON schema contracts in skills/contracts/
npm run smoke               # Runs intent routing and smoke evaluations
npm run test:integration    # Runs 41-check MCP server integration suite
```

---

## Git & Commit Workflow

- **Never Commit Automatically**: Never execute `git commit` or `git push` unless explicitly asked to do so by the user.
- **Always Provide Commit Message**: Always generate and provide a clear, conventional git commit message (e.g., `feat(...)`, `fix(...)`, `refactor(...)`, `docs(...)`) after completing every job or task.
