# Package provenance and verification boundaries

## Requirements sources

The canonical package implements the supplied technical plan revision 2.0 and
the supplied website guide revision 2.0. The screenshot is the minimum file
inventory. The revised plan adds references and schemas needed to preserve its
retrieval, transaction, compatibility, and owner-verification requirements.

| Supplied file | SHA-256 |
| --- | --- |
| `ai-friendly-audit-frontend-technical-plan-2(1).md` | `71135f374af0bc7f4904703d1e6dcbd0929c06fd39d0064c75289b8273a9ac25` |
| `AI_Friendly_Website_Guide_Updated(2).md` | `556c3bff28936621a38de5660b3f2b5ca3373036698c1425de95b0c2f2330ff5` |

The guide hash matches the hash cited in the technical plan despite the
attachment filename's different numeric suffix. The original files are not
copied into the runtime package.

## Implementation decisions

- Keep a single portable `ai-friendly-audit` skill with an explicitly dispatched
  `ai-friendly-audit-frontend` module. Do not create a dependent alias skill.
- Use only `name` and `description` in portable frontmatter; retain OpenAI UI
  metadata in `agents/openai.yaml`.
- Keep the four guide goals separate and retain source maintainability as a
  conditional supporting profile.
- Keep browser, DevTools, Playwright, and computer-use adapters as host-driven
  procedures. The Node runtime implements bounded public HTTP collection and
  deterministic data processing. It does not pretend to invoke chat-only tool
  handles or supply browser authentication.
- Use draft 2020-12 JSON Schemas with offline identifier resolution. Use exact
  optional dependency versions and a lockfile. Dependencies are unnecessary for
  reading and following the skill; validated CLI commands require their stated
  schema/parser dependencies.
- Preserve material incorrect effects, unknown business outcomes, source
  provenance, unavailable capabilities, and owner verification in structured
  artifacts. Do not generate a universal site score.
- Generate the human rule view from the canonical machine catalog.
- Keep fixtures, validation tests, this provenance record, and build helpers in
  this separate development bundle.

## Targeted documentation checks

Checked on November 22, 2026. These checks inform package mechanics and selected
rule interpretation. They do not reverify every reference in the supplied guide.

| Primary source | Use |
| --- | --- |
| [Agent Skills specification](https://agentskills.io/specification) | Portable folder structure, frontmatter, progressive disclosure |
| [Ajv JSON Schema support](https://ajv.js.org/json-schema.html) | Draft 2020-12 engine and supported validation keywords |
| [Ajv schema management](https://ajv.js.org/guide/managing-schemas.html) | Offline schema registration and identifier resolution |
| [Node.js release information](https://nodejs.org/en/about/previous-releases) | Runtime support context; the tested runtime is recorded separately |
| [npm lockfile documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/) | Reproducible dependency graph |

The rule catalog contains additional source records. A source inherited from
the guide is labeled as supplied and not independently checked unless it was
actually opened during implementation. Experimental or future-effective
features keep their separate evidence basis.

## Compatibility interpretation

Package conformance, local executable tests, host skill import, and website
agent-task compatibility are separate results. Local CLI fixtures cannot
certify a Claude, ChatGPT, Cursor, Copilot, or Gemini import, an authenticated
browser adapter, or a real website's business correctness. Untested hosts and
modes stay untested in the module manifest.

All development fixture data is synthetic. Fixture reports are test artifacts,
not actual business operations or evidence of a public site's behavior.

## Reproduce the checks

Extract the canonical ZIP and development ZIP into the same parent directory.
The resulting sibling directories should be `ai-friendly-audit/` and
`development/`. Install the pinned optional helpers in the canonical directory
with `npm ci --ignore-scripts`. Run the Node test files from the development
bundle using `node --test development/tests/*.mjs` from their common parent.
When the package is elsewhere, set `AFF_PACKAGE_ROOT` to its absolute path.

`build_contracts.py` regenerates the schemas, module manifest, and initialized
contract fixture. It uses the same `AFF_PACKAGE_ROOT` override and otherwise
targets the sibling package. Run it only when deliberately rebuilding those
contracts. The rule renderer is shipped within the runtime package.
