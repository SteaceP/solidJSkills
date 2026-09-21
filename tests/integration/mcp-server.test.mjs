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
        const required = [
            'list_docs',
            'read_doc',
            'search_docs',
            'list_corpus_docs',
            'read_corpus_doc',
            'search_corpus',
            'resolve_solid_api',
            'route_solid_intent',
            'audit_solid_code',
            'get_solid_checklist',
            'detect_solid_version'
        ];
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
            arguments: {}
        }, listDocsId);
        const listDocsResp = await waitForResponse(serverProc, listDocsId);
        const listDocsText = listDocsResp.result?.content?.[0]?.text || '';
        if (!listDocsText.includes('SKILL.md') && !listDocsText.includes('solid-')) {
            errors.push('list_docs: expected skill content in result');
        }

        // 8. Call search_docs (substring)
        const searchDocsId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'search_docs',
            arguments: { query: 'component-builder' }
        }, searchDocsId);
        const searchDocsResp = await waitForResponse(serverProc, searchDocsId);
        const searchDocsText = searchDocsResp.result?.content?.[0]?.text || '';
        const expectedSearchPath = 'skills/solid-component-builder/SKILL.md';
        if (!searchDocsText.includes(expectedSearchPath) && !searchDocsText.includes(path.join('skills', 'solid-component-builder', 'SKILL.md'))) {
            errors.push(`search_docs: expected "${expectedSearchPath}" in search results`);
        }

        // 9. Call search_docs with camelCase API symbol (createSignal)
        const searchDocsSymbolId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'search_docs',
            arguments: { query: 'createSignal' }
        }, searchDocsSymbolId);
        const searchDocsSymbolResp = await waitForResponse(serverProc, searchDocsSymbolId);
        const searchDocsSymbolText = searchDocsSymbolResp.result?.content?.[0]?.text || '';
        if (!searchDocsSymbolText.includes('create-signal')) {
            errors.push('search_docs: "createSignal" did not match create-signal doc');
        }

        // 10. Call search_docs with space-separated topic (state management)
        const searchDocsTopicId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'search_docs',
            arguments: { query: 'state management' }
        }, searchDocsTopicId);
        const searchDocsTopicResp = await waitForResponse(serverProc, searchDocsTopicId);
        const searchDocsTopicText = searchDocsTopicResp.result?.content?.[0]?.text || '';
        if (!searchDocsTopicText.includes('state-management')) {
            errors.push('search_docs: "state management" did not match state-management guide');
        }

        // 11. Call read_doc (success)
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

        // 12. Call read_doc with corpus relative path (reference/basic-reactivity/create-signal.md)
        const readDocCorpusId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: { path: 'reference/basic-reactivity/create-signal.md' }
        }, readDocCorpusId);
        const readDocCorpusResp = await waitForResponse(serverProc, readDocCorpusId);
        const readDocCorpusText = readDocCorpusResp.result?.content?.[0]?.text || '';
        if (!readDocCorpusText.includes('createSignal')) {
            errors.push('read_doc: failed to read document via corpus-relative path');
        }

        // 13. Call read_doc with doc_id
        const readDocId2 = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: { path: 'solid-core.reference.basic-reactivity.create-signal' }
        }, readDocId2);
        const readDocResp2 = await waitForResponse(serverProc, readDocId2);
        const readDocText2 = readDocResp2.result?.content?.[0]?.text || '';
        if (!readDocText2.includes('createSignal')) {
            errors.push('read_doc: failed to read document via doc_id');
        }

        // 14. Call read_doc (error - not allowed directory)
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

        // 15. Call list_corpus_docs (with filters)
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

        // 16. Call read_corpus_doc (raw source)
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

        // 17. Call read_corpus_doc (non-existent doc_id)
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

        // 18. Call read_corpus_doc with typo doc_id to test fuzzy suggestions
        const readCorpusTypoId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_corpus_doc',
            arguments: { doc_id: 'solid-core.reference.basic-reactivity.create-signa' }
        }, readCorpusTypoId);
        const readCorpusTypoResp = await waitForResponse(serverProc, readCorpusTypoId);
        const readCorpusTypoText = readCorpusTypoResp.result?.content?.[0]?.text || '';
        if (!readCorpusTypoText.includes('Did you mean') || !readCorpusTypoText.includes('create-signal')) {
            errors.push(`read_corpus_doc (typo suggestions): expected fuzzy suggestion for create-signal, got: ${readCorpusTypoText}`);
        }

        // 19. Call read_doc with non-existent file inside allowed root
        const readDocMissingId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: { path: 'skills/solid-component-xyz-missing.md' }
        }, readDocMissingId);
        const readDocMissingResp = await waitForResponse(serverProc, readDocMissingId);
        const readDocMissingText = readDocMissingResp.result?.content?.[0]?.text || '';
        if (!readDocMissingResp.result?.isError || !readDocMissingText.includes('Document not found on disk')) {
            errors.push(`read_doc (missing file): expected isError and not found message, got: ${JSON.stringify(readDocMissingResp)}`);
        }

        // 20. List resources (solid://manifest, solid://taxonomy, solid://skills)
        const listResId = reqId++;
        sendJsonRpc(serverProc, 'resources/list', {}, listResId);
        const listResResp = await waitForResponse(serverProc, listResId);
        const resourceUris = (listResResp.result?.resources || []).map((r) => r.uri);
        const expectedResources = ['solid://manifest', 'solid://taxonomy', 'solid://skills'];
        for (const uri of expectedResources) {
            if (!resourceUris.includes(uri)) {
                errors.push(`resources/list: missing resource '${uri}', got: ${JSON.stringify(resourceUris)}`);
            }
        }

        // 21. List resource templates (solid://docs/{docId}, solid://skills/{skillName})
        const listResTmplId = reqId++;
        sendJsonRpc(serverProc, 'resources/templates/list', {}, listResTmplId);
        const listResTmplResp = await waitForResponse(serverProc, listResTmplId);
        const tmplUris = (listResTmplResp.result?.resourceTemplates || []).map((t) => t.uriTemplate);
        if (!tmplUris.some((u) => u.includes('solid://docs/'))) {
            errors.push('resources/templates/list: missing solid://docs/{docId} template');
        }
        if (!tmplUris.some((u) => u.includes('solid://skills/'))) {
            errors.push('resources/templates/list: missing solid://skills/{skillName} template');
        }

        // 22. Read static resource solid://manifest
        const readManifestResId = reqId++;
        sendJsonRpc(serverProc, 'resources/read', { uri: 'solid://manifest' }, readManifestResId);
        const readManifestResResp = await waitForResponse(serverProc, readManifestResId);
        const manifestResText = readManifestResResp.result?.contents?.[0]?.text || '';
        try {
            const parsedManifestRes = JSON.parse(manifestResText);
            if (!parsedManifestRes.count || parsedManifestRes.count < 100) {
                errors.push('resources/read: solid://manifest missing or invalid count');
            }
        } catch {
            errors.push('resources/read: solid://manifest content is not valid JSON');
        }

        // 23. Read template resource solid://docs/solid-core.reference.basic-reactivity.create-signal
        const readDocResId = reqId++;
        sendJsonRpc(serverProc, 'resources/read', { uri: 'solid://docs/solid-core.reference.basic-reactivity.create-signal' }, readDocResId);
        const readDocResResp = await waitForResponse(serverProc, readDocResId);
        const docResText = readDocResResp.result?.contents?.[0]?.text || '';
        if (!docResText.includes('createSignal')) {
            errors.push('resources/read: solid://docs/... template failed to return doc content');
        }

        // 24. List prompts (review-solid-code, audit-reactivity, scaffold-component, migrate-react-to-solid)
        const listPromptsId = reqId++;
        sendJsonRpc(serverProc, 'prompts/list', {}, listPromptsId);
        const listPromptsResp = await waitForResponse(serverProc, listPromptsId);
        const promptNames = (listPromptsResp.result?.prompts || []).map((p) => p.name);
        const expectedPrompts = ['review-solid-code', 'audit-reactivity', 'scaffold-component', 'migrate-react-to-solid'];
        for (const name of expectedPrompts) {
            if (!promptNames.includes(name)) {
                errors.push(`prompts/list: missing prompt '${name}', got: ${JSON.stringify(promptNames)}`);
            }
        }

        // 25. Get prompt (review-solid-code)
        const getPromptId = reqId++;
        sendJsonRpc(serverProc, 'prompts/get', {
            name: 'review-solid-code',
            arguments: { code: 'const [count, setCount] = createSignal(0);' }
        }, getPromptId);
        const getPromptResp = await waitForResponse(serverProc, getPromptId);
        const promptMsgText = getPromptResp.result?.messages?.[0]?.content?.text || '';
        if (!promptMsgText.includes('Reactivity Preservation') || !promptMsgText.includes('createSignal(0)')) {
            errors.push('prompts/get: review-solid-code did not contain expected review instructions and code');
        }

        // 26. Section extraction in read_doc
        const readDocSectionId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: {
                path: 'reference/basic-reactivity/create-signal.md',
                section: 'Parameters'
            }
        }, readDocSectionId);
        const readDocSectionResp = await waitForResponse(serverProc, readDocSectionId);
        const readDocSectionText = readDocSectionResp.result?.content?.[0]?.text || '';
        if (!readDocSectionText.includes('## Parameters') || readDocSectionText.includes('# Create Signal')) {
            errors.push(`read_doc (section): expected Parameters section only, got: ${readDocSectionText.slice(0, 200)}`);
        }

        // 27. Line pagination in read_doc
        const readDocPaginateId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'read_doc',
            arguments: {
                path: 'reference/basic-reactivity/create-signal.md',
                max_lines: 5,
                offset: 0
            }
        }, readDocPaginateId);
        const readDocPaginateResp = await waitForResponse(serverProc, readDocPaginateId);
        const readDocPaginateText = readDocPaginateResp.result?.content?.[0]?.text || '';
        if (!readDocPaginateText.includes('Lines 1-5 of')) {
            errors.push(`read_doc (paginate): expected pagination header 'Lines 1-5 of', got: ${readDocPaginateText.slice(0, 100)}`);
        }

        // 28. Full-text search with snippets in search_corpus
        const searchFullTextId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'search_corpus',
            arguments: {
                query: 'pull-based reactivity model',
                full_text: true,
                limit: 3
            }
        }, searchFullTextId);
        const searchFullTextResp = await waitForResponse(serverProc, searchFullTextId);
        const searchFullTextParsed = JSON.parse(searchFullTextResp.result?.content?.[0]?.text || '[]');
        if (!Array.isArray(searchFullTextParsed) || searchFullTextParsed.length === 0) {
            errors.push('search_corpus (full_text): expected results for "pull-based reactivity model"');
        } else if (!searchFullTextParsed[0].snippet?.includes('pull-based')) {
            errors.push('search_corpus (full_text): expected snippet containing match phrase');
        }

        // 29. Call route_solid_intent
        const routeIntentId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'route_solid_intent',
            arguments: { prompt: 'Fixing hydration mismatch in SSR component' }
        }, routeIntentId);
        const routeIntentResp = await waitForResponse(serverProc, routeIntentId);
        const routeIntentParsed = JSON.parse(routeIntentResp.result?.content?.[0]?.text || '{}');
        if (routeIntentParsed.primary_skill !== 'solid-reviewer' || routeIntentParsed.secondary_skill !== 'solid-ssr-hydration-debugger') {
            errors.push(`route_solid_intent: expected solid-reviewer + solid-ssr-hydration-debugger, got: ${JSON.stringify(routeIntentParsed)}`);
        }

        // 30. Call audit_solid_code
        const auditCodeId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'audit_solid_code',
            arguments: { code: 'function MyComp({ count, title }) { return <div>{title}</div>; }' }
        }, auditCodeId);
        const auditCodeResp = await waitForResponse(serverProc, auditCodeId);
        const auditCodeParsed = JSON.parse(auditCodeResp.result?.content?.[0]?.text || '{}');
        if (!auditCodeParsed.issues?.some((i) => i.rule === 'no-destructure-props')) {
            errors.push(`audit_solid_code: expected no-destructure-props rule trigger, got: ${JSON.stringify(auditCodeParsed)}`);
        }

        // 31. Call get_solid_checklist
        const getChecklistId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'get_solid_checklist',
            arguments: { type: 'review' }
        }, getChecklistId);
        const getChecklistResp = await waitForResponse(serverProc, getChecklistId);
        const getChecklistParsed = JSON.parse(getChecklistResp.result?.content?.[0]?.text || '{}');
        if (!getChecklistParsed.items?.some((i) => i.category?.includes('Reactivity Correctness'))) {
            errors.push(`get_solid_checklist: expected Reactivity Correctness category, got: ${JSON.stringify(getChecklistParsed)}`);
        }

        // 32. Call route_solid_intent for solid-forms-validation
        const routeFormsId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'route_solid_intent',
            arguments: { prompt: 'Build a form with reactive inputs and validate with Zod schema in SolidJS' }
        }, routeFormsId);
        const routeFormsResp = await waitForResponse(serverProc, routeFormsId);
        const routeFormsParsed = JSON.parse(routeFormsResp.result?.content?.[0]?.text || '{}');
        if (routeFormsParsed.primary_skill !== 'solid-component-builder' || routeFormsParsed.secondary_skill !== 'solid-forms-validation') {
            errors.push(`route_solid_intent (forms): expected solid-component-builder + solid-forms-validation, got: ${JSON.stringify(routeFormsParsed)}`);
        }

        // 33. Call route_solid_intent for solid-accessibility-a11y
        const routeA11yId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'route_solid_intent',
            arguments: { prompt: 'Implement accessible modal dialog with Kobalte and WAI-ARIA focus management' }
        }, routeA11yId);
        const routeA11yResp = await waitForResponse(serverProc, routeA11yId);
        const routeA11yParsed = JSON.parse(routeA11yResp.result?.content?.[0]?.text || '{}');
        if (routeA11yParsed.primary_skill !== 'solid-component-builder' || routeA11yParsed.secondary_skill !== 'solid-accessibility-a11y') {
            errors.push(`route_solid_intent (a11y): expected solid-component-builder + solid-accessibility-a11y, got: ${JSON.stringify(routeA11yParsed)}`);
        }

        // 34. Call route_solid_intent for solid-animation-transitions
        const routeAnimId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'route_solid_intent',
            arguments: { prompt: 'Add enter and exit animations to list reordering with solid-transition-group' }
        }, routeAnimId);
        const routeAnimResp = await waitForResponse(serverProc, routeAnimId);
        const routeAnimParsed = JSON.parse(routeAnimResp.result?.content?.[0]?.text || '{}');
        if (routeAnimParsed.primary_skill !== 'solid-component-builder' || routeAnimParsed.secondary_skill !== 'solid-animation-transitions') {
            errors.push(`route_solid_intent (animations): expected solid-component-builder + solid-animation-transitions, got: ${JSON.stringify(routeAnimParsed)}`);
        }

        // 35. Call route_solid_intent for solid-primitives-ecosystem
        const routePrimId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'route_solid_intent',
            arguments: { prompt: 'Integrate @solid-primitives/storage with reactive localStorage sync and SSR fallback' }
        }, routePrimId);
        const routePrimResp = await waitForResponse(serverProc, routePrimId);
        const routePrimParsed = JSON.parse(routePrimResp.result?.content?.[0]?.text || '{}');
        if (routePrimParsed.primary_skill !== 'solid-component-builder' || routePrimParsed.secondary_skill !== 'solid-primitives-ecosystem') {
            errors.push(`route_solid_intent (primitives): expected solid-component-builder + solid-primitives-ecosystem, got: ${JSON.stringify(routePrimParsed)}`);
        }

        // 36. Call audit_solid_code for no-browser-globals-in-setup
        const auditBrowserId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'audit_solid_code',
            arguments: { code: 'function Comp() { const width = window.innerWidth; return <div>{width}</div>; }' }
        }, auditBrowserId);
        const auditBrowserResp = await waitForResponse(serverProc, auditBrowserId);
        const auditBrowserParsed = JSON.parse(auditBrowserResp.result?.content?.[0]?.text || '{}');
        if (!auditBrowserParsed.issues?.some((i) => i.rule === 'no-browser-globals-in-setup')) {
            errors.push(`audit_solid_code (browser-globals): expected no-browser-globals-in-setup rule trigger, got: ${JSON.stringify(auditBrowserParsed)}`);
        }

        // 37. Call audit_solid_code for no-signal-mutation-in-memo
        const auditMemoId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'audit_solid_code',
            arguments: { code: 'const doubled = createMemo(() => { setCurrentPage(totalPages()); return 1; });' }
        }, auditMemoId);
        const auditMemoResp = await waitForResponse(serverProc, auditMemoId);
        const auditMemoParsed = JSON.parse(auditMemoResp.result?.content?.[0]?.text || '{}');
        if (!auditMemoParsed.issues?.some((i) => i.rule === 'no-signal-mutation-in-memo')) {
            errors.push(`audit_solid_code (memo-mutation): expected no-signal-mutation-in-memo rule trigger, got: ${JSON.stringify(auditMemoParsed)}`);
        }

        // 38. Call audit_solid_code for no-untracked-prop-copy
        const auditPropCopyId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'audit_solid_code',
            arguments: { code: 'function Comp(props) { const title = props.title; return <div>{title}</div>; }' }
        }, auditPropCopyId);
        const auditPropCopyResp = await waitForResponse(serverProc, auditPropCopyId);
        const auditPropCopyParsed = JSON.parse(auditPropCopyResp.result?.content?.[0]?.text || '{}');
        if (!auditPropCopyParsed.issues?.some((i) => i.rule === 'no-untracked-prop-copy')) {
            errors.push(`audit_solid_code (prop-copy): expected no-untracked-prop-copy rule trigger, got: ${JSON.stringify(auditPropCopyParsed)}`);
        }

        // 39. Call detect_solid_version for SolidJS 1.x default / package.json
        const detectV1Id = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'detect_solid_version',
            arguments: { package_json: JSON.stringify({ dependencies: { 'solid-js': '^1.8.15' } }) }
        }, detectV1Id);
        const detectV1Resp = await waitForResponse(serverProc, detectV1Id);
        const detectV1Parsed = JSON.parse(detectV1Resp.result?.content?.[0]?.text || '{}');
        if (detectV1Parsed.detected_version !== '1.x' || detectV1Parsed.is_v2 !== false || !detectV1Parsed.approved_primitives?.primitive_lists?.includes('<Index')) {
            errors.push(`detect_solid_version (1.x): expected 1.x with <Index>, got: ${JSON.stringify(detectV1Parsed)}`);
        }

        // 40. Call detect_solid_version for SolidJS 2.0-rc
        const detectV2Id = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'detect_solid_version',
            arguments: { package_json: JSON.stringify({ dependencies: { 'solid-js': '^2.0.0-rc.9' } }) }
        }, detectV2Id);
        const detectV2Resp = await waitForResponse(serverProc, detectV2Id);
        const detectV2Parsed = JSON.parse(detectV2Resp.result?.content?.[0]?.text || '{}');
        if (detectV2Parsed.detected_version !== '2.0-rc' || detectV2Parsed.is_v2 !== true || !detectV2Parsed.approved_primitives?.primitive_lists?.includes('keyed={false}')) {
            errors.push(`detect_solid_version (2.0-rc): expected 2.0-rc with keyed={false}, got: ${JSON.stringify(detectV2Parsed)}`);
        }

        // 41. Call detect_solid_version for prohibited version mixing
        const detectMixedId = reqId++;
        sendJsonRpc(serverProc, 'tools/call', {
            name: 'detect_solid_version',
            arguments: { code: '<Index each={items()}>{(item) => <Loading fallback={<Spin/>}>{item()}</Loading>}</Index>' }
        }, detectMixedId);
        const detectMixedResp = await waitForResponse(serverProc, detectMixedId);
        const detectMixedParsed = JSON.parse(detectMixedResp.result?.content?.[0]?.text || '{}');
        if (!detectMixedParsed.version_mixing_detected || detectMixedParsed.detected_version !== 'mixed') {
            errors.push(`detect_solid_version (mixed): expected version_mixing_detected=true, got: ${JSON.stringify(detectMixedParsed)}`);
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

    console.log('MCP integration tests passed (41 checks).');
}

runTests().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
});
