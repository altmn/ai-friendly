# Evidence, checks, findings, and reports

## Contents

- [Canonical data](#canonical-data)
- [Collect and minimize evidence](#collect-and-minimize-evidence)
- [Checks and findings](#checks-and-findings)
- [Journeys and compatibility](#journeys-and-compatibility)
- [Owner verification and guide coverage](#owner-verification-and-guide-coverage)
- [Coverage and verdicts](#coverage-and-verdicts)
- [Outputs and CLI](#outputs-and-cli)
- [Validation and retention](#validation-and-retention)

## Canonical data

Use `audit.json` as the authoritative normalized run. Derive every report/count/export from it rather than maintaining competing summaries. Use schema version `1.0.0`; JSON Schemas in `assets/schemas/` define exact field names and permitted values. Schema URLs under `ai-friendly-audit.invalid` are stable identifiers for local resolution, not online services to contact.

The top level contains `schema_version`, `run`, `module`, `guide`, `goals`, `scope`, `capabilities`, `states`, `evidence`, `checks`, `findings`, `journeys`, `representation_comparisons`, `compatibility_tests`, `owner_verification`, `guide_coverage`, `coverage`, `verdicts`, and `limitations`.

Use stable unique IDs within each collection and resolvable references across records. Preserve module/catalog/rule versions. Keep run time, source checked date, evidence timestamp, and policy effective date separate. Use null or the schema's documented unknown value with a reason; do not fabricate a browser/model/version or substitute the requested target product for the actual tested actor.

## Collect and minimize evidence

Every evidence record includes run/state/record identity, timestamp and sequence, channel and representation, evidence scope, test context, sanitized URL, sanitization metadata, collector provenance, summary, limitations, and nullable artifact path/hash. The state/run records supply viewport, locale, session, and execution context. If a field is unavailable, keep its reason in the appropriate limitation.

| Channel | What it establishes | Common limit |
| --- | --- | --- |
| Screenshot | Depicted visual state and geometry with recorded viewport | No computed name, event-handler, network, or business-state proof |
| DOM / browser AX / ARIA snapshot | Exact captured structural or semantic representation | These formats differ; no assumed visual occlusion |
| Network metadata | Observed ordinary requests and responses after capture starts | No complete prior traffic or server root cause |
| Storage metadata | Exposed relevant origin/partition mechanisms and attributes | No comprehensive dataset or authoritative persistence |
| Source excerpt | Inspected code at the stated provenance/build | No unseen repository or executed-test claim |
| Task event | Recorded action and observable transition | Agent narration alone is not result verification |
| HTTP response | Initial returned bytes/headers or minimized derived observations | No JavaScript execution or actual remote extractor |
| Actual extractor | Output returned by that real named tool/configuration | Tool/server/display truncation need separate treatment |
| Owner supplied | Externally attributed statement/evidence | Not work performed by this frontend module |

Minimize before retention: prefer metadata, short targeted excerpts, and safe text descriptions. Strip credentials, authorization/cookie headers, tokens, session values, unnecessary identifiers, personal payloads, private documents, and sensitive bodies. Review path segments and key names as well as query strings. A “sanitized HAR” may still contain sensitive URLs and bodies.

Do not keep raw sensitive evidence just to compute a hash. Hash only retained sanitized bytes, and explain that the hash shows byte consistency, not factual truth. Leave `artifact_path` and `sha256` null when no artifact is retained; retain the observation and its limitations.

Avoid private screenshots in default deliverables. Where safe capture/redaction cannot be assured, omit the image and describe the necessary observation. Record automatic redaction method and review status accurately; a pattern filter cannot guarantee absence of personal data. Keep raw target HTML/code inert and never execute it to inspect content.

## Checks and findings

Assign one outcome to each rule-target-state instance:

| Outcome | Meaning |
| --- | --- |
| `passed` | Adequate evidence establishes the expected frontend behavior |
| `failed` | Adequate evidence contradicts the expected frontend behavior |
| `cantTell` | Evaluation began but applicability or result remains unresolved |
| `inapplicable` | Evidence establishes that the requirement is irrelevant to this target/state |
| `untested` | The planned check was not performed |

Use reason codes such as `tool_unavailable`, `auth_unavailable`, `source_unavailable`, `cross_origin_restriction`, `unsafe_action_required`, `budget_exhausted`, `environment_failure`, `site_access_barrier`, `representation_unavailable`, or `inconclusive_observation`. Follow the schema for exact accepted values. Do not convert missing capability to inapplicable or pass. Owner-only requirements are not executable frontend checks.

For every finding include linked rule/check/state/guide IDs, evidence basis/scope/context, profile/modes, observed and expected behavior, task impact, supporting evidence, reproduction, uncertainty, remedy, verification, responsible workstream, checked date, and review trigger. Include an actual source location only when source evidence supports it.

Field-naming findings retain both observed non-sensitive name strings together,
including the label and the declared or computed name with its channel. Preserve
explicit absence, ambiguity or privacy omission. A generic naming-conflict
description alone is incomplete; a source ARIA attribute is not a computed name.

Use `blocker`, `high`, `medium`, or `low` severity based on defined task consequences. Keep confidence separate. Direct corroborated evidence can justify high confidence; incomplete reproduction may justify medium. Low-confidence inference must use `investigation_lead`, not confirmed defect. Repeated DOM manifestations do not multiply task severity; group the shared component issue while retaining checked instances.

Retain strengths supported by passing checks or demonstrated task evidence. A report consisting only of defects can hide the actual scope and useful successful behavior.

## Journeys and compatibility

Define task prompt, success conditions, material facts, starting state, mode, budget, reset method, and action boundary before a trial. Preserve safe prompt text or a clearly marked redacted form. Do not save a secret-containing prompt for reproducibility.

Use these execution results: `frontend_complete`, `frontend_complete_after_expected_intervention`, `safe_stop`, `observed_incorrect_result_or_effect`, and `unresolved`. Record `goal_conditions_met`, stop/block reason, final state, intervention, recovery, and retry counts independently. Keep `observations.access`, `observations.comprehension`, `observations.execution`, and `observations.correctness` as distinct objects with status, description, and evidence IDs; correctness describes frontend observations only.

Append observed incorrect results/effects with evidence and rationale. Never delete or overwrite them after recovery. A material error or unauthorized action keeps the trial in `observed_incorrect_result_or_effect`, excludes it from success counts, and remains visible beside completion statistics. Harmless intermediate navigation correction may be friction when it has no material wrong effect.

The verification layer is always `frontend`. Keep `backend_record_checked: false`, `business_effect_verified: null`, and `unintended_effect_count: null`. These constant fields prevent an unmeasured zero or frontend confirmation from becoming a server guarantee. Visible errors belong in `observed_effect_issues`; independently supplied backend assessment belongs in the owner register.

Each compatibility test references its journey and includes the actual skill host and tested agent separately, even if they are the same actor. Record surface, execution location, browser/profile/adapter, capability manifest, session, viewport, locale, time, trial number, and diagnostic assistance. Store documented support separately from observed results.

## Owner verification and guide coverage

Use owner statuses `owner_verification_required`, `owner_evidence_supplied`, or `resolved_by_external_assessment`. Retain unknown guarantee, workstream, priority rationale, requested safe evidence, acceptance procedure, and review trigger. Attribute external assessment with source/date/scope. Owner assertions are not automatically inspectable verification.

Include all 26 checklist IDs exactly once in guide coverage. Use `applicable`, `inapplicable`, or `unknown` with a reason. Use the schema's dispositions: `frontend_assessed`, `frontend_partially_assessed`, `owner_verification_required`, `mixed`, `inapplicable`, `untested`, or `cantTell`.

A requirement with both completed frontend checks and outstanding owner evidence remains mixed. The frontend-assessed count describes the frontend portion, not whole-guide verification. Do not mark server enforcement irrelevant solely because backend access is absent. Keep unknown applicability visible rather than hiding it in the denominator.

## Coverage and verdicts

Calculate planned and executed frontend check instances from check records. Keep all five outcome counts. Report planned/observed states separately; a state observed without its checks completed is not full coverage. Use the guide's applicable-requirement denominator separately from frontend checks and include unknown/inapplicable counts in prose.

Calculate successful trials only from eligible complete outcomes, with no material error or unauthorized action. Report all attempts, safe stops, material-error trials, unresolved trials, interventions, and recoveries. Do not silently drop unsuccessful trials from a success rate.

For tested task profiles use scoped conclusions: demonstrated for the tested scope, usable with friction, blocked for identified tasks, observed material error, or inconclusive. Tie the conclusion to actual product/mode/session/date and evidence. Do not mark untested clients demonstrated.

Public retrieval conclusions identify preserved/lost/mismatched facts by actual representation. Discovery conclusions describe observable eligibility and known intent alignment, never guaranteed indexing/citation. Tool conclusions distinguish inspected declarations, safe invocation, ordinary fallback, unsupported, and untested. Source conclusions stay separate and use `not_assessed` when original source is inadequate. Do not invent a universal 0–100 score.

## Outputs and CLI

| File | Content |
| --- | --- |
| `audit.json` | Canonical validated run |
| `audit-report.md` | Goal conclusions, strengths, tasks, findings, scope, coverage, owner needs, limitations |
| `evidence-index.json` | Sanitized evidence identities/provenance and artifact references |
| `remediation-plan.md` | Prioritized frontend fixes, rationale, workstream, and acceptance evidence |
| `owner-verification.md` | Applicable external guarantees, priorities, requested evidence, and procedures |
| `compatibility-tests.json` | Actual product/mode/task records with frontend verification |
| `evidence/` | Only retained, minimized, approved artifacts |

The CLI is optional. In an approved extracted package workspace, `npm ci --ignore-scripts` installs the pinned lightweight helpers; it performs no browser download. Import/validation/reporting use AJV and formats; static collection also uses parse5. Host instruction/browser workflows can proceed without Node or files.

```bash
node scripts/audit.mjs capabilities --out ./capability-check
node scripts/audit.mjs init --url https://example.com --out ./initialized-run
node scripts/audit.mjs collect --url https://example.com --allow-origin https://example.com --out ./static-run
node scripts/audit.mjs import --input ./sanitized-audit.json --out ./imported-run
node scripts/audit.mjs validate --input ./imported-run
node scripts/audit.mjs report --input ./imported-run --out ./report
node scripts/audit.mjs rules --format markdown
node scripts/audit.mjs rules --ids AFF-SEM-002,AFF-FORM-004
node scripts/audit.mjs inspect-source --input /approved/form.html
```

Run these as alternative entry paths, not a mandatory sequence writing the same initialized output repeatedly. Generated names are protected against overwrite; use distinct directories or the explicit `--overwrite` only when replacing your own intended artifacts. `capabilities` can print without `--out`. Use `--schema NAME` to validate a non-audit JSON record against its schema.

`collect` fetches one explicit document plus allowed redirects; it does not crawl a whole website. Available bounds include `--max-bytes`, `--timeout-ms`, and `--max-requests`. `--allow-origin` can be repeated for already-authorized origins. `--allow-localhost-fixture` is only for an intended local test fixture and labels that capture controlled. It does not authorize arbitrary internal-network exploration.

`import` accepts a complete normalized `audit.json` report, not arbitrary HAR/DOM exports. The agent must first interpret and normalize host evidence with accurate provenance, references, and sanitization. Reports derive from canonical data and cannot invent missing observation channels or trials.

## Validation and retention

Validate structure and cross-record consistency before delivery. Check unique/resolvable IDs, catalog/rule references, source/goal alignment, evidence for conclusions, artifact paths, null authoritative effects, incorrect histories, and calculated counts. A passed schema proves structural validity, not truth, privacy completeness, or a successful website audit.

Escape untrusted text in rendered reports and disable target active content. Keep artifact paths relative to the approved evidence root with no traversal or remote execution. Follow retention preferences; do not bundle full authenticated traces, profiles, raw HARs, or storage exports. Report any artifact deliberately omitted for privacy and the resulting evidence limit.

When files cannot be created, use the same report sections in chat and state the exact missing artifacts. Do not provide fabricated download links.

Requirements basis: supplied plan revision 2.0 §§9–12 and guide revision 2.0 §§10–12, Appendices A–B. The custom outcome vocabulary draws on explicit ACT-style outcomes but does not certify an ACT rule set or WCAG conformance.
