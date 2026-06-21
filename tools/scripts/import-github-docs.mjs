#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, 'solidJSdocs-temp', 'src', 'routes');
const destRoot = path.join(repoRoot, 'solidJSdocs');

function stripSortingPrefix(segment) {
  return segment.replace(/^\(\d+\)/, '');
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function convertMdxToMd(content) {
  // 1. Strip frontmatter
  let clean = content.replace(/^---[\s\S]*?---\s*/, '');

  // 2. Convert `<EraserLink ... />`
  clean = clean.replace(/<EraserLink\s+([^>]*?)\/>/g, (match, attrs) => {
    const hrefMatch = attrs.match(/href="([^"]+)"/);
    const previewMatch = attrs.match(/preview="([^"]+)"/);
    if (hrefMatch && previewMatch) {
      return `[View on Eraser![](${previewMatch[1]})](${hrefMatch[1]})`;
    }
    if (hrefMatch) {
      return `[View on Eraser](${hrefMatch[1]})`;
    }
    return '';
  });

  // 3. Convert `<ImageLink ... />`
  clean = clean.replace(/<ImageLink\s+([^>]*?)\/>/g, (match, attrs) => {
    const titleMatch = attrs.match(/title="([^"]+)"/);
    const hrefMatch = attrs.match(/href="([^"]+)"/);
    if (titleMatch && hrefMatch) {
      return `[${titleMatch[1]}](${hrefMatch[1]})`;
    }
    return '';
  });

  // 4. Convert `<QuickLinks ... > ... </QuickLinks>`
  clean = clean.replace(/<QuickLinks\s+([^>]*?)>([\s\S]*?)<\/QuickLinks>/g, (match, attrs, children) => {
    const titleMatch = attrs.match(/title="([^"]+)"/);
    const hrefMatch = attrs.match(/href="([^"]+)"/);
    const description = children.trim();
    if (titleMatch && hrefMatch) {
      return `### [${titleMatch[1]}](${hrefMatch[1]})\n\n${description}`;
    }
    return description;
  });

  // 5. Convert `<QuickLinks ... />` (self-closing)
  clean = clean.replace(/<QuickLinks\s+([^>]*?)\/>/g, (match, attrs) => {
    const titleMatch = attrs.match(/title="([^"]+)"/);
    const hrefMatch = attrs.match(/href="([^"]+)"/);
    if (titleMatch && hrefMatch) {
      return `### [${titleMatch[1]}](${hrefMatch[1]})`;
    }
    return '';
  });

  // 6. Rewrite `/reference/jsx-attributes/class` to `/concepts/components/class-style`
  clean = clean.replace(/\/reference\/jsx-attributes\/class\b/g, '/concepts/components/class-style');

  return clean;
}

async function run() {
  console.log(`Starting docs import from ${sourceRoot} to ${destRoot}...`);

  // Ensure source exists
  try {
    await fs.access(sourceRoot);
  } catch {
    console.error(`Source directory not found: ${sourceRoot}`);
    process.exit(1);
  }

  // Clear and recreate destRoot
  await fs.rm(destRoot, { recursive: true, force: true });
  await fs.mkdir(destRoot, { recursive: true });

  const files = await listFiles(sourceRoot);
  let importedCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.md' && ext !== '.mdx') {
      continue; // Skip non-markdown files like .tsx
    }

    const relativeSourcePath = path.relative(sourceRoot, file);
    
    // Map path: strip sorting prefixes like (0) from directory and file segments, rename .mdx to .md
    const segments = relativeSourcePath.split(path.sep);
    const mappedSegments = segments.map((segment, index) => {
      const clean = stripSortingPrefix(segment);
      if (index === segments.length - 1) {
        if (clean.toLowerCase().endsWith('.mdx')) {
          return clean.slice(0, -4) + '.md';
        }
      }
      return clean;
    });

    const mappedRelativePath = mappedSegments.join(path.sep);
    const destPath = path.join(destRoot, mappedRelativePath);

    // Read source content, transform, and write to destination
    const content = await fs.readFile(file, 'utf8');
    const transformed = convertMdxToMd(content);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, transformed, 'utf8');
    importedCount++;
  }

  console.log(`Successfully imported ${importedCount} files.`);
}

run().catch((error) => {
  console.error('Error importing docs:', error);
  process.exit(1);
});
