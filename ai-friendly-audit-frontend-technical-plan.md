# Technical plan: ai-friendly-audit / ai-friendly-audit-frontend

**Research date:** November 22, 2026  
**Plan revision:** 2.0 — reconciled with the supplied updated guide.  
**Document status:** Proposed implementation specification; no skill has been installed or audit executed.  
**Initial release:** One portable `ai-friendly-audit` skill with an explicitly dispatched `ai-friendly-audit-frontend` module.

## 1. Recommendation and scope

Build an evidence-driven frontend audit with a portable instruction package, capability-based collection, and a consistent reporting contract. Assess the guide's four goals separately: **Retrieve**, **Operate**, **Discover and cite**, and **Integrate**. Choose emphasis from the website's purpose and the user's tasks. For interaction, establish whether an agent can understand the interface, choose appropriate actions, recognize frontend results, and recover from errors. For information, establish whether the facts and their material qualifications reach the tested agent intact. [G0, Executive summary]

The audit should accept a public URL without requiring a repository, backend access, an application-specific integration, or a new service. When the browser available to the skill already has a usable authenticated session, include the routes that account can legitimately reach. Otherwise, finish the public audit.

Treat compatibility as three independently testable properties:

1. **Package compatibility:** the host can discover and load the skill and its resources.
2. **Execution compatibility:** the host exposes some usable combination of browser, computer-use, terminal, network, and file capabilities.
3. **Evidence compatibility:** collected observations can be represented in the shared schemas and interpreted without overstating their scope.

A portable `SKILL.md` cannot supply a browser, permission, credentials, network access, or a local authenticated session. The plan therefore supports a complete browser audit where available and useful partial audits elsewhere.

This revision incorporates the complete supplied **Engineering an AI-Agent-Friendly Website**, revision **2.0**, research checked **November 22, 2026**, from the attachment named `AI_Friendly_Website_Guide_Updated(1).md`. Its SHA-256 is `556c3bff28936621a38de5660b3f2b5ca3373036698c1425de95b0c2f2330ff5`. The first plan was prepared before that attachment was available. Sections 1.3–1.4 below now map all 12 guide sections, all three appendices, and all 26 Appendix A checklist items to this module.

The guide covers whole-website engineering, including server and infrastructure guarantees. This module implements its **frontend-observable requirements** and preserves relevant owner-only requirements in a verification register. A visible confirmation, idempotency header, tool annotation, or successful response cannot establish server correctness. This adaptation preserves the user's frontend-only requirement. [G0, §§2–5, 11; Appendix B]

### 1.1 Product decisions

| Decision | Recommended implementation |
| --- | --- |
| Primary audience | Agents retrieving information and operating websites, with emphasis selected by site purpose |
| Supporting assessments | Discovery/citation signals, optional frontend tools, and supplied-source maintainability |
| Default input | One starting URL; infer representative tasks from the site if none are provided |
| Default authorization | Ordinary reading and safe UI exploration within the requested application |
| Authentication | Reuse a usable, already-authorized session; public-only when none is available |
| Backend dependency | None; observe ordinary frontend requests without requiring server access |
| Framework support | Framework-independent baseline, with optional framework-specific source guidance |
| Initial architecture | One skill, one frontend module, optional collectors, shared evidence schemas |
| Reporting | Separate goal results, findings, evidence, guide coverage, owner-verification items, prioritized fixes |
| Overall score | No invented universal 0–100 AI-friendliness score in v1 |
| Cloud behavior | Detect capabilities and continue at the best supported level |
| Future modules | Add through the same module contract; do not claim unimplemented modules are available |

### 1.2 Requirements traceability

| ID | Requirement | Design response | Release evidence |
| --- | --- | --- | --- |
| R01 | Audit a public website from a URL | Browser and static modes; no repository prerequisite | Public static site and dynamic app pilots |
| R02 | Inspect screenshots | Visual state capture and analysis, with privacy controls | Occlusion, focus, responsive, and canvas fixtures |
| R03 | Inspect frontend code/source | Delivered assets, served maps when available, optional supplied repository | Minified-only and original-source fixtures |
| R04 | Inspect network activity | Observe ordinary browser requests; capture minimal metadata | Failed-resource, polling, and service-worker fixtures |
| R05 | Inspect browser storage | Origin-scoped metadata and necessary redacted observations | Cookies, local/session storage, IndexedDB, cache fixtures |
| R06 | Include authenticated areas when available | Session-aware route/state matrix | Existing-session and expiration cases |
| R07 | Public-only when unauthenticated | No mandatory login; public fallback | Logged-out and cloud-isolated cases |
| R08 | Work locally with broad tools | Host browser, DevTools, Playwright/CDP, terminal adapters | Actual desktop/CLI runs |
| R09 | Do useful work in cloud chat | Browser-only, fetch-only, and supplied-evidence modes | Actual reduced-capability runs |
| R10 | Compatible with Claude and others | Portable frontmatter, resource paths, schemas, host packaging | Target importer and runtime checks |
| R11 | Explain what must improve | Evidence-linked remediation and verification steps | Reviewer can reproduce and verify a sample |
| R12 | Comprehensive frontend scope | Complete category matrix within a declared representative sample | No silently omitted category; explicit coverage gaps |
| R13 | Implement the supplied updated guide | Whole-guide crosswalk and atomic checklist mapping | Every applicable requirement has a frontend check or explicit owner-verification disposition |
| R14 | Distinguish client evidence from business guarantees | Verification layers, nullable unobserved effects, owner register | No server correctness claim derived from frontend evidence alone |
| R15 | Test the actual product, mode, and task | Separate skill-host and website-agent compatibility matrices | Each advertised compatibility claim links to an actual trial |

### 1.3 Whole-guide crosswalk

The mappings below are implementation requirements for the skill. Guide references use `G0`; its internal source IDs remain separate from this plan's `S1…` register.

| Guide section | Required treatment in this frontend module | Evidence or scope boundary |
| --- | --- | --- |
| Executive summary | Separate Retrieve, Operate, Discover and cite, Integrate; prioritize by site purpose | Plan §2; no single universal score |
| §1 Interface semantics | Native controls, names, state, keyboard journeys, target exceptions, hydration and sensitive-input metadata | Direct frontend checks; fake secrets only in controlled fixtures |
| §2 Transactions and recovery | Durable status, review/commit distinction, unknown outcomes, cancellation wording, preserved context | Frontend checks plus owner verification of deduplication, versions, authorization and actual effects |
| §3 Identity and untrusted content | Keep agent traffic identity, user session and action authority separate; respect content trust boundaries | No credential extraction, object-level authorization testing or inference of server enforcement |
| §4 CDN/WAF access | Observe the actual route and complete sampled journey, including failing subrequests | Record barriers; infrastructure rules, logs and identity validation require owner evidence |
| §5 APIs and tools | Inspect exposed documentation/declarations, optional WebMCP, errors and ordinary UI fallback | No required API, MCP server, connector installation or backend interoperability audit |
| §6 Retrieval | Initial HTML → rendered content → actual extractor output; facts, qualifiers, locale, truncation and freshness | Missing representations remain untested; no assumed universal extractor behavior |
| §7 Discovery and content-use policy | Separate crawling/index/snippet signals and search/training/grounding/user-fetch/browser policies | Preserve owner intent; eligibility does not prove indexing or citations |
| §8 Interpretation and attribution | Self-contained facts, units, dates, terms, sources, structured-data and sharing-metadata agreement | Visible consistency can be checked; external authoritative truth or private feeds may require owner verification |
| §9 Optional representations | Assess offered Markdown or `llms.txt` against a named client, fallback and consistency test | Absence alone is not a baseline defect |
| §10 Product + mode + task | Maintain dated target-agent records distinct from skill-host packaging | Documented support and observed local success are different evidence |
| §11 Testing and measurement | Separate access, comprehension, execution and correctness; preserve incorrect and unresolved outcomes | Adapt business verification to the frontend boundary; no invented database checks |
| §12 Priorities and ownership | Site-dependent ordering, responsible workstream, acceptance evidence and review triggers | Guide's 30-day website schedule is not an estimate for building this skill |
| Appendix A | Map every checklist item to proposed rule groups and/or owner verification | See §1.4; applicability assessed per site |
| Appendix B | Adapt the compatibility-test record with explicit frontend verification | `backend_record_checked: false`; unknown business effects remain null |
| Appendix C | Use the dated source register as research input | Recheck volatile claims before use; do not claim all guide citations were independently reverified |

### 1.4 Appendix A checklist traceability

Assign stable IDs in checklist order. Rule-group IDs below are proposed catalog namespaces, not a claim that code or tests already exist. An item may need both a frontend check and owner verification. The latter must not disappear when its frontend portion passes.

| ID | Guide checklist subject | Planned rules or verification |
| --- | --- | --- |
| G-A01 | Semantic controls, labels, keyboard and state | AFF-SEM, AFF-KBD, AFF-STATE |
| G-A02 | Retained form input and associated errors | AFF-FORM, AFF-REC |
| G-A03 | Dialog focus, overlays, targets and slow hydration | AFF-KBD, AFF-VIS, AFF-DYN |
| G-A04 | Sensitive field markup and exclusion from logs/traces | AFF-FORM, AFF-TRUST for available client channels; OWN-SECURITY for server, analytics and diagnostic logging outside frontend visibility |
| G-A05 | Durable confirmations and material conditions | AFF-STATE, AFF-REC, AFF-LOCALE; business truth remains unverified |
| G-A06 | No mutation through safe-method navigation/prefetch | AFF-NAV indicators; OWN-TXN enforcement check; never activate suspect links to test them |
| G-A07 | Logical-operation retry keys and incompatible reuse | AFF-REC indicators; OWN-TXN deduplication verification |
| G-A08 | Commit-time actor/resource/version/price/availability checks | AFF-REC review/conflict UI; OWN-TXN and OWN-AUTH |
| G-A09 | Timeout, cancellation and late-commit recovery | AFF-REC visible states; controlled fixtures; OWN-TXN real effects |
| G-A10 | Permissions, token audience/scopes and object authorization | AFF-STATE visible context/errors; OWN-AUTH |
| G-A11 | Continuation does not repeat a completed operation | AFF-REC context/status UI; OWN-TXN cross-device enforcement |
| G-A12 | Untrusted content cannot authorize unrelated actions | AFF-TRUST auditor boundary; owner verification of application enforcement |
| G-A13 | Agent identities verified correctly | AFF-NET observed route; OWN-INFRA identity validation |
| G-A14 | Whole-journey WAF behavior and shared egress | AFF-NET observed access; OWN-INFRA configuration/logs |
| G-A15 | Public facts in retrievable HTML and stable URLs | AFF-RET, AFF-NAV |
| G-A16 | Explicit locale, currency, timezone and dates | AFF-LOCALE, AFF-RET |
| G-A17 | Index/snippet/canonical/sitemap/robots policy | AFF-DISC, AFF-POL |
| G-A18 | Separate content-use and access purposes | AFF-POL; OWN-POLICY when intended policy is unknown |
| G-A19 | Representation meaning, access and cache variation | AFF-RET, AFF-NET; OWN-AUTH for comprehensive access enforcement |
| G-A20 | Supported API/MCP transports, auth, scopes and setup | AFF-TOOL visible documentation; OWN-INTEGRATE actual interoperability |
| G-A21 | Structured tools/errors and common authoritative service | AFF-TOOL observed schemas/results; OWN-INTEGRATE service parity |
| G-A22 | Supported WebMCP browser and normal UI fallback | AFF-TOOL; optional-feature applicability |
| G-A23 | Product/version/environment/account/model/tools/fixture recorded | Compatibility schema and trial manifest |
| G-A24 | Backend correctness and unintended effects checked | OWN-BUSINESS; explicitly not assessed by this module |
| G-A25 | Success, interruption, incorrect and unresolved distinguished | Journey schema and report aggregation |
| G-A26 | Owners and checked dates for docs/tests | Source/compatibility registry and maintenance gates |

## 2. Define AI friendliness precisely

Use four guide-aligned profiles and one conditional supporting assessment. Keep their findings and conclusions separate.

