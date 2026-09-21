import { z } from 'zod';

/**
 * Register all SolidJS MCP prompts on the server.
 */
export function registerPrompts(server) {
  // 1. review-solid-code
  server.prompt(
    'review-solid-code',
    'Review SolidJS code for reactivity correctness, performance, control flow, and SSR compatibility per AGENTS.md standards',
    {
      code: z.string().describe('SolidJS component or reactivity code to review')
    },
    ({ code }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please review the following SolidJS code against the solidJSkills engineering standards:

\`\`\`tsx
${code}
\`\`\`

Conduct your review using the following strict checklist:

1. **Framework Version Standards**:
   - Default target is **SolidJS 1.x (Production Stable)** unless Solid 2.0-rc is explicitly specified.
   - Enforce 1.x conventions (\`createSignal\` accessor calls \`count()\`, \`<Index>\` for primitive lists, \`<Suspense fallback={...}>\`, \`createResource\`).
   - If SolidJS 2.0-rc is targeted: enforce 2.0 conventions (first-class async graph, \`<For keyed={false}>\`, \`<Loading>\`/\`<Errored>\`, \`dynamic()\`).
   - Strictly prohibit mixing v1 and v2 APIs in the same component.

2. **Reactivity Preservation**:
   - Verify that props are NOT destructured (e.g. \`const { x } = props\` loses reactivity; use \`props.x\` or \`splitProps\`).
   - Ensure signals are read inside reactive tracking scopes (JSX bindings, effects, memos), not during component setup outside a tracking context.
   - Verify that fine-grained primitives (\`createSignal\`, \`createMemo\`, \`createEffect\`, \`createResource\`) are used intentionally.

3. **Computation & Performance**:
   - Ensure derived values use \`createMemo\` rather than an effect writing to a secondary signal.
   - Verify \`batch\` is suggested if multiple related signals are written in event handlers.
   - Check if \`untrack\` is required to prevent unintended reactive subscriptions.

4. **Control Flow Primitives**:
   - Verify that Solid control flow elements (\`<Show>\`, \`<For>\`, \`<Index>\`, \`<Switch>\`, \`<Match>\`) are used instead of JavaScript ternaries or array \`.map()\` in JSX.
   - Ensure keying / reconciliation choice (\`<For>\` vs \`<Index>\`) matches whether list items change by identity or by index.

5. **Async & SSR / Hydration**:
   - Check if resources handle loading and error states explicitly (\`<Suspense>\`, \`<ErrorBoundary>\`).
   - Verify no direct browser APIs (\`window\`, \`document\`, \`localStorage\`) are accessed during initial module or component setup without an \`isServer\` guard or inside \`onMount\`.

Output a structured review report with:
- Summary of Findings
- Detailed Issue Breakdown (with before/after diffs)
- Reactivity Review Checklist (marked Pass / Warning / Fail)
- Recommended Refactored Code`
          }
        }
      ]
    })
  );

  // 2. audit-reactivity
  server.prompt(
    'audit-reactivity',
    'Pinpointed audit to identify reactivity leaks, lost subscriptions, stale closures, or effect loops in SolidJS',
    {
      code: z.string().describe('Code snippet to audit for reactivity issues')
    },
    ({ code }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform a deep reactivity audit on this SolidJS code:

\`\`\`tsx
${code}
\`\`\`

Analyze the code for:
1. **Signal Access Point Audit**:
   - Identify every place a signal or prop getter is invoked (\`signal()\` or \`props.prop\`).
   - State whether the invocation is inside an active tracking context (Memo, Effect, JSX expression) or evaluated only once on component execution.
2. **Prop Destructuring Leaks**:
   - Check function signature and local variables for destructuring of \`props\`.
3. **Effect Loop Risks**:
   - Check if any \`createEffect\` writes to a signal that is also read within the same effect, causing infinite loops.
4. **Stale Closure Checks**:
   - Verify whether async callbacks (setTimeout, promises, event listeners) capture stale values or fail to read fresh reactive values.

Provide a clear assessment of whether reactivity is broken and provide the corrected code snippet.`
          }
        }
      ]
    })
  );

  // 3. scaffold-component
  server.prompt(
    'scaffold-component',
    'Scaffold a production-grade, accessible SolidJS component adhering to repository patterns',
    {
      name: z.string().describe('Component name, e.g. UserProfileCard or DataTable'),
      description: z.string().describe('What the component should do and its requirements'),
      props: z.string().optional().describe('Optional props description or TypeScript types')
    },
    ({ name, description, props }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Scaffold a production-grade SolidJS component named \`${name}\`.

**Requirements**:
${description}

${props ? `**Props Specification**:\n${props}\n` : ''}
**Standards to enforce**:
- Target SolidJS 1.x (Production Stable) by default; if SolidJS 2.0-rc is requested, use 2.0 conventions (<For keyed={false}>, <Loading>/<Errored>, dynamic()).
- Written in TypeScript (\`.tsx\`).
- Explicit props interface exported.
- Use \`splitProps\` or \`mergeProps\` if defaults or rest props are needed; NEVER destructure props directly.
- Use fine-grained Solid control flows (\`<Show>\`, \`<For>\`, \`<Suspense>\`).
- Ensure accessible semantic HTML attributes (ARIA roles, labels, keyboard interaction).
- Isolate side effects in \`onMount\` or \`createEffect\`.
- Provide clean CSS classes or standard styling extension points.`
          }
        }
      ]
    })
  );

  // 4. migrate-react-to-solid
  server.prompt(
    'migrate-react-to-solid',
    'Convert a React component or hook into a native, high-performance SolidJS implementation',
    {
      reactCode: z.string().describe('The React component or hook code to migrate')
    },
    ({ reactCode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Migrate the following React component/hook to SolidJS:

\`\`\`tsx
${reactCode}
\`\`\`

**Target Version**: Default to **SolidJS 1.x (Production Stable)**. (Note: In SolidJS 2.0-rc.9, <Index> is replaced by <For keyed={false}> and <Suspense> is replaced by <Loading> and <Errored>).

Follow these exact migration mappings:
1. \`useState(initial)\` &rarr; \`createSignal(initial)\` (remember to invoke \`signal()\` when reading in Solid!).
2. \`useMemo(() => fn, [deps])\` &rarr; \`createMemo(() => fn)\` (no dependency arrays in Solid!).
3. \`useEffect(() => fn, [deps])\` &rarr; \`createEffect(() => fn)\` or \`onMount(() => fn)\` if it only runs on mount. Cleanups use \`onCleanup(() => fn)\`.
4. \`useCallback(fn, [deps])\` &rarr; Plain functions in Solid, as components only run once.
5. \`useRef(initial)\` &rarr; In Solid, JSX \`ref\` is either a variable assigned by Solid or a signal callback; for mutable non-reactive values, use a plain variable or \`createSignal\`.
6. JSX conditionals (\`{isOpen ? <Modal/> : null}\`) &rarr; \`<Show when={isOpen()}><Modal/></Show>\`.
7. JSX lists (\`{items.map(i => <Item key={i.id} {...i}/>)}\`) &rarr; \`<For each={items()}>{(item) => <Item item={item}/>}</For>\`.
8. Prop destructuring (\`function Comp({ propA, propB })\`) &rarr; \`function Comp(props)\` and access as \`props.propA\`, or use \`splitProps\`.

Return:
- Migration Notes & Tradeoffs
- Complete, refactored SolidJS component in TypeScript.`
          }
        }
      ]
    })
  );

  // 5. upgrade-v1-to-v2
  server.prompt(
    'upgrade-v1-to-v2',
    'Upgrade a SolidJS 1.x component or application to SolidJS 2.0-rc.9 release candidate conventions',
    {
      code: z.string().describe('The SolidJS 1.x code snippet to upgrade')
    },
    ({ code }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Upgrade the following SolidJS 1.x code to SolidJS 2.0-rc.9 (Release Candidate) standards:

\`\`\`tsx
${code}
\`\`\`

Strictly adhere to the following SolidJS 2.0 breaking changes and architectural patterns:
1. **Control Flow**:
   - Replace \`<Index each={list()}>{(item, i) => ...}</Index>\` with \`<For each={list()} keyed={false}>{(item, i) => ...}</For>\`.
   - Keyed lists retain default \`<For each={list()}>{(item, i) => ...}</For>\` or explicit \`<For keyed>\`.
2. **Async Boundaries**:
   - Replace \`<Suspense fallback={...}>\` with \`<Loading fallback={...}>\`.
   - Pair with \`<Errored fallback={(err) => ...}>\` for dedicated async failure boundaries.
   - Replace \`<SuspenseList revealOrder="..." tail="...">\` with \`<Reveal order="sequential"|"together" collapsed>\`.
3. **Dynamic Components**:
   - Replace \`<Dynamic component={Tag} {...props} />\` with functional \`const Element = dynamic(Tag); <Element {...props} />\`.
4. **Batching & Scheduling**:
   - Remove manual \`batch(() => { ... })\`; Solid 2.0 microtask batches automatically. Use \`flush()\` only if immediate synchronous read is required.
5. **Async Reactive Graph**:
   - Replace \`createResource\` with native async computations: \`const data = createMemo(async () => ...)\` or direct promise reads.
6. **Mutations**:
   - Leverage generator \`action(function* () { yield ... })\` or \`createOptimisticStore()\` for state mutations where applicable.
7. **Zero Version Mixing**:
   - Do NOT retain any v1-only APIs (\`<Index>\`, \`<Suspense>\`, \`<Dynamic>\`, \`createResource\`).

Provide:
- Step-by-step Upgrade Summary
- Complete, refactored SolidJS 2.0-rc.9 TypeScript component`
          }
        }
      ]
    })
  );

  // 6. debug-hydration
  server.prompt(
    'debug-hydration',
    'Diagnose and resolve SSR hydration mismatches, marker order shifts, and isomorphic state leaks in SolidJS / SolidStart',
    {
      code: z.string().describe('The component or route code encountering hydration errors'),
      errorMessage: z.string().optional().describe('Optional console error, mismatch diff, or hydration warning')
    },
    ({ code, errorMessage }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Diagnose and resolve the SSR hydration mismatch in the following SolidJS / SolidStart code:

\`\`\`tsx
${code}
\`\`\`
${errorMessage ? `\n**Reported Error / Symptom**:\n\`\`\`\n${errorMessage}\n\`\`\`\n` : ''}
Systematically evaluate the following 5 hydration failure causes:
1. **Client Globals during Initial Execution**:
   - Check for access to \`window\`, \`document\`, \`localStorage\`, or \`navigator\` in top-level setup.
   - Solution: Move to \`onMount(() => { ... })\` or guard with \`if (!isServer)\` from \`solid-js/web\`.
2. **Non-Deterministic Server vs Client Output**:
   - Check for \`Date.now()\`, \`Math.random()\`, localized timezone strings, or unseeded IDs.
   - Solution: Use \`createUniqueId()\` for deterministic IDs or defer dynamic values to \`onMount\`.
3. **Invalid HTML Nesting**:
   - Check for browser auto-corrections: \`<p>\` containing block elements (\`<div>\`, \`<p>\`), \`<tr>\` directly inside \`<table>\` without \`<tbody>\`, or interactive elements nested inside \`<a>\` / \`<button>\`.
   - Browser DOM corrections shift comment markers and break fine-grained hydration.
4. **Unguarded Asynchronous State / Missing Boundaries**:
   - Check if resources or async memos resolve differently on server without \`<Suspense>\` or \`<Loading>\` boundaries.
5. **Conditional Branch Divergence**:
   - Check if server renders one branch and client synchronously renders another before hydration completes.

Provide:
- Root Cause Analysis
- Corrected Isomorphic Component Code
- Hydration Testing & Verification Strategy`
          }
        }
      ]
    })
  );
}
