import { collectHttp } from './http.mjs';
import { readCatalog } from './io.mjs';
import { CLI_COLLECTOR, makeGuideCoverage, newAudit } from './model.mjs';
import { calculateCoverage } from './validation.mjs';
import { PRIVACY_LIMITATION, redactText } from './privacy.mjs';

export async function requireHtmlParser() {
  try { return await import('parse5'); }
  catch { throw new Error('HTTP static checks require pinned parse5. Run npm ci --ignore-scripts inside the package, or import host-produced evidence.'); }
}

function attr(node, name) { return node?.attrs?.find((a) => a.name === name)?.value ?? null; }
function textContent(node) { return node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(textContent).join(''); }
function find(node, name) {
  if (node.tagName === name) return node;
  for (const child of node.childNodes ?? []) { const hit = find(child, name); if (hit) return hit; }
  return null;
}

export function inspectInitialHtml(body, parse) {
  const parseErrors = [];
  const tree = parse(body, { sourceCodeLocationInfo: true, onParseError: (error) => { if (parseErrors.length < 20) parseErrors.push(error.code); } });
  const html = find(tree, 'html'); const head = (html?.childNodes ?? []).find((n) => n.tagName === 'head');
  const titleNode = (head?.childNodes ?? []).find((n) => n.tagName === 'title');
  const title = titleNode ? textContent(titleNode).trim() : '';
  const lang = attr(html, 'lang'); let languageSyntaxValid = false;
  if (lang?.trim()) { try { languageSyntaxValid = Intl.getCanonicalLocales(lang.trim()).length === 1; } catch { /* invalid language syntax */ } }
  const meta = (head?.childNodes ?? []).filter((n) => n.tagName === 'meta');
  const charset = meta.map((node) => attr(node, 'charset')).find(Boolean) ?? null;
  const robots = meta.filter((node) => /^(robots|googlebot|bingbot)$/i.test(attr(node, 'name') ?? '')).map((node) => ({ agent: attr(node, 'name'), directives: redactText((attr(node, 'content') ?? '').slice(0, 400)) }));
  const canonicalCount = (head?.childNodes ?? []).filter((node) => node.tagName === 'link' && (attr(node, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical')).length;
  return {
    title_present: Boolean(titleNode), title_nonempty: Boolean(title), title_excerpt: redactText(title.slice(0, 240)),
    root_lang_present: lang !== null, root_lang: lang ? redactText(lang.slice(0, 80)) : null, root_lang_syntax_valid: languageSyntaxValid,
    language_tag_uncertainty: Boolean(lang?.trim() && !languageSyntaxValid && /^[a-z]{1,8}(?:-[a-z0-9]{1,8})*$/i.test(lang.trim())),
    charset, robots, canonical_count: canonicalCount,
    parse_error_count_capped: parseErrors.length, parse_errors: parseErrors,
    decoder_uncertainty: title.includes('\uFFFD') || (charset && !/^(utf-8|utf8|us-ascii)$/i.test(charset))
  };
}

function observation(audit, { channel, summary, data, sequence = 0, stateId = null }) {
  return {
    id: `evidence-http-${String(sequence + 1).padStart(3, '0')}`, run_id: audit.run.id, state_id: stateId,
    timestamp: new Date().toISOString(), sequence, channel, representation: 'initial_http_response',
    evidence_scope: 'frontend_verifiable', test_context: audit.run.test_context, sanitized_url: audit.run.target_url,
    sanitized: true, sanitization: { method: 'Metadata allowlist, bounded static signals, URL and known-sensitive-pattern redaction; raw response discarded.', reviewed: false, limitations: [PRIVACY_LIMITATION] },
    collector: CLI_COLLECTOR, artifact_path: null, sha256: null, summary, limitations: ['No rendered DOM, accessibility tree, actual extractor output, authenticated session or authoritative business record is represented.'],
    observed_data: data
  };
}

export async function performCollection(url, options) {
  const { parse } = await requireHtmlParser();
  const audit = await newAudit(url, options); const catalog = await readCatalog();
  try {
    const result = await collectHttp(url, { allowOrigins: audit.scope.allowed_origins, allowLocalhostFixture: options.fixture, maxBytes: options.maxBytes, timeoutMs: options.timeoutMs, maxRequests: options.maxRequests });
    const stateId = audit.scope.planned_states[0]; const capturedAt = new Date().toISOString();
    audit.states.push({ id: stateId, url: result.finalUrl, origin: new URL(result.finalUrl).origin, captured_at: capturedAt, session_scope: 'observed_anonymously', viewport: { width: null, height: null }, representation: 'initial_http_response', baseline: true, notes: ['One public HTTP response; no JavaScript execution or browser state.'] });
    for (const name of ['initial_response', 'network_egress', 'network_metadata', 'request_timing', 'response_bodies']) audit.capabilities.capabilities[name] = { status: 'available', reason: name === 'response_bodies' ? 'The bounded public response was inspected transiently; raw bytes were not retained.' : 'Observed during this explicit public request.', adapter: 'node-http', version: '1.0.0', limitations: ['Only HTTP collector traffic is represented; no browser subrequests or previous traffic.'] };
    const metadata = observation(audit, { channel: 'http_response', summary: `Public document returned HTTP ${result.status}; ${result.bytes} response bytes were read.`, data: { status: result.status, complete: result.complete, bytes: result.bytes, duration_ms: result.durationMs, headers: result.headers, redirects_and_final: result.attempts }, stateId });
    metadata.sanitized_url = result.finalUrl; audit.evidence.push(metadata);
    const contentType = String(result.headers['content-type'] ?? '').toLowerCase();
    const encoding = /charset\s*=\s*["']?([^;"'\s]+)/i.exec(contentType)?.[1] ?? null;
    const htmlResponse = result.status >= 200 && result.status < 300 && contentType.split(';')[0].trim() === 'text/html' && result.complete && result.body !== null;
    for (const check of audit.checks) { check.state_id = stateId; check.target = 'Initial public HTTP document; rendered UI and task behavior excluded.'; }
    if (htmlResponse) {
      const signals = inspectInitialHtml(result.body, parse);
      const staticEvidence = observation(audit, { channel: 'source', summary: 'Parsed initial-response document title, root language and limited discovery metadata. Presence is not a rendered accessibility or indexing result.', data: signals, sequence: 1, stateId });
      staticEvidence.sanitized_url = result.finalUrl; audit.evidence.push(staticEvidence);
      for (const [ruleId, condition, detail] of [
        ['AFF-SEM-004', signals.title_nonempty, signals.title_nonempty ? 'The initial document contains a nonempty title.' : 'The initial document has no nonempty title.'],
        ['AFF-SEM-005', signals.root_lang_syntax_valid, signals.root_lang_syntax_valid ? 'The initial root language value has usable language-tag syntax.' : 'The initial root language metadata is missing, empty or syntactically unusable.']
      ]) {
        const check = audit.checks.find((c) => c.rule_id === ruleId); if (!check) continue;
        if (signals.decoder_uncertainty || (encoding && !/^(utf-8|utf8|us-ascii)$/i.test(encoding)) || (ruleId === 'AFF-SEM-005' && signals.language_tag_uncertainty)) {
          Object.assign(check, { outcome: 'cantTell', reason_code: 'inconclusive_observation', reason: 'Character decoding or a language tag outside the runtime validator’s supported syntax needs manual inspection.', observed: 'Static result withheld because this representation could not be interpreted confidently.', evidence_ids: [metadata.id, staticEvidence.id] });
        } else {
          Object.assign(check, { outcome: condition ? 'passed' : 'failed', reason_code: null, reason: 'Expectation evaluated only for the complete initial text/html response.', observed: detail, evidence_ids: [metadata.id, staticEvidence.id] });
          if (!condition) {
            const rule = catalog.rules.find((r) => r.id === ruleId);
            audit.findings.push({
              id: `finding-${ruleId.toLowerCase()}`, rule_id: ruleId, check_ids: [check.id], state_ids: [stateId], guide_sections: rule.guide_sections, guide_checklist_ids: rule.guide_checklist_ids,
              basis: rule.basis, evidence_scope: rule.evidence_scope, test_context: audit.run.test_context, profile: check.profile,
              title: ruleId === 'AFF-SEM-004' ? 'Initial HTML lacks a nonempty document title' : 'Initial HTML lacks usable root language metadata',
              modalities: ['http'], severity: 'low', confidence: 'high', status: 'confirmed', observed: detail, expected: rule.expected_result,
              impact: 'A client limited to the initial response lacks this document-identification signal. Rendered behavior and actual agent task consequences remain untested.',
              evidence_ids: [metadata.id, staticEvidence.id], reproduction: ['Retrieve the recorded public URL as a document without JavaScript.', 'Inspect the parsed initial head title and html lang metadata.'],
              uncertainty: ['JavaScript may add or modify this metadata later. No universal browser, accessibility or agent-task failure is inferred.'],
              recommendation: rule.remedy, verification: rule.acceptance_procedure.join(' '), workstream: 'frontend', source_location: null,
              checked_on: capturedAt.slice(0, 10), review_trigger: 'Initial HTML/template, locale or rendering changes.'
            });
          }
        }
      }
      const discovery = audit.checks.find((c) => c.rule_id === 'AFF-DISC-001');
      if (discovery) Object.assign(discovery, { outcome: 'cantTell', reason_code: 'owner_intent_unknown', reason: 'Only initial response/meta directives are observed; owner intent, robots.txt and other discovery signals are not assessed.', observed: `${signals.robots.length} relevant HTML robots declarations and ${signals.canonical_count} canonical declarations observed; no inclusion or policy-alignment conclusion.`, evidence_ids: [metadata.id, staticEvidence.id] });
    } else {
      const barrier = [401, 403, 429].includes(result.status);
      audit.limitations.push(barrier ? `HTTP ${result.status} is an observed access barrier for this route; its WAF or authentication cause is not established.` : 'The response was not a complete successful text/html document; static document expectations were not evaluated.');
      for (const check of audit.checks) if (['AFF-SEM-004', 'AFF-SEM-005'].includes(check.rule_id)) Object.assign(check, { reason_code: barrier ? 'site_access_barrier' : 'representation_unavailable', reason: 'No complete successful initial HTML document was available for this check.', observed: `HTTP ${result.status}; content type ${contentType || 'not exposed'}.` });
    }
    audit.verdicts = audit.goals.map((goal) => ({ profile: goal.profile, verdict: goal.profile === 'discovery-and-citation' && audit.evidence.length > 1 ? 'signals_observed' : goal.selected ? 'inconclusive' : 'not_assessed', summary: goal.profile === 'discovery-and-citation' ? 'Initial public response signals are recorded; owner-intent alignment, search inclusion and citations are unverified.' : 'This bounded HTTP collection does not demonstrate the profile or a complete agent task.', evidence_ids: goal.selected ? audit.evidence.map((e) => e.id) : [], journey_ids: [], limitations: ['Use host-driven observations and actual task trials for a profile conclusion.'] }));
    audit.run.status = 'partial';
  } catch (error) {
    if (!error.code || !/^[a-z_]+$/.test(error.code)) throw error;
    const evidence = observation(audit, { channel: 'observation', summary: `Collection could not complete: ${redactText(error.message)}`, data: { collector_error: error.code }, stateId: null });
    audit.evidence.push(evidence);
    audit.capabilities.capabilities.network_egress = { status: ['non_public_target', 'origin_out_of_scope', 'credentials_in_url', 'sensitive_url', 'suspected_mutation', 'fixture_scope', 'https_downgrade'].includes(error.code) ? 'denied' : 'failed', reason: redactText(error.message), adapter: 'node-http', version: '1.0.0' };
    audit.capabilities.capabilities.initial_response = { status: 'failed', reason: 'No complete response was available for initial-document checks.' };
    const attempts = error.attempts ?? [];
    if (attempts.length) {
      const last = attempts.at(-1);
      const metadata = observation(audit, { channel: 'http_response', sequence: 1, summary: `Observed HTTP ${last.status}; collection stopped before a usable final body.`, data: { status: last.status, complete: false, headers: last.headers, redirects_and_final: attempts, collector_error: error.code } });
      metadata.sanitized_url = last.url;
      audit.evidence.push(metadata);
      for (const name of ['network_egress', 'network_metadata']) audit.capabilities.capabilities[name] = { status: 'available', reason: 'An HTTP response was observed; body and subsequent collection limitations are separate.' };
    }
    audit.run.status = 'partial'; audit.limitations.push(`Collector limitation: ${redactText(error.message)}`);
    for (const check of audit.checks) { check.reason_code = attempts.some((a) => [401, 403, 429].includes(a.status)) ? 'site_access_barrier' : attempts.length ? 'collection_incomplete' : 'environment_failure'; check.reason = 'The bounded collector did not obtain a usable document; observed response metadata is retained separately and no site pass/failure was inferred.'; }
  }
  audit.run.completed_at = new Date().toISOString();
  audit.guide_coverage = makeGuideCoverage(catalog, audit.checks, audit.owner_verification);
  audit.coverage = calculateCoverage(audit);
  return audit;
}