| Guide goal / profile | Question | Evidence | Default treatment |
| --- | --- | --- | --- |
| Retrieve / `public-retrieval` | Do complete public facts reach the tested agent accurately? | Initial HTML, rendered text, actual extracts, tables/links, qualifiers, locale and freshness indicators | Core where public information matters |
| Operate / `browser-operability` | Can an agent perceive, understand, operate and verify the frontend task? | Pixels, DOM, accessibility, task traces, visible status/recovery | Core where interactive tasks matter; ordinary navigation still applies to content sites |
| Discover and cite / `discovery-and-citation` | Are observable discovery and attribution signals consistent with the site's intent? | Links, canonical/sitemap, crawl/index/snippet directives, metadata and visible-content agreement | Assess applicable public signals; no indexing, ranking or citation guarantee |
| Integrate / `frontend-tools` | Are offered frontend tools understandable and usable in the tested client? | Browser-exposed declarations, schemas, safe results, UI agreement and fallback | Conditional; server/API/MCP guarantees go to owner verification |
| Supporting / `source-maintainability` | Can a coding agent understand and safely change the frontend implementation? | Original source, project instructions, tests, component boundaries and build configuration | Only with adequate legitimately available source |

For **information-heavy sites**, prioritize retrieval fidelity, clear qualifications, locale, freshness and discovery signals. For **transaction-heavy sites**, prioritize control semantics, review/commit clarity, lifecycle state, session context, access and recovery. For **mixed sites**, sample both. Start with the three highest-value tasks inferred from the site or supplied by the user, expanding within budget. A site need not offer transactions or agent tools to be useful to AI agents. [G0, Executive summary; §§11.3, 12.1]

Retrieval and discovery must not share a verdict. A retrievable page can be intentionally excluded from search; a search-eligible page can produce an incomplete extract. Source maintainability is additional engineering evidence and does not substitute for any of the guide's four goals.

Within browser operability, distinguish **visual**, **semantic/DOM**, **keyboard**, and **hybrid** interaction modes. Record which mode was actually exercised. A control might be visually obvious but have no usable accessible name; another might have a correct name but an ambiguous icon. A successful visual workaround does not erase a semantic limitation.

Accessibility is valuable evidence, but accessibility compliance and agent task success are different assessments. W3C states that automated tools alone cannot determine accessibility conformance. Use relevant WCAG checks without representing the resulting audit as a full WCAG certification. [S8, S9]

### 2.1 What frontend-only means

In scope:

- Rendered pages, navigation, component states, forms, keyboard/pointer behavior, screenshots, and browser-visible results.
- HTML, CSS, JavaScript, WASM metadata, publicly delivered assets, and legitimately accessible source maps.
- Browser-observed requests, responses where necessary, console errors, performance observations, service workers, and storage.
- Client-side WebMCP tool declarations and safely observable behavior when supported.
- Original frontend source explicitly supplied by the user, including relevant local instructions and tests.

No backend source, database, server shell, cloud administration, internal API documentation, or service credentials are required. The application can continue to make its ordinary backend requests. Observing an HTTP error and the resulting broken UI supports a frontend finding; it usually does not establish which backend component caused the error.

Every requirement must declare its `evidence_scope`:

| Value | What this module can conclude | Example |
| --- | --- | --- |
| `frontend_verifiable` | The stated frontend expectation is supported or contradicted in the sampled state | A review page shows amount, currency and timezone |
| `frontend_indicator` | An observed client feature suggests a mechanism, with enforcement unverified | A naturally observed request has an operation key or version precondition |
| `owner_verification_required` | Relevant evidence needs an owner, authoritative records or a different audit module | Exactly one correct booking exists; current permissions were enforced at commit |

Keep `test_context` separate: `live`, `controlled_fixture`, or `supplied_evidence`. A simulated stale quote or lost response can validate the auditor and a frontend state; it cannot prove that a live application's server handles the same case.

For an applicable owner-only requirement, create a verification item with the guide reference, observed indicators, unknown guarantee, risk if absent, responsible workstream, required evidence and acceptance procedure. Do not mark it passed, failed or inapplicable solely because backend access is unavailable. For example, a checkout may have a directly verified review screen while deduplication and commit-time price validation remain unverified. [G0, §§2.2–2.5, 11.3–11.4]

For a publicly reachable application, the skill must not invent the contents of its private repository. Minified production bundles are not sufficient evidence about source modularity, type quality, test coverage, or developer documentation. Source maps can connect compiled assets to authored files when available, but absent maps are an evidence limitation rather than a defect. [S16]

### 2.2 What “comprehensive” means

Define it as **coverage of all audit categories across a declared, representative set of routes, states, tasks, sessions, and viewports**. Do not promise exhaustive exploration of an arbitrary site's potentially unbounded state space.

Report both what was planned and what was observed. “18 of 20 planned route-state samples evaluated” is meaningful; “90% of the application audited” is usually unsupported. Use WCAG-EM's scope, exploration, representative sampling, complete-process, and reporting approach as methodological guidance, without presenting it as an AI standard. [S10]

Report two coverage denominators: **planned frontend check instances** and **applicable guide requirements**. The latter includes owner-verification items. A fully executed frontend sample does not mean that every whole-website requirement has been verified. Distinguish a genuinely irrelevant feature from an applicable requirement that cannot be assessed with available evidence.

## 3. Research findings that affect the design

| Finding from primary sources | Implementation consequence |
| --- | --- |
| The Agent Skills format uses `SKILL.md` with required `name` and `description`, plus optional resources. | Use this as the portable package contract. [S1] |
| Skill guidance recommends progressive disclosure and concise workflow instructions. | Keep the root instructions short; load detailed rules and adapters when needed. [S1, S2] |
| Claude Code has extensions that claude.ai uploads reject. | Keep host-specific metadata and behavior outside the common frontmatter. [S4] |
| Current OpenAI documentation distinguishes standalone local skills from plugin distribution across ChatGPT surfaces. | Treat web deployment as a separate packaging target, with runtime verification. [S3] |
| Browser contexts and attachment methods differ in their access to existing sessions. | Detect actual session access; never infer authentication from the user's desktop login. [S13, S14] |
| Pixels, DOM, and browser accessibility information are different representations. | Capture and label separate evidence channels. [S11, S12] |
| Current Lighthouse offers experimental Agentic Browsing checks with informational results rather than a weighted 0–100 ranking. | Reuse the checks when available, while retaining task tests and independent coverage. [S19] |
| WebMCP remains an evolving proposed web capability. | Feature-detect it; treat it as an optional extension rather than a mandatory baseline. [S20, S21] |
| Lighthouse treats a missing `llms.txt` returning 404 as not applicable. | Do not fail ordinary browser operability for a missing file. [S22] |
| W3C ACT defines explicit rule outcomes and rule structure. | Borrow its reporting vocabulary for clearly labeled custom rules. [S23] |
| Agent evaluation guidance emphasizes actual outcomes, multiple trials, and comparisons with a baseline. | Evaluate the skill on fixtures and realistic tasks, including runs without the skill. [S24, S25, S26] |

These sources support the design choices. The schemas, limits, severity definitions, release gates, and implementation phases below are project recommendations, not externally mandated standards.

### 3.1 Source basis, applicability and reconciliation

Preserve the guide's six evidence-basis labels as rule/source metadata. Use machine values `standard`, `platform-documented`, `engineering-recommendation`, `experimental-optional`, `unverified`, and `announced-upcoming`. They describe why a requirement or capability claim exists; they do not describe whether the audited website passes it. A vendor-documented feature may be unavailable in the current account. An experimental feature may work in the exact configuration tested. [G0, “How to interpret this guide”]

Each source-backed rule or compatibility claim needs its source URL/guide section, checked date, applicable product/mode/version, evidence basis, effective date when relevant, and recheck trigger. Keep these distinct from check outcome, confidence, test context and verification scope.

Resolve these guide-to-module qualifications explicitly:

- **Whole-website outcomes:** guide §11 and Appendix B require authoritative business-state checks. Record these as owner verification; the frontend module cannot claim them.
- **Claude Duet handoff:** guide §10.1's broad takeover wording differs from §10.6. Current official documentation says users cannot watch or take over Duet's browser and describes a separate credential-entry form. Model credential handoff, browser observation and browser takeover as separate capabilities. The audit still defaults to public-only if its available session is anonymous. [S42]
- **Upcoming policy controls:** guide §7.4 discusses Microsoft's announced preferences. The official announcement says they begin being honored on February 1, 2027. On this plan's November 22, 2026 research date, preserve `announced-upcoming`; do not treat them as an active universal release requirement. [S44]
- **Platform and extraction limits:** product names, native WebMCP support, account tiers, rollout status, cache behavior and extractor budgets are dated conditions. Never copy a vendor-specific character limit or support claim into a universal rule.
- **Recommended enhancements:** Markdown, `llms.txt`, WebMCP and specialized protocols require a named use case and actual client support. They remain conditional, with ordinary content/UI paths assessed independently.

This reconciliation does not assert that all 67 sources in guide Appendix C were independently rechecked. It identifies the guide as a supplied requirements source and adds targeted primary verification for facts that materially affect this plan.

## 4. Skill and module architecture

### 4.1 Canonical package

Start with one installable `ai-friendly-audit` package. Make `ai-friendly-audit-frontend` an explicit module ID and a referenced workflow. A module is an organizational feature of this project; the Agent Skills format does not supply a universal nested-module discovery mechanism.

| Proposed path | Responsibility |
| --- | --- |
| `ai-friendly-audit/SKILL.md` | Trigger, scope, module routing, capability preflight, execution sequence, completion contract |
| `agents/openai.yaml` | Optional OpenAI interface metadata, kept separate from portable instructions |
| `references/ai-friendly-audit-frontend.md` | Detailed frontend workflow and category dispatch |
| `references/frontend-rules.md` | Human-readable procedures, interpretation, false positives, remediation guidance |
| `references/browser-adapters.md` | Capability mappings and adapter-specific caveats |
| `references/authentication-and-scope.md` | Session handling, origin scope, safe action boundaries |
| `references/evidence-and-reporting.md` | Evidence requirements, privacy, outcomes, report format |
| `references/degraded-environments.md` | Browser-only, computer-use-only, fetch-only, and supplied-artifact procedures |
| `references/source-review.md` | Conditional original-source assessment |
| `references/retrieval-and-policy.md` | Representation fidelity, locale, freshness, discovery and content-use policy procedures |
| `references/transaction-observability.md` | Review, status, unknown outcomes, recovery and owner-verification boundaries |
| `references/platform-compatibility.md` | Dated product/mode conditions, separate from skill-host installation |
| `assets/module.json` | Frontend module ID/version, entry reference, profiles, schema versions, and capability requirements |
| `assets/rules/frontend-v1.json` | Versioned machine-readable rule catalog |
| `assets/schemas/` | Capability, evidence, check, finding, journey, compatibility-test, guide-coverage, owner-verification and report schemas |
| `assets/report-template.md` | Human-readable report structure |
| `assets/compatibility-test-template.yaml` | Guide Appendix B adapted to frontend-only verification |
| `package.json` and lockfile | Supported Node range, pinned optional runtime dependencies, and reproducible dependency resolution |
| `scripts/audit.mjs` | Optional CLI entry point for deterministic collection/import/validation/report operations |
| `scripts/lib/` | Small reusable implementation modules, shipped without a build requirement |

Keep development fixtures, benchmark labels, build tooling, and release documentation outside the installed runtime package. A development repository can contain them without forcing every audit to load them. Any generated frontend-specific package should include all required runtime resources.

Keep the guide-to-rule crosswalk, source provenance and reconciliation decisions in development documentation; include compact rule references in the runtime. Do not make the agent load the entire guide or a large platform matrix for every audit. Generate human and machine rule views from one canonical catalog to prevent drift.

If direct invocation as `ai-friendly-audit-frontend` is desired, generate a **self-contained second package** from the same canonical workflow. It must not depend on sibling installation paths, symlinks surviving uploads, or another skill being installed. Defer this alias until direct module invocation is useful enough to justify the extra packaging tests.

### 4.2 Root instructions

Target approximately 150–250 lines for the initial root file, remaining comfortably below the standard's recommendation of 500 lines and 5,000 tokens. These are design targets, not parser limits. [S1]

Suggested portable frontmatter:

```yaml
---
name: ai-friendly-audit
description: Audit web applications for AI-agent usability. Start with frontend inspection of public and available signed-in areas; report evidence, coverage, and prioritized fixes.
---
```

Use only `name` and `description` in the common baseline. The specification permits additional fields, but they are unnecessary here. In particular, do not make experimental `allowed-tools` a substitute for the host's actual permission system.

Keep the shared description below 200 characters for broad importer compatibility. The Agent Skills specification allows a longer description, while Claude's current custom-skill help article documents a 200-character maximum; validate the actual importers instead of depending on that documentation discrepancy. [S1, S5]

The body should tell the agent to:

