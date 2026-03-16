# COGOCHI Chart World Reset Execution

Status: active  
Owner: codex  
Date: 2026-03-16

## Objective

Port Cogochi from the current split trainer, field, journal, and proof surfaces into a BTC chart-world JRPG where:

- `/` is a macro world map
- `/zone/[zoneId]` is the main play surface
- `/boss/[bossId]` is the special encounter surface
- `/camp` handles care and setup

## Scope

This plan covers:

- product truth reset
- route and store migration
- engine additions
- UI shell replacement
- staged implementation

It does not assume full implementation in one pass.

## Canonical Inputs

- `docs/design-docs/COGOCHI_chart_world_jrpg_reset_20260316.md`
- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`

## Phase 1: Data and Engines

Deliver:

- BTC daily history payload for macro map
- zone definitions
- boss definitions
- `world-engine.ts`
- `trade-engine.ts`
- initial route and world types

Validation:

- `npm run check`
- `npm run build`

## Phase 2: Macro World Map

Deliver:

- new world-map route entry on `/`
- macro line silhouette rendering
- region overlays and unlock state
- trainer HUD with HP, level, and gold
- visible current location marker

Validation:

- `npm run check`
- `npm run build`

## Phase 3: Zone Play

Deliver:

- `/zone/[zoneId]`
- meso and micro traversal
- command dock with `LONG`, `SHORT`, `HOLD`, `RUN`
- candle reveal and deterministic trade outcome application
- Cogochi speech and trade-result presentation

Validation:

- `npm run check`
- `npm run build`

## Phase 4: Camp and Onboarding

Deliver:

- `/camp`
- egg selection and first companion boot flow
- feed, rest, setup, and save behaviors
- easy tutorial zone for first-time onboarding

Validation:

- `npm run check`
- `npm run build`

## Phase 5: Boss Encounters

Deliver:

- `/boss/[bossId]`
- boss scene and boss engine
- multi-turn encounter rules
- region clear and unlock flow

Validation:

- `npm run check`
- `npm run build`

## Phase 6: Growth and Cleanup

Deliver:

- level bands and skill unlocks
- archetype selection
- `/cogochi/[id]`
- cleanup of replaced legacy routes and stores

Validation:

- `npm run check`
- `npm run build`

## Migration Notes

- Keep legacy routes alive only while equivalent world routes are not yet shipped.
- Do not rewrite `context-kit.json` to the new route map until code paths actually exist.
- Passport can stay, but its source of truth should move to zone clears, boss clears, and career history.
- Proof and journal concepts should be absorbed into camp, world HUD, boss clear, and passport flow.

## Highest-Risk Areas

1. Macro-to-meso-to-micro zoom continuity
2. Making `LONG` and `SHORT` feel like game verbs instead of finance UI
3. Preserving chart readability while adding traversable terrain
4. Avoiding route churn without a playable migration path
5. Keeping deterministic outcome rules understandable

## Completion Criteria

The reset is only done when a player can:

1. enter the macro world map
2. select a region
3. walk a micro candle slice
4. choose `LONG`, `SHORT`, `HOLD`, or `RUN`
5. see HP, XP, and gold change from the revealed candle result
6. return to camp and perform one care action
7. clear a boss and unlock the next region
