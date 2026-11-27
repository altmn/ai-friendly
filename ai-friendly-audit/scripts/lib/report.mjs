import { markdownText as md } from './privacy.mjs';
import { calculateCoverage } from './validation.mjs';

const list = (values) => values.length ? values.map((v) => `- ${md(v)}`).join('\n') : '- None recorded.';
const severityOrder = { blocker: 0, high: 1, medium: 2, low: 3 };
function orderedFindings(audit) { return [...audit.findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.id.localeCompare(b.id)); }
function table(headers, rows) {
  return [`| ${headers.map(md).join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.map(md).join(' | ')} |`)].join('\n');
}

function trialDetails(journey) {
  const j = journey;
  return `### ${md(j.id)} — trial ${j.trial_number}\n\n` +
    `Mode: ${md(j.execution.interaction_mode)}. Context: ${md(j.test_context)}. Session: ${md(j.session.status)}. ` +
    `Prior diagnostic assistance: ${j.execution.prior_diagnostic_assistance}.\n\n` +
    `**Declared frontend conditions:**\n\n${list(j.task.frontend_success_conditions)}\n\n` +
    `**Action boundary:** ${md(j.task.action_boundary)}. Consequential commit permitted: ${j.task.consequential_commit_permitted}.\n\n` +
    table(['Dimension', 'Status', 'Observation', 'Evidence'], Object.entries(j.observations).map(([name, o]) => [name, o.status, o.description, o.evidence_ids.join(', ')])) + '\n\n' +
    `**Interventions:** ${j.outcome.intervention_count}. **Recoveries:** ${j.outcome.recovery_count}. ` +
    `**Retries:** ${j.outcome.retry_count ?? 'not recorded'}. **Blocked by:** ${md(j.outcome.blocked_by ?? 'none recorded')}. ` +
    `**Stop reason:** ${md(j.outcome.stop_reason ?? 'none recorded')}. **Final state:** ${md(j.outcome.final_state_id ?? 'unresolved')}.\n\n` +
    `**Observed incorrect results or effects:**\n\n` +
    (j.outcome.observed_effect_issues.length ? list(j.outcome.observed_effect_issues.map((issue) =>
      `${issue.id}: ${issue.description} Material: ${issue.material}; unauthorized action: ${issue.unauthorized_action}. Rationale: ${issue.rationale}. Evidence: ${issue.evidence_ids.join(', ')}.`)) : 'None recorded in the frontend evidence; authoritative unintended effects remain unmeasured.') + '\n\n' +
    `**Verification evidence:** ${j.verification.evidence_ids.map(md).join(', ') || 'none'}. Backend records were not checked; authoritative effect verification and unintended-effect counts remain null.`;
}

function comparisonDetails(comparison) {
  const r = comparison;
  return `### ${md(r.fact_id)}\n\nAvailability: ${md(r.availability)}. Comparison: ${md(r.mismatch_type)}.\n\n` +
    `**Material qualifiers:**\n\n${list(r.material_qualifiers)}\n\n` +
    table(['Representation', 'Observed value', 'State / capture time', 'Evidence'], r.observations.map((o) =>
      [o.representation, o.observed_value ?? 'unknown / unavailable', `${o.state_id ?? 'unknown state'}; ${o.captured_at ?? 'unknown capture time'}`, o.evidence_ids.join(', ')])) + '\n\n' +
    `**Limitations:**\n\n${list(r.limitations)}`;
}

