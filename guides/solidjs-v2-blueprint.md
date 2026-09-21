# solidJSkills Repository Blueprint: Phase 2 (Deterministic MCP Platform)

> [!NOTE]
> **Repository Architecture Milestone**: This document describes Phase 2 of the `solidJSkills` repository platform (18 deterministic skills, normalized docs corpus, output contracts, and MCP server). It is not a guide for SolidJS framework versioning. For framework differences between SolidJS 1.x (stable) and SolidJS 2.0-rc.9, see [SolidJS 2.0 RC Guide](solidjs-v2-rc-guide.md).

## Target state

Deliver a deterministic SolidJS skill system with:

1. Contract-enforced skills.
2. Normalized full-ecosystem docs corpus.
3. Layered routing (macro + domain subskills).
4. Local and CI quality gates.

## Core components

- Skill contract schema: `tools/schemas/skill-contract.schema.json`
- Output schemas: `skills/contracts/*.schema.json`
- Normalized corpus: `references/solidjs-normalized/`
- Validators: `tools/scripts/*.mjs`
- CI workflow: `.github/workflows/quality-gates.yml`

## Skill layers

### Macro

- `solid-component-builder`
- `solid-refactor-assistant`
- `solid-reviewer`
- `solid-scaffold-bootstrap`
- `solid-design-patterns`

### Router + domain

- `solid-intent-router`
- `solid-reactivity-core-expert`
- `solid-control-flow-rendering`
- `solid-state-architecture`
- `solid-router-data-navigation`
- `solid-start-server-runtime`
- `solid-ssr-hydration-debugger`
- `solid-meta-head-management`
- `solid-testing-quality-gates`

## Required quality commands

```bash
node tools/scripts/normalize-solid-docs.mjs --check
node tools/scripts/validate-solid-corpus.mjs
node tools/scripts/validate-skills.mjs
node tools/scripts/validate-output-contracts.mjs
node tools/scripts/run-smoke-evals.mjs
```
