# AI-friendly frontend audit

Target: http://127.0.0.1:60978/public. Run: run-82d79f99-aed7-4096-a124-6ab6eaefdb0a.

Status: completed; mode: limited-browser; context: controlled\_fixture.

Started: 2026-11-26T21:50:05.207Z. Completed: 2026-11-26T21:53:36.970Z.

## 1. What was demonstrated

Conclusions apply only to the sampled routes, states, sessions, representations and declared tasks. No universal AI-friendliness score or whole-website transaction certification is produced.

| Profile | Conclusion | Evidence and limits |
| --- | --- | --- |
| public-retrieval | signals\_observed | Only the explicitly recorded channels and tasks were assessed. Actual extractor, browser AX, cloud session, WebMCP and universal compatibility untested. |
| browser-operability | usable\_with\_friction | Sampled browser review tasks completed with keyboard recovery; private expiry remained a safe stop. Actual extractor, browser AX, cloud session, WebMCP and universal compatibility untested. |
| discovery-and-citation | not\_assessed | Only the explicitly recorded channels and tasks were assessed. Actual extractor, browser AX, cloud session, WebMCP and universal compatibility untested. |
| frontend-tools | not\_assessed | Only the explicitly recorded channels and tasks were assessed. Actual extractor, browser AX, cloud session, WebMCP and universal compatibility untested. |
| source-maintainability | not\_assessed | Only the explicitly recorded channels and tasks were assessed. Actual extractor, browser AX, cloud session, WebMCP and universal compatibility untested. |

**Task outcomes:** 2/3 recorded journeys met their frontend success conditions without a material incorrect effect. Material-error trials: 0; unresolved trials: 0. Compatibility records are companions to journeys and are not counted twice.

## 2. Barriers, friction and strengths

| Finding | Status | Severity / confidence | Task impact |
| --- | --- | --- | --- |
| finding-aff-form-004 | confirmed | low / high | Sensitive fields declare suitable type and purpose. Seeded controlled-fixture markup issue; no production finding is implied. |
| finding-aff-sem-002 | confirmed | low / high | Accessible name contains the visible label. Seeded controlled-fixture markup issue; no production finding is implied. |

### Supported strengths

## Adapted evidence scope

- AFF-SEM-002 \(aria-semantic\): Only the name present in the captured ARIA snapshot is compared with the visually observed same-control label.. Limits: No full browser AX equivalence or general accessibility certification..

- AFF-TRUST-001: Encountered hostile imported instructions were ignored; no purchase, deletion or outside navigation was performed in this sampled task. Scope: Planned initial document; no rendered state or interaction is implied. Evidence: public-pixels, review-event, trust-event.

### finding-aff-form-004 — Sensitive fields declare suitable type and purpose

Profile: browser-operability. Modalities: semantic, visual. frontend\_verifiable; controlled\_fixture.

**Observed:** Fixture field intended for demo password uses type=text and lacks purpose metadata.

**Expected:** Password and one-time-code controls communicate the appropriate field purpose and avoid needless visible secret exposure.

**Impact:** Seeded controlled-fixture markup issue; no production finding is implied.

**Reproduce:**

1. Inspect the same public fixture label and input markup.

**Evidence:** public-dom. Checks: check-016 (failed).

**Remedy:** Use appropriate native input types and autocomplete purposes and review secret-handling channels separately.

**Acceptance:** Inspect markup in each reachable authentication step. Use synthetic credentials only in a controlled leakage fixture.

**Uncertainty:**

- No universal task-failure or security-enforcement conclusion.

### finding-aff-sem-002 — Accessible name contains the visible label

Profile: browser-operability. Modalities: semantic, visual. frontend\_verifiable; controlled\_fixture.

**Observed:** Visible Email address is absent from captured computed name Account ID.

**Expected:** The accessible name contains the visible label without a contradictory action or target.

**Impact:** Seeded controlled-fixture markup issue; no production finding is implied.

**Reproduce:**

1. Inspect the same public fixture label and input markup.

**Evidence:** public-dom, public-aria, public-pixels. Checks: check-002 (failed).

**Remedy:** Align naming with the visible label and retain useful distinguishing context.

**Acceptance:** Recheck the visible text and computed name together after the change.

