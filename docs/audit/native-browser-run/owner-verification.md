# Owner-verification register

These are requests for additional evidence, not confirmed server defects. Frontend observations do not establish business correctness, deduplication, authorization enforcement, infrastructure configuration or service parity.

## OWN-TXN-001 — Retries produce only the intended effect and incompatible operation-key reuse is rejected.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: backend / reliability.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A07; sections 2.2.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Sanitized design and controlled duplicate/reuse test results; no production secrets.

**Acceptance procedure:**

- Using resettable fake records, repeat one logical operation with matching and mismatched parameters and inspect authoritative records.

**Review trigger:** Operation identity, retention or retry behavior changes.

**External assessment:** None supplied.

## OWN-TXN-002 — The commit revalidates current authority and all material conditions, and binds required approval to those conditions.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: backend / security.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A08; sections 2.3, 3.1.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Controlled stale-version, price, availability, expiry and changed-permission results.

**Acceptance procedure:**

- Change each relevant condition between review and commit in an authorized test environment; verify rejection or explicit re-review and inspect authoritative effects.

**Review trigger:** Commit path, permission, quote or inventory changes.

**External assessment:** None supplied.

## OWN-TXN-003 — Status lookup distinguishes committed, uncommitted and still-resolving work; cancellation never falsely claims reversal.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: backend / reliability.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A09; sections 2.2, 2.4.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Controlled lost-response and late-cancellation timelines with authoritative state.

**Acceptance procedure:**

- Induce supported failures against fake records and reconcile the status response with final records and any compensation.

**Review trigger:** Async job, cancellation or status lifecycle changes.

**External assessment:** None supplied.

## OWN-TXN-004 — Safe-method traversal, preview and prefetch cannot cause a consequential mutation.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: backend / security.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A06; sections 2.4.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Route/method design and controlled navigation/prefetch test results.

**Acceptance procedure:**

- Traverse relevant links and preview/prefetch requests using controlled records; compare authoritative state before and after.

**Review trigger:** Routing, HTTP method or preview handling changes.

**External assessment:** None supplied.

## OWN-TXN-005 — Continuation is account-bound, revalidates current state and cannot repeat externally completed work.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: backend / identity.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A11; sections 2.5.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Controlled resume, expiry and cross-device completion results.

**Acceptance procedure:**

- Pause fake work, complete it independently and resume; verify the existing result is used and no duplicate effect occurs.

**Review trigger:** Session, draft, continuation URL or cross-device flow changes.

**External assessment:** None supplied.

## OWN-AUTH-001 — Audience, scopes, expiry and resource permissions are enforced independently of browser identity, client hints and untrusted content across offered representations.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: security / identity.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A10, G-A12, G-A19; sections 3.1, 3.2, 6.5.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Scoped design and controlled authorization/injection tests with synthetic accounts and redacted logs.

**Acceptance procedure:**

- In an explicitly authorized security assessment, test permitted and denied synthetic contexts and inspect server decisions without exposing unrelated data.

**Review trigger:** Authorization model, integration, representation or untrusted-content changes.

**External assessment:** None supplied.

## OWN-SECURITY-001 — Server, analytics and diagnostic pipelines exclude or safely redact secrets.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: security / observability.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A04; sections 1.4, 3.1, 11.5.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Redaction controls and seeded synthetic-secret test results, not raw sensitive production logs.

**Acceptance procedure:**

- Use known fake secrets in controlled flows and inspect authorized sanitized diagnostic outputs for leakage.

**Review trigger:** Logging, analytics, tracing or credential-field changes.

**External assessment:** None supplied.

## OWN-INFRA-001 — The configured verifier follows the actual named provider mechanism and cannot be satisfied by spoofed labels alone.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: security / infrastructure.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A13; sections 4.2.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Current official identity specification, configuration summary and controlled verifier tests.

**Acceptance procedure:**

- Validate legitimate and invalid synthetic signatures or allowed test identities using the supported mechanism; preserve user authorization separately.

**Review trigger:** Vendor keys/ranges/mechanisms or rule configuration changes.

**External assessment:** None supplied.

## OWN-INFRA-002 — Intended traffic is handled consistently across the complete journey, rule precedence and shared egress.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: infrastructure / reliability.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A14; sections 4.3.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Scoped rule decisions, relevant redacted logs and approved route matrix.

**Acceptance procedure:**

