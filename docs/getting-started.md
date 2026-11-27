# Install and manage AI-friendly

For assistance without starting at a terminal, use the [README setup prompts](../README.md#get-started). This guide provides the direct route and optional CLI commands.

## Use the portable skill

1. Choose the agent, user/project installation scope, and reviewed source revision.
2. Use that host's supported skill mechanism to install the complete [`ai-friendly-audit/`](../ai-friendly-audit/SKILL.md) directory. Keep its references, scripts, schemas, and catalog together; do not copy only `SKILL.md`.
3. Check the host's selector in a new session if needed. In Codex, invoke `$ai-friendly-audit` or choose the installed skill. ChatGPT uses `@` for available installed plugins/skills, but this source tree does not supply a published ChatGPT plugin or universal browser installation.
4. Ask for a small public audit and record which retrieval, browser, and local tools are available. A missing tool leaves the affected checks untested; installation does not create those capabilities.

Review the [platform compatibility reference](../ai-friendly-audit/references/platform-compatibility.md) and the relevant adapter instructions. The current support tier remains resource-assisted CLI/prototype; see [native acceptance](audit/native-acceptance.md) for bounded evidence and limits.

## Use the optional CLI

Use Node.js **>=22.15.0 <25**. Python 3.10+ is for development generators, not ordinary CLI use. From the repository root:

```sh
npm ci --prefix ai-friendly-audit --ignore-scripts --no-audit --no-fund
node ai-friendly-audit/scripts/audit.mjs capabilities
node ai-friendly-audit/scripts/audit.mjs init --url https://example.com/ --out audit-output/example
node ai-friendly-audit/scripts/audit.mjs validate --input audit-output/example
```

Dependency setup writes only the local package's `node_modules`. `init` records scope without accessing the website. Use a new output path; existing outputs are not overwritten without `--overwrite`.

For an explicitly authorized public page, inspect the proposed URL and scope, then collect:

```sh
node ai-friendly-audit/scripts/audit.mjs collect --url https://example.com/ --out audit-output/public
```

Replace the example URL with the public page in scope. Collection performs bounded GET requests to the specified origin and permitted redirects. It does not crawl, attach a browser session, or prove backend effects.

Outputs include `audit.json`, a human report, evidence index, remediation plan, owner follow-up, and compatibility records. File validation checks one canonical record; directory validation requires every derived deliverable. See the [skill entrypoint and command overview](../ai-friendly-audit/SKILL.md) for the runtime workflow and commands.

## Update or remove

For a manually installed skill, preserve local changes and audit outputs, review the replacement source, and update the complete runtime directory through the same host mechanism. Refresh discovery and try a small task in a fresh session. Remove the manually copied skill through that host's supported route, keeping unrelated files and your reports.

For a CLI checkout, review the desired source revision and preserve local changes before updating. Refresh the local dependencies when the lockfile changes. CLI use creates no daemon or account integration; remove only the checkout/dependencies you own, keeping wanted audit outputs.

There is no automatic updater or universal account removal command. Use [maintenance prompts](../README.md#update-or-remove) for help identifying the right route.

## Develop the project

Run the checks documented in [CONTRIBUTING](../CONTRIBUTING.md):

```sh
npm test
npm run check
python3 -m unittest discover -s development/native_acceptance -p 'test_*.py' -v
```

After canonical schema or catalog changes, run `npm run generate` and review the generated files. Ordinary installation does not require altering the generators, runtime catalog, or evidence records. See [architecture](architecture.md) and [release preparation](releasing.md).
