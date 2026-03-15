# Cogochi Autoresearch Org Plan

Last updated: 2026-03-12

## Objective

Adapt the `karpathy/autoresearch` idea into a Cogochi-specific operating loop that helps the founder finish the product end-to-end.

The target is not "do more research."

The target is:

- ship the right vertical slice faster
- turn that vertical slice into a real playable web game instead of a menu-only prototype
- improve battle AI against fixed evaluation scenarios
- improve raising UX, ownership, and visible transformation without breaking product invariants
- replace placeholder assets with a coherent itch.io-sourced pixel family
- keep work aligned to the founder's actual goal rather than local code convenience

## Why Vanilla Autoresearch Is Not Enough

The upstream model is optimized for a narrow loop:

- a human writes the organization program
- agents run many experiments
- a fixed evaluator produces a score
- good changes are kept, bad changes are discarded

That is useful, but Cogochi is not a single-file benchmark project.

Cogochi has six coupled targets:

1. founder outcome
2. field-loop completeness
3. training-to-battle proof
4. player-facing ownership and transformation
5. memory and care loop quality
6. shipping quality gates

If the loop optimizes only "research quality" or only "battle win rate," it will drift away from the actual product.

## Non-Negotiable Constraints

The adapted system must preserve repo and product truth:

- Cogochi remains a judgment RPG, not a generic research lab
- training, memory, and experiment remain more important than spectacle
- battle evaluation stays deterministic and explainable
- price input is immutable
- repo-local docs and manifests remain the source of truth

References:

- upstream concept: <https://github.com/karpathy/autoresearch>
- upstream control file model: <https://github.com/karpathy/autoresearch/blob/main/program.md>
- product compass: `CLAUDE.md`
- product thesis: `docs/SYSTEM_INTENT.md`
- agent runtime truth: `docs/AGENT_SYSTEM_DESIGN.md`

## Core Design

### L0. Founder Goal Contract

Use two top-level control files together:

- `program.md`
- `docs/exec-plans/active/COGOCHI_founder_goal_20260312.md`

This file should define:

- the current outcome to achieve
- what "done" means for the current phase
- hard constraints
- what should not be optimized
- tie-break rules when metrics conflict

Example current founder goal:

`Ship a playable judgment-tamagotchi vertical slice where a player can train one personal agent, see it visibly change, rerun the same chart battle, and understand the delta.`

This is the top objective. Every lower loop must serve it.

### L1. Autoresearch Director

Create one director agent that behaves like the upstream "organization programmer," but for product delivery.

Proposed manifest:

- `agents/autoresearch-director.json`

Responsibilities:

- read the founder goal contract
- inspect scorecards across surfaces
- choose the current bottleneck
- dispatch one narrow task at a time
- accept or reject changes based on evaluation output

The director does not implement features directly. It chooses where the next iteration should happen.

### L2. Surface Workers

Instead of one broad worker, use bounded workers that map to Cogochi surfaces.

Proposed agents:

- `asset-curator`
  - audits itch.io packs, records licenses, and prepares one coherent import plan
- `field-loop-builder`
  - builds `/field`, movement, follow behavior, interact nodes, and gate transitions
- `battle-researcher`
  - optimizes battle decision quality, reasoning trace quality, and scenario performance
- `raising-ux-shipper`
  - improves roster, agent detail, training, and reflection surfaces
- `memory-tuner`
  - improves retrieval, reflection, memory writeback, and doctrine quality
- `pixel-polisher`
  - improves sprite clarity, role readability, and animation utility
- `ship-reviewer`
  - runs regression, docs, and acceptance gates

These agents should stay within explicit read/write scopes via repo-local manifests.

### L3. Evaluators

Upstream autoresearch depends on a fixed evaluator. Cogochi needs several fixed evaluators.

#### 1. Founder Outcome Evaluator

Measures whether the current branch is closer to the founder goal.

Questions:

- can the intended loop be completed end-to-end?
- is the intended surface actually present?
- did the branch improve the right bottleneck?
- did it avoid forbidden drift?

#### 2. Battle AI Evaluator

Runs the same historical scenarios repeatedly and scores:

- deterministic result stability
- judgment quality
- explanation readability
- memory retrieval usefulness
- regression against prior benchmark

#### 3. Raising UX Evaluator

Scores:

