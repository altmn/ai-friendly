# Architecture

The portable skill lives in `ai-friendly-audit/`. `SKILL.md` dispatches applicable
reference workflows. Host-driven adapters describe browser observations; the
standalone Node CLI implements bounded public HTTP collection, normalization,
offline schema validation, privacy minimization, counts, and report assembly.

`assets/rules/frontend-v1.json` is canonical for 71 rules, 17 owner templates,
and 26 guide mappings. `scripts/lib/render-rules.mjs` generates the human view.
`development/build_contracts.py` generates schemas, module metadata, and the empty
fixture. Development tests remain outside the distributable skill. The package
tool excludes dependencies and development files from runtime archives.

Keep outputs in a user-selected directory. Never mix authenticated captures into
the source tree. File-level atomic writes and a directory lock protect ordinary
output operations; they are not an OS sandbox or a multi-file transaction.

This layout follows the sibling proofreader project's separation of portable
runtime, development tooling, documentation, and community policy, without adding
a plugin manifest or live integration that this project has not tested.
