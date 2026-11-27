import { randomUUID } from 'node:crypto';
import { readCatalog, readModule } from './io.mjs';
import { calculateCoverage } from './validation.mjs';
import { PRIVACY_LIMITATION, sanitizeUrl } from './privacy.mjs';

export const CLI_COLLECTOR = { name: 'ai-friendly-audit-cli', version: '1.0.0', runtime: `Node.js ${process.versions.node}` };
export const CHECKLIST_SUBJECTS = [
  'Semantic controls, labels, keyboard and state', 'Retained form input and associated errors',
  'Dialog focus, overlays, targets and hydration', 'Sensitive field markup and logging exclusions',
  'Durable confirmations and material conditions', 'No mutation through safe-method navigation or prefetch',
  'Logical-operation retry keys and incompatible reuse', 'Commit-time actor, resource, version, price and availability checks',
  'Timeout, cancellation and late-commit recovery', 'Permissions, token audience, scopes and object authorization',
  'Continuation does not repeat a completed operation', 'Untrusted content cannot authorize unrelated actions',
  'Correct agent identity verification', 'Whole-journey WAF behavior and shared egress',
  'Public facts in retrievable HTML and stable URLs', 'Explicit locale, currency, timezone and dates',
  'Index, snippet, canonical, sitemap and robots policy', 'Separate content-use and access purposes',
  'Representation meaning, access and cache variation', 'Supported API/MCP transports, authentication, scopes and setup',
  'Structured tools, errors and service consistency', 'Supported WebMCP client and normal UI fallback',
  'Product, environment, account, model, tools and fixture recorded', 'Authoritative business correctness and unintended effects checked',
  'Success, interruption, incorrect and unresolved distinguished', 'Owners and checked dates for documentation and tests'
];

export async function detectCapabilities() {
  const module = await readModule();
  const capabilities = {};
  for (const name of module.capability_requirements.capability_names) capabilities[name] = {
    status: 'unsupported', reason: 'The standalone HTTP CLI does not expose this host/browser capability. A host adapter may provide it separately.', adapter: 'node-http', version: '1.0.0'
  };
  for (const name of ['terminal', 'filesystem']) capabilities[name] = { status: 'available', reason: 'The Node CLI is running and has read the local package manifest.', probe: 'current process and local manifest read', adapter: 'node', version: process.versions.node };
  capabilities.http_retrieval = { status: 'available', reason: 'The bounded Node HTTP collector is present; target egress is not yet tested.', adapter: 'node-http', version: '1.0.0' };
  for (const name of ['initial_response', 'network_egress', 'network_metadata', 'request_timing', 'response_bodies']) capabilities[name] = { status: 'not_attempted', reason: 'No target request has been made.', adapter: 'node-http', version: '1.0.0' };
  capabilities.original_source = { status: 'not_attempted', reason: 'No original frontend source was supplied or inspected.' };
  return { schema_version: '1.0.0', id: `capabilities-${randomUUID()}`, captured_at: new Date().toISOString(), conversation_surface: 'cli', execution_location: 'unknown', browser_context: null, capabilities };
}

export function makeGuideCoverage(catalog, checks, owners = []) {
  return CHECKLIST_SUBJECTS.map((subject, i) => {
    const checklist_id = `G-A${String(i + 1).padStart(2, '0')}`;
    const mapped = catalog.rules.filter((r) => r.guide_checklist_ids.includes(checklist_id));
    const rule_ids = mapped.map((r) => r.id);
    const linked = checks.filter((c) => rule_ids.includes(c.rule_id));
    const ownerItems = owners.filter((o) => o.guide_checklist_ids.includes(checklist_id));
    const evaluated = linked.filter((c) => ['passed', 'failed'].includes(c.outcome));
    return {
      checklist_id, subject, guide_sections: [...new Set(mapped.flatMap((r) => r.guide_sections))].length ? [...new Set(mapped.flatMap((r) => r.guide_sections))] : ['Appendix A'],
      applicability: evaluated.length ? 'applicable' : 'unknown',
      disposition: evaluated.length ? (ownerItems.length ? 'mixed' : 'frontend_partially_assessed') : (ownerItems.length ? 'owner_verification_required' : 'untested'),
      rule_ids, check_ids: linked.map((c) => c.id), owner_verification_ids: ownerItems.map((o) => o.id),
      reason: evaluated.length ? 'Only the explicitly recorded initial-response checks were evaluated; remaining interface, task and owner guarantees are untested.' : 'Applicability and full requirement coverage require host-driven scope assessment. Potential owner-verification needs are retained with unknown applicability; missing tools do not establish irrelevance.'
    };
  });
}

