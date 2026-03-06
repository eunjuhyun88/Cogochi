# Context Engineering Foundation

Date: 2026-03-07
Status: completed

## Problem Statement

Cogochi had strong product and AI design docs, but lacked a short repo map, progressive-disclosure doc structure, explicit eval reliability rules, and mechanical validation for context hygiene.

## Scope

- add a short `AGENTS.md`
- add a docs index
- add context engineering and reliability docs
- add plan-system docs and directories
- add a mechanical context-doc validation script
- update repo entry docs to point at the new structure

## Non-Goals

- implement reflection or eval services
- implement artifact registry persistence
- implement async PvP snapshots

## Acceptance Criteria

- a new agent can enter through `AGENTS.md` and `docs/INDEX.md`
- context-engineering rules live in-repo
- eval reliability expectations live in-repo
- plan directories exist
- `npm run check` validates the doc structure

## Changes

- added `AGENTS.md`
- added `docs/INDEX.md`
- added `docs/CONTEXT_ENGINEERING.md`
- added `docs/RELIABILITY.md`
- added `docs/QUALITY_SCORE.md`
- added `docs/PLANS.md`
- added `docs/exec-plans/`
- added `scripts/check-context-docs.mjs`
- updated `package.json`, `README.md`, `CLAUDE.md`

## Risks Remaining

- the context lint checks structure, not semantic freshness
- benchmark manifests are designed but not yet emitted by code
- active plan inventory is still thin
