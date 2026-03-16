# Cogochi Memento + Autoresearch Refactor Plan

Last updated: 2026-03-15

## Objective

Refactor Cogochi so that:

1. `memento-kit` is applied as a real three-layer architecture
2. `autoresearch` optimizes the actual judgment RPG goal instead of generic model performance
3. owned-agent memory, runtime boot bundles, and proof-driven mutation loops can keep scaling together

## User Goal Translation

The product goal is:

`Create my own AI agent, teach it my chart pattern rules, indicators, scripts, and memories, then test whether different combinations actually change that creature's judgment inside a game loop.`

That means the architecture must preserve four truths at once:

- game feel
- deterministic proof
- memory growth
- runtime extensibility

## Phase Breakdown

### Phase 1. Core Surface Map

Deliverables:

- real `context-kit.json` surfaces
- battle and journal surface specs
- runtime-aware repo summary

### Phase 2. Memory Boundary

Deliverables:

- `src/lib/services/memory/` as the only writeback constructor
- memory tiers and sources on memory cards
- memory tier summary visible in runtime UI

### Phase 3. Runtime Layer

Deliverables:

- `runtime/README.md`
- `runtime/runtime-config.json`
- boot, index, distill, and relay scripts
- generated runtime artifacts

### Phase 4. Autoresearch Alignment

Deliverables:

- runtime-readiness evaluator
- scorecard weight update
- worker/tool manifests for runtime architecture
- program rules that explicitly mention Memento boundaries

### Phase 5. Validation

Deliverables:

- `npm run check`
- `npm run build`
- `npm run runtime:all`
- `npm run autoresearch:runtime`
- `npm run autoresearch:score`

## Task Tree

### Track A. Core

- update `context-kit.json`
- update product-spec index
- add battle and journal specs

### Track B. Memory

- extend `AgentMemoryCard`
- move writeback logic out of `rosterStore`
- surface tier/source on agent-facing UI

### Track C. Runtime

- create runtime config and prompts
- create runtime scripts
- generate bundle, index, and distill outputs

### Track D. Autoresearch

- add runtime evaluator
- update score assembly
- add runtime worker and tool manifests

## Round Discipline

Following the `nanochat` round-1 lesson:

- each autoresearch round should stay small and coherent
- keep/reject should happen after one bounded experiment, not a sweeping rewrite
- accepted rounds should improve a reusable rail such as memory writeback, runtime distill, or proof-loop clarity

## Exit Criteria

This refactor is complete only if:

- the repo no longer reads like a Memento bootstrap
- the memory layer is explicit in code and UI
- runtime artifacts can be generated locally
- autoresearch scores runtime readiness explicitly
- the deterministic judgment RPG loop still passes its normal gates
