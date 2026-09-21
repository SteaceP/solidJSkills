# solidJSkills Extension Context

This extension provides documentation and skill tools for the solidJSkills repository.

## Framework Version Standards

- **Default Target (Production Stable)**: Target **SolidJS 1.x** (`<Index>`, `createResource`, `<Suspense>`, `<Dynamic>`, accessor `count()`, tuple setters).
- **Release Candidate (2.0-rc.9)**: When `package.json` specifies `"solid-js": "^2.0.0-rc"` or 2.0 is requested, apply 2.0 conventions (first-class async graph, `<For keyed={false}>`, `<Loading>`/`<Errored>`, `dynamic()`).
- **Never Mix Versions**: Prohibit mixing v1 and v2 APIs in the same component.

## Tool usage

- **Intent & Skill Routing**: Use `route_solid_intent` with the user prompt to identify the primary skill and secondary subskill.
- **Reactivity & Code Auditing**: Use `audit_solid_code` to statically check SolidJS code snippets for prop destructuring, effect abuse, and anti-patterns.
- **Quality Checklists**: Use `get_solid_checklist` (`type='review'`) to retrieve the AGENTS.md verification criteria.
- **API Symbols & Primitives**: Use `resolve_solid_api` for API symbols (e.g. `createSignal`, `useNavigate`, `Show`, `onMount`).
- **Corpus & Topic Search**: Use `search_corpus` (supports `full_text: true`) or `search_docs` when searching by topic, keyword, code phrase, or concept.
- **Reading Docs**:
  - Use `read_corpus_doc` with `doc_id` (supports `section` heading extraction and `max_lines` pagination).
  - Use `read_doc` with any repository path, corpus path (e.g. `reference/basic-reactivity/create-signal.md`), or `doc_id` (supports `section` and `max_lines`).
- **Browsing & Discovery**:
  - Use `list_corpus_docs` to browse categorized SolidJS documentation.
  - Use `list_docs` to discover all available repository files under allowed roots.

## MCP Resources & Prompts

- **Resources**: `solid://manifest`, `solid://taxonomy`, `solid://skills`, `solid://docs/{docId}`, `solid://skills/{skillName}`.
- **Prompts**: `review-solid-code`, `audit-reactivity`, `scaffold-component`, `migrate-react-to-solid`.

## Safety

All document reads are intentionally restricted to:

- `skills/`
- `guides/`
- `tools/templates/`
- `references/`
- `docs/`
- `solidJSdocs/`
