---
name: solid-reviewer
description: "Review SolidJS diffs for correctness, reactivity safety, SSR/hydration risk, and maintainability with deterministic severity ordering. Use when auditing PRs or producing final review findings."
outputs:
  schema: ../../skills/contracts/review-output.schema.json
  format: severity-ordered-findings-with-fixes
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/review-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-reviewer
  - node tools/scripts/validate-output-contracts.mjs
---

# solid-reviewer

## Trigger

Use this skill for code review and PR audits of SolidJS code: verifying reactivity correctness, finding prop destructuring anti-patterns, evaluating control flow performance, catching SSR hydration mismatches, and prioritizing findings by severity.

## Required Inputs

- Diff, pull request context, or changed files.
- Runtime target (client SPA, SSR, or SolidStart).
- Quality constraints (performance budgets, accessibility, release urgency).

## Workflow

1. Determine target framework version:
   - Check `package.json` for `"solid-js"`: default to **SolidJS 1.x (Production Stable)** unless `"solid-js": "^2.0.0-rc"` is specified.
   - Enforce that v1 and v2 APIs are never mixed.
2. Triage by severity in strict order: correctness (P0), performance (P1), maintainability (P2), accessibility (P3).
3. Audit reactivity invariants:
   - Flag props destructuring (`const { val } = props`).
   - Flag effects used to compute state (`createEffect(() => setX(y()))`).
   - Verify signal invocations in JSX (`{count()}`).
4. Check control flow and performance against version standards:
   - **Solid 1.x**: Validate `<For>` vs `<Index>` usage based on object identity vs primitive values; `<Suspense>` with fallback; `<Dynamic>`.
   - **Solid 2.0-rc.9**: Validate `<For keyed={false}>` (`<Index>` removed); `<Loading>` and `<Errored>` boundaries; `dynamic()`; absence of manual `batch()`.
   - Enforce `<Switch>/<Match>` over nested JSX ternaries.
   - Check for repeated `props.children` access without `children()` helper.
5. Verify SSR & hydration safety: ensure browser globals are guarded by `onMount()`.
6. Map every finding to an exact file anchor, severity level, and concrete remediation code.

## Failure Modes

- Missing diff context: fail and request files or patch.
- Mixed Solid 1.x and 2.0 APIs in the same component or diff: flag as P0 correctness violation.
- Findings without reproducible impact: downgrade to question or remove.
- Suggestions without file-level anchor: invalid until anchored.
- No findings detected: explicitly state "No findings" and list residual test gaps.

## Output Contract

Return output matching `ReviewOutput` schema at `../../skills/contracts/review-output.schema.json` with:

- `summary`, `findings`, `open_questions`, `validation_commands`.
- `findings` ordered by severity and containing `file` (and `line` when available).
- `citations`: every standards claim must include normalized `doc_id` + `claim`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-reviewer`
- `node tools/scripts/validate-output-contracts.mjs`

## References

- `references/review-guide.md`
- `../../references/solidjs-normalized/manifest.jsonl`
- `../../references/solidjs-normalized/taxonomy.json`
- `../../references/solidjs/review-checklist.md`
- `../../references/solidjs/control-flow.md`
- `../../references/solidjs/performance-ssr.md`
