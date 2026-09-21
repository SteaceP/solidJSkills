---
name: solid-start-server-runtime
description: "Guide SolidStart server runtime patterns for handlers, middleware, server functions, and request events with explicit runtime constraints. Use for server-side SolidStart architecture and API behavior."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: solidstart-runtime-guidance
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/solidstart-runtime-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-start-server-runtime
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-start-server-runtime

## Trigger

Use for SolidStart 1.0 server runtime concerns: HTTP handlers (`createHandler`), middleware composition (`createMiddleware`), server RPC functions (`"use server"`), `getRequestEvent()`, and streaming responses.

## Required Inputs

- Server runtime target (Node, Cloudflare Workers, Netlify, Vercel).
- Route/API contract and auth/session dependencies.
- Header, cookie, redirect, and status code requirements.

## Workflow

1. Configure server entrypoint in `entry-server.tsx` using `createHandler()` and `StartServer`.
2. Define server functions with `"use server"` for type-safe client-to-server RPC:
   - Ensure arguments and return types are JSON/FormData serializable.
   - Access request cookies and headers safely via `getRequestEvent()`.
3. Compose request interceptors using `createMiddleware` for auth, telemetry, and rate limiting.
4. Establish clear security boundaries: never leak private database credentials or API secrets across `"use server"` boundaries into client bundles.

## Failure Modes

- Runtime/deployment target unspecified: request target before finalizing server config.
- Mixed client/server concerns without boundaries: enforce explicit `"use server"` separation.
- Missing auth/session model for protected endpoints: block completion until security boundary exists.

## Output Contract

Return `DomainGuidanceOutput` with runtime decisions, handoff steps, validation commands, and citations including `doc_id`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-start-server-runtime`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-start.solid-start.reference.server.use-server` — server function declarations
- `solid-start.solid-start.reference.server.create-middleware` — middleware composition
- `solid-start.solid-start.reference.server.create-handler` — custom server handlers
- `solid-start.solid-start.advanced.request-events` — request event lifecycle
- `solid-start.solid-start.advanced.middleware` — middleware patterns and ordering

## References

- `references/solidstart-runtime-guide.md`
- `../../references/solidjs-normalized/docs/solid-start/reference/server/create-handler.md`
- `../../references/solidjs-normalized/docs/solid-start/reference/server/create-middleware.md`
- `../../references/solidjs-normalized/docs/solid-start/reference/server/use-server.md`
- `../../references/solidjs-normalized/docs/solid-start/advanced/request-events.md`
- `../../references/solidjs-normalized/manifest.jsonl`