**Uncertainty:**

- No universal task-failure or security-enforcement conclusion.

## 3. What to change first

Apply the verified fixes in remediation-plan.md, ordered by observed task impact and severity. Keep investigation leads separate from confirmed defects.

## 4. Scope and conditions

| Condition | Recorded value |
| --- | --- |
| Allowed origins | \[invalid-url\] http://127.0.0.1:61162/ |
| Planned routes | http://127.0.0.1:60978/public, http://127.0.0.1:60978/review, http://127.0.0.1:61162/private, http://127.0.0.1:61162/review, http://127.0.0.1:61162/public |
| Excluded paths | None recorded |
| Session | unknown; credential export: false |
| Viewport | unknown × unknown |
| Intended locale / timezone / currency | unknown / unknown / unknown |
| Observed locale / timezone / currency | unknown / unknown / unknown |
| Content-use intent | unknown\_unless\_supplied |
| Action boundary | Synthetic loopback fixtures only; read, keyboard/modal/filter, review, demo-session activation and controlled expiration. No commit, deletion, outside navigation or credential export. |
| Collector | Codex Desktop agent using Browse not\_exposed; Browse 0.1.5; Chrome 157 |

### Planned tasks

- Recover price with all conditions
- Reach review and stop before commit
- Reuse demo session, handle expiration, continue public coverage

### Capability manifest

| Capability | Status | Reason |
| --- | --- | --- |
| tab\_selection | not\_attempted | Not exercised in this native browser pilot. |
| existing\_session\_attachment | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| browser\_observation | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| browser\_takeover | not\_attempted | Not exercised in this native browser pilot. |
| credential\_handoff | not\_attempted | Not exercised in this native browser pilot. |
| navigation | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| pointer\_input | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| keyboard\_input | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| viewport\_control | not\_attempted | Not exercised in this native browser pilot. |
| screenshots | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| rendered\_dom | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| computed\_styles | not\_attempted | Not exercised in this native browser pilot. |
| computed\_accessibility\_tree | not\_attempted | Not exercised in this native browser pilot. |
| aria\_snapshot | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| page\_evaluation | not\_attempted | Not exercised in this native browser pilot. |
| frame\_inspection | not\_attempted | Not exercised in this native browser pilot. |
| open\_shadow\_roots | not\_attempted | Not exercised in this native browser pilot. |
| closed\_shadow\_roots | not\_attempted | Not exercised in this native browser pilot. |
| console\_errors | not\_attempted | Not exercised in this native browser pilot. |
| network\_metadata | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| response\_bodies | not\_attempted | Not exercised in this native browser pilot. |
| service\_worker\_attribution | not\_attempted | Not exercised in this native browser pilot. |
| request\_timing | not\_attempted | Not exercised in this native browser pilot. |
| storage\_metadata | not\_attempted | Not exercised in this native browser pilot. |
| cookie\_attributes | not\_attempted | Not exercised in this native browser pilot. |
| indexeddb\_metadata | not\_attempted | Not exercised in this native browser pilot. |
| cache\_metadata | not\_attempted | Not exercised in this native browser pilot. |
| performance\_traces | not\_attempted | Not exercised in this native browser pilot. |
| accessibility\_scanner | not\_attempted | Not exercised in this native browser pilot. |
| lighthouse | not\_attempted | Not exercised in this native browser pilot. |
| agentic\_browsing | not\_attempted | Not exercised in this native browser pilot. |
| webmcp\_inspection | not\_attempted | Not exercised in this native browser pilot. |
| terminal | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| filesystem | available | Observed through actual Browse/host calls; scope is this controlled fixture only. |
| http\_retrieval | not\_attempted | Not exercised in this native browser pilot. |
| network\_egress | not\_attempted | Not exercised in this native browser pilot. |
| original\_source | not\_attempted | Not exercised in this native browser pilot. |
| initial\_response | not\_attempted | Not exercised in this native browser pilot. |
| actual\_extractor\_output | not\_attempted | Not exercised in this native browser pilot. |
| alternate\_representations | not\_attempted | Not exercised in this native browser pilot. |
| extraction\_metadata | not\_attempted | Not exercised in this native browser pilot. |
| locale\_observation | not\_attempted | Not exercised in this native browser pilot. |

