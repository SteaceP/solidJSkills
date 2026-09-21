import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Deterministic intent routing based on tools/gemini-mcp-extension/skill-routing-map.md
 */
export function routeSolidIntent(prompt, runtimeHint = '') {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error("'prompt' must be a non-empty string.");
  }

  const text = `${prompt} ${runtimeHint}`.toLowerCase();

  // Rule 1: solid-meta / metadata / head / title / meta / link
  if (/\b(solid-meta|metadata|head|title|meta tags?|link tags?)\b/i.test(text)) {
    return {
      summary: 'Matched head/metadata management intent for SolidJS.',
      primary_skill: 'solid-design-patterns',
      secondary_skill: 'solid-meta-head-management',
      confidence: 0.95,
      rationale: [
        'User query contains head/metadata/meta keywords matching rule 1.',
        'Routed to solid-design-patterns for architectural boundaries and solid-meta-head-management for document head manipulation.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-meta-head-management'
      ],
      citations: [
        {
          doc_id: 'solid-meta.solid-meta.index',
          claim: 'solid-meta manages document head tags reactively across client and SSR environments.'
        }
      ]
    };
  }

  // Rule 2: solid-start / server / use server / middleware / request event / session / auth
  if (/\b(solid-start|use server|server actions?|middleware|request event|session|solid start)\b/i.test(text)) {
    return {
      summary: 'Matched SolidStart server runtime and middleware intent.',
      primary_skill: 'solid-refactor-assistant',
      secondary_skill: 'solid-start-server-runtime',
      confidence: 0.95,
      rationale: [
        'User query contains SolidStart server/middleware signals matching rule 2.',
        'Routed to solid-refactor-assistant with solid-start-server-runtime for full-stack primitives.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-start-server-runtime'
      ],
      citations: [
        {
          doc_id: 'solid-start.solid-start.index',
          claim: 'SolidStart provides server functions, middleware, and request handling primitives.'
        }
      ]
    };
  }

  // Rule 3: hydration / SSR mismatch / isServer / no hydration / renderToString
  if (/\b(hydration|ssr mismatch|isserver|no hydration|rendertostring|hydrate)\b/i.test(text)) {
    return {
      summary: 'Matched SSR hydration debugging and server/client boundary intent.',
      primary_skill: 'solid-reviewer',
      secondary_skill: 'solid-ssr-hydration-debugger',
      confidence: 0.95,
      rationale: [
        'User query contains hydration/SSR mismatch keywords matching rule 3.',
        'Routed to solid-reviewer with solid-ssr-hydration-debugger for isomorphic state audit.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-ssr-hydration-debugger'
      ],
      citations: [
        {
          doc_id: 'solid-core.concepts.components.basics',
          claim: 'Component boundaries and lifecycle differences must be respected across server and client renders.'
        }
      ]
    };
  }

  // Rule 4: router / route / navigation / params / search / query / action / revalidate
  if (/\b(solid-router|router|navigation|useparams|usenavigate|usesearchparams|routes?|revalidate)\b/i.test(text)) {
    return {
      summary: 'Matched Solid Router navigation and data loading intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-router-data-navigation',
      confidence: 0.95,
      rationale: [
        'User query contains client routing or navigation signals matching rule 4.',
        'Routed to solid-component-builder and solid-router-data-navigation.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-router-data-navigation'
      ],
      citations: [
        {
          doc_id: 'solid-router.solid-router.index',
          claim: 'Solid Router provides reactive route parameters, nested routes, and data actions.'
        }
      ]
    };
  }

  // Rule 5: forms / validation / zod / valibot / modular-forms / inputs
  if (/\b(forms?|createform|modular-forms|zod|valibot|form\s+action|(?:form|field|input|schema)\s+validation|validate\s+(?:form|field|input))\b/i.test(text)) {
    const isRefactor = /\b(refactor|migrate|upgrade|conversion|convert)\b/i.test(text);
    const isReview = /\b(review|audit|check)\b/i.test(text);
    const primarySkill = isRefactor ? 'solid-refactor-assistant' : (isReview ? 'solid-reviewer' : 'solid-component-builder');

    return {
      summary: 'Matched form state, input validation, and submission intent.',
      primary_skill: primarySkill,
      secondary_skill: 'solid-forms-validation',
      confidence: 0.95,
      rationale: [
        'User query contains form handling, input validation (Zod/Valibot), or submission signals matching rule 5.',
        `Routed to ${primarySkill} with solid-forms-validation for reactive form pipeline.`
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-forms-validation'
      ],
      citations: [
        {
          doc_id: 'solid-core.concepts.components.event-handlers',
          claim: 'Solid event handling and validation utilize currentTarget bindings and fine-grained state derivation.'
        }
      ]
    };
  }

  // Rule 6: a11y / accessibility / ARIA / kobalte / corvu / focus management
  if (/\b(a11y|accessibility|wai-aria|aria|kobalte|corvu|screen reader|focus trap|focus management|keyboard nav(?:igation)?)\b/i.test(text)) {
    const isReview = /\b(review|audit|check)\b/i.test(text);
    const primarySkill = isReview ? 'solid-reviewer' : 'solid-component-builder';

    return {
      summary: 'Matched accessible UI, headless components, and ARIA semantics intent.',
      primary_skill: primarySkill,
      secondary_skill: 'solid-accessibility-a11y',
      confidence: 0.95,
      rationale: [
        'User query contains accessibility, headless UI (Kobalte/Corvu), or ARIA compliance signals matching rule 6.',
        `Routed to ${primarySkill} with solid-accessibility-a11y for WAI-ARIA and focus management.`
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-accessibility-a11y'
      ],
      citations: [
        {
          doc_id: 'solid-core.reference.component-apis.create-unique-id',
          claim: 'createUniqueId generates isomorphic, hydration-safe unique IDs for accessible ARIA relationships.'
        }
      ]
    };
  }

  // Rule 7: animation / transition / solid-transition-group / flip
  if (/\b(animations?|transitions?|solid-transition-group|transitiongroup|flip animation|motionone|enter\/exit)\b/i.test(text)) {
    return {
      summary: 'Matched UI animations, enter/exit transitions, and transition-group intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-animation-transitions',
      confidence: 0.95,
      rationale: [
        'User query specifies UI animations or enter/exit transition flows matching rule 7.',
        'Routed to solid-component-builder and solid-animation-transitions.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-animation-transitions'
      ],
      citations: [
        {
          doc_id: 'solid-core.reference.reactive-utilities.use-transition',
          claim: 'useTransition enables concurrent, non-blocking UI state transitions in SolidJS.'
        }
      ]
    };
  }

  // Rule 8: solid-primitives / @solid-primitives / community primitives
  if (/\b(solid-primitives|@solid-primitives|community primitives?|maketimer|createtimer|createeventlistener|createresizeobserver|createintersectionobserver)\b/i.test(text)) {
    return {
      summary: 'Matched official @solid-primitives ecosystem integration intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-primitives-ecosystem',
      confidence: 0.95,
      rationale: [
        'User query specifies @solid-primitives ecosystem integration matching rule 8.',
        'Routed to solid-component-builder and solid-primitives-ecosystem.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-primitives-ecosystem'
      ],
      citations: [
        {
          doc_id: 'solid-core.reference.lifecycle.on-cleanup',
          claim: 'Official @solid-primitives integrate directly with fine-grained reactive owners and lifecycle cleanup hooks.'
        }
      ]
    };
  }

  // Rule 9: refactor / migrate / upgrade / conversion / React to Solid / v2 migration
  if (/\b(refactor|migrate|upgrade|conversion|convert|react to solid|v2 migration|migrate to v2)\b/i.test(text)) {
    return {
      summary: 'Matched code refactoring and architecture migration intent.',
      primary_skill: 'solid-refactor-assistant',
      secondary_skill: 'solid-state-architecture',
      confidence: 0.95,
      rationale: [
        'User query contains refactoring or migration signals matching rule 9.',
        'Routed to solid-refactor-assistant for migration orchestration and solid-state-architecture.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-refactor-assistant'
      ],
      citations: [
        {
          doc_id: 'solid-core.concepts.components.basics',
          claim: 'Refactoring SolidJS code requires preserving fine-grained reactivity and isolating side effects.'
        }
      ]
    };
  }

  // Rule 10: store / context / shared state / provider boundary
  if (/\b(createstore|store|context|usecontext|createcontext|shared state|provider)\b/i.test(text)) {
    return {
      summary: 'Matched Solid state architecture and store/context intent.',
      primary_skill: 'solid-design-patterns',
      secondary_skill: 'solid-state-architecture',
      confidence: 0.9,
      rationale: [
        'User query contains store or context signals matching rule 10.',
        'Routed to solid-design-patterns and solid-state-architecture.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-state-architecture'
      ],
      citations: [
        {
          doc_id: 'solid-core.reference.store-utilities.create-store',
          claim: 'createStore provides fine-grained nested reactive tree proxies in SolidJS.'
        }
      ]
    };
  }

  // Rule 11: Show / For / Switch / rendering branch / suspense fallback / Index
  if (/\b(show|for|switch|match|suspense|index component|control flow)\b/i.test(text)) {
    return {
      summary: 'Matched SolidJS control flow and conditional rendering intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-control-flow-rendering',
      confidence: 0.9,
      rationale: [
        'User query requests control flow or conditional branching matching rule 11.',
        'Routed to solid-component-builder and solid-control-flow-rendering.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-control-flow-rendering'
      ],
      citations: [
        {
          doc_id: 'solid-core.concepts.control-flow.conditional-rendering',
          claim: 'Solid uses specialized control flow components (<Show>, <For>) to optimize DOM reconciliation.'
        }
      ]
    };
  }

  // Rule 12: scaffold / bootstrap / new app / setup
  if (/\b(scaffold|bootstrap|new app|init|project setup)\b/i.test(text)) {
    return {
      summary: 'Matched project scaffolding and bootstrap intent.',
      primary_skill: 'solid-scaffold-bootstrap',
      secondary_skill: 'solid-testing-quality-gates',
      confidence: 0.9,
      rationale: [
        'User query targets initial setup or bootstrapping matching rule 12.',
        'Routed to solid-scaffold-bootstrap.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-scaffold-bootstrap'
      ],
      citations: [
        {
          doc_id: 'solid-core.concepts.components.basics',
          claim: 'Component architecture in Solid begins with minimal, production-realistic defaults.'
        }
      ]
    };
  }

  // Rule 13: test / quality gate / checklist / regression
  if (/\b(tests?|testing|quality gates?|checklists?|audit|vitest|jest|regressions?|code review|review this)\b/i.test(text)) {
    return {
      summary: 'Matched testing and quality gate verification intent.',
      primary_skill: 'solid-reviewer',
      secondary_skill: 'solid-testing-quality-gates',
      confidence: 0.9,
      rationale: [
        'User query targets quality gates or test suites matching rule 13.',
        'Routed to solid-reviewer and solid-testing-quality-gates.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-testing-quality-gates'
      ],
      citations: [
        {
          doc_id: 'solid-core.reference.basic-reactivity.create-signal',
          claim: 'Fine-grained reactivity requires explicit testing of tracking contexts and cleanup hooks.'
        }
      ]
    };
  }

  // Rule 14: signal / memo / effect / resource / untrack / batch
  if (/\b(signal|createsignal|creatememo|createeffect|createresource|untrack|batch|reactivity)\b/i.test(text)) {
    return {
      summary: 'Matched core fine-grained reactivity intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-reactivity-core-expert',
      confidence: 0.95,
      rationale: [
        'User query specifies core reactivity primitives matching rule 14.',
        'Routed to solid-component-builder and solid-reactivity-core-expert.'
      ],
      validation_commands: [
        'npm run validate:skills',
        'node tools/scripts/validate-skills.mjs --skill solid-reactivity-core-expert'
      ],
      citations: [
        {
          doc_id: 'solid-core.reference.basic-reactivity.create-signal',
          claim: 'createSignal is the primary fine-grained reactive atom in SolidJS.'
        }
      ]
    };
  }

  // Fallback: rule 15
  return {
    summary: 'Default fallback to component builder and core reactivity expert.',
    primary_skill: 'solid-component-builder',
    secondary_skill: 'solid-reactivity-core-expert',
    confidence: 0.7,
    rationale: [
      'No explicit specialized package signals detected in prompt.',
      'Applying rule 15 deterministic fallback to solid-component-builder + solid-reactivity-core-expert.'
    ],
    validation_commands: [
      'npm run validate:skills',
      'node tools/scripts/run-smoke-evals.mjs'
    ],
    citations: [
      {
        doc_id: 'solid-core.reference.basic-reactivity.create-signal',
        claim: 'createSignal and component building form the universal foundation for SolidJS tasks.'
      }
    ]
  };
}