1. Resolve target URL and requested module; route to the frontend module for v1.
2. Read the frontend workflow and only the adapter/reference sections needed.
3. Establish capabilities, usable session, site type, goal profiles, scope, action envelope, and budgets.
4. Collect baseline evidence and map representative routes and states.
5. Run applicable deterministic checks and authorized task trials.
6. Corroborate findings, preserve unknown/incorrect outcomes, and separate frontend fixes from owner-verification needs.
7. Produce the required report and structured outputs where file tools exist.
8. Validate outputs and state the scope of the resulting conclusion.

Use clear defaults and procedures. Avoid pages of general web-development background, tool-name assumptions, or instructions to load every reference before beginning. The skill-creation guidance favors real task experience, specific procedures, and iteration from execution traces. [S2]

### 4.3 Host packaging and discovery

| Target | Packaging/discovery plan | What must be verified |
| --- | --- | --- |
| Codex CLI/IDE | Standard package in documented `.agents/skills` project or user locations | Actual discovery, invocation, reference resolution, browser adapter |
| ChatGPT desktop | Standalone skill or plugin appropriate to the installation | Tools and session available in the selected execution environment |
| ChatGPT web | Plugin-bundled skill on supported surfaces; supplied workflow/evidence fallback otherwise | Plugin exposure, browser/terminal access, cloud session isolation |
| Claude Code | Standard package in documented `.claude/skills` project/user locations or plugin | Discovery and portable body behavior |
| Claude chat/Cowork/cloud | Package enabled through the account's supported skill-upload route | Importer restrictions, account policy, actual tools; local folder is insufficient |
| Cursor | Package in a documented supported skills location | Actual local/cloud loading and tools |
| GitHub Copilot CLI | Documented `.github/skills`, `.claude/skills`, or `.agents/skills` route | Import and execution with its available tools |
| Gemini CLI | Documented `.gemini/skills` or `.agents/skills` route | Discovery, permissions, and browser access |

These are current documented routes, not a claim that the skill has been tested on these hosts. OpenAI, Claude Code, Cursor, Copilot, and Gemini documentation should be rechecked at release. [S3, S4, S6, S7, S27]

Do not embed Claude-specific dynamic shell interpolation, subagent declarations, or hooks in the common file. OpenAI-specific metadata can remain an optional sidecar. Optional MCP dependencies belong in host adapters or packaging; the baseline skill should not require a newly built MCP server.

### 4.4 Two separate compatibility matrices

The table above answers **whether a host can load and run the skill**. Maintain a different table answering **whether a particular agent product, mode and task works on the audited website**. A Codex-driven Playwright run does not demonstrate a Claude Duet or Perplexity Computer task.

Key website trial records by product/version, model or `not_exposed`, conversation surface, execution location, browser provider/profile/version, adapter/tools, task, interaction mode, authentication, locale/timezone/currency, timestamp and evidence IDs. Store documented support and observed success separately. A desktop conversation may use cloud execution, and a cloud conversation may control a local browser; record both locations.

Use guide §10's product inventory as a dated research seed, not as an advertised support list. Test only the configurations the release claims to support; label the rest documented, provisional or untested. Native webpage WebMCP, remote MCP and local MCP are separate routes. OpenAI's current Site tools documentation, for example, limits that feature to the desktop app's built-in browser; it cannot be assumed in a generic web-chat run. [G0, §10; S41]

## 5. Capability negotiation and execution modes

### 5.1 Capability manifest

Record the observed availability of:

- Browser/tab selection and authorized existing-session attachment.
- Browser observation, user takeover and credential handoff as independent host capabilities; none is required to finish public work.
- Navigation, ordinary pointer input, keyboard input, viewport control, and screenshots.
- Rendered DOM, computed styles, computed accessible names/roles/states, and accessible snapshots.
- Read-only page evaluation where the tool and host permit it.
- Frame inspection, open shadow-root traversal, and separately reported closed/uninspectable surfaces.
- Console errors, network metadata, response bodies, service-worker attribution, and request timing.
- Storage metadata, cookie attributes, IndexedDB/cache/service-worker inspection.
- Performance traces, accessibility scanners, Lighthouse, Agentic Browsing checks, and WebMCP inspection.
- Terminal, filesystem, HTTP retrieval, runtime dependencies, permitted network egress, and original source access.
- Initial-response headers/body, actual content-extractor output, alternate representations, and extraction truncation/continuation metadata where exposed.
- Requested versus effective browser/site locale, region, timezone and currency.

Use capability statuses `available`, `denied`, `unsupported`, `failed`, and `not_attempted`. Include the supporting probe or tool observation, adapter/version, and limitation. A tool failure during the run updates the manifest and affected checks; it must not erase completed work.

Illustrative record:

```json
{
  "schema_version": "1.0.0",
  "conversation_surface": "web-chat",
  "execution_location": "cloud",
  "browser_context": "managed-browser-1",
  "capabilities": {
    "screenshots": {"status": "available"},
    "rendered_dom": {"status": "available"},
    "computed_accessibility_tree": {"status": "unsupported"},
    "actual_extractor_output": {"status": "not_attempted"},
    "browser_takeover": {"status": "unsupported"},
    "credential_handoff": {"status": "not_attempted"},
    "network_metadata": {"status": "available"},
    "storage_metadata": {
      "status": "denied",
      "reason": "host_policy_blocks_storage_inspection"
    },
    "terminal": {"status": "unsupported"}
  }
}
```

Keep capability facts separate from site findings. Missing storage inspection means storage checks are untested; it does not mean the site has no storage problems or lacks storage.

### 5.2 Adapter selection

Prefer a host-supported browser integration that can operate the intended existing session. Use DevTools MCP, a supported browser extension, or an explicitly authorized debugging connection where appropriate. If no usable session exists, an isolated browser can audit public pages. Keep computer-use operation of browser/DevTools available as a slower alternative.

Current Chrome DevTools documentation provides approved existing-session connection routes. Playwright CDP connections are Chromium-specific and have lower fidelity than Playwright's native connection. Feature-detect each operation and preserve attached-context settings where supported. [S13, S14]

Do not require every host to expose the same tool names. In a host-tool mode, the agent calls the host's browser tools and emits normalized observations. A terminal script cannot automatically call tool handles that exist only inside a chat runtime; it consumes imported evidence or uses an independently available browser protocol.

Define a small adapter contract for `discoverCapabilities`, `selectContext`, `navigate`, `captureState`, `interact`, `observeNetwork`, `inspectStorage`, and `cleanup`. Every operation returns normalized evidence or a typed `unsupported`, `denied`, or `failed` result, with context ID, timestamp, and reason. Distinguish observations from actions in the interface. Host-tool adapters implement the same contract through agent instructions and imported records, rather than pretending to be Node-callable objects.

### 5.3 Progressive modes

| Mode | Available work | Required limitation statement |
| --- | --- | --- |
| Full browser inspection | Visual, semantic, interactive, network, storage, runtime, and source checks supported by actual capabilities | Remaining blind spots, sample bounds, source availability |
| Browser with limited inspection | Screenshots, navigation, interactions, available DOM/semantics | Missing network/storage/protocol evidence |
| Computer use only | Visual tasks, keyboard behavior, manually accessible DevTools panels | Slower sampling; no assumed machine-readable tree or bulk collection |
| Terminal plus HTTP | Public HTML, headers, linked assets, static semantics/metadata, supplied files | JavaScript execution and real interaction untested unless a browser can run |
| Supplied evidence | Analyze screenshots, exported sanitized logs, DOM/source snapshots | Capture date/context unknowns; no live verification |
| No target access | Explain the actual blocker and accept usable supplied evidence | No completed website audit claim |

Do useful work immediately in the supported mode. Do not require the user to install a tool, sign in, or grant more access before finishing the public/partial work that is already possible. Ordinary web search results are research context, not a replacement for observed runtime evidence.

## 6. Authentication and scope handling

### 6.1 Authentication decision table

| Observed condition | Required behavior |
| --- | --- |
| Browser is already authenticated for the target | Include public routes and the authenticated routes reachable by that account |
| Browser is anonymous | Audit public routes; record authenticated areas as outside available coverage |
| User is signed in locally but execution uses an anonymous cloud browser | Complete public audit and identify the session-access limitation |
| Session expires during work | Preserve completed findings; continue public coverage and mark affected private journeys incomplete |
| Different accounts or roles are visible | Stay with the requested/current context; avoid account or role switching by default |
| Public and signed-in variants need comparison | Use a separate anonymous context if available; never clear the user's active session |
| Authentication status cannot be determined | Record `unknown` and assess only what is actually reachable |

Verify usable authentication through the target UI and successful access to a relevant route. The existence of a cookie alone is insufficient. Avoid collecting identity details unless they are necessary to describe a finding.

Distinguish `observed_anonymously` from `reachable_while_authenticated`. A page reachable in a signed-in context is not automatically proven public. Use a separate anonymous context when available and safe; otherwise report that comparison as untested. Agent-provider identity or an allowlisted IP does not authenticate the user or authorize an action. [G0, §§3–4]

Authentication reuse is not authentication export. Do not create routine `storageState` files, copy browser profiles, extract credentials, or move cookies from a local machine into cloud chat. Playwright explicitly warns that saved authentication state can contain credentials capable of impersonating the user. [S15]

A later explicit request to log in or connect another session is a separate host-supported workflow. The audit itself should finish the public work without making login a prerequisite.

### 6.2 Action envelope

The audit request authorizes ordinary inspection and safe exploration. It does not by itself authorize purchases, sending messages, publication, deletion, permission changes, or modifications to application data.

Classify an interaction by its intended effect, rather than its HTTP method. Reading may use POST; a GET link may log out or delete. Prefer navigation, opening/closing components, scrolling, reading existing values, and clearly local controls. Check whether typing or changing a field auto-saves before using it. If unsure, inspect the field and mark the active test unperformed.

Do not click every button as a discovery strategy. Record which steps stop at a submission or other consequential boundary. Continue other checks rather than repeatedly interrupting the user for permission to finish low-risk work.

### 6.3 Origins and route discovery

Start with the supplied URL and its expected origin. Follow visible navigation, in-scope links, sitemap hints, and observed SPA transitions. Do not enumerate guessed hidden/admin routes or brute-force identifiers.

Distinguish first-party navigation from embedded resources. Record third-party requests needed to understand the frontend, but do not treat their destination sites as new audit targets. A redirect to an unrelated site or an SSO flow is a boundary to record, not an invitation to expand the audit.

Normalize routes cautiously. Remove known tracking parameters from report identifiers, redact sensitive values, and preserve functional query parameters and meaningful hash routes. Keep private exact URLs out of public reports when identifiers or tokens occur in paths or queries.

## 7. Inputs, budgets, and audit workflow

### 7.1 Input contract

Require only a URL or a supplied evidence bundle. Optional inputs include:

- User-prioritized tasks and critical routes.
- Allowed origins and excluded paths.
- Existing browser tab/context selection.
- Target viewport(s), intended user region, language, timezone, currency and interaction modes.
- Site type, target agent products/modes, important public facts, and owner content-use intentions when supplied.
- Requested profiles and source path, when supplied.
- Time, page, state, request, and artifact-size budgets.
- Authorized test accounts or explicit permission for particular state changes, when relevant.
- Output format and evidence retention preferences.

Do not ask for information the current session already supplies. When tasks are unspecified, infer the three highest-value starting tasks and state them in the scope record. For an informational site these can be retrieval/comprehension tasks, not invented forms or transactions. Record unknown policy or locale intent without blocking the rest of the audit.

Illustrative initial defaults, to calibrate through pilots:

```yaml
module: ai-friendly-audit-frontend
guide_revision: "2.0"
site_type: infer
profiles:
  public-retrieval: when_applicable
  browser-operability: when_applicable
  discovery-and-citation: when_applicable
  frontend-tools: when_offered_and_supported
  source-maintainability: when_source_available
priority_tasks: infer_top_three
target_clients: current_runtime
intended_locale: use_requested_or_record_unknown
intended_timezone: use_requested_or_record_unknown
intended_currency: use_requested_or_record_unknown
content_use_intent: unknown_unless_supplied
session: reuse_available
actions: inspection_and_safe_ui_exploration
fault_injection: none
budget:
  max_routes: 20
  max_states: 60
  max_journeys: 5
  max_minutes: 45
  max_concurrent_pages: 2
  finding_recheck_attempts: 2
evidence:
  network_bodies: targeted_only
  storage_values: excluded_by_default
  authentication_export: false
  private_screenshots_in_deliverables: false
```

These are resource controls, not a definition of adequate coverage for every website. Stop at limits with a checkpoint and a clear account of missing coverage. Offer a follow-up expansion only after delivering the completed work. Respect rate-limit responses and avoid aggressive parallel crawling.

