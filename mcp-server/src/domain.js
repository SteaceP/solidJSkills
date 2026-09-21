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

  // Rule 5: store / context / shared state / provider boundary
  if (/\b(createstore|store|context|usecontext|createcontext|shared state|provider)\b/i.test(text)) {
    return {
      summary: 'Matched Solid state architecture and store/context intent.',
      primary_skill: 'solid-design-patterns',
      secondary_skill: 'solid-state-architecture',
      confidence: 0.9,
      rationale: [
        'User query contains store or context signals matching rule 5.',
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

  // Rule 6: Show / For / Switch / rendering branch / suspense fallback / Index
  if (/\b(show|for|switch|match|suspense|index component|control flow)\b/i.test(text)) {
    return {
      summary: 'Matched SolidJS control flow and conditional rendering intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-control-flow-rendering',
      confidence: 0.9,
      rationale: [
        'User query requests control flow or conditional branching matching rule 6.',
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

  // Rule 7: signal / memo / effect / resource / untrack / batch
  if (/\b(signal|createsignal|creatememo|createeffect|createresource|untrack|batch|reactivity)\b/i.test(text)) {
    return {
      summary: 'Matched core fine-grained reactivity intent.',
      primary_skill: 'solid-component-builder',
      secondary_skill: 'solid-reactivity-core-expert',
      confidence: 0.95,
      rationale: [
        'User query specifies core reactivity primitives matching rule 7.',
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

  // Rule 8: test / quality gate / checklist / regression
  if (/\b(test|testing|quality gate|checklist|audit|vitest|jest)\b/i.test(text)) {
    return {
      summary: 'Matched testing and quality gate verification intent.',
      primary_skill: 'solid-reviewer',
      secondary_skill: 'solid-testing-quality-gates',
      confidence: 0.9,
      rationale: [
        'User query targets quality gates or test suites matching rule 8.',
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

  // Rule 9: scaffold / bootstrap / new app / setup
  if (/\b(scaffold|bootstrap|new app|init|project setup)\b/i.test(text)) {
    return {
      summary: 'Matched project scaffolding and bootstrap intent.',
      primary_skill: 'solid-scaffold-bootstrap',
      secondary_skill: 'solid-testing-quality-gates',
      confidence: 0.9,
      rationale: [
        'User query targets initial setup or bootstrapping matching rule 9.',
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

  // Fallback: rule 10
  return {
    summary: 'Default fallback to component builder and core reactivity expert.',
    primary_skill: 'solid-component-builder',
    secondary_skill: 'solid-reactivity-core-expert',
    confidence: 0.7,
    rationale: [
      'No explicit specialized package signals detected in prompt.',
      'Applying rule 10 deterministic fallback to solid-component-builder + solid-reactivity-core-expert.'
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
