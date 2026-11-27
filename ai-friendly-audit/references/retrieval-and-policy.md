# Retrieval, locale, discovery, and content-use policy

## Contents

- [Select facts and representations](#select-facts-and-representations)
- [Compare actual representations](#compare-actual-representations)
- [Locale and freshness](#locale-and-freshness)
- [Discovery and attribution](#discovery-and-attribution)
- [Content-use policy](#content-use-policy)
- [Optional representations](#optional-representations)
- [Interpretation and acceptance](#interpretation-and-acceptance)

## Select facts and representations

Select information tasks from actual site purpose, such as retrieving a plan's full price and limits, a service's eligibility and operating region, or a documentation feature's version and restrictions. Define necessary facts before comparing representations. Treat visible source content as a comparison baseline, not independent proof of business truth.

For each fact record identity, value, qualifiers, source/state/representation ID, capture time, and evidence IDs. Relevant qualifiers can include currency, billing interval, units, quantities, eligibility, region, date, timezone, version, availability status, and exceptions. Keep table-header relationships and link destinations where needed for interpretation.

| Representation | Evidence it can establish | Boundary |
| --- | --- | --- |
| Initial response | Facts and metadata in the actual returned HTML/headers | Does not execute JavaScript |
| Rendered page | Observed visible text/structure after meaningful readiness | Can differ by session, locale, timing, and client state |
| Actual extractor output | What the named tool returned under recorded options | No inferred support by another product |
| Local static conversion | Output from the package's own parser/converter | Must be labeled a local conversion, not an actual remote extractor |
| Offered alternate format | Actual Markdown or other published representation | Compare scope, freshness, meaning, and access context separately |
| Search result | Indexed or summarized material from the stated source | Does not prove present live runtime behavior |

A missing channel remains unknown. Do not pass an extractor-fidelity rule using the browser DOM or label a post-JavaScript snapshot “initial HTML.”

## Compare actual representations

1. Record the content task and its material facts from an identified safe source.
2. Capture initial response and relevant headers if permitted and available.
3. Capture rendered text/relationships at meaningful readiness, with state and time.
4. Use the actual available extractor if authorized; record product, version, options, and returned form.
5. Match entity, language, region, session, and content version before comparing values.
6. Classify each expected fact/qualifier as present, missing, mismatched, or unknown with evidence.
7. Inspect beginning, middle, end, tables, links, and text alternatives relevant to the task.
8. Record observed truncation, output size, continuation, and any tool-display limit separately.
9. Compare offered alternate representations only when actually linked, documented, or supplied.
10. Preserve unresolved freshness or access differences instead of inventing a cause.

Record a comparison as a mismatch only when the underlying captures support it. A price difference between regions, account tiers, or capture dates may be legitimate. A missing qualification can be material even when the headline amount is correct. An unavailable source or extractor is not evidence of absence.

Use targeted continuation where supported and bounded. Do not hardcode another tool's character budget into a website requirement or prescribe arbitrary chunk lengths. Keep source facts and necessary conditions close and comprehensible as an engineering recommendation.

## Locale and freshness

Record requested region/language/timezone/currency separately from browser settings, selected site settings, and observable execution geography. Never use the audit machine's timezone or IP geography as the user's intent. Unknown owner/user intent is a limitation, not automatic failure.

Check dates, money, quantities, intervals, units, and terms across relevant detail, selection, review, and already available confirmation views. A calendar appointment needs a clear timezone; a timeless essay may not. Test only safe locale transitions; do not force account switching or authentication expiration to obtain coverage.

Inspect current response status, `Content-Type`, cache-control, age, variation, and validators when exposed. Attribute a stale value to a cache only when evidence supports that inference. Cache age or a displayed date alone does not establish current authoritative price or availability. Absence of `ETag` or `Last-Modified` is not a universal failure; representation transformation can change validator behavior.

For negotiated formats, compare actual content type and cache variation with the negotiation dimensions. Private-format authorization requires independently supplied authorized contexts or controlled fixtures; never transfer session secrets or probe another account's records. Comprehensive enforcement stays in the owner register.

## Discovery and attribution

Assess public content intended for discovery separately from retrieval and interaction. Record actual `robots.txt`, HTML robots directives, `X-Robots-Tag`, canonical, redirects, snippet restrictions, sitemap entries, internal links, language alternatives, structured data, titles, descriptions, and sharing metadata as applicable.

Check whether canonical/internal-link/sitemap signals agree and whether content-detail URLs support ordinary direct access. Do not promise indexing, ranking, answer inclusion, or citations from those signals. Account-only/private pages may intentionally be undiscoverable.

Compare structured facts and sharing metadata with visible content in the same scope. A mismatched currency, availability, date, title, or organization can support a visible consistency finding. Private catalogs, feeds, analytics, or search-console status require separately attributed owner evidence. Missing optional schema types are not universal defects.

## Content-use policy

Keep separate records for search crawling/indexing, model training, grounding, user-triggered retrieval, and browser-agent access. For each operator or control, record owner intent, observed directive, documented effect, applicable product/mode/version, checked date, effective date, exceptions, and uncertainty.

Do not map every vendor to one token per purpose. A single policy token can affect more than one documented use; a user-requested fetcher can differ from a search crawler. Verify the current original operator documentation before recommending a configuration change. Do not recommend opening training access by default.

When owner intent is unknown, describe observed signals and their documented implications without treating them as a failed business choice. Add `OWN-POLICY` verification where confirmation matters.

### Robots interpretation

Apply matching product groups correctly. Combine applicable groups for the same product under RFC 9309; use the wildcard fallback only when no product group matches. Do not automatically add wildcard rules to a separately matched product group. Apply longest-match and allow/disallow tie behavior according to the protocol. Keep vendor extensions separately documented. [R1]

Robots rules express cooperative crawl preferences and are not authentication or confidentiality controls. Do not treat a blocked robots route as secured private data. A crawler unable to retrieve a page may not observe its in-page noindex directive; crawl permission, indexing, and snippet eligibility need distinct conclusions.

### Dated controls

Keep `announced-upcoming` separate from active documented behavior. The supplied guide/plan record a Microsoft policy effective date of 2027-02-01; this is a supplied research claim, not a runtime mandate. Recheck the linked announcement and current operator documentation before recommending that control, and preserve its effective date rather than silently relabeling it. [R2]

## Optional representations

Markdown, `llms.txt`, WebMCP, and special protocols are conditional improvements. Their absence does not fail ordinary browser or retrieval usability. For an offered feature, require a named client/use case, normal fallback, content/access consistency, owner-policy alignment, and evidence of benefit before recommending expansion.

Follow actual offered links; do not guess private alternate endpoints. Compare facts, table structure, links, qualifiers, locale, version, dates, and access context. Avoid creating independently maintained facts that can drift. Never recommend hidden instructions, fabricated endorsements, keyword stuffing, or universal “AI SEO” files.

## Interpretation and acceptance

Prioritize a lost material qualifier or wrong price/timezone according to the selected task's consequences. Keep presentation inconvenience separate from a materially incorrect answer. Preserve the exact channel and tested client in the finding.

An acceptance test should specify facts/qualifiers, channels, capture context, and expected comparison. For example: “For the named price task, initial HTML and the tested extractor retain amount, currency, interval, eligibility, and effective date; omitted channels remain disclosed.” This is a proposed test, not a report of a run.

Requirements basis: supplied plan revision 2.0 §§8.5, 9.8–9.9, 10–11 and guide revision 2.0 §§6–9.

- [R1: RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), independently checked 2026-11-22.
- [R2: Microsoft announced training and grounding preferences](https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/), supplied dated provenance; recheck before use.
- [Google AI features and websites](https://developers.google.com/search/docs/appearance/ai-features), primary research seed; recheck current product conditions.
- [Cloudflare Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/), primary research seed for negotiated representations; apply only to evidenced configurations.
- [llms.txt proposal](https://llmstxt.org/), optional proposal rather than a universal requirement.
