#!/usr/bin/env node
/** Generate the human rule view from the canonical catalog. No dependencies or network. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const catalogPath = resolve(packageRoot, 'assets/rules/frontend-v1.json');
const referencePath = resolve(packageRoot, 'references/frontend-rules.md');
const lines = values => values.map(value => `- ${value}`).join('\n');
const escaped = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

export function renderRules(catalog) {
  if (!Array.isArray(catalog.rules) || !Array.isArray(catalog.groups) || !Array.isArray(catalog.owner_requirements) || !Array.isArray(catalog.guide_crosswalk)) {
    throw new Error('Catalog must contain rules, groups, owner_requirements and guide_crosswalk arrays.');
  }
  const ids = new Set();
  for (const rule of catalog.rules) {
    if (ids.has(rule.id)) throw new Error(`Duplicate rule ID: ${rule.id}`);
    ids.add(rule.id);
  }
  const sourceList = [];
  const sourceIds = new Map();
  for (const rule of catalog.rules) {
    for (const source of rule.sources) {
      const key = JSON.stringify(source);
      if (!sourceIds.has(key)) {
        sourceIds.set(key, `SRC-${String(sourceList.length + 1).padStart(2, '0')}`);
        sourceList.push(source);
      }
    }
  }
  const digest = createHash('sha256').update(JSON.stringify(catalog)).digest('hex');
  const out = [
    '# Frontend rules',
    '',
    `Catalog version: **${catalog.catalog_version}**. Guide revision: **${catalog.provenance.guide.revision}**. Requirements reviewed: **${catalog.created_on}**.`,
    '',
    `This generated reference contains **${catalog.rules.length} frontend rules**, **${catalog.groups.length} categories**, **${catalog.owner_requirements.length} owner-verification templates**, and the **26-item guide checklist crosswalk**.`,
    '',
    'Read only the applicable category or rule. Search by stable ID, for example `rg -n "^### AFF-SEM-004$" references/frontend-rules.md`. Use `assets/rules/frontend-v1.json` as the source of truth. Regenerate with `node scripts/lib/render-rules.mjs`; check for drift with the same command plus `--check`.',
    '',
    '## Contents',
    '',
    '- [Interpretation contract](#interpretation-contract)',
    ...catalog.groups.map(group => `- [${group.id}: ${group.title}](#${group.id.toLowerCase()})`),
    '- [Owner-verification templates](#owner-verification-templates)',
    '- [Guide checklist crosswalk](#guide-checklist-crosswalk)',
    '- [Sources and provenance](#sources-and-provenance)',
    '',
    '## Interpretation contract',
    '',
    'Create one check instance per target, state, context and declared evidence representation. Preserve separate results for repeated controls. Use `passed`, `failed`, `cantTell`, `inapplicable` or `untested` with a reason. Capabilities describe what the procedure needs; unavailable evidence cannot become a pass, and an uninspectable feature is not the same as an absent feature.',
    '',
    'Treat these as custom rules implementing the supplied guide. They do not constitute a complete WCAG assessment, an external AI standard, a security test, or universal client compatibility. Associate severity with the demonstrated task consequence and keep confidence separate. Give low-confidence interpretations as investigation leads.',
    '',
    'For `frontend_indicator`, assess only the observed indicator and keep the linked guarantee unknown. Owner-verification templates never enter the executed frontend-check denominator. Missing optional tools or formats do not fail unrelated profiles. Use synthetic data and controlled fixtures for deliberate failures, replay, cancellation races, stale commits or secret-leakage tests.',
    '',
    'Required capabilities are a procedure contract, not a universal host-tool naming convention. Map a host operation to a capability only when its evidence is equivalent. Keep browser AX, Playwright ARIA snapshots, static markup and screenshots labeled separately. If equivalent evidence supports a narrower adapted check, record that adaptation and its limits explicitly.',
    '',
    'A source marked `supplied_reference_not_independently_checked` is a research lead from the attachments. The guide date is retained separately from a new external checked date. Recheck time-sensitive product claims before using them as current requirements. The rule procedures below are original project instructions derived from the user-supplied requirements.',
    ''
  ];
  for (const group of catalog.groups) {
    out.push(`## ${group.id}`, '', `**${group.title}** · Default profile: \`${group.default_profile}\` · Goal: \`${group.guide_goal}\`.`, '');
    for (const rule of catalog.rules.filter(item => item.group === group.id)) {
      const refs = rule.sources.map(source => {
        const id = sourceIds.get(JSON.stringify(source));
        return `[${id}](#${id.toLowerCase()})`;
      }).join(', ');
      out.push(
        `### ${rule.id}`, '', `**${rule.title}**`, '',
        `Profiles: ${rule.profiles.map(value => `\`${value}\``).join(', ')}. Basis: \`${rule.basis}\`. Scope: \`${rule.evidence_scope}\`. Evaluation: \`${rule.evaluation_kind}\`.`, '',
        `Guide: ${rule.guide_sections.join(', ')}. Checklist: ${rule.guide_checklist_ids.join(', ')}.`, '',
        `**Applies when:** ${rule.applicability}`, '',
        `**Required capabilities:** ${rule.required_capabilities.length ? rule.required_capabilities.map(value => `\`${value}\``).join(', ') : 'No additional capability beyond the recorded evidence.'}`, '',
        ...(rule.evidence_variants ?? []).flatMap(v => [`**Evidence variant ${v.id}:** ${v.scope} Required capabilities: ${v.required_capabilities.join(', ') || 'attributed supplied evidence'}. Select explicitly with an adequacy review and limitations.`, '']),
        '**Procedure**', '', ...rule.procedure.map((step, index) => `${index + 1}. ${step}`), '',
        `**Expected result:** ${rule.expected_result}`, '',
        '**Required evidence**', '', lines(rule.required_evidence), '',
        '**Limits and false positives**', '', lines([...rule.limitations, ...rule.false_positives]), '',
        `**Remedy:** ${rule.remedy}`, '',
        '**Acceptance procedure**', '', ...rule.acceptance_procedure.map((step, index) => `${index + 1}. ${step}`), '',
        `**Owner verification:** ${rule.owner_verification_ids.length ? rule.owner_verification_ids.map(id => `[${id}](#${id.toLowerCase()})`).join(', ') : 'None added by this rule; other applicable whole-website requirements still need separate disposition.'}`, '',
        `**Sources:** ${refs}.`, ''
      );
    }
  }
  out.push('## Owner-verification templates', '', 'Instantiate only the requirements applicable to the site. Record verification priority, indicators, required evidence and an accountable workstream. Unavailable backend access never makes an applicable requirement passed, failed or inapplicable. External assessment remains separately attributed and does not turn this frontend module’s `backend_record_checked` field true.', '');
  for (const owner of catalog.owner_requirements) {
    out.push(`### ${owner.id}`, '', `**${owner.title}**`, '',
      `Guide: ${owner.guide_sections.join(', ')}. Checklist: ${owner.guide_checklist_ids.join(', ')}.`, '',
      `**Applies when:** ${owner.applicability}`, '',
      `**Unknown guarantee:** ${owner.unknown_guarantee}`, '',
      `**Workstream:** ${owner.workstream}`, '',
      '**Requested evidence**', '', lines(owner.requested_evidence), '',
      '**Acceptance procedure**', '', ...owner.acceptance_procedure.map((step, index) => `${index + 1}. ${step}`), '',
      `**Review trigger:** ${owner.review_trigger}`, '');
  }
  out.push('## Guide checklist crosswalk', '', 'The frontend and owner columns are separate obligations. A passing frontend check does not resolve an owner item. These mappings are requirements coverage, not evidence that a website has been assessed.', '', '| Checklist | Subject | Frontend rules | Owner requirements |', '| --- | --- | --- | --- |');
  for (const item of catalog.guide_crosswalk) {
    out.push(`| ${item.checklist_id} | ${escaped(item.subject)} | ${item.rule_ids.map(id => `[${id}](#${id.toLowerCase()})`).join(', ') || 'Owner assessment only'} | ${item.owner_verification_ids.map(id => `[${id}](#${id.toLowerCase()})`).join(', ') || 'None mapped'} |`);
  }
  out.push('', '## Sources and provenance', '', `The supplied guide (${catalog.provenance.guide.filename}) and plan (${catalog.provenance.plan.filename}) were read as requirements. The runtime does not contain or require those private attachments.`, '',
    `Guide SHA-256: \`${catalog.provenance.guide.sha256}\`.`, '',
    `Plan SHA-256: \`${catalog.provenance.plan.sha256}\`.`, '',
    'Source verification below applies to the named document and recorded scope. It does not establish that the audited site passes a rule or that a client is supported in an untested configuration.', '');
  sourceList.forEach((source, index) => {
    const id = `SRC-${String(index + 1).padStart(2, '0')}`;
    out.push(`### ${id}`, '', `[${source.title}](${source.url})`, '',
      `Basis: \`${source.evidence_basis}\`. Verification: \`${source.verification_status}\`. Independently checked: ${source.checked_on ?? 'not rechecked for this package'}. Supplied checked date: ${source.supplied_checked_on ?? 'not supplied'}. Effective condition: ${source.effective_on ?? 'no separate date recorded'}.`, '',
      `Scope: ${source.applies_to}`, '', `Recheck: ${source.recheck_trigger}`, '');
  });
  out.push(`<!-- Generated from catalog JSON canonical serialization SHA-256: ${digest}. Do not edit this view independently. -->`, '');
  return out.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--check') || args.length > 1) throw new Error('Usage: node scripts/lib/render-rules.mjs [--check]');
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
  const rendered = renderRules(catalog);
  if (args.includes('--check')) {
    const actual = await readFile(referencePath, 'utf8');
    if (actual !== rendered) throw new Error('Generated rule reference differs from the canonical catalog. Regenerate it before packaging.');
    process.stdout.write(`Rule reference matches ${catalog.rules.length} catalog rules.\n`);
  } else {
    await writeFile(referencePath, rendered, 'utf8');
    process.stdout.write(`Generated rule reference for ${catalog.rules.length} rules.\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
