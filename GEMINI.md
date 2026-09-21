# solidJSkills Extension Context

This extension provides documentation and skill tools for the solidJSkills repository.

## Tool usage

- **API Symbols & Primitives**: Use `resolve_solid_api` for API symbols (e.g. `createSignal`, `useNavigate`, `Show`, `onMount`).
- **Corpus & Topic Search**: Use `search_corpus` or `search_docs` when searching by topic, keyword, or concept.
- **Reading Docs**:
  - Use `read_corpus_doc` with the `doc_id` returned from `search_corpus` or `resolve_solid_api`.
  - Use `read_doc` with any repository path, corpus path (e.g. `reference/basic-reactivity/create-signal.md`), or `doc_id`.
- **Browsing & Discovery**:
  - Use `list_corpus_docs` to browse categorized SolidJS documentation.
  - Use `list_docs` to discover all available repository files under allowed roots.

## Safety

All document reads are intentionally restricted to:

- `skills/`
- `guides/`
- `tools/templates/`
- `references/`
- `docs/`
- `solidJSdocs/`
