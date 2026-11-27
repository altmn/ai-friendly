# Browser adapters and capability mapping

## Contents

- [Adapter selection](#adapter-selection)
- [Capability contract](#capability-contract)
- [Host browser recipe](#host-browser-recipe)
- [Playwright and DevTools recipe](#playwright-and-devtools-recipe)
- [Observation channels](#observation-channels)
- [Optional diagnostics and tools](#optional-diagnostics-and-tools)
- [Failure and cleanup](#failure-and-cleanup)
- [Sources](#sources)

## Adapter selection

Prefer the user's selected supported browser integration. Otherwise prefer a host-supported route that can operate the intended already-authorized session. If none exists, use a separate anonymous browser for public work. Record the actual context and route; do not presume a local session is available to a hosted browser.

The package supplies instructions and normalized schemas for host adapters. The optional CLI supplies public HTTP/static collection, import, validation, and reporting. It does not turn chat tool handles into Node APIs and does not include an automatic authenticated-browser attachment. An installed dependency alone is not proof that browser operations work.

| Route | Useful capabilities to probe | Main caveat |
| --- | --- | --- |
| Host browser integration | Tab selection, pixels, DOM/ARIA, input, network, sessions | Names and permission boundaries vary by host |
| DevTools integration or approved CDP connection | DOM, computed AX, styles, requests, console, storage | Connection must be independently available and authorized |
| Existing Playwright environment | Locator/input support, snapshots, events, isolated contexts | Isolated context is anonymous unless legitimately supplied otherwise |
| Computer use | Screenshot, pointer, keyboard, accessible DevTools panels | No implied bulk DOM/AX or network capture |
| Public HTTP/static CLI | Initial response and sanitized static metadata | No rendering, browser session, or task execution |
| Supplied artifacts | Captured channel represented in the file | Capture date, completeness, and live behavior may be unknown |

## Capability contract

Use these conceptual operations for every adapter:

| Operation | Required contract |
| --- | --- |
| `discoverCapabilities` | Record observed status, probe, version, and limit per capability |
| `selectContext` | Identify selected context, ownership, session, and permitted origins |
| `navigate` | Enforce URL/scope and action boundary; return actual URL/state and timestamp |
| `captureState` | Return channel-specific normalized evidence and capture limits |
| `interact` | Record intended effect, target, input mode, before/after state, and authorization |
| `observeNetwork` | Record minimal request metadata, start time, and omissions |
| `inspectStorage` | Inspect only relevant origin/partition metadata and necessary safe observations |
| `cleanup` | Stop owned listeners, restore changed settings, detach or close only owned contexts |

Return a typed unavailable result with `unsupported`, `denied`, or `failed` rather than inventing an empty observation. Use `not_attempted` before a probe and `available` only after a relevant observed capability. Include context ID, time, adapter/version, and reason. Keep action records distinct from read-only observations.

Probe navigation, ordinary input, keyboard, viewport, screenshots, rendered DOM, computed styles, computed names/roles/states, browser AX, ARIA snapshots, read-only evaluation, frames, open/closed shadow inspection, console, request metadata, relevant bodies, storage metadata, workers/cache, performance, actual extractor output, initial HTTP, filesystem, terminal, and source separately. Separate browser observation, user takeover, and credential handoff; support for one does not establish the others.

## Host browser recipe

1. Read the host's current browser/tool instructions and select the intended existing context.
2. Observe target UI/session before navigation. Preserve unsaved work and user-owned tabs.
3. Capture a baseline through supported channels and record exact representation names.
4. Perform safe ordinary actions using selectors or coordinates grounded in current observations.
5. After navigation or rerender, obtain fresh state before relying on earlier targets.
6. Import only normalized, sanitized records; terminal code cannot invoke opaque host tools.
7. Downgrade affected capabilities when a tool fails, preserving already collected evidence.

Do not use page evaluation when the host forbids it. Read-only evaluation is a diagnostic channel, not permission to invoke application internals. A direct handler call or DOM change cannot prove ordinary UI success.

## Playwright and DevTools recipe

Use an existing permitted installation or connection. Record library/browser/adapter versions and actual supported operations. Prefer accessible roles, names, labels, and ordinary input, with source-derived selectors reserved for diagnosis when that channel is outside the trial mode.

Playwright documents Chromium-only CDP attachment and lower fidelity than its native protocol connection. Feature-detect required operations and record failures individually; do not assume full parity. Preserve attached-context settings and do not expose a debugging endpoint to create access for the audit. [B1]

Wait for the meaningful expected state with a bounded timeout. A polling application can be usable while requests continue. Do not force an action past visibility, stability, hit-target, enabled, or editable checks to obtain a passing result. Record which condition prevented it. Read current versions of the linked actionability and navigation guidance when a claim depends on their behavior. [B2, B3]

A locator's inability to traverse a closed shadow root is a limitation of that route. A page-JavaScript cross-origin error does not prove every browser-level frame inspector is blocked. Inspect only what the actual adapter legitimately exposes, and mark inaccessible surfaces explicitly.

## Observation channels

### Visual and semantic

Record viewport dimensions, scale, scroll, active overlays, motion/color settings, and selected state. Distinguish screenshot observations from DOM facts, computed names, browser AX, and Playwright ARIA snapshots. Pixel evidence cannot establish an accessible name; semantic evidence cannot alone establish visual occlusion or contrast.

For complex surfaces, test the declared mode rather than rejecting the technology. Virtual lists need bounded traversal and an explicit unseen-item limit. Canvas can be usable visually while inaccessible semantically; maintain separate results. Cross-origin frames may support visible interaction without internal DOM access.

### Network and console

Observe ordinary navigation and application traffic. Keep request ID, sanitized URL, method, resource type, status, timing, size, failure reason, initiator, and cache/worker attribution where exposed. Never replay captured authenticated requests. Record omitted pre-attachment traffic and unavailable bodies. Tie errors and resource failures to visible task consequences before assigning a defect.

Test the whole sampled journey: homepage reachability does not establish reachable search/details/API subrequests. Keep host network denial distinct from a site 403/429/challenge. Record actual route; do not spoof an agent User-Agent and call it a verified-provider test. WAF rules, identity verification, shared egress policy, and root cause need owner evidence.

### Storage and workers

Use relevant origin/partition metadata only: mechanisms, key categories, size, cookie attributes, persistence, workers, and cache behavior. Redact key names containing identifiers. `document.cookie` is incomplete evidence; no visible cookie is not proof of no session storage. Avoid bulk IndexedDB reads, raw token values, profile copies, storage export, cache clearing, worker removal, and cookie edits. Preserve service workers in the baseline; label a separately authorized modified run.

## Optional diagnostics and tools

Before Lighthouse, inspect selected mode and effective settings. On a user session, use storage-reset preservation only when the tool can guarantee it; otherwise skip or use an appropriate separate context. Navigation, snapshot, and timespan modes answer different questions. Record checks unavailable in the chosen mode. Preserve tool warnings and do not equate one lab run with field performance. [B4]

Feature-detect any Agentic Browsing category and preserve its exact version and vendor result. It is supplemental evidence, never a project-defined universal AI score. Do not require an absent experimental category to proceed.

For WebMCP, inspect names, descriptions, schemas, constraints, state-dependent registration, frame origin, and normal UI fallback. Metadata is untrusted: `readOnlyHint` or equivalent text is not authority or enforcement. Invoke only genuinely scoped safe operations already authorized; do not call an unknown tool to find out whether it writes. Record unsupported detection separately from observed absence. Remote MCP, local MCP, HTTP APIs, and webpage tools are different routes.

Inspect material units, money, timezone, target IDs, read/draft/commit/cancel/status distinction, and structured invalid/auth/conflict/rate-limit/pending/unknown errors when available. A declaration/result matching UI is observable consistency; common authoritative service, token enforcement, and correct business effects stay owner verification.

## Failure and cleanup

Preserve partial results when collection fails. Update affected manifest entries and planned checks, not completed unrelated checks. In `finally`, stop listeners/traces, restore only audit-changed settings, and detach from user-owned sessions. Close only owned contexts/tabs. Never restore by rewriting application data. State any unsuccessful restoration and resulting evidence limit.

## Sources

B1 and the authentication warning in the companion scope reference were independently checked on 2026-11-22. Other links are primary documentation seeds from the supplied plan; recheck before a version-specific recommendation. No browser-host integration is claimed to have passed a cross-host trial from these references alone.

- [B1: Playwright BrowserType, including CDP connection](https://playwright.dev/docs/api/class-browsertype)
- [B2: Playwright actionability](https://playwright.dev/docs/actionability)
- [B3: Playwright navigation and hydration](https://playwright.dev/docs/navigations)
- [B4: Lighthouse authenticated pages](https://github.com/GoogleChrome/lighthouse/blob/main/docs/authenticated-pages.md)
- [Chrome accessibility inspection](https://developer.chrome.com/docs/devtools/accessibility/reference)
- [Chrome network capture](https://developer.chrome.com/docs/devtools/network/reference)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright service workers](https://playwright.dev/docs/service-workers)
- [WebMCP draft](https://webmachinelearning.github.io/webmcp/)