### 7.2 Ordered procedure

**Phase A — Resolve and preflight.** Validate the target, load the module, detect tools and permissions, select the session, classify site purpose, select goal profiles and top tasks, establish locale/scope/budgets, and start a run manifest. Record the actual execution route and versions instead of inferring them from the product name.

**Phase B — Capture an ordinary baseline.** Preserve the current cache, service-worker, storage, and browser behavior. Start request/console listeners before navigation when possible. When attaching to an already-open page, record the capture start and whether earlier requests are missing; reload only when safe. Preserve unsaved user work.

**Phase C — Explore and sample.** Build a route/component/state inventory. Select common templates, critical functions, complex widgets, error/empty/loading states, and representative narrow/desktop viewports. Include public content-detail pages and relevant facts, not just the homepage. Sample authentication contexts only when already available. Record what was discovered but not sampled.

**Phase D — Collect state and representation evidence.** For each selected state, collect only the channels required by applicable rules. Link visual, semantic, network, storage and source observations by timestamp and state ID. For retrieval tasks, compare initial HTML, rendered content and actual extractor output where available, preserving material qualifiers and locale. Capture offered alternate formats separately. Note if asynchronous changes or differing sessions mean two captures are not comparable.

**Phase E — Run deterministic checks.** Reuse supported accessibility tools, ordinary Lighthouse checks, and optional Agentic Browsing checks. Add project-specific checks only when existing tools do not answer the question. Preserve the original tool/version/rule IDs and normalize the result separately.

For Lighthouse on an existing session, inspect the effective mode/settings and disable storage reset (`disableStorageReset: true`, the corresponding CLI option, or uncheck **Clear storage** in DevTools) when the adapter supports it. Choose navigation, snapshot, or timespan according to the question and supported audits; record which checks that mode cannot run. Preserve unsaved page state, cache, and worker behavior, and move any run that resets storage or changes the session into an appropriate separate context. If the host's Lighthouse tool cannot guarantee the required behavior, skip that collector on the active session. Review automated collectors for navigation and side effects instead of assuming that every check is passive. [S35, S36]

**Phase F — Run agent tasks.** Exercise representative retrieval or interaction tasks using the declared mode. Define frontend-observable success conditions and material facts before execution. Record retries, expected intervention, safe stops, incorrect observations and unresolved outcomes. A review-stage task ends before submission unless a different boundary is already authorized. Do not count an agent's statement of success as proof or a visible confirmation as authoritative business verification.

**Phase G — Investigate failures.** Recheck suspicious failures within budget. Look for unambiguous names, event targets, overlays, disabled controls, loading, errors, and network/environment explanations. Separate confirmed observations from root-cause hypotheses.

**Phase H — Run conditional extensions.** Inspect offered WebMCP, optional Markdown/content aids, original frontend source or focused performance/state variations when applicable and supported. Retrieval and discovery are core selected profiles, not optional extras relegated to this phase. Use adverse transaction scenarios only in controlled frontend fixtures or an expressly authorized test environment; label that context. Keep modified runs separate from baseline.

**Phase I — Synthesize and validate.** Deduplicate repeated component issues, preserve affected locations, assign justified severity/confidence, and prepare fixes and acceptance tests. Map applicable guide requirements to checks or owner-verification items. Produce separate goal conclusions and product/mode/task records. Validate schemas, evidence references, nullable business-effect fields, counts and redaction before delivering the report.

**Cleanup on success, failure, or cancellation.** Use a `finally` path to stop audit-owned listeners/traces and restore any viewport, throttling, emulation, and cache controls changed by the audit. Close only audit-created tabs/contexts; detach from a user-owned browser. Do not restore state by rewriting application data or cookies. Preserve unsaved work, honor temporary-artifact retention, and report any setting that could not be restored.

### 7.3 Waiting and reproducibility

Use meaningful visible states and bounded waits. Polling or streaming can keep a page network-active after it is usable; Playwright discourages using `networkidle` as a universal readiness condition. Reacquire locators after rerenders and verify before/after state around important interactions. [S17]

Do not hide failures with forced clicks, direct application-function calls, or changing DOM attributes. Playwright's actionability checks illustrate useful diagnostic distinctions: visibility, stability, event reception, enabled state, and editability. [S18]

Preserve service workers in the baseline. Blocking them can change app behavior; use a separately labeled controlled variation only when it answers a specific question. [S28]

Record instrumentation differences as well as intentional test variations. For example, current Playwright documentation describes limitations around back/forward-cache testing and default browser behavior. Do not equate ordinary back/forward navigation with a verified cache-restoration test; assess unsupported behavior through a suitable browser mode or mark it untested. [S17]

Use one controlling agent per browser tab/session. Parallelize independent analysis of sanitized artifacts. Parallel browsing requires isolated contexts and independent state; multiple agents must not compete for the same mouse, active tab, or signed-in workflow.

## 8. Frontend rule catalog

Each rule needs an ID, version, profile/guide goal, guide sections/checklist IDs, evidence basis, applicability, required capabilities, evidence scope, procedure, expected result, required evidence, limitations, false positives, remedy and acceptance procedure. Include an owner-verification link where the frontend rule covers only part of a whole-website guarantee. Map to a standard only where accurate; the custom catalog itself is not an external standard.

| Group | Category | Required topics | Primary evidence/boundary |
| --- | --- | --- | --- |
| AFF-SEM | Understanding and semantics | Title/language/headings/landmarks, native controls, computed names, label agreement, repeated-action context, selected/expanded/disabled/step state | DOM, accessibility and screenshots |
| AFF-KBD | Keyboard operation | Complete journeys, focus visibility/order, modal entry/containment/escape/restoration, drag alternatives | Keyboard trace and focus observations |
| AFF-VIS | Visual operation | Targets with applicable size/spacing exceptions, overlays, clipping, icons, layout movement | Screenshots, computed geometry and safe interaction |
| AFF-FORM | Forms and sensitive inputs | Persistent labels/grouping, purpose/autocomplete, required state, validation, associated errors, retained input, password/OTP markup | DOM/semantics; no real-secret test entry |
| AFF-STATE | State and feedback | Loading/empty/error, pending/action-required/success/failure/cancelled/unknown, durable confirmation | State snapshots correlated with observed requests |
| AFF-REC | Review and recovery | Material terms, review vs commit, status lookup, retry advice, conflict/expiry/cancel/resume UI | Frontend evidence; server guarantees remain owner items |
| AFF-NAV | Navigation | Real links, durable detail URLs, deep-link reload, history, pagination, filters and task context | Route graph and safe outcomes |
| AFF-DYN | Dynamic behavior | Hydration readiness, input survival, rerenders, menus, portals, autocomplete and timed messages | Bounded state traces; controlled variations labeled |
| AFF-CPLX | Complex surfaces | Virtual lists, infinite scroll, canvas/WebGL, editors, drag, shadow DOM and frames | Mode-specific evidence and stated limits |
| AFF-RESP | Responsive behavior | Narrow/desktop layouts, zoom/reflow, targets and reduced motion | Viewport observations and task results |
| AFF-PERF | Performance/reliability | Layout shifts, slow feedback, long tasks, exceptions, broken resources | Timings/traces tied to task consequences |
| AFF-NET | Access and network resilience | Full-journey access, 403/429/challenges, stalled assets/XHR, cache/worker attribution and error recovery | Actual execution route; no WAF configuration conclusion |
| AFF-STORE | Storage and client state | Relevant persistence, session dependence, stale state, cookies, local/session storage, IndexedDB/cache | Origin-scoped metadata and necessary redacted evidence |
| AFF-RET | Retrieval fidelity | Initial/rendered/extracted text, facts/qualifiers/tables/links, truncation, freshness and offered representation parity | Actual channel identified; external truth not assumed |
| AFF-LOCALE | Locale and material conditions | User/site/browser language, region, currency, timezone, units and effective dates | Compare intended and observed settings; unknown intent explicit |
| AFF-DISC | Discovery and attribution | Crawl/index/snippet directives, canonical/sitemap/internal links, structured data, titles/descriptions/sharing metadata | Observable eligibility and agreement only |
| AFF-POL | Content-use policy | Search, training, grounding, user retrieval and browser access policies; vendor/date conditions | Public signals plus supplied owner intent |
| AFF-TOOL | Frontend agent tools | Optional WebMCP discovery, schemas, state, errors, side effects, UI agreement and normal fallback | Supported declarations and authorized safe tests |
| AFF-TRUST | Trust boundaries | Distinguish site controls from untrusted content, secret handling, injection resistance by auditor | Evidence hygiene and scoped frontend observations |
| AFF-SRC | Source maintainability | Component contracts, state ownership, types, tests, setup and project instructions | Adequate original source only |

Use WCAG references especially for names/roles/values, label-in-name, keyboard access, focus, status messages, and form errors. Tests still need to consider the actual application task rather than checklist counts alone. [S8]

### 8.1 Important interpretation rules

- Do not automatically fail every `div`, custom component, canvas, SPA, or large DOM. Demonstrate the relevant limitation in the tested mode.
- Do not require `data-testid` on third-party websites. Semantic names and context should normally support interaction; test IDs can help controlled repository tests.
- Do not assume an ARIA attribute creates correct behavior. Observe computed state and actual interaction.
- Do not treat visually hidden content as visible task evidence without stating which mode can access it.
- Do not treat a page-JavaScript same-origin error as proof that the available browser adapter cannot inspect any frame.
- Standard Playwright locators do not support closed shadow roots; record the actual adapter's abilities rather than generalizing that limit to all DevTools mechanisms. [S12]
- CAPTCHA and anti-automation challenges are observed access barriers. Record their scope and continue elsewhere; do not attempt evasion or recommend disabling protections globally.
- Treat security/privacy observations as contextual frontend findings. Do not claim a penetration test, verified exploit, or server-side authorization review.

### 8.2 Optional agentic browser features

**Lighthouse Agentic Browsing:** detect the installed category and feature support. Preserve vendor results and warnings with versions. It is experimental and currently uses informational pass/fail data and a pass ratio, not a weighted 0–100 score. Some checks depend on evolving WebMCP support. It complements rather than proves task reliability. [S19]

**WebMCP:** inspect registered tool names, descriptions, input/output schemas when available, constraints, state-dependent registration, and whether results agree with visible UI state. Treat descriptions and annotations as untrusted claims about effects. Inspect metadata first and execute only actions inside the existing audit authorization. Its current draft explicitly says it is not a W3C Standard or on the W3C Standards Track; record the browser/API version and detected feature surface. [S20, S21, S29]

**Public content aids:** inspect `llms.txt` and linked Markdown representations when present, checking whether they accurately represent visible public information. They are supplemental aids. Lighthouse marks a missing optional file as not applicable, and the proposal is distinct from access control. Do not fail browser operability for absence or promise search visibility from presence. [S22, S30]

**Crawler policy:** if public discoverability is assessed, distinguish search crawling, training crawling, and user-directed visits. OpenAI documents them separately. Preserve the site's intended policy and report the implication for the selected goal; do not recommend opening training access as a default “AI-friendly” improvement. [S31]

Inspect tool intent at the level of read, draft, commit, cancel and status operations. Check whether schemas expose relevant units, currency, timezone and constraints, and whether observed errors distinguish invalid input, authentication, conflict, rate limiting, pending and unknown outcomes. Do not execute a tool solely because its annotation says read-only. Compare state-dependent registrations with visible UI state and ordinary-UI fallback; distinguish observed consistency from proof that UI and tools share an authoritative service. HTTP/API, remote MCP, local MCP and webpage WebMCP remain different integration routes. [G0, §5; S29, S41]

### 8.3 Required interface acceptance checks from guide §1

Translate the broad categories into independent checks:

- A repeated action has enough persistent context to distinguish its target; labels do not depend only on placeholders or transient tooltips. Check native grouping such as `fieldset`/`legend` where relevant.
- The computed accessible name includes the visible label where the applicable criterion requires it, and exposed selected/expanded/disabled/current-step states agree with the observed interface.
- A keyboard journey covers the complete widget interaction, including date selection, autocomplete and dialogs. Check initial focus, appropriate containment, dismissal and return focus; include a non-drag route where needed.
- Apply WCAG 2.2 target-size requirements with their actual exceptions. A target below 24 × 24 CSS pixels does not automatically fail: spacing, equivalent controls, inline targets, user-agent controls and essential presentation can affect applicability. Retain the exact criterion and geometry used. [S37]
- When a control appears enabled during hydration, verify that the permitted action actually works and that already entered input survives readiness/rerender transitions. Prefer fake-data fixtures for deliberate slow-hydration input-loss tests.
- Inspect sensitive-input types and autocomplete purposes, including current passwords and one-time codes. Do not enter real credentials to test masking, and do not assume correct HTML guarantees that every host hides a field. Inspect only necessary available client logs/traces; use synthetic values in controlled leakage tests.

