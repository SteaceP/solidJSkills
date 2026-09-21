# Extension Release Guide

How to publish a new release of solidJSkills as a Gemini-CLI extension via GitHub Releases.

## Prerequisites

- Push access to this repository
- The `gemini-extension.json` file is at the repository root (already set up)
- The `.github/workflows/release.yml` workflow is in place (already set up)

## How releases work

When you push a tag that starts with `v` (for example `v1.2.0`), the release workflow automatically:

1. Checks out the tagged commit
2. Installs MCP server dependencies
3. Validates skill contracts and output schemas
4. Creates a `.tar.gz` archive of the entire extension
5. Publishes a GitHub Release with the archive attached

Since solidJSkills is platform-independent (no compiled binaries), a single generic archive is created. Gemini CLI uses this archive for faster initial installs — users don't need to clone the full git history.

## Creating a release

### Automated Release (Recommended)

Run the automated release script, which validates working tree cleanliness, runs `npm test` quality gates, synchronizes versions in `package.json`, `package-lock.json`, and `gemini-extension.json`, commits, creates the annotated tag, and pushes with `--follow-tags`:

```bash
# Automated patch release (e.g. 1.3.0 -> 1.3.1)
npm run release:patch

# Automated minor release (e.g. 1.3.0 -> 1.4.0)
npm run release:minor

# Automated major release (e.g. 1.3.0 -> 2.0.0)
npm run release:major

# Interactive prompt or explicit version
npm run release
npm run release -- 1.3.1

# Preview changes without modifying files or pushing
npm run release -- --dry-run patch
```

### Manual Release Steps (Alternative)

#### 1. Update the version and validate

Update the `version` field in both `gemini-extension.json` and the root `package.json` (e.g. `1.3.0`):

```json
// gemini-extension.json
{
  "name": "solidjskills",
  "version": "1.3.0"
}
```

```json
// package.json
{
  "name": "solidjskills-root",
  "version": "1.3.0"
}
```

Run all quality gates locally to ensure contracts, corpus, skills, and MCP integration tests pass:

```bash
npm test
```

Commit the version bump:

```bash
git add gemini-extension.json package.json package-lock.json
git commit -m "bump version to 1.3.0"
git push
```

#### 2. Tag and push the release

```bash
git tag -a v1.3.0 -m "release v1.3.0"
git push origin main --follow-tags
```

This triggers the `.github/workflows/release.yml` workflow. Check the **Actions** tab to monitor progress.

#### 3. Mark as latest (optional)

The workflow creates the release automatically. If you want a specific release to be the one users get by default, make sure it is marked as **Latest** on the GitHub Releases page. By default, GitHub marks the most recent non-prerelease as latest.

## Installing from a release

Users install the extension with:

```bash
gemini extensions install <repo-uri>
```

Gemini CLI checks for the latest GitHub Release and downloads the archive instead of cloning the repository.

To install a specific version:

```bash
gemini extensions install <repo-uri> --ref=v1.2.0
```

## Pre-releases

To publish a pre-release for testing before promoting to all users:

1. Tag with a pre-release identifier (e.g., `v1.2.0-beta.1`)
2. On the GitHub Releases page, check **Set as a pre-release** (the workflow uses `generate_release_notes` but does not force latest)
3. Testers install with `--pre-release`:

```bash
gemini extensions install <repo-uri> --pre-release
```

## Alternative: Git repository releases

You can also distribute the extension directly from the git repository without GitHub Releases. Users install with:

```bash
gemini extensions install <repo-uri>
```

They can pin to a branch or tag with `--ref`:

```bash
gemini extensions install <repo-uri> --ref=main
```

See the [GitHub Releases documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) for more details on GitHub Releases.
