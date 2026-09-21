#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { auditSolidCode } from '../../mcp-server/src/domain.js';

const VALID_EXTENSIONS = new Set(['.jsx', '.tsx', '.js', '.ts']);
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.system_generated']);

function printUsage() {
  console.log(`
Usage:
  node tools/scripts/audit-solid-code.mjs [options] <file-or-dir> [<file-or-dir>...]

Options:
  --strict    Exit with code 1 on warnings as well as errors
  --json      Output results in JSON format
  -h, --help  Show this help message

Examples:
  npm run audit -- src/components/Header.tsx
  npm run audit -- src/
`);
}

async function collectFiles(targetPath) {
  const files = [];
  const stat = await fs.stat(targetPath);

  if (stat.isFile()) {
    const ext = path.extname(targetPath).toLowerCase();
    if (VALID_EXTENSIONS.has(ext)) {
      files.push(targetPath);
    }
    return files;
  }

  if (stat.isDirectory()) {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        const nested = await collectFiles(fullPath);
        files.push(...nested);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (VALID_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  return files;
}

async function main() {
  const args = process.argv.slice(2);
  let strict = false;
  let jsonOutput = false;
  const targetPaths = [];

  for (const arg of args) {
    if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg === '--strict') {
      strict = true;
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (!arg.startsWith('-')) {
      targetPaths.push(arg);
    } else {
      console.error(`Unknown option: ${arg}`);
      printUsage();
      process.exit(1);
    }
  }

  if (targetPaths.length === 0) {
    console.error('Error: No target file or directory provided.');
    printUsage();
    process.exit(1);
  }

  const allFiles = [];
  for (const p of targetPaths) {
    const resolved = path.resolve(process.cwd(), p);
    try {
      const found = await collectFiles(resolved);
      allFiles.push(...found);
    } catch (err) {
      console.error(`Error reading path "${p}": ${err.message}`);
      process.exit(1);
    }
  }

  if (allFiles.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ files_scanned: 0, results: [] }, null, 2));
    } else {
      console.log('No eligible SolidJS source files found (.jsx, .tsx, .js, .ts).');
    }
    process.exit(0);
  }

  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of allFiles) {
    const code = await fs.readFile(file, 'utf8');
    const audit = auditSolidCode(code);
    const relPath = path.relative(process.cwd(), file);

    const fileErrors = audit.issues.filter((i) => i.severity === 'error').length;
    const fileWarnings = audit.issues.filter((i) => i.severity === 'warning').length;

    totalErrors += fileErrors;
    totalWarnings += fileWarnings;

    results.push({
      file: relPath,
      valid: audit.valid,
      score: audit.score,
      total_issues: audit.total_issues,
      issues: audit.issues
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify({
      files_scanned: allFiles.length,
      total_errors: totalErrors,
      total_warnings: totalWarnings,
      passed: totalErrors === 0 && (!strict || totalWarnings === 0),
      results
    }, null, 2));
  } else {
    console.log(`\nSolidJS Reactivity Audit Results (${allFiles.length} file(s) scanned)\n${'='.repeat(60)}`);

    let issueCount = 0;
    for (const res of results) {
      if (res.issues.length === 0) continue;
      issueCount += res.issues.length;

      console.log(`\n\x1b[1m${res.file}\x1b[0m (Score: ${res.score}/100)`);
      for (const issue of res.issues) {
        const tag = issue.severity === 'error' ? '\x1b[31m[ERROR]\x1b[0m' : '\x1b[33m[WARN]\x1b[0m';
        console.log(`  ${tag} \x1b[1m${issue.rule}\x1b[0m: ${issue.message}`);
        console.log(`         \x1b[36mRecommendation:\x1b[0m ${issue.recommendation}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Scanned ${allFiles.length} file(s). Found ${totalErrors} error(s), ${totalWarnings} warning(s).`);

    if (totalErrors === 0 && (!strict || totalWarnings === 0)) {
      console.log('\x1b[32mAudit passed cleanly!\x1b[0m\n');
    } else {
      console.log('\x1b[31mAudit failed with issues.\x1b[0m\n');
    }
  }

  if (totalErrors > 0 || (strict && totalWarnings > 0)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
