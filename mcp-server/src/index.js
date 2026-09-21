#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const normalizedRoot = path.join(repoRoot, 'references', 'solidjs-normalized');
const normalizedDocsRoot = path.join(normalizedRoot, 'docs');
const manifestPath = path.join(normalizedRoot, 'manifest.jsonl');

const ALLOWED_DIRS = ['skills', 'guides', path.join('tools', 'templates'), 'references', 'docs', 'solidJSdocs'];

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function normalizePath(inputPath) {
  if (typeof inputPath !== 'string' || inputPath.trim() === '') {
    throw new Error("'path' must be a non-empty string.");
  }

  const cleaned = inputPath.trim().replace(/^[/\\]+/, '');
  const resolved = path.resolve(repoRoot, cleaned);

  if (!resolved.startsWith(`${repoRoot}${path.sep}`) && resolved !== repoRoot) {
    throw new Error('Path escapes repository root.');
  }

  const isAllowed = ALLOWED_DIRS.some((dir) => {
    const allowedRoot = path.resolve(repoRoot, dir);
    return resolved === allowedRoot || resolved.startsWith(`${allowedRoot}${path.sep}`);
  });

  if (!isAllowed) {
    throw new Error(`Path must be inside one of: ${ALLOWED_DIRS.join(', ')}`);
  }

  return resolved;
}

async function resolveDocPath(inputPath) {
  if (typeof inputPath !== 'string' || inputPath.trim() === '') {
    throw new Error("'path' must be a non-empty string.");
  }

  const trimmed = inputPath.trim();

  // 1. Check if inputPath is a doc_id in manifest
  try {
    const manifest = await loadManifest();
    const entry = manifest.find((item) => item.doc_id === trimmed);
    if (entry) {
      const normalizedPath = entry.normalized_path || entry.source_path;
      return path.resolve(normalizedDocsRoot, normalizedPath);
    }
  } catch {
    // Ignore manifest load error
  }

  const cleaned = trimmed.replace(/^[/\\]+/, '');

  // 2. Direct repository-relative path that exists
  const directResolved = path.resolve(repoRoot, cleaned);
  try {
    const stat = await fs.stat(directResolved);
    if (stat.isFile()) {
      return normalizePath(cleaned);
    }
  } catch {}

  // 3. Path relative to normalized docs root (e.g. reference/basic-reactivity/create-signal.md)
  const corpusCandidate = path.resolve(normalizedDocsRoot, cleaned);
  try {
    const stat = await fs.stat(corpusCandidate);
    if (stat.isFile()) {
      return corpusCandidate;
    }
  } catch {}

  // 4. Try appending .md if omitted
  if (!cleaned.endsWith('.md')) {
    try {
      const stat = await fs.stat(path.resolve(repoRoot, `${cleaned}.md`));
      if (stat.isFile()) {
        return normalizePath(`${cleaned}.md`);
      }
    } catch {}

    try {
      const stat = await fs.stat(path.resolve(normalizedDocsRoot, `${cleaned}.md`));
      if (stat.isFile()) {
        return path.resolve(normalizedDocsRoot, `${cleaned}.md`);
      }
    } catch {}
  }

  // Fallback to normalizePath which validates boundaries and allowed roots
  return normalizePath(cleaned);
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git') continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function listRepositoryDocs() {
  const roots = ALLOWED_DIRS.map((d) => path.resolve(repoRoot, d));
  const output = [];

  for (const root of roots) {
    try {
      const files = await walkFiles(root);
      for (const file of files) {
        output.push(path.relative(repoRoot, file));
      }
    } catch {
      // Skip roots that do not exist.
    }
  }

  return output.sort((a, b) => a.localeCompare(b));
}