- Exercise authorized route fixtures across pages and required subrequests, inspecting rate limits and precedence without weakening protected endpoints.

**Review trigger:** WAF rules, egress provider, service domains or access incidents.

**External assessment:** None supplied.

## OWN-INTEGRATE-001 — The client can complete supported discovery, transport, auth, scopes and setup in its actual configuration.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: integrations / identity.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A20, G-A22, G-A23; sections 5.3, 10.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Dated configuration-specific setup and interoperability results.

**Acceptance procedure:**

- Use a supported client and fake records to test transport, authentication, scope, setup, expiry and recovery; identify bridges separately.

**Review trigger:** Client version, transport, authorization or setup changes.

**External assessment:** None supplied.

## OWN-INTEGRATE-002 — Interfaces share authoritative rules and data, enforce constraints and return faithful statuses/errors.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: integrations / backend.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A21, G-A22; sections 5.1, 5.2, 5.4.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Architecture evidence and controlled parity/error tests with authoritative state.

**Acceptance procedure:**

- Compare equivalent permitted operations and rejected synthetic cases across interfaces, including stale inputs and delayed results.

**Review trigger:** Tool schema, shared service, permissions or state lifecycle changes.

**External assessment:** None supplied.

## OWN-CONTENT-001 — Visible and alternate facts match current authoritative values within the required freshness window.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: content / product data.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A15, G-A16, G-A19; sections 6.5, 8.1, 8.2.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Named authoritative data and controlled consistency/freshness results.

**Acceptance procedure:**

- Compare matched entity, locale, effective time and conditions across source of truth, HTML, structured data and offered alternatives.

**Review trigger:** Catalog, feed, locale, cache or representation changes.

**External assessment:** None supplied.

## OWN-POLICY-001 — Observed public controls and nonpublic search/grounding settings express the owner’s intended purposes.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: content / policy / search.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A17, G-A18, G-A19; sections 7, 9.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Purpose-specific written intent and relevant nonpublic setting summaries; no unnecessary account data.

**Acceptance procedure:**

- Compare search, training, grounding, user fetch and browser-access choices separately with current operator documentation.

**Review trigger:** Policy intent, operator controls, effective dates or alternate-format defaults change.

**External assessment:** None supplied.

## OWN-BUSINESS-001 — The intended authoritative record is correct and no duplicate, unauthorized or unrelated effect occurred.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: business owner / backend / QA.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A24; sections 11.3, 11.4, Appendix-B.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Separately attributed authoritative before/after evidence from a scoped authorized assessment.

**Acceptance procedure:**

- Reconcile the exact task with authoritative records and unintended-effect checks; report attribution, date, scope and remaining unknowns.

**Review trigger:** Consequential workflow or release changes.

**External assessment:** None supplied.

## OWN-QA-001 — Support claims have actual dated trials with the correct actor, environment, account state, model/tools and fixture.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: QA / product.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A23; sections 10, 11.3, Appendix-B.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Trial manifests and evidence for each advertised configuration.

**Acceptance procedure:**

- Run named configurations with recorded conditions and keep skill-host discovery separate from website task success.

**Review trigger:** Product/model/browser/adapter/account capability or task changes.

**External assessment:** None supplied.

## OWN-QA-002 — Aggregation preserves safe stops, interventions, incorrect effects and unresolved states; recovery does not erase material error.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: QA / reliability.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A25; sections 11.4, 11.6.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Outcome policy, raw trial records and denominator calculations.

**Acceptance procedure:**

- Recompute counts and exercise incorrect-effect-then-recovery cases; apply owner business gates for consequential workflows.

**Review trigger:** Outcome taxonomy, aggregator or release criteria changes.

**External assessment:** None supplied.

## OWN-QA-003 — Each material claim has an accountable workstream, checked date and useful review trigger.

Applicability: unknown. Status: owner\_verification\_required. Verification priority: medium. Workstream: QA / documentation / relevant owner.

**Priority rationale:** Provisional verification priority pending site-purpose and consequence assessment; absence of enforcement is not established.

**Guide:** G-A26; sections 12.3.

**Observed indicators:**

- None recorded.

**Requested evidence:**

- Maintained source/trial registry with ownership and dates.

**Acceptance procedure:**

- Sample claims against source and test evidence; record stale or unverified entries rather than carrying them forward as current.

**Review trigger:** Guide revision or supported platform, browser, policy or workflow changes.

**External assessment:** None supplied.
