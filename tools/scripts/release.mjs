#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const pkgPath = path.join(repoRoot, 'package.json');
const lockPath = path.join(repoRoot, 'package-lock.json');
const extPath = path.join(repoRoot, 'gemini-extension.json');

function runCmd(cmd, options = {}) {
    return execSync(cmd, { cwd: repoRoot, stdio: 'pipe', encoding: 'utf8', ...options });
}

function runInteractive(cmd) {
    return execSync(cmd, { cwd: repoRoot, stdio: 'inherit' });
}

function parseSemver(v) {
    const match = v.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
    if (!match) return null;
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
        extra: match[4] || ''
    };
}

function bumpVersion(current, type) {
    const parsed = parseSemver(current);
    if (!parsed) throw new Error(`Cannot parse current version: ${current}`);
    if (type === 'major') return `${parsed.major + 1}.0.0`;
    if (type === 'minor') return `${parsed.major}.${parsed.minor + 1}.0`;
    if (type === 'patch') return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    if (parseSemver(type)) return type;
    throw new Error(`Invalid release type or version: "${type}". Expected "patch", "minor", "major", or explicit "X.Y.Z".`);
}

async function promptReleaseType(currentVersion) {
    const parsed = parseSemver(currentVersion);
    const nextPatch = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    const nextMinor = `${parsed.major}.${parsed.minor + 1}.0`;
    const nextMajor = `${parsed.major + 1}.0.0`;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log(`Current version: ${currentVersion}`);
        console.log(`  1) patch -> ${nextPatch} (default)`);
        console.log(`  2) minor -> ${nextMinor}`);
        console.log(`  3) major -> ${nextMajor}`);
        rl.question('\nSelect release type [1/2/3, patch/minor/major, or X.Y.Z]: ', (ans) => {
            rl.close();
            const trimmed = ans.trim();
            if (!trimmed || trimmed === '1' || trimmed === 'patch') return resolve('patch');
            if (trimmed === '2' || trimmed === 'minor') return resolve('minor');
            if (trimmed === '3' || trimmed === 'major') return resolve('major');
            resolve(trimmed);
        });
    });
}

async function run() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isNoPush = args.includes('--no-push');
    const isSkipTests = args.includes('--skip-tests');
    const positional = args.filter(a => !a.startsWith('--'));

    console.log('=== solidJSkills Automated Release ===\n');

    // 1. Check working directory status
    if (!isDryRun) {
        const gitStatus = runCmd('git status --porcelain').trim();
        if (gitStatus.length > 0) {
            console.error('Error: Working directory has uncommitted or unstaged changes:');
            console.error(gitStatus);
            console.error('\nPlease commit or stash your changes before releasing.');
            process.exit(1);
        }
    }

    // 2. Read current versions
    const pkgRaw = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgRaw);
    const currentVersion = pkg.version;

    // 3. Determine release type
    let releaseType = positional[0];
    if (!releaseType) {
        if (process.stdin.isTTY) {
            releaseType = await promptReleaseType(currentVersion);
        } else {
            releaseType = 'patch';
        }
    }

    const nextVersion = bumpVersion(currentVersion, releaseType);
    const tagName = `v${nextVersion}`;
    console.log(`\nReleasing: ${currentVersion} -> ${nextVersion} (Tag: ${tagName})`);

    // 4. Check if git tag already exists
    try {
        const existing = runCmd(`git tag -l "${tagName}"`).trim();
        if (existing) {
            console.error(`Error: Tag "${tagName}" already exists in Git. Aborting.`);
            process.exit(1);
        }
    } catch {
        // Tag doesn't exist, proceed
    }

    // 5. Run verification suite unless skipped
    if (!isSkipTests) {
        console.log('\nRunning quality verification suite (npm test)...');
        try {
            runInteractive('npm test');
        } catch (err) {
            console.error('\nError: Quality gates failed. Fix the errors before creating a release.');
            process.exit(1);
        }
        console.log('Quality gates passed successfully.\n');
    } else {
        console.log('Skipping verification tests (--skip-tests).\n');
    }

    if (isDryRun) {
        console.log('Dry run complete. No files changed, no tags created.');
        process.exit(0);
    }

    // 6. Update files
    pkg.version = nextVersion;
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf8');
    console.log(`Updated package.json to ${nextVersion}`);

    try {
        const lockRaw = await fs.readFile(lockPath, 'utf8');
        const lock = JSON.parse(lockRaw);
        lock.version = nextVersion;
        if (lock.packages && lock.packages['']) {
            lock.packages[''].version = nextVersion;
        }
        await fs.writeFile(lockPath, JSON.stringify(lock, null, 4) + '\n', 'utf8');
        console.log(`Updated package-lock.json to ${nextVersion}`);
    } catch (e) {
        console.warn('Warning: Could not update package-lock.json:', e.message);
    }

    const extRaw = await fs.readFile(extPath, 'utf8');
    const ext = JSON.parse(extRaw);
    ext.version = nextVersion;
    await fs.writeFile(extPath, JSON.stringify(ext, null, 2) + '\n', 'utf8');
    console.log(`Updated gemini-extension.json to ${nextVersion}`);

    // 7. Git commit
    console.log('\nCreating git commit...');
    runCmd(`git add package.json package-lock.json gemini-extension.json`);
    runCmd(`git commit -m "chore(release): v${nextVersion}"`);

    // 8. Create annotated tag
    console.log(`Creating annotated tag ${tagName}...`);
    runCmd(`git tag -a "${tagName}" -m "Release ${tagName}"`);

    // 9. Push
    if (isNoPush) {
        console.log(`\nRelease ${tagName} created locally.`);
        console.log(`Push when ready using: git push origin main --follow-tags`);
    } else {
        console.log(`\nPushing main branch and tag ${tagName} to origin...`);
        runInteractive(`git push origin main --follow-tags`);
        console.log(`\nSuccessfully released and pushed ${tagName}!`);
        console.log('GitHub Actions will now create the GitHub Release with the tarball.');
    }
}

run().catch((err) => {
    console.error('Release failed:', err.message);
    process.exit(1);
});
