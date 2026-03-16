# Cogochi Agent System Design

Last updated: 2026-03-16

## 1. Purpose

This document defines how the AI companion, growth, memory, and deterministic combat systems fit inside the chart-world JRPG version of Cogochi.

It exists to answer:

- what the AI layer does in moment-to-moment play
- what the player still decides directly
- which stores and engines own which parts of the new loop
- how historical BTC data becomes traversable game data

If another implementation doc conflicts with this one, this document wins for system role and ownership.

## 2. Product Thesis

Cogochi is no longer primarily an agent-training simulator with a battle wrapper.

Cogochi is a chart-world game where:

- the player explores real BTC history as regions
- a Cogochi companion reads the market and comments on it
- the player chooses `LONG`, `SHORT`, `HOLD`, or `RUN`
- deterministic engines resolve outcome
- camp, growth, and archetypes deepen the companion over time

The AI layer supports the judgment fantasy.
It does not replace it.

## 3. Core Loop

The correct system loop is:

`load world region` -> `walk zone` -> `read current candle context` -> `Cogochi advisory line` -> `player command` -> `deterministic resolution` -> `camp return` -> `growth and unlocks`

Short version:

`travel -> read -> command -> resolve -> recover -> grow`

## 4. Non-Goals

The MVP does not attempt to do the following:

- real-money trading
- brokerage execution
- live market PvP
- hidden autoplay
- giant external training infrastructure
- a standalone proof workstation as the main player loop

## 5. Player Authority vs AI Authority

### 5.1 Player authority

The player always owns:

- region selection
- movement
- `LONG`, `SHORT`, `HOLD`, `RUN`
- risk acceptance
- camp decisions
- archetype commitment

### 5.2 AI companion authority

The Cogochi may provide:

- commentary
- pattern reads
- warning barks
- archetype-triggered skill effects
- memory callbacks to past events

The Cogochi must not:

- silently override the command
- take hidden positions
- own the final outcome logic

## 6. Domain Model

### 6.1 Core gameplay objects

#### `Cogochi`

The player-owned companion.

Fields should include:

- id
- name
- level
- xp
- hp
- gold
- hunger
- energy
- mood
- archetype
- unlocked skills
- equipped loadout
- historical memory cards

#### `Zone`

One region or sub-region of BTC history.

Fields should include:

- id
- label
- start time
- end time
- difficulty
- zoom defaults
- landmarks
- boss id if present

#### `CandleSlice`

The currently loaded micro encounter window.

Fields should include:

- interval
- visible candles
- hidden next candles
- support and resistance marks
- volume flags
- hazard markers

#### `PositionState`

The current combat stance.

Fields should include:

- side: `LONG` | `SHORT` | `FLAT`
- entry price
- size or leverage tier
- realized PnL
- unrealized PnL
- liquidation threshold if relevant

#### `BossEncounter`

A special scripted historical event fight.

Fields should include:

- boss id
- boss hp
- phase
- scripted attack rules
- clear condition

## 7. Store Responsibilities

### `playerStore`

- trainer profile
- unlocked regions
- current progression
- first-run onboarding state

### `cogochiStore`

- owned companions
- vitals
- level and skill unlocks
- archetype state
- camp-facing care actions

### `worldStore`

- current region
- current zoom layer
- current scroll position
- current zone progress
- landmark selection

### `battleStore`

- current stance
- current encounter slice
- recent command history
- deterministic trade outcome payloads

### `bossStore`

- boss phase
- boss hp
- special event state
- boss reward resolution

### `passportStore`

- public run history
- boss clears
- major region records

## 8. Engine Responsibilities

### `worldEngine`

- zoom transitions
- region entry and exit
- candle-space navigation
- landmark activation

### `tradeEngine`

- deterministic `LONG`, `SHORT`, `HOLD`, `RUN` resolution
- HP change calculation
- XP and gold consequences
- liquidation and squeeze handling

### `bossEngine`

- scripted boss attacks
- multi-turn encounter sequencing
- boss clear and fail states

### `growthEngine`

- level thresholds
- skill unlock evaluation
- archetype progression
- vitals and camp-effect application

### `passportEngine`

- convert clears, losses, boss outcomes, and milestones into public history records

## 9. Service Responsibilities

### `marketHistoryService`

- load static macro BTC history
- load per-zone micro candle payloads
- provide deterministic historical slices

### `memoryService`

- store durable historical lessons
- surface memory cards to camp and passport
- provide memory callbacks for Cogochi speech

### `advisoryService`

- build Cogochi bark lines
- expose archetype-based hints
- never own the final trade verdict

### `saveService`

- persist trainer, region, and companion progression

## 10. Route Responsibilities

- `src/routes/+page.svelte`
  - macro world map and first-visit nursery
- `src/routes/zone/[zoneId]/+page.svelte`
  - meso and micro region traversal plus command play
- `src/routes/boss/[bossId]/+page.svelte`
  - special boss encounter
- `src/routes/camp/+page.svelte`
  - care, setup, and save
- `src/routes/cogochi/[id]/+page.svelte`
  - profile, growth, archetype, and history
- `src/routes/passport/[id]/+page.svelte`
  - public history

Routes assemble views only.
No route should contain deterministic outcome logic.

## 11. Data Model Rules

### 11.1 Historical truth is fixed

BTC candles are historical input, not mutable gameplay state.

### 11.2 Current live market data is optional future flavor

If future live features exist, they must not contaminate fixed historical zone truth.

### 11.3 Determinism is mandatory

The same candle sequence and command sequence must resolve the same way.

## 12. AI and Memory Rules

### 12.1 What memory may contain

- prior boss clears
- failure lessons
- player-authored notes
- historical event cards
- archetype-specific pattern memories

### 12.2 What memory may not do

- rewrite historical candles
- fabricate hidden market truth
- override the player's command

### 12.3 Output style

Cogochi lines should be short, useful, and legible:

- warning
- confidence cue
- pattern callout
- historical callback

## 13. Implementation Order

1. historical data and zone definitions
2. world navigation
3. trade resolution
4. camp loop
5. boss loop
6. progression and public history

## 14. Acceptance Criteria

This system design is correct only if:

- the player remains the final decision-maker
- the AI companion adds personality and signal without becoming autoplay
- stores own UI and session state only
- deterministic engines own all outcome rules
- fixed BTC history remains the authoritative world substrate
