# Surface Spec: core

- Status: active
- Canonical route entry: `/`
- Surface ID: `core`

## Purpose
`core` is the player-facing surface that makes Cogochi legible as a judgment RPG.

It must let the player understand, in one continuous loop:

- who their agents are
- how those agents are being trained
- what squad is entering the next scenario
- where the next chart battle matters
- what was learned from the last result

If `core` feels like a dashboard, a pet widget, or a broker terminal, this surface has failed.

## Problem

People who spend time on crypto charts usually get one of two bad experiences:

- sterile chart tools with no attachment, memory, or sense of squad growth
- game-like wrappers that lose the chart and become generic battle systems

Cogochi must solve that gap.

The player needs a surface that turns repeated chart exposure into:

- named agent ownership
- visible training and squad preparation
- readable battle commitment and result
- clear reflection on what to improve next

## Primary Persona

- Role: crypto-native player who already reads charts and wants a gameful training loop
- JTBD: "When I am reviewing or replaying a chart setup, I want to train and deploy my agents on top of that structure, so that my judgment improves and my squad feels meaningfully mine."
- Current alternatives:
  - passive chart review
  - paper-trading style tools
  - generic monster raising or autobattler games
- Why those fail:
  - chart tools have no attachment loop
  - generic games do not preserve chart meaning
  - autobattlers hide why the outcome happened

## One-Line Definition

Cogochi `core` is the trainer surface where the player prepares agents, enters chart-native scenarios, sees battle consequences, and chooses the next improvement.

## Happy Path

1. The player lands on `/` and immediately sees their trainer state, active squad, and the next meaningful action.
2. The player inspects one or more agents and understands each unit's role, growth state, and recent lesson.
3. The player confirms or edits the squad for the next chart scenario.
4. The player enters a battle or review state where a long, short, or hold thesis becomes visible action on the chart.
5. The result resolves in a readable way that attributes success or failure to preparation and judgment.
6. The surface writes back lessons, progression, and the next recommended improvement.
7. The player leaves the session knowing what changed and what to do next.

## `/` Trainer Hub Layout

`/` should behave like a trainer room anchored around one featured companion, not a summary dashboard.

The home composition is:

- left rail = state and recent history
- center stage = featured owned agent and active squad
- right rail = customization, care, and growth actions
- bottom dock = quick verbs and deploy

The center stage must dominate the page.
The player should first notice:

- which agent is featured
- how that agent is doing
- what the next recommended action is

If the page reads as equal dashboard cards with a mascot placed on top, it is off target.

### `/` Must Communicate

- featured agent identity
- active squad presence
- readable growth state
- recommended next battle or proof
- recent lesson or care pressure
- one clear path to customization or training

### `/` Core Actions

- gift or care
- outfit or visible kit change
- quick growth or memory action
- squad or deploy preparation
- battle or proof entry

## Must Have

- Trainer identity and progression must be visible.
- One featured owned agent must be visually centered on `/`.
- The roster must show named agents with distinct roles and growth state.
- The active squad must be readable and editable.
- `/` must expose state on one side and change actions on the other without hiding the companion body.
- The next scenario or battle entry must be obvious.
- Battle outcome must be shown as chart-native judgment expression, not abstract numbers alone.
- Reflection output must connect the result to a future action.
- The player must always know whether they are training, preparing, battling, or reflecting.

## Should Have

- Quick resume into the last active squad or scenario.
- Lightweight recent-memory or lesson summary for each agent.
- Clear visual distinction between roster management, lab work, and battle entry.
- A visible "next best improvement" cue after each resolved run.

## Won't Have In v1

- real-money execution
- order entry UX
- hidden auto-battle resolution
- pure idle pet-care loops
- deep social systems
- generic overworld exploration detached from chart logic

## Non-Goals

- maximizing fake PnL
- replacing a real charting product
- reducing the player to watching AI agents act without explanation
- treating the agents as collectible cosmetics rather than trainable units

## Done Means

- A new player can explain Cogochi as "train agents, send them into chart battles, learn, improve" after one short session.
- The player can identify the current squad, the next battle context, and the last lesson without opening secondary docs.
- The player can tell where a long or short commitment happened and why it succeeded or failed.
- The player leaves each run with at least one concrete improvement hook: doctrine, memory, squad, or training.
- The surface never implies real trade execution or broker-style actions.

## Context Contracts

### Routes

- `/`
  - canonical entry for trainer state, roster snapshot, active squad, next scenario, and recent lesson
- target expansion routes owned by the same surface family:
  - `/roster`
  - `/agent/[id]`
  - `/team`
  - `/battle`
  - `/lab`

### Stores

- `playerStore`
  - trainer profile, progression currency, unlock state
- `rosterStore`
  - owned agent instances, selection, progression writeback
- `squadStore`
  - active squad composition and role assignment
- `matchStore`
  - current scenario, battle phase, result summary
- `labStore`
  - training runs, prompt variants, memory maintenance actions

### APIs

- none required for MVP local-first operation
- optional provider boundaries may later back:
  - model inference
  - embeddings
  - reflection generation
  - memory retrieval

## Deep Links

- `CLAUDE.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/PRODUCT_SENSE.md`
- `docs/design-docs/COGOCHI_trainer_hub_character_layout_20260315.md`