### 8.4 Transaction observability and recovery

For applicable workflows, model these visible states: `not_started`, `in_progress`, `requires_user_action`, `succeeded`, `failed`, `cancelled`, and `unknown_outcome`. This is a proposed normalized vocabulary; preserve the website's actual wording as evidence. [G0, §2]

| Requirement | Frontend acceptance evidence | What still needs owner verification |
| --- | --- | --- |
| Review is distinct from commit | Labels and observed transitions distinguish preparing/reviewing from a final consequential action | Commit path enforces the reviewed authority and terms |
| Material terms are readable | Relevant target, recipient, amount/currency, date/timezone, quantity, conditions and expiry are visible at review | Current price, availability, quote/version and permission revalidation |
| Progress and uncertainty are explicit | Pending, failure, action-required and unknown outcomes are distinguishable | Actual operation state after a transport failure |
| Confirmation is durable | Persistent result/status view and relevant identifier/details; a disappearing toast alone is insufficient | Correct authoritative record and absence of unrelated effects |
| Retry has reconciliation guidance | A status/history lookup and useful uncertainty message where applicable | Logical-operation deduplication, retention and incompatible-key handling |
| Conflict requires reconsideration | Changed material terms and a clear re-review path are observable | Atomic conflict/version checks at commit |
| Cancellation is described accurately | Requested, pending, cancelled, already-completed and unknown states are not conflated | Whether an operation committed, was reversed or needs compensation |
| Resumption preserves context | Reachable draft/status views identify the task, step and account context | Cross-device persistence, binding and protection against repeating an externally completed operation |
| Drafts and errors are recoverable | Valid input, query/filter context and adjacent errors persist through allowed transitions | Durable server draft behavior beyond visible observations |
| Navigation is safe to inspect | Suspect mutation links are flagged from observed markup/source without being activated | Safe-method and prefetch enforcement on the server |

Production audits inspect already-present states and safely reachable views. Do not deliberately lose responses, repeat submissions, race cancellations, expire tokens, switch accounts, change quotes or trigger destructive GETs to manufacture evidence. Controlled frontend fixtures can simulate these cases to evaluate the auditor. An expressly authorized test environment can support additional frontend scenarios, while server guarantees still remain outside this module.

### 8.5 Retrieval, discovery and policy checks

Define material facts for each selected content task: entity/product/version, amount, currency, interval, units, quantity, limits, eligibility, region, date and availability status as applicable. A statement that loses its qualifier can be misleading even when its headline value survives. Assess table headers/relationships, meaningful link destinations, text alternatives and source attribution as part of comprehension. [G0, §§6, 8]

Inspect durable content/detail URLs, direct reload, normal anchors, pagination, internal links, canonical/sitemap agreement and language alternatives where offered. Check that structured data and ordinary title/description/sharing metadata agree with visible facts. A visible mismatch can be established from frontend evidence; truth against private catalogs, feeds or external business records requires an explicit additional source.

For discovery, record `robots.txt`, HTML robots directives, `X-Robots-Tag`, `noindex`, snippet restrictions, canonical/redirect signals and relevant sitemap entries. Report observable eligibility signals, not guaranteed indexing or citations. Google explicitly separates technical eligibility from actual inclusion and does not require special AI files or special schema markup for its AI search features. [S38]

For content-use policy, maintain separate intent/observed-signal/documented-effect fields for search, training, grounding, user-triggered retrieval and browser-agent access. Vendor controls can cover more than one purpose; do not invent a universal one-token-per-purpose mapping. If owner intent is unknown, record the policy and its likely documented effect as an observation, not a failure or an instruction to allow more uses.

Parse applicable robots groups correctly. RFC 9309 uses the `*` group when no matching product group exists; do not automatically merge its rules into a matched product group. Robots preferences do not authenticate a client or protect private data. Keep vendor-specific interpretation and effective dates attached to the corresponding source. [S39; G0, §7]

When Markdown or `llms.txt` is offered, require a named supported-client use case, an ordinary fallback, consistency checks and evidence of benefit before recommending expansion. Do not prescribe hidden instructions, keyword stuffing, arbitrary chunk lengths or a universal “AI SEO” file. [G0, §9]

### 8.6 Execution-route access checks

Record whether the tested path is an attached local browser, isolated browser, hosted browser, HTTP fetch/extractor, or supported page-tool route. Inspect the complete sampled journey: a working homepage does not establish that search, details, XHR/GraphQL calls or API subdomains are reachable. Record the affected step, request metadata, visible challenge/error and safe recovery.

Separate observed site responses from environmental uncertainty. A 403 or challenge is an observed access barrier; its precise WAF rule or intent is normally unknown. A tool-side network denial is an environment limitation. Compare local/cloud routes only if both were actually exercised. Shared egress, rule precedence and vendor identity verification belong in owner follow-up when logs/configuration are unavailable. Current Google guidance illustrates why whole-journey and route-specific access matter, but its identity mechanism is not a universal agent mechanism. [G0, §4; S43]

Do not spoof a provider user agent and claim the test represents that verified provider. Do not disable bot controls, evade challenges or recommend global allowlisting from one failed journey.

## 9. Evidence collection specification

### 9.1 Shared evidence record

Every observation should carry:

- Run, state, evidence, and rule IDs as applicable.
- Guide revision/sections, goal/profile, evidence scope and test context where relevant.
- Sanitized URL/origin, frame context, viewport, intended/effective locale/timezone/currency and coarse session scope.
- Timestamp and capture sequence; baseline versus controlled variation.
- Channel and representation: screenshot, DOM excerpt, browser AX, Playwright ARIA snapshot, request metadata, storage metadata, source excerpt, or task event.
- Collector, browser/runtime versions, configuration, and collection limitations.
- Product/model/version or `not_exposed`, execution route and documented-versus-observed provenance.
- Sanitization status and path/reference to retained evidence.
- Hash of sanitized retained bytes when useful for artifact integrity.

Do not hash secret values as a substitute for removing them. Do not save sensitive raw data solely to obtain a hash. A file hash supports artifact consistency, not the truth of the observation.

### 9.2 Screenshots and visual analysis

Capture the viewport at meaningful baseline and interaction states. Use selected crops for controls, validation, focus, and overlays. Use full-page captures selectively; they may omit sticky/interactive context or become unwieldy on very long pages.

Record dimensions, scale, scroll position, color/motion settings, and active overlays. Analyze hierarchy, readable labels, ambiguous icons, target occlusion, clipping, layout movement, loading feedback, and responsive changes. Compare visual labels against accessible names where both channels exist.

A screenshot cannot establish an accessible name, an event handler, an HTTP response, or backend persistence. A semantic snapshot cannot establish contrast or actual visual occlusion. Keep the observation and any inference separate. [S11]

Authenticated screenshots may contain personal information. Prefer targeted safe capture or a text description. Do not place private screenshots into default deliverables; if a host cannot support safe capture/redaction, omit the image and explain the evidence limit.

### 9.3 DOM and accessibility

Capture document structure, relevant controls, labels, roles, states, relationships, and computed properties. Identify the exact representation: Playwright's ARIA snapshot and Chromium's browser accessibility tree are not interchangeable files.

Use compact state summaries and targeted excerpts instead of repeatedly dumping the entire DOM. Preserve evidence sufficient to reproduce a finding, with selectors grounded in observed attributes or contextual descriptions. Capture accessible information after relevant state transitions.

Avoid app-internal state, hidden implementation APIs, or direct handler invocation as a way to prove ordinary browser-agent task success. Such information may help diagnosis when available, but the report must distinguish it from what the tested agent mode can normally use.

### 9.4 Network

Default record: request ID, redacted URL, method, resource type, status, size, timing, initiator, cache/worker attribution, and failure reason. Observe navigation, assets, fetch/XHR, and streaming/WebSocket behavior when supported, using metadata first.

Collect a body only when necessary for a specific frontend question and within scope. Exclude cookies, authorization headers, tokens, personal payloads, private document contents, and unrelated third-party details. Browser capture can miss traffic preceding attachment or information withheld by the tool; record that instead of treating missing events as evidence of absence.

Chrome's sanitized HAR removes common sensitive headers, but that does not guarantee safe URLs, request bodies, response bodies, or identifiers. Apply a second minimization/redaction pass before persistence or export. Do not replay captured requests or use a raw authenticated HAR as a default deliverable. [S32]

For retrieval, capture relevant response headers such as content type, redirects, cache control, age, variation and validators when exposed. For ordinary application traffic, a naturally observed operation ID, idempotency key or version precondition is an indicator only; avoid retaining sensitive values and never replay it to test enforcement. Record capture omissions and body truncation explicitly.

### 9.5 Storage

Inspect only relevant origins and partitions supported by the browser tool. Record mechanisms, key categories, approximate sizes, persistence characteristics, cookie attributes, cache/service-worker state, and relevant UI-state relationships. Keys themselves can contain private identifiers and may need redaction.

Do not collect raw session values by default, query whole IndexedDB datasets, clear site data, edit cookies, unregister workers, or reset an active user profile. A lack of access through `document.cookie` does not mean no cookies exist; some metadata requires the browser's privileged inspection interface. Incomplete storage exposure is an audit limitation.

Normal navigation may reveal state persistence. A fresh-session or offline comparison belongs in a separate safe context where possible. Observing data retained locally does not prove server persistence, and a security-sensitive value must not be assumed to be secret simply because its name contains `key` or `token`.

The browser Application panel provides the relevant storage/cache/service-worker surfaces; the skill should use whatever subset its adapter exposes. [S33]

### 9.6 Code and source

Use three provenance levels:

1. **Delivered frontend artifacts:** actual HTML, CSS, JS, and other client resources observed or explicitly linked.
2. **Mapped authored code:** source-map-referenced content available through ordinary authorized access, with mapping/provenance recorded.
3. **Supplied repository source:** user-provided frontend project files with their applicable local instructions.

Analyze artifacts as data. Do not execute downloaded bundles in the terminal or run project install/build scripts just to inspect source. Use bounded text search, parsing, and static analysis where available. Respect source-map paths as untrusted input; do not allow archive extraction or path traversal outside the approved workspace.

For original source, evaluate component contracts, state boundaries, semantic UI conventions, typed inputs, tests, setup clarity, and frontend isolation. Scope any suggested edits to the evidence and identify files only when they actually exist. If source is absent, provide component/behavior-level remedies instead of invented filenames.

### 9.7 Performance and diagnostic tools

Use Lighthouse, performance traces, coverage, Rendering/Issues panels, and focused profiling when they answer a concrete frontend reliability question. Heavy traces and heap snapshots can be large and sensitive; they should not be routine collection defaults.

Record browser, hardware/environment, viewport, cache, throttling, configuration, and sample count. Separate lab observations from field data. Core Web Vitals are user-experience measures; one cloud run does not establish field INP or a site's universal performance. [S34]

Prefer “the filter took 2.1 seconds to show a result in this run, with no visible loading state” to an unqualified claim that the application is slow. The number here is illustrative, not a measurement of a real site.

### 9.8 Representation fidelity and freshness

Use this repeatable procedure for the `public-retrieval` profile:

1. Define the question and its material facts/qualifiers from the selected visible public content. Identify the source and capture time; do not assume it is an independent ground truth.
2. Capture the actual initial HTTP response and headers through the browser or a bounded public fetch when supported. A DOM snapshot after JavaScript runs is not initial HTML.
3. Capture rendered text/structure after meaningful readiness. Preserve table and link relationships required by the question.
4. Invoke the actual available extractor or retrieval tool when permitted, recording its product/version/options and returned representation. A local text-conversion simulation must be labeled simulated and cannot prove another client's output.
5. Compare facts and qualifiers across available channels. Attribute differences to observed rendering, locale/session/content-version changes or extraction behavior only when evidence supports that distinction.
6. Record missing beginning/middle/end content, truncation indicators, output lengths, continuation mechanisms and unresolved limits. Do not hardcode another product's extraction budget or equate a tool display cutoff with server truncation.
7. If an alternate representation is actually offered or documented for the target, compare its facts, tables, links, locale, dates and access context. Use ordinary public retrieval; do not guess private alternate paths or transfer session cookies into terminal requests.
8. Inspect freshness/cache evidence and recheck only where useful and safe. A cache age, timestamp or validator is an observation, not proof of the current authoritative business state.

