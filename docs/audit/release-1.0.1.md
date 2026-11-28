# Release 1.0.1 candidate verification

Date: November 27, 2026. Branch: `codex/release-1.0.1`. Starting merged source:
`eb55129439222ad97fe6ea793ed17ebbbc3d3df3`.

This candidate versions the merged README improvements for production. The
portable directory differs from the starting revision only in distribution
versions in `package.json` and `package-lock.json`. Skill instructions, rules,
schemas, CLI code, adapters, evidence semantics, and dependency identities remain
unchanged. Protocol, catalog, and collector versions remain 1.0.0.

The release packager previously hardcoded 1.0.0 in archive names and the manifest.
It now reads and validates the portable package's stable semantic version. The
new regression uses a synthetic 2.3.4 package: it fails against the starting
packager, passes with the candidate, checks deterministic archive identities,
and rejects an unsafe version before archive creation.

## Checks

- Node.js 24.1.0 and npm 11.4.1; the supported Node range is >=22.15.0 <25.
- `npm ci --prefix ai-friendly-audit --ignore-scripts --no-audit --no-fund`:
  pinned dependencies installed without lifecycle scripts.
- `npm run generate`: 13 schemas, module metadata, empty fixture, and 71-rule
  reference synchronized; no contract or runtime-code differences introduced.
- `npm test`: 89 tests passed, including the new release regression.
- `npm run check`: generated reference matches all 71 rules.
- Offline native-harness unit tests: 13 passed.
- Both ZIP files passed CRC, safe unique path, license/notice, excluded dependency,
  and version checks. The 45 runtime entries match the generated manifest's
  byte counts and SHA-256 digests. The development ZIP has 53 entries and includes
  the manifest and packaging regression.
- `git diff --check`: no whitespace errors.

## Existing installation baseline

The known user skill roots contain one standalone AI-friendly installation in
Codex. All 45 source-owned installed files match the starting merged runtime;
there are no source-owned local modifications to reconcile. A fresh read-only
Codex 0.170.0 app-server `skills/list` reload discovers exactly one enabled user
skill at that existing path, with no discovery errors. No existing copy was
found in the corresponding Agents or Claude skill roots.

This record covers the source candidate and pre-update discovery. Publication,
download integrity, and the existing installation update must be checked against
the clean merged revision during release execution. Discovery is not behavioral
acceptance; prior support and native-trial limitations remain unchanged.
