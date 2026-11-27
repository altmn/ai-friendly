# Evidence contracts

Required channels must belong to the check's actual target state and context.
Other-state evidence may be retained as supporting context but cannot satisfy
those prerequisites. Evaluated checks require applicable guide rows, linked checks,
and retained owner follow-up. Unknown owner applicability under an applicable
guide obligation remains counted until resolved or explicitly assessed. A genuinely
inapplicable conditional owner item needs `conditional_exclusion` with a reason,
nonempty resolvable `evidence_ids`, and `adequacy_reviewed: true`. Lack of backend
access alone never establishes irrelevance. The owner report displays this exclusion.

Rules may declare `evidence_variants` with an ID, required capabilities, and narrow
scope. Select one with `check.evidence_variant` and an `adaptation` object containing
`scope`, nonempty `limitations`, and `adequacy_reviewed: true`. This is an explicit
manual adequacy decision, not an automatic equivalence claim. Default checks keep
the full rule procedure. Omitted semantic properties remain untested. Reports
display adaptations and their limits. No variant authorizes an action.

AFF-TOOL-003 and AFF-STATE-001 additionally require same-target `task_event`
evidence with `observed_data.execution_trace`:

```json
{
  "kind": "state_transition",
  "authorized": true,
  "action": "Toggle the synthetic checkbox",
  "before_evidence_ids": ["before-visual", "before-semantic"],
  "after_evidence_ids": ["after-visual", "after-semantic"]
}
```

All referenced observations must be linked to the check and share its context.
After evidence must include the evaluated state. Transition before/after references
must differ. A `tool_invocation` instead requires an actual structured `result`
and matching `after_evidence_ids`. Declarations alone do not satisfy invocation.
These requirements establish structural completeness; source truth still needs
review. Static-only or unperformed interactive work remains untested.

Single-file validation checks canonical data and referenced artifacts. Directory
validation also requires all derived files and detects drift. Duplicate keys and
JSON nesting over 256 levels are rejected before import normalization.