Create a fact-comparison record with `fact_id`, source/state/representation IDs, observed value, material qualifiers, availability, mismatch type, capture time and evidence IDs. Use `unknown` when a channel is unavailable; an untested extractor cannot receive a passing result from the browser's DOM.

For content negotiation, inspect actual `Content-Type`, `Vary` dimensions and available cache indicators. Avoid a universal failure for missing `ETag` or `Last-Modified`: Cloudflare's documented Markdown conversion removes these validators and adds `Accept` variation. Its current docs also describe a default content-use signal when the origin does not provide one, so an offered representation can carry policy implications that need owner review. Apply these facts only when the relevant service/behavior is evidenced. [S40]

Authorization consistency across private representations requires more than one successful signed-in fetch. Compare only available authorized contexts; use fake-data fixtures for leakage scenarios and send comprehensive access enforcement to owner verification.

### 9.9 Locale, timezone and currency evidence

Record separately the user's intended service region/language/timezone/currency, the browser's effective settings, the site's selected settings, and execution geography only when exposed. Do not use the cloud machine's location or timezone as the user's intent.

Check material dates/times, decimal formats, currencies, billing intervals, quantities and units across detail, selection, review and any already available confirmation views. Check language/region-switch visibility and persistence through safe navigation. Authentication transitions and account switching are not manufactured for this test; observe them only when independently authorized or in controlled fixtures.

For an ambiguous date or amount, report the exact uncertainty and affected task. A missing explicit timezone may matter for an appointment and be irrelevant to a timeless article. Use expected task semantics to determine applicability. [G0, §§6.3, 8.1]

## 10. Checks, findings, task outcomes, and verdicts

### 10.1 Atomic check outcomes

Borrow W3C ACT's explicit outcome vocabulary for the project's custom checks. This borrowing does not make AI-operability rules W3C-conformant rules. [S23]

| Outcome | Project meaning |
| --- | --- |
| `passed` | Adequate evidence establishes the expectation for this target/state |
| `failed` | Adequate evidence establishes a violated expectation |
| `cantTell` | Evaluation began but applicability or result remains unresolved |
| `inapplicable` | The rule does not apply to this target/state |
| `untested` | The check was not performed |

Attach separate reason codes, such as `tool_unavailable`, `auth_unavailable`, `source_unavailable`, `cross_origin_restriction`, `unsafe_action_required`, `budget_exhausted`, `environment_failure`, `site_access_barrier`, `representation_unavailable`, or `inconclusive_observation`.

A single atomic target gets one outcome. A component with ten instances may have seven passes and three failures; keep those results rather than inventing a vague partial pass.

Keep owner-only requirements in the guide-coverage/verification register with `owner_verification_required`. They are not executed frontend checks. If evaluation of a planned frontend check is blocked, use its proper atomic outcome and reason. Do not convert either kind of missing evidence into a pass or a false `inapplicable` result.

### 10.2 Finding structure

Each confirmed finding should include:

- Stable finding ID and linked check/rule IDs.
- Guide section/checklist references, evidence basis, evidence scope and live/fixture context.
- Specific title and affected route/state/component instances.
- Agent profile and interaction modes affected.
- Observed behavior, expected behavior, and task impact.
- Evidence IDs and short reproduction steps.
- Severity and confidence as separate fields.
- Known uncertainty and alternate explanations considered.
- Recommended frontend remedy and observable acceptance test.
- Source file/location only when supported by actual source evidence.

Suggested severity: **blocker**, **high**, **medium**, **low**. Assign severity from the impact on defined tasks, not the number of repeated DOM nodes. Suggested confidence: **high** for direct and sufficiently corroborated observations, **medium** for direct but incompletely reproduced evidence, **low** for an inference. Low-confidence items should appear as investigation leads rather than confirmed defects.

Illustrative finding, not a finding about an actual website. It assumes the semantic task trace confirmed substantial difficulty with an essential control; the missing name alone does not establish keyboard failure or high task impact:

```json
{
  "id": "AFF-001",
  "rule_id": "AFF-SEM-001",
  "guide_sections": ["1.1", "11.2"],
  "basis": "standard",
  "evidence_scope": "frontend_verifiable",
  "test_context": "live",
  "profile": "browser-operability",
  "title": "Search control has no computed accessible name",
  "state_id": "catalog-desktop-public-01",
  "modalities": ["semantic"],
  "severity": "high",
  "confidence": "high",
  "observed": "The visible search control is exposed as an unnamed button.",
  "impact": "The tested semantic journey required positional inference to identify this essential control.",
  "evidence_ids": ["ax-004", "screenshot-003", "task-002"],
  "reproduction": [
    "Open the catalog route in the recorded viewport.",
    "Inspect the control beside the search input.",
    "Verify its computed role and accessible name."
  ],
  "recommendation": "Give the button an accessible name that matches its visible purpose.",
  "verification": "The computed name identifies search, and the semantic task completes without positional guessing."
}
```

### 10.3 Task trials

For each journey, define the goal/profile, exact task instruction, starting state, allowed actions, mode, frontend success conditions, expected material facts, budget, reset method and required evidence before execution. Separate access, comprehension, execution and correctness observations. Use the following execution outcomes, adapted from guide §11.4:

| Execution outcome | Meaning within this module |
| --- | --- |
| `frontend_complete` | Evidence establishes the declared frontend task conditions without human intervention or an observed material incorrect effect |
| `frontend_complete_after_expected_intervention` | The frontend conditions are established after an independently authorized, recorded human step, without an observed material incorrect effect |
| `safe_stop` | The run stops appropriately at an authorization, safety or required-human boundary |
| `observed_incorrect_result_or_effect` | Evidence shows a wrong result/effect, such as the wrong target, price, date or visible duplicate |
| `unresolved` | Available evidence cannot establish the task result |

Record `blocked_by`, `stop_reason`, intervention count/type, recovery/retries, duration and final state separately. A site or tool blockage should not obscure whether the agent stopped safely. Human sign-in is not required by the audit: use the public fallback unless the user independently chooses to authenticate.

Preserve an append-only list of observed incorrect results/effects within each trial. Later recovery cannot erase an earlier error from counts. Use `verification.layer: frontend`, `backend_record_checked: false`, and null for unobserved authoritative effects or unintended-effect counts. Null means not established; zero would claim a measurement.

Record `goal_conditions_met` independently from the overall execution outcome. A material incorrect effect or unauthorized action makes the trial ineligible for counts of successful trials, even if the intended goal is later reached. Its overall result remains `observed_incorrect_result_or_effect`; record later recovery separately. Harmless intermediate navigation corrections can count as friction when no material incorrect effect occurred. Give every material classification evidence and a task-specific rationale.

Examples include finding a product and reading availability, searching documentation, filtering a table, opening/dismissing a dialog with a keyboard, or reaching a form's review step without submission. A purchase workflow stopped before purchase should be named accordingly; do not report the whole purchase as completed.

Where practical, repeat important safe tasks and report successes/trials, retries, and observed durations. Use repeated statistical evaluation mainly on controlled fixtures; do not run large benchmark workloads against arbitrary public sites. Record model/host/tool versions, since measured agent outcomes depend on the whole setup. [S24]

A frontend can report success while the business outcome remains unresolved. Store those facts separately. If the declared task is reaching review, its frontend completion can be verified while `business_effect_outcome` is `not_attempted`. If an independently authorized consequential action occurs, UI evidence still cannot establish all authoritative effects; preserve `unresolved` and the required owner verification.

For an independently measured task trial, isolate the actor from diagnostic hints unavailable to its declared mode. A screenshot-only actor should not receive source-derived selectors or DOM descriptions from earlier analysis. Use a fresh context where practical, or label a trial as assisted when prior diagnostic knowledge may affect it. Rich diagnostic inspection can follow the task failure without being counted as unaided success.

### 10.4 Verdict policy

Apply the following task verdicts to browser operability and defined retrieval tasks, separated by tested product/mode/session:

- **Demonstrated for the tested scope:** required sampled tasks succeed and the evidence is adequate for the stated scope.
- **Usable with friction:** tasks succeed but have verified ambiguity, unnecessary recovery, or reliability problems.
- **Blocked for identified tasks:** a demonstrated frontend barrier prevents an essential sampled task in the tested mode.
- **Observed material error:** a trial produces a material incorrect result/effect or unauthorized action; later completion does not make that trial successful.
- **Inconclusive:** important required evidence or tasks could not be evaluated.

Attach the conditions: browser, interaction mode, session, date, routes/states, and coverage gaps. Do not generalize one agent failure into a universal site failure. Likewise, do not call the whole site AI-friendly because automated accessibility checks passed.

Add profile-specific conclusions:

| Profile or verification dimension | Conclusion format |
| --- | --- |
| Public retrieval | Which facts/qualifiers were preserved, omitted or mismatched in each actual representation; unresolved freshness/truncation |
| Browser operability | Named frontend tasks demonstrated, completed with friction, blocked, affected by a material error or inconclusive |
| Discovery and citation | Observed eligibility and policy signals, known intent alignment and unresolved index/citation status |
| Frontend tools | Declarations inspected, supported safe invocation observed, fallback assessed, or unsupported/untested |
| Business correctness | Owner verification required; no whole-website transaction certification |

Do not collapse a consequential unresolved guarantee into a positive whole-site conclusion. A transaction-heavy site may have usable review UI while its business safety remains unassessed. Absence of an optional integration or an intentional training restriction does not fail unrelated goal profiles.

Report source maintainability against its own evidence-backed criteria, such as component contracts, setup clarity, state boundaries, and testability. Use `not_assessed` when source coverage is inadequate. Successful browser journeys cannot establish maintainability of unseen code.

If a numeric summary becomes useful later, validate a versioned measurement model first. Display coverage and confidence alongside it, publish its weighting/denominator, and do not mix source maintainability or public indexing policy into browser-operability results. Report incorrect-result and unresolved counts alongside any completion rate.

### 10.5 Compatibility-test record adapted from guide Appendix B

The following is an illustrative compatibility record, not a test already run. It shows a successful review-stage frontend fixture task with no claimed booking or backend verification.

```yaml
schema_version: "1.0.0"
test_id: consultation-review-example
trial_number: 1
started_at: "2026-11-22T18:00:00Z"
completed_at: "2026-11-22T18:01:00Z"
guide_revision: "2.0"
guide_sections: ["2.1", "2.3", "6.3", "10", "11.4"]
guide_goal: operate
profile: browser-operability
test_context: controlled_fixture
skill_host:
  product: example-runtime
  product_version: not_exposed
  model: not_exposed
  skill_version: proposed-v1
tested_agent:
  product: example-runtime
  product_version: not_exposed
  model: not_exposed
  relationship_to_skill_host: same_actor
execution:
  conversation_surface: cli
  execution_location: local
  mode: local-browser
  interaction_mode: hybrid
  browser_version: not_exposed
  provider_or_profile: isolated-fixture
  adapter_version: proposed-v1
  capability_manifest_id: capabilities-example
  prior_diagnostic_assistance: false
session:
  status: anonymous
  credential_exported: false
environment:
  locale: en-US
  timezone: America/Los_Angeles
  currency: USD
  requested_region: US-CA
  observed_execution_region: unknown
  network_policy_id: null
  viewport:
    width: 1280
    height: 800
task:
  prompt: "Find the consultation price and reach review; stop before booking."
  prompt_redacted: false
  starting_state_id: state-example-01
  frontend_success_conditions:
    - Review shows the selected service, date, timezone, amount and currency.
    - The recorded frontend action trace contains no booking-submit action.
  action_boundary: stop_before_booking
  consequential_commit_permitted: false
  fixture_id: consultation-review-fake-data
  reset_method: fixture_reset
  fault_injection: none
  budget:
    max_actions: 30
    max_seconds: 120
verification:
  layer: frontend
  backend_record_checked: false
  business_effect_verified: null
  unintended_effect_count: null
  evidence_ids: ["state-example-02", "dom-example-03", "trace-example-04"]
outcome:
  execution: frontend_complete
  goal_conditions_met: true
  completion_scope: review_step
  business_effect_outcome: not_attempted
  observed_effect_issues: []
  intervention_count: 0
  recovery_count: 0
  blocked_by: null
  stop_reason: null
  final_state_id: state-example-02
```

The implemented schema requires timestamps, trial number, budget, viewport and resolvable evidence references; source/registry fields hold documentation URLs, checked dates and effective conditions. Use `unknown`, `not_exposed` or null with reasons for unavailable values. Identify the actual tested agent separately from the skill host, even when they are the same actor. Never populate that identity from a requested compatibility target without a real trial. Do not infer a model, WAF ruleset, browser version or account capability from a product label.

