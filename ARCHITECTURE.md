# Cogochi v1 Architecture Map

This file is the root architecture entry point.
It exists to route people and tools to the right canonical documents quickly.

## Read Order

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `docs/README.md`
5. `docs/SYSTEM_INTENT.md`
6. `docs/CONTEXT_ENGINEERING.md`
7. the smallest surface-specific canonical docs

## Canonical Doc Entry Points

- Product truth and loop definition: `docs/MASTER_GAME_SPEC.md`
- Agent runtime and training loop: `docs/AGENT_SYSTEM_DESIGN.md`
- Technical stack and ownership boundaries: `docs/TECH_ARCHITECTURE.md`
- Chart-to-battle grammar: `docs/BATTLEFIELD_DESIGN.md`
- Visual world, camera, and UI layering: `docs/VISUAL_WORLD_DESIGN.md`
- Product heuristics and out-of-scope boundaries: `docs/PRODUCT_SENSE.md`
- Current plans and rollout work: `docs/PLANS.md`

## Architecture Boundaries

- Routes are surface entry points, not business logic owners.
- Stores own state transitions and orchestration, not deterministic scoring rules.
- `src/lib/engine` owns battle resolution and judgment quality calculation.
- `src/lib/services/memory` owns reflection writeback and retrieval preparation.
- Canvas rendering should be wrapped by components, not directly owned by routes.

## Supporting Docs

- Context retrieval and measurement rules: `docs/CONTEXT_ENGINEERING.md`, `docs/CONTEXT_EVALUATION.md`
- Agent blueprint rules: `docs/AGENT_FACTORY.md`, `agents/README.md`
- Tool contract rules: `docs/TOOL_DESIGN.md`, `tools/README.md`
- Coordination and sync rules: `docs/MULTI_AGENT_COORDINATION.md`, `docs/GIT_WORKFLOW.md`