- time to first meaningful training action
- clarity of agent state
- visibility of cause-and-effect from training to battle
- visible transformation or keepsake readiness
- strength of the next care action
- readability on desktop and mobile

#### 3.5 Field Loop Evaluator

Scores:

- whether `/field` exists
- whether the squad is visible as a travel party
- whether battle entry happens through a readable gate
- whether the loop returns to care, reflection, or camp
- whether chart legibility survives world rendering

#### 4. Ship Gate Evaluator

Hard gates, not soft taste:

- `npm run docs:check`
- `npm run ctx:check -- --strict`
- project build/test gates
- preview/screenshot acceptance where relevant

No change is "good" if it breaks the hard gates.

## Score Model

Vanilla autoresearch wants one score. Cogochi should use hard gates plus a weighted scorecard.

### Hard Gates

All must pass:

- product invariants preserved
- deterministic evaluation preserved
- docs and context gates pass
- no boundary violation across route/store/engine responsibilities

### Weighted Scorecard

After hard gates pass, rank candidates by:

- founder outcome progress: 25
- field-loop completeness: 20
- training-to-battle proof: 15
- ownership and visible transformation: 15
- memory and care loop quality: 10
- game feel and implementation quality: 15

The exact weights can change by phase, but the founder goal stays first.

## Operating Loop

Each cycle should look like this:

1. read `program.md`
2. read `COGOCHI_founder_goal_20260312.md`
3. read current scorecards
4. identify the lowest-scoring bottleneck that blocks the founder goal
5. choose one bounded worker
6. propose one narrow change
7. implement in owned paths only
8. run relevant evaluator set
9. compare score against previous accepted baseline
10. keep or discard
11. write a short checkpoint and next action

This preserves the upstream keep/discard spirit, but makes it product-directed instead of benchmark-directed.

## What The System Should Optimize Right Now

For the current branch, the recommended order is:

1. field-loop completeness
2. asset coherence and placeholder removal
3. visible ownership and transformation
4. training-to-battle proof
5. memory and care loop readiness
6. battle explainability
7. polish

This follows the existing product ratio:

- training/memory/experiment first
- battle expression second
- polish last

## Proposed Repo Additions

### Docs

- `program.md`
- `docs/exec-plans/active/COGOCHI_founder_goal_20260312.md`
- `docs/exec-plans/active/COGOCHI_autoresearch_scorecard_20260312.md`
- `docs/exec-plans/active/COGOCHI_autoresearch_bottlenecks_20260312.md`

### Agents

- `agents/autoresearch-director.json`
- `agents/battle-researcher.json`
- `agents/raising-ux-shipper.json`
- `agents/memory-tuner.json`
- `agents/ship-reviewer.json`

### Tools

- `tools/battle-benchmark.json`
- `tools/raising-ux-eval.json`
- `tools/openclaw-health.json`
- `tools/scorecard-report.json`
- `tools/change-acceptance.json`

### Scripts

- `scripts/autoresearch/run-openclaw-health.mjs`
- `scripts/autoresearch/run-battle-benchmark.mjs`
- `scripts/autoresearch/run-raising-eval.mjs`
- `scripts/autoresearch/score-branch.mjs`
- `scripts/autoresearch/accept-change.mjs`

## Rollout Plan

### Phase 0

Do not automate implementation yet.

Create:

- founder goal contract
- scorecard format
- battle benchmark script
- raising UX evaluator checklist

### Phase 1

Automate evaluation only.

The human or Codex still implements changes, but acceptance is decided against the new fixed evaluators.

### Phase 2

Add the director plus two workers first:

- `battle-researcher`
- `raising-ux-shipper`

Do not add more workers until the scorecards prove they help.

### Phase 3

Add memory tuning and pixel polish as secondary loops.

## Exit Criteria

The adapted autoresearch system is working when:

- the founder can express a product goal in one contract file
- the system can tell which bottleneck matters most next
- battle AI improvements can be benchmarked repeatedly
- UX improvements can be accepted or rejected with a stable rubric
- accepted changes move the vertical slice closer to playable completion
- the system reduces drift toward irrelevant optimization

## Recommendation

Do not apply `karpathy/autoresearch` literally.

Apply its core idea literally:

- humans program the organization
- agents run bounded experiments
- fixed evaluators decide what survives

But translate that idea into a Cogochi-specific org where the top metric is founder outcome, not raw research output.
