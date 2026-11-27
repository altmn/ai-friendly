# Transaction observability and recovery

## Contents

- [Frontend verification boundary](#frontend-verification-boundary)
- [Visible lifecycle](#visible-lifecycle)
- [Review and confirmation procedure](#review-and-confirmation-procedure)
- [Recovery and adverse cases](#recovery-and-adverse-cases)
- [Owner-verification workstreams](#owner-verification-workstreams)
- [Outcome accounting](#outcome-accounting)

## Frontend verification boundary

Assess whether the current agent can identify intended work, distinguish preparation from commit, understand visible progress/uncertainty, and find safe recovery. Do not certify transaction correctness, object authorization, deduplication, atomicity, or business state from frontend evidence.

Classify a review page showing amount and timezone as `frontend_verifiable`. Classify a naturally observed operation key/version header as `frontend_indicator`. Keep its enforcement and actual effects `owner_verification_required`. A successful simulated state belongs to `controlled_fixture`, not live-site evidence.

Ordinary audit authority ends before unapproved business changes. Server drafts, inventory holds, messages, and autosave can already be changes. Do not manufacture uncertainty through dropped responses, repeated commits, cancellation races, or session expiration on production.

## Visible lifecycle

Preserve the site's actual wording and normalize the observed state only when justified:

| Normalized state | Frontend expectation |
| --- | --- |
| `not_started` | Task and intended target are identifiable |
| `in_progress` | Visible progress and retained context distinguish waiting from inactivity |
| `requires_user_action` | Required intervention and its consequences are explicit |
| `succeeded` | Durable visible result identifies the target and material terms |
| `failed` | Understandable failure and correction route are available |
| `cancelled` | Wording distinguishes completed cancellation from a pending cancellation request |
| `unknown_outcome` | Uncertainty is explicit and a safe status/reconciliation route is offered |

These are project normalization terms, not a universal protocol. Do not infer that a timeout means failure, a browser abort means cancellation, or a toast means durable authoritative success.

## Review and confirmation procedure

1. Identify the selected task and its authorized boundary.
2. Inspect visible labels/transitions separating selection, draft, review, and final commit.
3. Record relevant target, recipient, quantity, amount/currency, billing interval, date/timezone, eligibility, conditions, and expiry.
4. Compare details across selection and review in the same observed context.
5. Check whether changed material terms require clear reconsideration when such a state already exists or is supplied in a fixture.
6. Observe error/status readability, persistent result details, and legitimate status/history links.
7. Stop before an unapproved action and name the completed task by its actual boundary.
8. Add owner verification for every applicable guarantee not established here.

A transient toast alone can leave an agent unable to verify the frontend result. Demonstrate the absence of a reachable persistent result within the sampled flow without claiming that no backend record exists. A UI receipt can establish what was displayed but not whether the correct single authoritative record exists.

## Recovery and adverse cases

| Scenario | Safe observable work | Owner-only question |
| --- | --- | --- |
| Validation error | Associated message, retained valid input, correction path | Server validates all relevant constraints |
| Unknown result after timeout | Inspect existing uncertainty text and read-only status route | Whether a commit occurred and exactly which effects exist |
| Retry guidance | Determine whether UI asks for status/reconciliation or blind repeat | Stable logical-operation deduplication and incompatible reuse |
| Changed quote/version | Inspect conflict text and re-review path | Current actor, terms, resource/version, price, and availability enforced atomically |
| Cancellation | Distinguish request received, pending, cancelled, completed, and unknown | Whether commit happened, reversal succeeded, or compensation is needed |
| Resume after interruption | Inspect account/task/step context and existing result lookup | Cross-device binding and avoidance of duplicate operations |
| Safe-method mutation indicator | Inspect existing markup/source and record concern | Server safe-method/prefetch enforcement |
| Read-only annotation | Inspect declared purpose and corroborating documentation | Actual permissions and side-effect enforcement |

For a controlled fixture, label fake data, reset method, injected condition, and expected frontend observation. Do not represent its simulated response as business verification. For an expressly authorized real test environment, preserve that authorization and scope; this module still does not silently acquire backend verification authority.

## Owner-verification workstreams

Create applicable items with guide/checklist references, related frontend checks, observed indicators, unknown guarantee, status, workstream, verification priority, requested evidence, acceptance procedure, and review trigger.

| Workstream | Typical guarantee to request |
| --- | --- |
| OWN-TXN | Safe methods, logical-operation identity, deduplication, retention, version/quote checks, cancellation, resumption |
| OWN-AUTH | Current actor/resource permissions, OAuth audience/scopes, account binding, private representation access |
| OWN-BUSINESS | Correct intended record/effect and absence of duplicate or unrelated effects |
| OWN-SECURITY | Secret exclusion/redaction outside available client channels; application trust enforcement |
| OWN-INFRA | Agent identity verification, WAF rule decisions, full journey and shared-egress behavior |
| OWN-INTEGRATE | Protocol/client setup, server enforcement, UI/tool service parity and authoritative results |
| OWN-POLICY | Intended search/training/grounding/user-fetch/browser policies |
| OWN-CONTENT | Authoritative price, stock, service facts, feeds, and freshness where external truth matters |

Use verification priority rather than assigning confirmed-defect severity to an unknown guarantee. Ask for sanitized test results or inspectable authoritative evidence, never production secrets or bulk sensitive logs. An owner assertion is different from independent evidence. Use `owner_evidence_supplied` or `resolved_by_external_assessment` only with explicit source, date, scope, and attribution; it does not change the module's frontend layer.

## Outcome accounting

Use `frontend_complete`, `frontend_complete_after_expected_intervention`, `safe_stop`, `observed_incorrect_result_or_effect`, or `unresolved`. Record goal conditions met, final state, block/stop reason, human interventions, retries, and recovery separately.

Retain an append-only list of observed incorrect results/effects. A wrong visible recipient, amount, date, duplicate, or unauthorized action can be material even if the intended goal is subsequently reached. Such a trial remains `observed_incorrect_result_or_effect` and cannot enter successful-trial counts. A harmless intermediate navigation correction can be friction when no material wrong effect occurred; record the rationale and evidence.

Always use `verification.layer: frontend`, `backend_record_checked: false`, `business_effect_verified: null`, and `unintended_effect_count: null` in this module. Use `business_effect_outcome: not_attempted` when no consequential business action was attempted, or `unresolved` when it was attempted but authoritative effects remain unverified. Record visible issues in the separate observed-effect list.

Requirements basis: supplied plan revision 2.0 §§6, 8.4, 10.3–10.6 and guide revision 2.0 §§2–5, 11. The backend acceptance patterns are requirements for owner verification, not claims of tests performed by this package.
