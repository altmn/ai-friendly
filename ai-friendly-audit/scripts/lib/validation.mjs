import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PACKAGE_ROOT, readCatalog } from './io.mjs';

let schemaEngine;
function jsonEqual(left, right) {
  const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : value;
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}
export async function getSchemaEngine() {
  if (schemaEngine) return schemaEngine;
  let Ajv2020, addFormats;
  try {
    ({ default: Ajv2020 } = await import('ajv/dist/2020.js'));
    ({ default: addFormats } = await import('ajv-formats'));
  } catch {
    throw new Error('Validated CLI commands require the pinned optional schema dependencies. Run npm ci --ignore-scripts inside the package, or use the no-script host workflow.');
  }
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, strictRequired: false, validateFormats: true, ownProperties: true });
  addFormats(ajv);
  const folder = path.join(PACKAGE_ROOT, 'assets/schemas');
  for (const name of (await fs.readdir(folder)).filter((n) => n.endsWith('.schema.json')).sort()) {
    ajv.addSchema(JSON.parse(await fs.readFile(path.join(folder, name), 'utf8')));
  }
  schemaEngine = ajv;
  return ajv;
}

export async function schemaErrors(data, schema = 'report') {
  if (!/^[a-z-]+$/.test(schema)) throw new Error('Invalid schema name.');
  const engine = await getSchemaEngine();
  const validator = engine.getSchema(`https://ai-friendly-audit.invalid/schemas/${schema}.schema.json`);
  if (!validator) throw new Error(`Unknown schema: ${schema}`);
  if (validator(data)) return [];
  return validator.errors.map((e) => `${e.instancePath || '/'} ${e.message}${e.params?.missingProperty ? ` (${e.params.missingProperty})` : ''}`);
}

export function calculateCoverage(audit) {
  const check_outcomes = { passed: 0, failed: 0, cantTell: 0, inapplicable: 0, untested: 0 };
  for (const check of audit.checks) check_outcomes[check.outcome]++;
  const material = (j) => j.outcome.observed_effect_issues.some((issue) => issue.material || issue.unauthorized_action) || j.outcome.execution === 'observed_incorrect_result_or_effect';
  const success = (j) => ['frontend_complete', 'frontend_complete_after_expected_intervention'].includes(j.outcome.execution) && j.outcome.goal_conditions_met === true && !material(j);
  const requiredOwners = new Set(audit.guide_coverage.filter(g => g.applicability === 'applicable').flatMap(g => g.owner_verification_ids));
  return {
    planned_check_instances: audit.checks.length,
    executed_check_instances: audit.checks.length - check_outcomes.untested,
    check_outcomes,
    planned_state_count: audit.scope.planned_states.length,
    observed_state_count: audit.states.length,
    guide_requirement_count: 26,
    applicable_guide_requirements: audit.guide_coverage.filter((g) => g.applicability === 'applicable').length,
    frontend_assessed_guide_requirements: audit.guide_coverage.filter((g) => g.disposition === 'frontend_assessed').length,
    owner_verification_required_count: audit.owner_verification.filter((o) => (o.applicability === 'applicable' || (o.applicability === 'unknown' && requiredOwners.has(o.id))) && o.status !== 'resolved_by_external_assessment').length,
    successful_trials: audit.journeys.filter(success).length,
    total_trials: audit.journeys.length,
    material_error_trials: audit.journeys.filter(material).length,
    unresolved_trials: audit.journeys.filter((j) => j.outcome.execution === 'unresolved').length
  };
}

function allObjects(value, visit) {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value)) visit(value);
  for (const child of Object.values(value)) allObjects(child, visit);
}

