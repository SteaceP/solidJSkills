# solidJSkills

![SolidJS Skills Logo](logo.png)

## What is this?

I work with SolidJS and wanted my AI coding agent to actually be helpful with it. I couldn't find anything out there focused on SolidJS, so I built this.

This is a collection of SolidJS-focused skills, guides, and documentation designed to work with AI agents via the Model Context Protocol (MCP). It was originally built as a Gemini-CLI extension, but it also works with Windsurf, Cursor, Antigravity, and other MCP-compatible clients.

<!-- TODO: Add screenshot of solidJSkills in action with Gemini-CLI -->

When you connect your AI agent to this, it gets:

- **SolidJS Framework Version Standards**:
  - **SolidJS 1.x (Production Stable - Default)**: Strict enforcement of production conventions (`createSignal` accessor calls `count()`, `<Index>` for primitive arrays, `<Suspense fallback={...}>`, `createResource`, `mergeProps`/`splitProps`).
  - **SolidJS 2.0-rc.9 (Release Candidate)**: First-class async reactive graph, `<For keyed={false}>` (replacing `<Index>`), `<Loading>` and `<Errored>` boundaries (replacing `<Suspense>`), `<Reveal>` (replacing `<SuspenseList>`), microtask auto-batching and `flush()` (replacing `batch()`), generator `action()` and `createOptimisticStore()`, and Vite plugin start mode.
  - **Zero Version Mixing**: Prohibits mixing v1 and v2 APIs in the same component.
- **18 Specialized SolidJS Skills**: Contract-enforced workflows covering component creation, React-to-Solid migration, 1.x-to-2.0 upgrades, fine-grained reactivity audits, full-stack SolidStart, accessibility (Kobalte/Corvu), animation, and testing.
- **11 MCP Tools**: Real-time access to a 233-doc normalized corpus, symbol resolution, intent routing, version detection, static code auditing, and AGENTS.md verification checklists.
- **4 MCP Prompts**: Pre-engineered prompts for code review, reactivity auditing, component scaffolding, and React-to-Solid conversion.
- **Validation Quality Gates**: Deterministic scripts (`npm test`) ensuring all docs, output contracts, and skill references adhere to repository standards.

---

## Supported Framework Versions

| Dimension | SolidJS 1.x (Production Stable - Default) | SolidJS 2.0-rc.9 (Release Candidate) |
| :--- | :--- | :--- |
| **Status** | Production Stable (Default) | Release Candidate (`2.0.0-rc.9`) |
| **Targeting Trigger** | Default, or `"solid-js": "^1.x"` in `package.json` | Explicit request, or `"solid-js": "^2.0.0-rc"` |
| **Async Data** | `createResource(source, fetcher)` + `<Suspense>` | Native async graph: `createMemo(async () => ...)` |
| **Async Boundaries** | `<Suspense fallback={<Spinner />}>` | `<Loading fallback={<Spinner />}>` + `<Errored>` |
| **Boundary Reveal** | `<SuspenseList revealOrder="..." tail="...">` | `<Reveal order="sequential"\|"together" collapsed>` |
| **Primitive Lists** | `<Index each={list()}>{(item, i) => ...}</Index>` | `<For each={list()} keyed={false}>{(item, i) => ...}</For>` |
| **Keyed Lists** | `<For each={list()}>{(item, i) => ...}</For>` | `<For each={list()} keyed>{(item, i) => ...}</For>` |
| **Batching** | Manual `batch(() => { ... })` | Auto-batched on microtask; `flush()` for sync reads |
| **Dynamic Element** | `<Dynamic component={Tag} />` | Functional `dynamic(Tag)` |
| **Mutations** | Manual signals or router actions | Generator `action(function* () { yield ... })` |
| **Full-Stack / SSR** | Standalone `@solidjs/start` (Vinxi) | Vite plugin Start Mode (`@solidjs/vite-plugin`) |

---

## SolidJS Coding & Design Standards

The MCP server tools, skills, and prompts enforce these core SolidJS architectural standards:

- **Reactivity & State Management**:
  - **Never Destructure Props**: Props in Solid are reactive proxies (`props.foo`). Destructuring strips reactivity. Access `props.propName` directly or use `splitProps`/`mergeProps`.
  - **Derivation Over Effects**: Never use `createEffect` to synchronize or duplicate state into another signal. Use `createMemo` for derived computations.
  - **Isolate Side Effects**: Keep `createEffect` exclusively for real DOM mutations, logging, analytics, or external subscriptions.
  - **Children Handling**: Use `children(() => props.children)` when interacting with or memoizing children JSX to avoid repeatedly re-evaluating DOM elements.
