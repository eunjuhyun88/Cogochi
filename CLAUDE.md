# Cogochi Workspace Guide

## Workspace

- Path: `/Users/ej/Downloads/maxidoge-clones/Cogochi`
- Product: standalone AI agent raising and evaluation simulator
- Repo role: source of truth for product, runtime, eval, and context-engineering decisions

## Read Order

1. [AGENTS.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/AGENTS.md)
2. [docs/INDEX.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/INDEX.md)
3. [docs/PROJECT_CONTEXT.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PROJECT_CONTEXT.md)
4. The narrower doc for the current task

## Design Authority

1. [docs/PROJECT_CONTEXT.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PROJECT_CONTEXT.md)
2. [docs/PRODUCT_BLUEPRINT.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PRODUCT_BLUEPRINT.md)
3. [docs/AGENT_SYSTEM_DESIGN.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AGENT_SYSTEM_DESIGN.md)
4. [docs/AI_RUNTIME_TRAINING_SPEC.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AI_RUNTIME_TRAINING_SPEC.md)
5. [docs/AI_IMPLEMENTATION_CONTRACTS.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AI_IMPLEMENTATION_CONTRACTS.md)
6. [docs/TECH_ARCHITECTURE.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/TECH_ARCHITECTURE.md)
7. [docs/UIUX_SYSTEM.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/UIUX_SYSTEM.md)
8. [docs/RELIABILITY.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/RELIABILITY.md)
9. This file

## Product Truth

Cogochi is not a generic monster battler.

It is a game where the player owns persistent AI agents, configures data sources, prompt stack, tools, and memory, evaluates them in controlled scenarios, and iterates through reflection and retraining.

Core loop:

`owned agent -> configure data and RAG -> squad -> eval battle -> reflection -> training queue -> promotion`

## Repo Truth

- `docs/` is the long-lived system of record.
- `AGENTS.md` is the short map.
- Context engineering is a repo feature, not a chat habit.
- Reliability rules for benchmarks and runtime noise must live in-repo.

## Current Reality

Implemented:

- owned-agent domain model
- roster, squad, lab, match, and runtime stores
- agent console
- retrieval-backed eval battle
- eval scenario catalog
- runtime adapter scaffolding
- AI runtime and implementation contract docs

Not yet implemented:

- real embedding-backed retrieval index
- reflection and eval services as standalone modules
- dataset builder
- training orchestrator
- fine-tune artifact registry
- async PvP snapshots

## Validation

Run after changes:

```bash
npm run check
npm run build
```

## Git

- Remote: `git@github.com:eunjuhyun88/Cogochi.git`
- Work on this repo only
- Record meaningful decisions in [docs/AGENT_WATCH_LOG.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/AGENT_WATCH_LOG.md)

## Context Engineering Rule

When product direction, runtime contracts, or reliability assumptions change, update:

- [AGENTS.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/AGENTS.md)
- [docs/INDEX.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/INDEX.md)
- [docs/CONTEXT_ENGINEERING.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/CONTEXT_ENGINEERING.md)
- [docs/PLANS.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/PLANS.md)
- [docs/QUALITY_SCORE.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/QUALITY_SCORE.md)
- [docs/RELIABILITY.md](/Users/ej/Downloads/maxidoge-clones/Cogochi/docs/RELIABILITY.md)
