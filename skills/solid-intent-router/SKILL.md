---
name: solid-intent-router
description: "Route SolidJS user intent to the correct macro and domain subskill with deterministic keyword precedence and fallback rules. Use when selecting which Solid skill should execute first."
outputs:
  schema: ../../skills/contracts/intent-routing-output.schema.json
  format: routing-decision-record
requires_references:
  - references/intent-routing-guide.md
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../tools/gemini-mcp-extension/skill-routing-map.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-intent-router
  - node tools/scripts/run-smoke-evals.mjs
---

# solid-intent-router

## Trigger

Use this skill when a request could match multiple SolidJS skills and deterministic routing is required.

## Required Inputs

- Raw user prompt.
- Optional file/diff context if present.
- Optional runtime hint (core/router/start/meta).

## Workflow

1. Consult [intent-routing-guide.md](references/intent-routing-guide.md) to inspect macro skills and domain subskills precedence hierarchies.
2. Evaluate explicit package signals first (`solid-router`, `solid-start`, `solid-meta`).
3. Apply deterministic precedence from `tools/gemini-mcp-extension/skill-routing-map.md` and [intent-routing-guide.md](references/intent-routing-guide.md).
4. Select one primary macro skill (e.g. `solid-component-builder`, `solid-refactor-assistant`, `solid-reviewer`, `solid-scaffold-bootstrap`, `solid-design-patterns`) and one secondary domain subskill.
5. If confidence is low, choose the closest macro skill and annotate missing input.

## Failure Modes

- Conflicting package signals: route to `solid-design-patterns` + best-fit domain subskill.
- No recognizable signal: default to `solid-component-builder` + `solid-reactivity-core-expert`.
- Missing prompt text: fail and request prompt.

## Output Contract

Return output matching `IntentRoutingOutput` schema with `primary_skill`, `secondary_skill`, confidence, rationale, and `citations` (`doc_id`, `claim`).

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-intent-router`
- `node tools/scripts/run-smoke-evals.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-core.reference.basic-reactivity.create-signal` — core signal API (default fallback)
- `solid-router.solid-router.index` — router package overview
- `solid-start.solid-start.index` — SolidStart package overview
- `solid-meta.solid-meta.index` — solid-meta package overview

## References

- `references/intent-routing-guide.md`
- `../../tools/gemini-mcp-extension/skill-routing-map.md`
- `../../references/solidjs-normalized/manifest.jsonl`
- `../../references/solidjs-normalized/taxonomy.json`
