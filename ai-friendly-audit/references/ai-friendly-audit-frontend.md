# Frontend module workflow

Module: `ai-friendly-audit-frontend` · Contract version: `1.0.0` · Requirements: guide revision 2.0.

This is the live-collection/complete-bundle workflow. Focused read-only source
responses use [supplied-source.md](supplied-source.md) instead; that branch
does not load this workflow and the full catalog as prerequisites.

## Contents

- [Input and scope](#input-and-scope)
- [Ordered phases](#ordered-phases)
- [Category dispatch](#category-dispatch)
- [Trial design](#trial-design)
- [Guide coverage](#guide-coverage)
- [Completion and maintenance](#completion-and-maintenance)

## Input and scope

Accept one starting URL or a supplied evidence bundle. Use existing session context for optional tasks, origins, paths, locale, viewports, target agents, source location, and budgets. Ask only when a missing fact blocks useful work or a consequential action needs authority not already supplied. Otherwise state an assumption and continue.

Keep the following records separate:

| Record | Purpose |
| --- | --- |
| Run scope | Requested site, allowed origins, exclusions, tasks, profiles, action boundary, budgets |
| Capability manifest | What this runtime demonstrably exposes and any limitations |
| Sample plan | Planned routes, states, tasks, sessions, viewports, and check instances |
| Observations | What was actually captured, with channel and source provenance |
| Interpretation | Checks, findings, comparison results, and uncertainty |
| Owner register | Applicable guarantees this frontend module cannot establish |

Use existing-session/public fallback, inspection-only authority, no fault injection, and the root budgets by default. Do not interpret a listed task such as “purchase” as audit permission to commit; rename the sampled task to its authorized boundary, such as “reach order review.” Preserve an independently authorized broader boundary when the session already supplies it.

## Ordered phases

### A. Resolve and preflight

Validate target scheme and scope. Read `assets/module.json`, select profiles, and record site purpose as information, transaction, mixed, or unknown. Infer three useful tasks. Determine actual tools, session, locale, execution route, available evidence channels, and time/byte/request budgets. Record unknown values with reasons. Read only the relevant adapter and domain references.

### B. Preserve and capture baseline

Note user-owned tabs and unsaved work before navigation. Preserve current cache, service workers, session, viewport, and emulation. Start supported network/console observation before a new navigation. If attached late, record capture start and missing earlier events. Reload only if the current page can safely be reloaded. Never manufacture an anonymous comparison by clearing the active session.

### C. Explore and select a sample

Follow ordinary visible navigation, links, and observed transitions. Inventory page templates, common controls, complex widgets, public detail pages, and existing error/loading/empty states. Include critical complete processes up to the authorized boundary. Sample representative narrow and desktop states where supported. Track discovered but unsampled routes separately. Avoid guessing hidden/admin routes or enumerating records.

Declare planned check instances before evaluating them. Preserve additions made during exploration as plan revisions with a reason. A repeated component can use one finding with several instances, but its checked targets retain individual outcomes.

### D. Collect synchronized evidence

Capture necessary visual, semantic, network, storage, and source observations with state IDs, sequence, capture time, and baseline/variation label. Use targeted excerpts. Record a frame's origin and actual inspection restrictions. Compare initial HTML, rendered content, and actual extractor output only when those representations exist. Match locale, session, version, and material facts before calling differences defects.

### E. Run deterministic checks

Use the canonical rules and existing supported tools. Preserve tool names, versions, original IDs, warnings, and limits. Normalize results separately. A scan result does not establish a whole task or accessibility conformance. Inspect Lighthouse mode/settings; preserve an active session with storage reset disabled only where that behavior is assured. If a collector changes session or page state, move it into a safe separate context or leave it unperformed.

The bundled HTTP collector is a narrow static adapter. It does not simulate rendering, compute browser accessibility, or execute journeys. Its conservative checks and evidence can be supplemented by a host-driven audit.

### F. Run declared tasks

Define conditions and mode before acting. Use the normal interface available to that mode. Capture before/after states around consequential transitions in understanding, even when no business action is committed. Record access, comprehension, execution, correctness observation, duration, retries, expected human steps, and stops separately. Keep unknown effects unknown. Use one controller for the session.

### G. Investigate failures

Recheck within budget. Distinguish a hidden/disabled/covered/moving target from an incorrect selector or premature action. Confirm material facts, target context, and error visibility. Retain alternative explanations. A failed tool call is not automatically a website defect. Low-confidence hypotheses become investigation leads, not confirmed findings.

### H. Conditional extensions

Inspect offered WebMCP declarations before any safe invocation. Compare results with visible state and ordinary UI fallback. Read legitimately available source only when it supports a maintainability claim. Run heavy traces only to resolve a concrete reliability question. Use induced faults, fake secrets, cancellation races, stale quotes, and changed-account scenarios only in resettable fixtures or an explicitly authorized test environment; label them as such.

### I. Synthesize and validate

Deduplicate component patterns while retaining instances. Assign severity from task impact and confidence from evidence quality. Provide prioritized frontend remedies and observable acceptance tests. Preserve all guide dispositions, owner items, incorrect histories, and limitations. Validate schema shape, foreign keys, coverage arithmetic, evidence privacy, and truth boundaries before report generation.

### Cleanup

Use a `finally` path for success, error, interruption, and cancellation. Stop audit listeners/traces. Restore audit-changed viewport, throttling, emulation, and cache controls. Close audit-created contexts only; keep user sessions available. Do not rewrite application data, cookie values, or drafts as a cleanup mechanism. Record any restoration failure.

## Category dispatch

Apply all categories to the declared sample; explicitly record relevance or missing evidence. “Category reviewed” does not mean every check passed.

| Group | Primary question | Route to detailed procedure |
| --- | --- | --- |
| AFF-SEM | Are structure, names, labels, roles, and state understandable? | `frontend-rules.md` |
| AFF-KBD | Can the complete sampled interaction use a keyboard? | `frontend-rules.md` |
| AFF-VIS | Are targets identifiable, reachable, and stable? | `frontend-rules.md` |
| AFF-FORM | Are field purpose, constraints, errors, and sensitive markup correct? | `frontend-rules.md` |
| AFF-STATE | Are loading, result, uncertainty, and durable status observable? | `transaction-observability.md` |
| AFF-REC | Can review, correction, retry advice, and resumption be understood? | `transaction-observability.md` |
| AFF-NAV | Are legitimate detail routes, links, and context durable? | `retrieval-and-policy.md` |
| AFF-DYN | Do hydration and rerenders preserve the usable interaction? | `frontend-rules.md` |
| AFF-CPLX | Can this mode operate virtual lists, frames, canvas, and complex widgets? | `browser-adapters.md` |
| AFF-RESP | Does the sampled task remain usable across tested viewports/settings? | `frontend-rules.md` |
| AFF-PERF | Do observed delay, shifts, errors, or broken resources affect the task? | `browser-adapters.md` |
| AFF-NET | Can the actual execution route reach the whole sampled journey? | `browser-adapters.md` |
| AFF-STORE | What relevant client state and persistence can be observed safely? | `evidence-and-reporting.md` |
| AFF-RET | Do facts and qualifiers survive actual representations? | `retrieval-and-policy.md` |
| AFF-LOCALE | Are material locale, units, time, and money conditions explicit? | `retrieval-and-policy.md` |
| AFF-DISC | Are public eligibility and attribution signals coherent? | `retrieval-and-policy.md` |
| AFF-POL | Are separate content-use decisions known and correctly represented? | `retrieval-and-policy.md` |
| AFF-TOOL | Are offered tool declarations, safe results, and UI fallback coherent? | `browser-adapters.md` |
| AFF-TRUST | Are evidence trust boundaries and secret handling preserved? | `authentication-and-scope.md` |
| AFF-SRC | Does adequate original source support a maintainability assessment? | `source-review.md` |

## Trial design

Define task prompt, start state, expected facts, allowed actions, action boundary, interaction mode, frontend conditions, max actions/time, and reset method before the trial. Use the current agent unless another product is actually available. Record diagnostic assistance: a visual-only actor must not receive source-derived selectors or semantic hints. Rich inspection can follow a failed unaided trial but cannot retroactively make it unaided.

For a retrieval trial, list required facts and qualifiers and name the real extractor if used. For interaction, define a visible completion condition. A terminal HTML fetch is not an agent browser task. Repeat only useful safe tasks within live budgets; use resettable fixtures for statistical evaluation.

Do not report “successful booking” when the task stops at review. Do not report backend correctness from an HTTP 200, UI receipt, or tool output. Retain material errors even if the target is later reached.

## Guide coverage

Map all 26 `G-A01`–`G-A26` requirements for every run. Use source applicability and evidence, not access availability, to decide relevance. A static publisher can legitimately lack transaction requirements; an inaccessible transaction flow is applicable but untested.

An item can have both frontend checks and owner verification. Keep both. In particular, G-A04 includes external logging controls, G-A06–G-A11 include server enforcement, G-A12 includes application authorization, G-A13–G-A14 include infrastructure, G-A19 includes access consistency, G-A20–G-A21 include integration enforcement, and G-A24 requires independent business verification.

Report two denominators: planned frontend check instances and applicable guide requirements. Do not call an entire guide item verified because its frontend subset passed. Provide `unknown` applicability with reason when evidence is insufficient; do not count unknown items as verified or silently exclude them from disclosure.

## Completion and maintenance

Use the output contract in `evidence-and-reporting.md` and the report template. Include supported strengths and findings. Separate observed network access, retrieval, task outcomes, search visibility, and business value. The latter two commonly need owner sources.

Record rule/catalog/schema/module versions. Reassess after relevant UI, source, browser, model, locale, authentication, WAF, policy, or guide changes. Compare only compatible samples when reporting regression. The guide's illustrative 30-day website improvement sequence is not a build estimate or an audit duration.

Requirements basis: supplied technical plan revision 2.0 §§1–14 and supplied guide revision 2.0 §§1–12, Appendices A–C, reviewed 2026-11-22. These are project procedures, not a claim that every referenced platform was independently tested.

## Evidence validation contract

Before normalizing host evidence or importing a report, read [evidence-contract.md](evidence-contract.md). Use explicit scoped variants and retain required action/result traces; a capability flag or static declaration cannot replace them.
