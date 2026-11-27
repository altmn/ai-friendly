# Frontend remediation plan

Run: run-82d79f99-aed7-4096-a124-6ab6eaefdb0a. Checked: 2026-11-26T21:53:36.970Z.

## Verified frontend fixes

### 1. Sensitive fields declare suitable type and purpose

Severity: low. Workstream: frontend. Evidence: public-dom.

**Reason:** Seeded controlled-fixture markup issue; no production finding is implied.

**Change:** Use appropriate native input types and autocomplete purposes and review secret-handling channels separately.

**Acceptance evidence:** Inspect markup in each reachable authentication step. Use synthetic credentials only in a controlled leakage fixture.

**Review trigger:** Fixture or adapter changes.

**Source location:** Not established; use component/behavior guidance.

### 2. Accessible name contains the visible label

Severity: low. Workstream: frontend. Evidence: public-dom, public-aria, public-pixels.

**Reason:** Seeded controlled-fixture markup issue; no production finding is implied.

**Change:** Align naming with the visible label and retain useful distinguishing context.

**Acceptance evidence:** Recheck the visible text and computed name together after the change.

**Review trigger:** Fixture or adapter changes.

**Source location:** Not established; use component/behavior guidance.

## Investigation leads

No separate low-confidence leads are recorded.

## Owner verification and optional work

See owner-verification.md for unverified whole-website guarantees. Conditional features such as WebMCP, alternate Markdown and llms.txt require a demonstrated use case; their absence is not a baseline defect. Effort estimates and named owners are omitted when source or organizational evidence is unavailable.
