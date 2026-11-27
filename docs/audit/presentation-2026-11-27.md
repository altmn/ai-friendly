# Audience-first presentation verification

Date: November 27, 2026. Candidate branch: `codex/audience-first-github-pages`, based on public source commit `095a0d4e2c832a43d8377d7ba149c790ab7fab92`.

This change reorganizes the README, adds direct setup/lifecycle guidance and presentation conventions, and adds issue forms. The report excerpt is synthetic and illustrative. It is not a new website audit or native host trial.

## Checks performed

- `npm test`: 88 tests passed, none failed.
- `npm run check`: generated rule reference matches all 71 canonical rules.
- `python3 -m unittest discover -s development/native_acceptance -p 'test_*.py' -v`: 13 offline harness tests passed.
- `git diff --exit-code master -- ai-friendly-audit/`: no runtime differences.
- `git diff --check`: no whitespace errors.
- Local Markdown links and heading anchors resolve for README, getting-started, and presentation documents.
- GitHub's Markdown API rendered the candidate README to a temporary HTML preview for review. This is a rendering check, not an installation, account availability check, or host acceptance result.

The environment used Node.js 24.1.0 and npm 11.4.1. npm reported the existing user configuration warning about `allow-scripts`; the checks passed. No dependency installation, live skill installation, model invocation, website audit, publication, or repository setting change was performed for this presentation work.

## Preserved boundaries

The portable runtime directory, CLI helpers, schemas, rule catalog, generated rule reference, and prior evidence are unchanged. Current resource-assisted CLI/prototype status remains explicit. Browser guidance does not create a ChatGPT plugin or expand tool access. Frontend observations remain separate from backend guarantees, missing capabilities remain untested, owner checks remain distinct, and historical failures/limits remain linked from the README.
