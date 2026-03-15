# Agent Rules

This file is the root execution contract for human and AI contributors working in this repository.

## Mandatory Start Sequence

1. Re-read `README.md`.
2. Re-read `CLAUDE.md`.
3. Route docs through `docs/README.md` instead of broad scanning.
4. Create a semantic checkpoint for non-trivial work with `npm run ctx:checkpoint -- --work-id "<W-ID>" --surface "<surface>" --objective "<objective>"`.
5. If the task changes product behavior, open `docs/MASTER_GAME_SPEC.md`, `docs/AGENT_SYSTEM_DESIGN.md`, `docs/BATTLEFIELD_DESIGN.md`, and `docs/VISUAL_WORLD_DESIGN.md` before editing.

## Retrieval Discipline

- Use `docs/CONTEXT_ENGINEERING.md` for retrieval order, compaction rules, and anti-patterns.
- Use `docs/CONTEXTUAL_RETRIEVAL.md` when the right canonical subset is unclear.
- Prefer the smallest relevant canonical subset over broad repo scanning.

## Reusable Contracts

- Use `docs/AGENT_FACTORY.md` when creating or revising reusable agents.
- Use `docs/TOOL_DESIGN.md` when creating or revising reusable tools.
- Use `docs/AGENT_OBSERVABILITY.md` when the work needs runtime evidence.

## Code Boundaries

- Routes orchestrate UI and store calls only.
- Stores own state, not battle scoring.
- Engine code owns deterministic score and battle resolution.
- Memory services own writeback and retrieval preparation, not battle outcomes.

## Product Guardrails

- Cogochi is a judgment RPG, not a trading simulator.
- Price input is immutable; the player changes judgment, not candles.
- Current market data must not contaminate RAG-backed evaluation.
- Battle outcomes must be explainable, deterministic, and tied to judgment quality.
