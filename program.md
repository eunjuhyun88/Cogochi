# Cogochi OpenClaw Autoresearch Program

This file is the repo-local organization program for running Cogochi in an `autoresearch` style.

The operator may be OpenClaw, Codex, Claude, or another coding agent, but the intended runtime for the game-facing AI is OpenClaw with deterministic fallback behavior.

## Objective

Build Cogochi into a `Pokemon-grade alpha` where the player can:

1. understand the next objective within 10 seconds
2. travel with a four-slot squad through a chart-native world
3. enter a short, readable clash from a real gate instead of a sterile menu
4. tune doctrine, indicators, scripts, and memory on one owned agent
5. run a fixed historical proof encounter and choose keep, quarantine, or revert
6. see that verdict change the creature's body, history, or care state
7. return to camp already knowing the next best action

This is not a generic chart tool, not a pure research loop, and not a dashboard with movement.

This is a `world-first judgment creature RPG`.

## Read First

Before making any change, read:

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `docs/SYSTEM_INTENT.md`
5. `docs/AGENT_SYSTEM_DESIGN.md`
6. `docs/product-specs/proof.md`
7. `docs/design-docs/COGOCHI_proof_validation_20260315.md`
8. `docs/exec-plans/active/COGOCHI_proof_validation_execution_20260315.md`
9. `docs/exec-plans/active/COGOCHI_founder_goal_20260312.md`
10. `docs/exec-plans/active/COGOCHI_autoresearch_org_20260312.md`
11. `docs/exec-plans/active/COGOCHI_autoresearch_scorecard_20260312.md`
12. `docs/exec-plans/active/COGOCHI_autoresearch_bottlenecks_20260312.md`
13. `docs/exec-plans/active/COGOCHI_judgment_tamagotchi_loop_20260312.md`
14. `docs/exec-plans/active/COGOCHI_full_game_autoresearch_20260312.md`
15. `docs/design-docs/judgment-tamagotchi-loop.md`
16. `docs/design-docs/atlas-judgment-evolution.md`
17. `docs/design-docs/chartfield-fullgame-direction.md`
18. `docs/design-docs/COGOCHI_pokemon_grade_game_target_20260313.md`
19. `docs/design-docs/COGOCHI_memento_runtime_architecture_20260315.md`
20. `docs/exec-plans/active/COGOCHI_pokemon_grade_autoresearch_20260313.md`
21. `docs/exec-plans/active/COGOCHI_memento_autoresearch_refactor_20260315.md`
22. `docs/product-specs/evolution.md`

## Hard Product Rules

- The player is a trainer, not a trader bot operator.
- The chart is the battlefield and evaluation surface, not decorative wallpaper.
- Current market state is direct input, not RAG memory.
- Battle outcomes must stay explainable and deterministic.
- Training, memory, and experimentation matter more than spectacle, but the product must still read as a game first.
- Prompts, scripts, retrieval, and doctrine are treated as mutable genes.
- Keep or revert decisions must use fixed historical proof packs, not live capital.
- Do not use Sharpe or PnL as the sole loss function for game progression.
- Do not optimize for win rate alone if it hurts product clarity.
- Do not drift into brokerage, passive chart viewing, or pet-only care loops.
- Do not treat visible growth as optional polish.
- Do not accept a high score if the first five minutes still feel like panel reading instead of travel and encounter play.

## Atlas Translation Rules

When adapting the Atlas pattern:

- `25 debate agents` become an internal judgment council behind four visible companions
- `Darwinian weights` become player-readable trust weights
- `worst agent rewrite` becomes one bounded mutation proposal against the current weak link
- `CIO bottleneck` becomes a measurable squad-captain bottleneck
- `keep or revert` happens only after a deterministic proof pack rerun

## Memento Translation Rules

Cogochi adopts the Memento layer model like this:

- `Core`
  - repo-local product truth, route contracts, and deterministic battle rules
- `Memory`
  - owned-agent writeback in `src/lib/services/memory/` with `M0/M30/M90/M365` tiering
- `Runtime`
  - `runtime/` boot bundles, memory index, distill reports, and OpenClaw-facing prompts

Do not mix these layers.

- Core must stay team-shared and canonical.
- Memory must stay attributable to training, battle, or distill events.
- Runtime must consume the other two layers without replacing them.

## Nanochat Round Discipline

Use the `nanochat` round-1 pattern as a discipline rule, not as a training target:

- one round should attack one bounded bottleneck
- a surviving round should usually touch a small file cluster, not sprawl across the repo
- keep only changes that generalize across the product loop, not one screenshot or one ad hoc case
- prefer a few coherent changes that reinforce each other over many unrelated tweaks

For Cogochi this means a valid round usually changes one of:

- `memory boundary`
- `runtime bundle and distill rail`
- `field/battle/journal loop`
- `raising and mutation proof readability`

## OpenClaw Runtime Assumption

The target runtime is OpenClaw served through a local compatible API.

Acceptable runtime paths:

- OpenClaw on a local OpenAI-compatible endpoint
- OpenClaw on a local Ollama-like endpoint
- deterministic local fallback when OpenClaw is unavailable

The runtime is used to enrich:

- reflection
- memory retrieval summaries
- player guidance
- agent personality expression

The runtime must not be required for the core deterministic evaluation loop to function.

## Allowed Edit Scope

Prefer small, testable, single-bottleneck changes.

Allowed:

- `src/`
- `static/`
- `agents/`
- `tools/`
- `docs/product-specs/`
- `docs/design-docs/`
- `docs/exec-plans/active/`
- `program.md`

Do not edit L0 product truth without explicit human confirmation:

- `docs/MASTER_GAME_SPEC.md`

## Evaluator Commands

Run these after meaningful changes:

```bash
npm run autoresearch:openclaw
npm run autoresearch:battle
npm run autoresearch:field
npm run autoresearch:raising
npm run autoresearch:runtime
npm run autoresearch:score
npm run autoresearch:accept
```

For the first scoring pass, establish the baseline:

```bash
npm run autoresearch:accept -- --set-baseline
```

## Operating Loop

1. Read the founder goal and current bottlenecks.
2. Pick the highest-priority blocker to the founder goal.
3. Make one narrow change in owned paths.
4. Run the relevant evaluator set.
5. If the change touched memory or runtime, run `npm run runtime:all` and `npm run autoresearch:runtime`.
6. Run `npm run autoresearch:score`.
7. Run `npm run autoresearch:accept`.
8. If accepted, keep the change and update scorecard/bottlenecks.
9. If rejected, do not keep the change. Prefer small uncommitted experiments so rejection is cheap.
10. Write a short checkpoint and continue.

Continue until:

- the current founder milestone exit criteria are met
- or the human interrupts

## Optimization Priority

Optimize in this order:

1. world-first session loop
2. encounter legibility and one-objective clashes
3. visible evolution plus mutation proof
4. return-pressure clarity
5. trust calibration and orchestration clarity
6. training-to-battle proof
7. memory and care loop usefulness
8. battle explainability
9. visual polish

## From-Scratch Clarification

`From scratch` in this repo means:

- building the product and training loop from zero inside this workspace
- creating the agent configuration, memory loop, evaluation loop, and UI surfaces from zero

It does **not** mean:

- pretraining a foundation model from scratch in v1
- shipping a brokerage product
- using live execution as the core loop
