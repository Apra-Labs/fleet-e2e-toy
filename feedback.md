APPROVED

## Re-review notes (round 2)

Re-verified `bd ready` and `bd graph --compact gh-toy-k0w`:

- `bd ready` returns 7 issues, including both `gh-toy-k0w` (the sprint
  container) and `gh-toy-k0w.1` (the sole unblocked leaf task among
  `gh-toy-k0w.1`-`.10`). `gh-toy-k0w.2`-`.10` correctly do NOT appear (they
  are blocked, transitively, on `gh-toy-k0w.1`).
- `bd graph --compact gh-toy-k0w` shows a clean 4-layer DAG (Layer 0:
  `gh-toy-k0w.1`; Layer 1: `.2`-`.9`; Layer 2: `.10`; Layer 3: the three
  source features `gh-toy-4ef`/`gh-toy-7rp`/`gh-toy-mi2`). No cycle exists.
- Confirmed via `bd show gh-toy-k0w` that the container has no description,
  no acceptance criteria, and no `model:` note — structurally unmistakable
  from every real leaf task (each of which has a `model:` note and a
  populated ACCEPTANCE CRITERIA section, e.g. `gh-toy-k0w.1`).

## Judgment on criterion 9

The round-1 suggested fix (`bd dep add gh-toy-k0w gh-toy-k0w.10`) was tried
by the orchestrator and demonstrably backfired: it made `gh-toy-k0w` blocked,
and this bd installation hides children of a blocked parent from `bd ready`
entirely, which caused ALL of `gh-toy-k0w.1`-`.10` to vanish from `bd ready`
— a strictly worse outcome than the original finding (a merely-cosmetic
container in the ready list vs. the entire sprint's work becoming
undispatchable). The orchestrator correctly reverted with
`bd dep remove gh-toy-k0w gh-toy-k0w.10`.

Given the demonstrated risk, "orchestrator discipline: never dispatch the
container ID itself" is an acceptable resolution to the round-1 finding.
`gh-toy-k0w` is `Type: task` but carries no acceptance criteria and no model
note, making it structurally distinguishable from real work items at the
exact point (`bd show <id>`) where the orchestrator would decide whether to
dispatch a doer. A DAG-based fix that is available in this bd installation
would trade a cosmetic annoyance for functional breakage of the whole
sprint's readiness pipeline, so process discipline is the correct trade-off
here rather than another dependency edge. Criterion 9 is satisfied via this
documented operational safeguard rather than a DAG change.

## Carried-over non-blocking note (round 1, criterion 7)

`gh-toy-13t` ("Add input validation for empty or blank strings") remains an
existing open backlog issue that overlaps with `gh-toy-k0w.8` and is not
wired into the `gh-toy-k0w` DAG. This is not a new duplicate introduced by
this plan and is not blocking, but should be reconciled (e.g.
`bd duplicate gh-toy-13t gh-toy-k0w.8`) once `gh-toy-k0w.8` ships, so it
doesn't linger as stale duplicate backlog.

## Task Assignments

[
  {"id":"gh-toy-k0w.1","bucket":"L","model":"standard"},
  {"id":"gh-toy-k0w.2","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.3","bucket":"M","model":"cheap"},
  {"id":"gh-toy-k0w.4","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.5","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.6","bucket":"M","model":"cheap"},
  {"id":"gh-toy-k0w.7","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.8","bucket":"M","model":"standard"},
  {"id":"gh-toy-k0w.9","bucket":"S","model":"cheap"},
  {"id":"gh-toy-k0w.10","bucket":"M","model":"standard"}
]
