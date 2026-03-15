# Surface Spec: battle

- Status: active
- Canonical route entry: `/battle`
- Surface ID: `battle`

## Purpose

`battle` is the chart-native clash surface where one historical frame becomes one short, readable objective.

It must let the player:

- enter from the field or lab with a clear reason
- read one objective quickly
- see one short entry brief that explains why this clash matters right now
- use a bounded command set
- understand why the captain chose the final line
- leave with a verdict that changes the agent

If `battle` feels like a report viewer, a finance dashboard, or a detached tactics minigame, it has failed.

## Core Outcome

After one clash, the player should be able to say:

- what the objective was
- why the squad won or lost
- which instinct was weak
- what mutation verdict they chose

## Must Have

- one obvious clash objective
- clear field or lab entry reason
- one entry brief tied to gate pressure or care-state repair
- handed-off doctrine session remains visible when battle came from `/proof`
- visible chart terrain and active proof frame
- readable support versus objection explanation
- keep, quarantine, or revert before return
- writeback into trust, mutation history, proven frame, and memory
- one canonical `ProofArtifact` written after verdict so later surfaces do not reconstruct the result from scattered query state
- direct handoff into `/journal` after verdict so the return loop does not collapse into a raw field jump
- runtime-derived focus checks may appear in the entry brief, but only as advisory guidance and never as battle authority
- when a verdict has already produced a `ProofArtifact`, post-battle navigation should prefer `artifact + identity context` instead of duplicating the full return summary in query state

## Context Contracts

## Routes

- `/battle`

## Stores

- `battleStore`
- `rosterStore`
- `proofStore`

## Deep Links

- `docs/BATTLEFIELD_DESIGN.md`
- `docs/design-docs/atlas-judgment-evolution.md`
- `docs/product-specs/evolution.md`
