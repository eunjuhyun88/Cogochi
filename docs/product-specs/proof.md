# Surface Spec: proof

- Status: deprecated target
- Canonical route entry: absorbed into `/zone/[zoneId]`, `/boss/[bossId]`, and `/passport/[id]`
- Surface ID: `proof`

## Purpose

In the chart-world reset, `proof` is no longer a standalone player-facing route.

The proof concept is absorbed into:

- zone clears
- boss clears
- milestone history
- passport records

If a future internal proof tool exists, it is a developer or balancing aid, not a primary player surface.

## One-Line Definition

`proof` is now a behind-the-scenes validation concept rather than a front-door route.

## Must Have

- boss and zone outcomes produce durable records
- passport can surface those records later
- no detached proof workstation should interrupt the core world-play loop

## Context Contracts

### Routes

- no primary player route in the target IA

### Stores

- `passportStore`
- `battleStore`
- `bossStore`

## Deep Links

- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`
