# Cogochi Agent Map

This file is a map, not a manual.

Use it to find the right source of truth quickly, then read the narrower document you actually need.

## Start Here

1. [docs/INDEX.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/INDEX.md)
2. [docs/PROJECT_CONTEXT.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PROJECT_CONTEXT.md)
3. [docs/PRODUCT_BLUEPRINT.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PRODUCT_BLUEPRINT.md)
4. [docs/AGENT_SYSTEM_DESIGN.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AGENT_SYSTEM_DESIGN.md)

For AI runtime details:

- [docs/AI_RUNTIME_TRAINING_SPEC.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AI_RUNTIME_TRAINING_SPEC.md)
- [docs/AI_IMPLEMENTATION_CONTRACTS.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AI_IMPLEMENTATION_CONTRACTS.md)

For repo context engineering and eval reliability:

- [docs/CONTEXT_ENGINEERING.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/CONTEXT_ENGINEERING.md)
- [docs/RELIABILITY.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/RELIABILITY.md)
- [docs/QUALITY_SCORE.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/QUALITY_SCORE.md)
- [docs/PLANS.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PLANS.md)

## Product Truth

Cogochi is an AI agent raising and evaluation simulator.

The player does not primarily collect species. The player owns persistent agent instances built on top of a base model, configures prompts, data bindings, tools, and RAG memory, then validates those choices through evaluation battles.

Core loop:

`base model -> owned agent -> data and memory setup -> prompt and retraining -> squad -> eval match -> reflection -> progression`

## Repo Truth

- `docs/` is the system of record.
- This `AGENTS.md` must stay short and point outward.
- Complex work must leave behind plan artifacts under `docs/exec-plans/`.
- Quality and reliability rules must be documented in-repo, not in chat history.

## Key Paths

- UI routes: `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/routes`
- AI domain: `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/lib/aimon`
- components: `/Users/ej/Downloads/maxidoge-clones/Cogochi/src/components/aimon`
- docs index: `/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/INDEX.md`
- active plans: `/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/exec-plans/active`
- completed plans: `/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/exec-plans/completed`

## Current Screens

- `/` -> Agent Ops Hub
- `/roster` -> Owned Agent roster
- `/agent/[id]` -> Agent console
- `/team` -> Squad builder
- `/battle` -> Eval battle
- `/lab` -> Training and memory ops

## Working Rules

- Keep product truth inside repo documents.
- Prefer progressive disclosure over giant instruction blobs.
- Encode stable rules in docs or scripts, not in one-off chat guidance.
- Treat eval reliability as a first-class engineering concern.
- Preserve immutable snapshots for any future async PvP or benchmark replay.

## Validation

Run these before pushing:

```bash
npm run check
npm run build
```

`npm run check` also validates the context-doc structure.

## Git

- Repo root: `/Users/ej/Downloads/maxidoge-clones/Cogochi`
- Remote: `origin git@github.com:eunjuhyun88/Cogochi.git`
- Log meaningful work in [docs/AGENT_WATCH_LOG.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AGENT_WATCH_LOG.md)
