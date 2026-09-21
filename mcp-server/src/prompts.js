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
}
