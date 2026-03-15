# Cogochi Memento Runtime Architecture

Last updated: 2026-03-15

## Purpose

Apply the `memento-kit` layer model to Cogochi without breaking the game's existing product truth.

The goal is not to bolt on a generic AI memory system.
The goal is to separate:

- project truth
- owned-agent memory writeback
- runtime enrichment and distillation

so the game can scale without collapsing back into store-local logic.

## Layer Mapping

### 1. Core

Core remains the repo-local source of truth:

- `README.md`
- `CLAUDE.md`
- `context-kit.json`
- canonical docs
- app routes and deterministic engine code

Core answers:

- what the product is
- what the surfaces are
- what deterministic battle truth means

### 2. Memory

Memory is the owned-agent writeback layer:

- `src/lib/services/memory/`
- `OwnedAgent.memoryBank`
- `M0 / M30 / M90 / M365` tiering

Memory answers:

- what the agent learned
- what is recent versus durable
- which lesson came from training versus battle

Memory must not decide battle outcomes.
It only records and prepares retrieval context.

### 3. Runtime

Runtime is the adapter-aware enrichment layer:

- `runtime/runtime-config.json`
- `runtime/prompts/`
- `runtime/jobs/`
- `runtime/scripts/`
- `runtime/generated/`

Runtime answers:

- what the session boot bundle should contain
- how memory should be indexed and distilled
- how OpenClaw-facing prompts stay aligned with core truth

Runtime must not replace core truth or mutate market facts.

## Memory Tier Intent

Use the Memento tier model like this:

- `M0`
  - memory invariants and non-negotiable guardrails
- `M30`
  - recent warnings, quarantine notes, active refactor focus
- `M90`
  - proven playbooks and stable architecture lessons
- `M365`
  - long-lived founder truths and stable system identity

In Cogochi runtime state:

- accepted training tends toward `M90`
- accepted battle proof can promote toward `M365`
- quarantine and revert results stay short-lived unless repeatedly reinforced

## Writeback Flow

1. The player changes doctrine, indicator, script, or memory emphasis in `/lab`.
2. `rosterStore` delegates writeback construction to `src/lib/services/memory/writeback.ts`.
3. The service emits:
   - mutation history
   - proven frame update
   - care state
   - memory card with tier and source
4. `/agent/[id]` and `/journal` render that result as creature history.
5. `runtime/scripts/build-memory-index.mjs` and `distill-memory.mjs` convert stable repo-local memory sources into runtime-readable artifacts.
6. OpenClaw can enrich explanation and guidance, but deterministic battle truth stays in engine code.

## Why This Refactor Matters

Without this split:

- stores become giant hidden-memory managers
- runtime prompts drift away from canonical docs
- battle explanation and training memory become inconsistent
- autoresearch cannot score whether the runtime path is actually improving

With this split:

- deterministic judgment stays auditable
- owned-agent memory becomes a real product surface
- runtime integration becomes optional but structured
- autoresearch can score memory and runtime readiness separately from game feel

## Autoresearch Translation

Karpathy-style autoresearch becomes:

- mutate one bounded part of the product
- run fixed evaluators
- keep or reject based on weighted founder-goal progress

The Memento application adds one more constraint:

- do not accept a change that improves visuals but weakens core or memory/runtime separation
