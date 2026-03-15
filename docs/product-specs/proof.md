# Surface Spec: proof

- Status: active
- Canonical route entry: `/proof`
- Surface ID: `proof`

## Purpose

`proof` is the player-facing historical validation surface.

It is Cogochi's game-native version of a backtest:

- fixed historical frame packs
- one mutation candidate
- deterministic scoring
- one verdict recommendation

The player should feel:

- "I am proving this creature"

Not:

- "I am staring at a quant report"

## One-Line Definition

`proof` is the bridge between raising and battle where one candidate build is bound to a fixed historical pack before the player enters a live chart clash.

## Core Outcome

After one short proof session, the player should be able to say:

- which pack was used
- what that pack was trying to validate
- whether the mutation deserves keep, quarantine, or revert
- why the next clash matters

## Battle Versus Proof

### `battle`

- one readable clash
- one frame at a time
- moment-to-moment command play

### `proof`

- one validation bundle
- several fixed historical frames
- deterministic score priorities
- decision preparation before and after battle

Player-facing rule:

`battle is the fight`

`proof is the validation contract around the fight`

## Must Have

- visible proof pack selection
- named historical frames
- clear mode distinction:
  - `SPAR`
  - `PROOF`
  - `GAUNTLET`
- current mutation candidate surfaced
- current weak link surfaced
- proof metric weights surfaced
- direct launch into the first clash
- clear statement that live market state does not affect proof truth

## Proof Modes

### `SPAR`

- 1 to 2 cases
- low pressure rehearsal
- used to stabilize a draft before committing to harder proof

### `PROOF`

- 3 to 5 cases
- standard mutation validation
- authoritative enough for keep / quarantine / revert

### `GAUNTLET`

- 5 or more cases
- broader historical validation
- prepares a creature for public credibility or future market-facing surfaces

## Primary Metrics

Proof should score judgment quality first:

- `READ_ACCURACY`
- `RISK_DISCIPLINE`
- `TRAP_AVOIDANCE`
- `RETRIEVAL_QUALITY`
- `EXPLANATION_CONSISTENCY`
- `SQUAD_COORDINATION`

Optional secondary metric:

- `SHADOW_RETURN`

`SHADOW_RETURN` is supporting evidence only.
It must never become the sole authority over mutation truth.

## User Flow

1. The player enters `/proof` from `/lab`, `/field`, or `/agent/[id]`.
2. If `/lab` handed off a doctrine session, the page keeps that `agent + session + pack` context intact.
3. The page shows the active agent, current weak link, active draft, and handed-off doctrine candidate.
4. The player chooses one proof pack.
5. The page explains what that pack is validating.
6. The player launches into the first clash.
7. The battle result returns into verdict and journal flow.
8. The pack remains the stable reference for the mutation story.

## Frontend Responsibilities

Frontend owns:

- pack browsing
- candidate readability
- doctrine-session readability
- metric readability
- route handoff into battle
- proof narrative

Frontend must not own:

- signal generation
- metric calculation
- pack scoring rules
- writeback policy

## Shared Deterministic Domain

Shared domain owns:

- proof pack definitions
- frame-to-scenario mapping
- metric weights
- mutation verdict inputs
- compare contracts

## Backend Responsibilities

Backend owns:

- runtime artifacts
- future SignalSnapshot generation
- retrieval freeze for historical frames
- proof artifact packaging
- future public passport export

## Context Contracts

## Routes

- `/proof`
- `/battle`
- `/journal`

## Stores

- `rosterStore`
- `labStore`
- `battleStore`
- `proofStore`

## Deep Links

- `docs/product-specs/battle.md`
- `docs/product-specs/evolution.md`
- `docs/design-docs/COGOCHI_hybrid_game_market_20260315.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
