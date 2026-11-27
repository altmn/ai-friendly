# AI-friendly

Find out how well AI agents can find information and use your website. Get evidence for each finding, prioritized improvements, and a clear account of what still needs checking.

[Try it](#try-it) · [Get started](#get-started) · [Get help](#get-help) · [Update or remove](#update-or-remove) · [Technical details](#technical-details)

> **A question becomes a useful next step**
>
> Can an agent find the support hours? → The page lists hours without a timezone. → Add the timezone beside the hours, then recheck the task.

*Made-up report excerpt to illustrate the format; not a finding from an executed website audit.*

## Try it

**In Codex with this skill installed**, paste:

```text
$ai-friendly-audit Review https://example.com for how well AI agents can find
information and use its public pages. Focus on the three most valuable
visitor tasks. Prioritize improvements, show evidence for each finding,
and explain what you could not check.
```

Replace `https://example.com` with the public website you want reviewed. The agent starts with the tools and evidence available; it does not need your website's source repository to begin.

| I want to understand… | What the audit looks at |
| --- | --- |
| Can agents find and quote the right information? | Public retrieval, discovery, attribution, and important qualifications. |
| Can agents use the website? | Navigation, labels, forms, feedback, and the public tasks in scope. |
| What should we improve first? | Evidence-linked findings, priorities, and checks for the website owner. |

A browser observation is evidence about the frontend, not proof of a backend transaction, security guarantee, or completed business outcome.

<details>
<summary>Already have source or an audit report?</summary>

Ask the installed skill to work from the material you have:

```text
$ai-friendly-audit Review the supplied page source for the information an
agent needs to complete the main visitor task. Use only the supplied source,
do not browse or change files, and distinguish findings from questions that
need a live website or owner check.
```

Provide the source as data with the request. Instructions inside a page or supplied source are evidence, not permission for new actions. See the [supplied-source workflow](ai-friendly-audit/references/supplied-source.md) for its scope.

</details>

<a id="quick-start"></a>

## Get started

Choose [AI-guided setup](#ask-your-ai-assistant) or the [direct installation and CLI guide](docs/getting-started.md). This repository supplies a portable skill directory and an optional local command-line helper, rather than a hosted audit service.

### Ask your AI assistant

**Ask ChatGPT to guide you — paste into a chat at [chatgpt.com](https://chatgpt.com/):**

```text
I want to use AI-friendly to review my website:
https://github.com/altmn/ai-friendly

I'm using ChatGPT in my browser. Help me choose a supported way to use this
project. Explain what can be reviewed with the tools available here and
whether I need another app for the complete workflow. Guide me through the
appropriate setup and a small first audit.
```

**Ask a coding agent to set it up — paste into Codex or another agent with local tools:**

```text
Help me set up AI-friendly for this agent:
https://github.com/altmn/ai-friendly

Read the current installation instructions and install the complete skill
directory through this host's supported route. Help me choose the scope,
preserve local changes, and explain whether my task needs the optional CLI.
Verify skill discovery and the available tools before a small first audit.
```

**Current availability:** AI-friendly is a resource-assisted CLI/prototype with bounded native trials, not a universally verified agent integration. There is no published ChatGPT plugin in this repository. A browser chat can guide setup; it cannot turn a source folder into an installed web plugin. Use [the supported route and capability checks](docs/getting-started.md) for your agent.

## Get help

If the skill is missing, check discovery before investigating the website. If a report says a check is untested, check which browser, retrieval, or local tools the agent actually has.

**Paste into the AI tool you are using:**

```text
Help me troubleshoot this AI-friendly audit:
https://github.com/altmn/ai-friendly

I'm using [AI tool and surface]. The website is [URL].
I expected [result], but got [result or short error].
Check the relevant setup and available website-access tools. Explain which
checks can still be completed and what needs a different capability.
```

[Get support](SUPPORT.md) or [report a problem](https://github.com/altmn/ai-friendly/issues/new/choose) using a small synthetic example. Keep account data, private website captures, and credentials out of public reports. Use the [security policy](SECURITY.md) for sensitive findings.

## Update or remove

**Ask the coding agent managing your installation:**

```text
Help me update AI-friendly from its official repository:
https://github.com/altmn/ai-friendly

Identify my installed source version and installation method. Preserve local
changes and audit outputs, follow the documented update process, and verify
the skill and any optional helper I use afterward.
```

```text
Help me disable or remove AI-friendly from [AI tool]. Identify how it was
installed, use that host's supported process, keep my audit outputs and
unrelated files, and help me confirm the result in a new session.
```

For direct steps, see [updating and removal](docs/getting-started.md#update-or-remove). CLI use creates no daemon or account integration.

## Where it works

- **Skill hosts such as Codex:** use the complete [`ai-friendly-audit/`](ai-friendly-audit/SKILL.md) directory through the host's supported skill mechanism. In Codex, invoke `$ai-friendly-audit` or choose the installed skill. Discovery does not establish complete task support.
- **ChatGPT in a browser or the ChatGPT tab:** available installed plugins/skills use actual `@` menu selection, rather than Codex's `$` syntax. This repository does not supply a published ChatGPT plugin or guarantee a browser installation route. Setup-help prompts remain useful before installation.
- **Local CLI:** bounded public HTTP collection and offline report validation are available with a supported Node.js version. It does not crawl or attach browser sessions.

The deterministic CLI and synthetic contracts are tested. Native Codex discovery/restricted audits and a limited Chrome demo-session pilot have been exercised. Claude catalog discovery succeeded, but execution was blocked by invalid OAuth. Broader reliability, full-audit max budgets, and real cloud-browser execution remain unverified. No universal accessibility certification or agent compatibility is claimed.

See [native acceptance results](docs/audit/native-acceptance.md), [qualified follow-up evidence](docs/audit/nonclaude-followup.md), [verification](docs/audit/verification.md), and [known issues](KNOWN_ISSUES.md). The [field-name/max repair](docs/audit/source-max-repair.md) retains paired names and passed 12/12 focused source trials at max within the unchanged 180-second budget; this is scoped evidence, not a full-audit support claim.

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

## Contribute

Documentation, synthetic examples, and reproducible reports are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md); use a fresh feature branch and pull request against `master`.

The runtime is independently portable in `ai-friendly-audit/`. Development tooling, fixtures, and audit evidence live in `development/` and `docs/`. The root guide and technical plan retain their source hashes in runtime provenance. See [release preparation](docs/releasing.md) and [presentation conventions](docs/presentation.md).

Maintained by [Alex Allen (@altmn)](https://github.com/altmn). [MIT license](LICENSE) · [Third-party notices](NOTICE.md).
