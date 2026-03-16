# Surface Spec: field

- Status: active target
- Canonical route entry: `/zone/[zoneId]`
- Surface ID: `field`

## Purpose

`field` is the primary play surface where zone traversal and normal candle encounters happen.

It must let the player:

- move through meso and micro chart terrain
- approach landmarks
- read the current market structure
- choose `LONG`, `SHORT`, `HOLD`, or `RUN`
- survive and progress through the zone

If `field` feels like a wrapper around other menus, this surface has failed.

## One-Line Definition

Cogochi `field` is the playable BTC-history zone where the player walks the chart itself and fights normal encounters.

## Happy Path

1. The player enters `/zone/[zoneId]`.
2. The map shows the current path, terrain, and landmarks.
3. The player reaches a micro encounter slice.
4. The Cogochi gives a short read.
5. The player chooses `LONG`, `SHORT`, `HOLD`, or `RUN`.
6. The next candle resolves and applies consequences.

## Must Have

- meso and micro zoom continuity
- visible candle terrain
- command dock with four core commands
- support, resistance, and danger readability
- landmark interactions
- route back to camp or forward to boss

## Context Contracts

### Routes

- `/zone/[zoneId]`
- leads to:
  - `/camp`
  - `/boss/[bossId]`

### Stores

- `worldStore`
- `battleStore`
- `cogochiStore`

## Deep Links

- `docs/MASTER_GAME_SPEC.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`
