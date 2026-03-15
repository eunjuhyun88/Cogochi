# Surface Spec: lab

- Status: active
- Canonical route entry: `/lab`
- Surface ID: `lab`

## Purpose

`lab` is Cogochi's doctrine authoring and mutation preparation surface.

It is where the player:

- rewrites doctrine
- changes indicator/script/risk emphasis
- uses the doctrine terminal
- binds one candidate build to future proof

`lab` is not the final authority over truth.
`proof` still decides whether a mutation survives.

## One-Line Definition

`lab` is the place where one idea becomes a proof-ready mutation candidate.

## Core Outcome

After one short lab session, the player should be able to say:

- what idea they are trying to express
- what criteria the system thinks that idea means
- what overlay the app will render on the chart
- what the overlay looks like on one historical frame before proof
- what Pine-style draft can be exported
- what mutation will be sent into proof next

## Must Have

- active agent selection
- scenario selection
- mutation draft controls
- doctrine terminal prompt input
- criteria explanation
- overlay preview contract
- historical-frame overlay preview
- Pine export draft
- saved doctrine sessions per agent
- one-click bind into the mutation draft
- session-aware handoff to `/proof`

## Frontend Responsibilities

Frontend owns:

- prompt input
- doctrine session browsing
- overlay readability
- Pine draft readability
- draft binding controls

Frontend must not own:

- provider calls
- proof scoring
- writeback policy
- persistence truth beyond client-state orchestration

## Shared Deterministic Domain

Shared domain owns:

- `DoctrineSession`
- `OverlaySpec`
- `PineDraft`
- loadout patch contracts
- mutation compare contracts

## Backend Responsibilities

Backend owns:

- doctrine prompt interpretation
- terminal response generation
- future provider integration
- future doctrine persistence adapters
- historical evidence-frame lookup

## Context Contracts

## Routes

- `/lab`
- `/proof`
- `/battle`

## Stores

- `labStore`
- `rosterStore`

## Deep Links

- `docs/product-specs/proof.md`
- `docs/product-specs/evolution.md`
- `docs/exec-plans/active/COGOCHI_terminal_doctrine_prd_20260315.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