export async function newAudit(url, { allowOrigins, fixture = false, maxBytes = 2_000_000, timeoutMs = 20_000, maxRequests = 5 } = {}) {
  const module = await readModule(); const catalog = await readCatalog(); const capabilities = await detectCapabilities();
  const now = new Date().toISOString(); const target = sanitizeUrl(url); const stateId = 'state-initial-response';
  const checks = catalog.rules.filter((r) => r.evidence_scope !== 'owner_verification_required').map((rule, index) => ({
    id: `check-${String(index + 1).padStart(3, '0')}`, rule_id: rule.id, rule_version: rule.version, state_id: null,
    profile: rule.profiles[0], outcome: 'untested', reason_code: 'tool_unavailable',
    reason: 'No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels.',
    target: 'Planned initial document; no rendered state or interaction is implied.', expected: rule.expected_result,
    observed: 'Not observed.', evidence_ids: [], evidence_scope: rule.evidence_scope,
    test_context: fixture ? 'controlled_fixture' : 'live'
  }));
  const owners = (catalog.owner_requirements ?? []).map((owner) => ({
    id: owner.id, guide_sections: owner.guide_sections, guide_checklist_ids: owner.guide_checklist_ids, applicability: 'unknown',
    related_check_ids: checks.filter((c) => catalog.rules.find((r) => r.id === c.rule_id)?.owner_verification_ids.includes(owner.id)).map((c) => c.id),
    observed_indicators: [], unknown_guarantee: owner.unknown_guarantee, status: 'owner_verification_required', workstream: owner.workstream,
    verification_priority: 'medium', priority_rationale: 'Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.',
    requested_evidence: owner.requested_evidence, acceptance_procedure: owner.acceptance_procedure, review_trigger: owner.review_trigger, external_assessment: null
  }));
  const audit = {
    schema_version: '1.0.0',
    run: { id: `run-${randomUUID()}`, started_at: now, completed_at: null, status: 'initialized', mode: 'http', test_context: fixture ? 'controlled_fixture' : 'live', collector: CLI_COLLECTOR, target_url: target, action_envelope: 'One explicitly supplied public document; bounded GET and in-scope redirects only. No browser interaction, credentials, link crawl, request replay or state-changing actions.' },
    module: { id: module.id, version: module.version, rule_catalog_version: module.rule_catalog_version },
    guide: { revision: '2.0', source: 'Engineering an AI-Agent-Friendly Website — supplied revision 2.0', checklist_version: '1.0.0' },
    goals: module.profiles.map((p, i) => ({ profile: p.id, guide_goal: p.guide_goal, selected: i < 3, reason: i < 3 ? 'Baseline goal retained; unsupported channels remain untested.' : 'Conditional profile; offer/source applicability has not been established.' })),
    scope: {
      allowed_origins: (allowOrigins ?? [new URL(url).origin]).map((origin) => new URL(origin).origin), excluded_paths: [], planned_routes: [target], planned_states: [stateId],
      priority_tasks: ['Inspect the initial public document response.', 'Identify whether its initial title and language metadata are usable.', 'Record retrieval and discovery evidence gaps for a host-driven task audit.'],
      session: { status: 'anonymous', credential_exported: false, notes: 'No browser session is attached or transferred.' }, viewport: { width: null, height: null },
      intended_locale: null, intended_timezone: null, intended_currency: null, effective_locale: null, effective_timezone: null, effective_currency: null,
      content_use_intent: 'unknown_unless_supplied', budgets: { ...module.defaults.budget, max_routes: 1, max_states: 1, max_requests: maxRequests, max_response_bytes: maxBytes, request_timeout_ms: timeoutMs, max_concurrent_pages: 1 }
    },
    capabilities, states: [], evidence: [], checks, findings: [], journeys: [], representation_comparisons: [], compatibility_tests: [], owner_verification: owners,
    guide_coverage: makeGuideCoverage(catalog, checks, owners), coverage: {},
    verdicts: module.profiles.map((p) => ({ profile: p.id, verdict: 'not_assessed', summary: 'Initialized scope only; no task or profile has been demonstrated.', evidence_ids: [], journey_ids: [], limitations: ['No live observation or task trial has occurred.'] })),
    limitations: [
      'The standalone collector inspects one public HTTP document and its explicit in-scope redirects. It does not drive a browser, execute JavaScript, compute accessibility, measure actual extractor output or verify server guarantees.',
      'Site purpose, target facts, content-use intent and intended locale need the host workflow. The three initial tasks above describe this bounded collection only.',
      'Source code, private routes, owner guarantees and actual agent-product compatibility remain unassessed.',
      PRIVACY_LIMITATION
    ]
  };
  audit.coverage = calculateCoverage(audit);
  return audit;
}
