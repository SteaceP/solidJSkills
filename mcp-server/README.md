# solidjskills MCP Server

[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue.svg)](https://modelcontextprotocol.io)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A specialized Model Context Protocol (MCP) server providing AI coding agents with instant, high-performance access to SolidJS documentation, normalized corpus knowledge, agent skills, reactivity audits, and deterministic intent routing.

---

## Features

- **Blazing Fast In-Memory Cache**: Manifest and repository documents are cached in memory with sub-millisecond query latency and automatic file-change invalidation.
- **Full-Text & Snippet Search**: Search through 230 normalized SolidJS document bodies, titles, symbols, and tags with contextual snippet extraction.
- **Section Extraction & Line Slicing**: Slices specific markdown headings or paginates lines to minimize context window consumption.
- **Fuzzy 404 Suggestions**: When a document or path is missing, returns helpful "Did you mean..." suggestions to prevent LLM recovery loops.
- **SolidJS Domain Intelligence**:
  - `route_solid_intent`: Deterministic skill routing based on explicit package and feature signals.
  - `audit_solid_code`: Static heuristic linter detecting prop destructuring, effect misuse, and reactivity leaks.
  - `get_solid_checklist`: Standard SolidJS review criteria and JSON contract schemas.
- **Full MCP Protocol Support**: Exposes **10 Tools**, **5 Resources & Templates**, and **4 Workflow Prompts**.

---

## Tools

### 1. Document & Corpus Tools

| Tool | Parameters | Description |
|:---|:---|:---|
| `list_docs` | _none_ | Lists all repository documents across allowed roots (`skills/`, `guides/`, `references/`, `docs/`, `solidJSdocs/`). |
| `read_doc` | `path` (string, required)<br>`section` (string, optional)<br>`max_lines` (int, optional)<br>`offset` (int, optional) | Reads a document by repository path, corpus path, or `doc_id`. Supports extracting specific heading sections and line pagination. |
| `search_docs` | `query` (string, required) | Fast search across repository paths and manifest metadata with full-text fallback. Supports camelCase, kebab-case, and multi-word queries. |
| `list_corpus_docs` | `package` (string, optional: `solid-core`, `solid-router`, `solid-start`, `solid-meta`, `solid-v2`)<br>`topic` (string, optional)<br>`limit` (int, default 100) | Lists normalized SolidJS corpus documents with stable metadata (`doc_id`, `package`, `topic`, `source_path`, `canonical_url`). |
| `read_corpus_doc` | `doc_id` (string, required)<br>`source` (`'normalized'` \| `'raw'`)<br>`section` (string, optional)<br>`max_lines` (int, optional)<br>`offset` (int, optional) | Reads a normalized SolidJS document by `doc_id`, returning manifest metadata and markdown body. Supports section extraction and pagination. |
| `search_corpus` | `query` (string, required)<br>`package` (string, optional)<br>`topic` (string, optional)<br>`full_text` (bool, default false)<br>`limit` (int, default 20) | Ranked search across corpus metadata and document bodies with matching snippet excerpts. |
| `resolve_solid_api` | `symbol` (string, required)<br>`limit` (int, default 10) | Direct API symbol lookup across manifest entries (e.g. `createSignal`, `useNavigate`, `Show`, `onMount`). |

### 2. SolidJS Domain Tools

| Tool | Parameters | Description |
|:---|:---|:---|
| `route_solid_intent` | `prompt` (string, required)<br>`runtime_hint` (string, optional) | Evaluates user prompt against deterministic routing rules, returning primary skill, secondary skill, validation commands, and citations. |
| `audit_solid_code` | `code` (string, required) | Static heuristic linter checking for prop destructuring (`const { a } = props`), `createEffect` for derived state, ternaries in JSX, and uncalled signal accessors. |
| `get_solid_checklist` | `type` (`'review'` \| `'contracts'`) | Returns the official SolidJS review checklist from `AGENTS.md` or lists available JSON contract schemas. |

---

## MCP Resources

Clients (Claude Desktop, Antigravity IDE, Cursor, Windsurf) can attach these resources directly into the context window:

### Static Resources

- **`solid://manifest`**: Full catalog of all normalized SolidJS documents with metadata counts.
- **`solid://taxonomy`**: Package and topic taxonomy hierarchy (`solid-core`, `solid-router`, `solid-start`, `solid-meta`, `solid-v2`).
- **`solid://skills`**: Index of all available agent skills in the repository with descriptions and file paths.

### Resource Templates

- **`solid://docs/{docId}`**: Direct access to a normalized document by `doc_id` (e.g. `solid://docs/solid-core.reference.basic-reactivity.create-signal`).
- **`solid://skills/{skillName}`**: Direct access to a skill's instructions (e.g. `solid://skills/solid-component-builder`).

---

## MCP Workflow Prompts

Pre-engineered prompts ready for execution in MCP-enabled clients:

- **`review-solid-code`**: Comprehensive review prompt validating reactivity preservation, control flow primitives, avoiding recomputation, and hydration compatibility.
- **`audit-reactivity`**: Deep reactivity audit analyzing signal access points, prop destructuring, effect loops, and stale closures.
- **`scaffold-component`**: Guided prompt for creating production-grade, accessible SolidJS components with TypeScript interfaces.
- **`migrate-react-to-solid`**: Step-by-step conversion instructions mapping React hooks to Solid fine-grained reactivity primitives.

---

## Client Configuration Examples

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "solidjskills": {
      "command": "node",
      "args": ["c:/mcpserver/solidJSkills/mcp-server/src/index.js"]
    }
  }
}
```

### Cursor & Windsurf (`.mcp.json`)

```json
{
  "mcpServers": {
    "solidjskills": {
      "command": "node",
      "args": ["${CLAUDE_PROJECT_DIR}/mcp-server/src/index.js"]
    }
  }
}
```

### Gemini CLI (`gemini-extension.json`)

```json
{
  "name": "solidjskills",
  "version": "2.0.0",
  "description": "Browse solidJSkills docs from Gemini CLI via MCP tools.",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "solidjskills-docs": {
      "command": "node",
      "args": ["${extensionPath}${/}mcp-server${/}src${/}index.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

---

## Development & Testing

```bash
# Run test suite and integration checks
npm test

# Run syntax check
npm --prefix mcp-server test

# Run integration tests directly
node tests/integration/mcp-server.test.mjs
```
