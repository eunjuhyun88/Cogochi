# Cogochi Product Blueprint

Last updated: 2026-03-06

## One-Line Definition

Cogochi is an AI agent raising and evaluation game where the player owns agent instances, tunes their prompts, data sources, and memory, builds a squad, and wins through better preparation.

## Player Fantasy

The player should feel:

- `this is my agent`
- `I trained its memory and policy this way`
- `my squad won because of my setup`

If the game feels like selecting anonymous units from a dex, the product is off-target.

## Core Loop

`base model -> owned agent -> data and memory setup -> prompt/retraining -> squad -> eval match -> reflection -> progression`

## Product Pillars

### 1. My Agents Matter

The player remembers individuals, not just species.

Required implications:

- per-agent identity
- per-agent growth
- per-agent training setup
- per-agent memory history

### 2. Setup Creates Outcome

Battles should reflect the player's preparation.

Required implications:

- data source choices matter
- retrieval policy matters
- prompt and policy changes matter
- squad composition matters

### 3. Battles Prove, They Do Not Define

Battle is the proof screen, not the entire product.

Required implications:

- roster and detail screens are first-class
- growth must be visible outside battle
- the game still makes sense when not inside the arena

### 4. Memory Is A System, Not Flavor

The product should feel like the agents remember and improve.

Required implications:

- past lessons are stored
- retrieved memory is visible at decision time
- match results write back into future behavior

## Current Information Architecture

- `/` -> Agent Ops Hub
- `/roster` -> Owned Agents
- `/battle` -> Eval Battle
- `/team` -> Squad Builder
- `/lab` -> Agent Lab

## Domain Model Target

### BaseModelDefinition

The inference model each owned agent is built on top of.

### OwnedAgent

The actual unit the player owns.

### TrainingLoadout

The prompt stack, data bindings, retrieval policy, risk profile, and tool setup attached to one agent.

### MemoryBank

The searchable long-term memory attached to one agent.

### TrainingRun

The recorded improvement job attached to one agent.

### Squad

The active 4-agent team.

### OpponentSnapshot

The opponent squad representation used for PvE, ghost battles, or async PvP.

### EvalMatchResult

The result package that feeds reflection and progression back into the roster.

## Current Technical Reality

- UI has already moved toward hub/roster-first
- state is still prototype-level and dex-driven
- `playerStore.ts` is still carrying too much
- internal `aimon` namespace is a technical leftover, not a product naming decision

## Next Build Priorities

1. Introduce true `OwnedAgent`, `MemoryBank`, and `TrainingRun` data
2. Split `playerStore` into player/roster/squad/lab/match stores
3. Turn battle into a readable evaluation console
4. Add agent detail route and training controls
5. Connect reflection and memory writeback to per-agent progression