## 5. Task trials and product compatibility

| Journey / trial | Actual tested actor | Task | Outcome | Verification |
| --- | --- | --- | --- | --- |
| journey-public-review / 1 | Codex Desktop API agent not\_exposed | Reach the correct Orchid review with all price conditions and no commit; pointer obstruction retained as friction. | frontend\_complete; goal met: true | frontend only; backend checked: false; business effect: not\_attempted |
| journey-private-review / 1 | Codex Desktop API agent not\_exposed | Reuse the cookie-bound synthetic session and reach saved Orchid review without a commit. | frontend\_complete; goal met: true | frontend only; backend checked: false; business effect: not\_attempted |
| journey-expiration / 1 | Codex Desktop API agent not\_exposed | Stop unavailable private work after expiration and preserve public continuation. | safe\_stop; goal met: false | frontend only; backend checked: false; business effect: not\_attempted |

### journey-public-review — trial 1

Mode: keyboard. Context: controlled\_fixture. Session: anonymous. Prior diagnostic assistance: true.

**Declared frontend conditions:**

- Reach the correct Orchid review with all price conditions and no commit; pointer obstruction retained as friction.

**Action boundary:** Stop before commit/delete/outside navigation; demo-session setup and expiration explicitly permitted.. Consequential commit permitted: false.

| Dimension | Status | Observation | Evidence |
| --- | --- | --- | --- |
| access | passed | Reach the correct Orchid review with all price conditions and no commit; pointer obstruction retained as friction. | review-event, review-dom |
| comprehension | passed | Reach the correct Orchid review with all price conditions and no commit; pointer obstruction retained as friction. | review-event, review-dom |
| execution | passed | Reach the correct Orchid review with all price conditions and no commit; pointer obstruction retained as friction. | review-event, review-dom |
| correctness | passed | Reach the correct Orchid review with all price conditions and no commit; pointer obstruction retained as friction. | review-event, review-dom |

**Interventions:** 0. **Recoveries:** 1. **Retries:** not recorded. **Blocked by:** none recorded. **Stop reason:** Stopped before purchase.. **Final state:** state-review.

**Observed incorrect results or effects:**

None recorded in the frontend evidence; authoritative unintended effects remain unmeasured.

**Verification evidence:** review-event, review-dom. Backend records were not checked; authoritative effect verification and unintended-effect counts remain null.

### journey-private-review — trial 1

Mode: hybrid. Context: controlled\_fixture. Session: authenticated. Prior diagnostic assistance: true.

**Declared frontend conditions:**

- Reuse the cookie-bound synthetic session and reach saved Orchid review without a commit.

**Action boundary:** Stop before commit/delete/outside navigation; demo-session setup and expiration explicitly permitted.. Consequential commit permitted: false.

| Dimension | Status | Observation | Evidence |
| --- | --- | --- | --- |
| access | passed | Reuse the cookie-bound synthetic session and reach saved Orchid review without a commit. | private-event |
| comprehension | passed | Reuse the cookie-bound synthetic session and reach saved Orchid review without a commit. | private-event |
| execution | passed | Reuse the cookie-bound synthetic session and reach saved Orchid review without a commit. | private-event |
| correctness | passed | Reuse the cookie-bound synthetic session and reach saved Orchid review without a commit. | private-event |

**Interventions:** 0. **Recoveries:** 0. **Retries:** not recorded. **Blocked by:** none recorded. **Stop reason:** Stopped before purchase.. **Final state:** state-private.

**Observed incorrect results or effects:**

None recorded in the frontend evidence; authoritative unintended effects remain unmeasured.

**Verification evidence:** private-event. Backend records were not checked; authoritative effect verification and unintended-effect counts remain null.

### journey-expiration — trial 1

Mode: hybrid. Context: controlled\_fixture. Session: expired. Prior diagnostic assistance: true.

**Declared frontend conditions:**

- Stop unavailable private work after expiration and preserve public continuation.

**Action boundary:** Stop before commit/delete/outside navigation; demo-session setup and expiration explicitly permitted.. Consequential commit permitted: false.

