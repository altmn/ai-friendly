# Native acceptance development harness

The public repository starts with a new initial commit. Pre-publication commit
IDs in historical receipts identify the private development history and are not
available in a public clone. Historical comparison scripts need that separately
retained history; `prepare_repair_trials.py --previous-ref` can instead select
an available, reviewed revision for a new comparison. Such a comparison has new
inputs and does not reproduce or supersede the historical receipts.

The field-name/max-budget repair panel uses `prepare_repair_trials.py` and
`repair_trials.py`. It needs the full repository/history (default prior revision
`a069d8c`), reviewed local dependencies and usable native Codex authentication;
the development archive alone does not supply Git history or credentials.
Review both before running. In a fresh private directory,
provide the reviewed Node executable and a freshly verified private inventory:

```sh
python3 development/native_acceptance/prepare_repair_trials.py \
  --workspace NEW_PRIVATE_DIRECTORY --isolation-inventory PRIVATE_INVENTORY \
  --node /reviewed/supported/node
python3 development/native_acceptance/repair_trials.py \
  --workspace NEW_PRIVATE_DIRECTORY --condition candidate --shard 0
```

Run candidate shard 1 for the reversed second repeat, plus previous and baseline
shard 0 for the frozen comparison. Preparation stages reviewed source/dependencies
only; it neither installs packages nor invokes models. Trials invoke the native
Codex host, with a new owned process/thread per case, max reasoning, a 180-second
absolute turn deadline and zero retries. They close the owned server on timeout
and continue the remaining planned cases. Keep all failures and private events.
These scripts never invoke Claude. See the source-max repair plan and results
under `docs/audit/`; they do not supersede the historical panel below.

These evaluator tools are outside the portable runtime. They use owned,
ephemeral Codex app-server threads, a read-only/no-network actor sandbox, private
fixtures, and native completion events. They do not install a skill, copy auth
files, change live host configuration, or invoke Claude.

`followup_prepare.py --workspace NEW_DIRECTORY` stages the original `max` panel
and a Git-archived prior prototype; `--profile medium` reproduces the fresh
medium fixtures under `NEW_DIRECTORY/medium`. Review its pinned commit before reuse. The
November 26 `medium` profile used fresh amounts, labels and eligibility facts;
the frozen public panel records every executed input hash. It was a separately
declared profile after the initial timeouts, not an erased retry.

Before running a native trial, privately inventory the host's current skill
paths and MCP transport types, disable every unrelated skill and MCP server via
process-only overrides, and verify the resulting native catalog/configuration.
Keep user security policy and hooks. An empty config table or a host-discovery
flag alone did **not** clear inherited skills/servers on the tested host.
`followup_run.py` requires the frozen panel, work files and private inventories;
it refuses to overwrite an attempt directory. Do not reuse the historical
inventory on a different host. A fresh directory alone is not isolation.

`extract_readability.cjs` accepts a separately reviewed, integrity-verified
Readability package directory. It does not fetch or install packages. For the
recorded run, Readability 0.6.0 and its bundled parser were extracted privately
without lifecycle scripts. No third-party extractor code is distributed here.

`lifecycle_check.py` exercises one thread across three turns and actual native
compaction. `test_rpc_client.py` guards against counting a late old-turn event
as the current turn's completion. The offline `grade_followup.py` checks exact
completion identity, native full entrypoint reads, output facts and evidence
boundaries. Its text patterns are conservative locators; separately retained
source adjudication addresses phrasing they miss. Do not interpret a small-panel
score or schema-valid record as universal compatibility.

Offline regression checks:

```sh
python3 -m unittest discover -s development/native_acceptance -p 'test_*.py' -v
```

Original skill-builder record schemas are optional external validation inputs:

```sh
node development/native_acceptance/validate_records.mjs ORIGINAL_SCHEMA_DIRECTORY \
  followup-codex-host.json followup-evaluation-receipt.json
```

Keep raw provider events/config inventories private. Commit only minimized
observations, hashes, explicit failures/unrun slots, and verification records.
Close owned processes and tabs after each run; preserve the user's browser and
existing host configuration.

## Earlier native acceptance pilot

This directory owns the synthetic loopback fixture, project-scoped native host
runner, native Codex enumeration probe, browser-report normalization, and minimized
evidence assembly. Actual results and limitations are in
`docs/audit/native-acceptance.md`. These are development tools, never runtime
skill files or an installer.

1. Review these scripts. Choose a new owned directory and run
   `python3 development/native_acceptance/prepare.py --workspace NEW_DIRECTORY`.
   Freeze prompts, budgets, input hashes and grading criteria before model runs.
2. Run `run_hosts.py --workspace DIRECTORY --host codex` (or `claude`) only with
   independently usable native authentication. Each child has a 180-second
   deadline. No permission bypass, live installation or automatic auth repair is
   used. The native binary comes from PATH or explicit `--binary`; its version
   must match the frozen panel. Claude exposes only Read/Skill and denies other tools.
3. Run `discover_codex.py --workspace DIRECTORY` for native read-only enumeration.
   Git roots are necessary for the Codex ancestor project-skill discovery recipe.
4. Start `server.py --out OWNED_SERVER_DIRECTORY` for the loopback browser fixture.
   Operate it through the user's approved browser route. Activation/expiration of
   the synthetic session is allowed; purchase, delete and outside-origin actions
   are forbidden. Session cookies stay in the browser and server memory. Retain
   only minimized observations and effect counters.
5. Stop owned listeners, close only owned tabs, terminate only the fixture server
   process, and remove only owned staged skill copies. Retain the exact candidate
   bytes privately when required for identity checks. Verify disappearance through
   native enumeration. Never clear a user's cookies, storage, or profile.

`build_browser_report.mjs` normalizes the specific actual pilot captures; it does
not drive a browser or create observations. Use a fresh output directory, or
explicit `--overwrite` for owned prior outputs. `summarize.py` assembles this pilot's
recorded attempts and corrections, including setup/auth failures. It expects that
retained workspace layout and is not a generic benchmark command. Raw host events
can include private host metadata and remain outside Git. Public records omit
credentials, cookie/header values, and the synthetic sensitive value.

Pilot-executed harness hashes are retained in native-panel.json. Afterwards,
machine-specific executable/template paths were made configurable for contributors;
these wrapper changes did not rerun or relabel the recorded native subject trials.

`validate_records.mjs LOCAL_SCHEMA_DIRECTORY` optionally validates the original
skill-builder version-2 record schemas with existing AJV helpers. It neither
downloads nor modifies schemas. Canonical website outputs are independently
validated by the skill's ordinary `validate --input DIRECTORY` command.
