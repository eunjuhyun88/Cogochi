# Dataset Builder Foundation

Date: 2026-03-07
Status: completed

## Problem Statement

Cogochi now has eval and reflection services, but it still cannot turn those outputs into durable SFT and preference-training datasets, which blocks the retraining pipeline.

## Scope

- add dataset training types
- add `buildAgentContextPacket` to preserve reusable context
- add `datasetBuilder.ts`
- persist dataset bundles in lab state
- attach context packets and dataset bundle ids to eval match history
- show dataset bundle counts in the lab

## Non-Goals

- implement `trainingOrchestrator.ts`
- implement real fine-tune execution
- add embedding-backed retrieval

## Acceptance Criteria

- every completed eval can produce a `TrainingDatasetBundle`
- the bundle contains SFT and/or preference examples derived from reflections
- lab state persists dataset bundles
- recent match history can point back to its dataset bundle
- `npm run check` and `npm run build` pass

## Result

- `datasetBuilder.ts` now emits match-level bundles with per-agent SFT and preference examples
- `battleStore.ts` now writes `contextPackets` and `datasetBundleId` into stored eval history
- `labStore.ts` persists `datasetBundles`
- `/lab` and `/agent/[id]` surface dataset bundle state in the UI
- verification passed with `npm run check` and `npm run build`

## Files Expected

- `src/lib/aimon/types.ts`
- `src/lib/aimon/services/contextAssembler.ts`
- `src/lib/aimon/services/datasetBuilder.ts`
- `src/lib/aimon/stores/labStore.ts`
- `src/lib/aimon/stores/battleStore.ts`
- `src/routes/lab/+page.svelte`

## Risks

- context packets may grow localStorage usage
- heuristic correction traces may need refinement once real fine-tuning begins
