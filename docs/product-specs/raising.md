# Surface Spec: raising

- Status: active target
- Canonical route entry: `/camp`
- Surface ID: `raising`

## Purpose

`raising` is the camp and companion-management surface family.

It must let the player:

- feed and rest the Cogochi
- review vitals and unlocked skills
- change archetype or loadout
- inspect companion history and growth

If `raising` feels like a spreadsheet editor or detached lab console, this surface has failed.

## One-Line Definition

Cogochi `raising` is the camp-side care and growth layer where the player prepares a companion for the next chart-world run.

## Key Routes

- `/camp`
  - care, feed, rest, setup, save
- `/cogochi/[id]`
  - profile, skill tree, history, and archetype

## Must Have

- hunger, energy, mood, and HP read
- one-click care actions
- clear archetype or loadout management
- visible level and unlock state
- direct exit back to the world map or current zone

## Context Contracts

### Routes

- `/camp`
- `/cogochi/[id]`

### Stores

- `cogochiStore`
- `playerStore`

## Deep Links

- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`
