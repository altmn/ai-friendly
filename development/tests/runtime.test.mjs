import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.AFF_PACKAGE_ROOT ?? path.resolve(here, '../../ai-friendly-audit');
const cli = path.join(root, 'scripts/audit.mjs');
const run = promisify(execFile);
const mod = (name) => import(pathToFileURL(path.join(root, `scripts/lib/${name}.mjs`)).href);
const { isPublicAddress, validateTarget } = await mod('http');
const { sanitizeData, sanitizeUrl, markdownText } = await mod('privacy');
const { inspectInitialHtml, requireHtmlParser } = await mod('collect');
const { validateAudit, calculateCoverage } = await mod('validation');
const { writeFiles, verifyArtifactPaths } = await mod('io');
const { parse } = await requireHtmlParser();
const work = await fs.mkdtemp(path.join(process.env.AFF_TEST_WORKDIR ?? path.resolve(here, '..'), 'runtime-test-'));
let server; let origin; let goodAudit;

test.before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/invalid-redirect') { res.writeHead(302, { location: 'http://[' }); res.end(); return; }
    if (req.url === '/redirect') { res.writeHead(302, { location: `http://localhost:${server.address().port}/good` }); res.end('not retained'); return; }
    if (req.url === '/large') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('X'.repeat(20000)); return; }
    if (req.url === '/slow') { setTimeout(() => { res.writeHead(200); res.end('late'); }, 400); return; }
    if (req.url === '/blocked') { res.writeHead(403, { 'content-type': 'text/html' }); res.end('<html lang="en"><title>Denied</title></html>'); return; }
    if (req.url === '/missing') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><html><head></head><body>Sample</body></html>'); return; }
    if (req.url === '/secrets') { res.writeHead(200, { 'content-type': 'text/html', 'set-cookie': 'session=NEVER_SAVE_COOKIE' }); res.end('<!doctype html><html lang="en"><head><title>password=NEVER_SAVE_TITLE</title></head><body>NEVER_SAVE_BODY alice@fixture.invalid<script>const secret="NEVER_SAVE_SCRIPT"</script></body></html>'); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html lang="en-US"><head><title>Fixture catalog</title><meta name="robots" content="noindex"></head><body><h1>Catalog</h1><p>$10 each, excluding tax.</p></body></html>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); });