async function loadManifest() {
  const content = await fs.readFile(manifestPath, 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function filterManifestEntries(entries, { packageName, topic }) {
  return entries.filter((entry) => {
    if (packageName && entry.package !== packageName) return false;
    if (topic && entry.topic !== topic) return false;
    return true;
  });
}

function formatCorpusEntry(entry) {
  return {
    doc_id: entry.doc_id,
    package: entry.package,
    topic: entry.topic,
    source_path: entry.source_path,
    normalized_path: entry.normalized_path,
    canonical_url: entry.canonical_url,
    tags: entry.tags,
    headings: entry.headings
  };
}

function scoreEntry(entry, queryLower) {
  let score = 0;

  if (entry.doc_id.toLowerCase().includes(queryLower)) score += 5;
  if (entry.source_path.toLowerCase().includes(queryLower)) score += 4;
  if ((entry.normalized_path || '').toLowerCase().includes(queryLower)) score += 3;

  for (const heading of entry.headings || []) {
    if (heading.toLowerCase().includes(queryLower)) score += 2;
  }

  for (const tag of entry.tags || []) {
    if (String(tag).toLowerCase().includes(queryLower)) score += 1;
  }

  for (const symbol of entry.symbols || []) {
    if (String(symbol).toLowerCase().includes(queryLower)) score += 2;
  }

  return score;
}

async function readCorpusDocument(entry, source = 'normalized') {
  if (source === 'raw') {
    const rawPath = path.resolve(repoRoot, 'solidJSdocs', entry.source_path);
    try {
      const text = await fs.readFile(rawPath, 'utf8');
      return { text, path: path.relative(repoRoot, rawPath) };
    } catch (err) {
      if (err.code === 'ENOENT') {
        const normalizedPath = entry.normalized_path || entry.source_path;
        const fullPath = path.resolve(normalizedDocsRoot, normalizedPath);
        const text = await fs.readFile(fullPath, 'utf8');
        return {
          text: `<!-- Note: raw source not found under 'solidJSdocs/${entry.source_path}'; falling back to normalized corpus -->\n\n${text}`,
          path: path.relative(repoRoot, fullPath)
        };
      }
      throw err;
    }
  }

  const normalizedPath = entry.normalized_path || entry.source_path;
  const fullPath = path.resolve(normalizedDocsRoot, normalizedPath);
  const text = await fs.readFile(fullPath, 'utf8');
  return { text, path: path.relative(repoRoot, fullPath) };
}

const server = new McpServer({
  name: 'solidjskills-mcp',
  version: '2.0.0'
});

server.registerTool(
  'list_docs',
  {
    description: 'List all docs under skills/, guides/, tools/templates/, references/, docs/, and solidJSdocs/.',
    inputSchema: z.object({}).shape
  },
  async () => {
    const docs = await listRepositoryDocs();
    return {
      content: [
        {
          type: 'text',
          text: docs.join('\n')
        }
      ]
    };
  }
);

server.registerTool(
  'read_doc',
  {
    description:
      'Read one document by repository-relative path, corpus-relative path (e.g. reference/basic-reactivity/create-signal.md), or doc_id.',
    inputSchema: z
      .object({
        path: z
          .string()
          .min(1)
          .describe('Repository path, corpus path, or doc_id (e.g. solid-core.reference.basic-reactivity.create-signal)')
      })
  },
  async ({ path: documentPath }) => {
    const fullPath = await resolveDocPath(documentPath);
    const contents = await fs.readFile(fullPath, 'utf8');
    const relativePath = path.relative(repoRoot, fullPath);

    return {
      content: [
        {
          type: 'text',
          text: `# ${relativePath}\n\n${contents}`
        }
      ]
    };
  }
);

server.registerTool(
  'search_docs',
  {
    description:
      'Search repository docs and SolidJS corpus by API symbol, topic, keyword, or path (supports camelCase, kebab-case, and multi-word queries).',
    inputSchema: z
      .object({
        query: z.string().min(1).describe('Search query, symbol, topic, or path')
      })
  },
  async ({ query }) => {
    const queryTrimmed = query.trim();
    const queryLower = queryTrimmed.toLowerCase();
    const queryKebab = toKebabCase(queryTrimmed);
    const queryTokens = queryLower.split(/[\s\-_]+/).filter(Boolean);

    const matchedPaths = new Map();

    function addMatch(docRelPath, score) {
      const normalizedRel = docRelPath.split(path.sep).join('/');
      const current = matchedPaths.get(normalizedRel) || 0;
      if (score > current) {
        matchedPaths.set(normalizedRel, score);
      }
    }

    // 1. Search manifest entries (symbols, headings, tags, doc_id, paths)
    try {
      const manifest = await loadManifest();
      for (const entry of manifest) {
        const targetRel = path.relative(
          repoRoot,
          path.resolve(normalizedDocsRoot, entry.normalized_path || entry.source_path)
        );
        let score = 0;

        // Exact symbol match
        if ((entry.symbols || []).some((s) => String(s).toLowerCase() === queryLower || toKebabCase(String(s)) === queryKebab)) {
          score += 15;
        } else if ((entry.symbols || []).some((s) => String(s).toLowerCase().includes(queryLower))) {
          score += 8;
        }

        // Exact heading match
        if ((entry.headings || []).some((h) => h.toLowerCase() === queryLower || toKebabCase(h) === queryKebab)) {
          score += 12;
        } else if ((entry.headings || []).some((h) => h.toLowerCase().includes(queryLower))) {
          score += 6;
        }

        // Tags match
        if ((entry.tags || []).some((t) => String(t).toLowerCase() === queryLower || String(t).toLowerCase() === queryKebab)) {
          score += 8;
        } else if ((entry.tags || []).some((t) => String(t).toLowerCase().includes(queryLower))) {
          score += 4;
        }

        // doc_id or source_path match
        if (entry.doc_id.toLowerCase().includes(queryLower) || entry.doc_id.toLowerCase().includes(queryKebab)) {
          score += 7;
        }
        if (entry.source_path.toLowerCase().includes(queryLower) || entry.source_path.toLowerCase().includes(queryKebab)) {
          score += 5;
        }

        // Token match: all tokens present
        if (queryTokens.length > 1) {
          const allTokensMatch = queryTokens.every((token) =>
            entry.doc_id.toLowerCase().includes(token) ||
            entry.source_path.toLowerCase().includes(token) ||
            (entry.tags || []).some((t) => String(t).toLowerCase().includes(token)) ||
            (entry.headings || []).some((h) => h.toLowerCase().includes(token))
          );
          if (allTokensMatch) score += 5;
        }

        if (score > 0) {
          addMatch(targetRel, score);
        }
      }
    } catch {
      // Manifest not available, continue
    }

    // 2. Search all repository file paths (skills, guides, references, tools)
    const docs = await listRepositoryDocs();
    for (const doc of docs) {
      const docLower = doc.toLowerCase();
      const docNormalized = doc.split(path.sep).join('/').toLowerCase();
      let score = 0;

      if (docLower.includes(queryLower)) score += 5;
      if (queryKebab && docLower.includes(queryKebab)) score += 5;

      if (queryTokens.length > 1 && queryTokens.every((token) => docNormalized.includes(token))) {
        score += 4;
      }

      if (score > 0) {
        addMatch(doc, score);
      }
    }

    if (matchedPaths.size === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No matching documents found for '${query}'.`
          }
        ]
      };
    }

    // Sort by score descending, then alphabetically
    const sorted = Array.from(matchedPaths.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([docPath]) => docPath);

    return {
      content: [
        {
          type: 'text',
          text: sorted.join('\n')
        }
      ]
    };
  }
);

server.registerTool(
  'list_corpus_docs',
  {
    description:
      'List normalized SolidJS corpus documents with stable metadata fields (doc_id, package, topic, source_path).',
    inputSchema: z
      .object({
        package: z.string().optional().describe('Optional package filter: solid-core, solid-router, solid-start, solid-meta'),
        topic: z.string().optional().describe('Optional topic filter (exact match).'),
        limit: z.number().int().min(1).max(500).default(100).describe('Maximum records to return.')
      })
  },
  async ({ package: packageName, topic, limit = 100 }) => {
    const manifest = await loadManifest();
    const filtered = filterManifestEntries(manifest, { packageName, topic }).slice(0, limit);
    const payload = filtered.map((entry) => formatCorpusEntry(entry));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(payload, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  'read_corpus_doc',
  {
    description:
      'Read one corpus document by doc_id, returning metadata from manifest and the chosen source body (normalized or raw).',
    inputSchema: z
      .object({
        doc_id: z.string().min(1).describe('Document identifier from manifest.jsonl.'),
        source: z.enum(['normalized', 'raw']).default('normalized').describe('Which source body to return.')
      })
  },
  async ({ doc_id: docId, source = 'normalized' }) => {
    const manifest = await loadManifest();
    const entry = manifest.find((item) => item.doc_id === docId);

    if (!entry) {
      return {
        content: [
          {
            type: 'text',
            text: `No corpus document found for doc_id '${docId}'.`
          }
        ]
      };
    }

    const { text, path: resolvedPath } = await readCorpusDocument(entry, source);
    const metadata = formatCorpusEntry(entry);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              metadata,
              source,
              resolved_path: resolvedPath,
              body: text
            },
            null,
            2
          )
        }
      ]
    };
  }
);

server.registerTool(
  'search_corpus',
  {
    description:
      'Search normalized corpus metadata and rank matches using doc_id/path/headings/tags/symbols; returns stable manifest-backed results.',
    inputSchema: z
      .object({
        query: z.string().min(1).describe('Search query.'),
        package: z.string().optional().describe('Optional package filter.'),
        topic: z.string().optional().describe('Optional topic filter.'),
        limit: z.number().int().min(1).max(100).default(20)
      })
  },
  async ({ query, package: packageName, topic, limit = 20 }) => {
    const queryLower = query.toLowerCase();
    const manifest = await loadManifest();
    const filtered = filterManifestEntries(manifest, { packageName, topic });

    const ranked = filtered
      .map((entry) => ({ entry, score: scoreEntry(entry, queryLower) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.doc_id.localeCompare(b.entry.doc_id))
      .slice(0, limit)
      .map((item) => ({ score: item.score, ...formatCorpusEntry(item.entry) }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(ranked, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  'resolve_solid_api',
  {
    description:
      'Resolve a Solid API symbol to manifest-backed docs using symbol, heading, and path matching.',
    inputSchema: z
      .object({
        symbol: z.string().min(1).describe('API symbol, e.g. createSignal, useNavigate, StartServer'),
        limit: z.number().int().min(1).max(50).default(10)
      })
  },
  async ({ symbol, limit = 10 }) => {
    const queryLower = symbol.toLowerCase();
    const manifest = await loadManifest();

    const ranked = manifest
      .map((entry) => {
        let score = 0;
        if ((entry.symbols || []).some((item) => String(item).toLowerCase() === queryLower)) score += 7;
        if ((entry.symbols || []).some((item) => String(item).toLowerCase().includes(queryLower))) score += 4;
        if ((entry.headings || []).some((item) => String(item).toLowerCase().includes(queryLower))) score += 3;
        if (entry.doc_id.toLowerCase().includes(queryLower)) score += 2;
        if (entry.source_path.toLowerCase().includes(queryLower)) score += 1;
        return { entry, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.doc_id.localeCompare(b.entry.doc_id))
      .slice(0, limit)
      .map((item) => ({ score: item.score, ...formatCorpusEntry(item.entry) }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(ranked, null, 2)
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
