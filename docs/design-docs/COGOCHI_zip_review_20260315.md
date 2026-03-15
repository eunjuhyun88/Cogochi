# COGOCHI zip review 20260315

Last updated: 2026-03-15

## 1. Reviewed Input

Reviewed from `/Users/ej/Downloads/files (3).zip`:

- `Cogochi_BizModel_20260315.md`
- `Cogochi_GTM_20260315.md`
- `Cogochi_MarketResearch_20260315.md`
- `Cogochi_GDD_20260315.md`
- `Cogochi_Team_20260315.md`
- `Cogochi_Roadmap_20260315.md`
- `Cogochi_AgentEconomy_20260315.md`
- `Cogochi_MasterDesign_v2_20260315.md`
- `HoloStudio_Structure_20260315.md`
- `Cogochi_PRD_20260315.md`

These files are advisory input only.

Canonical product truth remains:

- `docs/MASTER_GAME_SPEC.md`
- `docs/AGENT_SYSTEM_DESIGN.md`
- `docs/BATTLEFIELD_DESIGN.md`
- `docs/VISUAL_WORLD_DESIGN.md`
- `docs/TECH_ARCHITECTURE.md`

## 2. What We Keep

The zip surfaced several useful improvements that fit the current judgment RPG direction.

### 2.1 Stronger frontend/backend split

The imported GDD/PRD were clearer than the current repo at separating:

- player-facing surfaces
- evaluation and memory runtime
- system orchestration boundaries

Cogochi should keep one repo, but design as three mandatory layers:

```text
Frontend surface
  -> Shared deterministic domain
  -> Backend runtime
```

### 2.2 Explicit proof lane

The imported docs were right that the product needs a more explicit proof surface.

We do not adopt `backtest` as a trading-tool concept.
We do adopt `proof` as a game-native evaluation lane:

- controlled historical frame
- setup under test
- verdict
- keep / quarantine / revert

### 2.3 Clear trainer feedback loop

The imported materials consistently pushed toward:

- setup
- run
- review
- revise

That matches Cogochi well and should stay visible in every loop:

`field -> gate -> battle -> verdict -> journal/lab -> field`

### 2.4 Cleaner service boundaries

The imported architecture framing highlighted a missing distinction between:

- UI state
- runtime orchestration
- deterministic evaluation

Cogochi should keep:

- stores for client state only
- engine for deterministic battle logic only
- backend services for memory, evaluation orchestration, provider access, and artifact generation

## 3. What We Reject As Core Product Truth

Several imported ideas conflict directly with the current canonical product.

### 3.1 NFT / token / marketplace-first framing

Rejected as the core thesis for current Cogochi:

- NFT-owned agent thesis
- token economy as core progression
- marketplace-first product framing
- performance fee / rental economy as the core loop

These push the product away from a judgment RPG and toward a speculative trading platform if they become the main loop.

They may exist later only as downstream meta layers on top of proof.

### 3.2 Live trading and copytrading execution

Rejected:

- brokerage/CEX execution
- real-money auto trading
- copytrading as the core fantasy
- live performance tracking as the primary value

Cogochi is a judgment game first.
Price input is immutable and historical during proof.
Execution can only ever be a later external layer, never the source of core battle truth.

### 3.3 Evaluation contamination

Rejected:

- mixing current live market data into proof evaluation
- letting RAG carry current market state
- optimizing purely for finance metrics like raw Sharpe without judgment readability

## 4. Resulting Architecture Decision

## 4.1 Frontend

Frontend owns:

- movement
- battle input
- roster presentation
- journal/lab presentation
- HUD and world-space cues
- temporary client state

Frontend must not own:

- provider calls
- file/runtime artifact access
- memory writeback policy
- evaluation policy
- persistence schema decisions

## 4.2 Shared deterministic domain

Shared deterministic domain owns:

- battle resolution
- score math
- scenario/frame translation
- view-model contracts
- mutation verdict inputs/outputs

This layer must stay pure and testable.

## 4.3 Backend runtime

Backend owns:

- `+page.server.ts` and `+server.ts`
- runtime artifact loading
- memory retrieval and writeback
- evaluation orchestration
- provider adapters
- persistence adapters
- nightly distill and autoresearch jobs

## 5. Immediate Repo Implications

### 5.1 Required boundary

Even inside the same SvelteKit app:

- `src/routes/*.svelte`, `src/components/`, `src/lib/stores/` are frontend
- `src/routes/**/+page.server.ts`, `src/routes/**/+server.ts`, `src/lib/server/`, `src/lib/services/`, `runtime/`, `scripts/` are backend
- `src/lib/engine/` and `src/lib/types.ts` are shared deterministic contracts

### 5.2 Design rule

Every new feature should be described in this order:

1. frontend surface
2. shared deterministic domain
3. backend runtime and persistence

If that split is not clear, the feature is under-designed.

## 6. Next Improvements Triggered By This Review

The zip review suggests these next architecture improvements:

1. Add an explicit `proof` surface spec that formalizes controlled historical validation.
2. Continue moving memory/runtime reads out of stores and into server/runtime boundaries.
3. Keep trainer-facing verdicts readable in the frontend, but compute proof results in shared/backend layers.
4. If market or public track record layers are added later, place them downstream of proof rather than replacing the judgment RPG core.
