# Cogochi UIUX System

Last updated: 2026-03-06

## 1. Experience Goal

Cogochi should feel like:

- an agent operations console
- a training lab
- a readable evaluation arena

The center of gravity is not spectacle.

The center of gravity is ownership, tuning, and diagnosis.

## 2. UX Priorities

### 2.1 The roster matters before the match

- the player should inspect and edit agents before launching a match

### 2.2 The battle explains itself

- the player should see retrieved memory, not just animations

### 2.3 Every screen should imply the next action

- edit prompt
- compact memory
- swap squad role
- run benchmark

## 3. Information Architecture

```text
/
  Agent Ops Hub
/roster
  Owned Agent List
/agent/[id]
  Agent Detail
/team
  Squad Role Board
/battle
  Evaluation Console
/lab
  Training Lab
```

## 4. Screen Responsibilities

### `/`

Must show:

- active squad summary
- key agent cards
- recent match outcomes
- training queue
- recommended next actions

### `/roster`

Must show:

- owned agent grid or table
- filters by role, base model, status, specialization
- performance and memory health indicators

### `/agent/[id]`

This is the core screen.

It must show:

- agent identity
- base model
- prompt stack
- data bindings
- retrieval policy
- memory bank preview
- training history
- recent evaluation logs

### `/team`

Must behave as a 4-slot assignment board:

- scout
- analyst
- risk
- executor

### `/battle`

Must show:

- phase timeline
- agent decisions
- retrieved memories
- squad messages
- score breakdown

### `/lab`

Must show:

- data source setup
- prompt variants
- memory compaction controls
- training queue
- benchmark presets

## 5. Visual Direction

### Mood

- deep navy background
- cyan and green accent signals
- restrained red for failure
- amber for caution and pending training

### Typography

- display: Orbitron or equivalent
- data and metrics: JetBrains Mono
- body: current readable sans

### Panels

- hard-rounded technical panels
- visible section hierarchy
- stronger contrast between current state and historical logs

## 6. Interaction Rules

### Selection

- selected agent should remain visually pinned across routes when relevant

### Editing

- prompt and policy edits can autosave
- large training actions should create a queued run card

### Battle feedback

- retrieved memory cards should be visible per phase
- reasoning and score changes should be traceable
- the result view should link directly to the affected agents

## 7. Mobile Rules

- roster becomes a stacked list with sticky filters
- agent detail becomes tabbed
- battle collapses detail panes into drawers
- squad assignment becomes tap-first, not drag-first

## 8. UX Check Questions

1. does the first screen look like agent operations rather than a spectator dashboard
2. can the player understand an agent's setup from one detail screen
3. can the player see retrieved memory during evaluation
4. does a failed match suggest a next training action
5. does the squad builder read like role assignment rather than species selection
