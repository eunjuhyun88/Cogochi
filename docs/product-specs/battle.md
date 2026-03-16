# Surface Spec: battle

- Status: active target
- Canonical route entry: `/boss/[bossId]`
- Surface ID: `battle`

## Purpose

`battle` is the special boss-encounter surface.

Regular candle encounters live inside `/zone/[zoneId]`.
This route exists for major historical events that deserve a staged JRPG cut-in.

It must let the player:

- understand which historical boss they are facing
- read the boss phase and pressure pattern
- keep using the same four core commands
- win or fail a high-stakes encounter cleanly

If `battle` feels like a separate tactics dashboard, it has failed.

## One-Line Definition

Cogochi `battle` is the cut-in boss scene where a major BTC event becomes a direct JRPG-style encounter.

## Must Have

- clear boss identity
- chart background tied to the real event
- hero versus boss framing
- `LONG`, `SHORT`, `HOLD`, `RUN` kept intact
- clear win, fail, and unlock outcomes

## Context Contracts

### Routes

- `/boss/[bossId]`

### Stores

- `bossStore`
- `battleStore`
- `cogochiStore`

## Deep Links

- `docs/MASTER_GAME_SPEC.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