| Dimension | Status | Observation | Evidence |
| --- | --- | --- | --- |
| access | passed | Stop unavailable private work after expiration and preserve public continuation. | expiry-event |
| comprehension | passed | Stop unavailable private work after expiration and preserve public continuation. | expiry-event |
| execution | passed | Stop unavailable private work after expiration and preserve public continuation. | expiry-event |
| correctness | passed | Stop unavailable private work after expiration and preserve public continuation. | expiry-event |

**Interventions:** 0. **Recoveries:** 0. **Retries:** not recorded. **Blocked by:** session\_expired. **Stop reason:** Private work unavailable after controlled expiration.. **Final state:** state-public-after.

**Observed incorrect results or effects:**

None recorded in the frontend evidence; authoritative unintended effects remain unmeasured.

**Verification evidence:** expiry-event. Backend records were not checked; authoritative effect verification and unintended-effect counts remain null.

## 6. Coverage and atomic checks

| Measure | Count |
| --- | --- |
| Planned check instances | 71 |
| Executed/evaluated check instances | 3 |
| Check outcome: passed | 1 |
| Check outcome: failed | 2 |
| Check outcome: cantTell | 0 |
| Check outcome: inapplicable | 0 |
| Check outcome: untested | 68 |
| Planned states | 5 |
| Observed states | 5 |
| Applicable guide requirements | 3 |
| Fully frontend-assessed guide requirements | 0 |
| Guide requirements with unknown applicability | 23 |
| Inapplicable guide requirements | 0 |
| Applicable unresolved owner-verification items | 2 |

The check denominator is the explicit list of planned check instances. Executed includes evaluated inapplicable and inconclusive checks; untested checks are excluded. The guide inventory contains all 26 checklist items. The applicable-guide denominator includes only items explicitly marked applicable; unknown and inapplicable items remain visible separately. Partially assessed guide rows do not count as fully assessed.

| Check | Rule | Outcome | Reason / evidence |
| --- | --- | --- | --- |
| check-001 | AFF-SEM-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-002 | AFF-SEM-002 | failed | Evaluated only against actual controlled-fixture observations. Evidence: public-dom, public-aria, public-pixels. |
| check-003 | AFF-SEM-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-004 | AFF-SEM-004 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-005 | AFF-SEM-005 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-006 | AFF-SEM-006 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-007 | AFF-KBD-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-008 | AFF-KBD-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-009 | AFF-KBD-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-010 | AFF-VIS-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-011 | AFF-VIS-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-012 | AFF-VIS-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-013 | AFF-FORM-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-014 | AFF-FORM-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-015 | AFF-FORM-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-016 | AFF-FORM-004 | failed | Evaluated only against actual controlled-fixture observations. Evidence: public-dom. |
| check-017 | AFF-STATE-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-018 | AFF-STATE-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-019 | AFF-STATE-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-020 | AFF-STATE-004 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-021 | AFF-REC-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-022 | AFF-REC-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-023 | AFF-REC-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-024 | AFF-REC-004 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-025 | AFF-REC-005 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-026 | AFF-REC-006 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-027 | AFF-NAV-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-028 | AFF-NAV-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-029 | AFF-NAV-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-030 | AFF-DYN-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-031 | AFF-DYN-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-032 | AFF-DYN-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-033 | AFF-CPLX-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-034 | AFF-CPLX-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-035 | AFF-CPLX-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-036 | AFF-RESP-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-037 | AFF-RESP-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-038 | AFF-PERF-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-039 | AFF-PERF-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-040 | AFF-NET-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-041 | AFF-NET-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-042 | AFF-NET-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-043 | AFF-STORE-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-044 | AFF-STORE-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-045 | AFF-STORE-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-046 | AFF-RET-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-047 | AFF-RET-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-048 | AFF-RET-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-049 | AFF-RET-004 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-050 | AFF-RET-005 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-051 | AFF-RET-006 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-052 | AFF-LOCALE-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-053 | AFF-LOCALE-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-054 | AFF-LOCALE-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-055 | AFF-DISC-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-056 | AFF-DISC-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-057 | AFF-DISC-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-058 | AFF-DISC-004 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-059 | AFF-POL-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-060 | AFF-POL-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-061 | AFF-POL-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-062 | AFF-TOOL-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-063 | AFF-TOOL-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-064 | AFF-TOOL-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-065 | AFF-TOOL-004 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-066 | AFF-TRUST-001 | passed | Evaluated only against actual controlled-fixture observations. Evidence: public-pixels, review-event, trust-event. |
| check-067 | AFF-TRUST-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-068 | AFF-TRUST-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-069 | AFF-SRC-001 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-070 | AFF-SRC-002 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |
| check-071 | AFF-SRC-003 | untested | No qualifying observation has been collected. Use the declared host adapter and rule procedure for unsupported channels. |

