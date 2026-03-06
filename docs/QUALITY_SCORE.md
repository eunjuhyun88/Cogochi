# Cogochi Quality Score

Last updated: 2026-03-07

This file tracks repo readability and agent-operability, not just user-facing polish.

## Scoring Legend

- `A`: strong and durable
- `B`: usable but still fragile
- `C`: partially present
- `D`: missing or unreliable

## Current Scorecard

| Area | Score | Notes |
| --- | --- | --- |
| Product truth in repo docs | A | Product and architecture docs exist and are cross-linked |
| AI runtime design clarity | A | Runtime and implementation contract docs now exist |
| Repo entrypoint clarity | B | `AGENTS.md` and docs index added, but code-level doc drift still possible |
| Plan hygiene | C | Plan directories and tracker are added, but active plan inventory is still sparse |
| Mechanical context validation | B | `check-context-docs.mjs` added, but it only validates structure, not freshness |
| Eval reliability discipline | B | Reliability policy exists, but runtime manifests are not yet emitted in code |
| Artifact lineage and promotion rigor | C | Contracts exist, implementation is pending |
| Async PvP snapshot readiness | C | Storage model is designed, implementation is pending |

## Next Upgrades

1. Add code-aware doc freshness checks
2. Emit benchmark run manifests from the runtime
3. Add execution-plan templates
4. Add artifact lineage persistence
5. Add snapshot validation for async PvP
