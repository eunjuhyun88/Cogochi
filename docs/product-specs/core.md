# Surface Spec: core

- Status: active target
- Canonical route entry: `/`
- Surface ID: `core`

## Purpose

`core` is the macro world-map entry surface.

It must let the player:

- understand that BTC history is the game world
- see which regions are cleared, locked, or current
- choose the next region
- enter the first nursery flow on a fresh save

If `/` feels like a dashboard, a trainer room, or a summary homepage, this surface has failed.

## One-Line Definition

Cogochi `core` is the macro chart-world map where the player selects an era of BTC history and begins the next run.

## Happy Path

1. The player lands on `/` and sees the macro BTC world map.
2. The player sees the current region marker and global progression.
3. The player selects a region or resumes the current one.
4. First-time players can hatch or name their first Cogochi here.
5. The player moves into `/zone/[zoneId]`.

## Must Have

- full-history map read
- clear current region marker
- locked versus cleared regions
- clear route into the selected zone
- optional first-run nursery or egg flow

## Context Contracts

### Routes

- `/`
- leads to:
  - `/zone/[zoneId]`
  - `/camp`
  - `/cogochi/[id]`

### Stores

- `playerStore`
- `worldStore`
- `cogochiStore`

## Deep Links

- `docs/MASTER_GAME_SPEC.md`
- `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`
- `docs/VISUAL_WORLD_DESIGN.md`
