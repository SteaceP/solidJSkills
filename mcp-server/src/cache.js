import fs from 'node:fs/promises';
import path from 'node:path';

let manifestCache = null;
let manifestById = null;
let manifestMtime = null;

let repoDocsCache = null;
let repoDocsTimestamp = 0;
const REPO_DOCS_TTL_MS = 30000; // 30-second cache for repo file walking

/**
 * Recursively walk files in directory, ignoring .git.
 */
async function walkFiles(dir) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Load and cache manifest.jsonl with mtime checking.
 */
export async function getManifest(manifestPath) {
  try {
    const stat = await fs.stat(manifestPath);
    if (manifestCache && manifestMtime && stat.mtimeMs <= manifestMtime) {
      return manifestCache;
    }

    const content = await fs.readFile(manifestPath, 'utf8');
    const entries = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    manifestCache = entries;
    manifestById = new Map(entries.map((item) => [item.doc_id, item]));
    manifestMtime = stat.mtimeMs;
    return manifestCache;
  } catch (err) {
    if (manifestCache) return manifestCache;
    throw err;
  }
}

/**
 * Get a single manifest entry by doc_id (O(1) lookup).
 */
export async function getManifestEntry(manifestPath, docId) {
  if (!manifestById || !manifestCache) {
    await getManifest(manifestPath);
  }
  return manifestById?.get(docId) || null;
}

/**
 * List repository docs across allowed roots with in-memory caching.
 */
export async function getRepositoryDocs(repoRoot, allowedDirs, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && repoDocsCache && now - repoDocsTimestamp < REPO_DOCS_TTL_MS) {
    return repoDocsCache;
  }

  const roots = allowedDirs.map((d) => path.resolve(repoRoot, d));
  const output = [];

  for (const root of roots) {
    try {
      const files = await walkFiles(root);
      for (const file of files) {
        output.push(path.relative(repoRoot, file));
      }
    } catch {
      // Skip roots that do not exist
    }
  }

  output.sort((a, b) => a.localeCompare(b));
  repoDocsCache = output;
  repoDocsTimestamp = now;
  return repoDocsCache;
}

/**
 * Calculate similarity / distance between two strings.
 */
function scoreSimilarity(target, query) {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.includes(q)) return 80 + (q.length / t.length) * 15;
  if (q.includes(t)) return 70 + (t.length / q.length) * 15;

  // Token overlap
  const qTokens = q.split(/[\s\-_./\\]+/).filter(Boolean);
  let tokenMatches = 0;
  for (const tok of qTokens) {
    if (t.includes(tok)) tokenMatches++;
  }
  if (qTokens.length > 0 && tokenMatches > 0) {
    return (tokenMatches / qTokens.length) * 50;
  }

  return 0;
}

/**
 * Find top similar documents given an unrecognized path or doc_id.
 */
export async function findSimilarDocs(manifestPath, repoRoot, allowedDirs, query, maxResults = 3) {
  const suggestions = [];

  try {
    const manifest = await getManifest(manifestPath);
    for (const entry of manifest) {
      const score = Math.max(
        scoreSimilarity(entry.doc_id, query),
        scoreSimilarity(entry.source_path, query),
        scoreSimilarity(entry.normalized_path || '', query)
      );
      if (score > 20) {
        suggestions.push({
          identifier: entry.doc_id,
          type: 'doc_id',
          path: entry.normalized_path || entry.source_path,
          score
        });
      }
    }
  } catch {}

  try {
    const docs = await getRepositoryDocs(repoRoot, allowedDirs);
    for (const doc of docs) {
      const score = scoreSimilarity(doc, query);
      if (score > 20) {
        // avoid duplicates if already matched
        if (!suggestions.some((s) => s.path === doc)) {
          suggestions.push({
            identifier: doc,
            type: 'path',
            path: doc,
            score
          });
        }
      }
    }
  } catch {}

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, maxResults);
}