export async function validateAudit(audit, { catalog: suppliedCatalog, checkCounts = true } = {}) {
  const errors = await schemaErrors(audit, 'report');
  if (errors.length) return errors;
  const catalog = suppliedCatalog ?? await readCatalog();
  const rules = new Map(catalog.rules.map((r) => [r.id, r]));
  const ownerRules = new Map((catalog.owner_requirements ?? []).map((o) => [o.id, o]));
  const unknownLocation = (value) => value == null || ['unknown', 'not_exposed'].includes(value);
  const suppliedUnknowns = audit.run.mode === 'supplied-evidence' && audit.run.test_context === 'supplied_evidence';
  const parseScopeUrl = (value, label, base) => {
    try {
      const url = new URL(value, base);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
      return url;
    } catch { errors.push(`${label}: expected a credential-free HTTP(S) URL.`); return null; }
  };
  const origins = new Set();
  for (const value of audit.scope.allowed_origins) {
    const url = parseScopeUrl(value, 'Allowed origin');
    if (url && (url.pathname !== '/' || url.search || url.hash)) errors.push('Allowed origin must not contain a route, query or fragment.');
    if (url) origins.add(url.origin); // Normalize harmless origin trailing slashes.
  }
  const target = audit.run.target_url === null || (unknownLocation(audit.run.target_url) && suppliedUnknowns) ? null : parseScopeUrl(audit.run.target_url, 'Run target');
  if (target && !origins.has(target.origin)) errors.push('Run target origin is outside the declared audit scope.');
  for (const value of audit.scope.planned_routes) {
    if (unknownLocation(value) && suppliedUnknowns) continue;
    const url = parseScopeUrl(value, 'Planned route', target?.href ?? (origins.size === 1 ? [...origins][0] : undefined));
    if (url && !origins.has(url.origin)) errors.push('Planned route origin is outside the declared audit scope.');
  }
  for (const state of audit.states) {
    const urlUnknown = unknownLocation(state.url); const originUnknown = unknownLocation(state.origin);
    if (urlUnknown && suppliedUnknowns) {
      if (!originUnknown) {
        const declared = parseScopeUrl(state.origin, `State ${state.id} origin`);
        if (declared && !origins.has(declared.origin)) errors.push(`State ${state.id}: known origin is outside the declared scope.`);
      }
      continue;
    }
    const url = parseScopeUrl(state.url, `State ${state.id} URL`);
    const declared = originUnknown ? null : parseScopeUrl(state.origin, `State ${state.id} origin`);
    if (url && !origins.has(url.origin)) errors.push(`State ${state.id}: target state is outside the declared audit scope.`);
    if (url && (!declared || url.origin !== declared.origin)) errors.push(`State ${state.id}: URL and declared origin disagree.`);
    if (declared && (declared.pathname !== '/' || declared.search || declared.hash)) errors.push(`State ${state.id}: declared origin contains route data.`);
  }
  const indices = {};
  for (const [key, idField] of [['states', 'id'], ['evidence', 'id'], ['checks', 'id'], ['findings', 'id'], ['journeys', 'id'], ['compatibility_tests', 'test_id'], ['owner_verification', 'id'], ['guide_coverage', 'checklist_id'], ['representation_comparisons', 'id']]) {
    indices[key] = new Map();
    for (const item of audit[key]) {
      if (indices[key].has(item[idField])) errors.push(`${key}: duplicate identifier ${item[idField]}.`);
      indices[key].set(item[idField], item);
    }
  }
  if (audit.run.completed_at && Date.parse(audit.run.completed_at) < Date.parse(audit.run.started_at)) errors.push('Run completion precedes its start.');
  for (let i = 1; i <= 26; i++) if (!indices.guide_coverage.has(`G-A${String(i).padStart(2, '0')}`)) errors.push(`Guide checklist item ${i} is missing.`);
  allObjects(audit, (obj) => {
    const fields = { evidence_ids: 'evidence', check_ids: 'checks', related_check_ids: 'checks', state_ids: 'states', journey_ids: 'journeys', owner_verification_ids: 'owner_verification' };
    for (const [field, group] of Object.entries(fields)) for (const id of obj[field] ?? []) if (!indices[group].has(id)) errors.push(`Unresolved ${field} reference: ${id}.`);
    for (const field of ['state_id', 'starting_state_id', 'final_state_id']) if (obj[field] != null && !indices.states.has(obj[field])) errors.push(`Unresolved ${field} reference: ${obj[field]}.`);
    if (obj.journey_id != null && !indices.journeys.has(obj.journey_id)) errors.push(`Unresolved journey_id reference: ${obj.journey_id}.`);
    if (obj.rule_id && !rules.has(obj.rule_id)) errors.push(`Unknown rule reference: ${obj.rule_id}.`);
    if (obj.rule_ids) for (const id of obj.rule_ids) if (!rules.has(id)) errors.push(`Unknown rule reference: ${id}.`);
    if (obj.capability_manifest_id && obj.capability_manifest_id !== audit.capabilities.id) errors.push('Trial references a different capability manifest.');
  });
  for (const evidence of audit.evidence) {
    if (evidence.run_id !== audit.run.id) errors.push(`Evidence ${evidence.id} references a different run.`);
    if (evidence.test_context !== audit.run.test_context) errors.push(`Evidence ${evidence.id} changes the declared run context.`);
    if (evidence.artifact_path === null && evidence.sha256 !== null) errors.push(`Evidence ${evidence.id}: an absent artifact cannot have a retained-file hash.`);
    if (evidence.channel === 'screenshot' && evidence.artifact_path && indices.states.get(evidence.state_id)?.session_scope !== 'observed_anonymously') errors.push(`Evidence ${evidence.id}: private screenshot artifacts are excluded from default deliverables.`);
    if (evidence.sanitized_url && !unknownLocation(evidence.sanitized_url)) {
      const url = parseScopeUrl(evidence.sanitized_url, `Evidence ${evidence.id} URL`);
      if (url && !origins.has(url.origin) && evidence.state_id === null && !['owner_supplied', 'source'].includes(evidence.channel) && !suppliedUnknowns) errors.push(`Evidence ${evidence.id}: third-party observation must be tied to an in-scope state.`);
    }
  }
  for (const check of audit.checks) {
    const rule = rules.get(check.rule_id); if (!rule) continue;
    if (rule.evidence_scope === 'owner_verification_required') errors.push(`Check ${check.id}: owner-only rules cannot be frontend checks.`);
    if (check.rule_version !== rule.version) errors.push(`Check ${check.id}: catalog version mismatch.`);
    if (!rule.profiles.includes(check.profile)) errors.push(`Check ${check.id}: profile does not match its rule.`);
    if (check.evidence_scope !== rule.evidence_scope) errors.push(`Check ${check.id}: verification scope differs from its rule.`);
    if (check.test_context !== audit.run.test_context) errors.push(`Check ${check.id}: context differs from its run.`);
    if (['passed', 'failed'].includes(check.outcome)) {
      const variant = check.evidence_variant ? rule.evidence_variants?.find((v) => v.id === check.evidence_variant) : null;
      if (check.evidence_variant && (!variant || !check.adaptation?.adequacy_reviewed)) errors.push(`Check ${check.id}: evidence variant needs a known contract and explicit adequacy review.`);
      const required = variant?.required_capabilities ?? rule.required_capabilities;
      for (const cap of required) if (audit.capabilities.capabilities[cap]?.status !== 'available') errors.push(`Check ${check.id}: required capability ${cap} is not available.`);
      if (check.state_id === null) errors.push(`Check ${check.id}: evaluated outcome needs an observed state.`);
      const evidence = check.evidence_ids.map((id) => indices.evidence.get(id)).filter((e) => e && e.state_id === check.state_id && e.test_context === check.test_context);
      if (!evidence.some((e) => e.state_id === check.state_id && check.state_id !== null)) errors.push(`Check ${check.id}: evaluated outcome needs evidence linked to its target state.`);
      const channels = new Set(evidence.map((e) => e.channel));
      const requiredChannels = {
        screenshots: ['screenshot'], rendered_dom: ['dom'], computed_accessibility_tree: ['browser_ax'], aria_snapshot: ['aria_snapshot'],
        computed_styles: ['dom'], keyboard_input: ['task_event'], pointer_input: ['task_event'], navigation: ['task_event'],
        initial_response: ['http_response'], http_retrieval: ['http_response'], actual_extractor_output: ['extractor'],
        network_metadata: ['network_metadata', 'http_response'], console_errors: ['console'], storage_metadata: ['storage_metadata'],
        original_source: ['source'], webmcp_inspection: ['tool_declaration'], alternate_representations: ['representation', 'http_response'],
        viewport_control: ['screenshot'], performance_traces: ['performance'], locale_observation: ['observation'], open_shadow_roots: ['observation', 'dom']
      };
      const traceKind = { 'AFF-TOOL-003': 'tool_invocation', 'AFF-STATE-001': 'state_transition' }[rule.id];
      if (traceKind) {
        const validTrace = evidence.some((e) => {
          const t = e.observed_data?.execution_trace;
          const linked = (ids) => Array.isArray(ids) && ids.length > 0 && ids.every((id) => id !== e.id && check.evidence_ids.includes(id) && indices.evidence.get(id)?.test_context === check.test_context);
          if (e.channel !== 'task_event' || t?.kind !== traceKind || t.authorized !== true || typeof t.action !== 'string' || !t.action.trim()) return false;
          if (!linked(t.after_evidence_ids) || !t.after_evidence_ids.some((id) => indices.evidence.get(id)?.state_id === check.state_id)) return false;
          if (traceKind === 'tool_invocation') return Object.hasOwn(t, 'result') && t.result !== null;
          return linked(t.before_evidence_ids) && t.before_evidence_ids.every((id) => !t.after_evidence_ids.includes(id));
        });
        if (!validTrace) errors.push(`Check ${check.id}: required authorized ${traceKind} execution trace is missing or incomplete.`);
      }
      for (const capability of required) {
        const allowed = requiredChannels[capability];
        if (allowed && !allowed.some((channel) => channels.has(channel))) errors.push(`Check ${check.id}: ${capability} requires corresponding evidence (${allowed.join(' or ')}); a global capability flag is insufficient.`);
      }
    }
  }
  for (const finding of audit.findings) {
    if (finding.status === 'confirmed' && !finding.check_ids.some((id) => indices.checks.get(id)?.outcome === 'failed')) errors.push(`Finding ${finding.id}: confirmed defect has no failed check.`);
    if (finding.check_ids.some((id) => indices.checks.get(id)?.rule_id !== finding.rule_id)) errors.push(`Finding ${finding.id}: linked checks belong to a different rule.`);
    const rule = rules.get(finding.rule_id);
    if (rule && finding.evidence_scope !== rule.evidence_scope) errors.push(`Finding ${finding.id}: evidence scope differs from the rule.`);
  }
  for (const trial of [...audit.journeys, ...audit.compatibility_tests]) {
    if (Date.parse(trial.completed_at) < Date.parse(trial.started_at)) errors.push(`Trial ${trial.id ?? trial.test_id}: completion precedes start.`);
    if (trial.test_context !== audit.run.test_context) errors.push(`Trial ${trial.id ?? trial.test_id}: context differs from run.`);
    if (trial.verification.evidence_ids.length === 0 && ['frontend_complete', 'frontend_complete_after_expected_intervention'].includes(trial.outcome.execution)) errors.push(`Trial ${trial.id ?? trial.test_id}: frontend success requires evidence.`);
    if (trial.outcome.execution === 'observed_incorrect_result_or_effect' && !trial.outcome.observed_effect_issues.some((i) => i.material || i.unauthorized_action)) errors.push(`Trial ${trial.id ?? trial.test_id}: material-error outcome requires an evidence-linked material issue.`);
    if (['frontend_complete', 'frontend_complete_after_expected_intervention'].includes(trial.outcome.execution)) {
      for (const dimension of ['access', 'comprehension', 'execution', 'correctness']) if (trial.observations[dimension].status !== 'passed' || trial.observations[dimension].evidence_ids.length === 0) errors.push(`Trial ${trial.id ?? trial.test_id}: successful execution requires evidence-backed passed ${dimension} observations.`);
      const mode = trial.execution.interaction_mode;
      const capabilities = audit.capabilities.capabilities;
      const available = (names) => names.some((name) => capabilities[name]?.status === 'available');
      const needed = {
        visual: ['screenshots'], semantic: ['computed_accessibility_tree', 'aria_snapshot', 'rendered_dom'],
        keyboard: ['keyboard_input'], hybrid: ['keyboard_input', 'pointer_input'],
        http: ['initial_response'], extractor: ['actual_extractor_output'], source: ['original_source']
      };
      if (!needed[mode] || !available(needed[mode])) errors.push(`Trial ${trial.id ?? trial.test_id}: successful ${mode} execution lacks its declared-mode capability.`);
      const channels = trial.verification.evidence_ids.map((id) => indices.evidence.get(id)?.channel);
      const acceptable = { visual: ['screenshot'], semantic: ['dom', 'browser_ax', 'aria_snapshot'], keyboard: ['task_event'], hybrid: ['task_event'], http: ['http_response'], extractor: ['extractor'], source: ['source'] };
      if (acceptable[mode] && !channels.some((channel) => acceptable[mode].includes(channel))) errors.push(`Trial ${trial.id ?? trial.test_id}: successful ${mode} execution lacks a corresponding evidence channel.`);
    }
  }
  for (const item of audit.owner_verification) {
    if (!ownerRules.has(item.id)) errors.push(`Owner item ${item.id}: no corresponding catalog requirement.`);
    if (item.status !== 'owner_verification_required' && item.external_assessment === null) errors.push(`Owner item ${item.id}: supplied/resolved status needs attributed external evidence.`);
    if (item.status === 'resolved_by_external_assessment' && item.external_assessment?.evidence_kind === 'owner_assertion') errors.push(`Owner item ${item.id}: an owner assertion alone is not a resolved external assessment.`);
  }
  for (const item of audit.guide_coverage) {
    const evaluated = audit.checks.filter((c) => ['passed', 'failed'].includes(c.outcome) && rules.get(c.rule_id)?.guide_checklist_ids.includes(item.checklist_id));
    if (evaluated.length && item.applicability !== 'applicable') errors.push(`Guide item ${item.checklist_id}: evaluated mapped checks require applicable coverage.`);
    if (evaluated.some((c) => !item.check_ids.includes(c.id))) errors.push(`Guide item ${item.checklist_id}: evaluated mapped check is omitted.`);
    for (const id of item.owner_verification_ids) {
      const owner = indices.owner_verification.get(id);
      if (item.applicability === 'applicable' && ['owner_verification_required', 'mixed'].includes(item.disposition) && owner?.applicability === 'inapplicable' && !owner.conditional_exclusion) errors.push(`Guide item ${item.checklist_id}: required owner ${id} cannot be inapplicable without a reviewed, evidence-linked conditional exclusion; use unknown until resolved.`);
    }
    for (const ruleId of item.rule_ids) if (!rules.get(ruleId)?.guide_checklist_ids.includes(item.checklist_id)) errors.push(`Guide item ${item.checklist_id}: rule ${ruleId} does not map to this checklist item.`);
    for (const id of item.check_ids) if (!item.rule_ids.includes(indices.checks.get(id)?.rule_id)) errors.push(`Guide item ${item.checklist_id}: check ${id} is outside its rule mapping.`);
    for (const id of item.owner_verification_ids) if (!ownerRules.get(id)?.guide_checklist_ids.includes(item.checklist_id)) errors.push(`Guide item ${item.checklist_id}: owner item ${id} does not map to this checklist item.`);
    if (item.applicability === 'applicable') {
      for (const owner of ownerRules.values()) if (owner.guide_checklist_ids.includes(item.checklist_id) && !item.owner_verification_ids.includes(owner.id)) errors.push(`Guide item ${item.checklist_id}: applicable owner-verification disposition omits ${owner.id}.`);
    }
    if (item.disposition === 'frontend_assessed' && (!item.check_ids.length || item.check_ids.some((id) => !['passed', 'failed', 'inapplicable'].includes(indices.checks.get(id)?.outcome)))) errors.push(`Guide item ${item.checklist_id}: fully assessed disposition has missing or unresolved checks.`);
    if (item.disposition === 'frontend_assessed') {
      const mappedRules = catalog.rules.filter((rule) => rule.evidence_scope !== 'owner_verification_required' && rule.guide_checklist_ids.includes(item.checklist_id));
      for (const rule of mappedRules) {
        const instances = audit.checks.filter((check) => check.rule_id === rule.id);
        if (!item.rule_ids.includes(rule.id) || !instances.length) errors.push(`Guide item ${item.checklist_id}: fully assessed disposition omits mapped rule ${rule.id}.`);
        for (const check of instances) if (!item.check_ids.includes(check.id) || !['passed', 'failed', 'inapplicable'].includes(check.outcome)) errors.push(`Guide item ${item.checklist_id}: fully assessed disposition omits or overstates planned check ${check.id}.`);
      }
    }
    if (item.disposition === 'inapplicable' && item.applicability !== 'inapplicable') errors.push(`Guide item ${item.checklist_id}: inapplicable disposition conflicts with applicability.`);
    if (['owner_verification_required', 'mixed'].includes(item.disposition) && !item.owner_verification_ids.length) errors.push(`Guide item ${item.checklist_id}: missing owner-verification reference.`);
    if (item.disposition === 'frontend_assessed' && item.owner_verification_ids.some((id) => indices.owner_verification.get(id)?.status !== 'resolved_by_external_assessment')) errors.push(`Guide item ${item.checklist_id}: frontend assessment conceals unresolved owner verification.`);
  }
  for (const companion of audit.compatibility_tests) {
    const journey = indices.journeys.get(companion.journey_id); if (!journey) continue;
    for (const key of ['trial_number', 'started_at', 'completed_at', 'guide_revision', 'guide_goal', 'profile', 'test_context', 'skill_host', 'tested_agent', 'execution', 'session', 'environment', 'task', 'verification', 'observations', 'outcome']) {
      if (!jsonEqual(companion[key], journey[key])) errors.push(`Compatibility test ${companion.test_id}: ${key} differs from its linked journey.`);
    }
  }
  for (const verdict of audit.verdicts) {
    if (['demonstrated_for_tested_scope', 'usable_with_friction'].includes(verdict.verdict)) {
      if (!verdict.evidence_ids.length || !verdict.journey_ids.length) errors.push(`Verdict ${verdict.profile}: demonstrated task status requires linked trial evidence.`);
      for (const id of verdict.journey_ids) {
        const j = indices.journeys.get(id);
        if (j && (j.profile !== verdict.profile || !['frontend_complete', 'frontend_complete_after_expected_intervention'].includes(j.outcome.execution))) errors.push(`Verdict ${verdict.profile}: linked trial does not establish successful task execution.`);
      }
    }
    const bad = audit.journeys.filter((j) => j.profile === verdict.profile && j.outcome.execution === 'observed_incorrect_result_or_effect');
    if (bad.length && ['demonstrated_for_tested_scope', 'usable_with_friction'].includes(verdict.verdict)) errors.push(`Verdict ${verdict.profile}: material incorrect effects cannot be aggregated into a positive profile verdict.`);
  }
  if (checkCounts && !jsonEqual(audit.coverage, calculateCoverage(audit))) errors.push('Coverage counters differ from canonical checks, states, guide dispositions, owner items or journeys. Recalculate without changing outcomes.');
  return [...new Set(errors)];
}

export async function requireValidAudit(audit, options) {
  const errors = await validateAudit(audit, options);
  if (errors.length) throw new Error(`Audit validation failed:\n${errors.slice(0, 40).map((e) => `- ${e}`).join('\n')}${errors.length > 40 ? `\n- ${errors.length - 40} further errors.` : ''}`);
  return audit;
}
