# Owner-verification register

These are requests for additional evidence, not confirmed server defects. Frontend observations do not establish business correctness, deduplication, authorization enforcement, infrastructure configuration or service parity.

## OWN-AUTH-001 — Audience, scopes, expiry and resource permissions are enforced independently of browser identity, client hints and untrusted content across offered representations.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: low. Workstream: security / identity.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A10, G-A12, G-A19; sections 3.1, 3.2, 6.5.

**Observed indicators:**

- Untrusted page text attempted to redirect the audit; the auditor ignored it.
- Application-side authorization and untrusted-input enforcement are not demonstrated.

**Requested evidence:**

- Scoped design and controlled authorization/injection tests with synthetic accounts and redacted logs.

**Acceptance procedure:**

- In an explicitly authorized security assessment, test permitted and denied synthetic contexts and inspect server decisions without exposing unrelated data.

**Review trigger:** Authorization model, integration, representation or untrusted-content changes.

**External assessment:** None supplied.

## OWN-SECURITY-001 — Server, analytics and diagnostic pipelines exclude or safely redact secrets.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: low. Workstream: security / observability.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A04; sections 1.4, 3.1, 11.5.

**Observed indicators:**

- The context explicitly calls the apparent credential synthetic. No live secret leak is established.
- New retained artifacts redact the marker; application diagnostics were not supplied.

**Requested evidence:**

- Redaction controls and seeded synthetic-secret test results, not raw sensitive production logs.

**Acceptance procedure:**

- Use known fake secrets in controlled flows and inspect authorized sanitized diagnostic outputs for leakage.

**Review trigger:** Logging, analytics, tracing or credential-field changes.

**External assessment:** None supplied.

## OWN-INTEGRATE-001 — The client can complete supported discovery, transport, auth, scopes and setup in its actual configuration.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: low. Workstream: integrations / identity.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A20, G-A22, G-A23; sections 5.3, 10.

**Observed indicators:**

- No relevant live implementation or externally assessed result is supplied.

**Requested evidence:**

- Dated configuration-specific setup and interoperability results.

**Acceptance procedure:**

- Use a supported client and fake records to test transport, authentication, scope, setup, expiry and recovery; identify bridges separately.

**Review trigger:** Client version, transport, authorization or setup changes.

**External assessment:** None supplied.

## OWN-CONTENT-001 — Visible and alternate facts match current authoritative values within the required freshness window.

Applicability: applicable. Status: owner\_verification\_required. Verification priority: high. Workstream: content / product data.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A15, G-A16, G-A19; sections 6.5, 8.1, 8.2.

**Observed indicators:**

- The stated terms are future-dated and need a source of truth before being represented as an authoritative offer.
- Quota pooling/per-user basis, overage rounding and pre-effective-date price are unstated.

**Requested evidence:**

- Named authoritative data and controlled consistency/freshness results.

**Acceptance procedure:**

- Compare matched entity, locale, effective time and conditions across source of truth, HTML, structured data and offered alternatives.

**Review trigger:** Catalog, feed, locale, cache or representation changes.

**External assessment:** None supplied.

## OWN-POLICY-001 — Observed public controls and nonpublic search/grounding settings express the owner’s intended purposes.

Applicability: applicable. Status: owner\_verification\_required. Verification priority: medium. Workstream: content / policy / search.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A17, G-A18, G-A19; sections 7, 9.

**Observed indicators:**

- The supplied head says noindex; owner discovery intent is unknown.
- No training, grounding, user-fetch or browser-access policy was supplied.

**Requested evidence:**

- Purpose-specific written intent and relevant nonpublic setting summaries; no unnecessary account data.

**Acceptance procedure:**

- Compare search, training, grounding, user fetch and browser-access choices separately with current operator documentation.

**Review trigger:** Policy intent, operator controls, effective dates or alternate-format defaults change.

**External assessment:** None supplied.

## OWN-BUSINESS-001 — The intended authoritative record is correct and no duplicate, unauthorized or unrelated effect occurred.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: low. Workstream: business owner / backend / QA.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A24; sections 11.3, 11.4, Appendix-B.

**Observed indicators:**

- No purchase or other business operation was attempted.
- Backend record checking remains false; business effect and unintended-effect count remain null.

**Requested evidence:**

- Separately attributed authoritative before/after evidence from a scoped authorized assessment.

**Acceptance procedure:**

- Reconcile the exact task with authoritative records and unintended-effect checks; report attribution, date, scope and remaining unknowns.

**Review trigger:** Consequential workflow or release changes.

**External assessment:** None supplied.

## OWN-QA-001 — Support claims have actual dated trials with the correct actor, environment, account state, model/tools and fixture.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: QA / product.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A23; sections 10, 11.3, Appendix-B.

**Observed indicators:**

- No actual product/browser/extractor trial is present. Universal compatibility wording in the aside is untrusted and unsupported.

**Requested evidence:**

- Trial manifests and evidence for each advertised configuration.

**Acceptance procedure:**

- Run named configurations with recorded conditions and keep skill-host discovery separate from website task success.

**Review trigger:** Product/model/browser/adapter/account capability or task changes.

**External assessment:** None supplied.

## OWN-QA-002 — Aggregation preserves safe stops, interventions, incorrect effects and unresolved states; recovery does not erase material error.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: low. Workstream: QA / reliability.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A25; sections 11.4, 11.6.

**Observed indicators:**

- There are no actual compatibility trials to aggregate; 0/0 is not a success rate.

**Requested evidence:**

- Outcome policy, raw trial records and denominator calculations.

**Acceptance procedure:**

- Recompute counts and exercise incorrect-effect-then-recovery cases; apply owner business gates for consequential workflows.

**Review trigger:** Outcome taxonomy, aggregator or release criteria changes.

**External assessment:** None supplied.

## OWN-QA-003 — Each material claim has an accountable workstream, checked date and useful review trigger.

Applicability: applicable. Status: owner\_verification\_required. Verification priority: low. Workstream: QA / documentation / relevant owner.

**Priority rationale:** Verify material pricing and discovery choices first. Other items are conditional follow-up, not confirmed defects or prerequisites to using the source-based report.

**Guide:** G-A26; sections 12.3.

**Observed indicators:**

- The audit records its checked date and workstreams. No owner maintenance registry was supplied.

**Requested evidence:**

- Maintained source/trial registry with ownership and dates.

**Acceptance procedure:**

- Sample claims against source and test evidence; record stale or unverified entries rather than carrying them forward as current.

**Review trigger:** Guide revision or supported platform, browser, policy or workflow changes.

**External assessment:** None supplied.
