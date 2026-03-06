# Eval And Reflection Services

Date: 2026-03-07
Status: completed

## Problem Statement

Cogochi currently keeps evaluation scoring and post-match writeback logic inside stores, which makes the AI runtime harder to reason about, harder to reuse for training, and inconsistent with the implementation contracts.

## Scope

- add `evalService.ts`
- add `reflectionService.ts`
- move scoring and reward construction out of `matchStore`
- move post-match reflection and durable memory generation out of `labStore`
- connect battle flow to the new services
- extend types only as needed for the new flow

## Non-Goals

- implement `datasetBuilder.ts`
- implement `trainingOrchestrator.ts`
- implement `fineTuneService.ts`
- add embedding-backed retrieval

## Acceptance Criteria

- `matchStore` no longer computes metrics inline
- `labStore` no longer invents battle memory cards inline
- a battle result produces:
  - team metrics
  - per-agent eval rows
  - reflection note
  - durable memory writeback
- `npm run check` passes
- `npm run build` passes

## Files Expected

- `src/lib/aimon/services/evalService.ts`
- `src/lib/aimon/services/reflectionService.ts`
- `src/lib/aimon/types.ts`
- `src/lib/aimon/stores/matchStore.ts`
- `src/lib/aimon/stores/labStore.ts`
- `src/lib/aimon/stores/battleStore.ts`

## Risks

- localStorage history must stay backward-compatible enough not to break UI reads
- reflections should improve the data model without forcing immediate UI rewrites

## Completed Changes

- added `src/lib/aimon/services/evalService.ts`
- added `src/lib/aimon/services/reflectionService.ts`
- extended `types.ts` with `FailureMode` and `ReflectionNote`
- moved eval match construction out of `matchStore`
- moved durable battle memory creation out of `labStore`
- rewired `battleStore` to use `draft eval -> reflection -> memory writeback -> final match result`
- surfaced reflection lessons and failure modes in agent and lab history views

## Validation

- `npm run check`
- `npm run build`
