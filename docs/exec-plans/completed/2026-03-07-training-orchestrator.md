# Training Orchestrator And Promotion Loop

Date: 2026-03-07
Status: completed

## Problem Statement

Cogochi can now emit eval reflections and dataset bundles, but those artifacts still do not flow into a real training job state machine. The next gap is the orchestrator that validates prerequisites, runs local mutation jobs, evaluates candidates, and promotes artifacts.

## Scope

- extend types with training job and artifact contracts
- persist training jobs and model artifacts in lab state
- add `trainingOrchestrator.ts`
- add `fineTuneService.ts` MVP stubs for local packaging and artifact manifests
- connect agent console queue action to queue/start/promote flows
- surface artifact and job state in lab and agent views

## Non-Goals

- run real GPU fine-tuning
- add remote job workers
- add async PvP artifact matchmaking

## Acceptance Criteria

- queueing a training job creates a typed job record with valid transitions
- supported job types can be validated and started from the UI
- SFT/LORA jobs package dataset bundles into local artifact manifests
- promotable jobs can be promoted and recorded against the agent
- `npm run check` and `npm run build` pass

## Result

- `trainingOrchestrator.ts` now enforces queue/validate/run/evaluate/promote transitions
- `fineTuneService.ts` packages dataset bundles into local SFT/LORA artifact manifests
- `labStore.ts` persists model artifacts and richer training job records
- `/agent/[id]` can queue, start, and promote jobs
- `/lab` shows artifact and training job state
- verification passed with `npm run check` and `npm run build`

## Files Expected

- `src/lib/aimon/types.ts`
- `src/lib/aimon/stores/labStore.ts`
- `src/lib/aimon/stores/rosterStore.ts`
- `src/lib/aimon/services/trainingOrchestrator.ts`
- `src/lib/aimon/services/fineTuneService.ts`
- `src/routes/agent/[id]/+page.svelte`
- `src/routes/lab/+page.svelte`

## Risks

- current dataset volumes may not satisfy stricter promotion prerequisites
- artifact ids are local MVP manifests, not real provider model ids yet
- UI could confuse queued vs promotable unless state labels stay explicit