/**
 * Static heuristic analysis for SolidJS code anti-patterns.
 */
export function auditSolidCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error("'code' must be a non-empty string.");
  }

  const issues = [];

  // 1. Destructuring props in function signature or const
  // e.g. function Component({ count, title }) or const { count } = props
  const propDestructSigRegex = /(?:function\s+[A-Za-z0-9_]+\s*\(\s*\{([^}]+)\}|const\s+[A-Za-z0-9_]+\s*=\s*\(\s*\{([^}]+)\})/g;
  let match;
  while ((match = propDestructSigRegex.exec(code)) !== null) {
    const destructured = match[1] || match[2];
    issues.push({
      rule: 'no-destructure-props',
      severity: 'error',
      message: `Destructuring props directly in component parameter ({ ${destructured.trim()} }) eliminates reactivity. In SolidJS, props is a reactive proxy that must not be unpacked.`,
      recommendation: 'Change to (props) and access as props.fieldName, or use splitProps(props, [...keys]).'
    });
  }

  const propDestructConstRegex = /const\s+\{([^}]+)\}\s*=\s*(?:props|props\.[A-Za-z0-9_]+)/g;
  while ((match = propDestructConstRegex.exec(code)) !== null) {
    issues.push({
      rule: 'no-destructure-props',
      severity: 'error',
      message: `Destructuring props via 'const { ${match[1].trim()} } = props' strips reactivity.`,
      recommendation: 'Access properties directly on props (props.val) or use splitProps.'
    });
  }

  // 2. createEffect for derived state instead of createMemo
  // e.g. createEffect(() => { setDouble(count() * 2); });
  const effectSettingSignalRegex = /createEffect\s*\(\s*(?:\(\s*\)|async\s*\(\s*\))\s*=>\s*\{[^}]*set[A-Z0-9_][A-Za-z0-9_]*\s*\(/g;
  if (effectSettingSignalRegex.test(code)) {
    issues.push({
      rule: 'prefer-create-memo',
      severity: 'warning',
      message: 'Detected createEffect writing to a signal (setter call inside effect). This is usually an anti-pattern for derived state and can cause extra renders or loops.',
      recommendation: 'Use createMemo(() => derivation) instead of setting a signal inside createEffect.'
    });
  }

  // 3. Ternary inside JSX instead of <Show>
  // e.g. {isLoading() ? <Spinner /> : <Content />}
  const ternaryInJsxRegex = /\{[^{}]*\?[^{}]*<[A-Za-z0-9_]+[^{}]*:[^{}]*<[A-Za-z0-9_]+[^{}]*\}/g;
  if (ternaryInJsxRegex.test(code)) {
    issues.push({
      rule: 'use-show-control-flow',
      severity: 'warning',
      message: 'Detected JavaScript ternary operator inside JSX to render components. Solid cannot optimize DOM lifecycle properly with JS ternaries.',
      recommendation: 'Use <Show when={condition()} fallback={<Fallback />}>...</Show> for optimal fine-grained DOM mounting.'
    });
  }

  // 4. Array .map() inside JSX instead of <For> or <Index>
  // e.g. {items().map(...)}
  const mapInJsxRegex = /\{[A-Za-z0-9_().\s]+\.map\s*\(/g;
  if (mapInJsxRegex.test(code)) {
    issues.push({
      rule: 'use-for-control-flow',
      severity: 'warning',
      message: 'Detected array .map() inside JSX. In Solid, .map() re-runs and recreates DOM elements on any array change.',
      recommendation: 'Use <For each={items()}>{(item) => ...}</For> for keyed list diffing or <Index> for primitive indices.'
    });
  }

  // 5. Stale signal read in JSX: rendering signal getter without calling it
  // e.g. <div>{count}</div> where count is a signal (accessor)
  const uncalledSignalRegex = /\{([a-z][A-Za-z0-9_]*)\}/g;
  while ((match = uncalledSignalRegex.exec(code)) !== null) {
    const ident = match[1];
    // check if ident is declared as const [ident, ...] = createSignal
    const signalDecl = new RegExp(`const\\s*\\[\\s*${ident}\\s*,`, 'g');
    if (signalDecl.test(code)) {
      issues.push({
        rule: 'invoke-signal-getter',
        severity: 'error',
        message: `Signal '${ident}' is rendered in JSX without invocation '{${ident}}'. In Solid, signals are accessor functions.`,
        recommendation: `Call the signal accessor function: '{${ident}()}'.`
      });
    }
  }

  // 6. Mixed version APIs: mixing Solid 1.x and 2.0 primitives
  const hasV1ControlFlow = /<Index\b|<Suspense\b|<Dynamic\b/.test(code);
  const hasV2ControlFlow = /<Loading\b|<Errored\b|<Reveal\b|<For[^>]+keyed=\{false\}/.test(code);
  if (hasV1ControlFlow && hasV2ControlFlow) {
    issues.push({
      rule: 'no-mixed-version-apis',
      severity: 'error',
      message: 'Detected mixing of SolidJS 1.x (<Index>, <Suspense>, <Dynamic>) and SolidJS 2.0-rc (<Loading>, <Errored>, <Reveal>, <For keyed={false}>) in the same code snippet. Framework versions must not be mixed.',
      recommendation: 'Target either SolidJS 1.x or SolidJS 2.0-rc.9 consistently.'
    });
  }

  // 7. Accessing browser globals (window, document, localStorage) without isServer or onMount
  const hasBrowserGlobal = /\b(window|document|localStorage)\.[A-Za-z0-9_]+/g;
  if (!/\bisServer\b/.test(code) && !/onMount\s*\(/.test(code)) {
    let bgMatch;
    while ((bgMatch = hasBrowserGlobal.exec(code)) !== null) {
      const globalName = bgMatch[1];
      issues.push({
        rule: 'no-browser-globals-in-setup',
        severity: 'error',
        message: `Detected direct access to browser global '${globalName}' during component setup without an 'isServer' guard or 'onMount' wrapper. In SSR/SolidStart environments, this causes hydration mismatches or server crashes.`,
        recommendation: `Wrap browser-only logic in onMount(() => { ... }) or guard with if (!isServer) from 'solid-js/web'.`
      });
      break; // flag once
    }
  }

  // 8. createMemo writing to a signal (setter call inside memo)
  const memoSettingSignalRegex = /createMemo\s*\(\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>\s*\{[^}]*set[A-Z0-9_][A-Za-z0-9_]*\s*\(/g;
  if (memoSettingSignalRegex.test(code)) {
    issues.push({
      rule: 'no-signal-mutation-in-memo',
      severity: 'error',
      message: 'Detected signal setter call inside createMemo. Memos in SolidJS must be pure derived computations without reactive side effects.',
      recommendation: 'Derive state directly without writing to secondary signals, or use createEffect exclusively for external side effects.'
    });
  }

  // 9. Assigning reactive prop to local variable during setup
  const propCopyRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*props\.([A-Za-z0-9_]+)\s*;/g;
  while ((match = propCopyRegex.exec(code)) !== null) {
    const localIdent = match[1];
    const propKey = match[2];
    const jsxUsage = new RegExp(`\\{${localIdent}\\}|\\b${localIdent}\\b`, 'g');
    if (jsxUsage.test(code)) {
      issues.push({
        rule: 'no-untracked-prop-copy',
        severity: 'warning',
        message: `Copied reactive property 'props.${propKey}' to local variable '${localIdent}' during component setup. In SolidJS, props are reactive proxies; assigning to a local variable captures only the initial value and breaks reactivity.`,
        recommendation: `Access 'props.${propKey}' directly in JSX/memos, or wrap in createMemo(() => props.${propKey}).`
      });
    }
  }

  // 10. Async callback passed to createEffect
  const asyncEffectRegex = /createEffect\s*\(\s*async\s*(?:\([^)]*\)|[A-Za-z0-9_]+|\(\s*\)|function\b)/g;
  if (asyncEffectRegex.test(code)) {
    issues.push({
      rule: 'async-effect-loss',
      severity: 'warning',
      message: 'Detected async function passed to createEffect. In SolidJS, reactive tracking is purely synchronous; any signal access after the first "await" drops reactive subscriptions and will not re-trigger the effect.',
      recommendation: 'Keep createEffect synchronous. For asynchronous data workflows, use createResource in Solid 1.x or native async memos in Solid 2.0.'
    });
  }

  // 11. Self-triggering effect loop (reading and writing the same signal in createEffect without untrack)
  const effectBlockRegex = /createEffect\s*\(\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)?\s*=>\s*\{([^}]*)\}/g;
  let efMatch;
  while ((efMatch = effectBlockRegex.exec(code)) !== null) {
    const efBody = efMatch[1];
    if (!/\buntrack\b/.test(efBody)) {
      const setterCallRegex = /\bset([A-Z0-9_][A-Za-z0-9_]*)\s*\(/g;
      let setMatch;
      while ((setMatch = setterCallRegex.exec(efBody)) !== null) {
        const capitalized = setMatch[1];
        const getterName = capitalized.charAt(0).toLowerCase() + capitalized.slice(1);
        const getterCallRegex = new RegExp(`\\b${getterName}\\s*\\(`, 'g');
        if (getterCallRegex.test(efBody)) {
          issues.push({
            rule: 'effect-self-loop',
            severity: 'error',
            message: `Detected signal '${getterName}' being read and written ('set${capitalized}') in the same createEffect without 'untrack()'. This can cause an immediate infinite reactive loop.`,
            recommendation: `Wrap the signal read in untrack(() => ${getterName}()) or use createMemo if deriving state.`
          });
          break;
        }
      }
    }
  }

  // 12. createMemo computation block without a return statement
  const memoBlockRegex = /createMemo\s*\(\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)?\s*=>\s*\{([^}]*)\}/g;
  let mbMatch;
  while ((mbMatch = memoBlockRegex.exec(code)) !== null) {
    const mbBody = mbMatch[1].trim();
    if (!/\breturn\b/.test(mbBody)) {
      issues.push({
        rule: 'missing-memo-return',
        severity: 'error',
        message: 'createMemo computation block "{ ... }" does not contain a return statement. In SolidJS, memos must return a derived computation value.',
        recommendation: 'Return a computed value from the createMemo callback, or use expression syntax without braces: createMemo(() => derivation).'
      });
    }
  }

  // 13. Direct store property mutation
  const storeDeclRegex = /const\s*\[\s*([A-Za-z0-9_]+)\s*,\s*set[A-Za-z0-9_]+\s*\]\s*=\s*createStore\b/g;
  let stMatch;
  while ((stMatch = storeDeclRegex.exec(code)) !== null) {
    const storeIdent = stMatch[1];
    const directMutationRegex = new RegExp(`\\b${storeIdent}\\.[A-Za-z0-9_.]+\\s*=(?!=)`, 'g');
    if (directMutationRegex.test(code)) {
      issues.push({
        rule: 'no-direct-store-mutation',
        severity: 'error',
        message: `Directly mutating store proxy '${storeIdent}' via property assignment. SolidJS stores wrap objects in reactive proxies; direct assignment does not notify subscribers or trigger updates.`,
        recommendation: `Use the store setter: set${storeIdent.charAt(0).toUpperCase() + storeIdent.slice(1)}('path', 'to', 'key', value) or produce().`
      });
    }
  }

  const score = issues.filter((i) => i.severity === 'error').length === 0 ? (issues.length === 0 ? 100 : 85) : Math.max(30, 80 - issues.length * 20);

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    score,
    total_issues: issues.length,
    issues,
    summary:
      issues.length === 0
        ? 'No SolidJS reactivity anti-patterns detected. Code conforms to solidJSkills reactivity standards.'
        : `Found ${issues.length} potential issue(s) (${issues.filter((i) => i.severity === 'error').length} error(s), ${issues.filter((i) => i.severity === 'warning').length} warning(s)).`
  };
}

/**
 * Retrieve SolidJS development checklists and output schemas.
 */
export async function getSolidChecklist(repoRoot, type = 'review') {
  const contractsDir = path.join(repoRoot, 'skills', 'contracts');

  if (type === 'review') {
    return {
      type: 'review',
      title: 'SolidJS Review Checklist (AGENTS.md Standard)',
      items: [
        {
          category: 'Framework Version Standards',
          criteria: 'Default target is SolidJS 1.x (Production Stable); apply SolidJS 2.0-rc.9 conventions (<For keyed={false}>, <Loading>/<Errored>, <Reveal>, dynamic(), microtask auto-batching) only when ^2.0.0-rc is declared; strictly prohibit mixing v1 and v2 APIs in the same component.'
        },
        {
          category: 'Reactivity Correctness',
          criteria: 'Props are NOT destructured; fine-grained primitives used intentionally (createSignal, createMemo, createEffect, untrack, batch).'
        },
        {
          category: 'Computation Optimization',
          criteria: 'Unnecessary recomputation avoided; derived state uses createMemo rather than effects writing to secondary signals.'
        },
        {
          category: 'Control Flow Primitives',
          criteria: 'Solid control flow elements (<Show>, <For>, <Index>, <Switch>, <Match>) chosen appropriately instead of JS ternaries or .map().'
        },
        {
          category: 'Async & Loading States',
          criteria: 'Async operations, resources, and loading states are explicit (<Suspense>, <ErrorBoundary>).'
        },
        {
          category: 'Accessibility & Semantics',
          criteria: 'Accessible semantic markup, ARIA roles, and keyboard interactions considered.'
        },
        {
          category: 'SSR & Hydration',
          criteria: 'SSR/hydration concerns addressed; no browser APIs accessed at module root or setup without isServer guards.'
        },
        {
          category: 'Validation Commands',
          criteria: 'Tests and validation commands listed for execution (e.g. npm run validate).'
        },
        {
          category: 'Citation Integrity',
          criteria: 'Claims cite normalized doc_id references from manifest.jsonl.'
        }
      ],
      output_schema: 'skills/contracts/review-output.schema.json'
    };
  }

  if (type === 'contracts') {
    let files = [];
    try {
      files = await fs.readdir(contractsDir);
    } catch {
      files = [];
    }
    const schemas = files.filter((f) => f.endsWith('.schema.json'));
    return {
      type: 'contracts',
      directory: 'skills/contracts',
      count: schemas.length,
      schemas: schemas.map((f) => ({
        filename: f,
        path: `skills/contracts/${f}`
      }))
    };
  }

  return {
    type,
    message: `Checklist for '${type}' generated. Use type='review' or type='contracts'.`
  };
}

/**
 * Detect targeted SolidJS framework version and evaluate approved / forbidden primitives.
 */
export function detectSolidVersion({ packageJson, code } = {}) {
  const rationale = [];
  const mixingIssues = [];
  let detectedVersion = null;
  let isV2 = false;
  let source = null;

  // 1. Inspect package.json if provided
  if (packageJson && typeof packageJson === 'string') {
    let pkg = null;
    try {
      pkg = JSON.parse(packageJson);
    } catch {
      // Fallback regex if partial snippet or malformed JSON
      const depMatch = /["']solid-js["']\s*:\s*["']([^"']+)["']/.exec(packageJson);
      if (depMatch) {
        pkg = { dependencies: { 'solid-js': depMatch[1] } };
      }
    }

    if (pkg) {
      const solidVersion =
        pkg.dependencies?.['solid-js'] ||
        pkg.devDependencies?.['solid-js'] ||
        pkg.peerDependencies?.['solid-js'];

      if (solidVersion) {
        if (/2\.0|2\.0\.0-rc|\^2\./.test(solidVersion)) {
          detectedVersion = '2.0-rc';
          isV2 = true;
          source = 'package.json';
          rationale.push(`package.json specifies SolidJS 2.0 release candidate: "solid-js": "${solidVersion}".`);
        } else if (/1\.|^1\./.test(solidVersion)) {
          detectedVersion = '1.x';
          isV2 = false;
          source = 'package.json';
          rationale.push(`package.json specifies SolidJS 1.x stable: "solid-js": "${solidVersion}".`);
        } else {
          rationale.push(`package.json contains unspecified or wildcard version "${solidVersion}"; defaulting to SolidJS 1.x.`);
          detectedVersion = '1.x';
          isV2 = false;
          source = 'package.json';
        }
      } else {
        rationale.push('No "solid-js" dependency found in package.json; defaulting to SolidJS 1.x.');
      }
    }
  }

  // 2. Inspect code snippet if provided
  if (code && typeof code === 'string') {
    const hasV1Index = /<Index\b/.test(code);
    const hasV1Suspense = /<Suspense\b/.test(code);
    const hasV1Dynamic = /<Dynamic\b/.test(code);
    const hasV1SuspenseList = /<SuspenseList\b/.test(code);
    const hasV1CreateResource = /\bcreateResource\b/.test(code);
    const hasV1Batch = /\bbatch\s*\(/.test(code);

    const hasV2Loading = /<Loading\b/.test(code);
    const hasV2Errored = /<Errored\b/.test(code);
    const hasV2Reveal = /<Reveal\b/.test(code);
    const hasV2ForKeyedFalse = /<For[^>]+keyed=\{false\}/.test(code);
    const hasV2Dynamic = /\bdynamic\s*\(/.test(code);
    const hasV2Flush = /\bflush\s*\(/.test(code);
    const hasV2OptimisticStore = /\bcreateOptimisticStore\b/.test(code);

    const v1Features = [];
    if (hasV1Index) v1Features.push('<Index>');
    if (hasV1Suspense) v1Features.push('<Suspense>');
    if (hasV1Dynamic) v1Features.push('<Dynamic>');
    if (hasV1SuspenseList) v1Features.push('<SuspenseList>');
    if (hasV1CreateResource) v1Features.push('createResource');
    if (hasV1Batch) v1Features.push('batch()');

    const v2Features = [];
    if (hasV2Loading) v2Features.push('<Loading>');
    if (hasV2Errored) v2Features.push('<Errored>');
    if (hasV2Reveal) v2Features.push('<Reveal>');
    if (hasV2ForKeyedFalse) v2Features.push('<For keyed={false}>');
    if (hasV2Dynamic) v2Features.push('dynamic()');
    if (hasV2Flush) v2Features.push('flush()');
    if (hasV2OptimisticStore) v2Features.push('createOptimisticStore()');

    if (v1Features.length > 0 && v2Features.length > 0) {
      mixingIssues.push(`Prohibited version mixing: Code contains both Solid 1.x features (${v1Features.join(', ')}) and Solid 2.0-rc features (${v2Features.join(', ')}).`);
      rationale.push('Detected mixed v1 and v2 API syntax in code snippet.');
      detectedVersion = 'mixed';
    } else if (v2Features.length > 0) {
      rationale.push(`Code contains Solid 2.0-rc specific features: ${v2Features.join(', ')}.`);
      if (detectedVersion === '1.x' && source === 'package.json') {
        mixingIssues.push(`Version mismatch: package.json targets Solid 1.x, but code snippet utilizes Solid 2.0-rc primitives (${v2Features.join(', ')}).`);
      } else if (!detectedVersion) {
        detectedVersion = '2.0-rc';
        isV2 = true;
        source = 'code';
      }
    } else if (v1Features.length > 0) {
      rationale.push(`Code contains Solid 1.x specific features: ${v1Features.join(', ')}.`);
      if (detectedVersion === '2.0-rc' && source === 'package.json') {
        mixingIssues.push(`Version mismatch: package.json targets Solid 2.0-rc, but code snippet utilizes Solid 1.x primitives (${v1Features.join(', ')}).`);
      } else if (!detectedVersion) {
        detectedVersion = '1.x';
        isV2 = false;
        source = 'code';
      }
    }
  }

  // 3. Fallback to default
  if (!detectedVersion) {
    detectedVersion = '1.x';
    isV2 = false;
    rationale.push('Defaulting to SolidJS 1.x (Production Stable) per repository AGENTS.md standard.');
  }

  const versionMixingDetected = mixingIssues.length > 0;

  const approvedPrimitives = isV2
    ? {
        version: 'SolidJS 2.0-rc.9',
        primitive_lists: '<For each={list()} keyed={false}>{(item, i) => ...}</For>',
        keyed_lists: '<For each={list()} keyed>{(item, i) => ...}</For>',
        async_boundaries: '<Loading fallback={<Spinner />}> and <Errored fallback={(err) => ...}>',
        boundary_reveal: '<Reveal order="sequential"|"together"|"natural" collapsed>',
        async_data: 'Direct async reactive graph: createMemo(async () => ...) or promises in computations',
        batching: 'Auto-batched on microtask; flush() for synchronous draining',
        dynamic_element: 'Functional dynamic(Tag) helper',
        mutations: 'Generator action(function* () { yield ... }) and createOptimisticStore()',
        ssr_metaframework: '@solidjs/vite-plugin Start Mode'
      }
    : {
        version: 'SolidJS 1.x',
        primitive_lists: '<Index each={list()}>{(item, i) => ...}</Index>',
        keyed_lists: '<For each={list()}>{(item, i) => ...}</For>',
        async_boundaries: '<Suspense fallback={<Spinner />}> and <ErrorBoundary fallback={...}>',
        boundary_reveal: '<SuspenseList revealOrder="..." tail="...">',
        async_data: 'createResource(source, fetcher)',
        batching: 'Explicit batch(() => { ... })',
        dynamic_element: '<Dynamic component={Tag} {...props} />',
        mutations: 'Manual signals or @solidjs/router action',
        ssr_metaframework: '@solidjs/start (Vinxi)'
      };

  const forbiddenPrimitives = isV2
    ? [
        '<Index> (replaced by <For keyed={false}>)',
        '<Suspense> (replaced by <Loading>)',
        '<SuspenseList> (replaced by <Reveal>)',
        '<Dynamic component={Tag}> (replaced by dynamic(Tag))',
        'createResource (replaced by native async graph)',
        'batch() (replaced by auto-batching and flush())'
      ]
    : [
        '<Loading> (requires Solid 2.0-rc)',
        '<Errored> (requires Solid 2.0-rc)',
        '<Reveal> (requires Solid 2.0-rc)',
        '<For keyed={false}> (requires Solid 2.0-rc; use <Index> in v1)',
        'dynamic(Tag) (requires Solid 2.0-rc; use <Dynamic component={Tag}> in v1)',
        'createOptimisticStore (requires Solid 2.0-rc)'
      ];

  const citations = isV2
    ? [
        {
          doc_id: 'solid-v2.concepts.async-reactivity',
          claim: 'SolidJS 2.0 introduces first-class async reactive graph with <Loading> and <Errored> boundaries.'
        },
        {
          doc_id: 'solid-v2.concepts.control-flow',
          claim: 'SolidJS 2.0 replaces <Index> with <For keyed={false}> and replaces <Dynamic> with dynamic().'
        }
      ]
    : [
        {
          doc_id: 'solid-core.reference.basic-reactivity.create-signal',
          claim: 'SolidJS 1.x uses fine-grained synchronous reactivity atoms and explicit batching.'
        },
        {
          doc_id: 'solid-core.reference.components.suspense',
          claim: 'SolidJS 1.x uses <Suspense> and createResource for asynchronous data boundaries.'
        }
      ];

  return {
    detected_version: detectedVersion,
    is_v2: isV2,
    status:
      detectedVersion === 'mixed'
        ? 'Mixed / Prohibited'
        : isV2
        ? 'Release Candidate (2.0.0-rc.9)'
        : 'Production Stable (Default)',
    version_mixing_detected: versionMixingDetected,
    mixing_issues: mixingIssues,
    rationale,
    approved_primitives: approvedPrimitives,
    forbidden_primitives: forbiddenPrimitives,
    citations
  };
}
