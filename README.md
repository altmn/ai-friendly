# AI-friendly

A portable skill and optional Node.js CLI for evidence-linked website audits.
It reviews public retrieval, browser operability, discovery signals, optional
frontend tools, and supplied source. Frontend observations stay separate from
backend, security, and business guarantees. Licensed under [MIT](LICENSE).

Source and issues: [altmn/ai-friendly](https://github.com/altmn/ai-friendly).
See [GitHub maintenance](docs/github.md) for repository settings and the public
history boundary.

**Current support tier: resource-assisted CLI/prototype.** The deterministic
CLI and synthetic contracts are tested. Native Codex CLI discovery and restricted
audits, plus a limited Chrome demo-session browser pilot, have been exercised.
Claude catalog discovery succeeded, but execution is blocked by invalid OAuth.
Native same-thread retention/compaction, a clean no-skill comparison and actual
external extraction now have [qualified evidence](docs/audit/nonclaude-followup.md).
The [field-name/max repair](docs/audit/source-max-repair.md) retains paired names
and passed 12/12 focused source trials at max within the unchanged 180-second
budget. Broader reliability, full-audit max budgets and real cloud-browser
execution remain unverified. See the
[native acceptance results](docs/audit/native-acceptance.md).
No universal accessibility certification or agent compatibility is claimed.
See [verification](docs/audit/verification.md) and [known issues](KNOWN_ISSUES.md).

## Quick start

Use Node >=22.15.0 <25 and Python 3.10+ for development generators.
From the repository root:

```sh
npm ci --prefix ai-friendly-audit --ignore-scripts --no-audit --no-fund
node ai-friendly-audit/scripts/audit.mjs capabilities
node ai-friendly-audit/scripts/audit.mjs init --url https://example.com/ --out audit-output/example
node ai-friendly-audit/scripts/audit.mjs validate --input audit-output/example
npm test
```

Dependency setup writes only the local package's `node_modules`. `init` records
scope without accessing a website. For an explicitly authorized public page:

```sh
node ai-friendly-audit/scripts/audit.mjs collect --url https://example.com/ --out audit-output/public
```

Collection performs bounded GET requests to the specified origin and permitted
redirects. It does not crawl or attach browser sessions. Inspect proposed URLs
and the action scope first. Outputs include canonical `audit.json`, a human
report, evidence index, remediation plan, owner follow-up, and compatibility
records. File validation checks one canonical record; directory validation
requires every derived deliverable. Existing output files are not overwritten
without `--overwrite`.

For host-driven use, select the skill directory
[`ai-friendly-audit/`](ai-friendly-audit/SKILL.md) through your host's supported
skill mechanism. No live installation or host support is implied by this source
tree. Review the adapter instructions and record actual capabilities; missing
tools leave affected work untested. Remove a manually copied skill through the
same host mechanism; CLI use creates no daemon or account integration.

## Repository

- `ai-friendly-audit/`: independently portable runtime skill, schemas, catalog,
  workflows, and optional CLI; no development tooling is required at runtime.
- `development/`: schema generator, deterministic test suite, synthetic fixtures,
  historical verification examples, and package tooling.
- `docs/`: architecture, evidence contracts, release procedure, and audit results.
- Root guide and technical plan: supplied design baselines; their source hashes
  are retained in the runtime provenance.

See [architecture](docs/architecture.md), [contributing](CONTRIBUTING.md),
[security](SECURITY.md), [privacy](PRIVACY.md), [support](SUPPORT.md), and
[third-party notices](NOTICE.md). Repository structure and community-document
conventions were informed by the sibling English Proofreader Pro project;
this project retains its own portable runtime boundary.
