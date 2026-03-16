# Surface Spec: journal

- Status: deprecated target
- Canonical route entry: absorbed into `/camp` and world HUD
- Surface ID: `journal`

## Purpose

In the chart-world reset, the old standalone `journal` route is no longer a primary surface.

Return-state communication should happen through:

- camp presentation
- world HUD
- companion profile history
- passport history when needed

If the player must leave the main world loop to read a detached report screen after every run, the new direction has failed.

## One-Line Definition

`journal` is no longer a standalone route in the target IA; its information is redistributed into camp and history surfaces.

## Must Have

- recent result can be understood from camp
- current care pressure can be understood from camp
- long-term history can still be reached through companion profile or passport

## Context Contracts

### Routes

- no primary player route in the target IA

### Stores

- `cogochiStore`
- `passportStore`

## Deep Links

- `docs/MASTER_GAME_SPEC.md`
- `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`
