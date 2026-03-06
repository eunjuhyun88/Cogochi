# Cogochi

Cogochi is a standalone SvelteKit project for an AI agent raising and evaluation simulator.

The player owns individual AI agents built on top of a base model, configures their prompts, data sources, and memory, forms a 4-agent squad, and sends them into evaluation matches that feed back into progression.

This repo should read as a `Cogochi` product repo, not as a sub-note for another project.

## Product Loop

`base model -> owned agent -> data and memory setup -> prompt/retraining -> squad -> eval battle -> reflection -> progression`

## Current Screens

- `/` -> Trainer Hub
- `/roster` -> Owned Agents
- `/agent/[id]` -> Agent Console
- `/battle` -> Live Battle
- `/team` -> Squad Builder
- `/lab` -> Growth Lab

## Commands

```bash
npm install
npm run dev
npm run check
npm run build
```

## Docs

- short repo map: `AGENTS.md`
- docs index: `docs/INDEX.md`
- workspace and engineering rules: `CLAUDE.md`
- product and current state: `docs/PROJECT_CONTEXT.md`
- product blueprint: `docs/PRODUCT_BLUEPRINT.md`
- buildable system design: `docs/AGENT_SYSTEM_DESIGN.md`
- AI runtime spec: `docs/AI_RUNTIME_TRAINING_SPEC.md`
- AI implementation contracts: `docs/AI_IMPLEMENTATION_CONTRACTS.md`
- context engineering rules: `docs/CONTEXT_ENGINEERING.md`
- eval reliability rules: `docs/RELIABILITY.md`
- repo quality score: `docs/QUALITY_SCORE.md`
- plan system: `docs/PLANS.md`
- game design: `docs/GAME_DESIGN.md`
- technical architecture: `docs/TECH_ARCHITECTURE.md`
- UIUX system: `docs/UIUX_SYSTEM.md`
- progression model: `docs/PROGRESSION_MODEL.md`
- work history: `docs/AGENT_WATCH_LOG.md`