async function command(args, expected = 0) {
  try {
    const result = await run(process.execPath, [cli, ...args], { timeout: 10000, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(expected, 0, `Expected nonzero exit, got success: ${result.stdout}`); return result;
  } catch (error) { assert.equal(error.code, expected, `${error.stderr ?? error.message}`); return error; }
}
async function collect(route, name, flags = [], exit = 0) {
  const out = path.join(work, name);
  await command(['collect', '--url', `${origin}${route}`, '--out', out, '--allow-localhost-fixture', ...flags], exit);
  const audit = JSON.parse(await fs.readFile(path.join(out, 'audit.json')));
  await command(['validate', '--input', out]);
  return audit;
}

test('public-address filter rejects private, metadata, mapped and reserved routes', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.2.3', '192.168.1.1', '169.254.169.254', '100.64.0.2', '192.0.2.1', '198.51.100.1', '203.0.113.1', '::1', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '2001:db8::1', '2002:7f00:1::']) assert.equal(isPublicAddress(ip), false, ip);
  for (const ip of ['8.8.8.8', '1.1.1.1', '192.0.78.24', '192.0.80.1', '2606:4700:4700::1111']) assert.equal(isPublicAddress(ip), true, ip);
});
test('URL scope, unsafe routes and credential query values are rejected', () => {
  for (const url of ['file:///etc/passwd', 'https://user:pass@example.com', 'http://127.0.0.1/', 'https://example.com/logout', 'https://example.com/?token=abc', 'https://example.com/?action=delete', 'https://example.com/#token=abc']) assert.throws(() => validateTarget(url), url);
  assert.throws(() => validateTarget('https://example.net/', { allowOrigins: new Set(['https://example.com']) }));
});
test('redaction removes secrets and opaque identifiers before persistence', () => {
  const data = sanitizeData({ authorization: 'Bearer fakevalue', url: 'https://user:password@example.com/user/123456?token=abc&utm_source=test#secret', note: 'password=fixtureSecret user alice@fixture.invalid' });
  assert(!JSON.stringify(data).includes('fakevalue')); assert(!JSON.stringify(data).includes('fixtureSecret')); assert(!JSON.stringify(data).includes('alice@'));
  assert(!sanitizeUrl('https://example.com/user/123456?token=abc').includes('123456'));
  assert(!sanitizeUrl('https://example.com/?token=abc').includes('abc'));
  const nested = sanitizeData({ observed_data: { version: 'Bearer NEVER_SAVE_NESTED_VERSION', started_at: 'password=NEVER_SAVE_NESTED_TIMESTAMP', sha256: 'Bearer NEVER_SAVE_NESTED_HASH' } });
  assert(!JSON.stringify(nested).includes('NEVER_SAVE_'), 'Free-form keys cannot bypass redaction.');
});
test('untrusted Markdown and active HTML cannot become rendered links or images', () => {
  const escaped = markdownText('![leak](https://evil.invalid/a)<script>alert(1)</script>');
  assert(escaped.includes('\\!\\[')); assert(escaped.includes('&lt;script&gt;'));
});
test('HTML parser ignores fake title metadata inside scripts and templates', () => {
  for (const body of ['<html><script>const x="<title>Fake</title>";</script></html>', '<html><template><title>Fake</title></template></html>']) assert.equal(inspectInitialHtml(body, parse).title_nonempty, false);
});
test('capability detection is available without network access', async () => {
  const result = await command(['capabilities']); const manifest = JSON.parse(result.stdout);
  assert.equal(manifest.capabilities.initial_response.status, 'not_attempted'); assert.equal(manifest.capabilities.rendered_dom.status, 'unsupported');
});
test('bounded HTTP collector generates a complete valid partial report', async () => {
  goodAudit = await collect('/good', 'good');
  assert.equal(goodAudit.run.test_context, 'controlled_fixture'); assert.equal(goodAudit.run.status, 'partial');
  assert.equal(goodAudit.coverage.successful_trials, 0);
  assert.equal(goodAudit.checks.find((c) => c.rule_id === 'AFF-SEM-004').outcome, 'passed');
  assert.equal(goodAudit.checks.find((c) => c.rule_id === 'AFF-SEM-005').outcome, 'passed');
  assert.equal(goodAudit.checks.filter((c) => c.outcome === 'passed').length, 2);
  assert(goodAudit.checks.some((c) => c.outcome === 'untested'));
  assert(goodAudit.owner_verification.every((o) => o.applicability === 'unknown'));
});
test('missing initial title and lang generate scoped low-severity findings', async () => {
  const audit = await collect('/missing', 'missing');
  assert.equal(audit.findings.length, 2); assert(audit.findings.every((f) => f.severity === 'low' && f.modalities[0] === 'http'));
});
test('response bodies and cookies never enter persisted evidence', async () => {
  await collect('/secrets', 'secrets');
  const files = await fs.readdir(path.join(work, 'secrets'));
  for (const file of files.filter((f) => /\.(json|md)$/.test(f))) {
    const content = await fs.readFile(path.join(work, 'secrets', file), 'utf8');
    for (const secret of ['NEVER_SAVE_COOKIE', 'NEVER_SAVE_TITLE', 'NEVER_SAVE_BODY', 'NEVER_SAVE_SCRIPT', 'alice@fixture.invalid']) assert(!content.includes(secret), `${file} retained ${secret}`);
  }
});
test('out-of-origin redirect preserves a limitation without following it', async () => {
  const audit = await collect('/redirect', 'redirect', [], 2);
  assert.equal(audit.states.length, 0); assert(audit.limitations.some((l) => l.includes('outside the explicit scope')));
});
test('malformed server redirect preserves a partial limitations report', async () => {
  const audit = await collect('/invalid-redirect', 'invalid-redirect', [], 2);
  assert.equal(audit.states.length, 0); assert(audit.limitations.some((l) => l.includes('invalid redirect URL')));
});
test('byte limit and timeout preserve honest partial reports', async () => {
  const large = await collect('/large', 'large', ['--max-bytes', '1024'], 2);
  const slow = await collect('/slow', 'slow', ['--timeout-ms', '100'], 2);
  assert.equal(large.coverage.check_outcomes.passed, 0); assert.equal(slow.coverage.check_outcomes.passed, 0);
});
test('access barrier does not become a title or accessibility defect', async () => {
  const audit = await collect('/blocked', 'blocked');
  assert.equal(audit.findings.length, 0); assert.equal(audit.checks.find((c) => c.rule_id === 'AFF-SEM-004').reason_code, 'site_access_barrier');
});
test('schema and semantic validation reject false passes, unknown references and count tampering', async () => {
  assert(goodAudit);
  for (const edit of [
    (a) => { a.coverage.successful_trials = 1; },
    (a) => { a.checks.find((c) => c.outcome === 'passed').evidence_ids = ['missing-evidence']; },
    (a) => { a.capabilities.capabilities.initial_response.status = 'unsupported'; },
    (a) => { a.evidence.push({ ...a.evidence[0] }); }
  ]) { const a = structuredClone(goodAudit); edit(a); assert((await validateAudit(a)).length > 0); }
});
test('derived artifact drift is detected', async () => {
  const dir = path.join(work, 'drift'); await fs.cp(path.join(work, 'good'), dir, { recursive: true });
  const file = path.join(dir, 'compatibility-tests.json'); const data = JSON.parse(await fs.readFile(file)); data.run_id = 'wrong-run'; await fs.writeFile(file, JSON.stringify(data));
  await command(['validate', '--input', dir], 1);
});
test('import, report and schema-only validation work without a browser', async () => {
  const imported = path.join(work, 'imported'); const reported = path.join(work, 'reported');
  await command(['import', '--input', path.join(work, 'good', 'audit.json'), '--out', imported]);
  await command(['validate', '--input', imported]);
  await command(['report', '--input', imported, '--out', reported]);
  await command(['validate', '--input', reported]);
  await command(['validate', '--input', path.join(imported, 'evidence-index.json'), '--schema', 'evidence-index']);
});
test('output overwrite and symlink traversal are refused', async () => {
  await command(['collect', '--url', `${origin}/good`, '--out', path.join(work, 'good'), '--allow-localhost-fixture'], 1);
  const link = path.join(work, 'link'); await fs.symlink(path.join(work, 'good'), link);
  await assert.rejects(writeFiles(path.join(link, 'child'), { 'x.json': {} }), /symbolic/);
});
test('concurrent output writers cannot overwrite or mix generated artifacts', async () => {
  const directory = path.join(work, 'concurrent-writers');
  const first = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`output-${i}.json`, { writer: 'first' }]));
  const second = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`output-${i}.json`, { writer: 'second' }]));
  const results = await Promise.allSettled([writeFiles(directory, first), writeFiles(directory, second)]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  const authors = new Set(await Promise.all(Object.keys(first).map(async (name) => JSON.parse(await fs.readFile(path.join(directory, name))).writer)));
  assert.equal(authors.size, 1);
  await assert.rejects(fs.stat(path.join(directory, '.audit-write.lock')), { code: 'ENOENT' });
});
test('retained-file integrity uses actual bytes', async () => {
  const a = structuredClone(goodAudit); const dir = path.join(work, 'integrity'); await fs.mkdir(dir);
  await fs.writeFile(path.join(dir, 'excerpt.txt'), 'fixture safe text');
  a.evidence[0].artifact_path = 'excerpt.txt'; a.evidence[0].sha256 = '0'.repeat(64);
  assert((await verifyArtifactPaths(a, dir)).some((error) => error.includes('SHA-256')));
});
test('report refuses a retained artifact path changed by redaction before any rewrite', async () => {
  const { createHash } = await import('node:crypto');
  const a = structuredClone(goodAudit); const dir = path.join(work, 'private-filename'); await fs.mkdir(path.join(dir, 'evidence'), { recursive: true });
  const bytes = 'safe fixture excerpt'; const filename = 'evidence/tester@example.com.txt';
  await fs.writeFile(path.join(dir, filename), bytes);
  a.evidence[0].artifact_path = filename; a.evidence[0].sha256 = createHash('sha256').update(bytes).digest('hex');
  const canonical = JSON.stringify(a); await fs.writeFile(path.join(dir, 'audit.json'), canonical);
  await command(['report', '--input', dir, '--out', dir, '--overwrite'], 1);
  assert.equal(await fs.readFile(path.join(dir, 'audit.json'), 'utf8'), canonical);
  await assert.rejects(fs.stat(path.join(dir, 'audit-report.md')), { code: 'ENOENT' });
});