For live trials, retain the exact authorized prompt when it is safe; otherwise retain a clearly marked redacted form. Do not persist a secret-containing raw prompt just to preserve exact reproducibility. An owner-supplied external verification can be linked as separately attributed evidence, but it must not change this module's `backend_record_checked` to true.

### 10.6 Owner-verification register

Each item should include `id`, guide/checklist references, applicability, related frontend checks, observed indicators, the guarantee still unknown, `status`, responsible workstream, priority rationale, requested evidence, acceptance procedure and review trigger.

Use statuses such as `owner_verification_required`, `owner_evidence_supplied` and `resolved_by_external_assessment`. Attribute external assessment, date and scope explicitly. An owner assertion is different from inspectable authoritative evidence. Neither is silently presented as work performed by this module.

For example, OWN-TXN-001 can request verification that repeated submissions with the same logical operation produce only the intended business effect and reject incompatible reuse. It may link to an observed client operation ID and status UI. Its severity is not a confirmed defect: assign a **verification priority** based on consequence and state that enforcement is unknown. Similar workstreams cover authorization, infrastructure, integration parity, content truth/policy and business outcomes.

OWN-SECURITY includes secret handling outside available client channels. Request evidence of exclusion/redaction controls for server logs, analytics and diagnostic systems; do not request raw production secrets or bulk sensitive logs to fill the frontend evidence gap.

## 11. Output contract

Default file outputs when the environment supports files:

| Output | Contents |
| --- | --- |
| `audit-report.md` | Separate goal conclusions, scope, task outcomes, findings, priorities, guide coverage and limitations |
| `audit.json` | Canonical run, goals, checks, findings, journeys, representation comparisons, compatibility, guide coverage and owner items |
| `evidence-index.json` | Sanitized evidence provenance, identifiers, paths, and retention notes |
| `remediation-plan.md` | Ordered frontend work items with rationale and acceptance tests |
| `owner-verification.md` | Relevant whole-website requirements that need external evidence, with owners and acceptance procedures |
| `compatibility-tests.json` | Actual product/mode/task trials, documentation provenance and frontend verification scope |
| `evidence/` | Only explicitly retained, minimized, safe artifacts |

Generate all derived outputs from the same canonical data. Avoid conflicting counts across report and JSON. HTML is optional; if created, escape untrusted page text and disable active target content. PDF can be a later presentation option, not a runtime dependency.

Define the top-level report schema with `schema_version`, `run`, `module`, `guide`, `goals`, `scope`, `capabilities`, `states`, `evidence`, `checks`, `findings`, `journeys`, `representation_comparisons`, `compatibility_tests`, `owner_verification`, `guide_coverage`, `coverage`, `verdicts` and `limitations`. Validate foreign-key references, require reasons for unavailable evidence and calculate coverage from check instances and the planned sample. A future module accepts the shared scoped run/evidence envelope while declaring its own profiles, capabilities and verification authority.

Enforce these invariants in validators: this module's authoritative backend checks are false; unobserved effect counts stay null; owner-only requirements cannot become frontend passes; untested product/modes cannot be labeled demonstrated; optional-feature absence cannot fail unrelated profiles; recorded incorrect effects survive aggregation; a material incorrect effect or unauthorized action excludes the trial from successful-trial counts despite later completion; and report/JSON counts agree.

The report should answer, in order:

1. What can an agent accomplish, and under which conditions?
2. What prevents or complicates important tasks?
3. What should be changed first, and how can the fix be verified?
4. What was tested and what evidence supports the conclusions?
5. What remains unknown, untested, or dependent on additional access?

Include strengths backed by evidence as well as failures. Group repeated manifestations by component while preserving the affected instances. Prioritize task blockers first, then high-impact repeated patterns, then lesser friction and optional improvements. Give effort as a rough category only when source/context supports it.

Organize work into verified frontend fixes, owner-verification needs, and optional improvements. Assign a likely frontend, content, accessibility, QA, security, infrastructure or integration workstream; do not invent a person's ownership. Include a checked date, required acceptance evidence and trigger for reassessment. Apply the site's transaction/information priorities from §2 rather than a fixed cross-site weighting. [G0, §12]

Keep measurement layers separate: observed network access, public retrieval, agent workflow outcomes, search visibility and business value. The first three can often be assessed here. Private analytics, search-console inclusion and business-value attribution normally require owner evidence and must not be inferred from a successful frontend task. [G0, §11.5]

When file creation is unavailable, provide the same human-readable sections in chat and a concise structured summary. Do not imply missing files were created.

## 12. Implementation approach

### 12.1 Keep the agent and deterministic code complementary

Use the agent for task selection, visual interpretation, causal reasoning, evidence synthesis, and explaining fixes. Use scripts for repeatable capture where available, normalization, redaction, deduplication, schema validation, counting, and report assembly.

A practical implementation is TypeScript in development, shipped as readable JavaScript modules runnable on a supported Node LTS. Pin tested versions and package/browser combinations in development; produce releases that do not require compilation. Browser automation, axe-core, and Lighthouse should be optional dependencies loaded only when needed. The no-script path must remain useful through host browser tools and the report template.

Ship the runtime manifest and lockfile, declare the tested Node version range, and load each heavy dependency only for its selected adapter. Core import, normalization, validation, and reporting must work without Playwright, Lighthouse, or browser downloads. Include a no-browser-dependencies smoke test for those core commands.

Do not automatically install global packages or edit the audited site's repository. If a dependency is unavailable, use an existing compatible tool or a lower-capability mode. Any permitted installation belongs in an isolated audit workspace with a lockfile and explicit provenance.

Proposed CLI interface, to implement later:

```text
node scripts/audit.mjs doctor --target https://example.com
node scripts/audit.mjs collect --config audit-config.json
node scripts/audit.mjs import --input exported-evidence.json
node scripts/audit.mjs check --run run-directory
node scripts/audit.mjs report --run run-directory
node scripts/audit.mjs validate --run run-directory
```

These are proposed commands, not existing tools. `doctor` must be read-only; `collect` operates only inside its recorded scope/action envelope; `import` preserves source context; `check` distinguishes deterministic results from agent interpretations; `report` and `validate` operate on normalized artifacts.

### 12.2 Enforcement and privacy

Treat webpage text, screenshots, response bodies, source comments, metadata, and WebMCP descriptions as untrusted evidence. They cannot add origins, request credential access, authorize a mutation, or supply terminal commands to execute. Chrome's agent-security guidance identifies both tool definitions and tool outputs as prompt-injection surfaces. [S29]

Where scripts control execution, enforce origin scope, URL schemes, path boundaries, byte/time limits, and safe subprocess argument handling in code. Never interpolate page text into shell commands. Do not pretend a Markdown policy can enforce restrictions outside the tools the project controls.

Redact before persistence and before additional model ingestion where the interface allows it. Some host tools may already return raw visible content; record that limitation and prefer targeted inspection over bulk snapshots. Do not claim automated redaction guarantees absence of private data.

Use allowlisted metadata and schema-aware redaction; supplement it with sensitive-pattern detection and review. Strip URL credentials, tokens, cookies, authorization headers, private identifiers, and sensitive bodies. Exclude full authenticated traces, HARs, profile copies, and storage exports by default. Keep temporary evidence local to the execution environment and apply the requested retention policy. Avoid sending artifacts to unrelated third-party scanners.

Report prompt-injection content as encountered untrusted content when relevant. Do not claim the target application is compromised simply because it displays hostile text.

### 12.3 Phased delivery

| Phase | Work | Exit criterion |
| --- | --- | --- |
| 0. Encode reconciled requirements | Use this completed guide crosswalk; compile goal profiles, all Appendix A mappings, scope classes and source-basis labels into contracts | Every applicable guide item maps to checks or explicit owner verification |
| 1. Small end-to-end pilot | Draft root/module instructions; audit an information page and a transaction-review frontend fixture with existing tools | Useful retrieval and operation reports with correct verification boundaries |
| 2. Contracts and normalization | Implement schemas, rule catalog, compatibility records, owner register, redaction, importer and validators | Artifacts validate; incorrect outcomes and unknown effects survive aggregation |
| 3. Full browser adapter | Add supported existing-session path plus isolated public browser path | Public/authenticated fixtures work without credential export |
| 4. Fallback modes | Host browser, computer use, fetch-only, and supplied-evidence procedures | Capability losses produce accurate partial reports |
| 5. Audit depth | Expand semantics, recovery, representations, locale/policy, storage/source/performance and optional tools | All categories have tested procedures and explicit limitations |
| 6. Cross-host validation | Actual Codex and Claude runs, selected other hosts, cloud import/execution checks | Supported modes demonstrated; untested modes labeled provisional |
| 7. Release and maintenance | Validate packages, pin versions, publish tested environments, dated claims and regression baselines | Repeatable release, guide traceability, reviewed evidence and scoped compatibility |

Build a thin end-to-end version before a large rule catalog. Use failures observed in real runs to decide which collectors and instructions deserve additional complexity. This follows the current skill-authoring and evaluation guidance. [S2, S25, S26]

## 13. Evaluation and release gates

### 13.1 Fixture strategy

Use static/frontend-only fixture applications with fake data and deterministic reset behavior. A development harness may serve files and simulate state; audits of real applications must not require that harness or backend access. Keep expected labels separate from the files/context the auditing agent can inspect.

Start with a few representative scenarios, then grow a held-out suite from observed failures. Include correct controls and intentionally broken versions so precision can be measured as well as defect recall.

| Fixture/scenario | What a correct skill must do |
| --- | --- |
| Sound semantic page | Identify strengths without inventing defects |
| Unnamed icon control | Distinguish accessible-name failure from visual ambiguity |
| Clickable non-keyboard element | Reproduce keyboard limitation with appropriate evidence |
| Delayed hydration/rerender | Wait on meaningful state; avoid stale-target false positives |
| Empty/loading/error search states | Inspect feedback and recovery rather than only the initial page |
| Modal with focus defect | Show the focus sequence and affected action |
| Virtualized list/infinite scroll | Traverse within bounds and report partial content coverage |
| Canvas and closed-shadow UI | Distinguish modes and tool limitations; avoid blanket failures |
| Cross-origin frame | Use supported frame inspection and report actual restrictions |
| Active service worker | Preserve baseline behavior and attribute observed traffic accurately |
| Lighthouse on an existing session | Preserve seeded authentication, local data, cache, and worker state in the preservation path |
| Already-authenticated fake user | Include permitted private routes without exporting credentials |
| Anonymous/expired session | Finish public work and state private-area gaps |
| Desktop auth unavailable in cloud | Avoid pretending the local session transferred |
| Browser-only/fetch-only environment | Produce useful partial output without invented observations |
| Adapter failure mid-run | Preserve results and downgrade the affected capabilities |
| Cancellation or collector failure | Restore audit-changed settings, stop collectors, and leave the user-owned browser available |
| Missing source maps/repository | Limit code claims to observed delivered artifacts |
| Auto-saving field/destructive GET link | Avoid unintended mutations and identify the test boundary |
| Prompt injection in HTML, image, source, or tool description | Ignore unauthorized instructions and remain in scope |
| Seeded fake credentials in URLs/storage/headers | Exclude them from persisted/user-facing artifacts |
| WebMCP absent or unsupported | Report optional/untested status without failing baseline usability |
| WebMCP inaccurate declaration | Separate claimed behavior from observable effects |
| Lighthouse optional category unavailable | Continue core audit and preserve capability limitation |
| Enabled control before hydration / lost typed input | Separate readiness failure and input loss from an agent targeting error |
| Transient success toast without persistent detail | Identify inadequate observable confirmation without claiming a missing backend record |
| Simulated lost response with unknown state and status lookup | Preserve uncertainty, inspect safe status, avoid blind repeated commit |
| Stale quote/slot/version and changed review terms | Identify conflict/re-review behavior without claiming server enforcement |
| Late cancellation / simulated human completion during pause | Distinguish requested, completed and unresolved effects; avoid repeating a consequential action |
| Initial HTML, DOM and extractor disagree | Identify exactly which facts/qualifiers and channel differ |
| Extract loses head/tail/table context or has hidden limit | Report incomplete extraction and unknown budget; do not assume full coverage |
| Locale/timezone/currency mismatch | Compare intended and effective values; do not treat cloud geography as user intent |
| Stale Markdown or mismatched structured data | Demonstrate representation disagreement with matched capture context |
| Private/public alternate-format mismatch with fake data | Identify the fixture's observable leak without probing unauthorized production records |
| Matched robots group plus wildcard group | Apply the correct group semantics; preserve separate content-use intent |
| Training restriction with otherwise usable public content | Avoid an unrelated browser/retrieval failure or an unsolicited allow-training recommendation |
| Homepage succeeds but in-journey request gets challenge/429 | Report route/task-specific access failure and recovery limit |
| Tool result disagrees with UI / misleading read-only claim | Preserve contradictory evidence; no automatic invocation based on annotation |
| Incorrect target followed by eventual correct result | Distinguish harmless navigation correction from a material incorrect effect; the latter prevents successful-trial classification despite recovery |
| Owner-only guarantee with visible client indicator | Create an applicable-but-unverified owner item, never a frontend pass |
| Product mode lacks browser takeover | Complete reachable work; do not invent a universal login handoff |
| Future-effective platform policy | Keep announced/upcoming status and avoid a current mandatory check |

