#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { routeSolidIntent } from '../../mcp-server/src/domain.js';

const repoRoot = process.cwd();

function routePrompt(prompt) {
  const result = routeSolidIntent(prompt);
  return { primary: result.primary_skill, secondary: result.secondary_skill };
}

async function checkRoutingFixtures(errors) {
  const fixturePath = path.join(repoRoot, 'tests', 'smoke', 'fixtures', 'intent-routing.json');
  const fixtures = JSON.parse(await fs.readFile(fixturePath, 'utf8'));

  for (const fixture of fixtures) {
    const actual = routePrompt(fixture.prompt);
    if (actual.primary !== fixture.expected_primary || actual.secondary !== fixture.expected_secondary) {
      errors.push(
        `Routing mismatch for fixture ${fixture.id}: expected ${fixture.expected_primary}+${fixture.expected_secondary}, got ${actual.primary}+${actual.secondary}`
      );
    }
  }
}

function ensureArrayContainsAll(actual, expected) {
  if (!Array.isArray(actual)) return false;
  return expected.every((item) => actual.includes(item));
}

async function checkOutputSchemaSnapshots(errors) {
  const fixturePath = path.join(repoRoot, 'tests', 'smoke', 'fixtures', 'output-shapes.json');
  const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8'));

  for (const [schemaRel, expected] of Object.entries(fixture)) {
    const schemaPath = path.join(repoRoot, schemaRel);
    const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

    if (!ensureArrayContainsAll(schema.required, expected.required)) {
      errors.push(`Schema required keys mismatch for ${schemaRel}`);
    }

    const citations = schema.properties?.citations;
    if (!citations || citations.type !== 'array') {
      errors.push(`Schema ${schemaRel} missing citations array.`);
    }

    if (schemaRel.endsWith('review-output.schema.json')) {
      const severityEnum = schema.properties?.findings?.items?.properties?.severity?.enum;
      const hasFile = Boolean(schema.properties?.findings?.items?.properties?.file);
      if (!Array.isArray(severityEnum) || !hasFile) {
        errors.push('Review schema must include severity enum and file reference fields.');
      }
    }
  }
}

async function checkMacroSkillCitationRequirements(errors) {
  const macroSkills = [
    'solid-component-builder',
    'solid-refactor-assistant',
    'solid-reviewer',
    'solid-scaffold-bootstrap',
    'solid-design-patterns'
  ];

  for (const skill of macroSkills) {
    const skillPath = path.join(repoRoot, 'skills', skill, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf8');
    if (!/doc_id/.test(content)) {
      errors.push(`Macro skill ${skill} does not require doc_id citations.`);
    }
  }
}

async function checkMcpCorpusIntegration(errors) {
  const mcpPath = path.join(repoRoot, 'mcp-server', 'src', 'index.js');
  const content = await fs.readFile(mcpPath, 'utf8');

  for (const token of ['list_corpus_docs', 'read_corpus_doc', 'search_corpus', 'resolve_solid_api']) {
    if (!content.includes(`'${token}'`)) {
      errors.push(`MCP server missing tool registration: ${token}`);
    }
  }

  if (!content.includes('doc_id') || !content.includes('metadata')) {
    errors.push('MCP server read_corpus_doc output must include manifest-linked metadata fields.');
  }

  const manifestPath = path.join(repoRoot, 'references', 'solidjs-normalized', 'manifest.jsonl');
  const lines = (await fs.readFile(manifestPath, 'utf8')).split('\n').filter(Boolean);
  if (lines.length === 0) {
    errors.push('Manifest is empty; cannot validate MCP corpus document path resolution.');
    return;
  }

  const sample = JSON.parse(lines[0]);
  const normalizedDocPath = path.join(
    repoRoot,
    'references',
    'solidjs-normalized',
    'docs',
    sample.normalized_path || sample.source_path
  );

  try {
    await fs.access(normalizedDocPath);
  } catch {
    errors.push(`Sample normalized corpus doc missing for MCP read test: ${path.relative(repoRoot, normalizedDocPath)}`);
  }
}

// --- Corpus search and API resolution quality tests ---

let _manifestCache = null;
async function loadManifestForEvals() {
  if (_manifestCache) return _manifestCache;
  const manifestPath = path.join(repoRoot, 'references', 'solidjs-normalized', 'manifest.jsonl');
  const lines = (await fs.readFile(manifestPath, 'utf8')).split('\n').filter(Boolean);
  _manifestCache = lines.map((line) => JSON.parse(line));
  return _manifestCache;
}

function scoreEntryForSearch(entry, queryLower) {
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

function scoreEntryForResolve(entry, queryLower) {
  let score = 0;
  if ((entry.symbols || []).some((s) => String(s).toLowerCase() === queryLower)) score += 7;
  if ((entry.symbols || []).some((s) => String(s).toLowerCase().includes(queryLower))) score += 4;
  if ((entry.headings || []).some((h) => String(h).toLowerCase().includes(queryLower))) score += 3;
  if (entry.doc_id.toLowerCase().includes(queryLower)) score += 2;
  if (entry.source_path.toLowerCase().includes(queryLower)) score += 1;
  return score;
}

async function checkCorpusSearchQuality(errors) {
  const fixturePath = path.join(repoRoot, 'tests', 'smoke', 'fixtures', 'corpus-search.json');
  const fixtures = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
  const manifest = await loadManifestForEvals();

  for (const fixture of fixtures) {
    const queryLower = fixture.query.toLowerCase();
    let entries = manifest;
    if (fixture.package) {
      entries = entries.filter((e) => e.package === fixture.package);
    }

    const ranked = entries
      .map((entry) => ({ entry, score: scoreEntryForSearch(entry, queryLower) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.doc_id.localeCompare(b.entry.doc_id));

    if (ranked.length === 0) {
      errors.push(`Corpus search ${fixture.id}: no results for query "${fixture.query}"`);
      continue;
    }

    const topDocIds = ranked.slice(0, 5).map((r) => r.entry.doc_id);
    if (!topDocIds.includes(fixture.must_include_in_top5)) {
      errors.push(
        `Corpus search ${fixture.id}: expected "${fixture.must_include_in_top5}" in top 5, got [${topDocIds.join(', ')}]`
      );
    }
  }
}

async function checkApiResolutionAccuracy(errors) {
  const fixturePath = path.join(repoRoot, 'tests', 'smoke', 'fixtures', 'api-resolution.json');
  const fixtures = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
  const manifest = await loadManifestForEvals();

  for (const fixture of fixtures) {
    const queryLower = fixture.symbol.toLowerCase();

    const ranked = manifest
      .map((entry) => ({ entry, score: scoreEntryForResolve(entry, queryLower) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.doc_id.localeCompare(b.entry.doc_id))
      .slice(0, 10);

    const docIds = ranked.map((r) => r.entry.doc_id);
    if (!docIds.includes(fixture.must_include_doc_id)) {
      errors.push(
        `API resolution ${fixture.id}: expected "${fixture.must_include_doc_id}" in top 10, got [${docIds.slice(0, 5).join(', ')}...]`
      );
    }
  }
}

async function run() {
  const errors = [];

  await checkRoutingFixtures(errors);
  await checkOutputSchemaSnapshots(errors);
  await checkMacroSkillCitationRequirements(errors);
  await checkMcpCorpusIntegration(errors);
  await checkCorpusSearchQuality(errors);
  await checkApiResolutionAccuracy(errors);

  if (errors.length > 0) {
    console.error('run-smoke-evals failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log('run-smoke-evals passed.');
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