export function renderRemediation(audit) {
  const findings = orderedFindings(audit);
  const confirmed = findings.filter((f) => f.status === 'confirmed');
  const leads = findings.filter((f) => f.status !== 'confirmed');
  const sections = ['# Frontend remediation plan', `Run: ${md(audit.run.id)}. Checked: ${md(audit.run.completed_at ?? audit.run.started_at)}.`, '## Verified frontend fixes'];
  if (!confirmed.length) sections.push('No confirmed frontend fix is supported by this run. This does not establish that unsampled or untested behavior is correct.');
  for (const [i, finding] of confirmed.entries()) sections.push(`### ${i + 1}. ${md(finding.title)}\n\nSeverity: ${md(finding.severity)}. Workstream: ${md(finding.workstream)}. Evidence: ${finding.evidence_ids.map(md).join(', ')}.\n\n**Reason:** ${md(finding.impact)}\n\n**Change:** ${md(finding.recommendation)}\n\n**Acceptance evidence:** ${md(finding.verification)}\n\n**Review trigger:** ${md(finding.review_trigger)}\n\n**Source location:** ${md(finding.source_location ?? 'Not established; use component/behavior guidance.')}`);
  sections.push('## Investigation leads');
  sections.push(leads.length ? list(leads.map((f) => `${f.id}: ${f.title}. ${f.observed} Verify: ${f.verification}`)) : 'No separate low-confidence leads are recorded.');
  sections.push('## Owner verification and optional work');
  sections.push('See owner-verification.md for unverified whole-website guarantees. Conditional features such as WebMCP, alternate Markdown and llms.txt require a demonstrated use case; their absence is not a baseline defect. Effort estimates and named owners are omitted when source or organizational evidence is unavailable.');
  return `${sections.join('\n\n')}\n`;
}

export function renderOwners(audit) {
  const sections = ['# Owner-verification register', 'These are requests for additional evidence, not confirmed server defects. Frontend observations do not establish business correctness, deduplication, authorization enforcement, infrastructure configuration or service parity.'];
  if (!audit.owner_verification.length) sections.push('No owner items have been recorded. Check applicable guide requirements before treating the audit as complete.');
  for (const item of audit.owner_verification) sections.push(
    `## ${md(item.id)} — ${md(item.unknown_guarantee)}\n\n` +
    `Applicability: ${md(item.applicability)}. Status: ${md(item.status)}. Verification priority: ${md(item.verification_priority)}. Workstream: ${md(item.workstream)}.\n\n` +
    (item.conditional_exclusion ? `**Reviewed conditional exclusion:** ${md(item.conditional_exclusion.reason)} Evidence: ${item.conditional_exclusion.evidence_ids.map(md).join(', ')}.\n\n` : '') +
    `**Priority rationale:** ${md(item.priority_rationale)}\n\n` +
    `**Guide:** ${item.guide_checklist_ids.map(md).join(', ')}; sections ${item.guide_sections.map(md).join(', ')}.\n\n` +
    `**Observed indicators:**\n\n${list(item.observed_indicators)}\n\n` +
    `**Requested evidence:**\n\n${list(item.requested_evidence)}\n\n` +
    `**Acceptance procedure:**\n\n${list(item.acceptance_procedure)}\n\n` +
    `**Review trigger:** ${md(item.review_trigger)}\n\n` +
    `**External assessment:** ${item.external_assessment ? `${md(item.external_assessment.assessor)}, ${md(item.external_assessment.checked_on)}; ${md(item.external_assessment.evidence_kind)}; scope: ${md(item.external_assessment.scope)}. Evidence: ${item.external_assessment.evidence_ids.map(md).join(', ')}.` : 'None supplied.'}`
  );
  return `${sections.join('\n\n')}\n`;
}

