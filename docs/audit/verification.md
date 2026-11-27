# Audit repair verification

Verified November 26, 2026 on `codex/audit-fixes-mit`, based on commit
`c2cc80e089d56f06d44b267bbd6c65c1c872b2a3`. These are uncommitted worktree
changes; [verification.json](verification.json) records candidate hashes.

**79 tests passed, zero failed or skipped**, including **31 new regression cases**,
on Node 24.22.3/macOS arm64. Final run: 5.785 seconds.
See [final output](test-run-3.txt). Historical passes do not certify changed bytes.

| Finding | Repair and verification | Status |
| --- | --- | --- |
| AUD-001 | Required channels come from the target state/context. Other-state semantic evidence is rejected; a coherent control passes. | Resolved locally |
| AUD-002 | Evaluated checks require applicable mapped guide rows and linked checks. Contradictory owner exclusions fail; unknown obligations stay counted. Conditional exclusions require a reviewed reason and resolvable evidence and appear in owner reports. | Resolved locally |
| AUD-003 | Directory validation identifies missing derived files; standalone canonical-file validation remains supported. | Resolved locally |
| AUD-004 | Body/redirect failures retain bounded observed HTTP metadata and Retry-After. Compressed 429 retains its barrier without body/cookies or static passes. Existing redirect, timeout, and byte-budget tests pass. | Resolved locally |
| AUD-005 | Twenty rules declare scoped variants. Each variant has positive, missing-review, and applicable missing-capability controls. Full procedures remain default; reports display adaptations and limits. | Resolved locally |
| AUD-006 | Duplicate keys, including escaped nested duplicates, fail before normalization. Ordinary nested objects and escaped strings pass. | Resolved locally |
| AUD-007 | README and known issues advertise CLI/prototype support. Native discovery/import, authenticated browser acceptance, and comparative trials remain unrun. | Open for full release |
| AUD-008 | Static declarations/snapshots cannot replace typed authorized invocation/transition traces. Positive traces pass; absent, unauthorized, and unresolved traces fail. | Resolved locally |

Schemas compile offline in the suite. The generated human view matches all 71
rules. Both ZIP archives pass CRC checks, include MIT licenses, and exclude
dependencies. All 43 runtime manifest hashes match. Whitespace checks pass.
CI uses verified immutable official action references and read-only repository
permission; remote CI/Linux execution has not run.

The first run had 78 passes and one failure because the new tool positive fixture
omitted its declaration. After fixing that fixture, [run 2](test-run-2.txt) passed
79/79. A final run after conditional-owner refinements also passed 79/79. The
structured record retains all three attempts.

MIT licensing and notices are included in runtime and development archives.
Contributor, security, privacy, architecture, release, and support documents use
the sibling proofreader project's organization while preserving this project's
own portable runtime boundary.

No commit, push, merge, live installation, publication, native host trial, or paid
model run occurred. Full first-release readiness remains blocked by AUD-007.
Source review and synthetic checks do not establish factual evidence truth,
complete privacy, native browser operation, or universal website compatibility.
