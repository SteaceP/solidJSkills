---
name: solid-meta-head-management
description: "Apply solid-meta head and metadata primitives with deterministic SSR-safe behavior. Use for title/meta/link/style/base management across route and layout boundaries."
outputs:
  schema: ../../skills/contracts/domain-guidance-output.schema.json
  format: metadata-guidance-checklist
requires_references:
  - ../../references/solidjs-normalized/manifest.jsonl
  - ../../references/solidjs-normalized/taxonomy.json
  - references/meta-head-guide.md
validation_commands:
  - node tools/scripts/validate-skills.mjs --skill solid-meta-head-management
  - node tools/scripts/validate-solid-corpus.mjs
---

# solid-meta-head-management

## Trigger

Use for head metadata strategy using `@solidjs/meta`: `<MetaProvider>`, `<Title>`, `<Meta>`, `<Link>`, and `<Style>` across route and layout boundaries.

## Required Inputs

- Route/layout metadata hierarchy (root defaults vs page overrides).
- SSR streaming vs static extraction requirements.
- SEO, OpenGraph, Twitter card, and canonical link specifications.

## Workflow

1. Place `<MetaProvider>` at root/layout boundary in `App.tsx` or `entry-server.tsx`.
2. Define base fallback tags (`<Title>`, `<Meta name="description">`) at root.
3. Apply fine-grained reactive overrides in child routes using reactive props/signals.
4. Verify SSR extraction: confirm head tags render in `<head>` and stream with `{assets}` in SolidStart without layout shift.

## Failure Modes

- Multiple owners for same metadata field without precedence: enforce child-route precedence.
- Unwrapped meta tags: ensure all head tags are contained within `<MetaProvider>`.
- Non-reactive meta tags with dynamic content: ensure title/content bindings use reactive accessor values.

## Output Contract

Return `DomainGuidanceOutput` with metadata decisions, handoff steps, and citations that include normalized `doc_id`.

## Validation

- `node tools/scripts/validate-skills.mjs --skill solid-meta-head-management`
- `node tools/scripts/validate-solid-corpus.mjs`

## Key Corpus References

Use these `doc_id` values with the `read_corpus_doc` MCP tool:

- `solid-meta.solid-meta.reference.meta.metaprovider` — metadata provider setup
- `solid-meta.solid-meta.reference.meta.title` — document title management
- `solid-meta.solid-meta.reference.meta.meta` — meta tag composition
- `solid-meta.solid-meta.reference.meta.link` — link tag management
- `solid-meta.solid-meta.getting-started.server-setup` — SSR metadata setup

## References

- `references/meta-head-guide.md`
- `../../references/solidjs-normalized/docs/solid-meta/reference/meta/metaprovider.md`
- `../../references/solidjs-normalized/docs/solid-meta/reference/meta/title.md`
- `../../references/solidjs-normalized/docs/solid-meta/reference/meta/meta.md`
- `../../references/solidjs-normalized/docs/solid-meta/reference/meta/link.md`
- `../../references/solidjs-normalized/manifest.jsonl`