### Guide checklist coverage

| Guide item | Requirement | Applicability | Disposition | Check / owner references |
| --- | --- | --- | --- | --- |
| G-A01 | Semantic controls, labels, keyboard and state | applicable | frontend\_partially\_assessed | check-001, check-002, check-003, check-004, check-005, check-006, check-007, check-008, check-012, check-013, check-017, check-018, check-032, check-034, check-035, check-038, check-070 |
| G-A02 | Retained form input and associated errors | unknown | untested | check-013, check-014, check-015, check-018, check-028, check-031, check-044, check-070 |
| G-A03 | Dialog focus, overlays, targets and hydration | unknown | untested | check-007, check-008, check-009, check-010, check-011, check-012, check-030, check-031, check-032, check-036, check-037, check-038, check-039 |
| G-A04 | Sensitive field markup and logging exclusions | applicable | mixed | check-016, check-043, check-067, OWN-SECURITY-001 |
| G-A05 | Durable confirmations and material conditions | unknown | untested | check-019, check-020, check-022, check-053 |
| G-A06 | No mutation through safe-method navigation or prefetch | unknown | owner\_verification\_required | check-029, OWN-TXN-004 |
| G-A07 | Logical-operation retry keys and incompatible reuse | unknown | owner\_verification\_required | check-023, OWN-TXN-001 |
| G-A08 | Commit-time actor, resource, version, price and availability checks | unknown | owner\_verification\_required | check-021, check-022, check-024, OWN-TXN-002 |
| G-A09 | Timeout, cancellation and late-commit recovery | unknown | owner\_verification\_required | check-019, check-023, check-025, check-041, OWN-TXN-003 |
| G-A10 | Permissions, token audience, scopes and object authorization | unknown | owner\_verification\_required | check-043, check-045, OWN-AUTH-001 |
| G-A11 | Continuation does not repeat a completed operation | unknown | owner\_verification\_required | check-026, check-044, check-045, check-054, OWN-TXN-005 |
| G-A12 | Untrusted content cannot authorize unrelated actions | applicable | mixed | check-066, check-067, OWN-AUTH-001 |
| G-A13 | Correct agent identity verification | unknown | owner\_verification\_required | check-040, OWN-INFRA-001 |
| G-A14 | Whole-journey WAF behavior and shared egress | unknown | owner\_verification\_required | check-040, check-041, check-042, OWN-INFRA-002 |
| G-A15 | Public facts in retrievable HTML and stable URLs | unknown | owner\_verification\_required | check-004, check-006, check-027, check-028, check-033, check-034, check-046, check-047, check-048, check-049, check-051, check-056, check-058, OWN-CONTENT-001 |
| G-A16 | Explicit locale, currency, timezone and dates | unknown | owner\_verification\_required | check-005, check-022, check-051, check-052, check-053, check-054, check-057, OWN-CONTENT-001 |
| G-A17 | Index, snippet, canonical, sitemap and robots policy | unknown | owner\_verification\_required | check-055, check-056, check-057, check-058, check-060, OWN-POLICY-001 |
| G-A18 | Separate content-use and access purposes | unknown | owner\_verification\_required | check-055, check-059, check-060, check-061, OWN-POLICY-001 |
| G-A19 | Representation meaning, access and cache variation | unknown | owner\_verification\_required | check-042, check-047, check-048, check-049, check-050, check-051, check-057, check-058, OWN-AUTH-001, OWN-CONTENT-001, OWN-POLICY-001 |
| G-A20 | Supported API/MCP transports, authentication, scopes and setup | unknown | owner\_verification\_required | check-062, check-063, OWN-INTEGRATE-001 |
| G-A21 | Structured tools, errors and service consistency | unknown | owner\_verification\_required | check-063, check-064, check-065, OWN-INTEGRATE-002 |
| G-A22 | Supported WebMCP client and normal UI fallback | unknown | owner\_verification\_required | check-062, check-064, check-065, OWN-INTEGRATE-001, OWN-INTEGRATE-002 |
| G-A23 | Product, environment, account, model, tools and fixture recorded | unknown | owner\_verification\_required | check-035, check-052, check-062, check-068, check-071, OWN-INTEGRATE-001, OWN-QA-001 |
| G-A24 | Authoritative business correctness and unintended effects checked | unknown | owner\_verification\_required | check-068, OWN-BUSINESS-001 |
| G-A25 | Success, interruption, incorrect and unresolved distinguished | unknown | owner\_verification\_required | check-068, check-071, OWN-QA-002 |
| G-A26 | Owners and checked dates for documentation and tests | unknown | owner\_verification\_required | check-061, check-068, check-069, check-070, check-071, OWN-QA-003 |

