# Platform compatibility and dated claims

Keep package loading, execution capability, and website task evidence separate. A portable file format cannot supply a browser, session, network permission, plugin, or account feature.

## Two inventories

| Inventory | Required evidence | What it does not establish |
| --- | --- | --- |
| Skill-host compatibility | Actual discovery/import, invocation, resource resolution, and available tools on named host/version | Website tasks on another product or mode |
| Website-agent compatibility | Actual task trial with agent/product/version/model, browser/provider/profile, mode, session, locale, time, and evidence | Universal compatibility or another configuration's result |

This package contains portable instructions and host adapter procedures. Treat hosts and browser modes as `not_tested` until a release or audit record provides actual supporting evidence. A local Node smoke test establishes only those exercised CLI functions. An HTTP fixture run does not establish authenticated browser operation. Documentation links are research starting points, not successful trials.

## Recording an actual configuration

Populate `assets/compatibility-test-template.yaml` from a real journey. Convert to JSON under `compatibility_tests` using `compatibility-test.schema.json`. Keep `test_id` and `journey_id` distinct and link the journey/state/evidence IDs. Include trial number, timestamps, prompt, budget, viewport, and frontend verification fields.

Record skill host and actual tested actor separately. Use `same_actor` only when that is true. An evaluator using Playwright cannot label the actor Claude, Gemini, or Perplexity because the user requested those targets. Use `not_exposed` for unavailable model/version and `unknown`/null with a reason for unknown context values.

Record conversation surface and execution location separately. A desktop conversation can control a hosted browser; a cloud conversation can operate a local browser through an approved integration. Credential handoff, browser observation, and takeover are independent capabilities.

## Host packaging checks

Use the host's current official route and verify actual discovery. Do not include host-specific dynamic shell interpolation, hooks, or subagent directives in portable frontmatter. OpenAI interface metadata stays in `agents/openai.yaml` and is not an authorization system.

| Host family | Check before advertising support |
| --- | --- |
| Codex / ChatGPT | Supported standalone or plugin route, actual skill exposure, resource paths, tools, selected browser |
| Claude Code / chat / Cowork | Actual importer/frontmatter rules, enabled account policy, files, terminal/browser exposure |
| Cursor | Documented package route and actual invocation/resource resolution |
| Copilot CLI | Documented supported location and actual invocation/tools |
| Gemini CLI | Documented discovery/permission route and actual tools |
| Other Agent Skills host | Import/discovery plus required resource and execution capabilities |

Do not treat successful ZIP extraction as successful host import. Do not install or connect an unrelated integration just to complete public audit work. A separately invocable frontend alias would require a self-contained package; no sibling-path dependency is assumed by v1.

## Product and mode distinctions

The supplied guide's product inventory is a dated research seed. Recheck relevant official documentation when a claim affects an actual recommendation or advertised compatibility. Do not copy its entire support matrix into every audit or advertise it as local testing.

| Configuration question | Required distinction |
| --- | --- |
| Local browser vs hosted browser | Different session, egress, permission, and handoff conditions |
| Public HTTP vs rendered browser | JavaScript, cache, extraction, authentication, and interaction differ |
| Native webpage tools vs a bridge | Name the exact client/browser/bridge/version and origin permissions |
| Remote MCP vs local MCP vs WebMCP | Different discovery, setup, network, auth, and execution routes |
| Documented vs observed support | Keep source claim and actual trial result as separate records |
| Experiment/upcoming policy vs current requirement | Preserve effective date, configuration conditions, and recheck trigger |

For the guide's Claude Duet example, preserve its own distinction between credential entry and browser takeover; do not import another product's takeover behavior. For its announced Microsoft policy example, preserve the supplied future effective date and recheck current official material before use. Neither example is a blanket package support claim.

Do not equate crawler identities with all interactive browser traffic. A shared egress IP does not identify one account. Native MCP compatibility does not establish webpage WebMCP support. A tool annotation does not establish server-side effect or permission enforcement.

## Source provenance

Use basis values `standard`, `platform-documented`, `engineering-recommendation`, `experimental-optional`, `unverified`, or `announced-upcoming`. These describe why a claim exists, independently from site check outcome, confidence, test context, and verification scope.

For each relevant claim retain URL, title, checked date, applicable product/mode/version, effective date where relevant, and recheck trigger. If a URL is inherited from the supplied plan without independent review, retain that fact and its supplied date; do not label it independently verified. Link actual trial evidence separately.

The attachments used for this package were reviewed as requirements on 2026-11-22:

| Artifact | Revision | SHA-256 |
| --- | --- | --- |
| Engineering an AI-Agent-Friendly Website | 2.0 | `556c3bff28936621a38de5660b3f2b5ca3373036698c1425de95b0c2f2330ff5` |
| Technical plan: ai-friendly-audit / ai-friendly-audit-frontend | 2.0 | `71135f374af0bc7f4904703d1e6dcbd0929c06fd39d0064c75289b8273a9ac25` |

The guide's uploaded filename has a different numeric suffix from the filename cited in the plan; the matching content hash establishes the requirements source. Do not claim all of the guide's vendor citations were independently reverified.

## Maintenance triggers

Recheck host import behavior, browser/tool APIs, model/runtime changes, rollout/account conditions, auth/WAF behavior, locales, alternate representations, and future policy effective dates when relevant. Preserve historical trial context rather than rewriting old records to new defaults. Assign workstreams, checked dates, and acceptance evidence; do not invent a named person's ownership.

Primary source seeds from the supplied plan:

- [Agent Skills specification](https://agentskills.io/specification)
- [OpenAI skill documentation](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Claude custom-skill creation](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Cursor skills](https://cursor.com/docs/skills)
- [Copilot CLI skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/)

Do not treat any route above as a verified current feature solely because it is linked here. Check the applicable primary source and actual runtime before making that claim.
