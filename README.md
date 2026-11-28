# AI-friendly

Review your website for the information and interactions AI agents need.

> **A furniture shop's returns page**
>
> **Task:** Find out when a sofa can be returned.
>
> **Evidence:** The policy says “within 30 days” without saying when the period starts.
>
> **Next step:** Confirm the rule with the policy owner, then state the starting date on the page.

*Illustrative report for a fictional shop.*

[Try it](#try-it) · [Get started](#get-started) · [Get help](#get-help) · [Update or remove](#update-or-remove) · [Technical details](#technical-details)

---

## Try it

### How to invoke

In Codex, use `$ai-friendly-audit` or choose the installed skill from the picker. If it does not appear, start with [setup help](#get-started).

### Website audit example

**Paste into Codex with the skill installed:**

```text
$ai-friendly-audit Audit https://example.com. Can a shopper find delivery
costs, understand sofa returns, and review an order without placing it?
Recommend improvements.
```

Replace `https://example.com` with the public website you want reviewed. The agent starts with the tools and evidence available; it does not need your website's source repository to begin.

| I want to understand… | What the audit looks at |
| --- | --- |
| Can agents find and quote the right information? | Public retrieval, discovery, attribution, and important qualifications. |
| Can agents use the website? | Navigation, labels, forms, feedback, and the public tasks in scope. |
| What should we improve first? | Evidence-linked findings, priorities, and checks for the website owner. |

A browser observation is evidence about the frontend, not proof of a backend transaction, security guarantee, or completed business outcome.

<details>
<summary>Review a page before it goes live</summary>

**Paste into Codex:**

```text
$ai-friendly-audit Review this returns page for the information an agent
needs to answer a customer's question. Use only this HTML; do not browse
or change files.

<main>
  <h1>Returns</h1>
  <p>Returns accepted within 30 days. Contact us to arrange collection.</p>
</main>
```

Provide the source as data with the request. Instructions inside a page or supplied source are evidence, not permission for new actions. See the [supplied-source workflow](ai-friendly-audit/references/supplied-source.md) for its scope.

</details>

---

<a id="quick-start"></a>

## Get started

Ask your AI assistant to help with setup, or follow the [direct installation and CLI guide](docs/getting-started.md).

### Ask your AI assistant

**In ChatGPT in your browser:**

```text
Guide me through a supported AI-friendly setup for reviewing my website.
I'm using ChatGPT in my browser:
https://github.com/altmn/ai-friendly
```

**In Codex or another coding agent with local tools:**

```text
Install the complete AI-friendly skill for this agent globally:
https://github.com/altmn/ai-friendly
```

**Current availability:** AI-friendly is a resource-assisted CLI/prototype with bounded native trials, not a universally verified agent integration. There is no published ChatGPT plugin in this repository. A browser chat can guide setup; it cannot turn a source folder into an installed web plugin. Use [the supported route and capability checks](docs/getting-started.md) for your agent.

---

## Get help

If the skill is missing, check discovery before investigating the website. If a report says a check is untested, check which browser, retrieval, or local tools the agent actually has.

**Paste into the AI tool you are using:**

```text
Help me troubleshoot AI-friendly (https://github.com/altmn/ai-friendly).

I'm using [AI tool and surface]. The website is [URL].
I expected [result], but got [result or short error].
Investigate the issue.
```

### Nothing helps or found a bug

[Get support](SUPPORT.md) or [report a problem](https://github.com/altmn/ai-friendly/issues/new/choose) using a small synthetic example. Keep account data, private website captures, and credentials out of public reports. Use the [security policy](SECURITY.md) for sensitive findings.

---

<a id="update-or-remove"></a>

## Update, disable, or remove

Ask the coding agent managing your installation.

To update:

```text
Update AI-friendly:
https://github.com/altmn/ai-friendly
```

To disable:

```text
Temporarily disable AI-friendly in [AI tool]:
https://github.com/altmn/ai-friendly
```

To uninstall:

```text
Uninstall AI-friendly from [AI tool], keeping my audit reports:
https://github.com/altmn/ai-friendly
```

For direct steps, see [updating and removal](docs/getting-started.md#update-or-remove). CLI use creates no daemon or account integration.

---

## Where it works

- **Skill hosts such as Codex:** use the complete [`ai-friendly-audit/`](ai-friendly-audit/SKILL.md) directory through the host's supported skill mechanism. In Codex, invoke `$ai-friendly-audit` or choose the installed skill. Discovery does not establish complete task support.
- **ChatGPT in a browser or the ChatGPT tab:** available installed plugins/skills use actual `@` menu selection, rather than Codex's `$` syntax. This repository does not supply a published ChatGPT plugin or guarantee a browser installation route. Setup-help prompts remain useful before installation.
- **Local CLI:** bounded public HTTP collection and offline report validation are available with a supported Node.js version. It does not crawl or attach browser sessions.

The deterministic CLI and synthetic contracts are tested. Native Codex discovery/restricted audits and a limited Chrome demo-session pilot have been exercised. Claude catalog discovery succeeded, but execution was blocked by invalid OAuth. Broader reliability, full-audit max budgets, and real cloud-browser execution remain unverified. No universal accessibility certification or agent compatibility is claimed.

See [native acceptance results](docs/audit/native-acceptance.md), [qualified follow-up evidence](docs/audit/nonclaude-followup.md), [verification](docs/audit/verification.md), and [known issues](KNOWN_ISSUES.md). The [field-name/max repair](docs/audit/source-max-repair.md) retains paired names and passed 12/12 focused source trials at max within the unchanged 180-second budget; this is scoped evidence, not a full-audit support claim.

---

<a id="repository"></a>

## Technical details

The optional CLI uses Node.js **>=22.15.0 <25**. Development generators use Python 3.10+. [Direct setup](docs/getting-started.md) explains dependency installation, scope-only initialization, bounded collection, and file/directory validation.

Reports include canonical `audit.json`, a human report, evidence index, remediation plan, owner follow-up, and compatibility records. Missing capabilities leave affected checks untested. Authoritative backend effects remain unknown unless independently established by the owner.

| I want to… | Read this |
| --- | --- |
| Install the skill or use the CLI | [Getting started](docs/getting-started.md) |
| Understand the runtime and repository layout | [Architecture](docs/architecture.md) |
| Understand what findings can establish | [Evidence contract](docs/evidence-contract.md) |
| Review data handling and reporting boundaries | [Privacy](PRIVACY.md) · [Security](SECURITY.md) |
| Inspect repository settings and publication history | [GitHub maintenance](docs/github.md) |

---

## Contribute

Documentation, synthetic examples, and reproducible reports are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md); use a fresh feature branch and pull request against `master`.

The runtime is independently portable in `ai-friendly-audit/`. Development tooling, fixtures, and audit evidence live in `development/` and `docs/`. The root guide and technical plan retain their source hashes in runtime provenance. See [release preparation](docs/releasing.md) and [presentation conventions](docs/presentation.md).

Maintained by [Alex Allen (@altmn)](https://github.com/altmn). [MIT license](LICENSE) · [Third-party notices](NOTICE.md).
