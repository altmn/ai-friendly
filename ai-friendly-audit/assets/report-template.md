# AI Friendly Frontend Audit

> Template only. Replace instructions with evidence-backed report content. Do not leave example claims, placeholders, or unsupported success statements in a delivered audit. Derive counts and companion files from the same `audit.json`.

## 1. What the tested agent could accomplish

Identify the target, checked date, site purpose, sampled tasks, actual agent/product/model, browser/provider/profile, execution location, interaction mode, and session. State the scope of the conclusion immediately.

| Goal/profile | Scoped conclusion | Supporting evidence | Remaining uncertainty |
| --- | --- | --- | --- |
| Retrieve / public-retrieval | Describe facts/qualifiers by actual representation | Evidence and trial IDs | Unavailable extractors, freshness, truncation |
| Operate / browser-operability | Name tasks demonstrated, friction, barriers, or material errors | Journey/check IDs | Untested states and safe boundaries |
| Discover and cite / discovery-and-citation | Describe observed eligibility and known intent alignment | Header/markup/policy evidence | Actual indexing/citation status |
| Integrate / frontend-tools | Describe offered declarations, safe results, and fallback | Tool/UI evidence | Unsupported or untested client route |
| Source maintainability | State assessed source scope or not assessed | Source provenance | Unseen code and unexecuted tests |

State that authoritative business correctness remains external owner verification. Do not produce a universal 0–100 score or universal product compatibility claim.

## 2. Important barriers and supported strengths

Lead with task blockers and observed material errors, then repeated consequential friction. Include strengths supported by actual evidence. Distinguish confirmed findings from investigation leads.

| ID | Finding or strength | Affected task/mode | Severity/confidence | Evidence |
| --- | --- | --- | --- | --- |

For each finding, explain observed behavior, expected behavior, task impact, affected states/components, reproduction, known uncertainty, remedy, and observable acceptance test. Include source file locations only when actually inspected.
For field-naming findings, show both non-sensitive observed name strings together
and identify their source/visual/computed channel. Explicitly retain unknown,
absent or privacy-omitted names; do not replace the pair with a generic warning.

## 3. What to change first

| Priority | Work item | Why it matters | Responsible workstream | Acceptance evidence | Review trigger |
| --- | --- | --- | --- | --- | --- |

Separate verified frontend fixes, owner-verification needs, and optional improvements. Adapt order to site purpose. Give rough effort only when source/context supports it. Keep the complete ordered list in `remediation-plan.md`.

## 4. Task outcomes

| Trial | Actual agent and mode | Task and completion boundary | Execution result | Intervention/recovery | Material issues | Evidence |
| --- | --- | --- | --- | --- | --- | --- |

Report attempted and successful trials as counts with their denominator. Also report safe stops, material-error trials, unresolved trials, and expected human interventions. Preserve prior material errors after recovery. Name a review-step success as a review-step success.

Separate access, comprehension, execution, and correctness observations. State `verification.layer: frontend`; authoritative backend checks are false and unmeasured effects remain null. Explain consequential attempts with unresolved business effects.

## 5. Retrieval, locale, and representation fidelity

| Fact/qualifier | Initial response | Rendered page | Actual extractor | Offered alternate | Evidence/context |
| --- | --- | --- | --- | --- | --- |

Use unknown when a representation was unavailable. Record actual extractor identity, truncation/continuation observations, locale/session/version differences, capture times, and freshness limits. Do not promote a local conversion into another client's output.

## 6. Scope, execution, and sampling

Record allowed origins, excluded paths, planned/discovered/sample routes, states, viewports, session availability, requested/effective locale/timezone/currency, tools/versions, budgets, baseline settings, and controlled variations. State any diagnostic assistance in a trial.

| Capability | Observed status | Probe/evidence | Limitation |
| --- | --- | --- | --- |

Keep denied/unsupported/failed/not-attempted separate from available. Record tool and session failures without erasing completed work.

## 7. Coverage

Report planned frontend check instances, executed instances, and all five check outcomes. Report planned/observed states separately. Do not equate a percentage of the sample with a percentage of the entire application.

Report the separate guide denominator: all 26 checklist items, applicable items, unknown/inapplicable items, frontend-assessed portions, mixed items, and outstanding owner requirements.

| Checklist ID | Applicability | Disposition | Frontend checks | Owner items | Reason/limit |
| --- | --- | --- | --- | --- | --- |

Retain every checklist ID. A frontend pass cannot close an unverified server guarantee.

## 8. Owner verification

| Item | Guarantee still unknown | Visible indicators | Priority/workstream | Required safe evidence | Acceptance procedure |
| --- | --- | --- | --- | --- | --- |

Attribute supplied assertions and external assessments by source, date, and scope. Keep them distinct from this module's work. The complete register is `owner-verification.md`.

## 9. Evidence and reproducibility

Reference `evidence-index.json` and retained `evidence/` artifacts. Record exact channel, context, timestamps, collector, sanitized URL, redaction method/review, artifact path/hash if retained, and limits. Give sufficient safe reproduction steps for each important finding.

List privacy-driven omissions, capture gaps, and retention policy. Do not include credentials, raw authenticated HARs, session exports, private screenshots, or unreviewed sensitive bodies.

## 10. Compatibility, limitations, and next verification

Separate actual skill-host loading tests from actual website-agent trials. Link `compatibility-tests.json` for observed trials. Mark other products/modes untested; documentation alone is not demonstrated support.

State inaccessible routes/channels, source limits, safe-stop boundaries, budget gaps, uncertain causes, and remaining business/infrastructure evidence. Name the next concrete evidence that would resolve each important uncertainty.

Record cleanup: audit-owned listeners stopped, changed settings restored, owned tabs handled, user session preserved, and any failure to restore. Identify workstreams and recheck triggers without inventing people or commitments.