- **Control Flow & Rendering**:
  - **Use Solid Control Flow Primitives**: Avoid JavaScript ternaries (`cond ? <A/> : <B/>`) or array `.map()` in JSX. Always use `<Show>`, `<For>`, `<Index>` (v1), `<Switch>`, `<Match>`, and `<Portal>`.
  - **Keyed vs Non-Keyed Lists**: In 1.x, use `<For>` for object arrays keyed by item reference, and `<Index>` for primitive arrays. In 2.0, default `<For>` is keyed; use `<For keyed={false}>` for non-keyed index lists.
- **Full-Stack, SSR & Hydration Safety**:
  - **No Client Globals at Root**: Never access `window`, `document`, or `localStorage` during initial module evaluation or top-level component setup.
  - **Hydration Boundaries**: Guard browser-only logic inside `onMount` or behind `isServer` checks from `solid-js/web`.

---

## Available MCP Tools & Prompts

### 11 MCP Tools
The `solidjskills` server exposes 11 tools accessible to any MCP client:

1. `list_docs`: List all documentation files across allowed repository roots.
2. `read_doc`: Read a document by repo path, corpus path, or `doc_id` (supports section extraction and line pagination).
3. `search_docs`: Search documentation by API symbol, keyword, or path.
4. `list_corpus_docs`: List normalized SolidJS corpus documents with stable metadata (`package`, `topic`, `doc_id`).
5. `read_corpus_doc`: Read a normalized corpus document by `doc_id`.
6. `search_corpus`: Ranked manifest-backed search using headings, tags, symbols, and topics (supports `full_text: true`).
7. `resolve_solid_api`: Resolve a Solid API symbol (e.g. `createSignal`, `createMemo`, `Loading`, `dynamic`) directly to authoritative documentation.
8. `route_solid_intent`: Deterministically route user requirements to primary and secondary skills with confidence score and rationale.
9. `audit_solid_code`: Statically analyze SolidJS code snippets for prop destructuring, effect misuse, memo signal mutations, untracked prop copies, SSR client global leaks, uninvoked signals, and mixed v1/v2 API anti-patterns.
10. `get_solid_checklist`: Retrieve AGENTS.md verification criteria (`type='review'`) or output schemas (`type='contracts'`).
11. `detect_solid_version`: Analyze `package.json` and/or code snippets to detect target SolidJS framework version (1.x Production Stable vs 2.0-rc.9), return approved/forbidden primitives, and enforce zero version mixing.

### 4 MCP Prompts
- `review-solid-code`: Structured review against AGENTS.md reactivity, version standards, performance, and accessibility checklist.
- `audit-reactivity`: Pinpointed audit detecting signal leaks, lost reactivity, stale closures, or effect loops.
- `scaffold-component`: Production-grade TypeScript component scaffolding with proper props proxying and ARIA semantics.
- `migrate-react-to-solid`: Deterministic mapping from React hooks (`useState`, `useEffect`, `useMemo`, `.map()`) to native SolidJS primitives.

---

## 18 Specialized Skills

Skills are organized into three layers:

- **Macro Skills**: `solid-component-builder`, `solid-refactor-assistant`, `solid-reviewer`, `solid-scaffold-bootstrap`, `solid-design-patterns`.
- **Domain Subskills**: `solid-intent-router`, `solid-reactivity-core-expert`, `solid-control-flow-rendering`, `solid-state-architecture`, `solid-primitives-ecosystem`, `solid-forms-validation`, `solid-accessibility-a11y`, `solid-animation-transitions`, `solid-router-data-navigation`, `solid-ssr-hydration-debugger`, `solid-start-server-runtime`, `solid-meta-head-management`.
- **Quality & Testing**: `solid-testing-quality-gates`.

Every skill includes a dedicated in-depth guide in its `references/` directory.

---

## Getting Started

The MCP server is what lets your AI agent talk to this repository. It's included in the `mcp-server` directory.

### Install the MCP Server

```bash
cd mcp-server
npm install
```