function withSyntheticContractTrial() {
  const audit = structuredClone(goodAudit);
  const state = audit.states[0]; const ids = audit.evidence.map((e) => e.id);
  const actor = { product: 'synthetic-contract-fixture', product_version: '1.0.0', model: 'not_exposed' };
  const journey = {
    schema_version: '1.0.0', id: 'journey-contract-fixture', trial_number: 1,
    started_at: audit.run.started_at, completed_at: audit.run.completed_at, guide_revision: '2.0', guide_sections: ['6', '11'], guide_goal: 'retrieve', profile: 'public-retrieval', test_context: 'controlled_fixture',
    skill_host: actor, tested_agent: { ...actor, relationship_to_skill_host: 'same_actor' },
    execution: { conversation_surface: 'cli', execution_location: 'local', mode: 'http', interaction_mode: 'http', browser_version: 'not_exposed', provider_or_profile: 'isolated-fixture', adapter_version: '1.0.0', capability_manifest_id: audit.capabilities.id, prior_diagnostic_assistance: false },
    session: { status: 'anonymous', credential_exported: false }, environment: { locale: null, timezone: null, currency: null, viewport: { width: null, height: null } },
    task: { prompt: 'Read the fixture initial document title.', prompt_redacted: false, starting_state_id: state.id, frontend_success_conditions: ['The initial document title is recorded.'], action_boundary: 'public_read_only', consequential_commit_permitted: false, fixture_id: 'schema-contract-only', reset_method: 'fresh-report-clone', fault_injection: 'controlled_fixture', budget: { max_actions: 1, max_seconds: 30 } },
    verification: { layer: 'frontend', backend_record_checked: false, business_effect_verified: null, unintended_effect_count: null, evidence_ids: ids },
    observations: Object.fromEntries(['access', 'comprehension', 'execution', 'correctness'].map((dimension) => [dimension, { status: 'passed', description: 'Synthetic contract-validator fixture dimension; not a product-compatibility claim.', evidence_ids: ids }])),
    outcome: { execution: 'frontend_complete', goal_conditions_met: true, completion_scope: 'initial_response_only', business_effect_outcome: 'not_attempted', observed_effect_issues: [], intervention_count: 0, recovery_count: 0, blocked_by: null, stop_reason: null, final_state_id: state.id }
  };
  audit.journeys = [journey]; audit.coverage = calculateCoverage(audit); return audit;
}

