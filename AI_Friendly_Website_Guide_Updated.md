# Engineering an AI-Agent-Friendly Website

**A practical implementation, security, discovery, and testing guide for websites used by AI assistants and autonomous agents**

**Revision:** 2.0 · **Research checked:** November 22, 2026 · **Audience:** web developers, architects, product owners, security teams, and QA engineers

## Contents

- [Executive summary](#executive-summary)
- [1. Make the interface understandable through HTML and accessibility information](#make-the-interface-understandable-through-html-and-accessibility-information)
- [2. Make task progress, transactions, and recovery explicit](#make-task-progress-transactions-and-recovery-explicit)
- [3. Keep identity, authorization, and untrusted content separate](#keep-identity-authorization-and-untrusted-content-separate)
- [4. Configure CDN, firewall, and bot mitigation for real execution paths](#configure-cdn-firewall-and-bot-mitigation-for-real-execution-paths)
- [5. Offer APIs and agent tools when they improve the workflow](#offer-apis-and-agent-tools-when-they-improve-the-workflow)
- [6. Make public information retrievable, complete, and current](#make-public-information-retrievable-complete-and-current)
- [7. Separate search crawling, user-triggered retrieval, training, and grounding](#separate-search-crawling-user-triggered-retrieval-training-and-grounding)
- [8. Publish information that can be interpreted, checked, and attributed](#publish-information-that-can-be-interpreted-checked-and-attributed)
- [9. Consider Markdown, llms.txt, and other agent-facing extras only when useful](#consider-markdown-llms.txt-and-other-agent-facing-extras-only-when-useful)
- [10. Platform compatibility reference: product + mode + task](#platform-compatibility-reference-product-mode-task)
- [11. Test retrieval, browser interaction, tool use, and business outcomes separately](#test-retrieval-browser-interaction-tool-use-and-business-outcomes-separately)
- [12. Recommended implementation order and operating model](#recommended-implementation-order-and-operating-model)
- [Appendix A. Implementation and release checklist](#appendix-a.-implementation-and-release-checklist)
- [Appendix B. Reusable compatibility-test record](#appendix-b.-reusable-compatibility-test-record)
- [Appendix C. Source register and verification notes](#appendix-c.-source-register-and-verification-notes)

> **Core principle:** Build a website that people and assistive technologies can understand and operate reliably. Then make public information retrievable, consequential actions verifiable, and supported agent integrations explicit. Optimization for AI agents does not replace accessibility, security, or ordinary search optimization.

## Executive summary

A website may encounter AI systems in four different roles. Each requires different engineering work; no single file, user-agent rule, or protocol makes a site universally “AI-ready.”

| Goal | Agent activity | Primary engineering work |
|---|---|---|
| **Retrieve** | Read a page or fetch public facts | Useful initial HTML, stable URLs, accurate extraction and freshness |
| **Operate** | Search, choose, fill forms, upload, review, and submit | Semantic controls, stable layout, observable state, safe transactions |
| **Discover and cite** | Find pages through search and use them in an answer | Crawl/index eligibility, useful content, metadata, structured data where appropriate |
| **Integrate** | Use a service through a connected tool | Documented APIs/MCP, least-privilege access, structured errors, durable operations |

**Five rules should guide every implementation:**

1. **Test the real execution environment.** A local Chrome extension, a hosted cloud browser, a text extractor, and a remote MCP client may reach the same website differently.
2. **Separate identity from authority.** Verifying a request as a legitimate agent can inform bot mitigation; it does not authorize account access or a business transaction.
3. **Make outcomes recoverable.** Timeout, retry, cancellation, and human interruption must not create duplicates or conceal whether a change happened.
4. **Check current business state at commit.** Idempotency prevents duplicate effects; it does not prevent a stale price, slot, permission, or record version from being accepted.
5. **Measure correct results, not just agent claims.** Inspect server state, unintended changes, and safe failure behavior, and record the browser/tool configuration for every test.

**For transaction-heavy websites**, give priority to authentication, authorization, state, retries, conflicts, and confirmation. **For information-heavy websites**, prioritize public HTML, retrieval fidelity, discoverability, locale, and freshness. For **mixed websites**, both sets of work matter. API/MCP integrations are often valuable for repeated structured tasks; Markdown, `llms.txt`, and WebMCP should be adopted when the relevant clients actually use them.

### How to interpret this guide

Requirements are identified by their basis rather than presented as universal obligations:

| Label | Meaning |
|---|---|
| **Standard** | Based on an established web or protocol specification; applicability depends on the feature. |
| **Platform-documented** | The named operator documents this behavior for a specific product, version, or execution mode. |
| **Engineering recommendation** | Proposed design or test that improves reliability; not a claimed vendor requirement. |
| **Experimental/optional** | Requires client support, configuration, an experiment, or an observed return on effort. |
| **Unverified** | Public evidence reviewed here does not support a compatibility claim. |
| **Announced/upcoming** | A future-dated change; do not describe it as already in force. |

Provider capabilities change quickly. Use the dated **platform appendix (Section 10)** and the source register at the end as a verification starting point, not as a permanent contract. The website owner must also choose its own policy about automated access, model training, and AI grounding; discoverability and training permission are not the same choice.

---

## 1. Make the interface understandable through HTML and accessibility information

Browser agents may inspect **screenshots**, the **DOM/HTML**, and/or the **accessibility tree**. Those channels should agree about the identity, purpose, current value, and availability of controls. Semantic HTML is valuable both for users with assistive technologies and for machine interaction. Google’s agent-friendly guidance makes these connections explicit. [S01]

### 1.1 Use native controls and persistent names

Prefer anchors with real `href` values for navigation; buttons for actions; `input`, `select`, and `textarea` for data entry; associated `label` elements; `fieldset`/`legend` for grouped choices; and descriptive headings and landmarks. Give each action an accessible name that distinguishes it from nearby alternatives. Placeholder text is not a durable substitute for a label. [S02]

```html
<form action="/search" method="get" role="search">
  <label for="documentation-query">Search documentation</label>
  <input id="documentation-query" name="q" type="search" required>
  <button type="submit">Search documentation</button>
</form>
```

A list of repeated “Select” buttons is ambiguous. Use context such as “Select Professional plan,” or associate each short button label with the proper product or plan. If visible text says “Continue,” the accessible name should include that visible text rather than contradicting it: WCAG's **Label in Name** criterion addresses this directly. [S03]

Expose the current state of controls: selected options, checked boxes, disabled actions, expanded sections, validation errors, and active steps. Use native state whenever possible; add appropriate ARIA only where a native element does not provide the needed semantics. [S04]

### 1.2 Make the complete journey keyboard-operable

Test search, navigation, calendars, autocomplete, menus, file selection, dialogs, error recovery, checkout, and logout with a keyboard. Avoid a task's dependence on hover, precise dragging, tiny targets, hidden icon meanings, or rapid response to an ephemeral control. Provide equivalent controls for drag-only operations. For modal dialogs, manage initial focus, focus containment, escape/close behavior, and focus restoration. [S05], [S06]

As a practical interaction baseline, evaluate WCAG 2.2's **24 × 24 CSS-pixel** minimum target-size criterion and its exceptions. Larger targets often help screenshot-based agents and people alike. [S07]

### 1.3 Stabilize layout and wait until controls actually work

Reserve space for images and asynchronously loaded widgets. Prevent sticky banners and modals from unexpectedly covering the next target. Avoid moving the primary submit button after an agent has located it. A rendered screenshot and a DOM snapshot should not disagree about which item an action will affect. [S01]

A visually enabled control can still be unusable if JavaScript has not attached its handlers. Under slow-network and delayed-hydration tests, clicking an enabled control must not silently lose the action, and data entered before hydration must not disappear. Keep a JavaScript-dependent control disabled until usable, or implement progressive enhancement so the form works without that dependency. Playwright documents this failure mode. [S08]

Keep errors adjacent to their controls, retain entered values after correction, and expose required fields and allowed formats. For asynchronous changes, update actual visible DOM state rather than relying solely on a transient animation or live-region event.

### 1.4 Mark sensitive inputs correctly

Use native password fields and accurate `autocomplete` tokens, especially for one-time codes. The HTML standard defines relevant tokens. Anthropic's cloud-browser documentation says proper field identification can affect sensitive-value masking, while cautioning that masking is not guaranteed. [S09], [S10]

```html
<label for="password">Password</label>
<input id="password" name="password" type="password"
       autocomplete="current-password" required>

<label for="otp">Verification code</label>
<input id="otp" name="verification_code" inputmode="numeric"
       autocomplete="one-time-code">
```

Do not log passwords, OTPs, authentication tokens, or full card details through analytics, debug traces, rendered tool outputs, or application logs. Correct markup helps recognition; it does not transfer responsibility for secret handling to the agent.

**Acceptance criteria**

- The agent or tester can identify the current page, main task, actionable controls, selected values, and validation states from semantic information.
- Keyboard-only users can complete the representative workflow without a drag-only or hover-only dependency.
- Under throttled network/CPU conditions, enabled controls operate correctly and input is not lost during hydration.
- Hidden or stale controls are not mistaken for the active action; visible labels and accessible names agree.
- Sensitive inputs have appropriate types and purposes, without appearing in diagnostic or tool output.

## 2. Make task progress, transactions, and recovery explicit

Finding the correct button is only part of the problem. An agent must distinguish **not started**, **in progress**, **requires user action**, **succeeded**, **failed**, **cancelled**, and **unknown outcome**. A timeout is not evidence of failure, and stopping a browser task is not evidence that a committed action has been undone. [S11], [S12]

### 2.1 Show durable progress, error, and success information

Use persistent, unambiguous descriptions in the page and, where useful, ARIA status regions. Preserve search criteria and draft values after validation errors or timeouts. Provide confirmation details that can be retrieved later; avoid relying on a disappearing “Done” toast. W3C form and status-message guidance supports these patterns. [S13], [S14]

| State | Recommended interface behavior |
|---|---|
| Search running | Show a visible status and retain the query. |
| No results | Say no results were found; preserve filters and offer a correction route. |
| Field invalid | Identify the field, explain the constraint, and keep valid input. |
| Submission pending | Show progress, prevent accidental double submission, and expose an operation ID if needed. |
| User action required | Describe the available sign-in, approval, or verification handoff. |
| Completed | Display durable business result, identifier, amount/date/recipient as applicable. |
| Outcome unknown | Offer a read-only status lookup or reconciliation route. |

```html
<p id="operation-status" role="status" aria-live="polite"></p>
```

**Example of a useful result:** “Appointment confirmed for December 3, 2026 at 10:00 a.m. America/Los_Angeles. Confirmation: A12345.” The confirmation must also exist in the application's records.

### 2.2 Prevent duplicate effects and reconcile ambiguous outcomes

**Engineering recommendation:** model consequential work as a durable logical operation, not just one HTTP request. Use an idempotency key or stable operation identifier tied to the actor, scope, and request meaning. Deduplicate at the server; do not rely only on disabling a button. [S11]

Recommended behavior:

1. Record the logical operation and its state before or atomically with the consequential effect.
2. Accept retries using the same operation identity; return the existing result when already committed.
3. Reject or explicitly resolve reuse of an idempotency key with materially different parameters.
4. Expose `GET /operations/{id}` or an equivalent read-only status endpoint, with authorization checks.
5. Preserve the operation identity across browser reloads, login, MFA, agent pauses, and delegated tasks.
6. Define a retention window for deduplication and explain what happens after it expires.

Payment-provider retry guidance demonstrates why a lost response can follow a successful operation. This is a general engineering pattern, not a claim that every API uses the same idempotency semantics. [S11]

### 2.3 Protect against stale state and concurrent edits

**Idempotency is necessary but insufficient.** The item, appointment slot, price, availability, permission, or document may change between review and final submission. Bind the final action to the **reviewed resource version or quote**, including material conditions and expiration. Recheck current authorization and business rules at the commit point. [S12]

For resource updates, conditional HTTP requests using `ETag` and `If-Match` can prevent lost updates; domain-specific versions or quote IDs can enforce more complex conditions. A conflict must be visible and recoverable. Never silently substitute a different appointment, increase a purchase amount, or overwrite someone else's edit. [S12]

**Illustrative operation lifecycle:**

```text
DRAFT -> REVIEWABLE -> AWAITING_APPROVAL -> COMMITTING -> CONFIRMED
            |                  |               |
            +--> EXPIRED       +--> DECLINED   +--> FAILED / NEEDS_RECONCILIATION

Any attempted commit: verify actor + scope + version + price + slot + expiry.
```

For a payment, booking, cancellation, transfer, or destructive change, use a separate final commit step. Show the precise affected record, amount, currency, date/timezone, and conditions during review. A client-supplied `approved: true` flag alone must not satisfy a server-side approval policy; approvals should be validated through your application’s chosen mechanism and bound to the transaction being approved.

### 2.4 Define cancellation and safe HTTP behavior

Cancellation needs explicit semantics: **request received**, **cancelled before commit**, **already committed**, or **outcome pending reconciliation**. A late abort can arrive after a change has succeeded, as Chrome's WebMCP best practices explain. Consider compensating operations where suitable (for example, cancelling a reservation) but never imply that an aborted tool call reverses a committed change. [S15]

Safe HTTP methods are also important. A crawler, preview generator, prefetcher, or agent following a link must not cancel a subscription or delete a record by issuing a `GET`. Use appropriate unsafe methods for mutations, with authorization and CSRF protections where applicable. HTTP semantics define safe and idempotent method expectations. [S12]

### 2.5 Resume across accounts, browsers, and devices

Agents may pause for sign-in, MFA, payment approval, or completion on another device. Preserve a server-side, account-bound draft and an authenticated continuation link. On resumption, recheck the actor, task state, expiration, and current business facts. If a human has already completed the transaction, the agent should find the existing result rather than submit again. Never put session secrets or bearer tokens into a shareable continuation URL.

**Acceptance criteria**

- A lost response after a successful commit never creates a duplicate on retry.
- A stale price, expired quote, unavailable slot, or changed record version cannot silently commit.
- A timed-out client can retrieve a definitive status or a clear “still resolving” state.
- Cancelling after the commit point does not falsely report that the side effect was undone.
- The same user can resume a legitimate draft after login, MFA, or a cross-device handoff.
- Read-only link traversal cannot cause consequential state changes.

## 3. Keep identity, authorization, and untrusted content separate

**Platform identity** (for example, a verified hosted browser) is not **user authentication**; user authentication is not a blanket grant to perform every action. A person may authorize an assistant to inspect a record but not to edit it, purchase goods, or send messages. This distinction applies to browser sessions, APIs, MCP, and WebMCP alike.

### 3.1 Use bounded, revocable access

For integrations, request the smallest useful permissions and distinguish read, draft, and commit operations where valuable. Validate token audience, expiration, and scopes; check authorization for each resource on every request. Support revocation, session expiration, and meaningful audit records. MCP's authorization security guidance requires audience validation and secure token handling, and prohibits token passthrough. [S16]

For browser workflows, retain ordinary protections: server-side authorization, safe session cookies, appropriate CSRF defenses, input validation, rate limits, reauthentication or explicit approval for particularly consequential changes, and clear sign-out behavior. Do not weaken authentication simply because the visitor is an AI agent.

### 3.2 Treat page content, connector metadata, and tool output as untrusted

Reviews, forums, uploaded documents, advertisement copy, externally fetched text, and even tool descriptions may carry **prompt-injection** attempts such as “ignore previous instructions” or “send account data elsewhere.” These words are data, not delegated authority. OpenAI's published agent-security guidance emphasizes restricting what an agent can be induced to do, not relying on a perfect content filter. [S17]

A site owner should:

- Keep third-party content visibly distinguished from site-owned UI and transaction controls.
- Avoid hidden “agent instructions,” fabricated approvals, or content that impersonates the system or user.
- Validate permitted recipients, destination domains, transaction limits, and object-level permissions server-side.
- Treat client-provided tool annotations as descriptive, **not** security guarantees.
- Sanitize user-generated HTML to protect the site itself; do not mistake sanitization for a universal LLM prompt-injection defense.
- Test with hostile review/comment/document text and measure both agent behavior and backend enforcement.

**Security acceptance criterion:** the agent can encounter malicious page text without the website performing an unauthorized effect, and sensitive data cannot be retrieved from unrelated records by modifying IDs or tool parameters.

---

## 4. Configure CDN, firewall, and bot mitigation for real execution paths

**Crawler permission and browser-agent connectivity are different configurations.** A search crawler may reach the article while a hosted browser cannot pass a CAPTCHA, a checkout API receives a different WAF rule, or a remote connector cannot reach the MCP server. Test the complete task, not merely an HTTP 200 on the homepage.

### 4.1 Identify the execution route before changing rules

| Route | Common characteristics | Access testing implication |
|---|---|---|
| **Hosted cloud browser** | Requests originate from the operator's or provider's infrastructure. | Check verified identity where documented, shared egress limits, and login handoff. |
| **User's browser / extension** | Uses a local browser, often with an existing signed-in session. | Treat as a normal authenticated browser; identity may not have a unique agent signature. |
| **Remote browser provider** | Agent delegates browser control to a configurable third-party service. | Identity depends on provider and deployment; avoid universal vendor allowlists. |
| **Direct HTTP extractor / fetcher** | May not execute JavaScript; may be cached or truncated. | Check raw response, access, representation, freshness, and extract result. |
| **Remote MCP connector** | Calls an HTTPS tool endpoint from a service-managed environment. | Check protocol, token validation, network reachability, and machine-readable errors. |
| **Local MCP server** | Tools execute on a user-controlled device or machine. | Test client installation, permissions, connectivity, and the actual local environment. |

### 4.2 Apply vendor verification only to the traffic it covers

**OpenAI hosted cloud browsers.** OpenAI documents Web Bot Auth using HTTP Message Signatures for certain ChatGPT cloud-browser requests, with guidance for common CDN/WAF products. Verify according to the published procedure **before** bypassing a challenge; a matching User-Agent or the presence of signature headers is not sufficient. This is separate from `OAI-SearchBot`. [S18]

**Google-hosted browser agents.** Google's `Google-Agent` documentation instructs sites to check the `Google-Agent` User-Agent token and the published `user-triggered-agents.json` IP ranges. It also documents experimental Web Bot Auth signatures using the `https://agent.bot.goog` identity. Use signed-request verification where applicable; retain independent authorization. [S19]

**Anthropic-hosted browsers (including Claude Duet).** Anthropic documents a `Claude-Agent` token added to the browser User-Agent, together with source-IP verification against its SAIL publication at `https://claude.com/.well-known/sail`. This is **not** the same identity as `ClaudeBot`, `Claude-User`, or `Claude-SearchBot`, and it should not be assumed to describe Claude in a local Chrome session. [S20]

**Grok Bot.** xAI documents shared static egress IPs for hosted computers and a desktop-routed alternative. The shared addresses identify service traffic, not an individual customer. Current ranges are provided through the account team; do not fabricate a public `GrokBot` crawler or signature rule. [S21]

**Other and configurable agents.** Meta Muse, Gemini local Chrome use, Claude in Chrome, Hermes, and OpenClaw may operate through the user's browser or an independently configured provider. Do not assume their requests carry a stable vendor-specific HTTP identity. Document the exact supported route and test it. See Section 10.

### 4.3 Design WAF rules around verified purpose and complete journeys

For an identified route:

1. Inventory normal browser traffic, user-triggered fetching, crawlers, API calls, and sensitive write endpoints separately.
2. Confirm the vendor's **current** verification mechanism and rotate IP ranges or keys as instructed.
3. Ensure rule precedence does not negate a verified-agent decision through a broader cloud-ASN or managed-bot rule.
4. Check search, filters, product detail, cart, booking, upload, XHR, GraphQL, and API subdomains—not just the first HTML response.
5. Account for multiple distinct users sharing a provider egress pool; simplistic per-IP limits may throttle unrelated users.
6. Keep security controls for login, account data, and mutations, including authorization and abuse prevention.
7. Preserve client IP and verified signature headers through trusted reverse proxies; do not trust client-supplied forwarding headers from arbitrary sources.
8. Log rule decisions without recording credentials or sensitive payloads.

Google's official `Google-Agent` troubleshooting guide specifically calls out rule priority, in-page challenges, in-journey API requests, shared-IP rate limiting, IP updates, and forwarded headers. Apply the same *testing discipline* to other products without assuming that they share Google's identity mechanism. [S19]

Do not solve agent access by disabling CAPTCHA or fraud controls for every request claiming an AI User-Agent. A verified origin can justify a narrowly scoped bot-mitigation exception; it does not demonstrate that the requester has the user's permission.

**Acceptance criteria:** each tested execution route can reach required pages and subrequests under intended policies; verification cannot be spoofed by changing the User-Agent; legitimate shared-egress traffic is not systematically blocked; protected endpoints remain protected.

## 5. Offer APIs and agent tools when they improve the workflow

A well-defined API can avoid long sequences of visually interpreted clicks. Three interface types play different roles:

| Interface | What it exposes | Discovery / installation model |
|---|---|---|
| **HTTP API + OpenAPI** | HTTP resources and operations with documented parameters and responses. | Consumers integrate or generate clients using the API contract. |
| **Remote / local MCP server** | Tools, data resources, and prompts available to a configured MCP client. | The client or administrator must connect and authorize the server. |
| **WebMCP (site tools)** | Tools defined by a webpage for a compatible visiting browser agent. | Tool discovery happens while the supporting browser visits the page. |

**Publishing an endpoint does not imply universal automatic discovery.** The target client must support the protocol and connection method, have the necessary permissions, and be configured to use the integration. [S22], [S23]

### 5.1 Design operations around user intent and business meaning

Choose distinct verbs that communicate side effects:

- `search_products`, `get_product_details`, `check_availability` — reads.
- `create_booking_draft`, `get_quote`, `validate_order` — noncommitting preparation.
- `confirm_booking`, `place_order`, `cancel_reservation` — consequential changes.
- `get_operation_status`, `get_booking`, `list_my_orders` — verification and recovery.

Specify input types, units, allowed values, locale, timezone, effective dates, response schemas, authentication, object permissions, rate limits, errors, retry rules, idempotency, version preconditions, and cancellation semantics. Return stable IDs and status values, not only a sentence such as “Success.” Reuse the **same service layer, business data, and permission checks** behind UI, API, MCP, and WebMCP.

**Illustrative (not a mandated API standard):**

```http
POST /api/booking-drafts/quote-42/confirm HTTP/1.1
Authorization: Bearer <redacted>
Idempotency-Key: 7e52a0d4-...
If-Match: "quote-version-3"
Content-Type: application/json

{"approved_quote_id":"quote-42"}
```

```json
{
  "operation_id": "op-901",
  "booking_id": "bk-314",
  "status": "confirmed",
  "start_time": "2026-12-03T10:00:00-08:00",
  "timezone": "America/Los_Angeles",
  "total": {"amount": "29.00", "currency": "USD"},
  "confirmed_quote_version": "quote-version-3"
}
```

The server must validate the idempotency key, actor, quote/version, current slot and price, expiration, and required approval. Merely accepting an `If-Match` header without enforcing its condition offers no protection.

### 5.2 Make errors and incomplete work machine-interpretable

| Condition | Recommended response information |
|---|---|
| Invalid input | Which field failed, why, and allowed values or format. |
| Sign-in required | Clear authorization route; do not return a misleading success. |
| Permission denied | Structured refusal, without leaking protected resource information. |
| Version or quote conflict | Conflict status plus a way to retrieve current state. |
| Rate limit | Meaningful throttling response and retry timing where available. |
| Still running | Operation or task ID, status, and a way to poll or resume. |
| Connection lost after possible commit | Status lookup / deduplication path, not an instruction to blindly resubmit. |
| Completed | Stable resource and operation IDs, final business state, and relevant receipt data. |

For HTTP APIs, RFC 9457 defines `application/problem+json` as a standard representation for many errors. RFC 6585 defines `429 Too Many Requests`; `Retry-After` is useful when retry timing can be communicated. For MCP, use the protocol's own distinction between protocol-level errors and tool-execution results rather than treating HTTP Problem Details as an MCP replacement. [S24], [S25], [S26]

### 5.3 Apply MCP schemas, scopes, and transport constraints

The MCP tools specification supports structured tool `inputSchema` and optional `outputSchema` and `structuredContent`. Describe what a tool does, whether it modifies state, its preconditions, and how to verify the outcome. Validate arguments and resource permissions on the server; annotations such as `readOnlyHint` are descriptions, not enforcement. MCP's authorization rules require validating access tokens for the intended resource and handling OAuth security correctly. [S26], [S16]

Create a **client compatibility record** for each deployment:

| Dimension | Record |
|---|---|
| Transport | Remote Streamable HTTP, legacy SSE (when supported), or local stdio. |
| Authentication | OAuth support, discovery, callback, client registration, scopes, token rotation. |
| Network | Public HTTPS, approved access gateway, proxy, firewall route, port. |
| Headers | Any required custom headers and whether this client can supply them. |
| Setup | User installation, administrator enablement, tool allowlists, grants. |
| Tool behavior | Discovery, schema validation, output truncation, timeouts, error shape. |
| Recovery | Task status IDs, retries, authorization expiration, cancellation. |

**Perplexity-specific example:** its custom remote connectors support HTTPS MCP and specified authentication modes, but the setup form cannot send arbitrary custom headers, apart from its documented Cloudflare Access service-token headers. A generic HTTP server expecting a proprietary request header may not work without changing the integration. [S27]

**Long-running tasks:** preserve the distinction between the result of a tool invocation and the status of the underlying job. Perplexity's separately published **Computer MCP server** documents persistent threads, checkpoints, and the MCP Tasks extension; these illustrate the value of polling and resumption even though they do **not** define the interface for a website's own MCP server. [S28]

### 5.4 Treat WebMCP as optional, with a regular UI fallback

WebMCP is a proposed browser-facing standard that can expose structured operations from an open page using JavaScript or declarative form annotations. Chrome documents experimental/origin-trial support and best practices. OpenAI documents **Site tools** in the ChatGPT desktop app's built-in browser for supported ChatGPT Work and Codex configurations; it does not establish that ChatGPT dots, Grok Bot, or every other browser agent supports it. [S29], [S30]

WebMCP implementation guidance:

- Feature-detect browser support; do not break the ordinary UI when it is absent.
- Register a coherent tool set for the current page and permissions; remove unavailable tools when state changes.
- Keep tool names narrow: **review** is not **confirm**, and **cancel request** is not **cancelled**.
- Use the same application service and validation as ordinary UI actions.
- Make tool results match committed application state before reporting success.
- Define the commit point and late-cancellation behavior.
- Test tool visibility, frame origin, signed-in state, and client version explicitly.

Chrome's published best practices discuss all-or-nothing registration, shared application services, reliable tool results, and late aborts. [S15]

A deliberately configured bridge or third-party plugin may enable a client to reach WebMCP through another protocol. **Documented optional integration** is not equivalent to built-in, automatically available support.

### 5.5 When specialized protocols are worth considering

For commerce, inventory, and local services, evaluate the current integrations used by the intended ecosystem (for example, merchant feeds or a supported commerce protocol). Such an investment should follow a specific distribution or transaction need, rather than be added solely because a new acronym exists. Google's own AI-search guidance mentions Merchant Center, Business Profiles, and emerging commerce protocols such as UCP. [S31]

**Acceptance criteria:** a named supported client can discover and authorize the tool; invalid or stale requests fail predictably; read/write scopes are enforced; a lost response or paused task is recoverable; UI and tool results agree with the backend; a non-WebMCP browser retains a complete supported path.

---

## 6. Make public information retrievable, complete, and current

Not every agent uses a full browser. Some systems read the initial HTML or a text/Markdown extraction; others render JavaScript; still others use a search index that may lag behind the website. Make important **public** facts available through stable, readable routes without requiring an authenticated interactive session. Google distinguishes crawling from rendering and notes that not all crawlers execute JavaScript. [S32]

### 6.1 Provide useful server-returned HTML

For documentation, help pages, policies, products, articles, and public listings, aim to include in the initial response:

- A specific `<title>`, main heading, and meaningful page structure.
- The core explanation, product/service identity, and public specifications.
- Material prices, units, conditions, locations, and time-sensitive qualifications.
- Navigable hyperlinks to related pages and supporting sources.
- Relevant date/version information and appropriate canonical metadata.
- Text alternatives or accessible descriptions for information otherwise available only in images.

This does **not** prohibit client-side rendering. It recommends that essential public information remain retrievable in the paths you intend to support, with server rendering or progressive enhancement where practical.

### 6.2 Use stable, crawlable URLs and useful navigation

Link to important public content through normal anchors, not only through a search box or infinite scrolling. Give individual items, policies, and help topics durable addresses:

```text
/docs/webhooks/retry-policy
/products/model-123
/services/consultation
/help/cancel-a-reservation
```

Offer explicit pagination or retrievable page links for large result sets. Keep canonical URLs aligned with internal links and XML sitemaps. For public pages, provide truthful `lastmod` values for meaningful updates; an automatically changed copyright year is not a substantive content revision. Where useful, submit supported notifications to IndexNow, without assuming that submission guarantees indexing. [S33], [S34]

For logged-in records, stable URLs can still help a task resume, but each request must remain authenticated and object-authorized. A predictable URL must never make a private record publicly fetchable.

### 6.3 Make region, currency, and timezone choices explicit

Cloud browser IP geography, browser language, and the user's intended service region can differ. For transactions and regional content:

- Make the user-selected language, region, shipping/service location, and currency inspectable.
- Include timezone identifiers for appointments and events; use unambiguous instants in integrations.
- Carry locale choices through authentication and checkout.
- Verify selected currency and timezone in the final review and confirmation.
- Avoid silently interpreting a remote browser's IP as the user's intended market.

For multilingual public pages, consider separate language URLs and correct `hreflang` relationships with usable language navigation. Google cautions that changing content only by inferred language or location can complicate crawling. [S35]

### 6.4 Test the content that actually reaches an extractor

A page can contain the right information while a particular extraction path returns only part of it. Search tools may shorten responses; some readers strip navigation or links; some clients retain only the beginning and end of a long page.

**Engineering recommendation:** keep a fact close to the conditions necessary to interpret it. For example, price, billing interval, eligibility limit, region, and effective date should appear in a coherent section. Use helpful headings and targeted detail URLs. Do not impose a universal artificial paragraph length or “AI chunk size”; the objective is completeness and accurate interpretation. [S31]

Concrete platform cases:

- Hermes documents a default **15,000-character** `web_extract` budget; oversized extracts receive a head-and-tail window and an explicit truncation indicator, with a path for further reading. [S36]
- OpenClaw's `web_fetch` performs a plain HTTP fetch, does **not** execute JavaScript, may truncate results, and documents a configurable cache. [S37]

Those values describe particular configurations, **not** a maximum recommended website length. In real tests, inspect the retrieved representation or agent-visible tool result, not only your source HTML.

### 6.5 Preserve freshness and authorization across representations

When the website or CDN offers HTML and Markdown variants, ensure they agree on material facts, tables, links, dates, and restrictions. A converted representation is another interface subject to the same authorization, privacy, and caching rules.

When using content negotiation, make caches distinguish HTML and Markdown using an appropriate `Vary: Accept`. The Cloudflare feature documented as *Markdown for Agents* changes `Content-Type` and removes some body-specific validators, including `ETag` and `Last-Modified`, on converted output. It also preserves origin security and cache headers. [S38]

For public staging, preview links, prices, or stock that change rapidly, diagnose stale client/provider caches before concluding that an HTML change failed. For consequential writes, always revalidate authoritative current state at the server—never trust a cached page as proof of current availability.

**Acceptance criteria:** initial public HTML contains essential facts; relevant paths survive direct reload; language/currency/timezone are explicit; truncated or cached extraction can be detected; alternate representations preserve access restrictions and material meaning.

## 7. Separate search crawling, user-triggered retrieval, training, and grounding

Automated content use has **multiple purposes and different controls**. A site's wish to appear in AI-assisted search, its decision about model training, a human-initiated page fetch, and an authenticated browser-agent visit must not be collapsed into one “allow AI” setting.

### 7.1 Maintain a purpose-based crawler policy

| Operator | Identity or policy | Documented role / material qualification |
|---|---|---|
| **OpenAI** | `OAI-SearchBot` | Search-related crawling. |
| OpenAI | `ChatGPT-User` | User-triggered page retrieval; rules may not apply as with automatic crawlers. |
| OpenAI | `GPTBot` | Training crawler; can be treated separately from search. |
| **Anthropic** | `Claude-SearchBot` | Search discovery. |
| Anthropic | `Claude-User` | User-directed retrieval. |
| Anthropic | `ClaudeBot` | Model-development crawler. |
| **Perplexity** | `PerplexityBot` | Search-related crawling. |
| Perplexity | `Perplexity-User` | User-requested fetching; documentation says it generally ignores `robots.txt`. |
| **Google** | `Googlebot` | Google Search crawling, including Search features. |
| Google | `Google-Extended` | **Robots policy token**, not a separate HTTP crawler; covers specified Gemini/Vertex model-training and grounding uses, not Google Search inclusion/ranking. |
| **Meta** | `Meta-WebIndexer` | Improves Meta AI search and supports linking/citation. |
| Meta | `Meta-ExternalAgent` | Foundation-model training **and** other uses, including direct indexing. |
| Meta | `Meta-ExternalFetcher` | User-requested fetcher, also supporting agentic capabilities; may bypass `robots.txt`. |
| Meta | `FacebookExternalHit` | Shared-link previews; separate from Meta AI search. |

Read the current original operator documentation before configuring a rule. [S39], [S40], [S41], [S42], [S43]

**Critical nuance:** the categories do not line up perfectly across operators. Blocking `Google-Extended` can change defined grounding as well as training uses; blocking `Meta-ExternalAgent` can affect a documented indexing use alongside training. Do not import an OpenAI-specific distinction into another vendor's policy.

The identifiers above do **not** establish the network identity of every interactive browser session for ChatGPT Work, Claude Cowork, Meta Muse, Gemini, or Perplexity Computer. Those modes are discussed in Sections 4 and 10.

### 7.2 Use `robots.txt` for crawl preferences, not access control

**Illustrative example only**—a public site wants general crawling, but elects to disallow two named model-training crawlers:

```text
User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Before deploying it, merge with your existing route-specific policies. The `*` group does **not** automatically combine with a separately matching, more specific bot group; inspect the selected group's effective rules. Remember that `robots.txt` is a cooperative crawl instruction, not confidentiality or authentication. User-requested fetchers may behave differently. The governing `robots.txt` protocol is RFC 9309. [S44]

For restricted pages, use server-side authentication and authorization. A disallow rule neither secures private data nor reliably prevents someone from opening a known URL.

### 7.3 Check indexing and snippet eligibility separately

For content intended for discovery, inspect response headers and HTML for unintended `noindex`, `nosnippet`, `max-snippet`, and `data-nosnippet` restrictions. Search crawling, indexing, and preview eligibility are different questions. Google explains that its Search AI features require index and snippet eligibility and may also be subject to a separate **Search generative AI** inclusion setting in Search Console. Eligibility does not guarantee a citation or appearance. [S45], [S46]

Check canonical tags, redirects, sitemap entries, and middleware-generated `X-Robots-Tag` headers on representative templates. If a page is blocked from crawling, a crawler may be unable to fetch and read its `noindex` instruction, so blocking discovery and requesting removal are not equivalent mechanisms.

### 7.4 Track announced Microsoft controls as upcoming

**Announced/upcoming as of November 22, 2026:** Microsoft has announced separate preferences for AI **Training** and AI **Grounding**, beginning **February 1, 2027**, with a transition schedule for sites previously using `NoArchive` or `NoCache`. The future control format includes page-level grounding choices. Do not describe the new policy as already universally effective on the document's research date; verify the transition details and later rollout before making production changes. [S47]

### 7.5 Maintain an evidence-based policy inventory

For each operator, record: HTTP identity or policy token; its purpose; verification method; `robots.txt`/header/search-console control; whether the setting applies to training, retrieval, grounding, or indexing; known exceptions; and **last verified date**. Review this inventory when vendor policy documents change.

## 8. Publish information that can be interpreted, checked, and attributed

Content useful to an agent needs more than correct markup. It must state exactly **what** is being described, **where and when** it applies, and **which conditions** change the answer. Google's content-quality guidance emphasizes original and useful information, source transparency, and clear context. [S31]

### 8.1 Write precise, self-contained factual claims

- Identify the product, company, plan, model, software version, or service explicitly.
- Include amount, currency, billing interval, units, quantity limits, effective date, and region.
- Keep exceptions and eligibility conditions near the facts they qualify.
- State whether availability is current, scheduled, estimated, or historical.
- Represent genuine comparisons in tables when relationships would otherwise be ambiguous.
- Give essential visual information a text equivalent.
- Link directly to primary supporting documentation or original datasets where useful.

**Clear:** “The Professional plan costs $29 USD per user per month on monthly billing and includes 100,000 API requests per month.”

**Ambiguous:** “Professional — $29 — 100K,” with the billing period and exclusions elsewhere on the page.

These recommendations reduce misinterpretation; they do not promise inclusion or ranking in AI-generated answers.

### 8.2 Use accurate, supported structured data

Apply relevant Schema.org types (such as `Product`, `Organization`, `Article`, or `BreadcrumbList`) to content where they fit. Structured data should match actual visible content and the source-of-truth records, especially price, availability, date, and organization identity. Google cautions against misleading structured data and does not require a special schema type for Search's AI features. [S48], [S31]

For commerce and local services, reconcile the site, JSON-LD, product feeds, Merchant Center, Business Profile, and transaction system. Inconsistent price, stock, service area, or hours can defeat an otherwise readable page. Add platform-specific feeds/protocols only where they serve a real business and distribution requirement. [S31]

### 8.3 Preserve ordinary sharing and attribution metadata

Meaningful titles, descriptions, canonicals, and Open Graph values support link previews and source recognition. Meta's link-preview crawler has its own practical retrieval requirements; Meta's crawler documentation says Open Graph properties should appear early in the response and describes range-request behavior for `FacebookExternalHit`. Those are sharing concerns, not a substitute for Meta AI search policy. [S42]

## 9. Consider Markdown, `llms.txt`, and other agent-facing extras only when useful

### 9.1 Optional Markdown versions

A documentation-heavy site can offer an alternate Markdown URL:

```html
<link rel="alternate" type="text/markdown"
      href="/docs/retry-policy.md">
```

Alternatively, a supporting edge or origin service can negotiate a Markdown representation when a client sends `Accept: text/markdown`. Keep HTML and Markdown aligned, including tables, links, qualifiers, version, locale, and authorization. Ensure correct content type and caching semantics; a Markdown response must not expose data hidden behind authenticated HTML. [S38], [S49]

**Policy detail for Cloudflare users:** its documented conversion feature preserves an origin-specified `Content-Signal`; where the origin supplies none, the feature currently adds `Content-Signal: ai-train=yes, search=yes, ai-input=yes`. Review that behavior against your chosen policy before enabling the feature. [S38]

### 9.2 Optional `llms.txt`

The community proposal describes an accessible Markdown overview and curated links, commonly at `/llms.txt` or within a documentation subtree. It can help clients that deliberately read it. However, Google Search explicitly says that it ignores `llms.txt` for AI-search eligibility and ranking. There is **no established universal requirement** that ChatGPT dots, Grok Bot, Gemini, Claude, Meta Muse, or other agents use the file. [S49], [S31]

If inexpensive to maintain, generate a concise index from the same content inventory and monitor actual requests. Avoid copying authoritative facts into numerous independently maintained copies that can become contradictory.

### 9.3 Do not rely on speculative “AI SEO” tricks

Do not replace useful content with arbitrary fixed-size chunks, hidden AI-only instructions, fabricated endorsements, or meaningless keyword variants. Google explicitly rejects `llms.txt` mandates and prescribed AI prose/chunk length as requirements for its Search AI features. [S31]

**Adoption rule:** ship an optional format or tool only with an identified target client, a fallback, a consistency test, and a measurable reason to keep it.

---

## 10. Platform compatibility reference: product + mode + task

**Important:** a product name is not a browser or protocol specification. Record the exact execution mode and whether the finding is platform-documented, tested locally, experimental, or unverified. Features may depend on account tier, rollout, administrator controls, the chosen model, extensions, and individual consent.

### 10.1 Cross-platform comparison

| Product / mode | Documented interaction route | Website engineering implication |
|---|---|---|
| **ChatGPT dots** | Cloud computer/browser and connected apps; agent access documented for certain cloud requests. | Verify hosted-browser access and the actual sign-in/approval path; do not assume WebMCP support. |
| **ChatGPT Work / Codex** | Cloud/browser tasks; selected desktop built-in browser supports Site tools (WebMCP). | Test the chosen browser, permissions, model, and integration route separately. |
| **Grok Bot** | Hosted computers with shared egress; optional desktop routing. | Check real egress path; shared IP does not identify one user or workspace. |
| **Gemini task/browser experiences** | Local desktop Chrome or separate remote browser in supported flows. | Test existing-session and remote sign-in paths; verify `Google-Agent` only on traffic to which that identity applies. |
| **Meta Muse** | Browser in the chat experience, or Chrome extension using the user's signed-in Chrome. | Do not equate Meta crawler identities with all Muse browser requests. |
| **Claude Duet** | Anthropic-hosted browser and connectors. | Use documented hosted-browser verification; plan for a limited user takeover workflow. |
| **Claude Cowork** | Built-in local desktop browser, Claude in Chrome, and connectors. | Test fresh versus existing sessions and remote MCP connector access independently. |
| **Perplexity Computer** | Cloud tasks; supported desktop browser-control routes; connected tools. | Record cloud versus desktop route, connector limitations, and persistent task outcomes. |
| **Instinct** | Describes interaction with websites, including sites not separately connected. | Optimize ordinary browsing and account-bound continuation; identity/protocol specifics remain unverified. |
| **Hermes Agent** | Configurable local/cloud browser, direct extraction, and MCP. | Test the selected backend, extraction budget, caching, permissions, and model-visible text. |
| **OpenClaw** | Managed isolated browser, existing-session Chrome options, direct HTTP fetch, and MCP. | Test each browser profile and direct-fetch route separately; do not assume a dedicated vendor User-Agent. |

Descriptions above reflect the sources below. They are not claims that every product interoperates with every service, nor evidence of successful live tests. [S18], [S21], [S19], [S50], [S51], [S52], [S53], [S54], [S55], [S56], [S57], [S58], [S59], [S60]

### 10.2 ChatGPT dots and ChatGPT Work / Codex

- **dots:** keep browser-agent access separate from `OAI-SearchBot` and `ChatGPT-User` crawler policy. For supported signed cloud-browser requests, use OpenAI's published Web Bot Auth verification through the CDN or a correctly implemented validator. [S18]
- **Work / Codex:** OpenAI documents Site tools (its WebMCP implementation) in the **desktop app's built-in browser**, for supported configurations. This does not establish that dots' cloud browser, every desktop browser extension, or all account/workspace combinations expose the same tool API. [S30]
- **Tests:** public retrieval; browser authentication; high-risk confirmation; duplicate submission after a timeout; whether a WebMCP tool is discovered in the *named* supported desktop environment; ordinary UI fallback in other browsers.

### 10.3 Grok Bot

- **Platform-documented:** hosted computers use shared static egress IP ranges; traffic can alternatively be routed through a desktop. Shared IPs should not be interpreted as user-specific authentication. [S21]
- **Unverified:** no public xAI specification was established in this review for a generic `GrokBot` search-crawler token or a hosted-browser Web Bot Auth scheme equivalent to OpenAI's. Avoid invented rules.
- **Tests:** from each allowed route, exercise search, product detail, forms, login, and confirmation; capture which network controls actually applied.

### 10.4 Google browser agents and Gemini task experiences

- Google documents `Google-Agent` as an identity for agents hosted on Google infrastructure, with User-Agent and published IP-range verification and experimental signed requests. It is **not** equivalent to ordinary `Googlebot` search crawling. [S19]
- Gemini's task documentation distinguishes **local Chrome** from a **separate remote browser**. Local Chrome may use the person's logged-in sites; remote-browser tasks have separate sign-in and control-transfer behavior. Browser availability and workflow support are configuration-dependent. [S51]
- **Tests:** known login on local Chrome, fresh remote browser, manual authentication takeover where supported, correct timezone/currency despite remote geography, and WAF access to in-journey API requests.

*Product-label caution:* This guide uses official Gemini task/browser documentation as its engineering basis. Do not infer a standalone technical protocol from the name “Gemini Spark” without a specific product specification and tested version.

### 10.5 Meta Muse

- Meta describes browser operation in its chat experience and a Chrome extension that can act on sites where the user is already signed in. The extension has a distinct account/session and takeover model from a remotely hosted browser. [S50]
- Meta's `Meta-WebIndexer`, `Meta-ExternalAgent`, and `Meta-ExternalFetcher` describe crawl and fetching uses. Those identities do not prove the identity of every Muse-controlled Chrome request. [S42]
- **Tests:** fresh-session sign-in, existing Chrome login, account switching, manual takeover, and whether a visually or semantically confusing action can target the wrong record.

### 10.6 Claude Duet

- Duet can use a browser hosted by Anthropic when a connector is unavailable. Anthropic documents `Claude-Agent` for hosted browser identity and the SAIL publication for verification. [S20], [S52]
- Duet's research-preview documentation says users cannot watch or take over **Duet's** browser. Credential entry uses a separate form on the user's device. Do not generalize the browser-takeover flow of a different Claude product to Duet. [S52]
- **Tests:** a workflow that can proceed after the provided credential handoff; a protected flow that safely reports it cannot continue; a durable draft waiting on approval; verification that no transaction repeats after delayed approval.

### 10.7 Claude Cowork, Claude in Chrome, and cloud browser distinctions

- Cowork's **built-in browser** lives in Claude Desktop and uses a separate profile; users can sign in, and supported configurations allow cookie import. The desktop app must remain open and online for that browser to be available. [S53]
- **Claude in Chrome** uses the person's Chrome browser and existing sessions. Test it independently of the Cowork built-in browser. [S54]
- **Remote MCP connectors** use Anthropic's cloud infrastructure; this is not the same connectivity path as a locally controlled browser. Confirm that the connector endpoint is reachable from the relevant service. [S55]
- Anthropic's **separate cloud-browser** documentation discusses taking control and masking of certain credential fields. Those details should not be mistakenly assigned to Duet's currently documented no-takeover browser. [S10]
- **Tests:** fresh vs imported profile, user Chrome session, revoked session, cross-origin sign-in, remote connector authentication, and parity between UI and connector permissions.

### 10.8 Perplexity Computer

- Computer provides cloud-based task execution, and Perplexity documents desktop browser-control routes in supported environments. Treat those as separate configurations. [S56]
- Perplexity's **custom remote connectors** support MCP over HTTPS with documented transport and authentication options. Its connector setup does not supply arbitrary custom request headers beyond the documented Cloudflare Access service-token fields. [S27]
- Perplexity's **Computer MCP server**, which lets other assistants delegate work **to** Computer, is a different direction of integration from connecting **your** website's MCP server **to** Perplexity. The Computer server documents durable threads, checkpoints, and asynchronous status handling. [S28]
- **Tests:** cloud vs desktop session, remote connector setup/re-authentication, no-proprietary-header constraint, deferred approval, task polling, and result reconciliation.

### 10.9 Instinct

- Instinct's public privacy policy says its assistant can interact through browser functionality with third-party websites, including websites that the person has not separately connected. [S57]
- **Unverified:** an official public browser User-Agent/IP verification contract, native WebMCP support, and a general developer-facing MCP integration contract were not established from the public material reviewed.
- **Tests:** standard accessible browser workflow, login and verification, pause for approval, account-bound draft continuation across devices, and detection when the person completed an action independently.
- Keep the site's own transaction authorization explicit rather than assuming a particular agent always asks for confirmation in the same way.

### 10.10 Hermes Agent

- Hermes has a configurable `browser_exec` route with local, attached, and third-party cloud browser backends, plus a separate `web_extract` tool and MCP integrations. The actual browser and retrieval provider are configuration choices. [S58], [S59], [S36]
- Its documentation describes a default **15,000-character** extract budget, recoverable omitted text, and extract caching. These are configuration-specific limits, not a universal HTML-length rule. [S36]
- Hermes supports configured local stdio and remote HTTP MCP servers; a website does not automatically install its own tools simply because it exposes a URL. [S59]
- **Tests:** fresh local browser, signed-in attached profile, supported cloud provider, `web_extract` versus live DOM, content in the omitted middle of a long page, and fresh retrieval after a staged change. Record the provider and cache settings.

### 10.11 OpenClaw

- OpenClaw documents the isolated `openclaw` browser profile and two routes to a user's Chrome session: `user` via Chrome DevTools MCP with an initial approval prompt, and `chrome` through an extension. [S60]
- Its `web_fetch` is a direct HTTP GET with text/Markdown extraction and no JavaScript execution, with documented truncation and caching. It is a different interface from the browser. [S37]
- MCP servers are explicitly configured; OpenClaw documents that server-level initialization guidance passed to the embedded agent is capped at **2,000 characters**. Put core constraints into schemas and server enforcement, not only introductory prose. [S61]
- **Tests:** isolated browser vs existing-session Chrome; request routed through `web_fetch` vs rendered browser; expiration of a cached result; tool schema discoverability; truncation of server instructions; account authorization on writes.

### 10.12 WebMCP support status and optional bridges

As of this research date, documented **native** Site tools support is established for specifically supported ChatGPT Work/Codex configurations in the desktop built-in browser, while Chrome itself documents WebMCP as experimental. For Claude Duet/Cowork, Perplexity Computer, Instinct, Grok Bot, Meta Muse, and the referenced Gemini modes, do **not** claim universal native WebMCP support without a matching operator specification or actual test. [S30], [S29]

Some configurable clients can use bridge software or community plugins; if you evaluate one, name the plugin/bridge, exact version, client, browser, origin permissions, and observed behavior. **MCP compatibility alone is not WebMCP compatibility.**

---

## 11. Test retrieval, browser interaction, tool use, and business outcomes separately

An AI-friendly-site audit has at least four questions:

1. **Access:** Can this specific agent route reach the necessary pages and endpoints?
2. **Comprehension:** Does the agent receive complete, current, properly qualified information?
3. **Execution:** Can it operate the workflow and recover from normal interruptions?
4. **Correctness and safety:** Does the intended result exist, with no duplicate or unrelated side effects?

### 11.1 Inspect initial responses and index signals

For a representative public URL:

```bash
curl -sS -L -D page.headers -o page.html \
  'https://example.com/docs/retry-policy'

rg -n -i 'HTTP/|content-type|x-robots-tag|vary|cache-control' page.headers
rg -n -i 'canonical|name="robots"|retry|lastmod' page.html
```

Repeat where useful with `Accept: text/markdown`. Inspect status, redirects, content type, cache controls, canonical, indexing rules, primary text, and relevant links. These commands do not execute JavaScript and do not emulate a verified agent simply by changing a User-Agent string.

For a private route, confirm that an unauthenticated or unauthorized request cannot retrieve account-specific facts in **any** offered representation.

### 11.2 Audit the rendered UI and deterministic behavior

Use ordinary accessibility, keyboard, SEO, and layout checks first. Playwright recommends role- and label-based locators; these make useful regression checks for the semantics the site intentionally exposes. [S62]

**Illustrative Playwright test** (adapt selectors, test data, and expected business state):

```ts
import { test, expect } from '@playwright/test';

test('search is labeled and results are observable', async ({ page }) => {
  await page.goto('https://example.com/search');
  await page.getByRole('searchbox', { name: 'Search documentation' })
    .fill('retry policy');
  await page.getByRole('button', { name: 'Search documentation' })
    .click();
  await expect(page.getByRole('main')).toContainText('Retry');
});
```

Also test slow hydration, layout shifts, keyboard flow, empty/invalid input, modal focus, error recovery, locale changes, and a sign-in handoff. CI tests cannot establish success with an actual assistant; they catch deterministic defects before the more expensive agent tests.

Chrome's **experimental Agentic Browsing** Lighthouse category currently requires Chrome 150 or later. It reports pass/fail checks and a pass ratio, not a conventional weighted 0–100 score. Use it as an additional diagnostic, not as a definitive agent-readiness score. [S63]

### 11.3 Build a repeatable real-agent test matrix

Start with the three highest-value user journeys, then add controlled adverse cases. Use a resettable test account and business fixtures. Record the prompt, date, model and product version if visible, execution mode, browser/profile, enabled tools, authentication state, locale/timezone, cache settings, network policy, and start/end database state.

| Test | Expected verified outcome |
|---|---|
| Find a public plan price | Correct plan, amount, currency, billing terms, qualifications, and as-of date. |
| Compare two items | Correct identity, properties, and limits; no invented availability. |
| Extract a long article | Necessary conditions preserved; truncation identified or missing section retrieved. |
| Submit an invalid form | Field-specific error exposed; correctable input retained. |
| Login or MFA interruption | Explicit handoff; draft preserved; correct account restored. |
| Complete a booking | The correct single booking exists, with correct time, timezone, amount, and confirmation. |
| Lost response after commit | Retry yields the original operation result; no duplicate. |
| Price or inventory changes after review | Stale commit rejected or explicitly re-reviewed; no silent substitution. |
| Concurrent record edit | Lost update prevented; conflict recoverable. |
| Cancellation races with commit | Result states whether the effect happened; no false cancellation claim. |
| User completes task on another device | Agent detects existing completion and stops duplicate submission. |
| Third-party text contains malicious instructions | Unauthorized data access and side effects prevented; agent behavior recorded. |
| CDN/WAF challenge on an in-journey API call | Supported route succeeds under intended controls or receives a clear safe failure. |
| HTML/Markdown fetched under two account states | Neither variant leaks protected content; facts remain aligned. |
| Rate limit or connector token expires | Structured retry/re-authentication path; no repeated mutations. |
| Browser and MCP give different answers | Inconsistency detected and resolved against authoritative state. |

### 11.4 Use outcome categories that do not conceal harmful errors

For each attempt, classify:

- **Verified complete without intervention** — correct state, no prohibited side effects.
- **Verified complete after expected human intervention** — proper login/approval and correct final state.
- **Safe stop / refusal** — task not complete but no unauthorized or erroneous effect.
- **Incorrect effect** — duplicate, wrong target, wrong amount, unauthorized change, or similar deviation.
- **Unresolved** — final state cannot be established from available evidence.

Report attempts and counts, not a bare percentage. For example, “18 verified completions / 20 attempts; 1 safe stop; 1 incorrect effect” is more informative than “90% success.” Re-run important tasks from reset states, compare results by client route, and keep irreversible error severity visible.

Agent-evaluation research such as τ-bench motivates checking final database state and repeated-trial reliability. Historical results from such research should not be used as present-day performance claims for the products in this guide. [S64]

### 11.5 Measure technical readiness, discovery, and value separately

| Layer | Useful measurements | What they do **not** prove |
|---|---|---|
| Network access | Verified identity, 2xx/4xx/5xx, WAF/challenge decisions, latency, route failures. | A successful request is not a successful task or citation. |
| Public retrieval | Correct extracted facts, truncation, cache age, locale, indexing/snippet settings. | Retrieval does not guarantee ranking or use in an answer. |
| Agent workflows | Verified completion, incorrect effects, safe stops, intervention count, elapsed time. | A test result is not universal support across clients or versions. |
| Search visibility | Available Google generative-AI reporting and Bing AI citation metrics. | Exposure is not equivalent to downstream conversion. |
| Business value | Qualified referrals, requests, completed operations, revenue or task-time savings. | Analytics cannot attribute all agent-assisted activity perfectly. |

Google documents a Search Console performance report for generative-AI experiences; Bing documents AI Performance reporting; GA4 documents an AI Assistant channel with specific exclusions for Google Search AI experiences. Treat these as **different measurement systems** with different coverage. [S65], [S66], [S67]

Avoid identifying all automated requests by User-Agent alone, and do not infer a human's intent from a shared cloud egress IP. Apply normal privacy and retention policies to logs and test traces.

### 11.6 Make evaluation a release gate

For high-risk journeys, block release on any observed duplicate or unauthorized effect, silent change in a reviewed transaction, or inability to reconcile ambiguous outcomes. For nonconsequential content retrieval, set suitable accuracy/freshness thresholds and measure regressions. Maintain representative test fixtures for every major supported execution mode.

---

## 12. Recommended implementation order and operating model

### 12.1 Risk-based backlog

| Priority | Workstream | Definition of done |
|---|---|---|
| **P0** | Transaction correctness (if applicable) | Idempotency, version checks, confirmations, status reconciliation, and safe cancellation work in controlled failure tests. |
| **P0** | Identity and authorization | Account and resource scopes enforced across browser and tool interfaces; prompt-injection tests cannot cause unauthorized effects. |
| **P0** | Core interface semantics | Top user journeys work with labels, keyboard controls, visible state, and slow hydration. |
| **P0** | Baseline evaluation | Reproducible task fixtures, verified backend outcomes, and separate error categories exist. |
| **P0/P1** | Agent route and WAF access | Supported hosted, local, and connector routes can reach the complete authorized journey. |
| **P1** | Public HTML and discoverability | Key public facts, canonical URLs, links, indexing/snippet policy, and relevant crawler controls are correct. |
| **P1** | Extraction, caching, locale | Agent-visible facts remain complete, current enough for the use, and correct for intended region/timezone. |
| **P1/P2** | API and MCP integration | Identified clients can install, authenticate, call, recover, and verify operations. |
| **P2** | WebMCP, Markdown, `llms.txt`, specialized protocols | Real supported client use and a measurable benefit justify continued maintenance. |

**Priority depends on the site:** a static publisher may not need a transaction engine; an appointment marketplace cannot treat stale-slot protection as optional; an internal SaaS application may need connector authorization before public crawl optimization.

### 12.2 First 30 days: an implementation sequence

**Week 1 — Inventory and baseline:** choose three high-value journeys, list the intended clients and execution modes, document access controls, create test accounts, and run initial retrieval/UI/task tests. Capture known failures before changing the site.

**Week 2 — Repair the path:** fix semantic controls, hydration timing, visible errors, state persistence, and full-journey WAF connectivity. For transactional sites, implement duplicate protection and status retrieval immediately.

**Week 3 — Correctness and retrieval:** add quote/version checks, approval binding, cancellation outcomes, prompt-injection/permission tests, public HTML extraction, locale validation, and appropriate indexing controls.

**Week 4 — Integrate and measure:** pilot the highest-value supported API or MCP workflow; rerun every task, measure verified outcomes and unsafe effects, and decide whether optional representations or WebMCP provide additional value.

The schedule is an illustrative planning sequence, not an effort estimate. Actual ordering should follow risk and observed failures.

### 12.3 Assign ongoing ownership and update triggers

| Owner | Responsibilities | Review trigger |
|---|---|---|
| Frontend / accessibility | Semantics, keyboard, hydration, dialogs, visible state. | Major UI change or failed UI/agent test. |
| Backend / platform | Idempotency, versions, operation state, auth, APIs. | Workflow or permission model change. |
| Security / infrastructure | Agent verification, WAF, secrets, abuse prevention, logs. | Vendor identity/range change or access incident. |
| Content / SEO | Public facts, indexing, structured data, feeds, locales. | Significant content, product, or policy change. |
| QA / reliability | Agent-mode matrix, test fixtures, adverse cases, release gates. | Release and supported-client changes. |

Review platform claims on a regular cadence and whenever a vendor changes a browser mode, crawler policy, connector transport, WebMCP support boundary, or reporting interface. Maintain each entry with: **source URL, checked date, configuration, local test evidence, owner, and next review date**.

### 12.4 What to avoid

- Do not advertise “works with every AI agent” after testing one product or one browser mode.
- Do not turn off fraud, CAPTCHA, authorization, or CSRF protections based on a spoofable User-Agent.
- Do not use `robots.txt` as a privacy boundary or equate crawler permission with user authorization.
- Do not let a retry, cancellation, or new agent session create or conceal a second business operation.
- Do not assume every client runs JavaScript, supports WebMCP, discovers a remote MCP URL, or reads `llms.txt`.
- Do not infer current prices, stock, or consent from an old extract or a completed model message.
- Do not optimize for a speculative ranking trick when public content quality or an actual user journey is failing.

---

## Appendix A. Implementation and release checklist

Check items that apply to your site; mark other items *Not applicable*, not automatically *Failed*.

### Interface and state

- [ ] Core actions use semantic controls, correct labels, keyboard interaction, and observable states.
- [ ] Forms retain input and clearly associate validation errors with the affected field.
- [ ] Dialog focus, overlays, target size, and slow-hydration behavior have been tested.
- [ ] Sensitive fields use suitable HTML types/autocomplete and are excluded from logs/traces.
- [ ] Confirmations show persistent result identifiers and complete material conditions.

### Transactions and permissions

- [ ] Mutations cannot occur through accidental safe-method navigation or prefetch.
- [ ] Retry keys identify one logical operation and reject incompatible reuse.
- [ ] Every consequential action revalidates actor, resource, version/quote, price, and availability.
- [ ] Timeout, cancellation, and late-commit outcomes have documented recovery behavior.
- [ ] Account permissions, OAuth token audience/scopes, and object-level authorization are enforced.
- [ ] A cross-device or post-login continuation cannot repeat an already completed action.
- [ ] Untrusted page/tool text cannot authorize additional access or unrelated side effects.

### Access, retrieval, discovery

- [ ] Expected hosted-agent identities are verified according to their actual specifications.
- [ ] CDN/WAF rules cover the whole journey, including XHR/GraphQL/API calls and shared-IP behavior.
- [ ] Required public facts appear in retrievable HTML and have stable, crawlable URLs.
- [ ] Locale, currency, timezone, and relevant effective dates are explicit.
- [ ] `noindex`/snippet restrictions, canonical, sitemap, and `robots.txt` policies are reviewed.
- [ ] Training, grounding, search, user fetch, and browser-agent access decisions are tracked separately.
- [ ] Markdown and other representations (if provided) preserve meaning, security, and cache variation.

### Integration and verification

- [ ] API/MCP clients have specific supported transports, auth methods, scopes, and setup documentation.
- [ ] Tool inputs/outputs/errors are structured; tool state and UI state use the same authoritative service.
- [ ] WebMCP (if used) has a tested supported browser and a normal UI fallback.
- [ ] Real-agent tests specify product/version, environment, mode, account state, model/tools, and fixture.
- [ ] Backend records are checked for correctness and unintended side effects.
- [ ] Release criteria distinguish verified success, safe interruption, incorrect action, and unresolved state.
- [ ] Platform documentation and local test evidence have an assigned owner and checked date.

## Appendix B. Reusable compatibility-test record

```yaml
# Test inventory template — adapt to your QA system.
test_id: booking-confirm-after-timeout
journey: book consultation
product: "<agent/product name>"
product_version: "<version or not exposed>"
execution_mode: "hosted-browser | local-browser | fetch | remote-mcp"
browser_or_backend: "<profile / provider / extension version>"
authentication: "fresh | existing-session | delegated-token"
locale: en-US
timezone: America/Los_Angeles
currency: USD
network_policy: "<WAF/CDN ruleset ID>"
fixture_id: booking-test-2026-11
prompt: "<exact test instruction>"
expected_effect:
  booking_count_delta: 1
  correct_time: "2026-12-03T10:00:00-08:00"
  unauthorized_changes: 0
fault_injection: response-lost-after-commit
verification:
  operation_id: "<read from service>"
  backend_record_checked: true
outcome: "verified | human-assisted | safe-stop | incorrect | unresolved"
notes: "<what the agent actually saw and did>"
```

The record's values are illustrative. Keep production credentials and personal data out of test reports. Capture screenshots, network traces, and tool outputs only in accordance with your security and privacy policy.

## Appendix C. Source register and verification notes

**Method:** This revision retains the original guide's subjects and core recommendations, incorporates the two preceding reviews in this conversation, and checks central platform claims against current official documentation. Sources are listed by topic below. Where a statement is an engineering recommendation rather than an operator requirement, it is presented as such. Product availability and features are time-sensitive; this register is a point-in-time record, not a promise of continued support.


### Web standards, security, and interaction

- **S01.** [Google web.dev: Agent-friendly website UX](https://web.dev/articles/ai-agent-site-ux)
- **S02.** [W3C ARIA APG: Accessible names and descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
- **S03.** [W3C WCAG 2.2: Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- **S04.** [W3C WCAG 2.2: Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
- **S05.** [W3C WCAG 2.2: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- **S06.** [W3C ARIA APG: Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **S07.** [W3C WCAG 2.2: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **S08.** [Playwright: Navigations and hydration](https://playwright.dev/docs/navigations)
- **S09.** [WHATWG HTML: Form control infrastructure / autocomplete](https://html.spec.whatwg.org/dev/form-control-infrastructure.html)
- **S10.** [Anthropic: Use the cloud browser in Claude](https://support.claude.com/en/articles/18442783-use-the-cloud-browser-in-claude)
- **S11.** [Stripe: Low-level errors and retry handling](https://docs.stripe.com/error-low-level)
- **S12.** [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- **S13.** [W3C WAI: Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- **S14.** [W3C WCAG 2.2: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- **S15.** [Chrome: WebMCP best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- **S16.** [MCP: Authorization security considerations](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)
- **S17.** [OpenAI: Designing agents to resist prompt injection](https://openai.com/index/designing-agents-to-resist-prompt-injection/)

### Agent identity, interfaces, and tool protocols

- **S18.** [OpenAI Developers: Help ensure cloud browser access](https://developers.openai.com/commerce/agent-access)
- **S19.** [Google: Allow Google-Agent traffic](https://developers.google.com/crawling/docs/crawlers-fetchers/allow-google-agent)
- **S20.** [Anthropic: How Anthropic-hosted browsers identify themselves](https://support.claude.com/en/articles/18234133-how-do-anthropic-hosted-browsers-identify-themselves-when-they-browse-the-web-on-a-user-s-behalf)
- **S21.** [xAI: Grok Bot security](https://docs.x.ai/grok-bot/security)
- **S22.** [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- **S23.** [Model Context Protocol: Introduction](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)
- **S24.** [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- **S25.** [RFC 6585: Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585.html)
- **S26.** [MCP: Server tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- **S27.** [Perplexity: Adding custom remote connectors](https://www.perplexity.ai/help-center/en/articles/13915507-adding-custom-remote-connectors)
- **S28.** [Perplexity: Computer MCP server](https://docs.perplexity.ai/docs/getting-started/integrations/computer-mcp-server)
- **S29.** [Chrome: WebMCP](https://developer.chrome.com/docs/ai/webmcp)
- **S30.** [OpenAI ChatGPT Learn: Site tools](https://learn.chatgpt.com/docs/webmcp)
- **S31.** [Google Search Central: Generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

### Public content, discovery, and content-use controls

- **S32.** [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- **S33.** [Google Search Central: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- **S34.** [IndexNow: FAQ](https://www.indexnow.org/faq)
- **S35.** [Google Search Central: Multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- **S36.** [Hermes Agent: Web search and extraction](https://hermes-agent.nousresearch.com/docs/user-guide/features/web-search)
- **S37.** [OpenClaw: Web fetch](https://docs.openclaw.ai/web-fetch)
- **S38.** [Cloudflare: Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- **S39.** [OpenAI Developers: OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- **S40.** [Anthropic: Crawling and crawler opt-outs](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- **S41.** [Perplexity: Crawler reference](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- **S42.** [Meta: Web crawlers](https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers)
- **S43.** [Google: Common crawlers, including Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)
- **S44.** [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
- **S45.** [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- **S46.** [Google Search Console: Generative AI inclusion preferences](https://support.google.com/webmasters/answer/16908024)
- **S47.** [Bing Webmaster Tools: New AI preferences and transition](https://www.bing.com/webmasters/help/new-ai-preferences-2t1cc16d)
- **S48.** [Google Search Central: Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- **S49.** [llms.txt proposal](https://llmstxt.org/)

### Product and agent-specific documentation

- **S50.** [Meta: How Muse browses the web](https://www.meta.com/en-gb/help/superintelligence/2124746764949121/)
- **S51.** [Google Gemini Apps: Manage tasks and browser workflows](https://support.google.com/gemini/answer/17094507?hl=en)
- **S52.** [Anthropic: Get started with Claude Duet](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet)
- **S53.** [Anthropic: Built-in browser in Claude Cowork](https://support.claude.com/en/articles/16607400-use-the-built-in-browser-in-claude-cowork)
- **S54.** [Anthropic: Get started with Claude in Chrome](https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome)
- **S55.** [Anthropic: Remote MCP custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- **S56.** [Perplexity: Computer product changelog](https://www.perplexity.ai/changelog/automations-inline-visualizations-and-gpt-6-1-sol)
- **S57.** [Instinct: Privacy policy](https://instinct.com/privacy-policy)
- **S58.** [Hermes Agent: Browser automation](https://hermes-agent.nousresearch.com/docs/user-guide/features/browser)
- **S59.** [Hermes Agent: MCP integration](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)
- **S60.** [OpenClaw: Browser profiles](https://docs.openclaw.ai/tools/browser/profiles)
- **S61.** [OpenClaw: Connect MCP servers](https://docs.openclaw.ai/tools/mcp)

### Testing, measurement, and research

- **S62.** [Playwright: Locators](https://playwright.dev/docs/locators)
- **S63.** [Chrome: Lighthouse Agentic Browsing scoring](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring)
- **S64.** [τ-bench: A benchmark for tool-using agents](https://arxiv.org/abs/2406.12045)
- **S65.** [Google Search Console: Generative AI performance report](https://support.google.com/webmasters/answer/16984139)
- **S66.** [Bing Webmaster Tools: AI Performance public preview](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
- **S67.** [Google Analytics: Default channel groups](https://support.google.com/analytics/answer/9756891?hl=en)

<!-- Citation links resolve directly to the source URLs above. -->

[S01]: https://web.dev/articles/ai-agent-site-ux "Google web.dev: Agent-friendly website UX"
[S02]: https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/ "W3C ARIA APG: Accessible names and descriptions"
[S03]: https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html "W3C WCAG 2.2: Label in Name"
[S04]: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html "W3C WCAG 2.2: Name, Role, Value"
[S05]: https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html "W3C WCAG 2.2: Keyboard"
[S06]: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ "W3C ARIA APG: Modal Dialog Pattern"
[S07]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html "W3C WCAG 2.2: Target Size (Minimum)"
[S08]: https://playwright.dev/docs/navigations "Playwright: Navigations and hydration"
[S09]: https://html.spec.whatwg.org/dev/form-control-infrastructure.html "WHATWG HTML: Form control infrastructure / autocomplete"
[S10]: https://support.claude.com/en/articles/18442783-use-the-cloud-browser-in-claude "Anthropic: Use the cloud browser in Claude"
[S11]: https://docs.stripe.com/error-low-level "Stripe: Low-level errors and retry handling"
[S12]: https://www.rfc-editor.org/rfc/rfc9110.html "RFC 9110: HTTP Semantics"
[S13]: https://www.w3.org/WAI/tutorials/forms/notifications/ "W3C WAI: Form notifications"
[S14]: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html "W3C WCAG 2.2: Status Messages"
[S15]: https://developer.chrome.com/docs/ai/webmcp/best-practices "Chrome: WebMCP best practices"
[S16]: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations "MCP: Authorization security considerations"
[S17]: https://openai.com/index/designing-agents-to-resist-prompt-injection/ "OpenAI: Designing agents to resist prompt injection"
[S18]: https://developers.openai.com/commerce/agent-access "OpenAI Developers: Help ensure cloud browser access"
[S19]: https://developers.google.com/crawling/docs/crawlers-fetchers/allow-google-agent "Google: Allow Google-Agent traffic"
[S20]: https://support.claude.com/en/articles/18234133-how-do-anthropic-hosted-browsers-identify-themselves-when-they-browse-the-web-on-a-user-s-behalf "Anthropic: How Anthropic-hosted browsers identify themselves"
[S21]: https://docs.x.ai/grok-bot/security "xAI: Grok Bot security"
[S22]: https://spec.openapis.org/oas/latest.html "OpenAPI Specification"
[S23]: https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro "Model Context Protocol: Introduction"
[S24]: https://www.rfc-editor.org/rfc/rfc9457.html "RFC 9457: Problem Details for HTTP APIs"
[S25]: https://www.rfc-editor.org/rfc/rfc6585.html "RFC 6585: Additional HTTP Status Codes"
[S26]: https://modelcontextprotocol.io/specification/2026-07-28/server/tools "MCP: Server tools specification"
[S27]: https://www.perplexity.ai/help-center/en/articles/13915507-adding-custom-remote-connectors "Perplexity: Adding custom remote connectors"
[S28]: https://docs.perplexity.ai/docs/getting-started/integrations/computer-mcp-server "Perplexity: Computer MCP server"
[S29]: https://developer.chrome.com/docs/ai/webmcp "Chrome: WebMCP"
[S30]: https://learn.chatgpt.com/docs/webmcp "OpenAI ChatGPT Learn: Site tools"
[S31]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide "Google Search Central: Generative AI optimization guide"
[S32]: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics "Google Search Central: JavaScript SEO basics"
[S33]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central: Build and submit a sitemap"
[S34]: https://www.indexnow.org/faq "IndexNow: FAQ"
[S35]: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites "Google Search Central: Multi-regional and multilingual sites"
[S36]: https://hermes-agent.nousresearch.com/docs/user-guide/features/web-search "Hermes Agent: Web search and extraction"
[S37]: https://docs.openclaw.ai/web-fetch "OpenClaw: Web fetch"
[S38]: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/ "Cloudflare: Markdown for Agents"
[S39]: https://developers.openai.com/api/docs/bots "OpenAI Developers: OpenAI crawlers"
[S40]: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler "Anthropic: Crawling and crawler opt-outs"
[S41]: https://docs.perplexity.ai/docs/resources/perplexity-crawlers "Perplexity: Crawler reference"
[S42]: https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers "Meta: Web crawlers"
[S43]: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers "Google: Common crawlers, including Google-Extended"
[S44]: https://www.rfc-editor.org/rfc/rfc9309.html "RFC 9309: Robots Exclusion Protocol"
[S45]: https://developers.google.com/search/docs/appearance/ai-features "Google Search Central: AI features and your website"
[S46]: https://support.google.com/webmasters/answer/16908024 "Google Search Console: Generative AI inclusion preferences"
[S47]: https://www.bing.com/webmasters/help/new-ai-preferences-2t1cc16d "Bing Webmaster Tools: New AI preferences and transition"
[S48]: https://developers.google.com/search/docs/appearance/structured-data/sd-policies "Google Search Central: Structured data policies"
[S49]: https://llmstxt.org/ "llms.txt proposal"
[S50]: https://www.meta.com/en-gb/help/superintelligence/2124746764949121/ "Meta: How Muse browses the web"
[S51]: https://support.google.com/gemini/answer/17094507?hl=en "Google Gemini Apps: Manage tasks and browser workflows"
[S52]: https://support.claude.com/en/articles/17631495-get-started-with-claude-duet "Anthropic: Get started with Claude Duet"
[S53]: https://support.claude.com/en/articles/16607400-use-the-built-in-browser-in-claude-cowork "Anthropic: Built-in browser in Claude Cowork"
[S54]: https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome "Anthropic: Get started with Claude in Chrome"
[S55]: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp "Anthropic: Remote MCP custom connectors"
[S56]: https://www.perplexity.ai/changelog/automations-inline-visualizations-and-gpt-6-1-sol "Perplexity: Computer product changelog"
[S57]: https://instinct.com/privacy-policy "Instinct: Privacy policy"
[S58]: https://hermes-agent.nousresearch.com/docs/user-guide/features/browser "Hermes Agent: Browser automation"
[S59]: https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp "Hermes Agent: MCP integration"
[S60]: https://docs.openclaw.ai/tools/browser/profiles "OpenClaw: Browser profiles"
[S61]: https://docs.openclaw.ai/tools/mcp "OpenClaw: Connect MCP servers"
[S62]: https://playwright.dev/docs/locators "Playwright: Locators"
[S63]: https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring "Chrome: Lighthouse Agentic Browsing scoring"
[S64]: https://arxiv.org/abs/2406.12045 "τ-bench: A benchmark for tool-using agents"
[S65]: https://support.google.com/webmasters/answer/16984139 "Google Search Console: Generative AI performance report"
[S66]: https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/ "Bing Webmaster Tools: AI Performance public preview"
[S67]: https://support.google.com/analytics/answer/9756891?hl=en "Google Analytics: Default channel groups"