You can test that it starts correctly (it uses stdio, so it'll just wait for input):

```bash
node src/index.js
```

*(Press `Ctrl+C` to exit)*

## Setup with Gemini-CLI (Primary)

This project was originally built for Gemini-CLI, so that's the recommended setup.

<!-- TODO: Add screenshot of Gemini-CLI configuration -->

**Method 1: Using gemini-extension.json (Recommended)**

The easiest way is to use the included `gemini-extension.json` file:

1. Copy or symlink `gemini-extension.json` to your Gemini-CLI extensions directory
2. Edit the paths to point to your local clone of this repo

**Method 2: Manual Configuration**

If you prefer to configure manually, see the [GEMINI.md](GEMINI.md) file for detailed setup instructions.
 
## Setup with Other IDEs

### Claude Code (CLI)

#### Option A: Automatic Discovery (Project Scope)

This repository includes a project-scoped `.mcp.json` file at the root. When you run Claude Code inside this project directory, it will automatically detect and load the `solidjskills` MCP server.
*(Note: Make sure you run `npm install` inside the `mcp-server` directory first!)*

#### Option B: Global Configuration (User Scope)

If you want to use the `solidjskills` MCP server in Claude Code across all your projects:

**Method 1: Using the Claude CLI**
Run the following command:

```bash
claude mcp add solidjskills node /ABSOLUTE/PATH/TO/solidJSkills/mcp-server/src/index.js --scope user
```

**Method 2: Manual Config**
Add the server definition to your `~/.claude.json` file:

```json
{
  "mcpServers": {
    "solidjskills": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/solidJSkills/mcp-server/src/index.js"]
    }
  }
}
```

*(Make sure to replace `/ABSOLUTE/PATH/TO/...` with the actual path to the cloned repository on your machine)*

### Windsurf / Cascade

Add this to your `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "solidjskills": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/solidJSkills/mcp-server/src/index.js"],
      "cwd": "/ABSOLUTE/PATH/TO/solidJSkills/mcp-server"
    }
  }
}
```

**Note:** Replace `/ABSOLUTE/PATH/TO/...` with the actual path on your machine.

### Cursor

1. Open **Cursor Settings** > **Features** > **MCP**
2. Click **+ Add New MCP Server**
3. Fill in:
   - **Name**: `solidjskills`
   - **Type**: `command`
   - **Command**: `node /ABSOLUTE/PATH/TO/solidJSkills/mcp-server/src/index.js`
4. Click **Save**

### Antigravity & Other MCP Clients

Most MCP clients need a command to start the server. Use:

- **Command**: `node`
- **Args**: `/ABSOLUTE/PATH/TO/solidJSkills/mcp-server/src/index.js`

## Quality Gates & Validation

Run the complete test suite and quality gates:

```bash
# Run all quality gates (corpus validation, skill checks, contract verification, smoke evals, integration tests)
npm test

# Run individual verification checks
npm run validate:corpus     # Validates 233 normalized docs in manifest.jsonl
npm run validate:skills     # Validates all 18 solid skill definitions and contracts
npm run validate:contracts  # Validates JSON schema contracts
npm run smoke               # Executes intent router and skill smoke evaluations
npm run test:integration    # Executes MCP server integration suite (41 checks)
```

### Automated Releases

To publish a release, tag, and trigger the GitHub Actions release workflow:

```bash
# Patch bump (1.3.0 -> 1.3.1), test, tag, and push:
npm run release:patch

# Minor bump (1.3.0 -> 1.4.0):
npm run release:minor

# Major bump (1.3.0 -> 2.0.0):
npm run release:major
```

This runs quality gates, syncs version numbers in `package.json`, `package-lock.json`, and `gemini-extension.json`, commits, creates an annotated tag, and pushes with `--follow-tags`. See the [Extension Release Guide](guides/extension-release-guide.md) for full details.

## Contributing

Want to add new skills or improve the documentation? Here's how:

1. **Adding a skill**: Run `npm run scaffold` or create a new directory in `skills/` (e.g., `skills/solid-my-new-skill/`) and add a `SKILL.md` file based on `tools/templates/SKILL.template.md`.
2. **Adding documentation**: Put detailed docs in `references/`.
3. **Improving guides**: The `guides/` directory has instructions for building skills, creating rules, and setting up workflows. Feel free to improve them or add new ones.

If you want to understand how everything is wired together under the hood, check out the [architecture docs](docs/ARCHITECTURE.md).

## License

MIT — See [LICENSE](LICENSE) for details.
