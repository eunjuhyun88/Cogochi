# Cogochi Technical Architecture

Last updated: 2026-03-06

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

## 3. Layer Model

```text
Routes
  -> Stores
  -> Services
  -> Engine / Resolver
  -> Model and Embedding Providers
```

### Routes

- compose UI
- trigger actions
- do not own domain logic

### Stores

- own durable client state
- handle persistence
- coordinate services and routes

### Services

- own RAG, context assembly, scoring, and reflection logic

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
  components/
    aimon/
    shared/
  lib/
    aimon/
      data/
      services/
      stores/
      engine/
      types.ts
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

## 7. Core Data Flow

```text
Scenario State
  -> Retrieval Query Builder
  -> memoryService.retrieve()
  -> contextAssembler.build()
  -> modelProvider.infer()
  -> evalEngine.resolve()
  -> evalService.score()
  -> reflectionService.summarize()
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

## 11. Validation

Required after changes:

- `npm run check`
- `npm run build`

Additional engineering checks:

- routes do not own business logic
- stores do not duplicate scoring logic
- retrieval never leaks future information
- a match result changes roster state through one well-defined path
