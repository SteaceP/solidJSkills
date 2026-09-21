# Gemini MCP Extension (SolidJS Alignment)

This directory defines the Phase 2 (Extension Platform) routing and quality contract for Gemini MCP integration.

## Goals

- Route requests through `solid-intent-router` with deterministic macro/subskill precedence.
- Target SolidJS 1.x (Production Stable) by default; support SolidJS 2.0-rc.9 (Release Candidate) when specified.
- Enforce citation-backed outputs using normalized corpus `doc_id` references (`solid-core`, `solid-router`, `solid-start`, `solid-meta`, `solid-v2`).

## Contents

- `extension-blueprint.md` — v2 routing and quality architecture.
- `skill-routing-map.md` — deterministic precedence and intent map.
- `prompts/solidjs-system-instructions.md` — baseline system instruction template.

## Maintenance

- Update routing map and smoke fixtures together.
- Keep prompts aligned with skill contract section order.
- Run `node tools/scripts/run-smoke-evals.mjs` after routing changes.
