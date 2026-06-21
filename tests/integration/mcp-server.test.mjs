#!/usr/bin/env node
/**
 * MCP Server Integration Tests
 *
 * Spawns the MCP server as a child process, sends JSON-RPC tool calls
 * over newline-delimited JSON (MCP stdio protocol), and validates responses.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function sendJsonRpc(proc, method, params, id) {
    const msg = JSON.stringify({ jsonrpc: '2.0', method, ...(params !== undefined ? { params } : {}), ...(id !== undefined ? { id } : {}) });
    proc.stdin.write(msg + '\n');
}

function waitForResponse(proc, expectedId, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error(`Timeout waiting for response id=${expectedId}, buffer: ${buffer.slice(0, 200)}`));
        }, timeoutMs);

        function onData(chunk) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete last line
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.id === expectedId) {
                        cleanup();
                        resolve(parsed);
                        return;
                    }
                } catch {
                    // skip non-JSON lines
                }
            }
        }

        function cleanup() {
            clearTimeout(timer);
            proc.stdout.removeListener('data', onData);
        }

        proc.stdout.on('data', onData);
    });
}

async function runTests() {
    const errors = [];
    let reqId = 1;

    // Spawn MCP server
    const serverProc = spawn('node', ['src/index.js'], {
        cwd: path.join(repoRoot, 'mcp-server'),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
    });

    let stderrOutput = '';
    serverProc.stderr.on('data', (chunk) => { stderrOutput += chunk.toString(); });

    // Give server a moment to start
    await new Promise((r) => setTimeout(r, 300));

    try {
        // 1. Initialize
        const initId = reqId++;
        sendJsonRpc(serverProc, 'initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'integration-test', version: '1.0.0' }
        }, initId);
        const initResp = await waitForResponse(serverProc, initId);
        if (!initResp.result?.serverInfo?.name) {
            errors.push('Initialize: missing serverInfo.name');
        }

        // Send initialized notification (no id = notification)
        sendJsonRpc(serverProc, 'notifications/initialized', {});
        await new Promise((r) => setTimeout(r, 200));

        // 2. List tools
        const listToolsId = reqId++;
        sendJsonRpc(serverProc, 'tools/list', {}, listToolsId);
        const toolsResp = await waitForResponse(serverProc, listToolsId);
        const toolNames = (toolsResp.result?.tools || []).map((t) => t.name);
        const required = ['list_docs', 'read_doc', 'search_docs', 'list_corpus_docs', 'read_corpus_doc', 'search_corpus', 'resolve_solid_api'];
        for (const name of required) {
            if (!toolNames.includes(name)) {
                errors.push(`tools/list: missing tool '${name}'`);
            }
        }

        // 3. Call list_corpus_docs
        const listCorpusId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'list_corpus_docs',
            arguments: { limit: 5 }
        }, listCorpusId);
        const listCorpusResp = await waitForResponse(serverProc, listCorpusId);
        const listCorpusText = listCorpusResp.result?.content?.[0]?.text || '';
        let listCorpusParsed;
        try {
            listCorpusParsed = JSON.parse(listCorpusText);
        } catch {
            errors.push('list_corpus_docs: could not parse response as JSON');
            listCorpusParsed = [];
        }
        if (!Array.isArray(listCorpusParsed) || listCorpusParsed.length === 0) {
            errors.push('list_corpus_docs: expected non-empty array');
        } else if (!listCorpusParsed[0].doc_id) {
            errors.push('list_corpus_docs: entries missing doc_id field');
        }

        // 4. Call read_corpus_doc
        const sampleDocId = listCorpusParsed?.[0]?.doc_id;
        if (sampleDocId) {
            const readCorpusId = reqId++;
            sendJsonRpc(serverProc, 'tools/call', {
                name: 'read_corpus_doc',
                arguments: { doc_id: sampleDocId }
            }, readCorpusId);
            const readCorpusResp = await waitForResponse(serverProc, readCorpusId);
            const readCorpusText = readCorpusResp.result?.content?.[0]?.text || '';
            if (readCorpusText.length < 50) {
                errors.push(`read_corpus_doc: response too short for '${sampleDocId}'`);
            }
        }

        // 5. Call search_corpus
        const searchId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'search_corpus',
            arguments: { query: 'createSignal', limit: 5 }
        }, searchId);
        const searchResp = await waitForResponse(serverProc, searchId);
        const searchParsed = JSON.parse(searchResp.result?.content?.[0]?.text || '[]');
        if (!Array.isArray(searchParsed) || searchParsed.length === 0) {
            errors.push('search_corpus: no results for "createSignal"');
        } else if (!searchParsed.some((r) => r.doc_id?.includes('create-signal'))) {
            errors.push('search_corpus: "createSignal" did not return create-signal doc');
        }

        // 6. Call resolve_solid_api
        const resolveId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'resolve_solid_api',
            arguments: { symbol: 'useNavigate', limit: 5 }
        }, resolveId);
        const resolveResp = await waitForResponse(serverProc, resolveId);
        const resolveParsed = JSON.parse(resolveResp.result?.content?.[0]?.text || '[]');
        if (!Array.isArray(resolveParsed) || resolveParsed.length === 0) {
            errors.push('resolve_solid_api: no results for "useNavigate"');
        } else if (!resolveParsed.some((r) => r.doc_id?.includes('use-navigate'))) {
            errors.push('resolve_solid_api: "useNavigate" did not return use-navigate doc');
        }

        // 7. Call list_docs
        const listDocsId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'list_docs',
            arguments: { directory: 'skills' }
        }, listDocsId);
        const listDocsResp = await waitForResponse(serverProc, listDocsId);
        const listDocsText = listDocsResp.result?.content?.[0]?.text || '';
        if (!listDocsText.includes('SKILL.md') && !listDocsText.includes('solid-')) {
            errors.push('list_docs: expected skill content in result');
        }

        // 8. Call search_docs
        const searchDocsId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'search_docs',
            arguments: { query: 'component-builder' }
        }, searchDocsId);
        const searchDocsResp = await waitForResponse(serverProc, searchDocsId);
        const searchDocsText = searchDocsResp.result?.content?.[0]?.text || '';
        const expectedSearchPath = path.join('skills', 'solid-component-builder', 'SKILL.md');
        if (!searchDocsText.includes(expectedSearchPath)) {
            errors.push(`search_docs: expected "${expectedSearchPath}" in search results`);
        }

        // 9. Call read_doc (success)
        const readDocId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: { path: 'skills/solid-component-builder/SKILL.md' }
        }, readDocId);
        const readDocResp = await waitForResponse(serverProc, readDocId);
        const readDocText = readDocResp.result?.content?.[0]?.text || '';
        const expectedHeader = `# ${path.join('skills', 'solid-component-builder', 'SKILL.md')}`;
        if (!readDocText.includes(expectedHeader) || !readDocText.includes('SolidJS')) {
            errors.push('read_doc: expected valid SKILL.md content');
        }

        // 10. Call read_doc (error - not allowed directory)
        const readDocErrId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: { path: 'package.json' }
        }, readDocErrId);
        const readDocErrResp = await waitForResponse(serverProc, readDocErrId);
        const isErrorResponse = readDocErrResp.result?.isError || readDocErrResp.error;
        const errText = readDocErrResp.result?.content?.[0]?.text || readDocErrResp.error?.message || '';
        if (!isErrorResponse || !errText.includes('Path must be inside one of')) {
            errors.push(`read_doc (error): expected validation error for package.json, got: ${JSON.stringify(readDocErrResp)}`);
        }

        // 11. Call list_corpus_docs (with filters)
        const listCorpusFilteredId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'list_corpus_docs',
            arguments: { package: 'solid-core', limit: 3 }
        }, listCorpusFilteredId);
        const listCorpusFilteredResp = await waitForResponse(serverProc, listCorpusFilteredId);
        const listCorpusFilteredText = listCorpusFilteredResp.result?.content?.[0]?.text || '';
        let listCorpusFilteredParsed;
        try {
            listCorpusFilteredParsed = JSON.parse(listCorpusFilteredText);
        } catch {
            errors.push('list_corpus_docs (filtered): could not parse response as JSON');
            listCorpusFilteredParsed = [];
        }
        if (!Array.isArray(listCorpusFilteredParsed) || listCorpusFilteredParsed.length === 0) {
            errors.push('list_corpus_docs (filtered): expected non-empty array');
        } else {
            for (const entry of listCorpusFilteredParsed) {
                if (entry.package !== 'solid-core') {
                    errors.push(`list_corpus_docs (filtered): expected package "solid-core", got "${entry.package}"`);
                }
            }
        }

        // 12. Call read_corpus_doc (raw source)
        if (sampleDocId) {
            const readCorpusRawId = reqId++;
            sendJsonRpc(serverProc, 'tools/call', {
                name: 'read_corpus_doc',
                arguments: { doc_id: sampleDocId, source: 'raw' }
            }, readCorpusRawId);
            const readCorpusRawResp = await waitForResponse(serverProc, readCorpusRawId);
            const readCorpusRawText = readCorpusRawResp.result?.content?.[0]?.text || '';
            let rawParsed;
            try {
                rawParsed = JSON.parse(readCorpusRawText);
            } catch {
                errors.push('read_corpus_doc (raw): could not parse response as JSON');
            }
            if (rawParsed) {
                if (rawParsed.source !== 'raw') {
                    errors.push(`read_corpus_doc (raw): expected source "raw", got "${rawParsed.source}"`);
                }
                if (!rawParsed.body || rawParsed.body.length < 10) {
                    errors.push('read_corpus_doc (raw): body is empty or too short');
                }
            }
        }

        // 13. Call read_corpus_doc (non-existent doc_id)
        const readCorpusMissingId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_corpus_doc',
            arguments: { doc_id: 'non-existent-doc-id-12345' }
        }, readCorpusMissingId);
        const readCorpusMissingResp = await waitForResponse(serverProc, readCorpusMissingId);
        const readCorpusMissingText = readCorpusMissingResp.result?.content?.[0]?.text || '';
        if (!readCorpusMissingText.includes("No corpus document found for doc_id")) {
            errors.push(`read_corpus_doc (missing): expected missing document message, got: ${readCorpusMissingText}`);
        }

    } finally {
        serverProc.kill('SIGTERM');
        await new Promise((r) => setTimeout(r, 200));
    }

    if (errors.length > 0) {
        console.error('MCP integration tests failed:');
        for (const err of errors) console.error(`  - ${err}`);
        if (stderrOutput.trim()) console.error(`\nServer stderr:\n${stderrOutput.slice(0, 500)}`);
        process.exitCode = 1;
        return;
    }

    console.log('MCP integration tests passed (13 checks).');
}

runTests().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
});