export function renderReport(audit) {
  const c = calculateCoverage(audit); const checks = new Map(audit.checks.map((check) => [check.id, check]));
  const sections = [
    '# AI-friendly frontend audit',
    `Target: ${md(audit.run.target_url ?? 'supplied evidence')}. Run: ${md(audit.run.id)}.\n\nStatus: ${md(audit.run.status)}; mode: ${md(audit.run.mode)}; context: ${md(audit.run.test_context)}.\n\nStarted: ${md(audit.run.started_at)}. Completed: ${md(audit.run.completed_at ?? 'not completed')}.`,
    '## 1. What was demonstrated',
    'Conclusions apply only to the sampled routes, states, sessions, representations and declared tasks. No universal AI-friendliness score or whole-website transaction certification is produced.',
    table(['Profile', 'Conclusion', 'Evidence and limits'], audit.verdicts.map((v) => [v.profile, v.verdict, `${v.summary} ${v.limitations.join(' ')}`])),
    c.total_trials ? `**Task outcomes:** ${c.successful_trials}/${c.total_trials} recorded journeys met their frontend success conditions without a material incorrect effect. Material-error trials: ${c.material_error_trials}; unresolved trials: ${c.unresolved_trials}. Compatibility records are companions to journeys and are not counted twice.` : '**Task outcomes:** No actual task trials were recorded. No completion rate or product-compatibility result is established.',
    '## 2. Barriers, friction and strengths'
  ];
  const findings = orderedFindings(audit);
  sections.push(findings.length ? table(['Finding', 'Status', 'Severity / confidence', 'Task impact'], findings.map((f) => [f.id, f.status, `${f.severity} / ${f.confidence}`, `${f.title}. ${f.impact}`])) : 'No evidence-backed defect has been recorded. Untested checks and missing capabilities remain open.');
  const passed = audit.checks.filter((check) => check.outcome === 'passed');
  sections.push('### Supported strengths');
  const adapted = audit.checks.filter(c => c.evidence_variant);
  if (adapted.length) sections.push('## Adapted evidence scope', list(adapted.map(c => `${c.rule_id} (${c.evidence_variant}): ${c.adaptation?.scope ?? 'unreviewed'}. Limits: ${c.adaptation?.limitations.join('; ') ?? 'unknown'}.`)));
  sections.push(passed.length ? list(passed.map((check) => `${check.rule_id}: ${check.observed} Scope: ${check.target} Evidence: ${check.evidence_ids.join(', ')}.`)) : 'No passed checks are recorded.');
  for (const f of findings) sections.push(`### ${md(f.id)} — ${md(f.title)}\n\n` +
    `Profile: ${md(f.profile)}. Modalities: ${f.modalities.map(md).join(', ')}. ${md(f.evidence_scope)}; ${md(f.test_context)}.\n\n` +
    `**Observed:** ${md(f.observed)}\n\n**Expected:** ${md(f.expected)}\n\n**Impact:** ${md(f.impact)}\n\n` +
    `**Reproduce:**\n\n${f.reproduction.map((step, i) => `${i + 1}. ${md(step)}`).join('\n')}\n\n` +
    `**Evidence:** ${f.evidence_ids.map(md).join(', ')}. Checks: ${f.check_ids.map((id) => `${md(id)} (${md(checks.get(id)?.outcome ?? 'unresolved')})`).join(', ')}.\n\n` +
    `**Remedy:** ${md(f.recommendation)}\n\n**Acceptance:** ${md(f.verification)}\n\n**Uncertainty:**\n\n${list(f.uncertainty)}`);
  sections.push('## 3. What to change first',
    findings.some((f) => f.status === 'confirmed') ? 'Apply the verified fixes in remediation-plan.md, ordered by observed task impact and severity. Keep investigation leads separate from confirmed defects.' : 'No change is prioritized from missing evidence alone. Complete the highest-value host-driven tasks and the explicitly recorded gaps before making broader site conclusions.',
    '## 4. Scope and conditions',
    table(['Condition', 'Recorded value'], [
      ['Allowed origins', audit.scope.allowed_origins.join(', ')], ['Planned routes', audit.scope.planned_routes.join(', ')], ['Excluded paths', audit.scope.excluded_paths.join(', ') || 'None recorded'],
      ['Session', `${audit.scope.session.status}; credential export: false`], ['Viewport', `${audit.scope.viewport.width ?? 'unknown'} × ${audit.scope.viewport.height ?? 'unknown'}`],
      ['Intended locale / timezone / currency', `${audit.scope.intended_locale ?? 'unknown'} / ${audit.scope.intended_timezone ?? 'unknown'} / ${audit.scope.intended_currency ?? 'unknown'}`],
      ['Observed locale / timezone / currency', `${audit.scope.effective_locale ?? 'unknown'} / ${audit.scope.effective_timezone ?? 'unknown'} / ${audit.scope.effective_currency ?? 'unknown'}`],
      ['Content-use intent', audit.scope.content_use_intent], ['Action boundary', audit.run.action_envelope], ['Collector', `${audit.run.collector.name} ${audit.run.collector.version}; ${audit.run.collector.runtime ?? 'runtime not exposed'}`]
    ]),
    '### Planned tasks', list(audit.scope.priority_tasks),
    '### Capability manifest', table(['Capability', 'Status', 'Reason'], Object.entries(audit.capabilities.capabilities).map(([name, cap]) => [name, cap.status, cap.reason])),
    '## 5. Task trials and product compatibility',
    audit.journeys.length ? table(['Journey / trial', 'Actual tested actor', 'Task', 'Outcome', 'Verification'], audit.journeys.map((j) => [`${j.id} / ${j.trial_number}`, `${j.tested_agent.product} ${j.tested_agent.product_version}`, j.task.prompt, `${j.outcome.execution}; goal met: ${j.outcome.goal_conditions_met}`, `frontend only; backend checked: false; business effect: ${j.outcome.business_effect_outcome}`])) : 'No actual agent-product task trial was performed. Documentation, an available tool and a successful HTTP fetch do not establish product compatibility.',
    ...audit.journeys.map(trialDetails),
    '## 6. Coverage and atomic checks',
    table(['Measure', 'Count'], [
      ['Planned check instances', c.planned_check_instances], ['Executed/evaluated check instances', c.executed_check_instances],
      ...Object.entries(c.check_outcomes).map(([key, value]) => [`Check outcome: ${key}`, value]),
      ['Planned states', c.planned_state_count], ['Observed states', c.observed_state_count],
      ['Applicable guide requirements', c.applicable_guide_requirements], ['Fully frontend-assessed guide requirements', c.frontend_assessed_guide_requirements],
      ['Guide requirements with unknown applicability', audit.guide_coverage.filter((g) => g.applicability === 'unknown').length],
      ['Inapplicable guide requirements', audit.guide_coverage.filter((g) => g.applicability === 'inapplicable').length],
      ['Applicable unresolved owner-verification items', c.owner_verification_required_count]
    ]),
    'The check denominator is the explicit list of planned check instances. Executed includes evaluated inapplicable and inconclusive checks; untested checks are excluded. The guide inventory contains all 26 checklist items. The applicable-guide denominator includes only items explicitly marked applicable; unknown and inapplicable items remain visible separately. Partially assessed guide rows do not count as fully assessed.',
    table(['Check', 'Rule', 'Outcome', 'Reason / evidence'], audit.checks.map((check) => [check.id, check.rule_id, check.outcome, `${check.reason}${check.evidence_ids.length ? ` Evidence: ${check.evidence_ids.join(', ')}.` : ''}`])),
    '### Guide checklist coverage',
    table(['Guide item', 'Requirement', 'Applicability', 'Disposition', 'Check / owner references'], audit.guide_coverage.map((g) => [g.checklist_id, g.subject, g.applicability, g.disposition, [...g.check_ids, ...g.owner_verification_ids].join(', ') || g.reason])),
    '## 7. Retrieval and representation comparisons',
    audit.representation_comparisons.length ? audit.representation_comparisons.map(comparisonDetails).join('\n\n') : 'No cross-representation fact comparison has been performed. Initial HTML, rendered content and actual extractor output must be measured as separate channels; unavailable channels remain unknown.',
    '## 8. Owner-verification requirements',
    `${audit.owner_verification.length} verification items recorded; ${audit.owner_verification.filter((o) => o.applicability === 'unknown').length} have unknown applicability. See owner-verification.md for the unknown guarantees, requested evidence, workstreams and acceptance procedures. Visible UI results do not verify authoritative records or absence of unintended effects.`,
    '## 9. Evidence and reproducibility',
    table(['Evidence', 'Representation', 'Observation', 'Artifact'], audit.evidence.map((e) => [e.id, e.representation, e.summary, e.artifact_path ?? 'Embedded minimized record only'])),
    'The canonical audit.json is the source of every count and report section. evidence-index.json and compatibility-tests.json are derived copies. Hashes, when present, describe retained sanitized bytes and do not prove the observation is true.',
    '## 10. Unknowns and next verification', list(audit.limitations)
  );
  return `${sections.join('\n\n')}\n`;
}

export function deriveOutputs(audit) {
  return {
    'audit.json': audit,
    'audit-report.md': renderReport(audit),
    'evidence-index.json': { schema_version: audit.schema_version, run_id: audit.run.id, evidence: audit.evidence, retention_notes: ['Retain only minimized, sanitized artifacts explicitly selected for this run.', 'Embedded observations can exist without retained files; artifact_path null means no local artifact is claimed.', 'Private screenshots, raw authenticated logs, profiles and storage exports are excluded from default deliverables.'] },
    'remediation-plan.md': renderRemediation(audit),
    'owner-verification.md': renderOwners(audit),
    'compatibility-tests.json': { schema_version: audit.schema_version, run_id: audit.run.id, compatibility_tests: audit.compatibility_tests }
  };
}
