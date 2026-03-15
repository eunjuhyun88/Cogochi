# Surface Spec: passport

- Status: active
- Canonical route entry: `/passport`
- Surface ID: `passport`

## Purpose

`passport` is the readable proof booklet for one creature or the whole squad.

It exists to answer:

- what has this creature actually proven
- which proof runs are public-ready
- which mutations survived validation
- why another player should believe this creature has earned its current form

It must feel like a booklet of earned proof, not a leaderboard or PnL dashboard.

## One-Line Definition

`passport` turns canonical `ProofArtifact` history into a compact public-ready creature record.

## Core Outcome

After one short visit, the player should be able to say:

- which creature has public-ready proof
- what the latest public mutation was
- which pack and frame earned that status
- how much proof is still private or unstable

## Must Have

- squad-level passport overview
- per-agent passport detail route
- public share route backed by exported snapshot
- publish gate before share-token route activates
- public-ready versus private proof distinction
- latest public proof surfaced first
- mutation title, doctrine title, frame, pack, and verdict shown together
- trust delta and visible effect shown as part of the proof story
- direct path back to `/proof` and `/lab`

## Player Rule

`passport` does not create truth.

It only reads the truth already emitted by:

- `/proof`
- `/battle`
- `proofStore`

## User Flow

1. The player opens `/passport` from the hub, agent detail, or nav.
2. The squad overview shows which creatures have public-ready proof and which do not.
3. The player opens `/passport/[id]` for one creature.
4. The page foregrounds the latest public-ready `ProofArtifact`.
5. The player can export a draft snapshot once at least one public-ready proof exists.
6. The player can publish that snapshot, which activates a share-token route.
7. The page lists public proof cards first and trainer-only proof history second.
8. The player chooses whether to run more proof, revise doctrine, preview the draft card, publish the share link, or return to the agent surface.

## Frontend Responsibilities

Frontend owns:

- proof booklet readability
- per-agent summary cards
- public versus private badge treatment
- route handoff back to proof and lab
- client-side export action that sends canonical public proof history to the backend adapter
- publish action UI and draft/published state readability

Frontend must not own:

- verdict calculation
- proof-pack visibility logic beyond reading canonical pack metadata
- proof artifact creation

## Shared Deterministic Domain

Shared domain owns:

- `ProofArtifact`
- proof-pack `publicReady` status
- pack mode labels
- mutation verdict labels

## Backend Responsibilities

Backend owns:

- passport snapshot export persistence
- server-managed passport registry with publish state
- public sharing endpoint and token route
- future long-term passport synchronization beyond local snapshot files

## Context Contracts

## Routes

- `/passport`
- `/passport/[id]`
- `/passport/public/[id]`
- `/passport/share/[token]`
- `/proof`
- `/lab`

## Stores

- `proofStore`
- `rosterStore`

## APIs

- `/api/passport/export`
- `/api/passport/[id]`
- `/api/passport/publish`

## Deep Links

- `docs/product-specs/proof.md`
- `docs/product-specs/raising.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