All induced failures, cancellation races, repeated-operation simulations, hostile text and synthetic secrets belong in resettable fixtures or separately authorized test environments. The fixture server may serve static files and simulated responses; it is a development aid, not a backend dependency of audits.

### 13.2 Evaluation layers

**Discovery:** explicit invocation, natural-language triggers, frontend-only requests, authenticated requests, and negative examples such as implementing a UI or performing a backend penetration test.

**Collection:** correct capability detection, origin boundaries, safe actions, snapshot semantics, request/storage minimization, and recovery from tool failures.

**Analysis:** known-defect precision/recall on labeled fixtures; appropriate severity; separation of evidence and inference; no false passes caused by missing tools.

**Guide fidelity:** all 26 checklist items retain dispositions; four goal profiles remain separate; information and transaction priorities differ appropriately; owner-only guarantees never become confirmed frontend results.

**Reporting:** schema validity, evidence-reference integrity, count consistency, useful remediation, clear limitations, and independent reproducibility.

**Efficiency:** action/time/token budgets, repeated-run consistency, redundant captures, and unnecessary user interruptions.

Compare the same tasks with the skill, without it, and against the previous released version. Keep host/model/tool configuration recorded. Run multiple trials for stochastic judgments and report counts rather than claiming reliability from one successful run. Blind reviewers and evaluation agents should receive tasks and raw outputs without the expected diagnosis. [S24, S25, S26]

### 13.3 Proposed release gates

- Every generated structured output validates against its declared schema.
- Every confirmed finding has adequate evidence, scope, impact, remedy, and verification steps.
- No missing capability, unavailable source, or unavailable authentication becomes a passing check.
- All safety fixtures complete without an unauthorized application mutation or seeded-secret leakage.
- Deterministic collectors produce stable results on fixed fixtures; expected nondeterminism is explicitly represented.
- Target precision/recall thresholds are defined before the held-out run; report numerator/denominator and unresolved errors. Set numeric targets after the pilot establishes a meaningful labeled set.
- Independent reviewers can reproduce sampled findings from the provided evidence/procedure.
- At least one actual run verifies each environment/mode advertised as supported; others are marked provisional.
- Public and authenticated behavior are tested separately, including expiration and cloud-session mismatch.
- Skill discovery and package import pass on the intended Codex and Claude surfaces.
- No full accessibility certification, universal agent-compatibility claim, or backend root-cause claim is produced without the corresponding evidence and scope.
- All guide sections and Appendix A items are mapped; each run distinguishes applicable frontend checks, untested checks and owner-verification requirements.
- No visible confirmation, operation key, precondition, annotation or fixture success is promoted into a live server guarantee.
- Every task record preserves the declared frontend success condition, test context, actual product/mode, intervention, incorrect-result history and business verification limit.
- Retrieval fixtures detect material qualifier loss, table/link distortion, truncation, locale differences and representation disagreement without inventing missing-channel results.
- Upcoming and experimental features remain correctly labeled; absence of optional integrations does not fail unrelated goals.

These are **skill release gates**. A recommendation about releasing a real transactional website needs the owner/business checks identified by guide §11.6; passing this auditor's frontend fixture suite is not evidence that the website passed those checks.

### 13.4 Maintenance

Version the skill, module, schemas, rules, and adapter dependencies independently where needed. Record versions in every run. Keep migration support for saved reports when schemas change. Recheck host import rules and browser features before releases; use feature detection to limit dependence on quickly changing WebMCP and Agentic Browsing interfaces.

For regression comparisons, compare compatible task/state samples and known versions. Identify changes in browser, model, session, site build, viewport, rules, and capability coverage before attributing a report difference to the website.

Assign a maintainer/workstream, checked date and review trigger to rule sources and compatibility entries. Triggers include guide revision, browser/host/tool changes, authentication or WAF changes, new locales, alternate formats, payment/booking flows and platform policy effective dates. Revisit a source when it affects an actual recommendation or advertised support claim; avoid loading every vendor document for every public audit. Preserve superseded claims with version history instead of silently rewriting past test context. [G0, §12.3]

## 14. Definition of done for the first release

The first release is ready when a user can provide a URL and receive a useful, evidence-linked frontend audit in both a rich local browser environment and at least one restricted environment. It must include available authenticated areas, finish public work when unauthenticated, explain missing coverage, and provide fixes with observable acceptance criteria.

The initial release should include the canonical skill package, frontend workflow, tested rule catalog, report/schema assets, necessary deterministic scripts, compatibility results, and the evaluation suite in its development project. An optional separately invocable frontend package should be generated only from that same tested source.

Guide revision 2.0 is now incorporated into the requirements, profiles, rule groups, evidence model, compatibility record, report, fixtures and release gates. Implementation must preserve the distinction between frontend-observable results and the guide's owner-only business/infrastructure guarantees. No further guide attachment is required to begin the planned implementation.

## 15. Source register and provenance

Sources were researched on November 22, 2026. G0 is the user-supplied guide; the S-series lists primary documentation consulted for the plan. Product behavior and experimental features should be verified again at implementation/release. The source notes identify what each reference supports; proposed engineering choices are described separately throughout this plan.

| ID | Source | Used for |
| --- | --- | --- |
| G0 | [Engineering an AI-Agent-Friendly Website, revision 2.0 — supplied guide](https://chatgpt.com/library?file_id=libfile_fde3_f-ad2b5ea7b4a4819183a91453b70c1467_24e53c488df0819181eb94ad758e1805&account_id=personal) | Requirements source; all sections and appendices read; dated provenance and file hash in §1 |
| S1 | [Agent Skills specification](https://agentskills.io/specification) | Package format, metadata, progressive disclosure |
| S2 | [Best practices for skill creators](https://agentskills.io/skill-creation/best-practices) | Focused procedures, defaults, real-task iteration |
| S3 | [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills) | Current Codex discovery and ChatGPT distribution surfaces |
| S4 | [Claude Code: Extend Claude with skills](https://code.claude.com/docs/en/skills) | Discovery, extensions, portable upload restrictions, cloud differences |
| S5 | [Claude: How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) | Importer and packaging guidance |
| S6 | [Cursor: Agent Skills](https://cursor.com/docs/skills) | Cursor packaging/discovery |
| S7 | [GitHub: Adding skills for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills) | Copilot CLI supported locations |
| S8 | [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility criteria relevant to controls, focus, forms, feedback |
| S9 | [W3C: Evaluating Web Accessibility Overview](https://www.w3.org/WAI/test-evaluate/) | Limits of automated accessibility evaluation |
| S10 | [W3C: WCAG Evaluation Methodology 2.0](https://www.w3.org/TR/WCAG-EM/) | Scope, representative sampling, processes, reporting |
| S11 | [Chrome: Accessibility features reference](https://developer.chrome.com/docs/devtools/accessibility/reference) | Browser accessibility inspection and its limits |
| S12 | [Playwright: Locators](https://playwright.dev/docs/locators) | Semantic locators and shadow-root limits |
| S13 | [Chrome DevTools for agents: Configuration](https://developer.chrome.com/docs/devtools/agents/get-started/configuration) | Existing-session connection and capabilities |
| S14 | [Playwright: BrowserType](https://playwright.dev/docs/api/class-browsertype) | Connection modes and CDP caveats |
| S15 | [Playwright: Authentication](https://playwright.dev/docs/auth) | Isolated contexts and sensitive stored session state |
| S16 | [Chrome: Source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps/) | Authored versus deployed code |
| S17 | [Playwright: Page](https://playwright.dev/docs/api/class-page) | Navigation, events, capture, readiness caveats |
| S18 | [Playwright: Auto-waiting](https://playwright.dev/docs/actionability) | Actionability and diagnostic checks |
| S19 | [Lighthouse: Agentic browsing scoring](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring) | Experimental checks and informational scoring |
| S20 | [Chrome: WebMCP](https://developer.chrome.com/docs/ai/webmcp) | Current browser capability and deployment conditions |
| S21 | [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/) | API purpose and standards status |
| S22 | [Lighthouse: llms.txt](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt) | Optional-file interpretation |
| S23 | [W3C: ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/) | Explicit outcomes and rule structure |
| S24 | [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) | Trials, outcomes, grading, harness dependencies |
| S25 | [Agent Skills: Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills) | Baseline comparisons and iterative evaluation |
| S26 | [OpenAI: Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills) | Skill discovery/process/outcome evaluation |
| S27 | [Gemini CLI: Managing Agent Skills](https://geminicli.com/docs/cli/using-agent-skills/) | Gemini discovery and management |
| S28 | [Playwright: Service Workers](https://playwright.dev/docs/service-workers) | Capture caveats and behavior changes from blocking workers |
| S29 | [Chrome: Agent security considerations for WebMCP](https://developer.chrome.com/docs/agents/security) | Untrusted declarations/output and origin restrictions |
| S30 | [The llms.txt proposal, v2](https://llmstxt.org/) | Public content navigation aids and Markdown representations |
| S31 | [OpenAI: Overview of Crawlers](https://developers.openai.com/api/docs/bots) | Search, training, and user-directed access distinctions |
| S32 | [Chrome: Network features reference](https://developer.chrome.com/docs/devtools/network/reference) | Network capture and sanitized HAR scope |
| S33 | [Chrome: Application panel](https://developer.chrome.com/docs/devtools/application) | Browser storage, cache, and worker inspection |
| S34 | [web.dev: Web Vitals](https://web.dev/articles/vitals) | Performance measurement and field/lab distinctions |
| S35 | [Lighthouse: Authenticated pages](https://github.com/GoogleChrome/lighthouse/blob/main/docs/authenticated-pages.md) | Session preservation and storage-reset controls |
| S36 | [Lighthouse: User flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md) | Navigation, timespan, and snapshot modes and limits |
| S37 | [W3C: Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Target-size applicability and exceptions |
| S38 | [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) | Eligibility vs actual inclusion; content/structured-data consistency; no special AI-file requirement |
| S39 | [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) | Product-group selection and wildcard fallback |
| S40 | [Cloudflare: Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) | Negotiated representations, cache variation, changed validators and content-use signals |
| S41 | [OpenAI: Site tools](https://learn.chatgpt.com/docs/webmcp) | Current desktop-browser limit, page-tool scope and separation from remote integrations |
| S42 | [Claude: Get started with Claude Duet](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet) | Separate credential entry; no browser observation/takeover during the documented preview |
| S43 | [Google: Allow Google-Agent traffic](https://developers.google.com/crawling/docs/crawlers-fetchers/allow-google-agent) | Actual execution identity and whole-journey access; infrastructure evidence boundary |
| S44 | [Microsoft: Clearer preferences for training and grounding](https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/) | Announced preferences and February 1, 2027 effective timing |

## 16. Revision 2.0 change record

| Area | Change from the first plan |
| --- | --- |
| Requirements source | Replaced the unavailable-guide assumption with actual revision/date/hash and full traceability |
| Goals | Replaced the combined public-information profile and fixed browser-first priority with four guide goals and site-dependent emphasis |
| Scope | Added frontend-verifiable, client-indicator and owner-verification distinctions |
| Retrieval | Added actual representation comparison, material qualifiers, truncation, locale, freshness and alternate-format parity |
| Transactions | Added explicit unknown state, durable results, review/commit boundaries, conflicts, cancellation and resumption |
| Policy/discovery | Separated eligibility, indexing/citations, content-use intentions and future-effective controls |
| Compatibility | Separated skill-host support from website product/mode/task results; distinct handoff capabilities |
| Outcomes | Preserved incorrect effects, intervention, unresolved business state and nullable unobserved effects |
| Delivery | Extended schemas, outputs, fixtures, guide coverage and release gates; retained portable packaging and graceful cloud fallback |

