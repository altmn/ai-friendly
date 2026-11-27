# GitHub maintenance

The public source repository is [altmn/ai-friendly](https://github.com/altmn/ai-friendly),
licensed under MIT. Its initial public snapshot was prepared on November 26,
2026. Earlier local commits, branches, tags and Git metadata are not part of the
public Git history. Historical audit receipts retain their original source
identities and limitations; those private commit IDs do not resolve in a public
clone. The runtime and its recorded native acceptance evidence are unchanged
by publication.

Repository settings follow the maintainer's public `english-proofreader-pro`
and `skill-builder` repositories, with the current CI job as the required check:

- `master` is the default branch. Use a new feature branch and a pull request.
- Squash and rebase merges are enabled; merge commits are disabled. Merged
  branches are deleted automatically. Automatic merging is disabled.
- The default branch requires signed commits, linear history, resolved review
  conversations, and an up-to-date passing `verify` check from GitHub Actions.
  Pull requests require zero approvals, matching the reference repositories.
  Branch deletion and force pushes are blocked, with no bypass actors.
- Tags matching `v*` cannot be updated or deleted. Publication creates no
  version tag, downloadable release, registry package or live installation.
- Actions use read-only workflow tokens and cannot approve pull requests.
  Third-party actions must use full commit SHAs.
- Issues and Projects are enabled; Wiki and Discussions are disabled.
- Private vulnerability reporting, dependency alerts and automated security
  updates, secret scanning and push protection are enabled.

The offline workflow checks contracts, regressions, generated-file drift and
packaging. It does not run native models or browser sessions. Claude execution
remains blocked, and the remaining AUD-007 limitations in the audit reports
remain open. Repository publication does not expand the support tier beyond
resource-assisted CLI/prototype.

See [release preparation](releasing.md), [contributing](../CONTRIBUTING.md),
[security reporting](../SECURITY.md) and [the current audit](audit/report.md).