test('frontend trial contract keeps backend effects null and rejects invented verification', async () => {
  const base = withSyntheticContractTrial(); assert.deepEqual(await validateAudit(base), []);
  for (const [field, value] of [['backend_record_checked', true], ['business_effect_verified', true], ['unintended_effect_count', 0]]) {
    const audit = structuredClone(base); audit.journeys[0].verification[field] = value;
    assert((await validateAudit(audit)).length > 0, field);
  }
});
test('material incorrect effects remain unsuccessful after the goal is later reached', async () => {
  const audit = withSyntheticContractTrial(); const journey = audit.journeys[0];
  journey.outcome.observed_effect_issues.push({ id: 'effect-error-1', observed_at: audit.run.completed_at, description: 'Synthetic material wrong-target fixture.', material: true, unauthorized_action: false, rationale: 'Wrong target is material to the declared task.', evidence_ids: [audit.evidence[0].id] });
  journey.outcome.recovery_count = 1;
  assert((await validateAudit(audit)).length > 0, 'success cannot hide an earlier error');
  journey.outcome.execution = 'observed_incorrect_result_or_effect'; audit.coverage = calculateCoverage(audit);
  assert.equal(audit.coverage.successful_trials, 0); assert.equal(audit.coverage.material_error_trials, 1);
  assert.deepEqual(await validateAudit(audit), []);
});
test('compatibility companion records must agree with their actual journey', async () => {
  const audit = withSyntheticContractTrial(); const companion = { ...structuredClone(audit.journeys[0]), test_id: 'compatibility-fixture', journey_id: audit.journeys[0].id, documented_support: [] }; delete companion.id;
  audit.compatibility_tests = [companion]; assert.deepEqual(await validateAudit(audit), []);
  companion.tested_agent.product = 'unmeasured-other-product';
  assert((await validateAudit(audit)).some((error) => error.includes('tested_agent differs')));
});
test('static HTTP evidence cannot demonstrate visual or browser interaction success', async () => {
  const audit = withSyntheticContractTrial(); audit.journeys[0].execution.interaction_mode = 'visual';
  assert((await validateAudit(audit)).some((error) => error.includes('declared-mode capability')));
});
test('guide mapping cannot convert owner-only guarantees to unrelated frontend passes', async () => {
  const audit = structuredClone(goodAudit); const item = audit.guide_coverage.find((g) => g.checklist_id === 'G-A07');
  const passed = audit.checks.find((c) => c.outcome === 'passed');
  item.applicability = 'applicable'; item.disposition = 'frontend_assessed'; item.check_ids = [passed.id]; item.rule_ids = [passed.rule_id]; item.owner_verification_ids = [];
  audit.coverage = calculateCoverage(audit);
  const errors = await validateAudit(audit);
  assert(errors.some((error) => error.includes('does not map'))); assert(errors.some((error) => error.includes('omits OWN-')));
});
test('global capabilities cannot substitute for a check-specific evidence channel', async () => {
  const audit = structuredClone(goodAudit); const check = audit.checks.find((c) => c.rule_id === 'AFF-SEM-001');
  audit.evidence[0].channel = 'screenshot';
  audit.capabilities.capabilities.rendered_dom.status = 'available'; audit.capabilities.capabilities.computed_accessibility_tree.status = 'available';
  Object.assign(check, { outcome: 'passed', reason_code: null, evidence_ids: [audit.evidence[0].id], observed: 'Synthetic invalid semantics claim.' }); audit.coverage = calculateCoverage(audit);
  assert((await validateAudit(audit)).some((e) => e.includes('requires corresponding evidence')));
});
test('fully assessed guide rows cannot select only passing checks', async () => {
  const audit = structuredClone(goodAudit); const row = audit.guide_coverage.find((g) => g.checklist_id === 'G-A01');
  const title = audit.checks.find((c) => c.rule_id === 'AFF-SEM-004');
  row.disposition = 'frontend_assessed'; row.applicability = 'applicable'; row.check_ids = [title.id]; audit.coverage = calculateCoverage(audit);
  assert((await validateAudit(audit)).some((e) => e.includes('overstates planned check')));
});
test('imported target and state URLs respect declared origins without rejecting third-party evidence', async () => {
  const a = structuredClone(goodAudit); a.states[0].url = 'https://unrequested.example.net/';
  assert((await validateAudit(a)).some((e) => e.includes('outside the declared')));
  const b = structuredClone(goodAudit); b.states[0].origin = 'https://wrong.example.net';
  assert((await validateAudit(b)).some((e) => e.includes('disagree')));
  const c = structuredClone(goodAudit); c.run.target_url = 'https://unrequested.example.net/';
  assert((await validateAudit(c)).some((e) => e.includes('target origin')));
  const d = structuredClone(goodAudit); d.evidence[0].sanitized_url = 'https://cdn.example.net/resource.js';
  assert.deepEqual(await validateAudit(d), []);
});
test('supplied evidence can preserve explicitly unknown URL and origin', async () => {
  const a = structuredClone(goodAudit); a.run.mode = 'supplied-evidence'; a.run.test_context = 'supplied_evidence'; a.run.target_url = null;
  a.scope.allowed_origins = []; a.scope.planned_routes = ['unknown'];
  for (const state of a.states) { state.url = 'unknown'; state.origin = 'unknown'; }
  for (const e of a.evidence) { e.test_context = 'supplied_evidence'; e.sanitized_url = null; }
  for (const c of a.checks) c.test_context = 'supplied_evidence';
  assert.deepEqual(await validateAudit(sanitizeData(a)), []);
});
test('successful trials need passed evidence-backed measurement dimensions', async () => {
  const a = withSyntheticContractTrial(); a.journeys[0].observations.correctness.status = 'unknown';
  assert((await validateAudit(a)).some((e) => e.includes('passed correctness')));
});