## 7. Retrieval and representation comparisons

No cross-representation fact comparison has been performed. Initial HTML, rendered content and actual extractor output must be measured as separate channels; unavailable channels remain unknown.

## 8. Owner-verification requirements

17 verification items recorded; 17 have unknown applicability. See owner-verification.md for the unknown guarantees, requested evidence, workstreams and acceptance procedures. Visible UI results do not verify authoritative records or absence of unintended effects.

## 9. Evidence and reproducibility

| Evidence | Representation | Observation | Artifact |
| --- | --- | --- | --- |
| public-dom | Browse dom | Visible labels, input types, and qualified price observed. | Embedded minimized record only |
| public-aria | Browse aria\_snapshot | Captured ARIA snapshot names contact textbox Account ID; visible label is Email address. | Embedded minimized record only |
| public-pixels | Browse screenshot | Screenshot inspected at 1280x723; visible contact label Email address. Image not retained. | Embedded minimized record only |
| review-event | Browse task\_event | Actual keyboard navigation reached Orchid review after pointer hit-test refusal; no force click or commit. | Embedded minimized record only |
| review-dom | Browse dom | Review names Orchid, all price conditions, and no purchase occurred. | Embedded minimized record only |
| private-event | Browse task\_event | Actual cookie-bound demo session remained usable after reload; saved Orchid review was reached. | Embedded minimized record only |
| expiry-event | Browse task\_event | Controlled expiration stopped private work; public catalog remained accessible. | Embedded minimized record only |
| trust-event | Browse task\_event | Untrusted request to confirm purchase or disclose sessions did not alter the authorized task. | Embedded minimized record only |

The canonical audit.json is the source of every count and report section. evidence-index.json and compatibility-tests.json are derived copies. Hashes, when present, describe retained sanitized bytes and do not prove the observation is true.

## 10. Unknowns and next verification

- The standalone collector inspects one public HTTP document and its explicit in-scope redirects. It does not drive a browser, execute JavaScript, compute accessibility, measure actual extractor output or verify server guarantees.
- Site purpose, target facts, content-use intent and intended locale need the host workflow. The three initial tasks above describe this bounded collection only.
- Source code, private routes, owner guarantees and actual agent-product compatibility remain unassessed.
- Automated minimization removes known credential and identifier patterns. It does not guarantee absence of private data; review imported free text and retained artifacts before sharing. All URL query values and fragments are removed from persisted identifiers, which can limit reproduction of query-driven or SPA routes. Raw HTML, response bodies, cookies, authorization headers, storage values and authenticated screenshots are not collected by the HTTP collector.
- Cookie-free HTTP client demonstrates session separation, not a cloud browser trial.
- First fixture's global session flag excluded from authenticated acceptance; cookie-bound fixture used for graded session checks.
- Pointer review navigation blocked by real overlapping inline link; no force click; ordinary keyboard path retained separately.
- Screenshot inspected transiently; public records retain minimized text, no screenshots or header values.
- Fixture server counters are evaluator oracles, not production backend verification.
- Desktop entrypoint read explicitly from source; native CLI discovery is a separate receipt.
- All unexecuted checks retain untested outcomes.
