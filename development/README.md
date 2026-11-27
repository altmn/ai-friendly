# Development and tests

Install the pinned optional helpers with the README command, then run `npm test`
from the repository root. `development/tests/` contains independent Node test
files and local synthetic HTTP fixtures. `audit-regressions.mjs` covers AUD-001
through AUD-006 and AUD-008, including every declared evidence variant and
positive/negative execution-trace controls. Native acceptance is separate.

`npm run generate` owns schemas, module metadata, the empty fixture, and the
human rule view. `package_release.py` owns the runtime manifest and local ZIPs.
Generated ZIPs and test scratch directories are ignored. Preserve historical
examples and `VERIFICATION.md`; current repair evidence lives in
`docs/audit/verification.md`. No historical result certifies changed bytes.

CI is configured for Ubuntu and pinned Node 24.22.3 using immutable action
references. Its remote execution is unverified until the workflow actually runs.
Local verification currently covers macOS/Node 24.22.3 only.
