# Verification results — version 1.0.0

**Checked:** November 22, 2026, America/Los_Angeles. Recorded runtime timestamps
use UTC. **Runtime tested:** Node.js 24.22.3 and npm 11.19.1 on Linux.

## Automated result

**48 tests passed; 0 failed; 0 skipped.** The final complete run took about
9.18 seconds. See `final-test-run.txt` for exact test names and results.

| Suite | Tests | Scope |
| --- | ---: | --- |
| Runtime integration and boundary tests | 30 | Actual local HTTP fixtures, CLI commands, normalization, privacy, URLs, redirects, report/reference/count integrity, write protection |
| Schema invariants | 8 | Offline schema compilation, backend/unknown-effect boundaries, evidence requirements, preserved material errors, artifact paths |
| HTML interpretation boundaries | 5 | Real document metadata, script/template/SVG counterexamples, language scope, synthetic-secret redaction, decoding uncertainty |
| Trial and report integrity | 5 | Valid frontend trials, mode-specific evidence, companion consistency, material errors despite recovery, complete human-readable fact/trial detail |

Run all suites with `node --test development/tests/*.mjs` from the parent of
the sibling runtime and development directories. Set `AFF_PACKAGE_ROOT` when
the canonical package is stored elsewhere. Install its pinned optional helpers
with `npm ci --ignore-scripts` before running the executable tests.

## Package and contract checks

- The initialized skill passes the skill-creator frontmatter validator.
- The root file has 181 lines and a 172-character portable description.
- Every local Markdown link and module/schema resource reference resolves.
- All 13 draft 2020-12 schemas compile with offline reference resolution.
- The rule catalog validates against its schema.
- The catalog has 71 unique frontend rules across all 20 AFF groups, 17
  separate owner-requirement templates, and a crosswalk for all 26 guide
  checklist items.
- The generated human rule view exactly matches the canonical catalog;
  `node scripts/lib/render-rules.mjs --check` passes.
- The compatibility YAML example validates against its schema and remains
  explicitly unexecuted, with no claimed successful task or backend check.
- The lockfile uses version 3, pins all three direct optional dependencies,
  and records integrity values for all eight resolved dependency packages.
- Browser automation packages and browser downloads are not runtime dependencies.
- A clean archive extraction passed capabilities/catalog commands, pinned dependency
  installation, initialization, full validation, and report regeneration.
- The supplied-evidence example and retained artifact hashes pass directory validation.

## Independent review

An independent reviewer reproduced eight concrete defects during development.
Each was corrected, and the reviewer reran the original cases against the final
implementation with a successful exit result:

1. Sensitive-pattern values under arbitrary nested metadata keys are redacted.
2. Report generation refuses a retained path that redaction would invalidate.
3. Public-address classification no longer excludes unrelated public ranges.
4. Full guide coverage cannot omit unresolved mapped check instances.
5. Available capabilities cannot replace the required evidence for a check.
6. Declared target scope must agree with observed state origins.
7. Concurrent writers cannot silently replace or mix output bundles.
8. Malformed redirects produce classified partial reports instead of losing
   the limitations report.

The review used local synthetic data and in-memory mocks. No live site mutation,
real credentials, or production browser session was involved.

## Supplied-evidence exercise

A separate agent used the actual skill and a supplied synthetic pricing page
without browser/network access. The exercise preserved amount, currency,
billing interval, account eligibility, quota, overage, taxes, and future
effective date. It kept owner discovery intent unknown, treated hostile page
instructions as untrusted content, and did not invent an extractor run, browser
trial, or backend verification.

The resulting report is included under `examples/supplied-review/` if present.
It is a synthetic illustration of the supplied-evidence procedure, not a live
website assessment. Formal response-level checks remain unresolved where the
snapshot does not establish the required response provenance.

## Practical limits

The declared Node range is `>=22.15.0 <25`; this build was executed on 24.22.3.
Other supported-range versions were not separately run. Host import/discovery,
authenticated browser adapters, and actual website-agent compatibility across
products remain untested in this build. The module manifest records those
limits rather than advertising unobserved support.

The bundled collector performs one explicit public HTTP document inspection
and permitted redirects. Rich browser, keyboard, screenshot, network, storage,
and actual extractor workflows are host-driven procedures. They are not
silently supplied by the Node CLI.

Schema validity and passing fixtures establish the recorded implementation
checks. They do not establish the truth of arbitrary imported evidence, complete
privacy detection, WCAG conformance, a whole-site audit, or business correctness.

The runtime archive contains only canonical runtime files. This development
bundle contains reproducible tests, fixtures, generation helpers, provenance,
and the runtime file-hash manifest.
