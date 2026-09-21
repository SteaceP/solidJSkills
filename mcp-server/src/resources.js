import fs from 'node:fs/promises';
import path from 'node:path';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getManifest, getManifestEntry } from './cache.js';

/**
 * Register all SolidJS MCP resources on the server.
 */
export function registerResources(server, { repoRoot, normalizedRoot, normalizedDocsRoot, manifestPath }) {
  const taxonomyPath = path.join(normalizedRoot, 'taxonomy.json');
  const skillsRoot = path.join(repoRoot, 'skills');

  // 1. solid://manifest
  server.resource(
    'manifest',
    'solid://manifest',
    {
      description: 'SolidJS normalized corpus manifest metadata and catalog',
      mimeType: 'application/json'
    },
    async (uri) => {
      const manifest = await getManifest(manifestPath);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                count: manifest.length,
                generated_at: new Date().toISOString(),
                documents: manifest.map((d) => ({
                  doc_id: d.doc_id,
                  package: d.package,
                  topic: d.topic,
                  source_path: d.source_path,
                  canonical_url: d.canonical_url
                }))
              },
              null,
              2
            )
          }
        ]
      };
    }
  );

  // 2. solid://taxonomy
  server.resource(
    'taxonomy',
    'solid://taxonomy',
    {
      description: 'SolidJS documentation taxonomy by package and topic',
      mimeType: 'application/json'
    },
    async (uri) => {
      try {
        const text = await fs.readFile(taxonomyPath, 'utf8');
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text
            }
          ]
        };
      } catch (err) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Taxonomy not found: ${err.message}` })
            }
          ]
        };
      }
    }
  );

  // 3. solid://skills
  server.resource(
    'skills',
    'solid://skills',
    {
      description: 'Directory of all SolidJS agent skills in solidJSkills',
      mimeType: 'application/json'
    },
    async (uri) => {
      try {
        const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
        const skills = [];

        for (const entry of entries) {
          if (!entry.isDirectory() || entry.name === 'contracts' || entry.name.startsWith('.')) continue;

          const skillMdPath = path.join(skillsRoot, entry.name, 'SKILL.md');
          try {
            const content = await fs.readFile(skillMdPath, 'utf8');
            const descMatch = content.match(/description:\s*["']?([^"'\n\r]+)["']?/);
            skills.push({
              name: entry.name,
              path: `skills/${entry.name}/SKILL.md`,
              description: descMatch ? descMatch[1].trim() : ''
            });
          } catch {
            skills.push({
              name: entry.name,
              path: `skills/${entry.name}/SKILL.md`,
              description: ''
            });
          }
        }

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ count: skills.length, skills }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Failed to list skills: ${err.message}` })
            }
          ]
        };
      }
    }
  );

  // 4. solid://docs/{docId}
  server.resource(
    'corpus-doc',
    new ResourceTemplate('solid://docs/{docId}', { list: undefined }),
    {
      description: 'Read a normalized SolidJS document by doc_id (e.g. solid-core.reference.basic-reactivity.create-signal)',
      mimeType: 'text/markdown'
    },
    async (uri, { docId }) => {
      const entry = await getManifestEntry(manifestPath, docId);
      if (!entry) {
        throw new Error(`Corpus document '${docId}' not found in manifest.`);
      }

      const normalizedPath = entry.normalized_path || entry.source_path;
      const fullPath = path.resolve(normalizedDocsRoot, normalizedPath);
      const text = await fs.readFile(fullPath, 'utf8');

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: `# ${entry.doc_id}\n\n<!-- Canonical: ${entry.canonical_url || ''} -->\n\n${text}`
          }
        ]
      };
    }
  );

  // 5. solid://skills/{skillName}
  server.resource(
    'skill-doc',
    new ResourceTemplate('solid://skills/{skillName}', { list: undefined }),
    {
      description: 'Read a SolidJS skill definition by skill name (e.g. solid-component-builder)',
      mimeType: 'text/markdown'
    },
    async (uri, { skillName }) => {
      const sanitized = skillName.replace(/[^a-zA-Z0-9_-]/g, '');
      const skillPath = path.join(skillsRoot, sanitized, 'SKILL.md');

      const text = await fs.readFile(skillPath, 'utf8');
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text
          }
        ]
      };
    }
  );
}
