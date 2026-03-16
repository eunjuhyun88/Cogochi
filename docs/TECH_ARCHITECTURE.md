# Cogochi Technical Architecture

Last updated: 2026-03-15

## 1. Architecture Goal

Cogochi should support a local-first AI agent training loop where:

- agent configuration is explicit
- retrieval and memory are visible systems
- evaluation matches are deterministic enough to compare setups
- the app can later expand to async PvP without rewriting the core model

## 2. Current Stack

- SvelteKit 2
- Svelte 5
- TypeScript 5
- Vite
- localStorage for MVP persistence
- SvelteKit server loads and endpoints for backend/runtime boundaries
- repo-local runtime jobs under `runtime/` and `scripts/`

## 3. Layer Model

```text
Frontend routes/components
  -> Frontend stores
  -> Server routes / backend adapters
  -> Services / runtime
  -> Engine / resolver
  -> Persistence and providers
```

The repo may stay single-app, but the design split is mandatory:

- frontend surface
- shared deterministic domain
- backend runtime

### 3.1 Frontend

Frontend files are:

- `src/routes/**/*.svelte`
- `src/components/**`
- `src/lib/stores/**`

Frontend owns:

- rendering
- player input
- route orchestration
- temporary UI state

Frontend must not own:

- provider access
- file access
- memory writeback policy
- evaluation orchestration
- persistence schema rules

### 3.2 Shared deterministic domain

Shared deterministic files are:

- `src/lib/engine/**`
- `src/lib/types.ts`
- pure contract/view-model builders

This layer owns:

- deterministic battle resolution
- score math
- scenario/frame translation
- verdict input/output contracts

### 3.3 Backend runtime

Backend files are:

- `src/routes/**/+page.server.ts`
- `src/routes/**/+server.ts`
- `src/lib/server/**`
- `src/lib/services/**`
- `runtime/**`
- `scripts/**`

Backend owns:

- runtime artifact generation and reads
- memory retrieval and writeback
- provider adapters
- evaluation orchestration
- persistence adapters
- nightly distill and autoresearch jobs

### Routes

- compose UI
- trigger actions
- do not own domain logic

### Stores

- own durable client state
- coordinate routes and backend contracts
- never own scoring logic or provider logic

### Services

- own RAG, context assembly, scoring orchestration, reflection logic, and runtime artifact access
- any service that touches providers, files, or writeback is backend-owned

### Engine

- owns evaluation phase transitions and deterministic resolution logic

## 4. Target Directory Shape

```text
src/
  routes/
    +page.svelte
    roster/+page.svelte
    agent/[id]/+page.svelte
    team/+page.svelte
    battle/+page.svelte
    lab/+page.svelte
    field/+page.svelte
    journal/+page.svelte
    proof/+page.svelte          # target explicit validation lane
    battle/+page.server.ts
    field/+page.server.ts
  components/
    aimon/
    shared/
  lib/
    server/
    aimon/
      data/
      services/
      stores/
      engine/
      types.ts
runtime/
scripts/
```

The internal `aimon` namespace is still a historical artifact and can remain until the systems stabilize.

## 5. Core Stores

### `playerStore`

- trainer profile
- research points
- unlock states

### `rosterStore`

- owned agents
- selected agent id
- progression updates

### `squadStore`

- active squad
- presets
- role assignment validation

### `labStore`

- data source catalog
- tool catalog
- training runs
- prompt variants
- memory maintenance actions

### `matchStore`

- active scenario
- phase state
- agent traces
- match result

## 6. Core Services

### `modelProvider`

- calls Qwen or another compatible inference backend
- enforces structured outputs

### `embeddingProvider`

- builds embeddings for memory records

### `memoryService`

- retrieves memory
- writes lesson cards
- compacts memory banks

### `contextAssembler`

- merges structured state, prompts, memory, and squad messages into one request payload

### `evalService`

- computes scoring metrics
- creates reward packets

### `reflectionService`

- converts raw traces into memory cards and training suggestions

### `runtimeArtifactService`

- reads distill outputs and memory indexes
- bridges runtime artifacts into field, battle, journal, and proof surfaces

### `proofPackService`

- defines fixed historical validation bundles
- maps frames to scenarios
- supplies metric weights and public-ready proof metadata

## 7. Core Data Flow

```text
Frontend route/store
  -> server load or action
  -> proofPackService.select()
  -> Retrieval Query Builder
  -> memoryService.retrieve()
  -> contextAssembler.build()
  -> modelProvider.infer()
  -> evalEngine.resolve()
  -> evalService.score()
  -> reflectionService.summarize()
  -> runtimeArtifactService.publish()
  -> rosterStore.applyRewards()
  -> labStore.enqueueTraining()
```

## 8. Persistence Model

MVP persistence remains client-side, but state must be split by responsibility.

Recommended keys:

- `cogochi.player.v2`
- `cogochi.roster.v2`
- `cogochi.squad.v2`
- `cogochi.lab.v2`
- `cogochi.match-history.v2`

Every store should own its own migration boundary.

## 9. RAG Boundary Rules

Current market or scenario values:

- direct structured input

Past experience and doctrine:

- RAG memory

Offline policy shifts:

- training runs

This boundary must not blur or evaluation quality collapses.

## 10. Target Implementation Order

1. extend `types.ts`
2. split stores
3. add services for retrieval, reflection, and evaluation
4. wire `/agent/[id]` and `/lab`
5. convert battle into an evaluation console
6. formalize `/proof` as a first-class validation surface

## 11. Validation

Required after changes:

- `npm run check`
- `npm run build`

Additional engineering checks:

- routes do not own business logic
- stores do not duplicate scoring logic or backend provider access
- retrieval never leaks future information
- a match result changes roster state through one well-defined path
- every feature can be described as frontend surface + shared domain + backend runtime
