# Cogochi Project Context

Last updated: 2026-03-06

## Product Definition

Cogochi is not a trading interface reskin and not a documentation alias for AIMON.

It is its own product repo for an AI agent raising and evaluation simulator built around:

`base model -> owned agent -> data and memory setup -> prompt/retraining -> squad -> eval match -> reflection -> progression`

The player fantasy is:

- own individual AI agents
- choose what data they see and how they retrieve memory
- tune prompts and policy
- send them into evaluation matches against another squad
- inspect why they won or lost
- improve the team over time

## Source Of Truth

This repo should be understandable without opening root-level project notes.

Read in this order:

1. `CLAUDE.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/PRODUCT_BLUEPRINT.md`
4. `docs/AGENT_SYSTEM_DESIGN.md`
5. `docs/GAME_DESIGN.md`
6. `docs/TECH_ARCHITECTURE.md`
7. `docs/UIUX_SYSTEM.md`
8. `docs/PROGRESSION_MODEL.md`

## Current State

Implemented:

- standalone SvelteKit app under `Cogochi/`
- Trainer Hub at `/`
- Roster screen at `/roster`
- Battle screen moved to `/battle`
- Team Builder at `/team`
- Lab screen at `/lab`
- separate git repository initialized for this app

Current limitation:

- UI is roster-first, but data model is still prototype-level
- `playerStore` still uses `unlockedDexIds`, `teamDexIds`, and global XP
- real `BaseModel`, `OwnedAgent`, `MemoryBank`, `TrainingRun`, `rosterStore`, `squadStore`, `labStore`, and per-agent progression are not implemented yet
- code still uses internal `aimon` namespaces as prototype leftovers

## Important Files

- `docs/AGENT_SYSTEM_DESIGN.md`
- `src/routes/+page.svelte`
- `src/routes/roster/+page.svelte`
- `src/routes/battle/+page.svelte`
- `src/components/aimon/RosterGrid.svelte`
- `src/components/aimon/AgentDetailPanel.svelte`
- `src/lib/aimon/stores/playerStore.ts`
- `src/lib/aimon/data/trainingProfiles.ts`

## Design Priorities

1. make the game feel like training `my agents`, not selecting dex entries
2. make prompt, retrieval, and memory choices affect battle outcomes
3. keep arena readability while turning battle into an evaluation console
4. move toward async PvP or opponent snapshots after the agent roster model is real

## Documentation Rules

When the product direction or implementation boundary changes, update:

- `CLAUDE.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PRODUCT_BLUEPRINT.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/GAME_DESIGN.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/UIUX_SYSTEM.md`
- `docs/PROGRESSION_MODEL.md`
- `docs/AGENT_WATCH_LOG.md`

## Next Engineering Steps

1. Add domain types for:
   - `BaseModelDefinition`
   - `OwnedAgent`
   - `TrainingLoadout`
   - `MemoryBank`
   - `TrainingRun`
   - `Squad`
   - `OpponentSnapshot`
   - `EvalMatchResult`
2. Split stores:
   - `playerStore`
   - `rosterStore`
   - `squadStore`
   - `labStore`
   - `matchStore`
3. Replace global XP rewards with per-agent progression and memory writeback
4. Connect battle results to reflection, retrieval, and retraining progress
5. Add agent detail route like `/agent/[id]`

## Validation

Expected to pass after changes:

- `npm run check`
- `npm run build`
